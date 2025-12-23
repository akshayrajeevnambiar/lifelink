import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  searchDonorSchema,
  getCompatibleBloodTypes,
  normalizeLocation,
} from "@/lib/validations";

// Simple in-memory rate limiting (replace with Upstash Redis in Commit 10)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  const limit = 30; // 30 requests
  const window = 60 * 1000; // per 1 minute

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + window });
    return { allowed: true };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many requests. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    const queryData = {
      bloodGroup: searchParams.get("bloodGroup") || undefined,
      location: searchParams.get("location") || undefined,
      includeUnavailable: searchParams.get("includeUnavailable") === "true",
      limit: parseInt(searchParams.get("limit") || "5"),
      seed: parseInt(searchParams.get("seed") || "0"),
    };

    const validation = searchDonorSchema.safeParse(queryData);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid search parameters",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const query = validation.data;

    // Build database query
    const whereConditions: any = {};

    // Blood compatibility search
    if (query.bloodGroup) {
      const compatibleTypes = getCompatibleBloodTypes(query.bloodGroup);
      whereConditions.bloodGroup = {
        in: compatibleTypes,
      };
    }

    // Location search (normalized, case-insensitive partial match)
    if (query.location) {
      const normalizedLocation = normalizeLocation(query.location);
      whereConditions.locationNormalized = {
        contains: normalizedLocation,
      };
    }

    // Availability filter
    if (!query.includeUnavailable) {
      whereConditions.isAvailable = true;
    }

    // Filter out recent donors (must wait 56 days between donations)
    const minDonationDate = new Date();
    minDonationDate.setDate(minDonationDate.getDate() - 56);

    whereConditions.OR = [
      { lastDonationDate: null }, // Never donated
      { lastDonationDate: { lt: minDonationDate } }, // Donated >56 days ago
    ];

    // Fetch donors from database
    const donors = await prisma.donor.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        bloodGroup: true,
        locationDisplay: true,
        phoneDisplay: true,
        photoUrl: true,
        isAvailable: true,
        lastDonationDate: true,
        createdAt: true,
      },
      // Get more than needed for better shuffle distribution
      take: query.limit * 3,
    });

    // Seeded random shuffle for "refresh" functionality
    const shuffled = seededShuffle(donors, query.seed || 0);

    // Take only requested limit
    const results = shuffled.slice(0, query.limit);

    // Add compatibility info to results
    const resultsWithCompatibility = results.map((donor) => ({
      ...donor,
      isCompatible: query.bloodGroup
        ? getCompatibleBloodTypes(query.bloodGroup).includes(donor.bloodGroup)
        : true,
    }));

    return NextResponse.json({
      ok: true,
      donors: resultsWithCompatibility,
      count: results.length,
      total: donors.length,
      query: {
        bloodGroup: query.bloodGroup,
        location: query.location,
        includeUnavailable: query.includeUnavailable,
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { ok: false, message: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * Seeded random shuffle for deterministic "refresh"
 * Same seed always produces same order
 * Different seeds produce different orders
 *
 * Uses Linear Congruential Generator (LCG) algorithm
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;

  // LCG parameters (same as Java's Random)
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  // Fisher-Yates shuffle with seeded random
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate seeded random number
    currentSeed = (a * currentSeed + c) % m;
    const j = Math.floor((currentSeed / m) * (i + 1));

    // Swap elements
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
