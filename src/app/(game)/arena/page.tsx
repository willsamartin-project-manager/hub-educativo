'use client'

import { useState, useEffect, Suspense, memo, useCallback } from 'react'
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
    // SELECTORS: Granular selection to prevent unnecessary re-renders
    const status = useGameStore(state => state.status)
    const currentQuestionIndex = useGameStore(state => state.currentQuestionIndex)
    const deck = useGameStore(state => state.deck)
    const score = useGameStore(state => state.score)
    const mode = useGameStore(state => state.mode)
    const subject = useGameStore(state => state.subject)
    const grade = useGameStore(state => state.grade)
    const lives = useGameStore(state => state.lives)

    // Actions rarely change, but good to act effectively
    const startGame = useGameStore(state => state.startGame)
    const answerQuestion = useGameStore(state => state.answerQuestion)
    const resetGame = useGameStore(state => state.resetGame)
    const restartGame = useGameStore(state => state.restartGame)
    const appendQuestions = useGameStore(state => state.appendQuestions)

    const currentQuestion = deck[currentQuestionIndex]

    const searchParams = useSearchParams()
    const deckId = searchParams.get('deckId')
    const [isLoadingDeck, setIsLoadingDeck] = useState(false)

    // Marathon Mode Controller
    useEffect(() => {
        if (mode !== 'marathon' || status !== 'playing') return

        const thresholds = [deck.length - 3, deck.length - 1]
        const shouldFetch = thresholds.includes(currentQuestionIndex)

        const fetchMore = async () => {
            if (deck.length - currentQuestionIndex > 5) return

            console.log('Marathon Mode: Fetching more questions...')
            try {
                const res = await fetch('/api/generate-deck', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: subject || 'Conhecimentos Gerais',
                        grade: grade || 'Ensino Médio',
                        userId: 'marathon-refill',
                    })
                })
                const data = await res.json()
                if (data.deck) {
                    appendQuestions(data.deck)
                }
            } catch (e) {
                console.error('Refill failed', e)
            }
        }

        if (shouldFetch) {
            fetchMore()
        }
    }, [currentQuestionIndex, mode, status, deck.length, subject, grade, appendQuestions])


    useEffect(() => {
        const loadDeck = async () => {
            if (!deckId) return

            setIsLoadingDeck(true)
            const { data } = await supabase.from('decks').select('*').eq('id', deckId).single()

            if (data && data.questions) {
                startGame(data.questions, deckId, 'standard', data.subject, data.grade)
            }
            setIsLoadingDeck(false)
        }

        loadDeck()
    }, [deckId, startGame])

    if (isLoadingDeck) {
        return <LoadingOverlay />
    }

    if (status === 'idle') {
        return <LobbyScreen onStart={startGame} />
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Ambient Background - Optimized */}
            <div className="absolute top-0 left-0 w-full h-full -z-10 bg-[radial-gradient(circle_at_top,_var(--color-primary)_0%,_transparent_40%)] opacity-20" />

            {/* Header */}
            <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 backdrop-blur-md z-10">
                <Link href={deckId ? "/decks" : "/hub"} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="font-mono font-bold text-xl text-primary">
                    <span className="text-xs text-muted-foreground mr-2">{mode === 'marathon' ? '∞ MARATONA' : ''}</span>
                    R$ {score.toLocaleString()}
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground mr-2">Vidas</div>
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all duration-500 ${i < lives ? 'bg-red-500 shadow-[0_0_10px_var(--color-red-500)]' : 'bg-gray-800'}`}
                        />
                    ))}
                </div>
            </header>

            {/* Game Area */}
            <main className="flex-1 flex items-center justify-center p-4">
                <AnimatePresence mode="wait">
                    {status === 'playing' && currentQuestion && (
                        <QuestionView
                            key={currentQuestion.id} // Essential for animation
                            question={currentQuestion}
                            onAnswer={answerQuestion}
                            index={currentQuestionIndex + 1}
                            total={deck.length}
                            mode={mode}
                        />
                    )}
                    {(status === 'won' || status === 'lost') && (
                        <ResultView status={status} score={score} onReset={resetGame} onRestart={restartGame} />
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

// MEMOIZED COMPONENT
const LobbyScreen = memo(function LobbyScreen({ onStart }: { onStart: (deck: Question[], deckId: string, mode: any, subject: string, grade: string) => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [selectedGrade, setSelectedGrade] = useState('Ensino Médio')
    const [selectedMode, setSelectedMode] = useState<'standard' | 'marathon'>('standard')

    const fetchUser = async () => {
        const { supabase } = await import('@/lib/supabase')
        const { data } = await supabase.auth.getUser()
        if (data.user) {
            setUserId(data.user.id)
        }
    }

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

        const subject = (document.getElementById('subject-input') as HTMLInputElement)?.value || 'Conhecimentos Gerais'

        setIsLoading(true)
        try {
            const res = await fetch('/api/generate-deck', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    grade: selectedGrade,
                    userId: userId,
                })
            })
            const data = await res.json()

            if (!res.ok) {
                alert(`Erro: ${data.error || 'Falha ao criar deck'}`)
                return
            }

            if (data.deck && data.deckId) {
                onStart(data.deck, data.deckId, selectedMode, subject, selectedGrade)
            } else {
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
                        <label className="text-xs uppercase font-bold text-muted-foreground">Modo de Jogo</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setSelectedMode('standard')}
                                className={`p-4 rounded-xl border border-border/50 text-left transition-all relative overflow-hidden ${selectedMode === 'standard' ? 'bg-primary/20 border-primary shadow-[0_0_15px_-5px_var(--color-primary)]' : 'hover:bg-white/5'}`}
                            >
                                <div className="font-bold mb-1">Padrão</div>
                                <div className="text-xs text-muted-foreground">10 Perguntas<br />50 Moedas</div>
                                {selectedMode === 'standard' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />}
                            </button>
                            <button
                                onClick={() => setSelectedMode('marathon')}
                                className={`p-4 rounded-xl border border-border/50 text-left transition-all relative overflow-hidden ${selectedMode === 'marathon' ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_-5px_purple]' : 'hover:bg-white/5'}`}
                            >
                                <div className="font-bold mb-1 text-purple-400">Maratona ∞</div>
                                <div className="text-xs text-muted-foreground">Infinito<br />100 Moedas</div>
                                {selectedMode === 'marathon' && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500 animate-pulse" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-muted-foreground">Nível de Ensino</label>
                        <div className="flex gap-2">
                            {['Fundamental', 'Ensino Médio', 'Superior'].map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={`flex-1 py-3 rounded-xl border border-border/50 text-sm font-medium hover:bg-white/5 transition-colors ${selectedGrade === grade ? 'bg-primary/20 border-primary text-primary' : ''}`}
                                >
                                    {grade}
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
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                                COMPRAR E JOGAR
                                <span className="text-xs opacity-80 bg-black/20 px-2 py-0.5 rounded-full">
                                    {selectedMode === 'marathon' ? '100$' : '50$'}
                                </span>
                                <Play className="w-4 h-4 fill-current" />
                            </>}
                        </button>
                        <p className="text-xs text-center text-muted-foreground">O deck ficará salvo na sua biblioteca.</p>
                    </div>
                </div>
            </div>
        </div>
    )
})

