'use client'

import { motion } from 'framer-motion'
import { Sprout, TreeDeciduous, TreePine, Circle } from 'lucide-react'

interface VirtualGardenProps {
    xp: number
}

export function VirtualGarden({ xp }: VirtualGardenProps) {
    // Growth Logic
    const getStage = (xp: number) => {
        if (xp < 100) return {
            stage: 1,
            name: 'Seed',
            icon: Circle,
            color: 'text-amber-700',
            next: 100,
            scale: 0.5
        }
        if (xp < 500) return {
            stage: 2,
            name: 'Sprout',
            icon: Sprout,
            color: 'text-green-400',
            next: 500,
            scale: 0.8
        }
        if (xp < 1000) return {
            stage: 3,
            name: 'Sapling',
            icon: TreeDeciduous,
            color: 'text-green-500',
            next: 1000,
            scale: 1
        }
        return {
            stage: 4,
            name: 'Full Tree',
            icon: TreePine,
            color: 'text-green-700',
            next: null,
            scale: 1.2
        }
    }

    const { stage, name, icon: Icon, color, next, scale } = getStage(xp)

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-white/50 dark:border-slate-700 shadow-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                <span className="text-2xl">🌱</span> Virtual Garden
            </h3>

            {/* Garden Scene */}
            <div className="relative w-40 h-40 flex items-end justify-center mb-4">

                {/* Plant Animation */}
                <motion.div
                    key={stage} // Triggers animation on stage change
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: scale, y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 100,
                        damping: 10,
                        duration: 0.8
                    }}
                    className={`z-10 relative bottom-8 ${color}`}
                >
                    <Icon className="w-24 h-24 drop-shadow-lg" strokeWidth={1.5} />
                </motion.div>

                {/* Pot */}
                <div className="absolute bottom-0 w-24 h-20 bg-amber-700 dark:bg-amber-800 rounded-b-3xl rounded-t-sm shadow-xl flex items-center justify-center border-t-4 border-amber-900/30">
                    <div className="w-16 h-1 mt-2 bg-amber-900/20 rounded-full blur-sm"></div>
                </div>

                {/* Soil/Ground */}
                <div className="absolute bottom-16 w-20 h-4 bg-amber-900/60 rounded-full blur-[2px] z-0"></div>
            </div>

            {/* Status & Progress */}
            <div className="text-center space-y-2 w-full max-w-[200px]">
                <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <span>{name}</span>
                    <span>Stage {stage}/4</span>
                </div>

                {next ? (
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                        <div
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${(xp / next) * 100}%` }}
                        ></div>
                        <p className="text-[10px] text-slate-400 mt-1">{xp} / {next} XP to grow</p>
                    </div>
                ) : (
                    <div className="text-xs text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/30 py-1 px-3 rounded-full">
                        Fully Grown! 🌳
                    </div>
                )}
            </div>
        </div>
    )
}
