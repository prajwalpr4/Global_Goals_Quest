"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="glass" size="icon" className="w-10 h-10 rounded-full">
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    return (
        <Button
            variant="glass"
            size="icon"
            className="w-10 h-10 rounded-full relative overflow-hidden"
            onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
                import('@/lib/audio').then(m => m.playSound('click'))
                // toast(`Switched to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`, 'info')
            }}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