// MEMOIZED COMPONENT
const QuestionView = memo(function QuestionView({ question, onAnswer, index, total, mode }: any) {
    const [selected, setSelected] = useState<number | null>(null)
    const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
    const [showFeedback, setShowFeedback] = useState(false)

    // Selectors for specific actions to avoid passing full store
    const nextQuestion = useGameStore(state => state.nextQuestion)
    const playSound = useSound().play
    const haptic = useHaptic() // Haptic might be stable, but hooks are cheap

    // Callback optimization
    const handleSelect = useCallback(async (idx: number) => {
        if (selected !== null) return

        setSelected(idx)
        playSound('click')
        haptic.light()

        await new Promise(resolve => setTimeout(resolve, 500))

        const res = onAnswer(idx)
        setResult(res)
        setShowFeedback(true)

        if (res === 'correct') {
            playSound('correct')
            haptic.success()
        } else {
            playSound('wrong')
            haptic.error()
        }
    }, [selected, onAnswer, playSound, haptic]) // Dependencies

    const handleNext = useCallback(() => {
        nextQuestion()
    }, [nextQuestion])

    return (
        <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, scale: 0.95 }} // More subtle scale for mobile perf
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }} // Lesser movement
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ willChange: 'opacity, transform' }} // Hardware acceleration hint
        >
            <div className="text-center mb-8">
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">
                    {mode === 'marathon' ? `Questão ${index}` : `Questão ${index}/${total}`}
                </span>
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
                            initial={{ opacity: 0, y: 10 }} // Reduced distance
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.2 }} // Faster stagger
                            onClick={() => handleSelect(i)}
                            disabled={selected !== null}
                            className={`w-full p-4 rounded-xl border text-left font-medium transition-all duration-300 relative overflow-hidden group ${stateClass}`}
                            style={{ willChange: 'transform' }} // Hint
                        >
                            <span className="opacity-50 mr-4 font-mono">{String.fromCharCode(65 + i)}</span>
                            {opt}
                        </motion.button>
                    )
                })}
            </div>

            <AnimatePresence>
                {showFeedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
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
})

