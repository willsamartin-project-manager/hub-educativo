'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { ArrowRight, Brain, Loader2, Sword, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ChallengePage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [challenge, setChallenge] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const startGame = useGameStore(state => state.startGame);
    const router = useRouter();

    useEffect(() => {
        const fetchChallenge = async () => {
            try {
                const res = await fetch(`/api/challenge/${id}`);
                const data = await res.json();
                if (data.challenge) {
                    setChallenge(data.challenge);
                    setLeaderboard(data.leaderboard);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);

    const handleAccept = () => {
        if (!challenge) return;
        startGame(
            challenge.deck.questions,
            challenge.deck.id,
            'standard',
            challenge.deck.subject,
            challenge.deck.grade_level,
            challenge.id // Pass Challenge Context
        );
        router.push('/arena');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
    );

    if (!challenge) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Desafio não encontrado 😕</h1>
                <Link href="/" className="text-purple-400 hover:underline">Voltar ao Início</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-purple-500)_0%,_transparent_50%)] opacity-20" />

            <div className="w-full max-w-lg bg-card border border-purple-500/20 rounded-3xl p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto ring-1 ring-purple-500/50">
                        <Sword className="w-10 h-10 text-purple-500" />
                    </div>
                    <div>
                        <span className="text-xs uppercase tracking-widest text-purple-400 font-bold">Duelo de Conhecimento</span>
                        <h1 className="text-3xl font-bold mt-2">Você foi desafiado!</h1>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-sm text-muted-foreground mb-1">Desafiante</p>
                        <div className="flex items-center justify-center gap-2 font-bold text-lg">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            {challenge.creator?.full_name || 'Usuário Anônimo'}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Brain className="w-5 h-5" /></div>
                            <div className="flex flex-col text-left">
                                <span className="font-bold text-sm">{challenge.deck.subject}</span>
                                <span className="text-xs text-muted-foreground">{challenge.deck.grade_level}</span>
                            </div>
                        </div>
                        <div className="text-xs font-bold bg-white/10 px-2 py-1 rounded">
                            {challenge.deck.questions.length} Questões
                        </div>
                    </div>

                    <button
                        onClick={handleAccept}
                        className="w-full py-4 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_-5px_var(--color-purple-600)] flex items-center justify-center gap-2"
                    >
                        ACEITAR DESAFIO
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Leaderboard Preview */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        Placar Atual
                    </h3>
                    <div className="space-y-2">
                        {leaderboard.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">Seja o primeiro a jogar!</p>
                        ) : (
                            leaderboard.slice(0, 3).map((match, i) => (
                                <div key={i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-white/5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-muted-foreground w-4">#{i + 1}</span>
                                        <span>{match.user?.full_name || 'Jogador'}</span>
                                    </div>
                                    <span className="font-mono font-bold text-purple-400">{match.score} pts</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
