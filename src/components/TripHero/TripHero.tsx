import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { TripResponse } from '@/lib/api'
import { getTripId, getTotalDistance, getDurationHours, getTotalDays } from '@/lib/tripHelpers'

interface TripHeroProps {
  trip: TripResponse
}

export default function TripHero({ trip }: TripHeroProps) {
  const tripId = getTripId(trip)
  const distanceMiles = getTotalDistance(trip)
  const durationHours = getDurationHours(trip)
  const totalDays = getTotalDays(trip)

  return (
    <div className="relative overflow-hidden border border-border rounded-lg bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-4xl font-bold text-foreground break-words">Trip #{tripId}</h1>
              <Badge variant="outline" className="text-sm flex-shrink-0">
                {totalDays === 1 ? 'Single Day' : `${totalDays} Days`}
              </Badge>
            </div>
            <p className="text-sm md:text-base text-muted-foreground">
              Planned and optimized route with ELD compliance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            <Link to={`/trip/${tripId}/logs`} className="w-full sm:w-auto">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">View ELD Logs</span>
                <span className="sm:hidden">Logs</span>
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Total Distance</div>
            <div className="text-3xl font-bold">{distanceMiles.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">miles</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="text-3xl font-bold">
              {durationHours < 1
                ? `${Math.round(durationHours * 60)}`
                : durationHours.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">
              {durationHours < 1 ? 'minutes' : 'hours'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Stops</div>
            <div className="text-3xl font-bold">{trip.stops?.length || 0}</div>
            <div className="text-sm text-muted-foreground">planned</div>
          </div>
        </div>
      </div>
    </div>
  )
}
