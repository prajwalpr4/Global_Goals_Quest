'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Sparkles, Trophy, Lightbulb, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import confetti from 'canvas-confetti'

interface DailyMysteryBoxProps {
    userId: string
    currentXP: number
    onRewardClaimed: (newXP: number, newAvatar?: string) => void
}

type RewardType = 'xp' | 'avatar' | 'fact'

interface Reward {
    type: RewardType
    value: number | string
    message: string
}

const RARE_AVATARS = [
    '👑', '🤖', '🦸', '🧙', '🦄', '🐉', '🦅', '🌟', '💎', '🏆'
]

const SDG_FACTS = [
    "Bees can see ultraviolet light and are essential pollinators for 75% of crops!",
    "A single tree can absorb 48 pounds of CO2 per year!",
    "The ocean produces over 50% of the world's oxygen!",
    "Recycling one aluminum can saves enough energy to run a TV for 3 hours!",
    "Solar energy hitting Earth in one hour could power the world for a year!",
    "Bamboo can grow up to 3 feet in just 24 hours!",
    "Electric cars produce 50% less CO2 than gas cars over their lifetime!",
    "Coral reefs support 25% of all marine species despite covering less than 1% of the ocean!"
]

export function DailyMysteryBox({ userId, currentXP, onRewardClaimed }: DailyMysteryBoxProps) {
    const [canOpen, setCanOpen] = useState(false)
    const [isSpinning, setIsSpinning] = useState(false)
    const [showReward, setShowReward] = useState(false)
    const [reward, setReward] = useState<Reward | null>(null)
    const [timeRemaining, setTimeRemaining] = useState('')
    const [loading, setLoading] = useState(true)

    const supabase = createClient()

    // Check if user can open the box
    useEffect(() => {
        const checkBoxStatus = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('last_box_open_at')
                .eq('id', userId)
                .single()

            if (data) {
                const lastOpen = data.last_box_open_at
                if (!lastOpen) {
                    setCanOpen(true)
                } else {
                    const lastOpenTime = new Date(lastOpen).getTime()
                    const now = Date.now()
                    const hoursPassed = (now - lastOpenTime) / (1000 * 60 * 60)

                    if (hoursPassed >= 24) {
                        setCanOpen(true)
                    } else {
                        setCanOpen(false)
                    }
                }
            }
            setLoading(false)
        }

        checkBoxStatus()
    }, [userId, supabase])

    // Countdown timer
    useEffect(() => {
        if (canOpen || loading) return

        const updateCountdown = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('last_box_open_at')
                .eq('id', userId)
                .single()

            if (data?.last_box_open_at) {
                const lastOpen = new Date(data.last_box_open_at).getTime()
                const nextOpen = lastOpen + (24 * 60 * 60 * 1000)
                const now = Date.now()
                const diff = nextOpen - now

                if (diff <= 0) {
                    setCanOpen(true)
                    return
                }

                const hours = Math.floor(diff / (1000 * 60 * 60))
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((diff % (1000 * 60)) / 1000)

                setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
            }
        }

        updateCountdown()
        const interval = setInterval(updateCountdown, 1000)

        return () => clearInterval(interval)
    }, [canOpen, loading, userId, supabase])

    // Generate random reward
    const generateReward = (): Reward => {
        const random = Math.random()

        if (random < 0.3) {
            // 30% - Rare Avatar
            const avatar = RARE_AVATARS[Math.floor(Math.random() * RARE_AVATARS.length)]
            return {
                type: 'avatar',
                value: avatar,
                message: `You unlocked a rare avatar: ${avatar}`
            }
        } else if (random < 0.8) {
            // 50% - XP Boost
            const xpBoost = Math.floor(Math.random() * 51) + 50 // 50-100 XP
            return {
                type: 'xp',
                value: xpBoost,
                message: `You earned ${xpBoost} XP!`
            }
        } else {
            // 20% - Secret Fact
            const fact = SDG_FACTS[Math.floor(Math.random() * SDG_FACTS.length)]
            return {
                type: 'fact',
                value: fact,
                message: 'You discovered a secret fact!'
            }
        }
    }

    // Handle box opening
    const handleOpenBox = async () => {
        if (!canOpen || isSpinning) return

        setIsSpinning(true)

        // Generate reward
        const newReward = generateReward()

        // Wait for animation
        setTimeout(async () => {
            setIsSpinning(false)
            setReward(newReward)
            setShowReward(true)

            // Confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            // Update database
            const updates: any = {
                last_box_open_at: new Date().toISOString()
            }

            let newXP = currentXP
            let newAvatar: string | undefined

            if (newReward.type === 'xp') {
                newXP = currentXP + (newReward.value as number)
                updates.xp = newXP
            } else if (newReward.type === 'avatar') {
                newAvatar = newReward.value as string
                updates.avatar_url = `https://api.dicebear.com/7.x/micah/svg?seed=${newAvatar}`
            }

            await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)

            // Notify parent component
            onRewardClaimed(newXP, newAvatar)
            setCanOpen(false)
        }, 2000)
    }

    const closeRewardModal = () => {
        setShowReward(false)
        setReward(null)
    }

    if (loading) {
        return (
            <div className="w-32 h-32 bg-slate-800/50 rounded-2xl animate-pulse"></div>
        )
    }

    return (
        <>
            {/* Mystery Box */}
            <motion.div
                className="relative"
                animate={canOpen ? { y: [0, -10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <motion.button
                    onClick={handleOpenBox}
                    disabled={!canOpen || isSpinning}
                    className={`relative group ${canOpen ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    whileHover={canOpen ? { scale: 1.05 } : {}}
                    whileTap={canOpen ? { scale: 0.95 } : {}}
                    animate={isSpinning ? {
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1, 1.1, 1]
                    } : {}}
                    transition={isSpinning ? { duration: 0.5, repeat: 4 } : {}}
                >
                    <div className={`relative w-32 h-32 rounded-2xl flex items-center justify-center ${canOpen
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50'
                            : 'bg-slate-800/50 border-2 border-slate-700'
                        }`}>
                        <Gift className={`w-16 h-16 ${canOpen ? 'text-white' : 'text-slate-600'}`} />

                        {canOpen && (
                            <motion.div
                                className="absolute -top-2 -right-2"
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Sparkles className="w-6 h-6 text-yellow-300" />
                            </motion.div>
                        )}
                    </div>

                    {/* Countdown Timer */}
                    {!canOpen && timeRemaining && (
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <p className="text-xs text-slate-400 font-mono">
                                Open in {timeRemaining}
                            </p>
                        </div>
                    )}

                    {/* "Click Me" hint */}
                    {canOpen && !isSpinning && (
                        <motion.div
                            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <p className="text-xs text-yellow-400 font-bold">
                                Click to Open!
                            </p>
                        </motion.div>
                    )}
                </motion.button>
            </motion.div>

            {/* Reward Modal */}
            <AnimatePresence>
                {showReward && reward && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={closeRewardModal}
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border-2 border-yellow-500/50 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeRewardModal}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="mb-6"
                                >
                                    {reward.type === 'xp' && <Trophy className="w-20 h-20 mx-auto text-yellow-400" />}
                                    {reward.type === 'avatar' && <div className="text-8xl">{reward.value}</div>}
                                    {reward.type === 'fact' && <Lightbulb className="w-20 h-20 mx-auto text-blue-400" />}
                                </motion.div>

                                <h2 className="text-3xl font-black text-white mb-4">
                                    🎉 Congratulations!
                                </h2>

                                <p className="text-xl text-slate-300 mb-6">
                                    {reward.message}
                                </p>

                                {reward.type === 'fact' && (
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-blue-300 italic">
                                            {reward.value}
                                        </p>
                                    </div>
                                )}

                                <Button
                                    onClick={closeRewardModal}
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold"
                                >
                                    Awesome!
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
