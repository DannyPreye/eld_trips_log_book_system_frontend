import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Navigation,
    Search,
    MapPin,
    Clock,
    Route as RouteIcon,
    ChevronRight,
    RotateCcw,
} from "lucide-react";
import type { Route } from "@/lib/api";
import { getRouteSteps } from "@/lib/tripHelpers";
import type { TripResponse } from "@/lib/api";
import { fadeInUp, staggerContainer, scaleIn } from "@/lib/animations";

interface RouteStepsProps {
    route: Route;
    trip?: TripResponse;
}

function getInstructionIcon(instruction: string) {
    const lower = instruction.toLowerCase();
    if (lower.includes("left")) return "↶";
    if (lower.includes("right")) return "↷";
    if (lower.includes("straight") || lower.includes("continue")) return "→";
    if (lower.includes("roundabout")) return "⟲";
    if (lower.includes("arrive")) return "📍";
    return "→";
}

function getInstructionColor(instruction: string): string {
    const lower = instruction.toLowerCase();
    if (lower.includes("arrive"))
        return "text-green-600 bg-green-50 border-green-200";
    if (lower.includes("roundabout"))
        return "text-purple-600 bg-purple-50 border-purple-200";
    if (lower.includes("left") || lower.includes("right"))
        return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
}

function formatDistance(miles: number): string {
    if (miles < 0.1) return `${(miles * 5280).toFixed(0)} ft`;
    return `${miles.toFixed(2)} mi`;
}

