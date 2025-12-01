import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

const AddressAutocomplete = ({ value, onChange, required = false }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    // Update internal state when prop changes
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Initialize Google Places Autocomplete
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn('Google Maps API key not found. Address autocomplete will not work.');
            return;
        }

        // Load Google Maps script
        const loadGoogleMaps = async () => {
            try {
                // Check if already loaded
                if (window.google?.maps?.places) {
                    initAutocomplete();
                    return;
                }

                // Create script element
                const script = document.createElement('script');
                script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
                script.async = true;
                script.defer = true;

                // Set up callback
                window.initMap = () => {
                    initAutocomplete();
                };

                document.head.appendChild(script);
            } catch (error) {
                console.error('Error loading Google Maps:', error);
            }
        };

        const initAutocomplete = () => {
            if (!inputRef.current || !window.google?.maps?.places) return;

            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: 'ca' },
                fields: ['formatted_address', 'address_components'],
                types: ['address']
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setInputValue(place.formatted_address);
                    onChange(place.formatted_address);
                }
            });

            autocompleteRef.current = autocomplete;
        };

        loadGoogleMaps();

        return () => {
            if (autocompleteRef.current && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
            }
        };
    }, [onChange]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    return (
        <div className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Start typing your address..."
                    required={required}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <MapPin size={18} />
                </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">Powered by Google</p>
        </div>
    );
};

export default AddressAutocomplete;
