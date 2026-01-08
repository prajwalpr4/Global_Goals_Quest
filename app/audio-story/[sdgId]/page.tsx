'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { useNarrator } from '@/hooks/useNarrator'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Play, Pause, Volume2, VolumeX, Gauge } from 'lucide-react'
import Link from 'next/link'

interface StoryNode {
    id: string
    sdg_number: number
    content: string
    choice_a_text: string | null
    choice_b_text: string | null
    next_node_a_id: string | null
    next_node_b_id: string | null
    is_ending: boolean
}

export default function AudioStoryPage() {
    const params = useParams()
    const router = useRouter()
    const sdgId = params.sdgId as string
    const supabase = createClient()

    const [currentNode, setCurrentNode] = useState<StoryNode | null>(null)
    const [loading, setLoading] = useState(true)
    const [showChoices, setShowChoices] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)

    const narrator = useNarrator(() => {
        // When narration ends, show choices
        setShowChoices(true)
    })

    // Fetch initial story node
    useEffect(() => {
        const fetchStory = async () => {
            const { data, error } = await supabase
                .from('story_nodes')
                .select('*')
                .eq('sdg_number', parseInt(sdgId))
                .order('node_order', { ascending: true })
                .limit(1)
                .single()

            if (data) {
                setCurrentNode(data)
            } else {
                console.error('No story found:', error)
            }
            setLoading(false)
        }

        fetchStory()
    }, [sdgId, supabase])

    // Auto-play when node changes (after first start)
    useEffect(() => {
        if (currentNode && hasStarted) {
            setShowChoices(false)
            narrator.stop()
            // Small delay for better UX
            setTimeout(() => {
                narrator.speak(currentNode.content)
            }, 300)
        }
    }, [currentNode?.id]) // Only trigger on node ID change

    const handleStart = () => {
        setHasStarted(true)
        if (currentNode) {
            narrator.speak(currentNode.content)
        }
    }

    const handleChoice = async (nextNodeId: string | null) => {
        if (!nextNodeId) return

        narrator.stop()
        setShowChoices(false)

        const { data } = await supabase
            .from('story_nodes')
            .select('*')
            .eq('id', nextNodeId)
            .single()

        if (data) {
            setCurrentNode(data)
        }
    }

    const togglePlayPause = () => {
        if (narrator.isPaused) {
            narrator.resume()
        } else if (narrator.isSpeaking) {
            narrator.pause()
        } else if (currentNode) {
            narrator.speak(currentNode.content)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!currentNode) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
                    <Link href="/">
                        <Button>Back to Dashboard</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="w-full max-w-3xl mb-6 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-300">
                        <Home className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    🎧 Audio Story Mode
                </h1>
                <div className="w-10" />
            </div>

            {/* Main Story Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden"
            >
                {/* Story Content */}
                <div className="p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentNode.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center"
                        >
                            {/* Listening Indicator */}
                            {narrator.isSpeaking && !narrator.isPaused && (
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <div className="w-1 h-8 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1 h-12 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-10 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                                    <span className="ml-3 text-purple-400 font-medium">Listening...</span>
                                </div>
                            )}

                            {/* Story Text */}
                            <p className="text-2xl md:text-3xl leading-relaxed text-slate-100 font-light mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                                {currentNode.content}
                            </p>

                            {/* Start Button (First Time) */}
                            {!hasStarted && (
                                <Button
                                    onClick={handleStart}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-bold rounded-2xl shadow-lg"
                                >
                                    <Play className="w-6 h-6 mr-2" />
                                    Start Story
                                </Button>
                            )}

                            {/* Choice Buttons */}
                            {hasStarted && showChoices && !currentNode.is_ending && (
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    {currentNode.choice_a_text && (
                                        <Button
                                            onClick={() => handleChoice(currentNode.next_node_a_id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 text-lg rounded-xl flex-1"
                                        >
                                            {currentNode.choice_a_text}
                                        </Button>
                                    )}
                                    {currentNode.choice_b_text && (
                                        <Button
                                            onClick={() => handleChoice(currentNode.next_node_b_id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 text-lg rounded-xl flex-1"
                                        >
                                            {currentNode.choice_b_text}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Ending */}
                            {currentNode.is_ending && showChoices && (
                                <div className="mt-8">
                                    <p className="text-green-400 text-xl font-bold mb-4">🎉 The End!</p>
                                    <Link href="/">
                                        <Button className="bg-purple-600 hover:bg-purple-700">
                                            Back to Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Playback Controls */}
                {hasStarted && (
                    <div className="bg-slate-900/80 border-t border-slate-700 p-6">
                        <div className="flex items-center justify-between max-w-2xl mx-auto">
                            {/* Play/Pause */}
                            <Button
                                onClick={togglePlayPause}
                                variant="ghost"
                                size="icon"
                                className="w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700"
                            >
                                {narrator.isSpeaking && !narrator.isPaused ? (
                                    <Pause className="w-6 h-6" />
                                ) : (
                                    <Play className="w-6 h-6" />
                                )}
                            </Button>

                            {/* Speed Control */}
                            <div className="flex items-center gap-3">
                                <Gauge className="w-5 h-5 text-slate-400" />
                                <select
                                    value={narrator.speechRate}
                                    onChange={(e) => narrator.setSpeechRate(parseFloat(e.target.value))}
                                    className="bg-slate-800 text-white rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="0.5">0.5x</option>
                                    <option value="0.75">0.75x</option>
                                    <option value="1.0">1.0x</option>
                                    <option value="1.25">1.25x</option>
                                    <option value="1.5">1.5x</option>
                                </select>
                            </div>

                            {/* Volume Indicator */}
                            <div className="flex items-center gap-2 text-slate-400">
                                {narrator.isSpeaking ? (
                                    <Volume2 className="w-5 h-5" />
                                ) : (
                                    <VolumeX className="w-5 h-5" />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Instructions */}
            <div className="mt-6 text-center text-slate-400 text-sm max-w-md">
                <p>🎧 Put on your headphones for the best experience</p>
                <p className="mt-2">Adjust the speed if you need to listen faster or slower</p>
            </div>
        </div>
    )
}
