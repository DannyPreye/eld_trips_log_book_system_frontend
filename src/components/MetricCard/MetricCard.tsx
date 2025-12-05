import { Card, CardContent } from '@/components/ui/card'
import { type LucideProps } from 'lucide-react'

interface MetricCardProps {
  icon: React.ComponentType<LucideProps>
  value: string
  label: string
  unit?: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  progress?: number
}

const colorClasses = {
  blue: {
    card: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: 'text-blue-600',
    progress: 'bg-blue-500',
  },
  green: {
    card: 'bg-green-50 border-green-200 text-green-700',
    icon: 'text-green-600',
    progress: 'bg-green-500',
  },
  orange: {
    card: 'bg-orange-50 border-orange-200 text-orange-700',
    icon: 'text-orange-600',
    progress: 'bg-orange-500',
  },
  purple: {
    card: 'bg-purple-50 border-purple-200 text-purple-700',
    icon: 'text-purple-600',
    progress: 'bg-purple-500',
  },
  red: {
    card: 'bg-red-50 border-red-200 text-red-700',
    icon: 'text-red-600',
    progress: 'bg-red-500',
  },
}

export default function MetricCard({
  icon: Icon,
  value,
  label,
  unit,
  color = 'blue',
  progress,
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <Card className={`border-2 transition-all hover:shadow-md ${colors.card}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-lg bg-white/50">
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          {progress !== undefined && (
            <div className="text-xs font-medium opacity-70">{progress}%</div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-3xl font-bold">{value}</div>
          {unit && <span className="text-lg font-medium opacity-70">{unit}</span>}
          <div className="text-sm font-medium opacity-60">{label}</div>
        </div>
        {progress !== undefined && (
          <div className="mt-4 h-2 bg-white/50 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors.progress} transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
