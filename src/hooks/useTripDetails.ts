import { useQuery } from '@tanstack/react-query'
import { TripService } from '@/lib/api'
import type { TripResponse } from '@/lib/api'

export function useTripDetails(tripId: number | null) {
  return useQuery<TripResponse, Error>({
    queryKey: ['trip', tripId],
    queryFn: () => TripService.tripRetrieve(tripId!),
    enabled: tripId !== null,
  })
}

export function useTripLogs(tripId: number | null) {
  return useQuery<TripResponse, Error>({
    queryKey: ['trip', tripId, 'logs'],
    queryFn: () => TripService.tripLogsRetrieve(tripId!),
    enabled: tripId !== null,
  })
}


