'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error
            alert('Senha atualizada com sucesso!')
            router.push('/login')
        } catch (err: any) {
            setError(err.message || 'Erro ao atualizar senha.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-secondary rounded-2xl mb-4 shadow-xl border border-white/5">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Nova Senha</h1>
                    <p className="text-muted-foreground mt-2 text-sm">
                        Defina sua nova senha de acesso.
                    </p>
                </div>

                <motion.div
                    className="bg-card/50 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl shadow-[0_0_20px_-5px_var(--color-primary)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Atualizar Senha'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}
