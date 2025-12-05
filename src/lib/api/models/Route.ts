/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Serializer for route data.
 */
export type Route = {
    /**
     * Encoded polyline string
     */
    polyline: string;
    /**
     * Total distance in miles
     */
    distance_miles: number;
    /**
     * Total driving duration in hours
     */
    duration_hours: number;
    /**
     * Route segments with geometry and instructions
     */
    segments?: any;
};

