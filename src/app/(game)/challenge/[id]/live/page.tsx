'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Trophy, Users, Clock, Loader2, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'

export default function ChallengeLivePage() {
    const params = useParams()
    const id = params?.id as string
    const [challenge, setChallenge] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/challenge/${id}`, { cache: 'no-store' })
            const data = await res.json()
            if (data.challenge) {
                setChallenge(data.challenge)
                setLeaderboard(data.leaderboard || [])
            }
        } catch (error) {
            console.error("Live Update Error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 5000) // Auto-refresh every 5s
        return () => clearInterval(interval)
    }, [id])

    if (loading && !challenge) return (
        <div className="min-h-screen bg-black flex items-center justify-center text-purple-500">
            <Loader2 className="w-12 h-12 animate-spin" />
        </div>
    )

    const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/challenge/${id}` : ''

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-purple-900/20 blur-[100px] rounded-full -translate-y-1/2" />

            <header className="p-8 flex items-center justify-between relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Trophy className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <div className="text-purple-400 font-bold tracking-widest uppercase text-sm mb-1">Modo Sala de Aula</div>
                        <h1 className="text-4xl font-bold">{challenge?.deck?.subject || 'Desafio'}</h1>
                        <p className="text-slate-400 text-lg">{challenge?.deck?.grade_level}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right hidden xl:block">
                        <p className="text-sm text-slate-400 mb-1">Entre agora:</p>
                        <p className="text-2xl font-mono font-bold text-green-400">hub-educativo.vercel.app</p>
                    </div>
                    <div className="p-2 bg-white rounded-xl shadow-2xl">
                        {/* Using robust public API for QR Code to avoid new dependencies */}
                        <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`}
                            alt="QR Code"
                            className="w-32 h-32"
                        />
                    </div>
                </div>
            </header>

            <main className="p-8 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-144px)]">

                {/* Stats Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5" /> Participantes
                        </h2>
                        <div className="text-7xl font-bold text-white mb-2">{leaderboard.length}</div>
                        <p className="text-slate-500">Alunos registrados</p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-slate-300 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5" /> Status
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </span>
                            <span className="text-2xl font-bold text-green-400">Em Andamento</span>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Column */}
                <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-3xl p-8 overflow-y-auto backdrop-blur-md shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        Classificação em Tempo Real
                    </h2>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {leaderboard.map((player, index) => (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className={`
                                        flex items-center justify-between p-4 rounded-2xl border 
                                        ${index === 0 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/5'}
                                        ${index === 1 ? 'bg-slate-300/10 border-slate-300/30' : ''}
                                        ${index === 2 ? 'bg-orange-700/10 border-orange-700/30' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl
                                            ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}
                                        `}>
                                            {index === 0 ? <Crown className="w-6 h-6" /> : `#${index + 1}`}
                                        </div>
                                        <div>
                                            <div className="font-bold text-xl">{player.user?.full_name || 'Aluno'}</div>
                                            <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">
                                                {index === 0 ? 'Líder do Ranking' : `${player.score} pontos`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-mono font-bold text-white">{player.score}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {leaderboard.length === 0 && (
                            <div className="text-center py-20 text-slate-500 italic text-xl">
                                Aguardando jogadores...
                            </div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    )
}
