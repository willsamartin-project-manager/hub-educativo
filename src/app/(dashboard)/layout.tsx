import { Gamepad2, LayoutDashboard, Library, Settings, Trophy, User } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    let user = null;
    let profile = null;

    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.warn("Layout: Server Auth Fetch Error (Ignoring redirect to avoid loop):", error.message);
        }
        user = data?.user;
    } catch (e) {
        console.warn("Layout: Server Client Exception:", e);
    }

    if (user) {
        // Only fetch profile if user exists
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            profile = data;
        } catch (err) {
            console.error("Layout: Profile Fetch Error:", err);
        }
    } else {
        // If NO user found, we might want to redirect.
        // BUT if the reason is a network error, redirecting creates a loop if /login also checks auth.
        // Let's rely on Client-Side protection for now if server fails.
        // Uncomment below to enforce Strict Server Auth:
        // redirect('/login'); 
    }



    return (
        <div className="min-h-[100dvh] flex bg-background overflow-hidden">
            {/* Client Sidebar with Server Data */}
            <Sidebar profile={profile} email={user?.email} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-[100dvh] pb-20 md:pb-0">
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10 md:hidden">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                        {profile?.full_name?.[0] || 'U'}
                    </div>
                </header>
                <div className="p-4 lg:p-10 max-w-7xl mx-auto mb-16 md:mb-0">
                    {children}
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 w-full h-16 bg-card border-t border-border flex items-center justify-around z-50">
                <MobileNavItem href="/hub" icon={<LayoutDashboard />} />
                <MobileNavItem href="/arena" icon={<Trophy />} highlight />
                <MobileNavItem href="/decks" icon={<Library />} />
                <MobileNavItem href="/profile" icon={<User />} />
            </nav>
        </div>
    );
}

function MobileNavItem({ href, icon, highlight }: any) {
    return (
        <Link
            href={href}
            className={`p-3 rounded-xl ${highlight ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
        >
            <div className="w-6 h-6">{icon}</div>
        </Link>
    )
}
