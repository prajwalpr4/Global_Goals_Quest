'use client'

import React, { useRef, useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import * as tf from '@tensorflow/tfjs'
import * as mobilenet from '@tensorflow-models/mobilenet'
import { Camera, RefreshCw, CheckCircle, AlertCircle, Trash2, Leaf, Recycle } from 'lucide-react'
import { Button } from './ui/Button'
import { createClient } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

type ScanResult = {
    category: 'recycle' | 'compost' | 'trash' | 'unknown';
    label: string;
    confidence: number;
    message: string;
    color: string;
}

export default function WasteScanner() {
    const webcamRef = useRef<Webcam>(null)
    const [model, setModel] = useState<mobilenet.MobileNet | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<ScanResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    // Load Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                // Ensure backend is WebGL for performance
                await tf.setBackend('webgl')
                const loadedModel = await mobilenet.load()
                setModel(loadedModel)
                setIsLoading(false)
                console.log('MobileNet model loaded')
            } catch (err) {
                console.error('Failed to load model:', err)
                setError('Failed to load AI model. Please refresh.')
                setIsLoading(false)
            }
        }
        loadModel()
    }, [])

    // Categorization Logic (The Brain)
    const categorizeItem = (className: string): ScanResult => {
        const lowerName = className.toLowerCase()

        // Recycle (Blue)
        if (
            lowerName.includes('plastic') ||
            lowerName.includes('bottle') ||
            lowerName.includes('glass') ||
            lowerName.includes('tin') ||
            lowerName.includes('can') ||
            lowerName.includes('carton') ||
            lowerName.includes('paper') ||
            lowerName.includes('cardboard') ||
            lowerName.includes('cup') ||
            lowerName.includes('mug')
        ) {
            return {
                category: 'recycle',
                label: className,
                confidence: 0, // Set later
                message: `I see a ${className}! Put it in the Recycle Bin.`,
                color: 'bg-blue-500'
            }
        }

        // Compost (Green)
        if (
            lowerName.includes('apple') ||
            lowerName.includes('fruit') ||
            lowerName.includes('vegetable') ||
            lowerName.includes('leaf') ||
            lowerName.includes('plant') ||
            lowerName.includes('food') ||
            lowerName.includes('bread') ||
            lowerName.includes('banana') ||
            lowerName.includes('orange') ||
            lowerName.includes('flower')
        ) {
            return {
                category: 'compost',
                label: className,
                confidence: 0,
                message: `Yum, a ${className}! That goes in the Compost.`,
                color: 'bg-green-500'
            }
        }

        // Trash (Gray)
        if (
            lowerName.includes('wrapper') ||
            lowerName.includes('bag') ||
            lowerName.includes('tissue') ||
            lowerName.includes('diaper') ||
            lowerName.includes('packet') ||
            lowerName.includes('styrofoam')
        ) {
            return {
                category: 'trash',
                label: className,
                confidence: 0,
                message: `A ${className} goes in the Trash.`,
                color: 'bg-slate-500'
            }
        }

        // Default: Unknown but maybe trash context or simply fail
        return {
            category: 'unknown',
            label: className,
            confidence: 0,
            message: `I see ${className}, but isn't sure where it goes! Check the label.`,
            color: 'bg-yellow-500'
        }
    }

    const capture = async () => {
        if (!model || !webcamRef.current || !webcamRef.current.video) return

        setIsScanning(true)
        setResult(null)

        try {
            // Get image from webcam
            const video = webcamRef.current.video

            // Classify
            const predictions = await model.classify(video)

            if (predictions && predictions.length > 0) {
                const topPrediction = predictions[0]
                const categoryResult = categorizeItem(topPrediction.className)
                categoryResult.confidence = topPrediction.probability

                setResult(categoryResult)

                // Success effects
                if (categoryResult.category !== 'unknown') {
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: categoryResult.category === 'recycle' ? ['#3b82f6', '#60a5fa'] :
                            categoryResult.category === 'compost' ? ['#22c55e', '#4ade80'] : ['#64748b']
                    })
                    await saveScan(categoryResult)
                }
            } else {
                setResult({
                    category: 'unknown',
                    label: 'Unknown',
                    confidence: 0,
                    message: "I couldn't identify that. Try getting closer!",
                    color: 'bg-yellow-500'
                })
            }
        } catch (err) {
            console.error('Scan error:', err)
            setError('Something went wrong during scanning.')
        } finally {
            setIsScanning(false)
        }
    }

    const saveScan = async (scan: ScanResult) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            await supabase.from('user_scans').insert({
                user_id: user.id,
                category: scan.category,
                object_name: scan.label,
                confidence: scan.confidence
            })
        } catch (err) {
            console.error('Failed to save history:', err)
            // Silent fail is ok for history
        }
    }

    const resetScanner = () => {
        setResult(null)
    }

    return (
        <div className="w-full max-w-md mx-auto relative group">
            {/* Main Scanner Card */}
            <div className="glass-card overflow-hidden relative min-h-[500px] flex flex-col">

                {/* Header */}
                <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-white font-bold text-lg">Eco-Lens</h3>
                            {isLoading && <span className="text-xs text-sky-300 animate-pulse">Loading Brain...</span>}
                        </div>
                        <div className="flex space-x-1">
                            {/* Visual Guide */}
                            <div className="w-3 h-3 rounded-full bg-blue-500 box-shadow-glow" title="Recycle"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500 box-shadow-glow" title="Compost"></div>
                            <div className="w-3 h-3 rounded-full bg-slate-500 box-shadow-glow" title="Trash"></div>
                        </div>
                    </div>
                </div>

                {/* Webcam Area */}
                <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <div className="flex flex-col items-center text-slate-400 space-y-4">
                            <RefreshCw className="w-10 h-10 animate-spin" />
                            <p>Loading AI Model...</p>
                        </div>
                    ) : error ? (
                        <div className="text-red-400 flex flex-col items-center p-6 text-center">
                            <AlertCircle className="w-12 h-12 mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : !result ? (
                        <>
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "environment" }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Scanning Overlay Framework */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-xl"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-xl"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-xl"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-xl"></div>

                                    {/* Scanning Beam Animation */}
                                    <motion.div
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className="absolute left-0 right-0 h-0.5 bg-sky-400 box-shadow-glow opacity-60"
                                    />
                                </div>
                                <p className="absolute bottom-20 text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                    Point at generic items (Bottles, Fruit, Wrappers)
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Result View (replaces camera or overlays it) */
                        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                            {result.category === 'recycle' && <Recycle className="w-24 h-24 text-blue-400 mb-6 animate-bounce" />}
                            {result.category === 'compost' && <Leaf className="w-24 h-24 text-green-400 mb-6 animate-bounce" />}
                            {result.category === 'trash' && <Trash2 className="w-24 h-24 text-slate-400 mb-6 animate-pulse" />}
                            {result.category === 'unknown' && <AlertCircle className="w-24 h-24 text-yellow-400 mb-6" />}

                            <h2 className={`text-3xl font-bold mb-2 ${result.category === 'recycle' ? 'text-blue-400' :
                                    result.category === 'compost' ? 'text-green-400' :
                                        result.category === 'trash' ? 'text-slate-400' : 'text-yellow-400'
                                }`}>
                                {result.category.toUpperCase()}
                            </h2>

                            <p className="text-white text-lg mb-8 leading-relaxed">
                                {result.message}
                            </p>

                            <Button onClick={resetScanner} size="lg" className="w-full max-w-xs">
                                Scan Another Item
                            </Button>
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                {!result && !isLoading && !error && (
                    <div className="p-6 bg-slate-900/50 backdrop-blur border-t border-white/10 flex justify-center">
                        <Button
                            onClick={capture}
                            disabled={isScanning}
                            size="lg"
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/30 transform transition-all active:scale-95"
                        >
                            <Camera className="mr-2 w-5 h-5" />
                            {isScanning ? 'Scanning...' : 'Scan Item'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
