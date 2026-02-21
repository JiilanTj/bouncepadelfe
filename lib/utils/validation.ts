/**
 * Validation utilities
 */

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @param minLength - Minimum length (default: 6)
 * @returns Object with validation result
 */
export function validatePassword(
  password: string,
  minLength = 6
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate required field
 * @param value - Value to check
 * @param fieldName - Name of the field (for error message)
 * @returns Error message or null
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === undefined || value === null || value === "") {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validate phone number (Indonesian format)
 * @param phone - Phone number to validate
 * @returns True if valid
 */
export function isValidPhone(phone: string): boolean {
  // Allow +62, 08, or 8 prefix
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
}

/**
 * Sanitize string input
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
