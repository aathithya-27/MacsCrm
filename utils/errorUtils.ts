import { AppError } from '../types/errors';

export const parseError = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

export const logError = (error: any, context?: string) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context || 'App'}] Error:`, error);
};