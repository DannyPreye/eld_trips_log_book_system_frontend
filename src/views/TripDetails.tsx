import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MapDisplay from "@/components/MapDisplay/MapDisplay";
import LogGraphAnimated from "@/components/LogGraphAnimated/LogGraphAnimated";
import DayNavigator from "@/components/DayNavigator/DayNavigator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTripDetails } from "@/hooks/useTripDetails";
import {
    ArrowLeft,
    Calendar,
    Map as MapIcon,
    FileText,
    Navigation,
    MapPin,
    AlertCircle
} from "lucide-react";
import {
    getLogDrivingHours,
    getLogOnDutyHours,
    getTotalDistance,
    getTotalDays,
    getDurationHours,
    getRouteSegments,
    getTotalDrivingHours,
    getTotalOnDutyHours
} from "@/lib/tripHelpers";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function TripDetails() {
    const { id } = useParams<{ id: string }>();
    const tripId = id ? parseInt(id, 10) : null;
    const { data: trip, isLoading, isError, error } = useTripDetails(tripId);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'map' | 'logs'>('map');

    const totalDays = useMemo(() => trip ? getTotalDays(trip) : 0, [trip]);
    const currentLog = useMemo(() => trip?.logs?.[currentDayIndex], [trip, currentDayIndex]);

    if (isLoading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
                />
            </div>
        );
    }

    if (isError || !trip) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center p-4'>
                <Card className="max-w-md w-full glass border-destructive/20">
                    <CardContent className="pt-6 text-center">
                        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Failed to Load Trip</h2>
                        <p className='text-muted-foreground mb-6'>
                            {error?.message || "Something went wrong while fetching trip details."}
                        </p>
                        <Link to='/'>
                            <Button className="w-full bg-primary hover:bg-primary/90">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Return to Planner
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handlePreviousDay = () => currentDayIndex > 0 && setCurrentDayIndex(currentDayIndex - 1);
    const handleNextDay = () => currentDayIndex < totalDays - 1 && setCurrentDayIndex(currentDayIndex + 1);

    // Calculate daily metrics
    const drivingHours = currentLog ? getLogDrivingHours(currentLog) : 0;
    const onDutyHours = currentLog ? getLogOnDutyHours(currentLog) : 0;

    // Robust data extraction
    const totalDistance = useMemo(() => {
        return (trip as any).distanceMiles ?? (trip as any).distance_miles ?? getTotalDistance(trip);
    }, [trip]);

    const totalDuration = useMemo(() => {
        return (trip as any).durationHours ?? (trip as any).duration_hours ?? getDurationHours(trip);
    }, [trip]);

    const segments = useMemo(() => getRouteSegments(trip), [trip]);

    return (
        <div className='min-h-screen bg-background relative selection:bg-primary/20'>
            {/* Ambient Background */}
            <div className='absolute top-0 left-0 w-full h-64 bg-primary/[0.01] pointer-events-none' />

            <div className='container mx-auto px-4 py-6 relative z-10 max-w-6xl'>
                {/* Top Navigation Bar - Denser */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to='/'
                        className='inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group'
                    >
                        <ArrowLeft className='w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform' />
                        Return to Planner
                    </Link>

                    <div className="flex bg-muted/40 p-1 rounded-xl border border-border/40 backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'map' ? 'bg-background text-primary shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <MapIcon className="w-3 h-3" />
                            Route
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === 'logs' ? 'bg-background text-primary shadow-sm ring-1 ring-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            <FileText className="w-3 h-3" />
                            Logs
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Sidebar - Ultra Compact */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 space-y-4"
                    >
                        <div className="glass rounded-2xl p-5 border-white/10 shadow-xl shadow-primary/5 bg-background/40">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Navigation className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Voyage ID</h4>
                                    <h1 className='text-lg font-black'>TRP-{tripId}</h1>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-3">
                                <div className="bg-primary/5 p-2 rounded-lg border border-primary/10">
                                    <span className="text-[7px] font-black text-muted-foreground uppercase block mb-0.5">Distance</span>
                                    <span className="text-[10px] font-black">{totalDistance.toFixed(0)} mi</span>
                                </div>
                                <div className="bg-primary/5 p-2 rounded-lg border border-primary/10">
                                    <span className="text-[7px] font-black text-muted-foreground uppercase block mb-0.5">Est. Time</span>
                                    <span className="text-[10px] font-black">{totalDuration.toFixed(1)}h</span>
                                </div>
                                <div className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                                    <span className="text-[7px] font-black text-blue-500/60 uppercase block mb-0.5">Driving</span>
                                    <span className="text-[10px] font-black">{getTotalDrivingHours(trip).toFixed(1)}h</span>
                                </div>
                                <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                    <span className="text-[7px] font-black text-amber-500/60 uppercase block mb-0.5">On-Duty</span>
                                    <span className="text-[10px] font-black">{getTotalOnDutyHours(trip).toFixed(1)}h</span>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-border/20 flex items-center justify-between px-1">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Status</span>
                                    <span className="text-[9px] font-black uppercase text-foreground">Verified</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[8px] font-black uppercase text-green-500 tracking-tighter">Legal</span>
                                </div>
                            </div>
                        </div>

                        {activeTab === 'logs' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-4"
                            >
                                <div className="glass rounded-2xl p-5 border-white/5 bg-background/20 shadow-lg">
                                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4">Day {currentDayIndex + 1} Metrics</h4>
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">Driving</span>
                                                <span className="text-xs font-black">{drivingHours.toFixed(1)}h</span>
                                            </div>
                                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_#3b82f6]" style={{ width: `${(drivingHours/11)*100}%` }} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex justify-between items-end mb-1.5">
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase">On-Duty</span>
                                                <span className="text-xs font-black">{onDutyHours.toFixed(1)}h</span>
                                            </div>
                                            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-500 transition-all duration-500 shadow-[0_0_8px_#f59e0b]" style={{ width: `${(onDutyHours/14)*100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="glass rounded-2xl p-5 border-white/5 bg-background/20">
                                <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Transit History</h4>
                                <div className="space-y-3">
                                    {segments.slice(0, 4).map((seg: any, idx: number) => (
                                        <div key={idx} className="flex gap-3 relative pb-3 border-l border-border/50 ml-1.5 pl-3 last:border-0 last:pb-0">
                                            <div className="absolute -left-[5px] top-0.5 w-2 h-2 rounded-full border-2 border-primary bg-background shadow-[0_0_5px_rgba(var(--primary),0.3)]" />
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[9px] font-black uppercase text-foreground leading-tight">Stage {idx + 1}</p>
                                                    <span className="text-[8px] font-black text-primary/60">{seg.distance_miles?.toFixed(0)} mi</span>
                                                </div>
                                                <p className="text-[8px] font-bold text-muted-foreground uppercase mt-0.5">{seg.duration_hours?.toFixed(1)}h duration</p>
                                            </div>
                                        </div>
                                    ))}
                                    {segments.length > 4 && (
                                        <div className="pt-1 flex items-center gap-2">
                                            <div className="h-[1px] flex-1 bg-border/30" />
                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">+{segments.length - 4} More Stages</p>
                                            <div className="h-[1px] flex-1 bg-border/30" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Main Content Area - Reduced Visual Footprint */}
                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            {activeTab === 'map' ? (
                                <motion.div
                                    key="map-view-v3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="glass rounded-3xl overflow-hidden border-white/10 shadow-2xl relative h-[480px] bg-muted/20">
                                        <MapDisplay
                                            route={trip.route}
                                            stops={trip.stops}
                                            height='100%'
                                        />

                                        <div className="absolute top-4 right-4 z-[1000]">
                                            <div className="glass px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-lg border-white/10">
                                                <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                                                Live Analytics Enabled
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
                                        {trip.stops?.map((stop, i) => (
                                            <div key={i} className="glass px-3 py-1.5 rounded-xl flex items-center gap-2.5 border-white/5 shadow-sm bg-background/20 group hover:bg-background/40 transition-colors">
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            stop.stop_type === 'PICKUP' ? '#10b981' :
                                                            stop.stop_type === 'DROPOFF' ? '#f59e0b' :
                                                            stop.stop_type === 'FUEL' ? '#ef4444' :
                                                            stop.stop_type === 'REST' ? '#8b5cf6' :
                                                            stop.stop_type === 'BREAK' ? '#3b82f6' :
                                                            '#64748b'
                                                    }}
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-tight text-muted-foreground group-hover:text-primary transition-colors">{stop.stop_type}</span>
                                                    <span className="text-[9px] font-black">{new Date(stop.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="logs-view-v3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between glass px-5 py-2.5 rounded-2xl border-white/5 bg-background/10">
                                        <DayNavigator
                                            currentIndex={currentDayIndex}
                                            totalDays={totalDays}
                                            date={currentLog?.date || ''}
                                            onPrevious={handlePreviousDay}
                                            onNext={handleNextDay}
                                        />
                                    </div>

                                    <Card className="glass border-white/10 rounded-[2rem] overflow-hidden shadow-2xl bg-background/10">
                                        <div className="bg-muted/10 px-6 py-2.5 border-b border-white/5 flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-primary opacity-60" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">HOS Daily Record</span>
                                            </div>
                                            <span className="text-[8px] font-black uppercase tracking-tighter opacity-20">Log #00{currentDayIndex + 1}</span>
                                        </div>
                                        <div className="p-4 overflow-x-auto custom-scrollbar">
                                            {currentLog && (
                                                <LogGraphAnimated
                                                    log={currentLog}
                                                    width={1600} // More compact width
                                                    animationKey={`final-log-${currentDayIndex}`}
                                                />
                                            )}
                                        </div>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="glass p-4 rounded-xl border-white/5 bg-background/5">
                                            <p className="text-[9px] font-medium text-muted-foreground leading-relaxed italic text-center opacity-70">
                                                "Driver compliance verified against US HOS FMCSA rules (11-hour driving limitation)."
                                            </p>
                                        </div>
                                        <div className="glass p-4 rounded-xl border-white/5 flex items-center justify-center gap-5 bg-background/5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Driving</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">On-Duty</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                                <span className="text-[8px] font-black uppercase opacity-40 tracking-widest">Relief</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
