"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import {
  createDonorSchema,
  normalizeLocation,
  normalizePhoneDigits,
  formatPhoneDisplay,
  cleanDisplayLocation,
} from "@/lib/validations";
import { sanitizeName, sanitizeLocation } from "@/lib/sanitize";

// Return type for consistent error handling
type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  donorId?: string;
};

// Simple rate limiting (replace with Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  const limit = 3; // 3 registrations
  const window = 30 * 60 * 1000; // per 30 minutes

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

export async function createDonorAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Get IP from headers for rate limiting
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return {
        ok: false,
        message: `Too many registration attempts. Please try again in ${Math.ceil(
          (rateLimit.retryAfter || 0) / 60
        )} minutes.`,
      };
    }

    // Extract form data
    const rawData = {
      name: formData.get("name") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      location: formData.get("location") as string,
      phone: formData.get("phone") as string,
      photoUrl: formData.get("photoUrl") as string | null,
      photoPublicId: formData.get("photoPublicId") as string | null,
      consentGiven: formData.get("consentGiven") === "true",
    };

    // Validate with Zod schema
    const validation = createDonorSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        ok: false,
        message: "Please fix the errors below",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    // Sanitize inputs (XSS prevention)
    const sanitizedName = sanitizeName(data.name);
    const sanitizedLocation = sanitizeLocation(data.location);

    // Normalize data for database
    const phoneDigits = normalizePhoneDigits(data.phone);
    const phoneDisplay = formatPhoneDisplay(data.phone);
    const locationNormalized = normalizeLocation(sanitizedLocation);
    const locationDisplay = cleanDisplayLocation(sanitizedLocation);

    // Check for duplicate (same phone + blood + location)
    const existingDonor = await prisma.donor.findUnique({
      where: {
        phoneDigits_bloodGroup_locationNormalized: {
          phoneDigits,
          bloodGroup: data.bloodGroup,
          locationNormalized,
        },
      },
    });

    if (existingDonor) {
      return {
        ok: false,
        message:
          "A donor with this phone number, blood group, and location already exists.",
      };
    }

    // Create donor
    const donor = await prisma.donor.create({
      data: {
        name: sanitizedName,
        bloodGroup: data.bloodGroup,
        phoneDigits,
        phoneDisplay,
        locationNormalized,
        locationDisplay,
        photoUrl: data.photoUrl,
        photoPublicId: data.photoPublicId,
        consentGiven: data.consentGiven,
        isAvailable: true,
      },
    });

    // Revalidate search page cache (shows new donor immediately)
    revalidatePath("/search");

    return {
      ok: true,
      message: "Successfully registered as a blood donor!",
      donorId: donor.id,
    };
  } catch (error) {
    console.error("Error creating donor:", error);
    return {
      ok: false,
      message: "An unexpected error occurred. Please try again.",
    };
  }
}
