import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useGeocoding } from "@/hooks/useGeocoding";
import type { TripInputRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Flag, Clock, Loader2, Sparkles } from "lucide-react";

interface LocationInput {
    address: string;
    lat?: number;
    lng?: number;
}

interface TripFormProps {
    onSubmit: (data: TripInputRequest) => void;
    isLoading?: boolean;
}

export default function TripForm({ onSubmit, isLoading }: TripFormProps) {
    const [currentLocation, setCurrentLocation] = useState<LocationInput>({
        address: "",
    });
    const [pickupLocation, setPickupLocation] = useState<LocationInput>({
        address: "",
    });
    const [dropoffLocation, setDropoffLocation] = useState<LocationInput>({
        address: "",
    });
    const [currentCycleHours, setCurrentCycleHours] = useState<string>("0");
    const [currentSuggestions, setCurrentSuggestions] = useState<any[]>([]);
    const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);

    const { searchAddress, isLoading: isGeocoding } = useGeocoding();

    const handleLocationSearch = async (
        query: string,
        setSuggestions: (suggestions: any[]) => void
    ) => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        const results = await searchAddress(query);
        setSuggestions(results);
    };

    const handleLocationSelect = (
        result: { lat: number; lng: number; display_name: string },
        setLocation: (location: LocationInput) => void,
        setSuggestions: (suggestions: any[]) => void
    ) => {
        setLocation({
            address: result.display_name,
            lat: result.lat,
            lng: result.lng,
        });
        setSuggestions([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !currentLocation.lat ||
            !pickupLocation.lat ||
            !dropoffLocation.lat
        ) {
            return;
        }

        const request: TripInputRequest = {
            current_location: {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
            },
            pickup_location: {
                lat: pickupLocation.lat,
                lng: pickupLocation.lng,
            },
            dropoff_location: {
                lat: dropoffLocation.lat,
                lng: dropoffLocation.lng,
            },
            current_cycle_used_hours: parseFloat(currentCycleHours) || 0,
        };

        onSubmit(request);
    };

    return (
        <Card className='border-none bg-transparent shadow-none'>
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    Trip Details
                </CardTitle>
                <CardDescription className="text-sm font-medium opacity-70">
                    Define your route and HOS status
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Current Location */}
                    <div className='group space-y-2 relative'>
                        <Label htmlFor='current-location' className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Navigation className="w-3 h-3" />
                            Current Location
                        </Label>
                        <div className='relative'>
                            <Input
                                id='current-location'
                                value={currentLocation.address}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setCurrentLocation({ address: value });
                                    handleLocationSearch(value, setCurrentSuggestions);
                                }}
                                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:ring-primary/20 transition-all rounded-xl"
                                placeholder='Where are you now?'
                                disabled={isLoading}
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                            <AnimatePresence>
                                {currentSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className='absolute z-[1001] w-full mt-2 glass rounded-2xl shadow-2xl border-white/20 dark:border-white/5 overflow-hidden'
                                    >
                                        {currentSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className='px-4 py-3 cursor-pointer hover:bg-primary/10 text-sm transition-colors border-b border-white/10 last:border-0'
                                                onClick={() => handleLocationSelect(suggestion, setCurrentLocation, setCurrentSuggestions)}
                                            >
                                                {suggestion.display_name}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Pickup Location */}
                    <div className='group space-y-2 relative'>
                        <Label htmlFor='pickup-location' className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Flag className="w-3 h-3" />
                            Pickup Location
                        </Label>
                        <div className='relative'>
                            <Input
                                id='pickup-location'
                                value={pickupLocation.address}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPickupLocation({ address: value });
                                    handleLocationSearch(value, setPickupSuggestions);
                                }}
                                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:ring-primary/20 transition-all rounded-xl"
                                placeholder='Where is the load?'
                                disabled={isLoading}
                            />
                            <Flag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                            <AnimatePresence>
                                {pickupSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className='absolute z-[1001] w-full mt-2 glass rounded-2xl shadow-2xl border-white/20 dark:border-white/5 overflow-hidden'
                                    >
                                        {pickupSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className='px-4 py-3 cursor-pointer hover:bg-primary/10 text-sm transition-colors border-b border-white/10 last:border-0'
                                                onClick={() => handleLocationSelect(suggestion, setPickupLocation, setPickupSuggestions)}
                                            >
                                                {suggestion.display_name}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Dropoff Location */}
                    <div className='group space-y-2 relative'>
                        <Label htmlFor='dropoff-location' className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                            <MapPin className="w-3 h-3" />
                            Dropoff Location
                        </Label>
                        <div className='relative'>
                            <Input
                                id='dropoff-location'
                                value={dropoffLocation.address}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setDropoffLocation({ address: value });
                                    handleLocationSearch(value, setDropoffSuggestions);
                                }}
                                className="pl-10 h-12 bg-background/50 border-border/50 focus:bg-background focus:ring-primary/20 transition-all rounded-xl"
                                placeholder='Destination address'
                                disabled={isLoading}
                            />
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />

                            <AnimatePresence>
                                {dropoffSuggestions.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className='absolute z-[1001] w-full mt-2 glass rounded-2xl shadow-2xl border-white/20 dark:border-white/5 overflow-hidden'
                                    >
                                        {dropoffSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className='px-4 py-3 cursor-pointer hover:bg-primary/10 text-sm transition-colors border-b border-white/10 last:border-0'
                                                onClick={() => handleLocationSelect(suggestion, setDropoffLocation, setDropoffSuggestions)}
                                            >
                                                {suggestion.display_name}
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className='group space-y-2'>
                        <Label htmlFor='cycle-hours' className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Clock className="w-3 h-3" />
                            Current Cycle Hours Used
                        </Label>
                        <div className="relative">
                            <Input
                                id='cycle-hours'
                                type='number'
                                min='0'
                                max='70'
                                step='0.1'
                                value={currentCycleHours}
                                onChange={(e) => setCurrentCycleHours(e.target.value)}
                                className="h-12 bg-background/50 border-border/50 focus:bg-background rounded-xl pl-4"
                                placeholder='0.0'
                                disabled={isLoading}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-lg">
                                / 70h
                            </div>
                        </div>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button
                            type='submit'
                            className='w-full h-14 rounded-2xl text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 shimmer group relative overflow-hidden'
                            disabled={
                                isLoading ||
                                isGeocoding ||
                                !currentLocation.lat ||
                                !pickupLocation.lat ||
                                !dropoffLocation.lat
                            }
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Optimizing Route...
                                    </>
                                ) : (
                                    <>
                                        Calculate Smart Route
                                        <Navigation className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </span>
                        </Button>
                    </motion.div>
                </form>
            </CardContent>
        </Card>
    );
}
