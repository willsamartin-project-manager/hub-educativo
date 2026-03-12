'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Loader2, Trophy, ArrowRight } from 'lucide-react';

interface Deck {
    id: string;
    title: string;
    description: string;
    questions?: any[];
}

export function DailyDeckCard() {
    const [deck, setDeck] = useState<Deck | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchDailyDeck() {
            try {
                const res = await fetch('/api/daily-deck');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setDeck(data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchDailyDeck();
    }, []);

    if (error) {
        // Fallback UI or return specific error state
        return (
            <div className="relative aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">Não foi possível carregar o desafio do dia.</p>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="relative aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Gerando Desafio do Dia com IA...</p>
            </div>
        );
    }

    return (
        <div className="relative aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 overflow-hidden group">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg animate-pulse">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-sm font-bold flex items-center gap-2">
                            Desafio do Dia
                            <span className="text-[10px] uppercase bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">Novo</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Gerado por IA agora</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center space-y-4">
                <span className="text-xs uppercase tracking-widest text-primary font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Trending Topic
                </span>

                <h3 className="text-2xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">
                    {deck?.title.replace('Desafio do Dia: ', '') || 'Assunto do Momento'}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 px-4">
                    Teste seus conhecimentos sobre o que todo mundo está falando hoje no Brasil.
                </p>

                <Link
                    href={`/arena?deckId=${deck?.id}&mode=daily`}
                    className="mt-4 w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_var(--color-primary)] hover:scale-[1.02] active:scale-[0.98]"
                >
                    Jogar Agora
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
