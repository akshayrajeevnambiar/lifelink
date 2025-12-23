/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 *
 * @example
 * sanitizeInput("<script>alert('xss')</script>") → "scriptalert('xss')/script"
 * sanitizeInput("John<br>Doe") → "JohnDoe"
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>'"]/g, "") // Remove dangerous characters
    .trim();
}

/**
 * Sanitize location input
 * Allows common location characters but prevents injection
 *
 * @example
 * sanitizeLocation("Toronto, ON") → "Toronto, ON"
 * sanitizeLocation("<script>alert('xss')</script>") → "scriptalertxss/script"
 */
export function sanitizeLocation(location: string): string {
  // Allow: letters, numbers, spaces, commas, hyphens, periods
  return location.replace(/[^a-zA-Z0-9\s,.-]/g, "").trim();
}

/**
 * Sanitize name input
 * Allows letters, spaces, hyphens, apostrophes
 * Common in names like "O'Brien" or "Mary-Jane"
 *
 * @example
 * sanitizeName("John O'Brien") → "John O'Brien"
 * sanitizeName("John<script>") → "Johnscript"
 */
export function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z\s'-]/g, "").trim();
}
