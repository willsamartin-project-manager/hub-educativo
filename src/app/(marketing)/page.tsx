import Link from "next/link";
import { ArrowRight, Brain, Gamepad2, Sparkles } from "lucide-react";

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
                            <Link
                                href="#demo"
                                className="px-8 py-3.5 rounded-xl font-semibold border border-border/50 hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                                <Gamepad2 className="w-4 h-4 text-muted-foreground" />
                                Ver Demo
                            </Link>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="flex-1 relative w-full max-w-[500px]">
                        <div className="relative aspect-square rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 flex flex-col gap-4 overflow-hidden">
                            {/* Mock Card */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />

                            <div className="relative z-10 flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-500 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
                                        🏆
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">Desafio Diário</div>
                                        <div className="text-xs text-muted-foreground">História • Ensino Médio</div>
                                    </div>
                                </div>
                                <div className="text-green-400 font-mono text-sm">R$ 1.000,00</div>
                            </div>

                            <div className="relative z-10 bg-black/40 rounded-xl p-4 border border-white/5 h-full flex flex-col justify-center items-center text-center space-y-4">
                                <span className="text-xs uppercase tracking-widest text-primary font-bold">Pergunta 5/10</span>
                                <h3 className="text-xl font-medium">Qual foi o principal motivo da Revolução Francesa?</h3>

                                <div className="w-full space-y-2 pt-2">
                                    {['Desigualdade Social', 'Invasão Inglesa', 'Queda da Bastilha', 'Crise do Petróleo'].map((opt, i) => (
                                        <div key={i} className={`w-full p-3 rounded-lg text-sm text-left border cursor-pointer transition-colors ${i === 0 ? 'border-primary bg-primary/20 text-white shadow-[0_0_15px_-5px_var(--color-primary)]' : 'border-white/5 hover:bg-white/5'}`}>
                                            {String.fromCharCode(65 + i)}. {opt}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
