import { useParams, Link } from "react-router-dom";
import MapDisplay from "@/components/MapDisplay/MapDisplay";
import StatsCard from "@/components/StatsCard/StatsCard";
import StopsList from "@/components/StopsList/StopsList";
import TimelineSummary from "@/components/TimelineSummary/TimelineSummary";
import AchievementBadges from "@/components/AchievementBadges/AchievementBadges";
import RouteSteps from "@/components/RouteSteps/RouteSteps";
import TripHero from "@/components/TripHero/TripHero";
import LogsPreview from "@/components/LogsPreview/LogsPreview";
import { Button } from "@/components/ui/button";
import { useTripDetails } from "@/hooks/useTripDetails";
import { ArrowLeft } from "lucide-react";
import { getTripId } from "@/lib/tripHelpers";

export default function TripDetails() {
    const { id } = useParams<{ id: string }>();
    const tripId = id ? parseInt(id, 10) : null;
    const { data: trip, isLoading, isError, error } = useTripDetails(tripId);

    if (isLoading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-muted-foreground'>
                    Loading trip details...
                </div>
            </div>
        );
    }

    if (isError || !trip) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-destructive mb-4'>
                        {error?.message || "Failed to load trip details"}
                    </p>
                    <Link to='/'>
                        <Button variant='outline'>Back to Trip Planner</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const actualTripId = getTripId(trip);

    // Extract locations from route polyline or stops
    const pickupStop = trip.stops?.find((s) => s.stop_type === "PICKUP");
    const dropoffStop = trip.stops?.find((s) => s.stop_type === "DROPOFF");

    // Try to extract coordinates from stop locations if available
    const getLocationFromStop = (stop: typeof pickupStop) => {
        if (!stop?.location) return undefined;
        const match = stop.location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
        if (match) {
            return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
        }
        return undefined;
    };

    const pickupLocation = getLocationFromStop(pickupStop);
    const dropoffLocation = getLocationFromStop(dropoffStop);

    // Check if meta data exists
    const meta = (trip as any).meta;

    console.log(trip);

    return (
        <div className='min-h-screen bg-background overflow-x-hidden'>
            <div className='container mx-auto px-4 py-8 max-w-[1920px]'>
                <Link
                    to='/'
                    className='inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6'
                >
                    <ArrowLeft className='w-4 h-4 mr-1' />
                    Back to Trip Planner
                </Link>

                {/* Hero Section */}
                <TripHero trip={trip} />

                {/* Meta Information Banner */}
                {meta && (
                    <div className='mt-4 p-4 bg-muted/50 border border-border rounded-lg'>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm'>
                            <span className='text-muted-foreground'>
                                Trip Summary
                            </span>
                            <div className='flex flex-wrap gap-3 sm:gap-4'>
                                {meta.totalDays !== undefined && (
                                    <span className='whitespace-nowrap'>
                                        <span className='font-semibold'>
                                            {meta.totalDays}
                                        </span>{" "}
                                        day{meta.totalDays !== 1 ? "s" : ""}
                                    </span>
                                )}
                                {meta.totalDistanceMiles !== undefined && (
                                    <span className='whitespace-nowrap'>
                                        <span className='font-semibold'>
                                            {meta.totalDistanceMiles.toFixed(1)}
                                        </span>{" "}
                                        miles
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 mt-6'>
                    {/* Left Column - Map and Route */}
                    <div className='space-y-4 md:space-y-6 min-w-0 col-span-3'>
                        {/* Map */}
                        <div
                            className='flex flex-col w-full md:min-h-[600px] md:h-[600px]'
                            style={{ minHeight: "400px", height: "400px" }}
                        >
                            <MapDisplay
                                route={trip.route}
                                stops={trip.stops}
                                pickupLocation={pickupLocation}
                                dropoffLocation={dropoffLocation}
                                height='100%'
                            />
                        </div>

                        {/* Route Steps */}
                        {trip.route && (
                            <RouteSteps route={trip.route} trip={trip} />
                        )}
                        {/* Logs Preview */}
                        <LogsPreview logs={trip.logs} trip={trip} />
                    </div>

                    {/* Right Column - Stats, Achievements, Timeline */}
                    <div className='space-y-4 md:space-y-6 min-w-0'>
                        {/* Stats Cards */}
                        <StatsCard trip={trip} />

                        {/* Achievements */}
                        <AchievementBadges trip={trip} />

                        {/* Timeline Summary */}
                        <TimelineSummary logs={trip.logs} />

                        {/* Stops List */}
                        {trip.stops && trip.stops.length > 0 && (
                            <StopsList stops={trip.stops} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
