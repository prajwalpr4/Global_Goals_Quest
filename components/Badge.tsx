import { motion } from 'framer-motion'
import { Award, Zap, Anchor, Sun, Footprints, Star } from 'lucide-react'

// Map of icon names to components
const iconMap: Record<string, any> = {
    award: Award,
    zap: Zap,
    anchor: Anchor,
    sun: Sun,
    footprints: Footprints,
    star: Star
}

interface BadgeProps {
    title: string
    description?: string
    icon: string
    isUnlocked: boolean
}

export function Badge({ title, description, icon, isUnlocked }: BadgeProps) {
    const IconComponent = iconMap[icon] || Award

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className={`relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${isUnlocked
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200 shadow-sm'
                    : 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                }`}
        >
            <div className={`
        h-14 w-14 rounded-full flex items-center justify-center mb-3
        ${isUnlocked ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-amber-500/30 shadow-lg' : 'bg-slate-200'}
      `}>
                <IconComponent className={`w-7 h-7 ${isUnlocked ? 'text-white' : 'text-slate-400'}`} />
            </div>

            <h4 className={`text-sm font-bold ${isUnlocked ? 'text-amber-900' : 'text-slate-500'}`}>{title}</h4>
            {isUnlocked && description && (
                <p className="text-xs text-amber-700/70 mt-1 line-clamp-2">{description}</p>
            )}

            {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-white/80 backdrop-blur-sm rounded-2xl transition-opacity duration-200">
                    <span className="text-xs font-bold text-slate-500 px-2">Locked</span>
                </div>
            )}
        </motion.div>
    )
}
