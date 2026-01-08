'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { ChevronRight, CheckCircle, XCircle, Trophy, Home, Leaf } from 'lucide-react'
import { Database } from '@/types/supabase'

type Question = Database['public']['Tables']['questions']['Row']
type Quest = Database['public']['Tables']['quests']['Row']

export default function QuestPlayer() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [quest, setQuest] = useState<Quest | null>(null)
    const [allQuestions, setAllQuestions] = useState<Question[]>([]) // Store source of truth
    const [questions, setQuestions] = useState<Question[]>([]) // Current active set
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [showReview, setShowReview] = useState(false)
    const [userAnswers, setUserAnswers] = useState<{ questionId: number, selectedIdx: number, isCorrect: boolean }[]>([])
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [score, setScore] = useState(0)
    const [isCompleted, setIsCompleted] = useState(false)
    const [loading, setLoading] = useState(true)

    // Fetch Quest and Questions
    useEffect(() => {
        const fetchQuestData = async () => {
            if (!id) return

            const [questResult, questionsResult] = await Promise.all([
                supabase.from('quests').select('*').eq('id', Number(id)).single(),
                supabase.from('questions').select('*').eq('quest_id', Number(id)).order('id', { ascending: true })
            ])

            if (questResult.data) setQuest(questResult.data)
            if (questionsResult.data) {
                setAllQuestions(questionsResult.data)
                setQuestions(questionsResult.data)
            }

            setLoading(false)
        }

        fetchQuestData()
    }, [id, supabase])

    const handleOptionSelect = (index: number) => {
        if (isAnswered) return
        setSelectedOption(index)
    }

    const handleSubmitAnswer = () => {
        if (selectedOption === null) return

        const currentQuestion = questions[currentQuestionIndex]
        const isCorrect = selectedOption === currentQuestion.correct_answer_index

        setIsAnswered(true)

        // Track answer
        setUserAnswers(prev => [...prev, {
            questionId: currentQuestion.id,
            selectedIdx: selectedOption,
            isCorrect
        }])

        if (isCorrect) {
            setScore(prev => prev + 10)
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } })
            import('@/lib/audio').then(m => m.playSound('success'))
        } else {
            import('@/lib/audio').then(m => m.playSound('error'))
        }
    }

    const handleNextQuestion = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedOption(null)
            setIsAnswered(false)
        } else {
            await finishQuest()
        }
    }

    const handleRetryIncorrect = () => {
        const incorrectIds = userAnswers.filter(a => !a.isCorrect).map(a => a.questionId)
        if (incorrectIds.length === 0) return

        const incorrectQuestions = allQuestions.filter(q => incorrectIds.includes(q.id))

        setQuestions(incorrectQuestions)
        resetQuizState()
    }

    const handleRestart = () => {
        setQuestions(allQuestions)
        resetQuizState()
    }

    const resetQuizState = () => {
        setCurrentQuestionIndex(0)
        setSelectedOption(null)
        setIsAnswered(false)
        setScore(0)
        setIsCompleted(false)
        setShowReview(false)
        setUserAnswers([])
    }

    const finishQuest = async (overrideScore?: number) => {
        setIsCompleted(true)
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } })

        const finalScore = overrideScore ?? score

        const { data: { user } } = await supabase.auth.getUser()
        if (user && quest) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('user_progress') as any).insert({
                user_id: user.id,
                quest_id: quest.id,
                score: finalScore
            })

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
            if (profile) {
                const newXp = (profile.xp || 0) + finalScore
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (supabase.from('profiles') as any).update({ xp: newXp }).eq('id', user.id)

                if (Math.floor(newXp / 100) > Math.floor((profile.xp || 0) / 100)) {
                    confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } })
                    import('@/lib/audio').then(m => m.playSound('level-up'))
                    toast("Level Up! You're a sustainability hero!", 'success')
                }
            }
        }
    }

    const currentQuestion = questions[currentQuestionIndex]

    if (loading) {
        return (
            <div className="min-h-screen py-10 px-4 md:px-0 flex items-center justify-center">
                <div className="max-w-3xl w-full glass-card p-6 md:p-10 min-h-[500px] flex flex-col animate-pulse">
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        <div className="h-6 w-20 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="h-8 w-3/4 bg-slate-200 rounded mb-8"></div>
                    <div className="space-y-4 flex-grow">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-16 w-full bg-slate-100 rounded-2xl border-2 border-slate-100"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
    if (!quest) return <div className="min-h-screen flex items-center justify-center text-white">Quest Not Found</div>

    // Review UI
    if (showReview) {
        return (
            <div className="min-h-screen py-10 px-4 md:px-0 flex justify-center">
                <div className="w-full max-w-3xl">
                    <div className="glass-card p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">Mission Review</h2>
                            <Button onClick={() => router.push('/')} variant="ghost">Back to Dashboard</Button>
                        </div>

                        <div className="space-y-8">
                            {allQuestions.map((q, idx) => {
                                const answer = userAnswers.find(a => a.questionId === q.id)
                                // If not answered in this session (e.g. wasn't in partial set), skip or show as skipped?
                                // Actually, userAnswers will only have current session answers.
                                // For a full review of "All Questions", we might miss info if we just did a partial run.
                                // But typically Review is for the *current run*.
                                // If we did a partial run, we should probably only show the partial questions in review?
                                // Let's use `questions` map instead of `allQuestions` map for review to be consistent with what was just played.

                                const isCorrect = answer?.isCorrect
                                if (!answer) return null // Should not happen for executed questions

                                return (
                                    <div key={q.id} className={`p-6 rounded-2xl border-2 ${isCorrect ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                                        <div className="flex items-start mb-4">
                                            <div className={`mt-1 mr-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg mb-2">
                                                    {q.question_text}
                                                </h3>
                                                <div className="space-y-2">
                                                    {q.options.map((opt, optIdx) => {
                                                        const isSelected = answer?.selectedIdx === optIdx
                                                        const isTarget = q.correct_answer_index === optIdx

                                                        if (!isSelected && !isTarget) return null

                                                        return (
                                                            <div key={optIdx} className={`flex items-center text-sm p-2 rounded-lg ${isTarget ? 'bg-green-200 text-green-800 font-bold' :
                                                                isSelected ? 'bg-red-200 text-red-800 line-through opacity-70' : ''
                                                                }`}>
                                                                {isTarget && <CheckCircle className="w-3 h-3 mr-2" />}
                                                                {isSelected && !isTarget && <XCircle className="w-3 h-3 mr-2" />}
                                                                {opt}
                                                                {isTarget && <span className="ml-auto text-xs uppercase tracking-wider bg-green-600 text-white px-2 py-0.5 rounded-full">Correct</span>}
                                                                {isSelected && !isTarget && <span className="ml-auto text-xs uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">Your Answer</span>}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                {q.explanation && (
                                                    <div className="mt-4 text-sm text-slate-600 bg-white/50 p-3 rounded-lg italic border border-slate-200">
                                                        💡 {q.explanation}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 flex justify-center space-x-4">
                            <Button onClick={() => router.push('/')} variant="ghost">Return to Base</Button>
                            {userAnswers.some(a => !a.isCorrect) && (
                                <Button onClick={handleRetryIncorrect} className="bg-orange-500 hover:bg-orange-600 text-white">
                                    Retry Incorrect
                                </Button>
                            )}
                            <Button onClick={handleRestart} variant="primary">
                                Restart Mission
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Action Quest UI
    if (quest.type === 'action') {
        return (
            <div className="min-h-screen py-10 px-4 md:px-0 flex items-center justify-center">
                <div className="max-w-xl w-full">
                    <AnimatePresence mode="wait">
                        {!isCompleted ? (
                            <motion.div
                                key="action-card"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-8 md:p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Leaf className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-4">{quest.title}</h2>
                                <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                                    {quest.description}
                                </p>

                                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 text-left">
                                    <h4 className="font-bold text-green-800 mb-3 flex items-center">
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Your Mission:
                                    </h4>
                                    <ul className="space-y-3 text-green-900/80">
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Complete the real-world action described above.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Reflect on how this helps the planet.</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2">•</span>
                                            <span>Click the button below to claim your impact!</span>
                                        </li>
                                    </ul>
                                </div>

                                <Button
                                    onClick={() => {
                                        setScore(100) // Fixed reward for actions
                                        finishQuest(100)
                                    }}
                                    size="lg"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-green-500/30 shadow-xl"
                                >
                                    I Did It! Claim 100 XP
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card p-12 text-center"
                            >
                                <div className="w-24 h-24 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-400/30">
                                    <Trophy className="w-12 h-12 text-white" />
                                </div>
                                <h2 className="text-4xl font-bold text-slate-900 mb-2">Impact Made!</h2>
                                <p className="text-slate-500 text-lg mb-8">You are a true Earth Guardian.</p>

                                <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                                    <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Reward</div>
                                    <div className="text-5xl font-black text-slate-900">100 <span className="text-2xl text-slate-400">XP</span></div>
                                </div>

                                <Button
                                    onClick={() => router.push('/')}
                                    size="lg"
                                    className="w-full"
                                >
                                    <Home className="mr-2 w-5 h-5" />
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        )
    }

    // Quiz UI (Existing)
    if (questions.length === 0) return <div className="min-h-screen flex items-center justify-center text-white">Quest Not Found</div>

    return (
        <div className="min-h-screen py-10 px-4 md:px-0 flex items-center justify-center">
            <div className="max-w-3xl w-full">
                <AnimatePresence mode="wait">
                    {!isCompleted ? (
                        <motion.div
                            key="question-card"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card p-6 md:p-10 min-h-[500px] flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </span>
                                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
                                    <Trophy className="w-4 h-4" />
                                    <span>{score} XP</span>
                                </div>
                            </div>

                            {/* Question */}
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-8 leading-tight">
                                {currentQuestion.question_text}
                            </h2>

                            {/* Options */}
                            <div className="space-y-4 mb-8 flex-grow">
                                {currentQuestion.options.map((option, idx) => {
                                    const isSelected = selectedOption === idx
                                    const isCorrect = currentQuestion.correct_answer_index === idx
                                    const showResult = isAnswered

                                    let buttonStyle = "w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 text-lg font-medium "

                                    if (showResult) {
                                        if (isCorrect) buttonStyle += "border-green-500 bg-green-50 text-green-700 "
                                        else if (isSelected) buttonStyle += "border-red-500 bg-red-50 text-red-700 "
                                        else buttonStyle += "border-slate-100 opacity-50 "
                                    } else {
                                        if (isSelected) buttonStyle += "border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-[1.01] "
                                        else buttonStyle += "border-slate-200 hover:border-blue-300 hover:bg-slate-50 "
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(idx)}
                                            disabled={isAnswered}
                                            className={buttonStyle}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{option}</span>
                                                {showResult && isCorrect && <CheckCircle className="text-green-500 w-6 h-6" />}
                                                {showResult && isSelected && !isCorrect && <XCircle className="text-red-500 w-6 h-6" />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Footer / Actions */}
                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                <div className="text-sm text-slate-400 font-medium">
                                    Topic: {quest.title}
                                </div>

                                <div>
                                    {!isAnswered ? (
                                        <Button
                                            onClick={handleSubmitAnswer}
                                            disabled={selectedOption === null}
                                            size="lg"
                                            variant="primary"
                                            className="shadow-xl"
                                        >
                                            Check Answer
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNextQuestion}
                                            size="lg"
                                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl"
                                        >
                                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quest'}
                                            <ChevronRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Explanation (Optional) */}
                            {isAnswered && currentQuestion.explanation && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm leading-relaxed"
                                >
                                    <span className="font-bold block mb-1">Did you know?</span>
                                    {currentQuestion.explanation}
                                </motion.div>
                            )}

                        </motion.div>
                    ) : (
                        <motion.div
                            key="result-card"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-card p-12 text-center max-w-lg mx-auto"
                        >
                            <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-400/30">
                                <Trophy className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-2">Quest Complete!</h2>
                            <p className="text-slate-500 text-lg mb-8">You've mastered {quest.title}!</p>

                            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Total Score</div>
                                <div className="text-5xl font-black text-slate-900">{score} <span className="text-2xl text-slate-400">XP</span></div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={() => setShowReview(true)}
                                    size="lg"
                                    variant="secondary"
                                    className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                    Review Answers
                                </Button>
                                <Button
                                    onClick={() => router.push('/')}
                                    size="lg"
                                    className="w-full"
                                >
                                    <Home className="mr-2 w-5 h-5" />
                                    Back to Dashboard
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
