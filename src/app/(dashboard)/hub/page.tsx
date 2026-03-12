'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Flame, Loader2, Play, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function HubPage() {
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ decks: 0, score: 0, matches: 0 });
    const [recentDecks, setRecentDecks] = useState<any[]>([]);
    const [battles, setBattles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Parallel Fetching: Start all independent requests simultaneously
                const [
                    profileResponse,
                    decksCountResponse,
                    matchesResponse,
                    recentDecksResponse,
                    myMatchesResponse
                ] = await Promise.all([
                    // 1. Profile
                    supabase.from('profiles').select('*').eq('id', user.id).single(),
                    // 2. Stats: Decks Count
                    supabase.from('decks').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
                    // 3. Stats: Matches & Score (Optimization: .select('score') is lighter)
                    supabase.from('matches').select('score').eq('user_id', user.id),
                    // 4. Recent Decks
                    supabase.from('decks').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }).limit(3),
                    // 5. My Matches (to find challenges I played)
                    supabase.from('matches').select('challenge_id').eq('user_id', user.id).not('challenge_id', 'is', null)
                ]);

                // Process Results
                const profile = profileResponse.data;
                const decksCount = decksCountResponse.count;
                const matches = matchesResponse.data;
                const totalScore = matches?.reduce((acc, curr) => acc + (curr.score || 0), 0) || 0;
                const decks = recentDecksResponse.data;
                const myMatches = myMatchesResponse.data;

                // Set Independent States
                setProfile(profile);
                setStats({
                    decks: decksCount || 0,
                    score: totalScore,
                    matches: matches?.length || 0
                });
                setRecentDecks(decks || []);

                // Active Battles Logic (Depends on myMatches)
                const playedChallengeIds = myMatches?.map((m: any) => m.challenge_id) || [];
                // Use Set to deduplicate if needed, though map lookup is fast for filtered list

                // Fetch Challenges (Created by me OR Played by me)
                const { data: myBattles } = await supabase
                    .from('challenges')
                    .select(`
                        *,
                        creator:profiles!creator_id(full_name),
                        deck:decks!deck_id(subject)
                    `)
                    .or(`creator_id.eq.${user.id},id.in.(${playedChallengeIds.join(',')})`)
                    .order('created_at', { ascending: false })
                    .limit(3);

                setBattles(myBattles || []);

            } catch (error) {
                console.error("Dashboard Load Error:", error);
            } finally {
                setLoading(false);
            }
        }
        getData();
    }, []);

    if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="space-y-8">
            {/* Welcome & Quick Action */}
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Olá, {profile?.full_name?.split(' ')[0] || 'Estudante'}!</h1>
                    <p className="text-muted-foreground">Pronto para conquistar mais conhecimento hoje?</p>
                </div>
                <Link
                    href="/decks"
                    className="group px-6 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-[0_0_30px_-10px_var(--color-primary)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-fit"
                >
                    <div className="p-2 bg-white/20 rounded-full">
                        <BookOpen className="w-5 h-5 fill-current" />
                    </div>
                    Meus Decks
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Flame className="text-orange-500" />} label="Ofensiva" value="1 dia" />
                <StatCard icon={<Trophy className="text-yellow-500" />} label="Pontos" value={stats.score.toLocaleString()} />
                <StatCard icon={<BookOpen className="text-blue-500" />} label="Decks" value={stats.decks} />
                <StatCard icon={<Clock className="text-purple-500" />} label="Partidas" value={stats.matches} />
            </div>

            {/* Recent Decks & Recommended */}
            <div className="grid md:grid-cols-2 gap-6">
                <section className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <h2 className="font-bold text-lg">Seus Decks Recentes</h2>
                        <Link href="/decks" className="text-primary hover:underline">Ver todos</Link>
                    </div>

                    <div className="space-y-3">
                        {recentDecks.length === 0 ? (
                            <div className="text-muted-foreground text-sm py-4 border border-dashed border-white/10 rounded-xl text-center">
                                Nenhum deck jogado ainda.
                            </div>
                        ) : (
                            recentDecks.map((deck) => (
                                <Link key={deck.id} href={`/arena?deckId=${deck.id}`} className="block bg-card hover:bg-white/5 border border-border/50 p-4 rounded-xl transition-colors">
                                    <div className="font-bold">{deck.title || deck.subject}</div>
                                    <div className="text-xs text-muted-foreground">{new Date(deck.created_at).toLocaleDateString()} • {deck.questions?.length || 0} questões</div>
                                </Link>
                            ))
                        )}
                    </div>
                </section>



                <section className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <h2 className="font-bold text-lg">Sugestões da IA</h2>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-2">Desafio Inicial</h3>
                            <p className="text-sm text-muted-foreground mb-4">Que tal começar testando seus conhecimentos gerais?</p>
                            <Link href="/arena" className="inline-block px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-white rounded-lg text-sm font-bold transition-colors">
                                Gerar Deck
                            </Link>
                        </div>
                        <SparklesIcon className="absolute top-4 right-4 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors rotate-12" />
                    </div>
                </section>
            </div>

            {/* Active Battles Section - Option C Implementation */}
            {
                battles.length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <h2 className="font-bold text-lg">Duelos Recentes</h2>
                                <span className="bg-purple-500/10 text-purple-400 text-xs px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">PVP</span>
                            </div>
                            <Link href="/profile" className="text-muted-foreground hover:text-white transition-colors text-xs">Ver histórico</Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                            {battles.map((battle: any) => (
                                <Link
                                    key={battle.id}
                                    href={`/challenge/${battle.id}`}
                                    className="bg-card hover:bg-purple-500/5 group border border-border/50 hover:border-purple-500/30 p-4 rounded-xl transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <div className="w-16 h-16 bg-purple-500 rounded-full blur-2xl" />
                                    </div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-sm truncate max-w-[150px]">{battle.deck?.subject || 'Desafio'}</div>
                                            <div className="text-xs text-muted-foreground">{new Date(battle.created_at).toLocaleDateString()}</div>
                                        </div>
                                        {battle.creator_id === profile?.id ? (
                                            <div className="text-[10px] uppercase font-bold bg-white/5 px-2 py-1 rounded text-muted-foreground">Você criou</div>
                                        ) : (
                                            <div className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Desafiado</div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-background flex items-center justify-center text-[10px] font-bold">
                                                {battle.creator?.full_name?.[0] || '?'}
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-[10px] font-bold text-primary">
                                                Vs
                                            </div>
                                        </div>
                                        <span>Ver placar &rarr;</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )
            }
        </div >
    );
}

function StatCard({ icon, label, value }: any) {
    return (
        <div className="bg-card/50 border border-border/50 p-4 rounded-2xl flex flex-col gap-2 hover:bg-card transition-colors">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold font-mono">{value}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{label}</div>
            </div>
        </div>
    )
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.4 7.2L20 9L15 13L16.5 19L12 16L7.5 19L9 13L4 9L9.6 7.2L12 2Z" />
        </svg>
    )
}
