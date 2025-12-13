import toast from 'react-hot-toast';
import { logError, parseError } from '../utils/errorUtils';

export const globalErrorHandler = (error: any, showToast = true) => {
  const message = parseError(error);
  
  logError(error, 'GlobalHandler');
  
  if (showToast) {
    toast.error(message);
  }
  
  return message;
};