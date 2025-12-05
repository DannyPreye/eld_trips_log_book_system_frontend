/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyLog } from './DailyLog';
import type { Route } from './Route';
import type { Stop } from './Stop';
/**
 * Serializer for complete trip response.
 */
export type TripResponse = {
    readonly id: number;
    readonly route: Route;
    readonly logs: Array<DailyLog>;
    readonly stops: Array<Stop>;
};

