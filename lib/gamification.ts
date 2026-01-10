export const LEVELS = [
    { name: 'Novice', minXp: 0, color: 'text-slate-500' },
    { name: 'Scout', minXp: 100, color: 'text-emerald-500' },
    { name: 'Guardian', minXp: 300, color: 'text-blue-500' },
    { name: 'Hero', minXp: 600, color: 'text-purple-500' },
    { name: 'Legend', minXp: 1000, color: 'text-amber-500' },
]

export const getLevel = (xp: number) => {
    const level = LEVELS.slice().reverse().find(l => xp >= l.minXp) || LEVELS[0]
    const levelIndex = LEVELS.indexOf(level) + 1
    return { ...level, level: levelIndex }
}

export const getNextLevel = (xp: number) => {
    return LEVELS.find(l => l.minXp > xp) || null
}

export const calculateProgress = (xp: number) => {
    const current = getLevel(xp)
    const next = getNextLevel(xp)

    if (!next) return 100

    const range = next.minXp - current.minXp
    const progress = xp - current.minXp

    return Math.min(100, Math.max(0, (progress / range) * 100))
}

export const checkStreak = (lastActive: string | null, currentStreak: number): { newStreak: number, shouldUpdate: boolean } => {
    if (!lastActive) return { newStreak: 1, shouldUpdate: true }

    const lastDate = new Date(lastActive).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    const oneDay = 24 * 60 * 60 * 1000

    const diff = today - lastDate

    if (diff === 0) return { newStreak: currentStreak, shouldUpdate: true } // Still same day, just update time
    if (diff === oneDay) return { newStreak: currentStreak + 1, shouldUpdate: true } // Consecutive day

    return { newStreak: 1, shouldUpdate: true } // Missed a day or more
}
