import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Lock, Check, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabaseClient'
import confetti from 'canvas-confetti'

export const AVATARS = [
    { id: 'micah', name: 'Default', price: 0, seed: 'micah' },
    { id: 'felix', name: 'Felix', price: 1, seed: 'felix' },
    { id: 'bane', name: 'Bane', price: 1, seed: 'bane' },
    { id: 'jess', name: 'Jess', price: 1, seed: 'jess' },
    { id: 'joker', name: 'Joker', price: 1, seed: 'joker' },
    { id: 'kaia', name: 'Kaia', price: 1, seed: 'kaia' },
]

interface AvatarShopProps {
    isOpen: boolean
    onClose: () => void
    userXP: number
    unlockedAvatars: string[]
    currentAvatar: string
    userId: string
    onAvatarUpdate: (newUrl: string, newUnlocked: string[]) => void
}

export function AvatarShop({ isOpen, onClose, userXP, unlockedAvatars, currentAvatar, userId, onAvatarUpdate }: AvatarShopProps) {
    const [buying, setBuying] = useState<string | null>(null)
    const supabase = createClient()

    // 1 Unlock Credit per 100 XP
    // Default avatar 'micah' is always unlocked and doesn't count towards the limit effectively (or we can just ignore it in count if needed, but easier to just treat unlocked list as source of truth)
    // Actually, assume initial unlockedAvatars includes 'micah' or logic handles it.
    // Let's say total slots = floor(XP / 100).
    const totalCredits = Math.floor(userXP / 100)
    // Used credits = number of avatars unlocked (excluding default if strictly "earned", but let's say all unlocks cost 1)
    // We should filter out the default one 'micah' from "spent" credits if it's free.
    const spentCredits = unlockedAvatars.filter(a => a !== 'micah').length
    const availableCredits = Math.max(0, totalCredits - spentCredits)

    const handleBuy = async (avatar: typeof AVATARS[0]) => {
        if (availableCredits < 1) return
        setBuying(avatar.id)

        const newUnlocked = [...unlockedAvatars, avatar.seed]

        // Update DB
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('profiles') as any).update({
            unlocked_avatars: newUnlocked
        }).eq('id', userId)

        if (!error) {
            onAvatarUpdate('', newUnlocked)
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
        }
        setBuying(null)
    }

    const handleEquip = async (seed: string) => {
        const url = `https://api.dicebear.com/7.x/micah/svg?seed=${seed}`

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any).update({
            avatar_url: url
        }).eq('id', userId)

        onAvatarUpdate(url, unlockedAvatars)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-2xl relative z-10 shadow-2xl max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                                    <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Avatar Shop</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">Unlock new looks with your XP!</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 font-bold flex items-center">
                                    <span className="mr-2">🎟️</span> {availableCredits} Credits
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {AVATARS.map((avatar) => {
                                const isUnlocked = unlockedAvatars.includes(avatar.seed) || avatar.price === 0
                                const isEquipped = currentAvatar.includes(`seed=${avatar.seed}`)
                                const canAfford = availableCredits >= 1

                                return (
                                    <div key={avatar.id} className={`p-4 rounded-xl border-2 flex flex-col items-center transition-all ${isEquipped ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                                        <div className="relative w-20 h-20 mb-3">
                                            <Image
                                                src={`https://api.dicebear.com/7.x/micah/svg?seed=${avatar.seed}`}
                                                alt={avatar.name}
                                                fill
                                                unoptimized
                                                className="object-cover rounded-full"
                                            />
                                            {isEquipped && (
                                                <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-sm">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{avatar.name}</h3>

                                        {isUnlocked ? (
                                            <Button
                                                onClick={() => handleEquip(avatar.seed)}
                                                variant={isEquipped ? 'secondary' : 'outline'}
                                                className={`w-full text-sm h-8 ${isEquipped ? 'bg-blue-200 text-blue-700 hover:bg-blue-300' : ''}`}
                                                disabled={isEquipped}
                                            >
                                                {isEquipped ? 'Equipped' : 'Equip'}
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => handleBuy(avatar)}
                                                disabled={!canAfford || buying === avatar.id}
                                                className={`w-full text-sm h-8 ${canAfford ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400 dark:bg-slate-700'}`}
                                            >
                                                {buying === avatar.id ? '...' : (
                                                    <div className="flex items-center">
                                                        Unlock (1 🎟️)
                                                    </div>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-400">
                            Earn 100 XP to get 1 Avatar Credit!
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
