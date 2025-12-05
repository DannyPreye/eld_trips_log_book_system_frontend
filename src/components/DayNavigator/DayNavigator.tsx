import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { fadeInUp, slideLeft, slideRight, springTransition } from '@/lib/animations'

interface DayNavigatorProps {
  currentIndex: number
  totalDays: number
  date: string
  onPrevious: () => void
  onNext: () => void
}

export default function DayNavigator({
  currentIndex,
  totalDays,
  date,
  onPrevious,
  onNext,
}: DayNavigatorProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="flex items-center justify-center gap-4 mb-8"
    >
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={date}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
          }}
          transition={springTransition}
          className="px-6 py-4 border-2 border-border rounded-lg bg-card min-w-[200px] text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              Day {currentIndex + 1} of {totalDays}
            </span>
          </div>
          <div className="text-lg font-bold text-foreground">{formatShortDate(date)}</div>
          <div className="text-xs text-muted-foreground mt-1">{formatDate(date)}</div>
        </motion.div>
      </AnimatePresence>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="outline"
          onClick={onNext}
          disabled={currentIndex === totalDays - 1}
          className="flex items-center gap-2"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  )
}


