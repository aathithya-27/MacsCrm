import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, helperText, className = '', id, ...props }) => {
  const inputId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`
            w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400
            focus:outline-none focus:ring-2 focus:ring-offset-0 
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-800 dark:focus:ring-red-900/50' 
              : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30'
            }
            disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900 dark:disabled:text-slate-600
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
};