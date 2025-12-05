import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Zap, Calendar, Target, Award } from 'lucide-react'
import type { TripResponse } from '@/lib/api'
import {
  getTotalDistance,
  getDurationHours,
  getTotalDays,
  getTotalDrivingHours,
} from '@/lib/tripHelpers'

interface AchievementBadgesProps {
  trip: TripResponse
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: typeof Trophy
  color: string
  earned: boolean
}

export default function AchievementBadges({ trip }: AchievementBadgesProps) {
  const distanceMiles = getTotalDistance(trip)
  const durationHours = getDurationHours(trip)
  const totalDays = getTotalDays(trip)
  const totalDrivingHours = getTotalDrivingHours(trip)
  const efficiency = durationHours > 0 ? totalDrivingHours / durationHours : 0

  const achievements: Achievement[] = [
    {
      id: 'long-haul',
      name: 'Long Haul',
      description: 'Trip over 100 miles',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      earned: distanceMiles > 100,
    },
    {
      id: 'speed-demon',
      name: 'Speed Demon',
      description: 'Completed in under 1 hour',
      icon: Zap,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      earned: durationHours < 1,
    },
    {
      id: 'multi-day',
      name: 'Multi-Day Warrior',
      description: 'Trip spanning multiple days',
      icon: Calendar,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      earned: totalDays > 1,
    },
    {
      id: 'efficient',
      name: 'Efficient Driver',
      description: 'High driving efficiency',
      icon: Target,
      color: 'text-green-600 bg-green-50 border-green-200',
      earned: efficiency > 0.8 && durationHours > 0,
    },
    {
      id: 'compliant',
      name: 'Perfect Compliance',
      description: 'HOS compliant trip',
      icon: Award,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
      earned: totalDrivingHours <= 11 && totalDays > 0,
    },
  ]

  const earnedAchievements = achievements.filter((a) => a.earned)

  if (earnedAchievements.length === 0) {
    return null
  }

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-600" />
          Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {earnedAchievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${achievement.color}`}
              >
                <div className="flex items-start gap-2">
                  <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{achievement.name}</div>
                    <div className="text-xs opacity-70">{achievement.description}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
