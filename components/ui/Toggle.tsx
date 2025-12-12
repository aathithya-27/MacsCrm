import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
}

export const Toggle: React.FC<ToggleProps> = ({ checked, onChange, disabled, label, size = 'md' }) => {
  // Bolder Dimensions
  const height = size === 'sm' ? 'h-6 w-11' : 'h-7 w-12';
  const dotSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  const translate = size === 'sm' ? 'translate-x-5' : 'translate-x-5';

  return (
    <div className={`flex items-center gap-2 ${disabled ? 'opacity-50' : ''}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex ${height} items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          ${checked ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-600'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="sr-only">{label || 'Toggle'}</span>
        <span
          className={`
            inline-block ${dotSize} transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${checked ? translate : 'translate-x-1'}
          `}
        />
      </button>
      {label && <span className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer" onClick={() => !disabled && onChange(!checked)}>{label}</span>}
    </div>
  );
};