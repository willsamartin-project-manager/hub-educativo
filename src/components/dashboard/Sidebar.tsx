'use client'

import { useState, useEffect } from "react";
import { Gamepad2, LayoutDashboard, Library, Settings, Trophy, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Sidebar() {
    const pathname = usePathname();
    const [coins, setCoins] = useState<number | null>(null);

    useEffect(() => {
        // Fetch User Profile on Mount
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('coins')
                    .eq('id', user.id)
                    .single();

                if (profile) setCoins(profile.coins);
            }
        };

        fetchProfile();

        // Optional: Realtime subscription for coins could go here
    }, []);

    return (
        <aside className="w-20 lg:w-64 border-r border-border bg-card/30 hidden md:flex flex-col sticky top-0 h-screen">
            <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-border/50">
                <Gamepad2 className="w-6 h-6 text-primary" />
                <span className="ml-3 font-bold text-lg hidden lg:block">Hub<span className="text-primary">Educativo</span></span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <NavItem href="/hub" icon={<LayoutDashboard />} label="Dashboard" active={pathname === '/hub'} />
                <NavItem href="/arena" icon={<Trophy />} label="Jogar" active={pathname === '/arena'} highlight />
                <NavItem href="/decks" icon={<Library />} label="Meus Decks" active={pathname === '/decks'} />
                <NavItem href="/profile" icon={<User />} label="Perfil" active={pathname === '/profile'} />
                <NavItem href="/settings" icon={<Settings />} label="Configurações" active={pathname === '/settings'} />
            </nav>

            <div className="p-4 border-t border-border/50">
                <div className="bg-primary/10 rounded-xl p-4 hidden lg:block">
                    <div className="text-xs font-bold text-primary uppercase mb-1">Seu Saldo</div>
                    <div className="text-2xl font-mono font-bold">
                        {coins !== null ? coins.toLocaleString() : '---'}
                        <span className="text-foreground/50 text-sm ml-2">moedas</span>
                    </div>
                    <button className="w-full mt-3 bg-primary text-primary-foreground text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition-colors">
                        Adicionar
                    </button>
                </div>
                {/* Mobile version of coins (icon only) */}
                <div className="lg:hidden flex justify-center text-primary font-bold text-xs">
                    {coins !== null ? `${(coins / 1000).toFixed(1)}k` : '-'}
                </div>
            </div>
        </aside>
    )
}

function NavItem({ href, icon, label, active, highlight }: any) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                } ${highlight ? 'text-primary shadow-[0_0_10px_-5px_var(--color-primary)]' : ''}`}
        >
            <div className="w-5 h-5">{icon}</div>
            <span className="hidden lg:block text-sm">{label}</span>
        </Link>
    )
}
