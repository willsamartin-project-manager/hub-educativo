import Link from "next/link";
import { ArrowRight, Brain, Sparkles } from "lucide-react";
import { DailyDeckCard } from "@/components/marketing/DailyDeckCard";

export default function LandingPage() {
    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full border-b border-border/40 bg-background/50 backdrop-blur-md z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="p-1.5 bg-primary/20 rounded-lg">
                            <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <span>Hub<span className="text-primary">Educativo</span></span>
                    </div>

                    <nav className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground/80 font-medium">
                            <Link href="#features" className="hover:text-foreground transition-colors">Como funciona</Link>
                            <Link href="#pricing" className="hover:text-foreground transition-colors">Planos</Link>
                        </div>
                        <Link
                            href="/login"
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_-5px_var(--color-primary)] opacity-90 hover:opacity-100"
                        >
                            Entrar
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center pt-24 pb-12">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">

                    {/* Hero Text */}
                    <div className="flex-1 space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-medium text-primary-foreground/90 mx-auto md:mx-0">
                            <Sparkles className="w-3 h-3" />
                            <span>Gamificação + Inteligência Artificial</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                            Aprenda jogando.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-blue-400 animate-shine bg-[length:200%_auto]">
                                Conquiste conhecimento.
                            </span>
                        </h1>

                        <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
                            Transforme seus estudos em uma experiência épica. Gere quizzes personalizados com IA, desafie seus amigos e suba no ranking.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                            <Link
                                href="/login?mode=signup"
                                className="group relative px-8 py-3.5 bg-foreground text-background rounded-xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                            >
                                Começar Agora
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="flex-1 relative w-full max-w-[500px]">
                        <DailyDeckCard />
                    </div>
                </div>
            </main>
        </div>
    );
}
