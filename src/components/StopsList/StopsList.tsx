import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Stop } from '@/lib/api'
import { StopTypeEnum } from '@/lib/api'

interface StopsListProps {
  stops: Stop[]
}

const stopTypeLabels: Record<StopTypeEnum, string> = {
  [StopTypeEnum.BREAK]: 'Break',
  [StopTypeEnum.FUEL]: 'Fuel',
  [StopTypeEnum.REST]: 'Rest',
  [StopTypeEnum.PICKUP]: 'Pickup',
  [StopTypeEnum.DROPOFF]: 'Dropoff',
}

const stopTypeColors: Record<StopTypeEnum, string> = {
  [StopTypeEnum.BREAK]: 'bg-blue-100 text-blue-800',
  [StopTypeEnum.FUEL]: 'bg-red-100 text-red-800',
  [StopTypeEnum.REST]: 'bg-purple-100 text-purple-800',
  [StopTypeEnum.PICKUP]: 'bg-green-100 text-green-800',
  [StopTypeEnum.DROPOFF]: 'bg-orange-100 text-orange-800',
}

function formatTime(timeString: string): string {
  const date = new Date(timeString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function StopsList({ stops }: StopsListProps) {
  if (stops.length === 0) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle>Stops</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No stops scheduled</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Stops</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div key={index}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={stopTypeColors[stop.stop_type]}>
                      {stopTypeLabels[stop.stop_type]}
                    </Badge>
                    <span className="text-sm font-medium">{formatTime(stop.time)}</span>
                  </div>
                  {stop.location && (
                    <p className="text-sm text-muted-foreground">{stop.location}</p>
                  )}
                  {stop.remarks && (
                    <p className="text-sm text-muted-foreground">{stop.remarks}</p>
                  )}
                </div>
              </div>
              {index < stops.length - 1 && <Separator className="mt-3" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


