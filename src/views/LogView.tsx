import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import LogGraphAnimated from "@/components/LogGraphAnimated/LogGraphAnimated";
import AnimatedStatsCard from "@/components/AnimatedStatsCard/AnimatedStatsCard";
import ProgressRing from "@/components/ProgressRing/ProgressRing";
import DayNavigator from "@/components/DayNavigator/DayNavigator";
import AchievementBadge from "@/components/AchievementBadge/AchievementBadge";
import CelebrationEffect from "@/components/CelebrationEffect/CelebrationEffect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

    console.log(currentLog);

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
                    {/* Header */}
                    <motion.div variants={fadeInUp}>
                        <Link
                            to={`/trip/${tripId}`}
                            className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4'
                        >
                            <ArrowLeft className='w-4 h-4 mr-1' />
                            Back to Trip Details
                        </Link>
                        <div className='flex items-center justify-between mb-6'>
                            <div>
                                <h1 className='text-4xl font-bold text-foreground mb-2'>
                                    ELD Log Graph
                                </h1>
                                <p className='text-muted-foreground'>
                                    Trip ID: {tripId}
                                </p>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <AchievementBadge
                                    type='perfect'
                                    earned={achievements.perfect}
                                    delay={0.1}
                                />
                                <AchievementBadge
                                    type='compliant'
                                    earned={achievements.compliant}
                                    delay={0.2}
                                />
                                <AchievementBadge
                                    type='efficient'
                                    earned={achievements.efficient}
                                    delay={0.3}
                                />
                                <AchievementBadge
                                    type='complete'
                                    earned={achievements.complete}
                                    delay={0.4}
                                />
                            </div>
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

                    {/* Day Navigator */}
                    <motion.div variants={fadeInUp}>
                        <DayNavigator
                            currentIndex={currentDayIndex}
                            totalDays={totalDays}
                            date={currentLog.date}
                            onPrevious={handlePreviousDay}
                            onNext={handleNextDay}
                        />
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
                        {/* Log Graph */}
                        <motion.div
                            className='col-span-1 lg:col-span-3 h-full'
                            variants={fadeInUp}
                            transition={{ delay: 0.2 }}
                        >
                            <LogGraphAnimated
                                log={currentLog}
                                width={2000}
                                animationKey={`log-${currentDayIndex}`}
                            />
                        </motion.div>

                        {/* Stats Sidebar */}
                        <motion.div
                            variants={fadeInUp}
                            transition={{ delay: 0.3 }}
                            className='space-y-6'
                        >
                            {/* Progress Rings */}
                            <Card className='border border-border'>
                                <CardHeader>
                                    <CardTitle className='flex items-center gap-2'>
                                        <TrendingUp className='w-5 h-5' />
                                        Compliance Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='grid grid-cols-2 gap-6'>
                                        <div className='flex flex-col items-center'>
                                            <ProgressRing
                                                progress={Math.min(
                                                    drivingProgress,
                                                    100
                                                )}
                                                size={100}
                                                strokeWidth={8}
                                                color='hsl(var(--status-driving))'
                                                label='Driving'
                                                delay={0.4}
                                            />
                                            <div className='mt-3 text-center'>
                                                <div className='text-lg font-bold'>
                                                    {drivingHours.toFixed(1)}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>
                                                    of {maxDrivingHours} hrs
                                                </div>
                                            </div>
                                        </div>
                                        <div className='flex flex-col items-center'>
                                            <ProgressRing
                                                progress={Math.min(
                                                    onDutyProgress,
                                                    100
                                                )}
                                                size={100}
                                                strokeWidth={8}
                                                color='hsl(var(--status-on-duty))'
                                                label='On-Duty'
                                                delay={0.5}
                                            />
                                            <div className='mt-3 text-center'>
                                                <div className='text-lg font-bold'>
                                                    {onDutyHours.toFixed(1)}
                                                </div>
                                                <div className='text-xs text-muted-foreground'>
                                                    of {maxOnDutyHours} hrs
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Stats Cards */}
                            <div className='grid grid-cols-1 gap-4'>
                                <AnimatedStatsCard
                                    label='Driving Hours'
                                    value={drivingHours}
                                    unit='hrs'
                                    icon={Clock}
                                    color='blue'
                                    delay={0.6}
                                />
                                <AnimatedStatsCard
                                    label='On-Duty Hours'
                                    value={onDutyHours}
                                    unit='hrs'
                                    icon={Award}
                                    color='green'
                                    delay={0.7}
                                />
                            </div>

                            {/* Segments Info */}
                            <motion.div
                                variants={fadeInUp}
                                transition={{ delay: 0.8 }}
                            >
                                <Card className='border border-border'>
                                    <CardHeader>
                                        <CardTitle className='text-sm flex items-center gap-2'>
                                            <Award className='w-4 h-4' />
                                            Log Segments
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-3'>
                                            <motion.div
                                                className='flex justify-between text-sm'
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.9 }}
                                            >
                                                <span className='text-muted-foreground'>
                                                    Total Segments
                                                </span>
                                                <span className='font-semibold'>
                                                    {currentLog.segments.length}
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                className='flex justify-between text-sm'
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.0 }}
                                            >
                                                <span className='text-muted-foreground'>
                                                    Status Changes
                                                </span>
                                                <span className='font-semibold'>
                                                    {
                                                        currentLog.segments.filter(
                                                            (s, i, arr) =>
                                                                i === 0 ||
                                                                s.status !==
                                                                    arr[i - 1]
                                                                        .status
                                                        ).length
                                                    }
                                                </span>
                                            </motion.div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
