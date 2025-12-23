import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  searchDonorSchema,
  getCompatibleBloodTypes,
  normalizeLocation,
} from "@/lib/validations";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting with Redis
    const ip = getClientIp(request.headers);
    const rateLimitResult = await rateLimit(`search:${ip}`, 30, 60);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Too many search requests. Please try again later.",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.reset),
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        }
      );
    }

    // Add rate limit headers to successful responses too
    const rateLimitHeaders = {
      "X-RateLimit-Limit": String(rateLimitResult.limit),
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
      "X-RateLimit-Reset": String(rateLimitResult.reset),
    };

    // ... rest of search logic stays the same ...

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
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const query = validation.data;

    // Build database query
    const whereConditions: any = {};

    if (query.bloodGroup) {
      const compatibleTypes = getCompatibleBloodTypes(query.bloodGroup);
      whereConditions.bloodGroup = { in: compatibleTypes };
    }

    if (query.location) {
      const normalizedLocation = normalizeLocation(query.location);
      whereConditions.locationNormalized = { contains: normalizedLocation };
    }

    if (!query.includeUnavailable) {
      whereConditions.isAvailable = true;
    }

    const minDonationDate = new Date();
    minDonationDate.setDate(minDonationDate.getDate() - 56);

    whereConditions.OR = [
      { lastDonationDate: null },
      { lastDonationDate: { lt: minDonationDate } },
    ];

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
      take: query.limit * 3,
    });

    const shuffled = seededShuffle(donors, query.seed || 0);
    const results = shuffled.slice(0, query.limit);

    const resultsWithCompatibility = results.map((donor) => ({
      ...donor,
      isCompatible: query.bloodGroup
        ? getCompatibleBloodTypes(query.bloodGroup).includes(donor.bloodGroup)
        : true,
    }));

    return NextResponse.json(
      {
        ok: true,
        donors: resultsWithCompatibility,
        count: results.length,
        total: donors.length,
        query: {
          bloodGroup: query.bloodGroup,
          location: query.location,
          includeUnavailable: query.includeUnavailable,
        },
      },
      { headers: rateLimitHeaders }
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { ok: false, message: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const shuffled = [...array];
  let currentSeed = seed;

  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  for (let i = shuffled.length - 1; i > 0; i--) {
    currentSeed = (a * currentSeed + c) % m;
    const j = Math.floor((currentSeed / m) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
