'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Gamepad2, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function LoginForm() {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                const next = searchParams.get('next')
                router.push(next || '/hub')
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: name }
                    }
                })
                if (error) throw error
                // Check if email confirmation is required? Usually Supabase defaults to "Confirm Email".
                // For this MVP, let's assume it might auto-login or ask for confirm.
                alert('Conta criada! Verifique se recebeu um email de confirmação ou tente entrar.')
                setIsLogin(true)
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao autenticar.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[100px]" />
            </div>

            <Link href="/" className="absolute top-8 left-8 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-8 right-8 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-bold backdrop-blur"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-secondary rounded-2xl mb-4 shadow-xl border border-white/5">
                        <Gamepad2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isLogin ? 'Bem-vindo de volta' : 'Crie sua conta'}
                    </h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        {isLogin ? 'Continue sua jornada pelo conhecimento.' : 'Comece a desafiar seus limites hoje.'}
                    </p>
                </div>

                <motion.div
                    className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Shine Effect on Card */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />

                    <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                        {!isLogin && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            placeholder="Seu nome"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Série</label>
                                        <select className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer">
                                            <option>Ensino Médio</option>
                                            <option>Fundamental II</option>
                                            <option>Concurso</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="exemplo@email.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-[0_0_20px_-5px_var(--color-primary)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {isLogin ? 'Entrar' : 'Criar Conta'}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2 mx-auto"
                        >
                            {isLogin ? (
                                <>Não tem uma conta? <span className="font-semibold text-foreground">Cadastre-se</span></>
                            ) : (
                                <>Já tem uma conta? <span className="font-semibold text-foreground">Entrar</span></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
