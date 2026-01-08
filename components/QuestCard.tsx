import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Play, Globe, Heart, Zap, Star, Leaf, Droplets, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Quest = Database['public']['Tables']['quests']['Row']

interface QuestCardProps {
    quest: Quest
    onStart: (id: number) => void
}

const iconMap: Record<string, any> = {
    globe: Globe,
    heart: Heart,
    zap: Zap,
    star: Star,
    leaf: Leaf,
    droplets: Droplets
}

export function QuestCard({ quest, onStart }: QuestCardProps) {
    const IconComponent = iconMap[quest.icon?.toLowerCase() || 'globe'] || Globe

    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative overflow-hidden rounded-3xl p-6 h-[280px] flex flex-col justify-between text-white shadow-xl bg-gradient-to-br ${quest.bg_gradient_color || 'from-indigo-500 to-purple-600'}`}
        >
            <div className="absolute -top-4 -right-4 opacity-10 rotate-12">
                <IconComponent className="w-40 h-40 text-white" />
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg border border-white/20">
                        <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    {quest.type === 'action' ? (
                        <span className="px-3 py-1 bg-green-500/80 backdrop-blur text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Action</span>
                    ) : (
                        <span className="px-3 py-1 bg-indigo-500/80 backdrop-blur text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">Quiz</span>
                    )}
                </div>

                <h3 className="text-2xl font-bold leading-tight mb-2 tracking-tight">{quest.title}</h3>
                <p className="text-white/80 line-clamp-2 text-sm font-medium leading-relaxed">
                    {quest.description}
                </p>
            </div>

            <div className="relative z-10 mt-auto flex gap-3">
                <Link href={`/learn/${quest.sdg_number}`} className="flex-1">
                    <Button
                        variant="glass"
                        className="w-full justify-center group rounded-xl bg-white/10 hover:bg-white/20 border-white/20"
                    >
                        <BookOpen className="w-5 h-5" />
                    </Button>
                </Link>
                <Button
                    onClick={() => onStart(quest.id)}
                    variant="glass"
                    className="flex-[2] justify-between group rounded-xl"
                >
                    Start
                    <Play className="w-5 h-5 ml-2 fill-current transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </motion.div>
    )
}
