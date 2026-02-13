"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    Crosshair, Zap, Shield, AlertTriangle,
    Globe, Radio, Activity, Search
} from "lucide-react";
import { getFleetGeography, type FleetPosition } from "@/services/admin";
import { CommandNexusCard } from "../CommandNexusCard";

// Custom dark theme for Leaflet
const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

function MapAutoCenter({ positions }: { positions: FleetPosition[] }) {
    const map = useMap();

    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions.map(p => [p.lat, p.lng]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        }
    }, [positions, map]);

    return null;
}

export function FleetCommandNexus() {
    const [positions, setPositions] = useState<FleetPosition[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ active: 0, hub: 0, alert: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getFleetGeography();
            setPositions(data);

            setStats({
                active: data.filter(p => p.status === 'Rented').length,
                hub: data.filter(p => p.status === 'Ready').length,
                alert: data.filter(p => p.status === 'Maintenance' || p.status === 'Under-Repair').length
            });
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Rented': return '#3B82F6'; // Blue
            case 'Ready': return '#10B981'; // Emerald
            default: return '#EF4444'; // Red
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Mission Intel Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Radio size={80} className="text-blue-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-blue-500 tracking-[0.2em]">Active Deployments</span>
                        <div className="text-3xl font-black italic mt-1">{stats.active} units</div>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2 block">Live Uplink Active</span>
                    </div>
                    <Activity className="text-blue-500/30 animate-pulse" />
                </div>

                <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <Shield size={80} className="text-emerald-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">Hub Availability</span>
                        <div className="text-3xl font-black italic mt-1">{stats.hub} units</div>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2 block">Ready for Launch</span>
                    </div>
                    <Zap className="text-emerald-500/30" />
                </div>

                <div className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <AlertTriangle size={80} className="text-red-500" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em]">Operational Alerts</span>
                        <div className="text-3xl font-black italic mt-1">{stats.alert} units</div>
                        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest mt-2 block">Maintenance Pending</span>
                    </div>
                    <AlertTriangle className="text-red-500/30 animate-pulse" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Global Overwatch Map */}
                <div className="lg:col-span-3">
                    <CommandNexusCard title="Global Overwatch" subtitle="Geospatial visualization of localized hardware units" icon={Globe} statusColor="blue">
                        <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-white/10 mt-6 relative bg-[#050505]">
                            {isLoading ? (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 animate-pulse">Syncing Satellite Feed...</span>
                                    </div>
                                </div>
                            ) : (
                                <MapContainer
                                    center={[20, 78]}
                                    zoom={4}
                                    className="h-full w-full grayscale-[0.8] contrast-[1.2] invert-[0.05]"
                                    style={{ background: '#050505' }}
                                >
                                    <TileLayer url={tileUrl} />
                                    <MapAutoCenter positions={positions} />

                                    {positions.map((pos) => (
                                        <CircleMarker
                                            key={pos.id}
                                            center={[pos.lat, pos.lng]}
                                            radius={8}
                                            pathOptions={{
                                                fillColor: getStatusColor(pos.status),
                                                fillOpacity: 0.6,
                                                color: getStatusColor(pos.status),
                                                weight: 2,
                                                className: 'animate-pulse'
                                            }}
                                        >
                                            <Popup className="neural-popup">
                                                <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded-xl min-w-[180px] text-white">
                                                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                                                        <span className="text-[8px] font-black uppercase text-gray-500 tracking-widest">ID: {pos.serialNumber}</span>
                                                        <div className={`w-1.5 h-1.5 rounded-full bg-[${getStatusColor(pos.status)}]`} />
                                                    </div>
                                                    <h4 className="text-[11px] font-black uppercase italic mb-1">{pos.model}</h4>
                                                    <p className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter mb-2">{pos.label}</p>
                                                    <div className="flex gap-2 mb-2">
                                                        <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase ${pos.status === 'Rented' ? 'bg-blue-500/20 text-blue-400' :
                                                            pos.status === 'Ready' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            {pos.status.toUpperCase()}
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-white/5 text-[7px] font-black uppercase text-gray-500">
                                                            {pos.lat.toFixed(2)}N, {pos.lng.toFixed(2)}E
                                                        </span>
                                                    </div>

                                                    {pos.syncLevel !== undefined && (
                                                        <div className="pt-2 border-t border-white/5 flex flex-col gap-1">
                                                            <div className="flex justify-between text-[7px] uppercase font-bold text-gray-500">
                                                                <span>Neural Sync Level</span>
                                                                <span className="text-blue-400">{pos.syncLevel} XP</span>
                                                            </div>
                                                            <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `${Math.min((pos.syncLevel / 2000) * 100, 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </Popup>
                                        </CircleMarker>
                                    ))}
                                </MapContainer>
                            )}

                            {/* Overlay UI */}
                            <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
                                <button onClick={loadData} className="p-3 bg-black/80 border border-white/10 rounded-2xl hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group backdrop-blur-md">
                                    <RefreshCw size={14} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                                </button>
                                <button className="p-3 bg-black/80 border border-white/10 rounded-2xl hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group backdrop-blur-md">
                                    <Search size={14} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </CommandNexusCard>
                </div>

                {/* Regional Hotspots */}
                <div className="space-y-6">
                    <CommandNexusCard title="Signal Strength" subtitle="Localized transmission node quality" icon={Radio} statusColor="purple">
                        <div className="space-y-4 mt-6">
                            {[
                                { name: "Mumbai Node", strength: 98, load: 45 },
                                { name: "Delhi Node", strength: 84, load: 72 },
                                { name: "Bangalore Node", strength: 92, load: 28 },
                                { name: "Chennai Node", strength: 71, load: 55 }
                            ].map((node, i) => (
                                <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest">{node.name}</span>
                                        <span className="text-[9px] font-mono text-purple-400">{node.strength}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500"
                                            style={{ width: `${node.strength}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[7px] uppercase font-bold text-gray-600">Density: {node.load}%</span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${node.strength > 90 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CommandNexusCard>

                    <div className="p-8 bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <Crosshair size={120} className="text-blue-500" />
                        </div>
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Network Precision</h4>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-3xl font-black italic">METRIC</span>
                            <span className="text-xs font-bold text-emerald-500 mb-1">0.02ms</span>
                        </div>
                        <p className="text-[9px] text-gray-500 mt-4 uppercase font-bold tracking-widest leading-relaxed">
                            Global satellite synchronization verified. Packet loss minimal across all sectors.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .neural-popup .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                }
                .neural-popup .leaflet-popup-tip {
                    background: #0a0a0a !important;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .neural-popup .leaflet-popup-content {
                    margin: 0 !important;
                }
            `}</style>
        </div>
    );
}

function RefreshCw({ size, className }: { size: number, className: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    );
}
