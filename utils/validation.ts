export const validators = {
  required: (value: any) => 
    (value !== null && value !== undefined && value !== '') || 'This field is required',
  
  email: (value: string) => 
    !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Invalid email address',
  
  phone: (value: string) => 
    !value || /^\+?[\d\s-]{10,}$/.test(value) || 'Invalid phone number',
  
  minLength: (min: number) => (value: string) => 
    !value || value.length >= min || `Must be at least ${min} characters`,
  
  maxLength: (max: number) => (value: string) => 
    !value || value.length <= max || `Must be at most ${max} characters`,
    
  pincode: (value: string) =>
    !value || /^\d{6}$/.test(value) || 'Invalid Pincode (6 digits required)',
    
  pan: (value: string) =>
    !value || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) || 'Invalid PAN format',
    
  gst: (value: string) =>
    !value || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(value) || 'Invalid GSTIN format'
};

export const validateForm = (data: any, rules: Record<string, Function[]>) => {
  const errors: Record<string, string> = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      if (typeof result === 'string') {
        errors[field] = result;
        break; // Stop at first error for this field
      }
    }
  });
  
  return Object.keys(errors).length > 0 ? errors : null;
};