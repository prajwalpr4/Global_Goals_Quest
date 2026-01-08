'use client'

import React, { useRef, useState, useEffect } from 'react'
import { DrawingCanvas, DrawingCanvasHandle } from '@/components/DrawingCanvas'
import { Button } from '@/components/ui/Button'
import { Palette, Save, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/Toast' // Assuming we have this now or use alert
import Image from 'next/image'

export default function StudioPage() {
    const canvasRef = useRef<DrawingCanvasHandle>(null)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)
    const [myArtworks, setMyArtworks] = useState<{ id: string, image_data: string, created_at: string }[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setIsAuthenticated(true)
            fetchArtworks(user.id)
            setLoading(false)
        }
        checkAuth()
    }, [router, supabase])

    const fetchArtworks = async (userId: string) => {
        const { data, error } = await supabase
            .from('user_artworks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (data) {
            setMyArtworks(data)
        }
    }

    const handleSave = async () => {
        if (!canvasRef.current) return

        setSaving(true)
        try {
            const dataUrl = canvasRef.current.exportImage()

            // Trigger download to PC
            const link = document.createElement('a')
            link.href = dataUrl
            link.download = 'my-ecosystem-SDG.png'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { error } = await supabase.from('user_artworks').insert({
                    user_id: user.id,
                    image_data: dataUrl
                })

                if (error) throw error

                toast('Masterpiece Saved! Your artwork has been added to your gallery. 🎨', 'success')

                // Refresh gallery
                fetchArtworks(user.id)
            }
        } catch (error) {
            console.error('Error saving artwork:', error)
            toast('Save Failed. Could not save your artwork.', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-950">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -ml-20 -mb-20 z-0"></div>

            {/* Header */}
            <header className="p-6 flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Palette className="w-4 h-4 text-pink-400" />
                    <span className="font-bold text-sm">Creative Studio</span>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">

                <div className="flex flex-col md:flex-row items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                            Design Your Ecosystem
                        </h1>
                        <p className="text-slate-400 mt-2 text-lg">
                            Use stickers to create your ideal sustainable world.
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg shadow-pink-500/25 border-none px-8 py-6 rounded-2xl text-lg font-bold"
                    >
                        {saving ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                        ) : (
                            <><Save className="w-5 h-5 mr-2" /> Save to Gallery</>
                        )}
                    </Button>
                </div>

                {/* Canvas Component */}
                <div className="mb-16">
                    <DrawingCanvas ref={canvasRef} width={800} height={500} />
                </div>

                {/* Gallery Grid */}
                {myArtworks.length > 0 && (
                    <div className="mt-16 border-t border-white/10 pt-10">
                        <h2 className="text-2xl font-bold mb-6 flex items-center">
                            <ImageIcon className="w-6 h-6 mr-2 text-purple-400" />
                            Your Gallery
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myArtworks.map((art) => (
                                <div key={art.id} className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-2xl transition-transform hover:-translate-y-1">
                                    <div className="aspect-[8/5] relative">
                                        <Image
                                            src={art.image_data}
                                            alt="User Artwork"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-4 flex justify-between items-center text-sm text-slate-400">
                                        <span>{new Date(art.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
