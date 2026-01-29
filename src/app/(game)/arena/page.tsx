'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Brain, Check, Loader2, Play, Trophy, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useGameStore, type Question } from '@/lib/store'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import { useSound } from '@/hooks/useSound'
import { useHaptic } from '@/hooks/useHaptic'

import { LoadingOverlay } from '@/components/game/LoadingOverlay'

export default function ArenaPage() {
    return (
        <Suspense fallback={<LoadingOverlay />}>
            <ArenaContent />
        </Suspense>
    )
}

function ArenaContent() {
    const { status, currentQuestionIndex, deck, score, startGame, answerQuestion, resetGame } = useGameStore((state: any) => state)
    const currentQuestion = deck[currentQuestionIndex]

    const searchParams = useSearchParams()
    const deckId = searchParams.get('deckId')
    const [isLoadingDeck, setIsLoadingDeck] = useState(false)

    useEffect(() => {
        // If coming from Library with a specific deck ID, load it instantly
        const loadDeck = async () => {
            if (!deckId || status !== 'idle') return

            setIsLoadingDeck(true)
            const { data } = await supabase.from('decks').select('*').eq('id', deckId).single()

            if (data && data.questions) {
                startGame(data.questions, deckId)
            }
            setIsLoadingDeck(false)
        }

        loadDeck()
    }, [deckId, startGame, status])

    if (isLoadingDeck) {
        return <LoadingOverlay />
    }

    if (status === 'idle') {
        return <LobbyScreen onStart={(newDeck, newDeckId) => startGame(newDeck, newDeckId)} />
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md z-10">
                <Link href={deckId ? "/decks" : "/hub"} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="font-mono font-bold text-xl text-primary">
                    R$ {score.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground mr-2">Vidas</div>
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_var(--color-red-500)]" />
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_var(--color-red-500)]" />
                    <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_var(--color-red-500)]" />
                </div>
            </header>

            {/* Game Area */}
            <main className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {status === 'playing' && currentQuestion && (
                        <QuestionView
                            key={currentQuestion.id}
                            question={currentQuestion}
                            onAnswer={answerQuestion}
                            index={currentQuestionIndex + 1}
                            total={deck.length}
                        />
                    )}
                    {(status === 'won' || status === 'lost') && (
                        <ResultView status={status} score={score} onReset={resetGame} />
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

function LobbyScreen({ onStart }: { onStart: (deck: Question[], deckId: string) => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    // Fetch User ID on mount
    const fetchUser = async () => {
        const { supabase } = await import('@/lib/supabase') // Dynamic import to avoid SSR issues if any
        const { data } = await supabase.auth.getUser()
        if (data.user) {
            setUserId(data.user.id)
        }
    }

    // Call fetchUser once
    if (!userId) fetchUser()

    const { play } = useSound()
    const { light } = useHaptic()

    const handleStart = async () => {
        play('click')
        light()

        if (!userId) {
            alert('Erro: Usuário não identificado. Faça login novamente.')
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch('/api/generate-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: (document.getElementById('subject-input') as HTMLInputElement)?.value || 'Conhecimentos Gerais',
                    grade: 'Ensino Médio',
                    userId: userId // Sending User ID for billing
                })
            })
            const data = await res.json()

            if (!res.ok) {
                // Show specific error from server (e.g. Saldo Insuficiente)
                alert(`Erro: ${data.error || 'Falha ao criar deck'}`)
                return
            }

            if (data.deck && data.deckId) {
                onStart(data.deck, data.deckId)
            } else {
                // Handle legacy/error
                alert('Erro ao gerar deck (ID ausente).')
            }
        } catch (e) {
            console.error(e)
            alert('Erro de conexão.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {isLoading && <LoadingOverlay />}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_50%)] opacity-20" />

            <div className="w-full max-w-lg bg-card border border-border/50 p-8 rounded-3xl shadow-2xl relative">
                <Link href="/hub" className="absolute top-4 left-4 p-2 hover:bg-white/5 rounded-full"><ArrowLeft className="w-5 h-5" /></Link>

                <div className="text-center mb-8 mt-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                        <Brain className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold">Configurar Partida</h1>
                    <p className="text-muted-foreground">Personalize seu desafio de hoje.</p>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">O que vamos estudar?</label>
                        <input
                            type="text"
                            placeholder="Ex: Revolução Francesa, Verbos Irregulares..."
                            id="subject-input"
                            className="w-full bg-secondary/50 border border-border/50 rounded-xl p-4 outline-none focus:ring-2 ring-primary/50 text-lg font-medium placeholder:text-muted-foreground/50 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">Dificuldade</label>
                        <div className="flex gap-2">
                            {['Fácil', 'Médio', 'Difícil'].map((l, i) => (
                                <button key={i} className={`flex-1 py-3 rounded-xl border border-border/50 text-sm font-medium hover:bg-white/5 transition-colors ${i === 1 ? 'bg-primary/20 border-primary text-primary' : ''}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleStart}
                            disabled={isLoading}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-[0_0_20px_-5px_var(--color-primary)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <> COMPRAR E JOGAR <span className="text-xs opacity-80">(50$)</span> <Play className="w-4 h-4 fill-current" /> </>}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">O deck ficará salvo na sua biblioteca.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionView({ question, onAnswer, index, total }: any) {
    const [selected, setSelected] = useState<number | null>(null)
    const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)

    // Hooks (Only declare once!)
    const { play } = useSound()
    const { success, error, light } = useHaptic()
    const { nextQuestion, status, resetGame } = useGameStore((state: any) => state)

    const handleSelect = async (idx: number) => {
        if (selected !== null) return // Block multiple clicks
        setSelected(idx)
        play('click')
        light()

        // Short pause for tension
        await new Promise(resolve => setTimeout(resolve, 500))

        const res = onAnswer(idx)
        setResult(res)
        setShowFeedback(true)

        if (res === 'correct') {
            play('correct')
            success()
        } else {
            play('wrong')
            error()
        }
    }

    const handleNext = () => {
        // If wrong, end game now
        if (result === 'wrong') {
            // We need a way to trigger 'lost' state manually since we removed it from store's answerQuestion
            // Actually, nextQuestion checks if last question, but doesn't handle loss.
            // We can just add a 'endGame' action or handle it here?
            // Simplest: The store needs a 'endGame(status)' action or we re-introduce logic in nextQuestion?
            // Let's create a dirty fix here: if wrong, we can resetGame or similar? No, we want ResultView.
            // Ideally store should handle Game Over.
            // Let's assume we update store AGAIN to handle 'forceEnd'.
            // OR: We modify 'nextQuestion' to take a 'wasWrong' param?

            // Quick fix: Just use a direct set (if using zustand devtools might be ugly but works):
            useGameStore.setState({ status: 'lost' })
        } else {
            nextQuestion()
        }
    }

    return (
        <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
        >
            <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Questão {index}/{total}</span>
                <h2 className="text-2xl md:text-4xl font-bold mt-4 leading-tight">{question.text}</h2>
            </div>

            <div className="space-y-3">
                {question.options.map((opt: string, i: number) => {
                    let stateClass = 'bg-card/50 border-white/5 hover:bg-white/10'
                    if (selected === i) stateClass = 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                    if (result === 'correct' && i === question.correctIndex) stateClass = 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_20px_-5px_var(--color-green-500)]'
                    if (result === 'wrong' && selected === i) stateClass = 'bg-red-500/20 border-red-500 text-red-500'
                    if (result === 'wrong' && i === question.correctIndex) stateClass = 'bg-green-500/20 border-green-500 text-green-500 opacity-50'

                    return (
                        <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => handleSelect(i)}
                            disabled={selected !== null}
                            className={`w-full p-4 rounded-xl border text-left font-medium transition-all duration-300 relative overflow-hidden group ${stateClass}`}
                        >
                            <span className="opacity-50 mr-4 font-mono">{String.fromCharCode(65 + i)}</span>
                            {opt}
                        </motion.button>
                    )
                })}
            </div>

            {/* Explanation / Feedback Card */}
            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-card border border-border rounded-2xl shadow-2xl"
                    >
                        <div className={`text-lg font-bold mb-2 ${result === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                            {result === 'correct' ? 'Resposta Correta!' : 'Resposta Incorreta'}
                        </div>
                        <p className="text-muted-foreground mb-6">
                            {question.explanation || "Nenhuma explicação disponível para esta questão."}
                        </p>
                        <button
                            onClick={handleNext}
                            className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {index === total ? 'Finalizar Jogo' : 'Próxima Questão'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function ResultView({ status, score, onReset }: any) {
    const { deckId, deck } = useGameStore((state: any) => state)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const { play } = useSound()

    useEffect(() => {
        if (status === 'won') {
            play('win')
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#ffffff']
            })
        } else if (status === 'lost') {
            play('lose')
        }
    }, [status, play])

    useEffect(() => {
        // Auto-save match on mount
        const saveMatch = async () => {
            if (saved || !deckId) return
            setIsSaving(true)

            const { supabase } = await import('@/lib/supabase')
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('matches').insert({
                    user_id: user.id,
                    deck_id: deckId,
                    score: score,
                    max_score: deck.length * 100 // Assuming 100 per question roughly for percent calc
                })
                setSaved(true)
            }
            setIsSaving(false)
        }

        saveMatch()
    }, []) // Run once on mount

    return (
        <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${status === 'won' ? 'bg-green-500 text-white shadow-green-500/50' : 'bg-red-500 text-white shadow-red-500/50'}`}>
                {status === 'won' ? <Trophy className="w-10 h-10" /> : <X className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
                <h2 className="text-4xl font-bold">{status === 'won' ? 'Vitória!' : 'Fim de Jogo'}</h2>
                <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">{status === 'won' ? 'Você completou o desafio!' : 'Não desista, continue estudando.'}</p>
                    {isSaving && <span className="text-xs text-primary animate-pulse">Salvando resultado...</span>}
                    {saved && <span className="text-xs text-green-500 font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Resultado Salvo</span>}
                </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 max-w-sm mx-auto">
                <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Premiação Final</div>
                <div className="text-4xl font-mono font-bold text-primary">R$ {score.toLocaleString()}</div>
            </div>

            <div className="flex gap-4 justify-center pt-4">
                <Link href="/decks" onClick={onReset} className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors font-medium">Voltar aos Decks</Link>
                <button onClick={onReset} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Jogar Novamente</button>
            </div>
        </motion.div>
    )
}
