'use client'

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Library, Trophy, User } from "lucide-react";

export const MobileNav = memo(() => {
    const pathname = usePathname();

    return (
        <nav className="md:hidden fixed bottom-0 w-full h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around z-50 px-2 pb-safe">
            <MobileNavItem
                href="/hub"
                icon={<LayoutDashboard size={20} />}
                active={pathname === '/hub'}
            />
            <MobileNavItem
                href="/arena"
                icon={<Trophy size={20} />}
                active={pathname === '/arena'}
            />
            <MobileNavItem
                href="/decks"
                icon={<Library size={20} />}
                active={pathname === '/decks'}
            />
            <MobileNavItem
                href="/profile"
                icon={<User size={20} />}
                active={pathname === '/profile'}
            />
        </nav>
    );
});

MobileNav.displayName = 'MobileNav';

const MobileNavItem = memo(({ href, icon, active }: { href: string, icon: React.ReactNode, active: boolean }) => {
    return (
        <Link
            href={href}
            prefetch={true}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-90 ${active
                ? 'bg-primary/20 text-primary shadow-[0_0_20px_-5px_rgba(168,85,247,0.4)]'
                : 'text-muted-foreground/60'
                }`}
        >
            <div className={`transition-transform ${active ? 'scale-110' : 'scale-100'}`}>
                {icon}
            </div>
        </Link>
    );
});

MobileNavItem.displayName = 'MobileNavItem';
