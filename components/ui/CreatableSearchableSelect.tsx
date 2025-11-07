import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

interface CreatableSearchableSelectProps {
    label: string;
    options: { value: string; label: string }[];
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    placeholder?: string;
}

const CreatableSearchableSelect: React.FC<CreatableSearchableSelectProps> = ({
    label,
    options,
    value,
    onChange,
    disabled = false,
    placeholder = 'Select or type to create...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedLabel = useMemo(() => {
        if (!value) return '';
        const selectedOption = options.find(opt => opt.value === value);
        return selectedOption ? selectedOption.label : value;
    }, [value, options]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setTimeout(() => inputRef.current?.focus(), 0);
        } else {
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        return searchTerm
            ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
            : options;
    }, [options, searchTerm]);

    const canCreate = useMemo(() => {
        if (!searchTerm.trim()) return false;
        const searchTermLower = searchTerm.trim().toLowerCase();
        return !options.some(opt => opt.label.toLowerCase() === searchTermLower);
    }, [searchTerm, options]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };
    
    const handleCreate = () => {
        if (canCreate && searchTerm.trim()) {
            onChange(searchTerm.trim());
            setIsOpen(false);
        }
    };
    
    return (
        <div ref={containerRef}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm px-3 py-2 text-left focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
                >
                    <span className={`block truncate ${value ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {selectedLabel || placeholder}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </button>

                {isOpen && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none sm:text-sm flex flex-col overflow-hidden">
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                             <input
                                ref={inputRef}
                                type="text"
                                placeholder="Filter or create..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-2 py-1 border border-slate-300 rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:outline-none"
                            />
                        </div>
                       
                        <ul className="flex-1 overflow-y-auto py-1">
                            {canCreate && (
                                <li
                                    onClick={handleCreate}
                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    <span className="flex items-center">
                                        <Plus className="h-4 w-4 mr-2 text-green-500" />
                                        Create "{searchTerm.trim()}"
                                    </span>
                                </li>
                            )}
                            {filteredOptions.map(option => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`cursor-pointer select-none relative py-2 pl-3 pr-9 ${value === option.value ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100'} hover:bg-slate-100 dark:hover:bg-slate-700`}
                                >
                                    <span className={`block truncate ${value === option.value ? 'font-semibold' : 'font-normal'}`}>
                                        {option.label}
                                    </span>
                                </li>
                            ))}
                            {filteredOptions.length === 0 && !canCreate && (
                                <li className="cursor-default select-none relative py-2 px-4 text-slate-500 dark:text-slate-400">
                                    No options found.
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatableSearchableSelect;
