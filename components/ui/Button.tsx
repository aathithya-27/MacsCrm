import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  icon,
  className = '',
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border border-transparent shadow-blue-500/20",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border border-transparent shadow-green-500/20",
    secondary: "bg-white text-slate-700 border border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:ring-red-400 dark:bg-slate-800 dark:border-red-800 dark:text-slate-200 dark:hover:bg-red-900/20",
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-900/30",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 border border-transparent shadow-none",
    outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!isLoading && icon && <span className={children ? "mr-2" : ""}>{icon}</span>}
      {children}
    </button>
  );
};