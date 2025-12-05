/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DailyLogSegment } from './DailyLogSegment';
/**
 * Serializer for daily log sheets.
 */
export type DailyLog = {
    /**
     * Date of the log sheet (YYYY-MM-DD)
     */
    date: string;
    readonly segments: Array<DailyLogSegment>;
    /**
     * Total driving hours for this day
     */
    driving_hours?: number;
    /**
     * Total on-duty hours for this day
     */
    on_duty_hours?: number;
};

