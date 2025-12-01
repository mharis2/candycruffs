import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

const AddressAutocomplete = ({ value, onChange, required = false }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Update internal state when prop changes
    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query.length > 2 && isOpen) {
                fetchSuggestions(query);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query, isOpen]);

    const fetchSuggestions = async (searchQuery) => {
        setIsLoading(true);
        try {
            // Using OpenStreetMap Nominatim API
            // Must include User-Agent as per usage policy
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=5&countrycodes=ca`,
                {
                    headers: {
                        'User-Agent': 'CandyCruffsWeb/1.0'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Error fetching address suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue); // Propagate raw input to parent immediately
        setIsOpen(true);
    };

    const handleSelect = (suggestion) => {
        const formattedAddress = suggestion.display_name;
        setQuery(formattedAddress);
        onChange(formattedAddress);
        setIsOpen(false);
        setSuggestions([]);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => query.length > 2 && setIsOpen(true)}
                    placeholder="Start typing your address..."
                    required={required}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
                </div>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((suggestion) => (
                        <button
                            key={suggestion.place_id}
                            type="button"
                            onClick={() => handleSelect(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 flex items-start gap-3"
                        >
                            <MapPin size={16} className="mt-1 text-gray-400 shrink-0" />
                            <span className="text-sm text-gray-700 line-clamp-2">
                                {suggestion.display_name}
                            </span>
                        </button>
                    ))}
                    <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-400 text-right">
                        Powered by OpenStreetMap
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
