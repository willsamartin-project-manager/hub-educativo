'use client'

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Users,
    Coins,
    BookOpen,
    TrendingUp,
    ArrowLeft,
    Loader2,
    AlertCircle,
    ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (profile?.is_admin) {
                setAuthorized(true);
                fetchStats();
            } else {
                setAuthorized(false);
            }
            setLoading(false);
        };

        const fetchStats = async () => {
            // Fetch total users
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // Fetch total decks
            const { count: deckCount } = await supabase
                .from('decks')
                .select('*', { count: 'exact', head: true });

            // Fetch successful transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('amount')
                .eq('status', 'approved');

            const totalRevenue = transactions?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // Fetch top users
            const { data: topUsers } = await supabase
                .from('profiles')
                .select('full_name, coins')
                .order('coins', { ascending: false })
                .limit(5);

            setStats({
                totalUsers: userCount || 0,
                totalDecks: deckCount || 0,
                totalRevenue,
                topUsers: topUsers || []
            });
        };

        checkAdmin();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Verificando credenciais...</p>
            </div>
        );
    }

    if (authorized === false) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
                <p className="text-muted-foreground max-w-md mb-8">
                    Esta área é restrita a administradores. Se você acredita que isso é um erro, entre em contato com o suporte.
                </p>
                <Link
                    href="/hub"
                    className="px-8 py-3 bg-secondary hover:bg-secondary/80 rounded-xl font-bold transition-all"
                >
                    Voltar ao Hub
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <Link href="/hub" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mb-2">
                            <ArrowLeft className="w-4 h-4" /> Voltar ao Hub
                        </Link>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                            <div className="px-2 py-1 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Admin Mode</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground">Monitorando a saúde do Hub Educativo em tempo real.</p>
                    </div>

                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-bold flex items-center gap-2 justify-center transition-all"
                    >
                        <Loader2 className="w-4 h-4" /> Atualizar Dados
                    </button>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard
                        title="Total de Usuários"
                        value={stats?.totalUsers.toLocaleString()}
                        icon={<Users className="w-6 h-6 text-blue-400" />}
                        color="bg-blue-400/10 border-blue-400/20"
                    />
                    <StatCard
                        title="Receita de Moedas"
                        value={`R$ ${stats?.totalRevenue.toFixed(2).replace('.', ',')}`}
                        icon={<Coins className="w-6 h-6 text-yellow-500" />}
                        color="bg-yellow-500/10 border-yellow-500/20"
                        highlight
                    />
                    <StatCard
                        title="Decks Gerados"
                        value={stats?.totalDecks.toLocaleString()}
                        icon={<BookOpen className="w-6 h-6 text-purple-400" />}
                        color="bg-purple-400/10 border-purple-400/20"
                    />
                </div>

                {/* Tables / Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Top Users */}
                    <div className="bg-card border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Ranking de Acúmulo
                            </h3>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Top 5 Curriculares</span>
                        </div>
                        <div className="p-2">
                            {stats?.topUsers.map((user: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{user.full_name}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Usuário Ativo</div>
                                        </div>
                                    </div>
                                    <div className="text-primary font-mono font-bold">
                                        {user.coins} <span className="text-[10px] opacity-50">moedas</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions / Activity Placeholder */}
                    <div className="bg-card border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-bold text-xl">Monitoramento Vercel</h3>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Para dados de tráfego, países e dispositivos, utilize o painel oficial da Vercel.
                        </p>
                        <a
                            href="https://vercel.com/analytics"
                            target="_blank"
                            className="mt-4 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            Ver Vercel Analytics
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color, highlight = false }: any) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`p-6 rounded-3xl border ${color} flex items-center gap-6 relative overflow-hidden group`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${highlight ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                {icon}
            </div>
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
                <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
            </div>

            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
        </motion.div>
    );
}
