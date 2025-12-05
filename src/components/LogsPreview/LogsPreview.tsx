import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DailyLog } from '@/lib/api'
import { getTripId } from '@/lib/tripHelpers'
import { getLogDrivingHours, getLogOnDutyHours } from '@/lib/tripHelpers'

interface LogsPreviewProps {
  logs: DailyLog[]
  trip: any // Using any to access tripId
}

export default function LogsPreview({ logs, trip }: LogsPreviewProps) {
  const totalDrivingHours = logs.reduce((sum, log) => sum + getLogDrivingHours(log), 0)
  const totalOnDutyHours = logs.reduce((sum, log) => sum + getLogOnDutyHours(log), 0)
  const tripId = getTripId(trip)

  if (logs.length === 0) {
    return null
  }

  const firstLog = logs[0]
  const lastLog = logs[logs.length - 1]

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          ELD Logs Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Driving Hours</div>
            <div className="text-2xl font-bold">{totalDrivingHours.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">hrs</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">On-Duty Hours</div>
            <div className="text-2xl font-bold">{totalOnDutyHours.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">hrs</div>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium">
              {new Date(firstLog.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          {logs.length > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">
                {new Date(lastLog.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Days</span>
            <span className="font-medium">{logs.length}</span>
          </div>
        </div>

        <Link to={`/trip/${tripId}/logs`}>
          <Button variant="outline" className="w-full gap-2">
            <Clock className="w-4 h-4" />
            View Full Logs
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
