'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseNarratorReturn {
    speak: (text: string) => void
    pause: () => void
    resume: () => void
    stop: () => void
    isSpeaking: boolean
    isPaused: boolean
    speechRate: number
    setSpeechRate: (rate: number) => void
    voices: SpeechSynthesisVoice[]
    currentVoice: SpeechSynthesisVoice | null
    setCurrentVoice: (voice: SpeechSynthesisVoice) => void
}

export function useNarrator(onEnd?: () => void): UseNarratorReturn {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [speechRate, setSpeechRate] = useState(1.0)
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
    const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null)

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices()

            // Filter for English voices
            const englishVoices = availableVoices.filter(voice =>
                voice.lang.startsWith('en')
            )

            setVoices(englishVoices)

            // Try to find a female voice (often better for narration)
            const femaleVoice = englishVoices.find(voice =>
                voice.name.toLowerCase().includes('female') ||
                voice.name.toLowerCase().includes('samantha') ||
                voice.name.toLowerCase().includes('victoria') ||
                voice.name.toLowerCase().includes('zira')
            )

            // Fallback to first English voice or any voice
            setCurrentVoice(femaleVoice || englishVoices[0] || availableVoices[0] || null)
        }

        loadVoices()

        // Chrome loads voices asynchronously
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.onvoiceschanged = loadVoices
        }

        return () => {
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.onvoiceschanged = null
            }
        }
    }, [])

    const speak = useCallback((text: string) => {
        if (!text || typeof window === 'undefined') return

        // Stop any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)

        if (currentVoice) {
            utterance.voice = currentVoice
        }

        utterance.rate = speechRate
        utterance.pitch = 1.0
        utterance.volume = 1.0

        utterance.onstart = () => {
            setIsSpeaking(true)
            setIsPaused(false)
        }

        utterance.onend = () => {
            setIsSpeaking(false)
            setIsPaused(false)
            onEnd?.()
        }

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event)
            setIsSpeaking(false)
            setIsPaused(false)
        }

        utteranceRef.current = utterance
        window.speechSynthesis.speak(utterance)
    }, [currentVoice, speechRate, onEnd])

    const pause = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.speaking) {
            window.speechSynthesis.pause()
            setIsPaused(true)
        }
    }, [])

    const resume = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
            setIsPaused(false)
        }
    }, [])

    const stop = useCallback(() => {
        if (typeof window !== 'undefined') {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            setIsPaused(false)
        }
    }, [])

    return {
        speak,
        pause,
        resume,
        stop,
        isSpeaking,
        isPaused,
        speechRate,
        setSpeechRate,
        voices,
        currentVoice,
        setCurrentVoice
    }
}
