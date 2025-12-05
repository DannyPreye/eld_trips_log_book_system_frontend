import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TripForm from "@/components/TripForm/TripForm";
import MapDisplay from "@/components/MapDisplay/MapDisplay";
import { useTripPlan } from "@/hooks/useTripPlan";
import type { TripInputRequest } from "@/lib/api";

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
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto px-4 py-8'>
                <div className='mb-6'>
                    <h1 className='text-3xl font-semibold text-foreground'>
                        ELD Trip Planner
                    </h1>
                    <p className='text-muted-foreground mt-1'>
                        Plan your trip and generate ELD logs
                    </p>
                </div>

                {isError && (
                    <div className='mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-md'>
                        <p className='text-sm text-destructive'>
                            {error?.message ||
                                "Failed to plan trip. Please try again."}
                        </p>
                    </div>
                )}

                <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
                    <div className='flex flex-col col-span-2'>
                        <TripForm
                            onSubmit={handleSubmit}
                            isLoading={isPending}
                        />
                    </div>
                    <div
                        className='flex flex-col col-span-3'
                        style={{ minHeight: "600px", height: "600px" }}
                    >
                        <MapDisplay
                            currentLocation={currentLocation}
                            pickupLocation={pickupLocation}
                            dropoffLocation={dropoffLocation}
                            height='100%'
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
