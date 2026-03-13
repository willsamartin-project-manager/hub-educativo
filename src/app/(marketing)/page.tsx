import Link from "next/link";
import { ArrowRight, Brain, Sparkles, Trophy, Gamepad2 } from "lucide-react";
import { DailyDeckCard } from "@/components/marketing/DailyDeckCard";
import { cn } from "@/lib/utils";

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
            <main className="flex-1">
                <section className="pt-32 pb-20 overflow-hidden">
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
                </section>

                {/* Features / How it works */}
                <section id="features" className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold">Como funciona?</h2>
                            <p className="text-muted-foreground">Estudar nunca foi tão divertido e eficiente.</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-8">
                            <StepCard
                                number="01"
                                title="Crie ou Escolha"
                                description="Gere decks personalizados com IA sobre qualquer assunto ou escolha um da nossa biblioteca."
                                icon={<Brain className="w-6 h-6" />}
                            />
                            <StepCard
                                number="02"
                                title="Desafie a IA"
                                description="Responda questões geradas sob medida para o seu nível de ensino, do fundamental ao vestibular."
                                color="bg-blue-500"
                                icon={<Sparkles className="w-6 h-6" />}
                            />
                            <StepCard
                                number="03"
                                title="Ganhe Recompensas"
                                description="Acerte as questões para ganhar moedas virtuais e subir no ranking global de estudantes."
                                color="bg-yellow-500"
                                icon={<Trophy className="w-6 h-6" />}
                            />
                            <StepCard
                                number="04"
                                title="Duelos PvP"
                                description="Mande o link para um amigo e descubra quem sabe mais em batalhas de conhecimento em tempo real."
                                color="bg-purple-500"
                                icon={<Gamepad2 className="w-6 h-6" />}
                            />
                        </div>
                    </div>
                </section>

                {/* Pricing / Plans */}
                <section id="pricing" className="py-24">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                            <h2 className="text-3xl md:text-4xl font-bold">Nossos Planos</h2>
                            <p className="text-muted-foreground">Escolha o boost ideal para sua jornada de estudos.</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <PriceCard
                                title="Pack Iniciante"
                                price="R$ 4,90"
                                coins="100 Moedas"
                                features={["Acesso total aos decks", "Duelos ilimitados", "Evolução de Perfil"]}
                                buttonText="Comprar Agora"
                                href="/login?mode=signup"
                            />
                            <PriceCard
                                title="Pack Popular"
                                price="R$ 12,90"
                                coins="300 Moedas"
                                features={["Melhor para começar", "Bônus progressivo", "Acesso Premium", "Sem interrupções"]}
                                highlight
                                buttonText="Mais Vendido"
                                href="/login?mode=signup"
                            />
                            <PriceCard
                                title="Pack Mestre"
                                price="R$ 24,90"
                                coins="700 Moedas"
                                features={["Máximo custo-benefício", "Estude sem limites", "Relatórios de IA", "Suporte VIP"]}
                                buttonText="Levar Melhor Pack"
                                href="/login?mode=signup"
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="py-12 border-t border-border/40">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>© 2026 Hub Educativo. Elevando o nível do seu aprendizado.</p>
                </div>
            </footer>
        </div>
    );
}

function StepCard({ number, title, description, color = "bg-primary", icon }: any) {
    return (
        <div className="relative p-8 bg-card border border-border/50 rounded-3xl space-y-4 hover:border-primary/30 transition-colors group">
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="space-y-2">
                <div className="text-xs font-bold text-primary/50 tracking-widest uppercase">{number}</div>
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

function PriceCard({ title, price, coins, features, highlight = false, buttonText, href }: any) {
    return (
        <div className={cn(
            "p-8 rounded-3xl border transition-all flex flex-col gap-6",
            highlight
                ? "bg-primary text-primary-foreground border-primary shadow-[0_20px_40px_-15px_var(--color-primary)] scale-105"
                : "bg-card border-border/50 hover:border-primary/20"
        )}>
            <div className="space-y-1">
                <h3 className="font-bold text-xl">{title}</h3>
                <div className="text-sm font-bold text-primary-foreground/70 uppercase tracking-widest">{coins}</div>
                <div className="text-3xl font-bold">{price}</div>
            </div>
            <ul className="space-y-3 flex-1">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                        <div className={cn("w-1.5 h-1.5 rounded-full", highlight ? "bg-white" : "bg-primary")} />
                        {f}
                    </li>
                ))}
            </ul>
            <Link
                href={href}
                className={cn(
                    "w-full py-3 rounded-xl font-bold text-center transition-all",
                    highlight
                        ? "bg-white text-primary hover:bg-white/90"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
            >
                {buttonText}
            </Link>
        </div>
    )
}
