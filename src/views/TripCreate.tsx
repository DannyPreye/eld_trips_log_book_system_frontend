import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "@/components/TripForm/TripForm";
import MapDisplay from "@/components/MapDisplay/MapDisplay";
import { useTripPlan } from "@/hooks/useTripPlan";
import type { TripInputRequest } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Info, AlertCircle } from "lucide-react";

export default function TripCreate() {
    const navigate = useNavigate();
    const { mutate: planTrip, isPending, isError, error } = useTripPlan();
    const [formData, setFormData] = useState<TripInputRequest | null>(null);

    const handleSubmit = (data: TripInputRequest) => {
        setFormData(data);

        planTrip(data, {
            onSuccess: (trip) => {
                console.log("Trip planned successfully:", trip);
                // @ts-ignore
                navigate(`/trip/${trip.tripId}`);
            },
            onError: (err) => {
                console.error("Trip planning failed:", err);
            },
        });
    };

    const currentLocation = formData?.current_location as
        | { lat: number; lng: number }
        | undefined;
    const pickupLocation = formData?.pickup_location as
        | { lat: number; lng: number }
        | undefined;
    const dropoffLocation = formData?.dropoff_location as
        | { lat: number; lng: number }
        | undefined;

    return (
        <div className='min-h-screen bg-background relative selection:bg-primary/20'>
            {/* Ambient Background */}
            <div className='absolute top-0 left-0 w-full h-64 bg-primary/[0.02] pointer-events-none' />
            <div className='absolute -top-24 -left-24 w-96 h-96 bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none' />

            <div className='container mx-auto px-4 py-8 relative z-10 max-w-6xl'>
                {/* Compact Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary rounded-xl">
                            <Navigation className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className='text-xl font-black tracking-tight'>
                                Plan New <span className="text-primary-accent">Logistics Trip</span>
                            </h1>
                            <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5'>
                                Automated Routing & Compliance Engine
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/10">
                        <Info className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">HOS Rule Set: 70h / 8d US</span>
                    </div>
                </motion.div>

                <AnimatePresence>
                    {isError && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className='mb-6'
                        >
                            <div className='p-3 bg-destructive/5 border border-destructive/10 rounded-xl flex items-center gap-3 backdrop-blur-sm'>
                                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                                <p className='text-[10px] font-bold uppercase tracking-tight text-destructive/80'>
                                    {error?.message || "Failed to plan trip. Please check your data."}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Sidebar - Compact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className='lg:col-span-4 space-y-4'
                    >
                        <div className="glass rounded-[2rem] p-1 shadow-2xl shadow-primary/5 border-white/20">
                            <TripForm
                                onSubmit={handleSubmit}
                                isLoading={isPending}
                            />
                        </div>

                        <div className="glass rounded-2xl p-4 border-blue-500/5 bg-blue-500/[0.02]">
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed italic text-center">
                                "The system will automatically calculate optimal fuel stops and required rest periods to ensure FMCSA compliance."
                            </p>
                        </div>
                    </motion.div>

                    {/* Main Content Area - Map Preview */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className='lg:col-span-8'
                    >
                        <div className="glass rounded-[2.5rem] overflow-hidden border-white/20 shadow-2xl relative h-[600px]">
                            <div className="absolute top-4 left-4 z-[1000]">
                                <div className="glass px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg border-white/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                    Dynamic Preview
                                </div>
                            </div>

                            <MapDisplay
                                currentLocation={currentLocation}
                                pickupLocation={pickupLocation}
                                dropoffLocation={dropoffLocation}
                                height='100%'
                            />

                            {!formData && (
                                <div className="absolute inset-0 z-[500] bg-background/5 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-background/90 glass px-6 py-4 rounded-3xl text-center border-white/20 shadow-2xl"
                                    >
                                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                            <MapPin className="w-6 h-6 text-primary/40" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Waiting for Route Data</p>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
