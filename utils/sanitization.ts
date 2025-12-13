/**
 * Basic XSS sanitization
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Recursively sanitize an object
 */
export const sanitizeObject = <T>(obj: T): T => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: any = {};
    Object.keys(obj).forEach(key => {
      result[key] = sanitizeObject((obj as any)[key]);
    });
    return result;
  }
  
  return obj;
};