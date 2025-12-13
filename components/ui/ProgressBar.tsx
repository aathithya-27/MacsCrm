import React from 'react';

interface ProgressBarProps {
  progress?: number; // 0 to 100
  indeterminate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress = 0, indeterminate = false, className = '' }) => {
  return (
    <div className={`h-1 w-full bg-slate-100 dark:bg-slate-700 overflow-hidden ${className}`}>
      <div 
        className={`h-full bg-blue-600 transition-all duration-300 ease-out ${indeterminate ? 'animate-progress-indeterminate w-full origin-left' : ''}`}
        style={{ width: indeterminate ? '100%' : `${Math.max(0, Math.min(100, progress))}%` }}
      />
    </div>
  );
};