'use client'

import { useState } from "react";
import { Gamepad2, LayoutDashboard, Library, LogOut, Settings, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
    profile: {
        full_name: string | null;
        coins: number;
        avatar_url?: string | null;
    } | null;
    email?: string;
}

export function Sidebar({ profile, email }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoadingLogout, setIsLoadingLogout] = useState(false);

    const handleLogout = async () => {
        setIsLoadingLogout(true);
        await supabase.auth.signOut();
        router.refresh();
        router.push('/login');
    };

    const coins = profile?.coins ?? 0;
    const firstName = profile?.full_name?.split(' ')[0] || 'Estudante';
    const initial = firstName[0].toUpperCase();

    return (
        <aside className="w-20 lg:w-64 border-r border-border bg-card/30 hidden md:flex flex-col sticky top-0 h-screen transition-all duration-300">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border/50 bg-background/50 backdrop-blur-sm">
                <Gamepad2 className="w-6 h-6 text-primary shrink-0" />
                <span className="ml-3 font-bold text-lg hidden lg:block truncate">Hub<span className="text-primary">Educativo</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <NavItem href="/hub" icon={<LayoutDashboard />} label="Dashboard" active={pathname === '/hub'} />
                <NavItem href="/arena" icon={<Trophy />} label="Jogar" active={pathname === '/arena'} highlight />
                <NavItem href="/decks" icon={<Library />} label="Meus Decks" active={pathname === '/decks'} />
                {/* <NavItem href="/profile" icon={<User />} label="Perfil" active={pathname === '/profile'} /> */}
            </nav>

            <div className="p-4 border-t border-border/50 bg-background/20 backdrop-blur-sm space-y-4">
                {/* Balance Card */}
                <div className="bg-primary/10 rounded-xl p-4 hidden lg:block border border-primary/10">
                    <div className="text-xs font-bold text-primary uppercase mb-1 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Seu Saldo
                    </div>
                    <div className="text-2xl font-mono font-bold text-foreground">
                        {coins.toLocaleString()}
                        <span className="text-muted-foreground text-sm ml-2 font-sans font-normal">moedas</span>
                    </div>
                </div>

                {/* Mobile Coins (Collapsed) */}
                <div className="lg:hidden flex flex-col items-center justify-center text-primary font-bold text-xs bg-primary/10 p-2 rounded-lg">
                    <Trophy className="w-4 h-4 mb-1" />
                    {coins >= 1000 ? `${(coins / 1000).toFixed(1)}k` : coins}
                </div>

                {/* User Menu */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-secondary-foreground font-bold text-lg shrink-0 overflow-hidden">
                            {initial}
                        </div>
                        <div className="hidden lg:block overflow-hidden">
                            <div className="font-bold text-sm truncate text-foreground">{profile?.full_name || 'Estudante'}</div>
                            <div className="text-xs text-muted-foreground truncate opacity-70">{email}</div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoadingLogout}
                        className="w-full flex items-center justify-center lg:justify-start gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className="hidden lg:block text-sm font-medium">Sair da Conta</span>
                    </button>
                    {/* Settings Link for future use */}
                    <div className="lg:hidden flex justify-center">
                        <Link href="/settings" className="text-muted-foreground hover:text-primary"><Settings className="w-5 h-5" /></Link>
                    </div>
                </div>
            </div>
        </aside>
    )
}

function NavItem({ href, icon, label, active, highlight }: any) {
    return (
        <Link
            href={href}
            className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative overflow-hidden ${active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                } ${highlight ? 'shadow-[0_0_15px_-5px_var(--color-primary)] border border-primary/20' : ''}`}
        >
            {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
            <div className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${highlight ? 'text-primary' : ''}`}>{icon}</div>
            <span className="hidden lg:block text-sm truncate">{label}</span>
        </Link>
    )
}
