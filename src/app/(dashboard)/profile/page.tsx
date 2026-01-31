'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Shield, User } from "lucide-react";

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);

                // Matches History
                const { data: history } = await supabase
                    .from('matches')
                    .select(`
                        *,
                        deck:decks!deck_id(title, subject),
                        challenge:challenges!challenge_id(creator:profiles!creator_id(full_name))
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                setMatches(history || []);
            }
            setLoading(false);
        }
        getData();
    }, []);

    if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Seu Perfil</h1>

            {/* Profile Card */}
            <div className="bg-card border border-border/50 rounded-2xl p-8 flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center text-4xl font-bold">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User className="w-10 h-10" />
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold">{profile?.full_name || 'Estudante'}</h2>
                    <p className="text-muted-foreground">{profile?.email}</p>
                    <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-1 rounded-full text-primary font-bold">
                            <Shield className="w-4 h-4" />
                            {profile?.coins || 0} Dracmas
                        </div>
                    </div>
                </div>
            </div>

            {/* History */}
            <h2 className="text-xl font-bold mt-8">Histórico de Batalhas</h2>
            <div className="space-y-4">
                {matches.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-muted-foreground">
                        Nenhuma partida jogada ainda.
                    </div>
                ) : (
                    matches.map((match) => (
                        <div key={match.id} className="bg-card/50 hover:bg-card border border-border/50 p-4 rounded-xl flex justify-between items-center transition-colors">
                            <div>
                                <div className="font-bold">{match.deck?.title || match.deck?.subject}</div>
                                <div className="text-xs text-muted-foreground">
                                    {new Date(match.created_at).toLocaleDateString()}
                                    {match.challenge && ` • Desafio de ${match.challenge.creator?.full_name}`}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-mono font-bold text-xl text-primary">{match.score} pts</div>
                                <div className="text-xs text-muted-foreground">
                                    {Math.round((match.score / match.max_score) * 100)}% acerto
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