// MEMOIZED COMPONENT
const ResultView = memo(function ResultView({ status, score, onReset, onRestart }: any) {
    const deckId = useGameStore(state => state.deckId)
    const deckLength = useGameStore(state => state.deck.length)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const { play } = useSound()
    const searchParams = useSearchParams()
    const mode = searchParams.get('mode')
    const [isGuest, setIsGuest] = useState(false)

    useEffect(() => {
        if (status === 'won') {
            play('win')
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#FFA500', '#ffffff'],
                disableForReducedMotion: true // Accessibility/Perf
            })
        } else if (status === 'lost') {
            play('lose')
        }
    }, [status, play])

    useEffect(() => {
        const saveMatch = async () => {
            if (saved || !deckId) return
            setIsSaving(true)

            const { supabase } = await import('@/lib/supabase')
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                // If in challenge mode, check for existing placeholder match to update
                let matchIdToUpdate = null;
                const challengeId = useGameStore.getState().challengeId;

                if (challengeId) {
                    const { data: existing } = await supabase
                        .from('matches')
                        .select('id')
                        .eq('challenge_id', challengeId)
                        .eq('user_id', user.id)
                        .maybeSingle(); // Use maybeSingle to avoid 406 on multiple

                    if (existing) matchIdToUpdate = existing.id;
                }

                let error;
                if (matchIdToUpdate) {
                    // Update existing
                    const { error: updateError } = await supabase
                        .from('matches')
                        .update({
                            score: score,
                            played_at: new Date().toISOString() // Update time
                        })
                        .eq('id', matchIdToUpdate);
                    error = updateError;
                } else {
                    // Insert new (Standard game or no placeholder found)
                    const { error: insertError } = await supabase.from('matches').insert({
                        user_id: user.id,
                        deck_id: deckId,
                        score: score,
                        max_score: deckLength * 100,
                        challenge_id: challengeId
                    });
                    error = insertError;
                }

                if (error) {
                    console.error('Failed to save match:', error)
                    alert(`Erro ao salvar pontuação: ${error.message}`)
                } else {
                    setSaved(true)
                }
            } else {
                setIsGuest(true)
            }
            setIsSaving(false)
        }

        saveMatch()
    }, [])

    return (
        <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
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

            {/* Challenge Leaderboard (If in challenge mode) */}
            {useGameStore.getState().challengeId && (
                <div className="max-w-sm mx-auto mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2 justify-center">
                        <Trophy className="w-4 h-4" /> Ranking do Desafio
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">Veja como você se saiu contra seus amigos</p>
                    <Link
                        href={`/challenge/${useGameStore.getState().challengeId}`}
                        className="text-xs font-bold text-white bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Ver Placar Completo
                    </Link>
                </div>
            )}

            {/* Guest CTA */}
            {isGuest && mode === 'daily' && (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 max-w-sm mx-auto animate-in slide-in-from-bottom fade-in duration-700">
                    <p className="text-sm text-primary font-bold mb-2">🔥 Você mandou bem!</p>
                    <p className="text-xs text-muted-foreground mb-3">Crie uma conta para salvar sua pontuação no Ranking Diário.</p>
                    <Link href="/login?mode=signup" className="block w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                        Criar Conta Grátis
                    </Link>
                </div>
            )}

            {/* Challenge Friend Button */}
            {status === 'won' && !mode && deckId && (
                <div className="flex flex-col items-center gap-2 pt-2">
                    <button
                        disabled={isSaving} // Reuse isSaving or create new one
                        onClick={async (e) => {
                            const btn = e.currentTarget;
                            if (btn.disabled) return;
                            btn.disabled = true;
                            btn.innerHTML = '<span class="animate-spin">⏳</span> Criando...';

                            if (!deckId) return;
                            try {
                                const { supabase } = await import('@/lib/supabase');
                                const { data: { user } } = await supabase.auth.getUser();

                                if (!user) {
                                    alert('Faça login para desafiar amigos!');
                                    btn.disabled = false;
                                    btn.innerHTML = 'Desafiar Amigo';
                                    return;
                                }

                                const res = await fetch('/api/challenge/create', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ deckId, userId: user.id })
                                });

                                const data = await res.json();

                                if (!res.ok) throw new Error(data.error || 'Falha na API');

                                if (data.challengeId) {
                                    const link = `${window.location.origin}/challenge/${data.challengeId}`;
                                    await navigator.clipboard.writeText(link);
                                    alert('Link de desafio copiado para a área de transferência! Envie para seu amigo.');
                                }
                            } catch (error: any) {
                                console.error(error);
                                alert(`Erro ao criar desafio: ${error.message}`);
                            } finally {
                                btn.disabled = false;
                                btn.innerHTML = '<svg class="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg> Desafiar Amigo';
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600/20 text-purple-400 border border-purple-600/50 rounded-xl font-bold hover:bg-purple-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trophy className="w-4 h-4" />
                        Desafiar Amigo
                    </button>
                    <p className="text-xs text-muted-foreground">Quem fizer mais pontos ganha!</p>
                </div>
            )}

            <div className="flex gap-4 justify-center pt-4">
                <Link
                    href={isGuest ? "/" : "/decks"}
                    onClick={onReset}
                    className="px-6 py-3 rounded-xl hover:bg-white/5 transition-colors font-medium"
                >
                    {isGuest ? "Voltar ao Início" : "Voltar aos Decks"}
                </Link>
                <button onClick={onRestart} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">Jogar Novamente</button>
            </div>
        </motion.div>
    )
})
