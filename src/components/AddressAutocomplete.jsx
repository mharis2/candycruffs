import React, { useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';

// Allowed delivery cities (case-insensitive)
const ALLOWED_CITIES = ['edmonton', 'st. albert', 'st albert', 'sherwood park'];

const AddressAutocomplete = ({ value, onChange, onValidationChange, required = false }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [validationError, setValidationError] = useState(null);
    const inputRef = useRef(null);
    const autocompleteRef = useRef(null);

    // Update internal state when prop changes
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    // Validate if city is in allowed delivery zone
    const validateDeliveryZone = (addressComponents) => {
        if (!addressComponents) return false;

        // Look for locality (city) or sublocality in address components
        for (const component of addressComponents) {
            const types = component.types || [];
            if (types.includes('locality') || types.includes('sublocality') || types.includes('administrative_area_level_3')) {
                const cityName = component.long_name.toLowerCase();
                if (ALLOWED_CITIES.some(allowed => cityName.includes(allowed) || allowed.includes(cityName))) {
                    return true;
                }
            }
        }
        return false;
    };

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

                    // Validate delivery zone
                    const isValid = validateDeliveryZone(place.address_components);
                    if (!isValid) {
                        setValidationError('Sorry, this address is outside our delivery area. We currently deliver to Edmonton, St. Albert, and Sherwood Park only.');
                        onValidationChange && onValidationChange(false);
                    } else {
                        setValidationError(null);
                        onValidationChange && onValidationChange(true);
                    }
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
    }, [onChange, onValidationChange]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
        // Clear validation when user types manually
        if (validationError) {
            setValidationError(null);
            onValidationChange && onValidationChange(true);
        }
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
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${validationError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} focus:ring-2 outline-none transition-all`}
                />
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${validationError ? 'text-red-400' : 'text-gray-400'}`}>
                    <MapPin size={18} />
                </div>
            </div>

            {validationError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-600">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>{validationError}</span>
                </div>
            )}

            <p className="text-[10px] text-gray-400 mt-1 ml-1">Powered by Google • Delivering to Edmonton, St. Albert & Sherwood Park</p>
        </div>
    );
};

export default AddressAutocomplete;

