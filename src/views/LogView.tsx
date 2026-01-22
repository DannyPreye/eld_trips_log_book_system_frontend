import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import LogGraphAnimated from "@/components/LogGraphAnimated/LogGraphAnimated";
import ProgressRing from "@/components/ProgressRing/ProgressRing";
import DayNavigator from "@/components/DayNavigator/DayNavigator";
import AchievementBadge from "@/components/AchievementBadge/AchievementBadge";
import CelebrationEffect from "@/components/CelebrationEffect/CelebrationEffect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTripLogs } from "@/hooks/useTripDetails";
import { ArrowLeft, Clock, TrendingUp, Award } from "lucide-react";
import { getLogDrivingHours, getLogOnDutyHours } from "@/lib/tripHelpers";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function LogView() {
    const { id } = useParams<{ id: string }>();
    const tripId = id ? parseInt(id, 10) : null;
    const { data: trip, isLoading, isError, error } = useTripLogs(tripId);
    const [currentDayIndex, setCurrentDayIndex] = useState(0);
    const [celebrate, setCelebrate] = useState(false);

    if (isLoading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-muted-foreground'
                >
                    Loading ELD logs...
                </motion.div>
            </div>
        );
    }

    if (isError || !trip || !trip.logs || trip.logs.length === 0) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-destructive mb-4'>
                        {error?.message || "No logs available for this trip"}
                    </p>
                    <Link to={`/trip/${tripId}`}>
                        <Button variant='outline'>Back to Trip Details</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const currentLog = trip.logs[currentDayIndex];
    const totalDays = trip.logs.length;

    const handlePreviousDay = () => {
        if (currentDayIndex > 0) {
            setCurrentDayIndex(currentDayIndex - 1);
        }
    };

    const handleNextDay = () => {
        if (currentDayIndex < totalDays - 1) {
            setCurrentDayIndex(currentDayIndex + 1);
            setCelebrate(true);
        }
    };

    const drivingHours = getLogDrivingHours(currentLog);
    const onDutyHours = getLogOnDutyHours(currentLog);
    const maxDrivingHours = 11;
    const maxOnDutyHours = 14;

    const drivingProgress = (drivingHours / maxDrivingHours) * 100;
    const onDutyProgress = (onDutyHours / maxOnDutyHours) * 100;


    // Calculate achievements
    const achievements = useMemo(() => {
        const isCompliant =
            drivingHours <= maxDrivingHours && onDutyHours <= maxOnDutyHours;
        const isPerfect = isCompliant && currentLog.segments.length > 0;
        const isEfficient =
            drivingHours > 0 && onDutyHours / drivingHours < 1.5;
        const isComplete = currentLog.segments.length > 0;

        return {
            perfect: isPerfect,
            compliant: isCompliant,
            efficient: isEfficient,
            complete: isComplete,
        };
    }, [drivingHours, onDutyHours, currentLog.segments.length]);

    return (
        <div className='min-h-screen bg-background overflow-x-hidden'>
            <CelebrationEffect
                trigger={celebrate}
                onComplete={() => setCelebrate(false)}
            />

            <div className='container mx-auto px-4 py-8 '>
                <motion.div
                    initial='hidden'
                    animate='visible'
                    variants={staggerContainer}
                    className='space-y-8'
                >
                    {/* Header - More Professional/Industrial */}
                    <motion.div variants={fadeInUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6">
                        <div>
                            <Link
                                to={`/trip/${tripId}`}
                                className='inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-4 group'
                            >
                                <ArrowLeft className='w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform' />
                                Master Trip Control
                            </Link>
                            <h1 className='text-4xl font-black tracking-tight text-foreground uppercase'>
                                HOS <span className="text-primary">Electronic</span> Logbook
                            </h1>
                            <div className="flex items-center gap-4 mt-2">
                                <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                                    Fleet Asset: TRP-{tripId}
                                </p>
                                <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                <p className='text-[10px] font-black text-muted-foreground uppercase tracking-widest'>
                                    Electronic Record of Duty Status (eRODS)
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            <AchievementBadge type='perfect' earned={achievements.perfect} delay={0.1} />
                            <AchievementBadge type='compliant' earned={achievements.compliant} delay={0.2} />
                            <AchievementBadge type='efficient' earned={achievements.efficient} delay={0.3} />
                            <AchievementBadge type='complete' earned={achievements.complete} delay={0.4} />
                        </div>
                    </motion.div>

                    {/* Logbook Metadata */}
                    <motion.div variants={fadeInUp} transition={{ delay: 0.1 }}>
                        <Card className='border border-border bg-muted/30'>
                            <CardContent className='p-4'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
                                    <div>
                                        <span className='text-muted-foreground font-medium'>
                                            Date:{" "}
                                        </span>
                                        <span className='font-semibold'>
                                            {new Date(
                                                currentLog.date
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-muted-foreground font-medium'>
                                            Trip ID:{" "}
                                        </span>
                                        <span className='font-semibold'>
                                            {tripId}
                                        </span>
                                    </div>
                                    <div>
                                        <span className='text-muted-foreground font-medium'>
                                            Total Segments:{" "}
                                        </span>
                                        <span className='font-semibold'>
                                            {currentLog.segments.length}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Main Content Layout - Switched to a vertical stack or wider grid */}
                    <div className='space-y-8'>
                        {/* Summary Metrics Row */}
                        <motion.div
                            variants={fadeInUp}
                            className="grid grid-cols-1 md:grid-cols-4 gap-4"
                        >
                            <Card className='glass border-white/10 bg-background/40'>
                                <CardContent className='p-4 flex items-center gap-4'>
                                    <div className="p-2.5 bg-blue-500/10 rounded-xl">
                                        <Clock className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Driving</p>
                                        <p className="text-xl font-black">{drivingHours.toFixed(1)} <span className="text-[10px] opacity-40">hrs</span></p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className='glass border-white/10 bg-background/40'>
                                <CardContent className='p-4 flex items-center gap-4'>
                                    <div className="p-2.5 bg-amber-500/10 rounded-xl">
                                        <TrendingUp className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">On-Duty</p>
                                        <p className="text-xl font-black">{onDutyHours.toFixed(1)} <span className="text-[10px] opacity-40">hrs</span></p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className='glass border-white/10 bg-background/40'>
                                <CardContent className='p-4 flex items-center gap-4'>
                                    <div className="p-2.5 bg-purple-500/10 rounded-xl">
                                        <Award className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Compliance</p>
                                        <p className="text-xl font-black">{achievements.compliant ? "PASS" : "FAIL"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <div className="flex bg-muted/20 rounded-xl p-1 items-center">
                                <DayNavigator
                                    currentIndex={currentDayIndex}
                                    totalDays={totalDays}
                                    date={currentLog.date}
                                    onPrevious={handlePreviousDay}
                                    onNext={handleNextDay}
                                />
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Log Graph - Takes most width */}
                            <motion.div
                                className='lg:col-span-9 space-y-8'
                                variants={fadeInUp}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="glass rounded-[2rem] overflow-hidden border-white/10 shadow-2xl p-0">
                                    <LogGraphAnimated
                                        log={currentLog}
                                        width={2400} // Even wider for better resolution
                                        animationKey={`log-${currentDayIndex}`}
                                    />
                                </div>
                            </motion.div>

                            {/* Sidebar - Compact for HOS stats */}
                            <motion.div
                                variants={fadeInUp}
                                transition={{ delay: 0.3 }}
                                className='lg:col-span-3 space-y-6'
                            >
                                <Card className='glass border-white/10 shadow-xl overflow-hidden'>
                                    <div className="bg-primary/5 px-5 py-3 border-b border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Duty Utilization</h3>
                                    </div>
                                    <CardContent className="pt-6">
                                        <div className='space-y-8'>
                                            <div className='flex flex-col items-center'>
                                                <ProgressRing
                                                    progress={Math.min(drivingProgress, 100)}
                                                    size={140}
                                                    strokeWidth={10}
                                                    color='hsl(var(--status-driving))'
                                                    label='Drive Time'
                                                    delay={0.4}
                                                />
                                                <div className='mt-4 text-center'>
                                                    <div className='text-xs font-black uppercase tracking-widest text-muted-foreground mb-1'>Driving Limit</div>
                                                    <div className='text-2xl font-black'>{drivingHours.toFixed(1)} / {maxDrivingHours}h</div>
                                                </div>
                                            </div>
                                            <div className='flex flex-col items-center'>
                                                <ProgressRing
                                                    progress={Math.min(onDutyProgress, 100)}
                                                    size={140}
                                                    strokeWidth={10}
                                                    color='hsl(var(--status-on-duty))'
                                                    label='On-Duty'
                                                    delay={0.5}
                                                />
                                                <div className='mt-4 text-center'>
                                                    <div className='text-xs font-black uppercase tracking-widest text-muted-foreground mb-1'>On-Duty Limit</div>
                                                    <div className='text-2xl font-black'>{onDutyHours.toFixed(1)} / {maxOnDutyHours}h</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
