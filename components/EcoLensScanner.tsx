'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabaseClient'
import Webcam from 'react-webcam'
import * as mobilenet from '@tensorflow-models/mobilenet'
import * as tf from '@tensorflow/tfjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Trophy, X, History } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import confetti from 'canvas-confetti'

interface EcoLensScannerProps {
    userId: string
    currentXP: number
    onXPUpdate: (newXP: number) => void
}

type SDGCategory = 'Nature' | 'Waste' | 'Energy' | 'Water' | 'Food'

interface Mission {
    category: SDGCategory
    description: string
    examples: string[]
}

interface ScanResult {
    category: SDGCategory
    object: string
    confidence: number
    timestamp: Date
}

const MISSIONS: Mission[] = [
    {
        category: 'Nature',
        description: 'Find something related to Nature!',
        examples: ['plant', 'tree', 'flower', 'leaf', 'grass']
    },
    {
        category: 'Waste',
        description: 'Find something recyclable!',
        examples: ['bottle', 'plastic', 'can', 'container', 'packaging']
    },
    {
        category: 'Energy',
        description: 'Find an electronic device!',
        examples: ['computer', 'monitor', 'phone', 'laptop', 'screen']
    },
    {
        category: 'Water',
        description: 'Find something water-related!',
        examples: ['bottle', 'glass', 'cup', 'water', 'drink']
    },
    {
        category: 'Food',
        description: 'Find a healthy food item!',
        examples: ['fruit', 'vegetable', 'apple', 'banana', 'orange']
    }
]

// Map MobileNet predictions to SDG categories
function mapPredictionToSDG(prediction: string): SDGCategory | null {
    const lower = prediction.toLowerCase()

    // Nature (SDG 15)
    if (lower.includes('tree') || lower.includes('plant') || lower.includes('flower') ||
        lower.includes('leaf') || lower.includes('grass') || lower.includes('fern') ||
        lower.includes('bush') || lower.includes('succulent')) {
        return 'Nature'
    }

    // Waste/Recycling (SDG 12)
    if (lower.includes('bottle') || lower.includes('plastic') || lower.includes('can') ||
        lower.includes('container') || lower.includes('packaging') || lower.includes('wrapper')) {
        return 'Waste'
    }

    // Energy (SDG 7)
    if (lower.includes('computer') || lower.includes('monitor') || lower.includes('laptop') ||
        lower.includes('phone') || lower.includes('screen') || lower.includes('keyboard') ||
        lower.includes('mouse') || lower.includes('tablet')) {
        return 'Energy'
    }

    // Water (SDG 6)
    if (lower.includes('water') || lower.includes('glass') || lower.includes('cup') ||
        lower.includes('mug') || lower.includes('drink')) {
        return 'Water'
    }

    // Food (SDG 2)
    if (lower.includes('fruit') || lower.includes('vegetable') || lower.includes('apple') ||
        lower.includes('banana') || lower.includes('orange') || lower.includes('carrot') ||
        lower.includes('tomato') || lower.includes('food')) {
        return 'Food'
    }

    return null
}

