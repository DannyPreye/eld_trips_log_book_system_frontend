import { MapPin, Clock, Calendar, Navigation } from 'lucide-react'
import MetricCard from '@/components/MetricCard/MetricCard'
import type { TripResponse } from '@/lib/api'
import { getTotalDistance, getDurationHours, getTotalDays } from '@/lib/tripHelpers'

interface StatsCardProps {
  trip: TripResponse
}

export default function StatsCard({ trip }: StatsCardProps) {
  const totalDays = getTotalDays(trip)
  const totalMiles = getTotalDistance(trip)
  const totalHours = getDurationHours(trip)
  const totalStops = trip.stops?.length || 0

  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        icon={MapPin}
        value={totalMiles.toFixed(1)}
        label="Total Distance"
        unit="mi"
        color="blue"
      />
      <MetricCard
        icon={Clock}
        value={totalHours < 1 ? Math.round(totalHours * 60).toString() : totalHours.toFixed(1)}
        label="Duration"
        unit={totalHours < 1 ? 'min' : 'hrs'}
        color="green"
      />
      <MetricCard
        icon={Calendar}
        value={totalDays.toString()}
        label="Days"
        unit=""
        color="purple"
      />
      <MetricCard
        icon={Navigation}
        value={totalStops.toString()}
        label="Stops"
        unit=""
        color="orange"
      />
    </div>
  )
}
