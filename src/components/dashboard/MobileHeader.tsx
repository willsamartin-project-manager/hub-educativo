'use client'

import { useState } from "react";
import { Gamepad2, Plus, Sparkles } from "lucide-react";
import { CoinStore } from "@/components/shop/CoinStore";

interface MobileHeaderProps {
    profile: {
        full_name: string | null;
        coins: number;
    } | null;
}

export function MobileHeader({ profile }: MobileHeaderProps) {
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const coins = profile?.coins ?? 0;

    return (
        <>
            <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-40 md:hidden">
                <div className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                    <span className="font-bold text-sm tracking-tight">Hub<span className="text-primary">Edu</span></span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Coin Balance Button */}
                    <button
                        onClick={() => setIsStoreOpen(true)}
                        className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 py-1.5 pl-2.5 pr-1.5 rounded-full transition-all group"
                    >
                        <span className="text-xs font-mono font-bold text-primary">
                            {coins.toLocaleString()}
                        </span>
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                            <Plus className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                    </button>

                    {/* User Initials / Profile Link Placeholder */}
                    <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-xs">
                        {profile?.full_name?.[0] || 'U'}
                    </div>
                </div>
            </header>

            <CoinStore isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />
        </>
    );
}
