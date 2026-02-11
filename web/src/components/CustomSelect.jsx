import React, { useState, useRef } from 'react';
import useOnClickOutside from '../hooks/useOnClickOutside';

const CustomSelect = ({
    label,
    value,
    onChange,
    options,
    placeholder = "اختر...",
    disabled = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef();

    useOnClickOutside(ref, () => setIsOpen(false));

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    };

    // Find label for selected value
    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className={`relative ${className}`} ref={ref}>
            {label && (
                <label className="block text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2 px-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
                    w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200
                    ${disabled
                        ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                        : isOpen
                            ? 'bg-white border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/10 shadow-sm text-[var(--color-text)]'
                            : 'bg-white border-slate-200 hover:border-[var(--color-primary)]/50 text-[var(--color-text)] shadow-sm hover:shadow-md'
                    }
                `}
            >
                <span className="truncate">{selectedLabel}</span>
                <svg
                    className={`w-4 h-4 transition-transform duration-200 text-slate-400 ${isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <div
                className={`
                    absolute left-0 right-0 top-full mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-50 overflow-hidden transition-all duration-200 origin-top
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
                `}
            >
                <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`
                                w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between group
                                ${value === option.value
                                    ? 'bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-bold'
                                    : 'text-[var(--color-text)] hover:bg-slate-50'
                                }
                            `}
                        >
                            <span className="truncate">{option.label}</span>
                            {value === option.value && (
                                <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                    ))}
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-sm text-[var(--color-text-muted)] text-center">
                            لا توجد خيارات
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
