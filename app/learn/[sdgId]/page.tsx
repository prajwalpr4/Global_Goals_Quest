'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { FlashcardDeck } from '@/components/FlashcardDeck'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Database } from '@/types/supabase'

type Flashcard = Database['public']['Tables']['flashcards']['Row']

export default function LearnPage({ params }: { params: Promise<{ sdgId: string }> }) {
    const { sdgId } = React.use(params)
    const [flashcards, setFlashcards] = useState<Flashcard[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const fetchCards = async () => {
            // In the seed we used '14' for SDG 14 but the param might be the ID. 
            // Assuming sdgId param maps directly to sdg_number for now based on previous setup.
            const { data, error } = await supabase
                .from('flashcards')
                .select('*')
                .eq('sdg_number', parseInt(sdgId))

            if (data) {
                setFlashcards(data)
            }
            setLoading(false)
        }

        fetchCards()
    }, [sdgId, supabase])

    const handleNext = () => {
        if (currentIndex < flashcards.length - 1) {
            setCurrentIndex(prev => prev + 1)
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -ml-20 -mt-20 z-0"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -mr-20 -mb-20 z-0"></div>

            {/* Header */}
            <header className="p-6 flex items-center justify-between relative z-10 max-w-5xl mx-auto w-full">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-300 hover:text-white">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>
                </Link>
                <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-sm">Learning Mode: SDG {sdgId}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
                {flashcards.length > 0 ? (
                    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
                        <div className="mb-8 text-center space-y-2">
                            <h1 className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                                Did You Know?
                            </h1>
                            <p className="text-slate-400 text-lg">
                                Mastering Fact {currentIndex + 1} of {flashcards.length}
                            </p>
                        </div>

                        <FlashcardDeck
                            cards={flashcards}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrev={handlePrev}
                        />
                    </div>
                ) : (
                    <div className="text-center max-w-md mx-auto p-10 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Facts Yet</h2>
                        <p className="text-slate-400 mb-6">We haven't added flashcards for this goal yet. Check back soon!</p>
                        <Link href="/">
                            <Button variant="primary" className="w-full">
                                Return Home
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
