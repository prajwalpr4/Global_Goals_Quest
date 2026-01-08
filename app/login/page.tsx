'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import { Globe, Leaf, Star } from 'lucide-react'

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                            avatar_url: `https://api.dicebear.com/7.x/micah/svg?seed=${username}`,
                        },
                    },
                })
                if (error) throw error
                // In a real app, you might show a success message or redirect to a verify page
                alert('Check your email for the confirmation link!')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements for depth */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute -bottom-[20%] left-[20%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-2000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="backdrop-blur-2xl bg-black/30 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl ring-1 ring-white/5">

                    {/* Header Section */}
                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            initial={{ y: -10 }} animate={{ y: 0 }}
                            className="h-20 w-20 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-6 text-slate-900"
                        >
                            <Globe className="w-10 h-10" strokeWidth={2.5} />
                        </motion.div>
                        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-emerald-100 text-center tracking-tight mb-2">
                            {isSignUp ? 'Begin Adventure' : 'Welcome Back'}
                        </h1>
                        <p className="text-slate-400 font-medium text-center text-lg">Global Goals Quest</p>
                    </div>

                    {/* Auth Form */}
                    <form onSubmit={handleAuth} className="space-y-5">
                        {isSignUp && (
                            <div className="group">
                                <Input
                                    placeholder="Choose a username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 rounded-xl transition-all group-hover:border-white/20"
                                />
                            </div>
                        )}
                        <div className="group">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 rounded-xl transition-all group-hover:border-white/20"
                            />
                        </div>
                        <div className="group">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20 h-12 rounded-xl transition-all group-hover:border-white/20"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="text-red-400 text-sm font-medium text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 hover:from-cyan-300 hover:to-emerald-400 text-slate-900 shadow-lg shadow-cyan-500/20 border-0 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            variant="primary"
                            isLoading={isLoading}
                        >
                            {isSignUp ? 'Start Your Journey' : 'Resume Quest'}
                        </Button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-semibold text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}
