'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Home, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type ItemType = 'compost' | 'recycle' | 'trash'
type Lane = 'left' | 'center' | 'right'

interface FallingItem {
    id: number
    type: ItemType
    lane: Lane
    x: number
    y: number
    speed: number
}

const ITEM_CONFIG: Record<ItemType, { emoji: string; name: string }> = {
    compost: { emoji: '🍎', name: 'Apple' },
    recycle: { emoji: '🥤', name: 'Bottle' },
    trash: { emoji: '🍾', name: 'Glass' }
}

const BIN_CONFIG: Record<ItemType, { color: string; label: string }> = {
    compost: { color: 'bg-green-500', label: 'Compost' },
    recycle: { color: 'bg-blue-500', label: 'Recycle' },
    trash: { color: 'bg-gray-500', label: 'Trash' }
}

const GAME_WIDTH = 400
const GAME_HEIGHT = 600
const BIN_WIDTH = 80
const BIN_HEIGHT = 100
const ITEM_SIZE = 40
const LANE_POSITIONS = {
    left: 60,
    center: 200,
    right: 340
}

export default function RecyclingRunGame() {
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [isGameOver, setIsGameOver] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [shake, setShake] = useState(false)

    // Refs for game state (mutable, doesn't trigger re-renders)
    const playerXRef = useRef(GAME_WIDTH / 2 - BIN_WIDTH * 1.5)
    const fallingItemsRef = useRef<FallingItem[]>([])
    const lastSpawnTimeRef = useRef(0)
    const animationFrameRef = useRef<number | null>(null)
    const itemIdCounterRef = useRef(0)
    const keysPressed = useRef<Set<string>>(new Set())

    const gameContainerRef = useRef<HTMLDivElement>(null)

    // Reset game
    const resetGame = () => {
        setScore(0)
        setLives(3)
        setIsGameOver(false)
        setIsPaused(false)
        playerXRef.current = GAME_WIDTH / 2 - BIN_WIDTH * 1.5
        fallingItemsRef.current = []
        lastSpawnTimeRef.current = 0
        itemIdCounterRef.current = 0
    }

    // Spawn a new item
    const spawnItem = () => {
        const lanes: Lane[] = ['left', 'center', 'right']
        const types: ItemType[] = ['compost', 'recycle', 'trash']

        const lane = lanes[Math.floor(Math.random() * lanes.length)]
        const type = types[Math.floor(Math.random() * types.length)]

        const newItem: FallingItem = {
            id: itemIdCounterRef.current++,
            type,
            lane,
            x: LANE_POSITIONS[lane],
            y: -ITEM_SIZE,
            speed: 2 + Math.random() * 1
        }

        fallingItemsRef.current.push(newItem)
    }

    // Check collision
    const checkCollision = (item: FallingItem) => {
        const binY = GAME_HEIGHT - BIN_HEIGHT - 20

        if (item.y + ITEM_SIZE >= binY && item.y <= binY + BIN_HEIGHT) {
            // Determine which bin is under the item
            const binPositions = [
                { type: 'compost' as ItemType, x: playerXRef.current },
                { type: 'recycle' as ItemType, x: playerXRef.current + BIN_WIDTH },
                { type: 'trash' as ItemType, x: playerXRef.current + BIN_WIDTH * 2 }
            ]

            for (const bin of binPositions) {
                if (item.x >= bin.x && item.x <= bin.x + BIN_WIDTH) {
                    // Collision detected!
                    if (bin.type === item.type) {
                        // Correct bin!
                        setScore(s => s + 10)
                        return true
                    } else {
                        // Wrong bin!
                        setLives(l => {
                            const newLives = l - 1
                            if (newLives <= 0) {
                                setIsGameOver(true)
                            }
                            return newLives
                        })
                        setShake(true)
                        setTimeout(() => setShake(false), 500)
                        return true
                    }
                }
            }
        }

        // Item fell off screen
        if (item.y > GAME_HEIGHT) {
            setLives(l => {
                const newLives = l - 1
                if (newLives <= 0) {
                    setIsGameOver(true)
                }
                return newLives
            })
            return true
        }

        return false
    }

    // Game loop
    useEffect(() => {
        if (isGameOver || isPaused) return

        let lastTime = performance.now()

        const gameLoop = (currentTime: number) => {
            const deltaTime = currentTime - lastTime
            lastTime = currentTime

            // Spawn items every 1.5 seconds
            if (currentTime - lastSpawnTimeRef.current > 1500) {
                spawnItem()
                lastSpawnTimeRef.current = currentTime
            }

            // Update falling items
            fallingItemsRef.current = fallingItemsRef.current.filter(item => {
                item.y += item.speed
                return !checkCollision(item)
            })

            // Handle keyboard movement
            const moveSpeed = 5
            if (keysPressed.current.has('ArrowLeft')) {
                playerXRef.current = Math.max(0, playerXRef.current - moveSpeed)
            }
            if (keysPressed.current.has('ArrowRight')) {
                playerXRef.current = Math.min(GAME_WIDTH - BIN_WIDTH * 3, playerXRef.current + moveSpeed)
            }

            // Force re-render
            if (gameContainerRef.current) {
                gameContainerRef.current.style.transform = `translateX(0px)` // Trigger paint
            }

            animationFrameRef.current = requestAnimationFrame(gameLoop)
        }

        animationFrameRef.current = requestAnimationFrame(gameLoop)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [isGameOver, isPaused])

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault()
                keysPressed.current.add(e.key)
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current.delete(e.key)
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    // Mobile controls
    const handleMobileMove = (direction: 'left' | 'right') => {
        const moveAmount = 40
        if (direction === 'left') {
            playerXRef.current = Math.max(0, playerXRef.current - moveAmount)
        } else {
            playerXRef.current = Math.min(GAME_WIDTH - BIN_WIDTH * 3, playerXRef.current + moveAmount)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="w-full max-w-md mb-4 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" className="text-slate-300">
                        <Home className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                    ♻️ Recycling Run
                </h1>
                <div className="w-10" />
            </div>

            {/* Score & Lives */}
            <div className="w-full max-w-md mb-4 flex justify-between items-center bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                <div>
                    <p className="text-sm text-slate-400">Score</p>
                    <p className="text-3xl font-black text-green-400">{score}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Lives</p>
                    <p className="text-3xl font-black text-red-400">{'❤️'.repeat(Math.max(0, lives))}</p>
                </div>
            </div>

            {/* Game Container */}
            <div
                ref={gameContainerRef}
                className={`relative bg-gradient-to-b from-sky-900 to-slate-800 rounded-2xl overflow-hidden border-4 border-slate-700 shadow-2xl ${shake ? 'animate-shake' : ''}`}
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            >
                {/* Falling Items */}
                {fallingItemsRef.current.map(item => (
                    <div
                        key={item.id}
                        className="absolute text-4xl transition-none"
                        style={{
                            left: item.x - ITEM_SIZE / 2,
                            top: item.y,
                            width: ITEM_SIZE,
                            height: ITEM_SIZE
                        }}
                    >
                        {ITEM_CONFIG[item.type].emoji}
                    </div>
                ))}

                {/* Bins */}
                <div
                    className="absolute bottom-5 flex gap-0 transition-none"
                    style={{
                        left: playerXRef.current,
                        width: BIN_WIDTH * 3
                    }}
                >
                    {(['compost', 'recycle', 'trash'] as ItemType[]).map(type => (
                        <div
                            key={type}
                            className={`${BIN_CONFIG[type].color} rounded-t-2xl flex flex-col items-center justify-center text-white font-bold shadow-lg`}
                            style={{ width: BIN_WIDTH, height: BIN_HEIGHT }}
                        >
                            <span className="text-2xl mb-1">🗑️</span>
                            <span className="text-xs">{BIN_CONFIG[type].label}</span>
                        </div>
                    ))}
                </div>

                {/* Mobile Touch Controls */}
                <button
                    className="absolute left-0 top-0 bottom-0 w-1/2 opacity-0 active:opacity-10 active:bg-white transition-opacity"
                    onTouchStart={() => handleMobileMove('left')}
                    onClick={() => handleMobileMove('left')}
                />
                <button
                    className="absolute right-0 top-0 bottom-0 w-1/2 opacity-0 active:opacity-10 active:bg-white transition-opacity"
                    onTouchStart={() => handleMobileMove('right')}
                    onClick={() => handleMobileMove('right')}
                />

                {/* Game Over Overlay */}
                <AnimatePresence>
                    {isGameOver && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center"
                        >
                            <h2 className="text-4xl font-black text-white mb-4">Game Over!</h2>
                            <p className="text-2xl text-green-400 mb-6">Final Score: {score}</p>
                            <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600">
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Play Again
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="mt-6 max-w-md text-center text-slate-400 text-sm">
                <p className="mb-2">🎮 <strong>Desktop:</strong> Use Arrow Keys ← →</p>
                <p>📱 <strong>Mobile:</strong> Tap left/right sides of the screen</p>
                <p className="mt-2 text-xs">Match items to the correct bin color!</p>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
            `}</style>
        </div>
    )
}
