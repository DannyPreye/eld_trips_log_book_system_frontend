import { useMutation } from '@tanstack/react-query'
import { TripService } from '@/lib/api'
import type { TripInputRequest, TripResponse } from '@/lib/api'

export function useTripPlan() {
  return useMutation<TripResponse, Error, TripInputRequest>({
    mutationFn: (data: TripInputRequest) => TripService.tripPlanCreate(data),
  })
}


