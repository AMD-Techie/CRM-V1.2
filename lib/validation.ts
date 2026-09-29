
export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Optional fields should be handled by required check
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  if (!phone) return true;
  // Basic phone validation: allows +, digits, spaces, hyphens, parentheses
  const re = /^\+?[\d\s\-()]{7,20}$/;
  return re.test(phone);
};

export const validateUrl = (url: string): boolean => {
  if (!url) return true;
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};

export const validateNumber = (value: any, min?: number, max?: number): boolean => {
  const num = Number(value);
  if (isNaN(num)) return false;
  if (min !== undefined && num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

export const validateRequired = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  return false;
};

export interface ValidationErrors {
  [key: string]: string;
}
