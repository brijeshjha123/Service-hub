import { useState } from 'react';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Button } from './ui/Button';

const LocationPicker = ({ onLocationSelect, initialLocation }) => {
    const [address, setAddress] = useState(initialLocation?.address || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        if (onLocationSelect) {
            onLocationSelect({ address: newAddress });
        }
    };

    const getMyLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        setError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Reverse geocoding using OpenStreetMap (Nominatim)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
                    );
                    const data = await response.json();

                    const formattedAddress = data.display_name || `${latitude}, ${longitude}`;
                    setAddress(formattedAddress);

                    if (onLocationSelect) {
                        onLocationSelect({
                            address: formattedAddress,
                            lat: latitude,
                            lng: longitude
                        });
                    }
                } catch (err) {
                    console.error('Reverse geocoding error:', err);
                    const fallbackAddress = `${latitude}, ${longitude}`;
                    setAddress(fallbackAddress);
                    if (onLocationSelect) {
                        onLocationSelect({ address: fallbackAddress, lat: latitude, lng: longitude });
                    }
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('Unable to retrieve your location');
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium">
                        <MapPin className="h-4 w-4 text-primary" /> Service Address
                    </Label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs flex items-center gap-1"
                        onClick={getMyLocation}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Navigation className="h-3 w-3" />
                        )}
                        {loading ? 'Fetching...' : 'Get My Location'}
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        id="address"
                        className="pl-10 h-11"
                        placeholder="Enter your full street address, city, and pincode"
                        value={address}
                        onChange={handleAddressChange}
                        required
                    />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <p className="text-[11px] text-gray-500 italic">
                    Note: Our service providers use this address to find your location. Please be accurate.
                </p>
            </div>
        </div>
    );
};

export default LocationPicker;
