import { z } from "zod";
import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";

// ============================================================================
// LOCATION UTILITIES
// ============================================================================

/**
 * Normalize location for consistent database searching
 * Converts to lowercase and trims whitespace
 *
 * @example
 * normalizeLocation("Toronto, ON") → "toronto, on"
 * normalizeLocation("  New York  ") → "new york"
 */
export function normalizeLocation(location: string): string {
  return location.toLowerCase().trim();
}

/**
 * Clean location for display purposes
 * Removes extra whitespace but preserves capitalization
 *
 * @example
 * cleanDisplayLocation("  Toronto,  ON  ") → "Toronto, ON"
 */
export function cleanDisplayLocation(location: string): string {
  return location.trim().replace(/\s+/g, " ");
}

// ============================================================================
// PHONE NUMBER UTILITIES
// ============================================================================

/**
 * Extract only digits from phone number for storage and matching
 *
 * @example
 * normalizePhoneDigits("+1 (416) 555-0123") → "14165550123"
 * normalizePhoneDigits("416.555.0123") → "4165550123"
 */
export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, ""); // Remove all non-digits
}

/**
 * Format phone number for display using libphonenumber
 * Defaults to Canadian/US format
 *
 * @example
 * formatPhoneDisplay("4165550123") → "+1 416-555-0123"
 * formatPhoneDisplay("14165550123") → "+1 416-555-0123"
 */
export function formatPhoneDisplay(
  phone: string,
  country: "US" | "CA" = "CA"
): string {
  try {
    const digits = normalizePhoneDigits(phone);

    // If no country code, add default (1 for US/CA)
    const phoneWithCountry = digits.startsWith("1") ? digits : `1${digits}`;

    const phoneNumber = parsePhoneNumber(`+${phoneWithCountry}`, country);

    if (phoneNumber) {
      return phoneNumber.formatInternational();
    }

    // Fallback: Return digits if parsing fails
    return phone;
  } catch (error) {
    // If parsing fails, return original
    return phone;
  }
}

/**
 * Validate phone number using libphonenumber
 *
 * @example
 * isValidPhone("4165550123") → true
 * isValidPhone("123") → false
 */
export function isValidPhone(phone: string): boolean {
  try {
    // Phone should start with + and have at least 10 digits
    if (!phone.startsWith("+")) return false;

    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  } catch {
    return false;
  }
}

// ============================================================================
// BLOOD COMPATIBILITY UTILITIES
// ============================================================================

/**
 * Get compatible donor blood types for a recipient
 * Based on blood type compatibility rules
 *
 * @example
 * getCompatibleBloodTypes("B_POSITIVE") → ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"]
 * getCompatibleBloodTypes("AB_POSITIVE") → all 8 types (universal recipient)
 * getCompatibleBloodTypes("O_NEGATIVE") → ["O_NEGATIVE"] (can only receive O-)
 */
export function getCompatibleBloodTypes(recipientType: string): string[] {
  const compatibility: Record<string, string[]> = {
    // Positive blood types
    A_POSITIVE: ["A_POSITIVE", "A_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    B_POSITIVE: ["B_POSITIVE", "B_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
    AB_POSITIVE: [
      "A_POSITIVE",
      "A_NEGATIVE",
      "B_POSITIVE",
      "B_NEGATIVE",
      "AB_POSITIVE",
      "AB_NEGATIVE",
      "O_POSITIVE",
      "O_NEGATIVE",
    ], // Universal recipient
    O_POSITIVE: ["O_POSITIVE", "O_NEGATIVE"],

    // Negative blood types
    A_NEGATIVE: ["A_NEGATIVE", "O_NEGATIVE"],
    B_NEGATIVE: ["B_NEGATIVE", "O_NEGATIVE"],
    AB_NEGATIVE: ["A_NEGATIVE", "B_NEGATIVE", "AB_NEGATIVE", "O_NEGATIVE"],
    O_NEGATIVE: ["O_NEGATIVE"], // Can only receive O-
  };

  return compatibility[recipientType] || [recipientType];
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

/**
 * Blood group enum schema
 * Ensures only valid blood types are accepted
 */
export const bloodGroupSchema = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);

/**
 * Donor creation schema
 * Validates all required fields for creating a new donor
 */
export const createDonorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    ),

  bloodGroup: bloodGroupSchema,

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be less than 200 characters"),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((phone) => isValidPhone(phone), "Invalid phone number format"),

  photoUrl: z.string().url().optional().nullable(),
  photoPublicId: z.string().optional().nullable(),

  lastDonationDate: z.string().datetime().optional().nullable(),

  consentGiven: z
    .boolean()
    .refine(
      (val) => val === true,
      "Consent must be given to register as a donor"
    ),
});

/**
 * Donor update schema
 * Similar to create but all fields optional except consent
 */
export const updateDonorSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .optional(),

  bloodGroup: bloodGroupSchema.optional(),

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be less than 200 characters")
    .optional(),

  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .refine((phone) => {
      // Phone must start with + and have at least 10 digits
      const digits = phone.replace(/\D/g, "");
      return phone.startsWith("+") && digits.length >= 10;
    }, "Please enter a valid phone number with country code (e.g., +91 98765 43210)"),

  isAvailable: z.boolean().optional(),

  lastDonationDate: z.string().datetime().optional().nullable(),
});

/**
 * Search query schema
 * Validates search parameters from API/forms
 */
export const searchDonorSchema = z.object({
  bloodGroup: bloodGroupSchema.optional(),

  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .optional(),

  includeUnavailable: z.boolean().optional().default(false),

  limit: z.number().int().min(1).max(50).optional().default(5),

  seed: z.number().int().optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export TypeScript types derived from Zod schemas
export type CreateDonorInput = z.infer<typeof createDonorSchema>;
export type UpdateDonorInput = z.infer<typeof updateDonorSchema>;
export type SearchDonorInput = z.infer<typeof searchDonorSchema>;
export type BloodGroup = z.infer<typeof bloodGroupSchema>;
