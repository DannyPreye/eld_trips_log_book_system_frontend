import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'

interface CelebrationEffectProps {
  trigger: boolean
  onComplete?: () => void
}

export default function CelebrationEffect({ trigger, onComplete }: CelebrationEffectProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (trigger) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [trigger, onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * 360
        const radius = 100
        const x = Math.cos((angle * Math.PI) / 180) * radius
        const y = Math.sin((angle * Math.PI) / 180) * radius

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: x,
              y: y,
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: 'easeOut',
            }}
            className="absolute"
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </motion.div>
        )
      })}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 1 }}
        className="text-6xl font-bold text-yellow-500"
      >
        🎉
      </motion.div>
    </div>
  )
}


