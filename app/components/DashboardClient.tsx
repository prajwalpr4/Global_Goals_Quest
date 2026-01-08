'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { QuestCard } from '@/components/QuestCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/Badge'
import { AvatarShop } from '@/components/AvatarShop'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { LogOut, Trophy, Crown, Star, Flame, ShoppingBag } from 'lucide-react'
import { Database } from '@/types/supabase'
import { getLevel, getNextLevel, calculateProgress, checkStreak } from '@/lib/gamification'

import { VirtualGarden } from '@/components/VirtualGarden'
import { WorldMapExplorer } from '@/components/WorldMapExplorer'
import { DailyMysteryBox } from '@/components/DailyMysteryBox'

type Quest = Database['public']['Tables']['quests']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Achievement = Database['public']['Tables']['achievements']['Row']

export default function DashboardClient() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [quests, setQuests] = useState<Quest[]>([])
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isShopOpen, setIsShopOpen] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [completedCountryCodes, setCompletedCountryCodes] = useState<string[]>([])
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            // Fetch Profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (profileData) {
                const { newStreak, shouldUpdate } = checkStreak(profileData.last_active_at, profileData.streak_count || 0)

                if (shouldUpdate) {
                    setProfile({ ...profileData, streak_count: newStreak, last_active_at: new Date().toISOString() })
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('profiles') as any).update({
                        streak_count: newStreak,
                        last_active_at: new Date().toISOString()
                    }).eq('id', user.id)
                } else {
                    setProfile(profileData)
                }
            }

            // Fetch Quests
            const { data: questsData } = await supabase
                .from('quests')
                .select('*')
                .order('sdg_number', { ascending: true })

            setQuests(questsData || [])

            // Fetch Achievements & User Unlocks
            const { data: allAchievements } = await supabase.from('achievements').select('*')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userUnlocks } = await (supabase.from('user_achievements') as any).select('achievement_id').eq('user_id', user.id)

            // Fetch User Progress (completed quests) to calculate map status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userProgress } = await (supabase.from('user_progress') as any).select('quest_id').eq('user_id', user.id)

            setAchievements(allAchievements || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUnlockedAchievements(userUnlocks?.map((u: any) => u.achievement_id) || [])

            // Calculate Completed Countries
            if (questsData && userProgress) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const completedQuestIds = new Set(userProgress.map((p: any) => p.quest_id))
                const countries = new Set<string>()
                questsData.forEach(q => {
                    if (q.country_code && completedQuestIds.has(q.id)) {
                        countries.add(q.country_code)
                    }
                })
                setCompletedCountryCodes(Array.from(countries))
            }

            setLoading(false)
        }

        fetchData()
    }, [router, supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const handleStartQuest = (id: number) => {
        router.push(`/quest/${id}`)
    }

    const handleAvatarUpdate = (newUrl: string, newUnlocked: string[]) => {
        if (profile) {
            const updates: Partial<Profile> = { unlocked_avatars: newUnlocked }
            if (newUrl) updates.avatar_url = newUrl
            setProfile({ ...profile, ...updates })
        }
    }

    const handleRewardClaimed = (newXP: number, newAvatar?: string) => {
        if (profile) {
            const updates: Partial<Profile> = { xp: newXP }
            if (newAvatar) {
                updates.avatar_url = `https://api.dicebear.com/7.x/micah/svg?seed=${newAvatar}`
            }
            setProfile({ ...profile, ...updates })
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    const currentLevel = profile ? getLevel(profile.xp) : null
    const progressPercent = profile ? calculateProgress(profile.xp) : 0

    const filteredQuests = selectedCountry
        ? quests.filter(q => q.country_code === selectedCountry)
        : quests

    return (
        <div className="min-h-screen pb-10">
            <AvatarShop
                isOpen={isShopOpen}
                onClose={() => setIsShopOpen(false)}
                userXP={profile?.xp || 0}
                unlockedAvatars={profile?.unlocked_avatars || []}
                currentAvatar={profile?.avatar_url || ''}
                userId={profile?.id || ''}
                onAvatarUpdate={handleAvatarUpdate}
            />

            {/* Header */}
            <header className="bg-slate-950 sticky top-0 z-50 border-b border-white/10 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-105 transition-transform">
                            GGQ
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden sm:block">
                            Global Goals Quest
                        </span>
                    </Link>

                    <div className="flex items-center space-x-4">




                        {profile && (
                            <Link href="/profile">
                                <div className="flex items-center space-x-3 bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-white/50 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-white/70 dark:hover:bg-slate-800 transition-colors">
                                    {/* Fire Streak */}
                                    {profile.streak_count > 0 && (
                                        <div className="flex items-center space-x-1 mr-3" title={`${profile.streak_count} Day Streak!`}>
                                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                                            <span className="font-bold text-orange-600 dark:text-orange-400">{profile.streak_count}</span>
                                        </div>
                                    )}



                                    <div className="flex items-center space-x-2 text-amber-500">
                                        <Trophy className="w-5 h-5 fill-current" />
                                        <span className="font-bold text-lg">{profile.xp} XP</span>
                                    </div>

                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 shadow-md ml-2">
                                        <Image
                                            src={profile.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${profile.username}`}
                                            alt="Avatar"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </Link>
                        )}

                        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
                            <LogOut className="w-5 h-5 text-slate-500" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Hero / Welcome Section with Widgets */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
                    {/* Welcome Text */}
                    <div className="md:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-center"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h1 className="text-3xl md:text-4xl font-black mb-4 relative z-10">
                                Welcome back, {profile?.username || 'Hero'}! 🚀
                            </h1>
                            <p className="text-blue-100 text-lg max-w-lg relative z-10 mb-6">
                                You're on a mission to save the planet. Complete quests, earn XP, and grow your impact!
                            </p>

                            <div className="flex flex-wrap gap-4 relative z-10">
                                <Button onClick={() => setIsShopOpen(true)} className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                    Visit Avatar Shop 🛍️
                                </Button>
                                <Link href="/leaderboard">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                        View Leaderboard 🏆
                                    </Button>
                                </Link>
                                <Link href="/studio">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                        Art Studio 🎨
                                    </Button>
                                </Link>
                                <Link href="/game/recycling-run">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                        Play Game ♻️
                                    </Button>
                                </Link>
                                <Link href="/audio-story/13">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                        Audio Story 🎧
                                    </Button>
                                </Link>
                                <Link href="/eco-lens">
                                    <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-md">
                                        Eco-Lens 📸
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Virtual Garden */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        <VirtualGarden xp={profile?.xp || 0} />
                    </div>

                    {/* Daily Mystery Box */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        {profile && (
                            <DailyMysteryBox
                                userId={profile.id}
                                currentXP={profile.xp || 0}
                                onRewardClaimed={handleRewardClaimed}
                            />
                        )}
                    </div>
                </div>

                {/* Map Explorer Section */}
                <div className="mb-16">
                    <WorldMapExplorer
                        completedCountryCodes={completedCountryCodes}
                        selectedCountry={selectedCountry}
                        onCountryClick={(code) => setSelectedCountry(code === selectedCountry ? null : code)}
                    />
                </div>

                <div className="mb-8 text-center md:text-left flex items-end justify-between">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                            {selectedCountry ? `Missions in ${new Intl.DisplayNames(['en'], { type: 'region' }).of(selectedCountry)}` : 'All Global Missions'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400">
                            {selectedCountry ? 'Select another country to view its quests.' : 'Select a country on the map to filter quests.'}
                        </p>
                    </div>
                    {selectedCountry && (
                        <Button variant="ghost" onClick={() => setSelectedCountry(null)} className="text-blue-500 hover:text-blue-600">
                            View All
                        </Button>
                    )}
                </div>

                {/* Quests Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr mb-12">
                    {filteredQuests.length === 0 ? (
                        <div className="col-span-full py-20 bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl mb-4">🌍</span>
                            <p className="text-slate-500 text-lg font-medium">No quests found for this region yet.</p>
                            <Button variant="link" onClick={() => setSelectedCountry(null)} className="mt-2 text-blue-500">
                                Show all global quests
                            </Button>
                        </div>
                    ) : (
                        filteredQuests.map((quest, index) => (
                            <motion.div
                                key={quest.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <QuestCard quest={quest} onStart={handleStartQuest} />
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Achievements Section */}
                {achievements.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center mb-6">
                            <Star className="w-6 h-6 text-amber-500 mr-2 fill-current" />
                            <h3 className="text-2xl font-bold text-slate-800">Your Achievements</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {achievements.map((badge, idx) => (
                                <Badge
                                    key={badge.id}
                                    title={badge.title}
                                    description={badge.description}
                                    icon={badge.icon}
                                    isUnlocked={unlockedAchievements.includes(badge.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </main>
        </div>
    )
}
