import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { createClient } from "@/lib/supabase-server";

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

            {/* Mobile Nav - Client side active states */}
            <MobileNav />
        </div>
    );
}
