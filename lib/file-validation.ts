/**
 * File upload validation and security checks.
 */

export const FILE_LIMITS = {
  MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MIN_SIZE_BYTES: 100, // 100 bytes (prevent empty files)
  ALLOWED_TYPES: ['text/csv', 'application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.csv', '.pdf', '.txt'],
} as const;

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file before processing.
 */
export function validateFile(file: File): ValidationResult {
  // Check file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size (minimum)
  if (file.size < FILE_LIMITS.MIN_SIZE_BYTES) {
    return { valid: false, error: 'File is too small or empty' };
  }

  // Check file size (maximum)
  if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
    const maxMB = FILE_LIMITS.MAX_SIZE_BYTES / (1024 * 1024);
    return { valid: false, error: `File is too large (max ${maxMB}MB)` };
  }

  // Check file type (MIME)
  if (!FILE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Only CSV and PDF files are allowed.',
    };
  }

  // Check file extension
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!extension || !FILE_LIMITS.ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension. Only .csv and .pdf files are allowed.',
    };
  }

  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, error: 'Invalid file name' };
  }

  return { valid: true };
}

/**
 * Sanitize CSV cell content to prevent formula injection.
 * If a cell starts with =, +, -, or @, prefix it with a single quote.
 */
export function sanitizeCell(cell: string): string {
  if (!cell) return cell;
  
  const firstChar = cell.charAt(0);
  if (firstChar === '=' || firstChar === '+' || firstChar === '-' || firstChar === '@') {
    return `'${cell}`;
  }
  
  return cell;
}

/**
 * Sanitize all cells in a CSV row.
 */
export function sanitizeRow(row: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(row)) {
    sanitized[key] = typeof value === 'string' ? sanitizeCell(value) : value;
  }
  
  return sanitized;
}

/**
 * Check if a string contains potential XSS patterns.
 * This is a basic check - real XSS prevention should use proper escaping.
 */
export function containsSuspiciousContent(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i,
    /onload=/i,
  ];
  
  return suspiciousPatterns.some((pattern) => pattern.test(text));
}
