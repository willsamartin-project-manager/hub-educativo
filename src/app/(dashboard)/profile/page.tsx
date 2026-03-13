'use client'

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Shield, User, Edit2, Check, X, Camera, Image as ImageIcon, Sparkles, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESET_AVATARS = [
    { name: "Médico", url: "https://api.dicebear.com/7.x/personas/svg?seed=Doctor" },
    { name: "Astronauta", url: "https://api.dicebear.com/7.x/personas/svg?seed=Astro" },
    { name: "Professor", url: "https://api.dicebear.com/7.x/personas/svg?seed=Teacher" },
    { name: "Cientista", url: "https://api.dicebear.com/7.x/personas/svg?seed=Science" },
    { name: "Artista", url: "https://api.dicebear.com/7.x/personas/svg?seed=Artist" },
    { name: "Engenheiro", url: "https://api.dicebear.com/7.x/personas/svg?seed=Engineer" },
    { name: "Chef", url: "https://api.dicebear.com/7.x/personas/svg?seed=Chef" },
    { name: "Programador", url: "https://api.dicebear.com/7.x/personas/svg?seed=Coder" },
    { name: "Bombeiro", url: "https://api.dicebear.com/7.x/personas/svg?seed=Fireman" },
    { name: "Policial", url: "https://api.dicebear.com/7.x/personas/svg?seed=Officer" },
];