export function EcoLensScanner({ userId, currentXP, onXPUpdate }: EcoLensScannerProps) {
    const [model, setModel] = useState<mobilenet.MobileNet | null>(null)
    const [modelLoading, setModelLoading] = useState(true)
    const [currentMission, setCurrentMission] = useState<Mission>(MISSIONS[0])
    const [isScanning, setIsScanning] = useState(false)
    const [scanResult, setScanResult] = useState<'success' | 'fail' | null>(null)
    const [lastScan, setLastScan] = useState<ScanResult | null>(null)
    const [cooldownRemaining, setCooldownRemaining] = useState(0)
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [debugPredictions, setDebugPredictions] = useState<string[]>([])

    const webcamRef = useRef<Webcam>(null)
    const supabase = createClient()

    // Load TensorFlow model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready()
                const loadedModel = await mobilenet.load()
                setModel(loadedModel)
                setModelLoading(false)
            } catch (error) {
                console.error('Failed to load model:', error)
                setModelLoading(false)
            }
        }

        loadModel()
    }, [])

    // Generate random mission
    useEffect(() => {
        const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)]
        setCurrentMission(randomMission)
    }, [])

    // Fetch scan history
    useEffect(() => {
        const fetchHistory = async () => {
            const { data } = await supabase
                .from('user_scans')
                .select('*')
                .eq('user_id', userId)
                .order('scanned_at', { ascending: false })
                .limit(10)

            if (data) {
                setScanHistory(data.map(scan => ({
                    category: scan.category as SDGCategory,
                    object: scan.object_name,
                    confidence: scan.confidence,
                    timestamp: new Date(scan.scanned_at)
                })))
            }
        }

        fetchHistory()
    }, [userId, supabase])

    // Cooldown timer
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => {
                setCooldownRemaining(cooldownRemaining - 1)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldownRemaining])

    const handleScan = async () => {
        if (!model || !webcamRef.current || isScanning || cooldownRemaining > 0) return

        setIsScanning(true)
        setScanResult(null)

        try {
            const imageSrc = webcamRef.current.getScreenshot()
            if (!imageSrc) {
                setIsScanning(false)
                return
            }

            // Create image element
            const img = new Image()
            img.src = imageSrc

            await new Promise((resolve) => {
                img.onload = resolve
            })

            // Classify image
            const predictions = await model.classify(img)

            // Store top 3 for debugging
            setDebugPredictions(predictions.slice(0, 3).map(p =>
                `${p.className} (${Math.round(p.probability * 100)}%)`
            ))

            if (predictions.length > 0) {
                const topPrediction = predictions[0]
                const detectedCategory = mapPredictionToSDG(topPrediction.className)

                const result: ScanResult = {
                    category: detectedCategory || 'Nature',
                    object: topPrediction.className,
                    confidence: topPrediction.probability,
                    timestamp: new Date()
                }

                setLastScan(result)

                // Check if it matches the mission
                if (detectedCategory === currentMission.category) {
                    // Success!
                    setScanResult('success')
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })

                    // Award XP
                    const newXP = currentXP + 50
                    onXPUpdate(newXP)

                    // Update database
                    await supabase.from('profiles').update({ xp: newXP }).eq('id', userId)

                    // Save scan
                    await supabase.from('user_scans').insert({
                        user_id: userId,
                        category: detectedCategory,
                        object_name: topPrediction.className,
                        confidence: topPrediction.probability
                    })

                    // Generate new mission
                    setTimeout(() => {
                        const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)]
                        setCurrentMission(randomMission)
                    }, 2000)
                } else {
                    // Fail
                    setScanResult('fail')
                }

                // Start cooldown
                setCooldownRemaining(10)
            }
        } catch (error) {
            console.error('Scan error:', error)
        } finally {
            setIsScanning(false)
        }
    }

    if (modelLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-xl font-bold">Loading AI Model...</p>
                    <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            {/* Mission Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-6 text-white shadow-xl"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black mb-2">🎯 Mission</h2>
                        <p className="text-lg">{currentMission.description}</p>
                        <p className="text-sm text-purple-200 mt-1">
                            Examples: {currentMission.examples.join(', ')}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowHistory(!showHistory)}
                        variant="ghost"
                        className="text-white"
                    >
                        <History className="w-6 h-6" />
                    </Button>
                </div>
            </motion.div>

            {/* Webcam Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-700">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-auto"
                    videoConstraints={{
                        facingMode: 'environment'
                    }}
                />

                {/* Scanning Reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        animate={isScanning ? { scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-64 h-64 border-4 border-blue-500 rounded-2xl"
                    >
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                    </motion.div>
                </div>

                {/* Success/Fail Overlay */}
                <AnimatePresence>
                    {scanResult === 'success' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-green-500 flex items-center justify-center"
                        >
                            <div className="text-center text-white">
                                <Trophy className="w-24 h-24 mx-auto mb-4" />
                                <p className="text-3xl font-black">Success!</p>
                                <p className="text-xl">+50 XP</p>
                            </div>
                        </motion.div>
                    )}
                    {scanResult === 'fail' && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 0.8, x: [0, -10, 10, -10, 10, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 bg-red-500 flex items-center justify-center"
                        >
                            <div className="text-center text-white">
                                <X className="w-24 h-24 mx-auto mb-4" />
                                <p className="text-3xl font-black">Not Quite!</p>
                                <p className="text-xl">Try {currentMission.category.toLowerCase()}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Scan Button */}
            <div className="mt-6 text-center">
                <Button
                    onClick={handleScan}
                    disabled={isScanning || cooldownRemaining > 0}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-xl font-bold rounded-2xl shadow-lg disabled:opacity-50"
                >
                    {isScanning ? (
                        <>Scanning...</>
                    ) : cooldownRemaining > 0 ? (
                        <>Cooldown: {cooldownRemaining}s</>
                    ) : (
                        <>
                            <Camera className="w-6 h-6 mr-2 inline" />
                            Scan Object
                        </>
                    )}
                </Button>

                {lastScan && (
                    <p className="text-slate-400 mt-4">
                        Last detected: <span className="text-white font-bold">{lastScan.object}</span>
                        {' '}({Math.round(lastScan.confidence * 100)}% confident)
                    </p>
                )}

                {debugPredictions.length > 0 && (
                    <div className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <p className="text-xs text-slate-400 mb-2">🔍 AI Detected:</p>
                        {debugPredictions.map((pred, i) => (
                            <p key={i} className="text-sm text-slate-300">
                                {i + 1}. {pred}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            {/* Scan History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowHistory(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-slate-800 rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-black text-white">Scan History</h3>
                                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {scanHistory.map((scan, i) => (
                                    <div key={i} className="bg-slate-700/50 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-bold">{scan.object}</p>
                                                <p className="text-sm text-slate-400">{scan.category}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-400 font-bold">{Math.round(scan.confidence * 100)}%</p>
                                                <p className="text-xs text-slate-500">
                                                    {scan.timestamp.toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {scanHistory.length === 0 && (
                                    <p className="text-center text-slate-400 py-8">No scans yet. Start scanning!</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
