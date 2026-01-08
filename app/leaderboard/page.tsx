'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Trophy, Crown, Medal } from 'lucide-react'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function LeaderboardPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .order('xp', { ascending: false })
                .limit(50)

            if (data) setUsers(data)
            setLoading(false)
        }

        fetchLeaderboard()
    }, [supabase])

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            case 1: return <Medal className="w-6 h-6 text-slate-400 fill-slate-400" />
            case 2: return <Medal className="w-6 h-6 text-amber-700 fill-amber-700" />
            default: return <span className="font-bold text-slate-500 w-6 text-center">{index + 1}</span>
        }
    }

    const getRowStyle = (index: number) => {
        if (index === 0) return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
        if (index === 1) return "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
        if (index === 2) return "bg-gradient-to-r from-orange-50 to-amber-50/50 border-orange-200"
        return "bg-white/40 border-slate-100 hover:bg-white/60"
    }

    return (
        <div className="min-h-screen py-10 px-4 md:px-0 flex justify-center">
            <div className="w-full max-w-4xl">
                <div className="flex items-center mb-8">
                    <Link href="/" className="mr-4 p-2 rounded-full hover:bg-white/20 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-700" />
                    </Link>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 flex items-center">
                        <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                        Global Leaderboard
                    </h1>
                </div>

                <div className="glass-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 text-sm uppercase tracking-wider">
                                    <th className="p-6 font-semibold">Rank</th>
                                    <th className="p-6 font-semibold">Hero</th>
                                    <th className="p-6 font-semibold text-right">XP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    // Skeleton loading
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-slate-100">
                                            <td className="p-6"><div className="h-6 w-6 bg-slate-200 rounded"></div></td>
                                            <td className="p-6 flex items-center space-x-3">
                                                <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                                <div className="h-4 w-32 bg-slate-200 rounded"></div>
                                            </td>
                                            <td className="p-6 text-right"><div className="h-4 w-12 bg-slate-200 rounded ml-auto"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    users.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`border-b transition-colors ${getRowStyle(index)}`}
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white shadow-sm">
                                                        <Image
                                                            src={user.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${user.username}`}
                                                            alt={user.username || 'User'}
                                                            fill
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className={`font-bold ${index < 3 ? 'text-slate-900' : 'text-slate-600'}`}>
                                                        {user.username || 'Anonymous Hero'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right font-mono font-bold text-slate-900">
                                                {user.xp.toLocaleString()}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && users.length === 0 && (
                        <div className="p-10 text-center text-slate-500">
                            No heroes have risen yet. Be the first!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
