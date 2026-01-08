export const playSound = (type: 'success' | 'error' | 'click' | 'level-up') => {
    if (typeof window === 'undefined') return

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return

    const ctx = new AudioContext()

    const playTone = (freq: number, type: OscillatorType, duration: number, startTime: number = 0) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime)

        gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(ctx.currentTime + startTime)
        osc.stop(ctx.currentTime + startTime + duration)
    }

    switch (type) {
        case 'click':
            playTone(800, 'sine', 0.1)
            break
        case 'success':
            playTone(600, 'sine', 0.1)
            playTone(900, 'sine', 0.2, 0.1)
            break
        case 'error':
            playTone(300, 'sawtooth', 0.2)
            playTone(200, 'sawtooth', 0.3, 0.1)
            break
        case 'level-up':
            playTone(400, 'sine', 0.2)
            playTone(500, 'sine', 0.2, 0.1)
            playTone(600, 'sine', 0.2, 0.2)
            playTone(800, 'sine', 0.4, 0.3)
            break
    }
}
