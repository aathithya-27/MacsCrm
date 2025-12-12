import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidth = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[95vw]'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose} 
      />

      <div 
        className={`
          relative w-full ${maxWidth[size]} bg-white dark:bg-slate-800 rounded-xl shadow-2xl flex flex-col max-h-[90vh] 
          transform transition-all duration-300 animate-in zoom-in-95 slide-in-from-bottom-4
        `}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 rounded-t-xl shrink-0">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-6">{title}</h3>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar grow">
          {children}
        </div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};