const GRADE_OPTIONS = ["Ensino Médio", "Fundamental II", "Concurso"];

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [grade, setGrade] = useState("");
    const [referralCode, setReferralCode] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const getData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setProfile(profile);
                setFullName(profile?.full_name || "");
                setAvatarUrl(profile?.avatar_url || "");
                setGrade(profile?.grade || "Ensino Médio");
                setReferralCode(profile?.referral_code || "");

                const { data: history } = await supabase
                    .from('matches')
                    .select(`
                        *,
                        deck:decks!deck_id(title, subject),
                        challenge:challenges!challenge_id(creator:profiles!creator_id(full_name))
                    `)
                    .eq('user_id', user.id)
                    .order('played_at', { ascending: false });

                setMatches(history || []);
            }
            setLoading(false);
        }
        getData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    avatar_url: avatarUrl,
                    grade: grade
                })
                .eq('id', user.id);

            if (error) throw error;
            setProfile({ ...profile, full_name: fullName, avatar_url: avatarUrl, grade: grade });
            setIsEditing(false);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar alterações.");
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Check if bucket exists, if not this might fail (user might need to create 'avatars' bucket)
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Erro ao fazer upload. Verifique se o bucket 'avatars' existe.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>

    return (
        <div className="space-y-8 max-w-4xl mx-auto px-4 py-6 md:py-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Seu Perfil</h1>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar Perfil
                    </button>
                )}
            </div>

            {/* Profile Card */}
            <motion.div
                layout
                className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                    <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-secondary border-4 border-background flex items-center justify-center text-4xl font-bold overflow-hidden shadow-xl ring-2 ring-primary/20">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-12 h-12 text-muted-foreground/50" />
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform ring-2 ring-background focus:outline-none"
                                title="Trocar foto"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg font-medium"
                                        placeholder="Seu nome"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Série / Nível</label>
                                    <select
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors text-lg font-medium cursor-pointer"
                                    >
                                        {GRADE_OPTIONS.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 block">Escolha seu avatar</label>
                                    <div className="grid grid-cols-5 md:grid-cols-11 gap-2">
                                        <button
                                            onClick={() => setAvatarUrl("")}
                                            className={`aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${!avatarUrl ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'border-dashed border-white/20 bg-secondary/50 hover:bg-secondary'}`}
                                        >
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </button>
                                        {PRESET_AVATARS.map((avatar, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setAvatarUrl(avatar.url)}
                                                className={`aspect-square rounded-xl border-2 transition-all overflow-hidden hover:scale-105 active:scale-95 ${avatarUrl === avatar.url ? 'border-primary ring-2 ring-primary/20 bg-primary/10' : 'border-transparent bg-secondary'}`}
                                            >
                                                <img src={avatar.url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Salvar</>}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFullName(profile?.full_name || "");
                                            setAvatarUrl(profile?.avatar_url || "");
                                            setGrade(profile?.grade || "Ensino Médio");
                                        }}
                                        disabled={saving}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-xl font-bold hover:bg-secondary/80 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-3xl font-bold truncate">{profile?.full_name || 'Estudante'}</h2>
                                    <p className="text-muted-foreground font-medium opacity-70">
                                        {profile?.email} • <span className="text-primary">{profile?.grade || 'Série não definida'}</span>
                                    </p>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-sm bg-primary/10 px-4 py-2 rounded-2xl text-primary font-bold border border-primary/20">
                                        <Shield className="w-4 h-4" />
                                        {profile?.coins || 0} Moedas
                                    </div>
                                    <div className="flex items-center gap-2 text-sm bg-secondary/80 px-4 py-2 rounded-2xl text-muted-foreground font-bold border border-border/50">
                                        <ImageIcon className="w-4 h-4" />
                                        {matches.length} Batalhas
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Referral Section */}
                {!isEditing && referralCode && (
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <h3 className="text-lg font-bold flex items-center justify-center md:justify-start gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                Indique e Ganhe!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Compartilhe seu link e ganhe <span className="text-primary font-bold">50 moedas</span> por cada novo amigo que se cadastrar.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                            <div className="bg-secondary/50 border border-white/10 px-4 py-2.5 rounded-xl font-mono font-bold text-primary flex items-center gap-3 w-full sm:w-auto justify-center">
                                {referralCode}
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/login?ref=${referralCode}`;
                                        navigator.clipboard.writeText(url);
                                        alert("Link de indicação copiado!");
                                    }}
                                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    const url = `${window.location.origin}/login?ref=${referralCode}`;
                                    const text = `Vem jogar comigo no Hub Educativo! Use meu código ${referralCode} e ganhe 50 moedas bônus: ${url}`;
                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                }}
                                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
                            >
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .081 5.363.079 11.969c0 2.112.551 4.174 1.597 6.027L0 24l6.191-1.623a11.854 11.854 0 005.856 1.543h.005c6.605 0 11.97-5.364 11.972-11.971a11.81 11.81 0 00-3.51-8.452" />
                                </svg>
                                WhatsApp
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* History */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Histórico de Batalhas</h2>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{matches.length} Partidas</span>
                </div>

                <div className="grid gap-4">
                    {matches.length === 0 ? (
                        <div className="text-center py-16 bg-card/30 border border-dashed border-white/5 rounded-3xl text-muted-foreground shadow-inner">
                            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-medium">Nenhuma partida jogada ainda.</p>
                            <p className="text-sm opacity-60">Comece um novo deck para ver seu histórico aqui!</p>
                        </div>
                    ) : (
                        matches.map((match, i) => (
                            <motion.div
                                key={match.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group bg-card/50 hover:bg-card border border-border/50 p-5 rounded-2xl flex justify-between items-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
                            >
                                <div className="space-y-1">
                                    <div className="font-bold text-lg group-hover:text-primary transition-colors">{match.deck?.title || match.deck?.subject}</div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                                        <span>{new Date(match.played_at).toLocaleDateString()}</span>
                                        {match.challenge && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                                <span className="text-purple-400">Desafio de {match.challenge.creator?.full_name}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-mono font-black text-2xl text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary),0.2)]">{match.score} <span className="text-xs font-sans text-muted-foreground/50 ml-px">pts</span></div>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${match.score / match.max_score >= 0.7 ? 'text-green-400' : 'text-amber-400'}`}>
                                        {Math.round((match.score / match.max_score) * 100)}% de Precisão
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Logout Button (Mobile Access) */}
            <div className="pt-8 border-t border-white/5 md:hidden">
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 text-red-400 font-bold hover:bg-red-500/20 transition-all border border-red-500/20"
                >
                    <X className="w-5 h-5" />
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}
