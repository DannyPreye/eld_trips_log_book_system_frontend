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
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, bounds]);

    return null;
}

function MapResize() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }, [map]);
    return null;
}

function getStopIcon(type: StopTypeEnum): L.DivIcon {
    const colors: Record<StopTypeEnum, string> = {
        [StopTypeEnum.BREAK]: "#3b82f6",
        [StopTypeEnum.FUEL]: "#ef4444",
        [StopTypeEnum.REST]: "#8b5cf6",
        [StopTypeEnum.PICKUP]: "#10b981",
        [StopTypeEnum.DROPOFF]: "#f59e0b",
    };

    return L.divIcon({
        className: "custom-marker",
        html: `<div style="background-color: ${colors[type]}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
}

function getStopCoordinates(
    stop: Stop & { coordinates?: { lat: number; lng: number } }
): [number, number] | null {
    // First try coordinates object
    if (
        stop.coordinates?.lat !== undefined &&
        stop.coordinates?.lng !== undefined
    ) {
        return [stop.coordinates.lat, stop.coordinates.lng];
    }
    // Fall back to parsing location string
    if (stop.location) {
        const match = stop.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (match) {
            return [parseFloat(match[1]), parseFloat(match[2])];
        }
    }
    return null;
}

const stopTypeLabels: Record<StopTypeEnum, string> = {
    [StopTypeEnum.BREAK]: "Break",
    [StopTypeEnum.FUEL]: "Fuel",
    [StopTypeEnum.REST]: "Rest",
    [StopTypeEnum.PICKUP]: "Pickup",
    [StopTypeEnum.DROPOFF]: "Dropoff",
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

    const defaultCenter: [number, number] = [40.7128, -74.006];
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
            className='w-full border border-map-border bg-white'
            style={{ height, minHeight: "400px" }}
        >
            <MapContainer
                center={mapCenter}
                zoom={defaultZoom}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                className='map-container'
                scrollWheelZoom={true}
                key={`map-${bounds ? "with-bounds" : "default"}`}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <MapResize />
                {bounds && bounds.isValid() && <MapBounds bounds={bounds} />}

                {currentLocation && (
                    <Marker
                        position={[currentLocation.lat, currentLocation.lng]}
                        icon={L.divIcon({
                            className: "custom-marker",
                            html: '<div style="background-color: #111; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 1px rgba(0,0,0,0.2);"></div>',
                            iconSize: [14, 14],
                            iconAnchor: [7, 7],
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
                            color: "#111111",
                            weight: 3,
                            opacity: 0.8,
                        }}
                    />
                )}

                {stops.map((stop, index) => {
                    const coords = getStopCoordinates(stop);
                    if (!coords) return null;
                    const [lat, lng] = coords;
                    const stopType = stop.stop_type;
                    return (
                        <Marker
                            key={`stop-${index}`}
                            position={[lat, lng]}
                            icon={getStopIcon(stopType)}
                        >
                            <Tooltip className='bg-background'>
                                <div className='font-semibold'>
                                    {stopTypeLabels[stopType]}
                                </div>
                                {stop.location && (
                                    <div className='text-xs text-primary'>
                                        {stop.location}
                                    </div>
                                )}
                            </Tooltip>
                            <Popup>
                                <div className='min-w-[200px]'>
                                    <div className='font-semibold text-base mb-2'>
                                        {stopTypeLabels[stopType]}
                                    </div>
                                    {stop.location && (
                                        <div className='text-sm text-primary mb-1'>
                                            <strong>Location:</strong>{" "}
                                            {stop.location}
                                        </div>
                                    )}
                                    <div className='text-sm text-primary mb-1'>
                                        <strong>Time:</strong>{" "}
                                        {formatTime(stop.time)}
                                    </div>
                                    {stop.remarks && (
                                        <div className='text-sm text-muted-foreground mt-2 pt-2 border-t'>
                                            {stop.remarks}
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
