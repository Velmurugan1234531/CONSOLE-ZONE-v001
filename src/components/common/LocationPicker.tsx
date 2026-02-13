"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Loader2 } from "lucide-react";

// Fix for Leaflet marker icons in Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

function LocationMarker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={icon} />
    );
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full h-[300px] bg-[#0A0A0A] border border-white/10 rounded-xl flex items-center justify-center">
                <Loader2 className="animate-spin text-[#A855F7]" />
            </div>
        );
    }

    const startPosition: [number, number] = initialLat && initialLng ? [initialLat, initialLng] : [20.5937, 78.9629]; // Default to India center

    return (
        <div className="w-full h-[300px] rounded-xl overflow-hidden border border-white/10 z-0 relative">
            <MapContainer center={startPosition} zoom={5} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} />
                {initialLat && initialLng && <Marker position={[initialLat, initialLng]} icon={icon} />}
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded z-[1000] pointer-events-none">
                Tap on map to set location
            </div>
        </div>
    );
}
