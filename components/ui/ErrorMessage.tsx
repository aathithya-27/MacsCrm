import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss, className = '' }) => {
  if (!message) return null;

  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 rounded-lg border border-red-100 dark:border-red-800 ${className}`}>
      <AlertCircle className="shrink-0 h-5 w-5" />
      <span className="text-sm font-medium flex-1">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};