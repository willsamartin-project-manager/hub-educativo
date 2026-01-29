import { Gamepad2, LayoutDashboard, Library, Settings, Trophy, User } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen flex bg-background">
            {/* Client Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/50 backdrop-blur-sm sticky top-0 z-10 md:hidden">
                    <Gamepad2 className="w-6 h-6 text-primary" />
                    <div className="w-8 h-8 bg-secondary rounded-full" />
                </header>
                <div className="p-6 lg:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Nav */}
            <nav className="md:hidden fixed bottom-0 w-full h-16 bg-card border-t border-border flex items-center justify-around z-50">
                <MobileNavItem href="/hub" icon={<LayoutDashboard />} />
                <MobileNavItem href="/arena" icon={<Trophy />} highlight />
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
