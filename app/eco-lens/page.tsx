'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { EcoLensScanner } from '@/components/EcoLensScanner'
import { Button } from '@/components/ui/Button'
import { Home } from 'lucide-react'
import Link from 'next/link'

export default function EcoLensPage() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            setProfile(data)
            setLoading(false)
        }

        fetchProfile()
    }, [router, supabase])

    const handleXPUpdate = (newXP: number) => {
        if (profile) {
            setProfile({ ...profile, xp: newXP })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white py-8 px-4">
            {/* Header */}
            <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-300">
                        <Home className="w-5 h-5 mr-2" />
                        Dashboard
                    </Button>
                </Link>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    📸 Eco-Lens
                </h1>
                <div className="w-24" />
            </div>

            {/* Scanner */}
            {profile && (
                <EcoLensScanner
                    userId={profile.id}
                    currentXP={profile.xp || 0}
                    onXPUpdate={handleXPUpdate}
                />
            )}

            {/* Instructions */}
            <div className="max-w-2xl mx-auto mt-8 bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold mb-3">How to Play</h3>
                <ol className="space-y-2 text-slate-300">
                    <li>1. Read the mission at the top</li>
                    <li>2. Point your camera at a matching object</li>
                    <li>3. Click "Scan Object" to identify it</li>
                    <li>4. Earn +50 XP for each successful match!</li>
                </ol>
                <p className="text-sm text-slate-400 mt-4">
                    🔒 Privacy: All AI processing happens on your device. Images are never uploaded.
                </p>
            </div>
        </div>
    )
}
