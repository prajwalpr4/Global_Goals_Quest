'use client'

import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { Stage, Layer, Text } from 'react-konva'
// import Konva from 'konva' // Typically imported as default

interface DrawingCanvasProps {
    onSave?: (dataUrl: string) => void
    width?: number
    height?: number
}

// Stamps Palette
const STAMPS = [
    { emoji: '🌳', label: 'Tree' },
    { emoji: '🌿', label: 'Plant' },
    { emoji: '💧', label: 'Water' },
    { emoji: '🦜', label: 'Bird' },
    { emoji: '🐢', label: 'Turtle' },
    { emoji: '🐟', label: 'Fish' },
    { emoji: '🐝', label: 'Bee' },
    { emoji: '☀️', label: 'Sun' },
    { emoji: '☁️', label: 'Cloud' },
]

export interface DrawingCanvasHandle {
    exportImage: () => string;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>((props, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const stageRef = useRef<any>(null)
    const [stamps, setStamps] = useState<{ id: number, emoji: string, x: number, y: number }[]>([])

    useImperativeHandle(ref, () => ({
        exportImage: () => {
            if (stageRef.current) {
                return stageRef.current.toDataURL({ pixelRatio: 2 })
            }
            return ''
        }
    }))

    const addStamp = (emoji: string) => {
        const id = Date.now()
        setStamps([...stamps, {
            id,
            emoji,
            x: (props.width || 600) / 2 + (Math.random() * 40 - 20),
            y: (props.height || 400) / 2 + (Math.random() * 40 - 20)
        }])
    }

    const removeStamp = (id: number) => {
        setStamps(stamps.filter(s => s.id !== id))
    }

    const handleDragEnd = (id: number, e: any) => {
        setStamps(stamps.map(s => {
            if (s.id === id) {
                return {
                    ...s,
                    x: e.target.x(),
                    y: e.target.y()
                }
            }
            return s
        }))
    }

    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Toolbar */}
            <div className="bg-white/10 p-4 rounded-2xl md:w-48 flex flex-col gap-4 backdrop-blur-sm border border-white/20">
                <h3 className="text-white font-bold text-lg mb-2">Stickers</h3>
                <div className="grid grid-cols-2 gap-2">
                    {STAMPS.map((stamp) => (
                        <button
                            key={stamp.label}
                            onClick={() => addStamp(stamp.emoji)}
                            className="bg-white/20 hover:bg-white/30 text-2xl p-3 rounded-xl transition-all hover:scale-110 active:scale-95 border border-white/10"
                            title={stamp.label}
                        >
                            {stamp.emoji}
                        </button>
                    ))}
                </div>
                <div className="mt-4 text-xs text-white/50 text-center">
                    Click to add.<br />Drag to move.<br />Double click to remove.
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 bg-white rounded-xl shadow-2xl overflow-hidden border-8 border-slate-200 dark:border-slate-700 relative">
                {/* Next.js doesn't love Konva directly in SSR, so we typically rely on 'use client' and maybe dynamic imports if strict SSR needed. Since this whole component 'use client', standard Stage works. */}
                <Stage
                    width={props.width || 600}
                    height={props.height || 400}
                    ref={stageRef}
                    className="bg-white cursor-crosshair"
                >
                    <Layer>
                        {stamps.map((stamp) => (
                            <Text
                                key={stamp.id}
                                text={stamp.emoji}
                                x={stamp.x}
                                y={stamp.y}
                                fontSize={50}
                                draggable
                                onDragEnd={(e) => handleDragEnd(stamp.id, e)}
                                onDblClick={() => removeStamp(stamp.id)}
                                // Add touch events for mobile
                                onTap={() => { }} // Could be select
                                onDblTap={() => removeStamp(stamp.id)}
                            />
                        ))}
                        {stamps.length === 0 && (
                            <Text
                                text="Place some stickers here!"
                                x={(props.width || 600) / 2 - 100}
                                y={(props.height || 400) / 2}
                                fontSize={20}
                                fill="#cbd5e1"
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    )
})

DrawingCanvas.displayName = 'DrawingCanvas'
