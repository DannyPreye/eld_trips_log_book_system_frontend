import { useEffect, useMemo } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    Popup,
    Tooltip,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import { decodePolyline } from "@/lib/polyline";
import type { Route, Stop } from "@/lib/api";
import { StopTypeEnum } from "@/lib/api";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapDisplayProps {
    route?: Route;
    stops?: Stop[];
    currentLocation?: { lat: number; lng: number };
    pickupLocation?: { lat: number; lng: number };
    dropoffLocation?: { lat: number; lng: number };
    height?: string;
}

function MapBounds({ bounds }: { bounds: L.LatLngBounds | null }) {
    const map = useMap();

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40] });
        }
    }, [map, bounds]);

    return null;
}

function MapResize() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

const stopTypeColors: Record<string, string> = {
    [StopTypeEnum.BREAK]: "#3b82f6",
    [StopTypeEnum.FUEL]: "#ef4444",
    [StopTypeEnum.REST]: "#8b5cf6",
    [StopTypeEnum.PICKUP]: "#10b981",
    [StopTypeEnum.DROPOFF]: "#f59e0b",
    "START": "#111827",
    "END": "#111827",
    "WAYPOINT": "#64748b",
};

function getStopIcon(type: string): L.DivIcon {
    const color = stopTypeColors[type.toUpperCase()] || stopTypeColors["WAYPOINT"];
    return L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function getStopCoordinates(
    stop: any
): [number, number] | null {
    if (!stop) return null;

    // 1. Check for coordinates object (various formats)
    const c = stop.coordinates || stop.coords || stop.location_coords || stop;
    if (typeof c === 'object' && c !== null) {
        const lat = c.lat ?? c.latitude ?? c.latitud;
        const lng = c.lng ?? c.longitude ?? c.lon ?? c.long;
        if (typeof lat === 'number' && typeof lng === 'number') {
            return [lat, lng];
        }
    }

    // 2. Check location string for coordinates (e.g. "34.05,-118.24" or "(34.05, -118.24)")
    if (typeof stop.location === 'string') {
        const match = stop.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (match) {
            return [parseFloat(match[1]), parseFloat(match[2])];
        }
    }

    // 3. Maybe location IS an object with lat/lng?
    if (typeof stop.location === 'object' && stop.location !== null) {
        const lat = stop.location.lat ?? stop.location.latitude;
        const lng = stop.location.lng ?? stop.location.longitude;
        if (typeof lat === 'number' && typeof lng === 'number') {
            return [lat, lng];
        }
    }

    return null;
}

const stopTypeLabels: Record<string, string> = {
    [StopTypeEnum.BREAK]: "Break",
    [StopTypeEnum.FUEL]: "Fuel",
    [StopTypeEnum.REST]: "Rest",
    [StopTypeEnum.PICKUP]: "Pickup",
    [StopTypeEnum.DROPOFF]: "Dropoff",
    "START": "Start",
    "END": "End",
    "WAYPOINT": "Waypoint",
};

function formatTime(timeString: string): string {
    const date = new Date(timeString);
    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export default function MapDisplay({
    route,
    stops = [],
    currentLocation,
    pickupLocation,
    dropoffLocation,
    height = "100%",
}: MapDisplayProps) {
    // Calculate bounds from all points
    const bounds = useMemo(() => {
        const points: [number, number][] = [];

        if (currentLocation) {
            points.push([currentLocation.lat, currentLocation.lng]);
        }
        if (pickupLocation) {
            points.push([pickupLocation.lat, pickupLocation.lng]);
        }
        if (dropoffLocation) {
            points.push([dropoffLocation.lat, dropoffLocation.lng]);
        }

        if (route?.polyline) {
            try {
                const decoded = decodePolyline(route.polyline);
                decoded.forEach(([lat, lng]) => {
                    points.push([lat, lng]);
                });
            } catch (error) {
                console.error("Error decoding polyline:", error);
            }
        }

        stops.forEach((stop) => {
            const coords = getStopCoordinates(stop);
            if (coords) {
                points.push(coords);
            }
        });

        if (points.length > 0) {
            return L.latLngBounds(points);
        }
        return null;
    }, [route, stops, currentLocation, pickupLocation, dropoffLocation]);

    const defaultCenter: [number, number] = [39.8283, -98.5795]; // USA Center
    const defaultZoom = bounds ? undefined : 4;

    const polylinePositions = useMemo(() => {
        if (route?.polyline) {
            try {
                return decodePolyline(route.polyline);
            } catch (error) {
                console.error("Error decoding polyline:", error);
                return [];
            }
        }
        return [];
    }, [route?.polyline]);

    const mapCenter =
        bounds && bounds.isValid()
            ? ([bounds.getCenter().lat, bounds.getCenter().lng] as [
                  number,
                  number
              ])
            : defaultCenter;

    return (
        <div
            className='w-full h-full relative'
            style={{ height, minHeight: "400px" }}
        >
            <MapContainer
                center={mapCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                className='map-container'
                scrollWheelZoom={true}
                zoomControl={false} // Clean up UI
                key={`map-${bounds ? "with-bounds" : "default"}`}
            >
                {/* CartoDB Positron - Much cleaner and premium look */}
                <TileLayer
                    url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    subdomains='abcd'
                    maxZoom={20}
                />

                <MapResize />
                {bounds && bounds.isValid() && <MapBounds bounds={bounds} />}

                {currentLocation && (
                    <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                        icon={L.divIcon({
                            className: "custom-marker",
                            html: '<div style="background-color: #111; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4);"></div>',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                        })}
                    />
                )}

                {pickupLocation && (
                    <Marker
                        position={[pickupLocation.lat, pickupLocation.lng]}
                        icon={getStopIcon(StopTypeEnum.PICKUP)}
                    >
                        <Tooltip>
                            <div className='font-semibold'>Pickup</div>
                        </Tooltip>
                        <Popup>
                            <div className='min-w-[200px]'>
                                <div className='font-semibold text-base mb-2'>
                                    Pickup Location
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {dropoffLocation && (
                    <Marker
                        position={[dropoffLocation.lat, dropoffLocation.lng]}
                        icon={getStopIcon(StopTypeEnum.DROPOFF)}
                    >
                        <Tooltip>
                            <div className='font-semibold'>Dropoff</div>
                        </Tooltip>
                        <Popup>
                            <div className='min-w-[200px]'>
                                <div className='font-semibold text-base mb-2'>
                                    Dropoff Location
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {polylinePositions.length > 0 && (
                    <Polyline
                        positions={polylinePositions}
                        pathOptions={{
                            color: "#3b82f6", // Blue primary
                            weight: 5,
                            opacity: 0.7,
                            lineJoin: 'round',
                            lineCap: 'round'
                        }}
                    >
                        {/* Glow effect for polyline */}
                        <Polyline
                            positions={polylinePositions}
                            pathOptions={{
                                color: "#3b82f6",
                                weight: 12,
                                opacity: 0.15,
                                lineJoin: 'round',
                                lineCap: 'round'
                            }}
                        />
                    </Polyline>
                )}

                {stops.map((stop, index) => {
                    const coords = getStopCoordinates(stop);
                    if (!coords || isNaN(coords[0]) || isNaN(coords[1])) return null;

                    const [lat, lng] = coords;
                    const stopType = (stop.stop_type || 'WAYPOINT').toUpperCase();
                    const label = stopTypeLabels[stopType] || stopTypeLabels['WAYPOINT'] || 'Stop';
                    const color = stopTypeColors[stopType] || stopTypeColors['WAYPOINT'] || '#64748b';

                    return (
                        <Marker
                            key={`stop-${index}-${lat}-${lng}`}
                            position={[lat, lng]}
                            icon={getStopIcon(stopType)}
                        >
                            <Tooltip className='bg-background rounded-lg border-none shadow-xl px-3 py-2' direction="top" offset={[0, -5]}>
                                <div className='font-bold text-xs uppercase tracking-wider text-primary'>
                                    {label}
                                </div>
                                {stop.location && (
                                    <div className='text-[10px] text-muted-foreground mt-0.5 max-w-[150px] truncate'>
                                        {stop.location}
                                    </div>
                                )}
                            </Tooltip>
                            <Popup className="premium-popup">
                                <div className='min-w-[200px] p-1'>
                                    <div className='font-bold text-lg mb-2 flex items-center gap-2'>
                                        <div style={{ backgroundColor: color, width: 10, height: 10, borderRadius: '50%' }}></div>
                                        {label}
                                    </div>
                                    {stop.location && (
                                        <div className='text-sm mb-1'>
                                            <span className="text-muted-foreground font-medium">Location:</span>{" "}
                                            <span className="font-semibold">{stop.location}</span>
                                        </div>
                                    )}
                                    <div className='text-sm mb-1'>
                                        <span className="text-muted-foreground font-medium">Time:</span>{" "}
                                        <span className="font-semibold">{formatTime(stop.time)}</span>
                                    </div>
                                    {stop.remarks && (
                                        <div className='text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50 italic'>
                                            "{stop.remarks}"
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