function formatDuration(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes < 1) return "< 1 min";
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export default function RouteSteps({ route, trip }: RouteStepsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    // Try to get steps from trip first (using helper), then fallback to route
    let steps: any[] = [];

    if (trip) {
        steps = getRouteSteps(trip);
    } else {
        // Fallback: try to access route.segments directly and flatten all steps
        const routeAny = route as any;
        const segments = routeAny?.segments || [];
        if (segments.length > 0) {
            // Flatten all steps from all segments into a single array
            steps = segments.flatMap((segment: any) => segment?.steps || []);
        }
    }

    // Filter steps based on search query
    const filteredSteps = useMemo(() => {
        if (!searchQuery.trim()) return steps;
        const query = searchQuery.toLowerCase();
        return steps.filter(
            (step) =>
                step.instruction?.toLowerCase().includes(query) ||
                formatDistance(step.distance_miles || 0)
                    .toLowerCase()
                    .includes(query)
        );
    }, [steps, searchQuery]);

    // Calculate cumulative distances
    const cumulativeDistances = useMemo(() => {
        let cumulative = 0;
        return steps.map((step) => {
            cumulative += step.distance_miles || 0;
            return cumulative;
        });
    }, [steps]);

    const totalDistance =
        (route as any).distanceMiles ||
        route.distance_miles ||
        cumulativeDistances[cumulativeDistances.length - 1] ||
        0;

    if (steps.length === 0) {
        return (
            <motion.div initial='hidden' animate='visible' variants={scaleIn}>
                <Card className='border border-border'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Navigation className='w-5 h-5' />
                            Route Steps
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-sm text-muted-foreground'>
                            No route steps available
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial='hidden'
            animate='visible'
            variants={staggerContainer}
        >
            <Card className='border border-border overflow-hidden'>
                <CardHeader className='bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border'>
                    <div className='flex items-center justify-between mb-4'>
                        <CardTitle className='flex items-center gap-2 text-lg'>
                            <div className='p-2 rounded-lg bg-primary/10'>
                                <Navigation className='w-5 h-5 text-primary' />
                            </div>
                            Turn-by-Turn Directions
                        </CardTitle>
                        <Badge variant='outline' className='font-semibold'>
                            {steps.length}{" "}
                            {steps.length === 1 ? "step" : "steps"}
                        </Badge>
                    </div>

                    {/* Search Bar */}
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            type='text'
                            placeholder='Search directions...'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className='pl-10 bg-background/50 border-border/50 focus:border-primary/50'
                        />
                        {searchQuery && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setSearchQuery("")}
                                className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded'
                            >
                                <RotateCcw className='w-4 h-4 text-muted-foreground' />
                            </motion.button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className='p-0'>
                    {/* Progress Bar */}
                    <div className='px-6 pt-4 pb-2'>
                        <div className='flex items-center justify-between text-xs text-muted-foreground mb-2'>
                            <span>Route Progress</span>
                            <span>{formatDistance(totalDistance)}</span>
                        </div>
                        <div className='h-2 bg-muted rounded-full overflow-hidden'>
                            <motion.div
                                className='h-full bg-gradient-to-r from-primary to-primary/80'
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Steps List */}
                    <div className='max-h-[500px] overflow-y-auto overflow-x-hidden px-6 py-4'>
                        <AnimatePresence mode='wait'>
                            {filteredSteps.length === 0 ? (
                                <motion.div
                                    key='no-results'
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className='text-center py-12'
                                >
                                    <Search className='w-12 h-12 text-muted-foreground/50 mx-auto mb-3' />
                                    <p className='text-sm text-muted-foreground'>
                                        No directions found matching "
                                        {searchQuery}"
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key='steps-list'
                                    variants={staggerContainer}
                                    initial='hidden'
                                    animate='visible'
                                    className='space-y-2'
                                >
                                    {filteredSteps.map((step) => {
                                        const originalIndex =
                                            steps.indexOf(step);
                                        const stepDistance =
                                            step.distance_miles || 0;
                                        const cumulativeDistance =
                                            cumulativeDistances[
                                                originalIndex
                                            ] || 0;
                                        const isLast =
                                            originalIndex === steps.length - 1;
                                        const isExpanded =
                                            expandedIndex === originalIndex;
                                        const progress =
                                            ((originalIndex + 1) /
                                                steps.length) *
                                            100;

                                        return (
                                            <motion.div
                                                key={`step-${originalIndex}`}
                                                variants={fadeInUp}
                                                initial='hidden'
                                                animate='visible'
                                                transition={{
                                                    duration: 0.4,
                                                    delay: originalIndex * 0.03,
                                                    ease: "easeOut",
                                                }}
                                                whileHover={{
                                                    scale: 1.01,
                                                    x: 4,
                                                }}
                                                className='group relative'
                                            >
                                                <div
                                                    className={`
                                                        relative flex gap-4 p-4 rounded-lg border transition-all cursor-pointer
                                                        ${
                                                            isExpanded
                                                                ? "bg-primary/5 border-primary/30 shadow-md"
                                                                : "bg-card border-border hover:border-primary/30 hover:bg-muted/30"
                                                        }
                                                    `}
                                                    onClick={() =>
                                                        setExpandedIndex(
                                                            isExpanded
                                                                ? null
                                                                : originalIndex
                                                        )
                                                    }
                                                >
                                                    {/* Step Number & Connector */}
                                                    <div className='flex flex-col items-center flex-shrink-0'>
                                                        <motion.div
                                                            className={`
                                                                relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                                                                border-2 transition-all
                                                                ${
                                                                    isExpanded
                                                                        ? "bg-primary text-primary-foreground border-primary scale-110"
                                                                        : "bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 group-hover:border-primary/40"
                                                                }
                                                            `}
                                                            whileHover={{
                                                                scale: 1.1,
                                                            }}
                                                            whileTap={{
                                                                scale: 0.95,
                                                            }}
                                                        >
                                                            {originalIndex + 1}
                                                            {isExpanded && (
                                                                <motion.div
                                                                    className='absolute inset-0 rounded-full bg-primary/20'
                                                                    initial={{
                                                                        scale: 1,
                                                                    }}
                                                                    animate={{
                                                                        scale: 1.5,
                                                                        opacity: 0,
                                                                    }}
                                                                    transition={{
                                                                        duration: 1.5,
                                                                        repeat: Infinity,
                                                                        ease: "easeOut",
                                                                    }}
                                                                />
                                                            )}
                                                        </motion.div>
                                                        {!isLast && (
                                                            <motion.div
                                                                className={`
                                                                    w-0.5 mt-2 min-h-[60px]
                                                                    ${
                                                                        isExpanded
                                                                            ? "bg-primary/40"
                                                                            : "bg-border group-hover:bg-primary/30"
                                                                    }
                                                                `}
                                                                initial={{
                                                                    height: 0,
                                                                }}
                                                                animate={{
                                                                    height: "auto",
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        originalIndex *
                                                                            0.03 +
                                                                        0.2,
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Step Content */}
                                                    <div className='flex-1 min-w-0'>
                                                        <div className='flex items-start gap-3 mb-2'>
                                                            <motion.div
                                                                className={`
                                                                    text-3xl flex-shrink-0 p-2 rounded-lg
                                                                    ${getInstructionColor(
                                                                        step.instruction ||
                                                                            ""
                                                                    )}
                                                                `}
                                                                whileHover={{
                                                                    rotate: [
                                                                        0, -10,
                                                                        10, -10,
                                                                        0,
                                                                    ],
                                                                }}
                                                                transition={{
                                                                    duration: 0.5,
                                                                }}
                                                            >
                                                                {getInstructionIcon(
                                                                    step.instruction ||
                                                                        ""
                                                                )}
                                                            </motion.div>
                                                            <div className='flex-1 min-w-0'>
                                                                <motion.p
                                                                    className={`
                                                                        font-semibold leading-tight break-words mb-2
                                                                        ${
                                                                            isExpanded
                                                                                ? "text-base text-foreground"
                                                                                : "text-sm text-foreground group-hover:text-primary"
                                                                        }
                                                                    `}
                                                                    layout
                                                                >
                                                                    {step.instruction ||
                                                                        "Continue"}
                                                                </motion.p>

                                                                <AnimatePresence>
                                                                    {isExpanded && (
                                                                        <motion.div
                                                                            initial={{
                                                                                opacity: 0,
                                                                                height: 0,
                                                                            }}
                                                                            animate={{
                                                                                opacity: 1,
                                                                                height: "auto",
                                                                            }}
                                                                            exit={{
                                                                                opacity: 0,
                                                                                height: 0,
                                                                            }}
                                                                            className='space-y-2 mt-3 pt-3 border-t border-border/50'
                                                                        >
                                                                            {step.way_points && (
                                                                                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                                                                    <RouteIcon className='w-3 h-3' />
                                                                                    <span>
                                                                                        Waypoints:
                                                                                        [
                                                                                        {
                                                                                            step
                                                                                                .way_points[0]
                                                                                        }{" "}
                                                                                        -{" "}
                                                                                        {
                                                                                            step
                                                                                                .way_points[1]
                                                                                        }

                                                                                        ]
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </motion.div>
                                                                    )}
                                                                </AnimatePresence>

                                                                <div className='flex items-center gap-4 mt-2 flex-wrap'>
                                                                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                                                        <MapPin className='w-3.5 h-3.5' />
                                                                        <span className='font-medium'>
                                                                            {formatDistance(
                                                                                stepDistance
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                                                                        <Clock className='w-3.5 h-3.5' />
                                                                        <span className='font-medium'>
                                                                            {formatDuration(
                                                                                step.duration_hours ||
                                                                                    0
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                    {cumulativeDistance >
                                                                        0 && (
                                                                        <Badge
                                                                            variant='outline'
                                                                            className='text-xs'
                                                                        >
                                                                            {formatDistance(
                                                                                cumulativeDistance
                                                                            )}{" "}
                                                                            total
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <motion.div
                                                                animate={{
                                                                    rotate: isExpanded
                                                                        ? 90
                                                                        : 0,
                                                                }}
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 300,
                                                                    damping: 30,
                                                                }}
                                                            >
                                                                <ChevronRight className='w-5 h-5 text-muted-foreground flex-shrink-0' />
                                                            </motion.div>
                                                        </div>

                                                        {/* Progress indicator */}
                                                        <div className='mt-2 h-1 bg-muted rounded-full overflow-hidden'>
                                                            <motion.div
                                                                className='h-full bg-gradient-to-r from-primary/60 to-primary'
                                                                initial={{
                                                                    width: 0,
                                                                }}
                                                                animate={{
                                                                    width: `${progress}%`,
                                                                }}
                                                                transition={{
                                                                    delay:
                                                                        originalIndex *
                                                                            0.03 +
                                                                        0.3,
                                                                    duration: 0.5,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Summary */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className='px-6 py-4 border-t border-border bg-muted/20'
                    >
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-4 text-sm'>
                                <div className='flex items-center gap-2'>
                                    <RouteIcon className='w-4 h-4 text-muted-foreground' />
                                    <span className='text-muted-foreground'>
                                        Total Distance
                                    </span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Clock className='w-4 h-4 text-muted-foreground' />
                                    <span className='text-muted-foreground'>
                                        {formatDuration(
                                            steps.reduce(
                                                (sum, s) =>
                                                    sum +
                                                    (s.duration_hours || 0),
                                                0
                                            )
                                        )}
                                    </span>
                                </div>
                            </div>
                            <motion.div
                                className='text-lg font-bold text-primary'
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    delay: 0.6,
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                }}
                            >
                                {formatDistance(totalDistance)}
                            </motion.div>
                        </div>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
