import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

const Map = ({ center, markers = [], height = "300px" }) => {
    const mapContainerRef = useRef(null);
    const mapInstance = useRef(null);
    const [leafletReady, setLeafletReady] = useState(false);

    // Check if Leaflet is loaded
    useEffect(() => {
        const checkLeaflet = () => {
            if (typeof window !== 'undefined' && window.L) {
                setLeafletReady(true);
            } else {
                // Retry after a short delay
                setTimeout(checkLeaflet, 100);
            }
        };
        checkLeaflet();
    }, []);

    useEffect(() => {
        if (!mapContainerRef.current || !leafletReady) return;

        const defaultCenter = [28.6139, 77.2090]; // New Delhi
        const mapCenter = center?.lat && center?.lng ? [center.lat, center.lng] : defaultCenter;

        try {
            if (!mapInstance.current) {
                mapInstance.current = window.L.map(mapContainerRef.current).setView(mapCenter, 13);
                window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(mapInstance.current);
            } else {
                mapInstance.current.setView(mapCenter, 13);
            }

            // Cleanup function to remove existing markers (except tile layers)
            mapInstance.current.eachLayer((layer) => {
                if (layer instanceof window.L.Marker) {
                    mapInstance.current.removeLayer(layer);
                }
            });

            // Add main center marker if provided
            if (center?.lat && center?.lng) {
                window.L.marker([center.lat, center.lng]).addTo(mapInstance.current)
                    .bindPopup(center.address || 'Target Location').openPopup();
            }

            // Add other markers if any
            markers.forEach(m => {
                if (m.lat && m.lng) {
                    window.L.marker([m.lat, m.lng]).addTo(mapInstance.current)
                        .bindPopup(m.address || 'Marker');
                }
            });
        } catch (error) {
            console.error('Error initializing map:', error);
        }

    }, [center, markers, leafletReady]);

    return (
        <div className={`relative w-full rounded-lg overflow-hidden border border-gray-200`} style={{ height }}>
            {!leafletReady ? (
                <div className="h-full w-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                    <div className="text-center p-6">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Map service is loading...</p>
                    </div>
                </div>
            ) : (
                <div ref={mapContainerRef} className="h-full w-full z-0" />
            )}
        </div>
    );
};

export default Map;
