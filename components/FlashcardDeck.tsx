'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, ArrowRight, RotateCw } from 'lucide-react'
import { Database } from '@/types/supabase'

type Flashcard = Database['public']['Tables']['flashcards']['Row']

interface FlashcardDeckProps {
    cards: Flashcard[]
    currentIndex: number
    onNext: () => void
    onPrev: () => void
}

export function FlashcardDeck({ cards, currentIndex, onNext, onPrev }: FlashcardDeckProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const currentCard = cards[currentIndex]

    // Dynamic Icon Component
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[currentCard.icon_name] || LucideIcons.HelpCircle

    const handleFlip = () => {
        if (!isAnimating) {
            setIsFlipped(!isFlipped)
            setIsAnimating(true)
        }
    }

    const handleNext = () => {
        setIsFlipped(false)
        setTimeout(onNext, 200)
    }

    const handlePrev = () => {
        setIsFlipped(false)
        setTimeout(onPrev, 200)
    }

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto perspective-1000">

            <div className="w-full h-[400px] relative cursor-pointer group perspecitve-1000" onClick={handleFlip}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    onAnimationComplete={() => setIsAnimating(false)}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front Face */}
                    <div className={`absolute w-full h-full backface-hidden bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-b-8 border-r-8 border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-8 text-center`}>
                        <div className={`w-32 h-32 rounded-full mb-8 flex items-center justify-center ${currentCard.color_theme.replace("bg-", "bg-opacity-20 text-").replace('500', '600')} bg-opacity-20`}>
                            <IconComponent className={`w-16 h-16 ${currentCard.color_theme.replace("bg-", "text-")}`} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">{currentCard.front_text}</h3>
                        <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">Tap to flip</p>
                    </div>

                    {/* Back Face */}
                    <div
                        className={`absolute w-full h-full backface-hidden bg-gradient-to-br ${currentCard.color_theme.replace('bg-', 'from-').replace('500', '500').replace('600', '600')} to-slate-800 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-10 text-center`}
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <RotateCw className="w-8 h-8 mb-6 opacity-50" />
                        <p className="text-2xl font-medium leading-relaxed">
                            "{currentCard.back_text}"
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full mt-8 px-4">
                <Button
                    variant="outline"
                    onClick={(e) => { e.stopPropagation(); handlePrev() }}
                    disabled={currentIndex === 0}
                    className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Button>

                <div className="flex space-x-2">
                    {cards.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>

                <Button
                    variant="primary"
                    onClick={(e) => { e.stopPropagation(); handleNext() }}
                    disabled={currentIndex === cards.length - 1}
                    className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
                >
                    <ArrowRight className="w-6 h-6" />
                </Button>
            </div>
        </div>
    )
}
