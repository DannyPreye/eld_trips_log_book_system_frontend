/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TripInputRequest } from '../models/TripInputRequest';
import type { TripResponse } from '../models/TripResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TripService {
    /**
     * GET /api/trip/{id}
     *
     * Fetch complete trip details.
     * @param tripId
     * @returns TripResponse
     * @throws ApiError
     */
    public static tripRetrieve(
        tripId: number,
    ): CancelablePromise<TripResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/trip/{trip_id}',
            path: {
                'trip_id': tripId,
            },
            errors: {
                404: `Trip not found`,
            },
        });
    }
    /**
     * GET /api/trip/{id}/logs
     *
     * Returns structured logs for frontend rendering.
     * @param tripId
     * @returns TripResponse
     * @throws ApiError
     */
    public static tripLogsRetrieve(
        tripId: number,
    ): CancelablePromise<TripResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/trip/{trip_id}/logs',
            path: {
                'trip_id': tripId,
            },
            errors: {
                404: `Trip not found`,
            },
        });
    }
    /**
     * POST /api/trip/plan
     *
     * Process trip input:
     * 1. Validate input
     * 2. Geocode locations
     * 3. Fetch route from OpenRouteService
     * 4. Run HOS engine
     * 5. Slice into daily logs
     * 6. Map grid indices
     * 7. Save to database
     * 8. Return structured response
     * @param requestBody
     * @returns TripResponse
     * @throws ApiError
     */
    public static tripPlanCreate(
        requestBody: TripInputRequest,
    ): CancelablePromise<TripResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/trip/plan',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                500: `Server error`,
            },
        });
    }
}
