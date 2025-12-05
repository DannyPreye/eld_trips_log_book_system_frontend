/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * * `BREAK` - Break
 * * `FUEL` - Fuel Stop
 * * `REST` - Rest Stop
 * * `PICKUP` - Pickup
 * * `DROPOFF` - Dropoff
 */
export const StopTypeEnum = {
    BREAK: 'BREAK',
    FUEL: 'FUEL',
    REST: 'REST',
    PICKUP: 'PICKUP',
    DROPOFF: 'DROPOFF',
} as const;

export type StopTypeEnum = (typeof StopTypeEnum)[ keyof typeof StopTypeEnum ];
