import React, { useState, useEffect, useRef } from 'react';
import { countries } from '../data/countries';

/**
 * LocationPicker Component
 * A reusable autocomplete country picker using local data
 * 
 * Props:
 * - value: current location object or null
 * - onChange: callback when location is selected (receives location object)
 * - placeholder: input placeholder text
 * - disabled: disable the input
 */
const LocationPicker = ({ value, onChange, placeholder = "اختر الدولة...", disabled = false }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDisplay, setSelectedDisplay] = useState('');
    const containerRef = useRef(null);

    // Set display value from initial value
    useEffect(() => {
        if (value?.fullLabelAr) {
            setSelectedDisplay(value.fullLabelAr);
        } else if (value?.cityNameAr) {
            // Fallback for old data or if city was somehow set
            setSelectedDisplay(value.cityNameAr);
        } else if (typeof value === 'string' && value) {
            setSelectedDisplay(value);
        }
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Normalize Arabic text for search
    const normalizeArabic = (text) => {
        if (!text) return "";
        return text
            .replace(/[أإآ]/g, 'ا') // Normalize Alef
            .replace(/[ة]/g, 'ه')   // Normalize Taa Marbuta
            .replace(/[ى]/g, 'ي')   // Normalize Ya
            .replace(/[ًٌٍَُِّْ]/g, ''); // Remove Tashkeel (diacritics)
    };

    // Local search functionality
    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedDisplay('');

        if (val.length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const lowerVal = val.toLowerCase();
        const normalizedVal = normalizeArabic(val);

        const filtered = countries.filter(c => {
            const normalizedName = normalizeArabic(c.name_ar);
            // Match normalized Arabic or English
            return normalizedName.includes(normalizedVal) ||
                c.name_en.toLowerCase().includes(lowerVal);
        });

        setSuggestions(filtered);
        setIsOpen(true);
    };

    // Handle location selection
    const handleSelect = (country) => {
        setSelectedDisplay(country.name_ar);
        setQuery('');
        setSuggestions([]);
        setIsOpen(false);

        // Call parent onChange with structured location
        // Note: For country-only, we set provider to 'local' and use country code as ID
        onChange({
            locationId: `country:${country.code}`,
            provider: 'local',
            countryCode: country.code,
            cityNameEn: null, // No city specific data
            cityNameAr: null,
            fullLabelAr: country.name_ar,
            fullLabelEn: country.name_en,
            lat: null, // Could add centroids later if needed
            lng: null
        });
    };

    // Clear selection
    const handleClear = () => {
        setQuery('');
        setSelectedDisplay('');
        setSuggestions([]);
        onChange(null);
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Input Field */}
            <div className="relative">
                <input
                    type="text"
                    value={selectedDisplay || query}
                    onChange={handleInputChange}
                    onFocus={() => {
                        if (selectedDisplay) {
                            setQuery(selectedDisplay);
                            setSelectedDisplay('');
                            // Show all/filtered suggestions on focus if needed, or just clear to type
                            const val = selectedDisplay;
                            const filtered = countries.filter(c =>
                                c.name_ar.includes(val) ||
                                c.name_en.toLowerCase().includes(val.toLowerCase())
                            );
                            setSuggestions(filtered);
                            setIsOpen(true);
                        } else if (query) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full text-sm border p-2 pr-10 rounded transition-all ${disabled ? 'bg-slate-100 text-slate-500' : 'bg-white'
                        } ${isOpen ? 'border-primary ring-1 ring-primary' : 'border-slate-200'}`}
                    dir="rtl"
                />

                {/* Icons */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {selectedDisplay && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    {!selectedDisplay && (
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((country) => (
                        <button
                            key={country.code}
                            type="button"
                            onClick={() => handleSelect(country)}
                            className="w-full text-right px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-lg"></span> {/* Could add flags here */}
                                <div className="text-sm font-medium text-slate-800">
                                    {country.name_ar}
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">
                                {country.name_en}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && query.length >= 1 && suggestions.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-center text-sm text-slate-500">
                    لا توجد دولة بهذا الاسم
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
