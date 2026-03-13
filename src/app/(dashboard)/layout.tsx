import { LayoutDashboard, Library, Trophy, User } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { createClient } from "@/lib/supabase-server";
import { memo } from "react";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    let user = null;
    let profile = null;

    try {
        const { data } = await supabase.auth.getUser();
        user = data?.user;
    } catch (e) {
        console.warn("Layout Auth Error:", e);
    }

    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, coins, avatar_url')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="min-h-[100dvh] flex bg-background overflow-hidden preserve-3d">
            {/* Sidebar - Only impactful on desktop */}
            <Sidebar profile={profile} email={user?.email} />

            <main className="flex-1 overflow-y-auto h-[100dvh] pb-20 md:pb-0 scroll-smooth">
                <MobileHeader profile={profile} />
                <div className="p-4 lg:p-10 max-w-7xl mx-auto mb-16 md:mb-0 transition-opacity duration-300">
                    {children}
                </div>
            </main>

            {/* Mobile Nav - Fixed bottom for better reachability */}
            <nav className="md:hidden fixed bottom-0 w-full h-16 bg-card/80 backdrop-blur-lg border-t border-border flex items-center justify-around z-50 px-2 pb-safe">
                <MobileNavItem href="/hub" icon={<LayoutDashboard size={20} />} />
                <MobileNavItem href="/arena" icon={<Trophy size={20} />} highlight />
                <MobileNavItem href="/decks" icon={<Library size={20} />} />
                <MobileNavItem href="/profile" icon={<User size={20} />} />
            </nav>
        </div>
    );
}

const MobileNavItem = memo(({ href, icon, highlight }: any) => {
    return (
        <Link
            href={href}
            prefetch={true}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-90 ${highlight
                ? 'bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(var(--color-primary),0.3)]'
                : 'text-muted-foreground/60'
                }`}
        >
            {icon}
        </Link>
    );
});

MobileNavItem.displayName = 'MobileNavItem';
