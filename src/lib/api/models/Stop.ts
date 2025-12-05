/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { StopTypeEnum } from './StopTypeEnum';
/**
 * Serializer for stops.
 */
export type Stop = {
    stop_type: StopTypeEnum;
    time: string;
    location?: string;
    remarks?: string;
};

