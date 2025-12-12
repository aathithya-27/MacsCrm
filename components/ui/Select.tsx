import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, placeholder = "Select...", error, className = '', id, ...props }) => {
  const selectId = id || props.name || Math.random().toString(36).substr(2, 9);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`
            w-full rounded-lg border px-3 py-2 pr-10 text-sm appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-800' 
              : 'border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:ring-blue-100 dark:focus:ring-blue-900/30'
            }
            disabled:bg-slate-50 disabled:text-slate-500 dark:disabled:bg-slate-900
            ${className}
          `}
          {...props}
        >
          <option value="" disabled className="text-slate-400">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};