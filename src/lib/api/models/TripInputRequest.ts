/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for trip planning input.
 */
export type TripInputRequest = {
    /**
     * Current location as {'lat': float, 'lng': float} or address string
     */
    current_location: Record<string, any>;
    /**
     * Pickup location as {'lat': float, 'lng': float} or address string
     */
    pickup_location: Record<string, any>;
    /**
     * Dropoff location as {'lat': float, 'lng': float} or address string
     */
    dropoff_location: Record<string, any>;
    /**
     * Hours already used in current 70-hour cycle
     */
    current_cycle_used_hours: number;
};

