import type { TripResponse } from '@/lib/api'

// Extended type to match actual backend response
export interface ExtendedTripResponse {
  tripId?: number
  id?: number
  route?: {
    polyline?: string
    distanceMiles?: number
    distance_miles?: number
    durationHours?: number
    duration_hours?: number
    segments?: any[]
  }
  logs?: Array<{
    date: string
    segments?: any[]
    totals?: {
      drivingHours?: number
      onDutyHours?: number
    }
    driving_hours?: number
    on_duty_hours?: number
  }>
  stops?: any[]
  meta?: {
    totalDays?: number
    totalDistanceMiles?: number
  }
}

type TripData = TripResponse & ExtendedTripResponse

/**
 * Get trip ID from response (handles both tripId and id)
 */
export function getTripId(trip: TripData): number {
  return (trip as any).tripId ?? trip.id ?? 0
}

/**
 * Get total distance in miles (checks meta, route.distanceMiles, route.distance_miles)
 */
export function getTotalDistance(trip: TripData): number {
  if ((trip as any).meta?.totalDistanceMiles !== undefined) {
    return (trip as any).meta.totalDistanceMiles
  }
  const route = trip.route as any
  return route?.distanceMiles ?? route?.distance_miles ?? trip.route?.distance_miles ?? 0
}

/**
 * Get duration in hours (checks route.durationHours, route.duration_hours)
 */
export function getDurationHours(trip: TripData): number {
  const route = trip.route as any
  return route?.durationHours ?? route?.duration_hours ?? trip.route?.duration_hours ?? 0
}

/**
 * Get total days (checks meta.totalDays, falls back to logs.length)
 */
export function getTotalDays(trip: TripData): number {
  if ((trip as any).meta?.totalDays !== undefined) {
    return (trip as any).meta.totalDays
  }
  return trip.logs?.length || 0
}

/**
 * Get driving hours from a log (checks totals.drivingHours, falls back to driving_hours)
 */
export function getLogDrivingHours(log: any): number {
  if (log.totals?.drivingHours !== undefined) {
    return log.totals.drivingHours
  }
  return log.driving_hours ?? 0
}

/**
 * Get on-duty hours from a log (checks totals.onDutyHours, falls back to on_duty_hours)
 */
export function getLogOnDutyHours(log: any): number {
  if (log.totals?.onDutyHours !== undefined) {
    return log.totals.onDutyHours
  }
  return log.on_duty_hours ?? 0
}

/**
 * Get total driving hours across all logs
 */
export function getTotalDrivingHours(trip: TripData): number {
  if (!trip.logs) return 0
  return trip.logs.reduce((sum, log) => sum + getLogDrivingHours(log), 0)
}

/**
 * Get total on-duty hours across all logs
 */
export function getTotalOnDutyHours(trip: TripData): number {
  if (!trip.logs) return 0
  return trip.logs.reduce((sum, log) => sum + getLogOnDutyHours(log), 0)
}

/**
 * Get route segments with steps
 */
export function getRouteSegments(trip: TripData): any[] {
  const route = trip.route as any
  return route?.segments || []
}

/**
 * Get route steps from all segments (flattened)
 */
export function getRouteSteps(trip: TripData): any[] {
  const segments = getRouteSegments(trip)
  if (segments.length === 0) return []
  // Flatten all steps from all segments into a single array
  return segments.flatMap((segment) => segment?.steps || [])
}

