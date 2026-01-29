'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, CalendarDays, Gamepad2, Loader2, Play, Search, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Deck = {
    id: string
    title: string
    subject: string
    grade: string
    created_at: string
    questions: any[]
}

export default function DecksPage() {
    const [decks, setDecks] = useState<Deck[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDecks = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('decks')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false })

            if (data) setDecks(data)
            setIsLoading(false)
        }

        fetchDecks()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Meus Decks</h1>
                    <p className="text-muted-foreground">Sua coleção de estudos.</p>
                </div>
                <Link
                    href="/arena"
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                    <Gamepad2 className="w-5 h-5" />
                    Criar Novo Deck
                </Link>
            </header>

            {decks.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/50">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold text-muted-foreground">Nenhum deck encontrado</h3>
                    <p className="text-muted-foreground/70 mb-6">Você ainda não criou nenhum material de estudo.</p>
                    <Link href="/arena" className="text-primary hover:underline">
                        Ir para a Arena e criar agora
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map((deck, i) => (
                        <motion.div
                            key={deck.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                href={`/arena?deckId=${deck.id}`}
                                className="group relative flex flex-col items-start justify-between h-56 p-6 bg-gradient-to-br from-card to-background border border-border/50 rounded-3xl hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_var(--color-primary)] hover:-translate-y-1 overflow-hidden"
                            >
                                {/* Decorative Background Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />

                                <div className="relative z-10 w-full">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="px-3 py-1 rounded-full bg-secondary/50 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary truncate max-w-[80%]">
                                            {deck.subject}
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                        {deck.title}
                                    </h3>
                                </div>

                                <div className="relative z-10 w-full flex items-end justify-between mt-auto pt-6 border-t border-white/5">
                                    <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <div className="p-1.5 rounded-md bg-secondary text-foreground/70">
                                                <BookOpen className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="font-medium">{deck.questions.length}</span>
                                            <span className="text-xs text-muted-foreground/70 uppercase ml-1">Questões</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground/50 font-mono pl-1">
                                            <CalendarDays className="w-3.5 h-3.5" />
                                            <span>{format(new Date(deck.created_at), "d 'de' MMM", { locale: ptBR })}</span>
                                        </div>
                                    </div>

                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )
            }
        </div >
    )
}
