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
import { rateLimit, getClientIp } from "@/lib/rate-limit";

type ActionResult = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  donorId?: string;
};

export async function createDonorAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Rate limiting with Redis
    const headersList = await headers();
    const ip = getClientIp(headersList);

    const rateLimitResult = await rateLimit(`create-donor:${ip}`, 3, 1800); // 3 per 30 min

    if (!rateLimitResult.success) {
      return {
        ok: false,
        message: `Too many registration attempts. Please try again in ${Math.ceil(
          (rateLimitResult.retryAfter || 0) / 60
        )} minutes.`,
      };
    }

    // ... rest of donor creation logic stays the same ...

    const rawData = {
      name: formData.get("name") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      location: formData.get("location") as string,
      phone: formData.get("phone") as string,
      photoUrl: formData.get("photoUrl") as string | null,
      photoPublicId: formData.get("photoPublicId") as string | null,
      consentGiven: formData.get("consentGiven") === "true",
    };

    const validation = createDonorSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        ok: false,
        message: "Please fix the errors below",
        fieldErrors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    const sanitizedName = sanitizeName(data.name);
    const sanitizedLocation = sanitizeLocation(data.location);

    const phoneDigits = normalizePhoneDigits(data.phone);
    const phoneDisplay = formatPhoneDisplay(data.phone);
    const locationNormalized = normalizeLocation(sanitizedLocation);
    const locationDisplay = cleanDisplayLocation(sanitizedLocation);

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
