import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface ProgressCardProps {
  title: string
  current: number
  max: number
  unit: string
  color?: 'blue' | 'green' | 'orange' | 'purple'
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
}

export default function ProgressCard({
  title,
  current,
  max,
  unit,
  color = 'blue',
}: ProgressCardProps) {
  const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold">{current.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">
            / {max.toFixed(1)} {unit}
          </div>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${colorClasses[color]} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {percentage.toFixed(0)}% complete
        </div>
      </CardContent>
    </Card>
  )
}



