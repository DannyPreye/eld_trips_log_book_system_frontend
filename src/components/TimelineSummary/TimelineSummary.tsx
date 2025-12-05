import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ProgressCard from '@/components/ProgressCard/ProgressCard'
import { Clock } from 'lucide-react'
import type { DailyLog } from '@/lib/api'
import { getLogDrivingHours, getLogOnDutyHours } from '@/lib/tripHelpers'

interface TimelineSummaryProps {
  logs: DailyLog[]
}

export default function TimelineSummary({ logs }: TimelineSummaryProps) {
  const totalDrivingHours = logs.reduce((sum, log) => sum + getLogDrivingHours(log), 0)
  const totalOnDutyHours = logs.reduce((sum, log) => sum + getLogOnDutyHours(log), 0)
  const maxDrivingHours = 11 // HOS limit
  const maxOnDutyHours = 14 // HOS limit

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timeline Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressCard
          title="Driving Hours"
          current={totalDrivingHours}
          max={maxDrivingHours}
          unit="hrs"
          color="blue"
        />
        <ProgressCard
          title="On-Duty Hours"
          current={totalOnDutyHours}
          max={maxOnDutyHours}
          unit="hrs"
          color="green"
        />
        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Days</span>
            <span className="text-lg font-semibold">{logs.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
