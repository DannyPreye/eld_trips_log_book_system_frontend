import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { useEffect } from 'react'
import { scaleIn, defaultTransition } from '@/lib/animations'

interface AnimatedStatsCardProps {
  label: string
  value: number
  unit: string
  icon?: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'orange' | 'purple'
  delay?: number
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-700',
  green: 'bg-green-50 border-green-200 text-green-700',
  orange: 'bg-orange-50 border-orange-200 text-orange-700',
  purple: 'bg-purple-50 border-purple-200 text-purple-700',
}

export default function AnimatedStatsCard({
  label,
  value,
  unit,
  icon: Icon,
  color = 'blue',
  delay = 0,
}: AnimatedStatsCardProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  })
  const displayValue = useTransform(springValue, (latest) => latest.toFixed(1))

  useEffect(() => {
    const timer = setTimeout(() => {
      motionValue.set(value)
    }, delay * 100)
    return () => clearTimeout(timer)
  }, [value, motionValue, delay])

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ ...defaultTransition, delay }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="h-full"
    >
      <Card className={`border-2 transition-all ${colorClasses[color]} h-full`}>
        <CardContent className="p-6">
          {Icon && (
            <motion.div
              className="mb-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
            >
              <Icon className={`w-8 h-8 ${colorClasses[color].split(' ')[2]}`} />
            </motion.div>
          )}
          <div className="space-y-1">
            <div className="text-sm font-medium opacity-60">{label}</div>
            <div className="flex items-baseline gap-2">
              <motion.div className="text-3xl font-bold">
                {displayValue}
              </motion.div>
              <span className="text-lg font-medium opacity-70">{unit}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

