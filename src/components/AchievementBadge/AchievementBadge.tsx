import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Trophy, CheckCircle, Star, Award } from 'lucide-react'
import { scaleIn, springTransition, defaultTransition } from '@/lib/animations'

interface AchievementBadgeProps {
  type: 'perfect' | 'compliant' | 'efficient' | 'complete'
  earned: boolean
  delay?: number
}

const achievementConfig = {
  perfect: {
    icon: Trophy,
    label: 'Perfect Day',
    description: '100% compliance',
    color: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    iconColor: 'text-yellow-600',
  },
  compliant: {
    icon: CheckCircle,
    label: 'HOS Compliant',
    description: 'Within limits',
    color: 'bg-green-50 border-green-300 text-green-700',
    iconColor: 'text-green-600',
  },
  efficient: {
    icon: Star,
    label: 'Efficient',
    description: 'Optimal driving',
    color: 'bg-blue-50 border-blue-300 text-blue-700',
    iconColor: 'text-blue-600',
  },
  complete: {
    icon: Award,
    label: 'Complete',
    description: 'All segments logged',
    color: 'bg-purple-50 border-purple-300 text-purple-700',
    iconColor: 'text-purple-600',
  },
}

export default function AchievementBadge({
  type,
  earned,
  delay = 0,
}: AchievementBadgeProps) {
  if (!earned) return null

  const config = achievementConfig[type]
  const Icon = config.icon

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="inline-block"
    >
      <Badge
        variant="outline"
        className={`${config.color} border-2 px-3 py-1.5 flex items-center gap-2`}
      >
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
        <div className="flex flex-col">
          <span className="text-xs font-semibold leading-tight">{config.label}</span>
          <span className="text-[10px] opacity-70 leading-tight">{config.description}</span>
        </div>
      </Badge>
    </motion.div>
  )
}

