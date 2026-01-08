'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit2, Save, X, Trophy, Flame, Star, Medal } from 'lucide-react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/Badge'
import { getLevel, calculateProgress } from '@/lib/gamification'
import { ThemeToggle } from '@/app/components/ThemeToggle'
import { useToast } from '@/components/ui/Toast'

type Profile = Database['public']['Tables']['profiles']['Row']
type Achievement = Database['public']['Tables']['achievements']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row'] & { quests: Database['public']['Tables']['quests']['Row'] }

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [achievements, setAchievements] = useState<Achievement[]>([])
    const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
    const [questHistory, setQuestHistory] = useState<UserProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ username: '', full_name: '' })
    const [saving, setSaving] = useState(false)
    const { toast } = useToast()

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchProfileData = async () => {
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
                setProfile(profileData)
                setFormData({ username: profileData.username || '', full_name: profileData.full_name || '' })
            }

            // Fetch Achievements
            const { data: allAchievements } = await supabase.from('achievements').select('*')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: userUnlocks } = await (supabase.from('user_achievements') as any).select('achievement_id').eq('user_id', user.id)

            setAchievements(allAchievements || [])
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setUnlockedAchievements(userUnlocks?.map((u: any) => u.achievement_id) || [])

            // Fetch Quest History
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: history } = await (supabase.from('user_progress') as any)
                .select('*, quests(*)')
                .eq('user_id', user.id)
                .order('completed_at', { ascending: false })

            setQuestHistory(history || [])

            setLoading(false)
        }

        fetchProfileData()
    }, [router, supabase])

    const handleSaveProfile = async () => {
        if (!profile) return
        setSaving(true)

        // Check unique username if changed
        if (formData.username !== profile.username) {
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('username', formData.username)
                .neq('id', profile.id)
                .single()

            if (existing) {
                toast("Username already taken!", 'error')
                setSaving(false)
                return
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({ username: formData.username, full_name: formData.full_name })
            .eq('id', profile.id)

        if (!error) {
            setProfile({ ...profile, ...formData })
            setIsEditing(false)
            toast('Profile updated successfully!', 'success')
        } else {
            toast('Failed to update profile.', 'error')
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!profile) return null

    const currentLevel = getLevel(profile.xp || 0)
    const progressPercent = calculateProgress(profile.xp || 0)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            {/* Header */}
            <header className="glass sticky top-0 z-50 border-b border-white/20 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center space-x-2">
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden mb-8 border border-slate-100 dark:border-slate-700"
                >
                    <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="px-8 pb-8">
                        <div className="relative flex justify-between items-end -mt-12 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-md overflow-hidden bg-white dark:bg-slate-700">
                                    <Image
                                        src={profile.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${profile.username}`}
                                        alt="Profile"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-amber-400 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-800" title={`Level ${currentLevel.level}`}>
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>

                            {!isEditing ? (
                                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="mb-2">
                                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                                </Button>
                            ) : (
                                <div className="flex space-x-2 mb-2">
                                    <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm" disabled={saving}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button onClick={handleSaveProfile} variant="primary" size="sm" disabled={saving}>
                                        <Save className="w-4 h-4 mr-1" /> {saving ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="mb-8">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Display Name</label>
                                        <Input
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Username</label>
                                        <Input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Unique username"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white capitalize">{profile.full_name || 'Anonymous Hero'}</h1>
                                    <p className="text-slate-500 dark:text-slate-400">@{profile.username}</p>
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center space-x-2 text-amber-500 mb-2">
                                    <Trophy className="w-5 h-5" />
                                    <span className="font-bold">Total XP</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{profile.xp || 0}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center space-x-2 text-indigo-500 mb-2">
                                    <Medal className="w-5 h-5" />
                                    <span className="font-bold">Level {currentLevel.level}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{currentLevel.name}</p>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center space-x-2 text-orange-500 mb-2">
                                    <Flame className="w-5 h-5" />
                                    <span className="font-bold">Streak</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{profile.streak_count || 0} Days</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center space-x-2 text-green-500 mb-2">
                                    <Star className="w-5 h-5" />
                                    <span className="font-bold">Quests</span>
                                </div>
                                <p className="text-2xl font-black text-slate-800 dark:text-slate-200">{questHistory.length}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>



            </main>
        </div>
    )
}
