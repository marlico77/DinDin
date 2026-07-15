/**
 * Sanitizes user input to prevent XSS attacks
 * Removes potentially dangerous characters while preserving user input
 */
export function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Trim and limit length
  let sanitized = input.trim().slice(0, maxLength);

  // Remove null bytes and other control characters (except newlines and tabs)
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Remove script tags and event handlers (basic XSS prevention)
  // Note: React already escapes HTML, but this adds an extra layer of protection
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');

  return sanitized;
}

/**
 * Sanitizes a number to ensure it's valid and within safe bounds
 */
export function sanitizeNumber(input: number | string, max: number = Number.MAX_SAFE_INTEGER): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (isNaN(num) || !isFinite(num)) {
    return 0;
  }

  // Prevent extremely large or small numbers that could cause issues
  return Math.max(Number.MIN_SAFE_INTEGER, Math.min(max, num));
}

