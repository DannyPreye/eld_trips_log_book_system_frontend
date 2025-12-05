import { motion, AnimatePresence } from "framer-motion";
import type { DailyLog } from "@/lib/api";
import LogGraph from "@/components/LogGraph/LogGraph";

interface LogGraphAnimatedProps {
    log: DailyLog;
    width?: number;
    height?: number;
    animationKey?: string;
}

export default function LogGraphAnimated({
    log,
    width = 2000, // Increased default width for better spacing
    height, // Let LogGraph calculate its own height
    animationKey,
}: LogGraphAnimatedProps) {
    return (
        <AnimatePresence mode='wait'>
            <motion.div
                key={animationKey || log.date}
                initial='hidden'
                animate='visible'
                exit='exit'
                variants={{
                    hidden: { opacity: 0, scale: 0.95 },
                    visible: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 1.05 },
                }}
                transition={{
                    duration: 0.6,
                    ease: [0.43, 0.13, 0.23, 0.96] as [
                        number,
                        number,
                        number,
                        number
                    ],
                }}
                className='w-full'
            >
                <div className='bg-white border border-border rounded-lg p-6 overflow-x-auto'>
                    <LogGraph log={log} width={width} height={height} />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
