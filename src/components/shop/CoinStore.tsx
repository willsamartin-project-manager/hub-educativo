'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/lib/store' // Assuming we might store user info here or fetch it

// Package Definitions
const PACKAGES = [
    { id: 1, price: 10, coins: 100, label: 'Pack Iniciante', color: 'bg-blue-500' },
    { id: 2, price: 25, coins: 300, label: 'Pack Popular', color: 'bg-purple-500', popular: true },
    { id: 3, price: 50, coins: 700, label: 'Pack Mestre', color: 'bg-amber-500' }
]

export function CoinStore({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [loadingPackage, setLoadingPackage] = useState<number | null>(null)
    const [cpf, setCpf] = useState('')
    const [showCpfInput, setShowCpfInput] = useState(false)
    const [selectedPkg, setSelectedPkg] = useState<any>(null)
    const [qrCodeData, setQrCodeData] = useState<{ code: string, base64: string, id: string } | null>(null)
    const [copied, setCopied] = useState(false)
    const [status, setStatus] = useState<'waiting' | 'paid'>('waiting')

    // Helper to format CPF
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const initiateBuy = (pkg: any) => {
        setSelectedPkg(pkg)
        setShowCpfInput(true)
    }

    const confirmBuy = async () => {
        if (!selectedPkg) return
        if (cpf.length < 14) {
            alert('CPF inválido')
            return
        }

        handleBuy(selectedPkg, cpf.replace(/\D/g, ''))
    }

    // Polling logic
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (qrCodeData && status === 'waiting') {
            interval = setInterval(async () => {
                // In a real app, subscribe to Supabase Realtime 'transactions' table for instant update
                // For MVP, simplistic check:
                // We'll skip check for now or assume user clicks "I paid" to force refresh 
                // OR we could check an endpoint. 
                // Let's implement a 'check-status' logic if meaningful.
            }, 3000)
        }
        return () => clearInterval(interval)
    }, [qrCodeData, status])

    const handleBuy = async (pkg: any, cleanCpf: string) => {
        setLoadingPackage(pkg.id)

        // Don't close input yet, waiting for success

        try {
            // Get user ID (this needs to be robust, usually passed in or from auth hook)
            const { supabase } = await import('@/lib/supabase')
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                alert('Faça login para comprar.')
                setLoadingPackage(null)
                return
            }

            const res = await fetch('/api/payment/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: pkg.id,
                    amount: pkg.price,
                    userId: user.id,
                    email: user.email,
                    cpf: cleanCpf // Send CPF to backend
                })
            })

            const data = await res.json()
            if (data.qr_code_base64) {
                setQrCodeData({
                    code: data.qr_code,
                    base64: data.qr_code_base64,
                    id: data.id?.toString()
                })
                setShowCpfInput(false) // Success: hide input
                setStatus('waiting')
            } else {
                alert('Erro ao gerar PIX: ' + (data.error || 'Desconhecido'))
            }

        } catch (e) {
            console.error(e)
            alert('Erro ao conectar.')
        } finally {
            setLoadingPackage(null)
        }
    }

    const copyPix = () => {
        if (!qrCodeData) return
        navigator.clipboard.writeText(qrCodeData.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-card w-full max-w-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative"
                >
                    <button onClick={() => { onClose(); setShowCpfInput(false); setQrCodeData(null); }} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>

                    <div className="p-6 text-center border-b border-white/5">
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-amber-600">Loja de Moedas</h2>
                        <p className="text-sm text-muted-foreground">Recarregue para jogar mais!</p>
                    </div>

                    <div className="p-6">
                        {showCpfInput ? (
                            <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95">
                                <h3 className="text-lg font-bold text-center">Informe seu CPF</h3>
                                <p className="text-sm text-muted-foreground text-center -mt-2">Necessário para gerar o PIX.</p>

                                <input
                                    value={cpf}
                                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    maxLength={14}
                                    className="bg-secondary/50 border border-white/10 rounded-xl p-4 text-center text-xl font-mono tracking-widest outline-none focus:border-primary transition-colors"
                                />

                                <button
                                    onClick={confirmBuy}
                                    disabled={loadingPackage !== null}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loadingPackage ? <Loader2 className="animate-spin" /> : 'Confirmar e Pagar'}
                                </button>

                                <button onClick={() => setShowCpfInput(false)} className="text-sm text-muted-foreground hover:text-white">
                                    Cancelar
                                </button>
                            </div>
                        ) : qrCodeData ? (
                            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                                <div className="text-sm font-bold text-green-400 mb-4 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                                    PIX Gerado com Sucesso!
                                </div>
                                <div className="bg-white p-4 rounded-xl mb-4">
                                    <img
                                        src={`data:image/png;base64,${qrCodeData.base64}`}
                                        alt="QR Code PIX"
                                        className="w-48 h-48 mix-blend-multiply"
                                    />
                                </div>
                                <div className="w-full relative mb-4">
                                    <input
                                        readOnly
                                        value={qrCodeData.code}
                                        className="w-full bg-secondary/50 border border-border rounded-lg py-3 px-4 pr-12 text-xs font-mono text-muted-foreground truncate"
                                    />
                                    <button
                                        onClick={copyPix}
                                        className="absolute right-2 top-2 p-1.5 hover:bg-white/10 rounded-md transition-colors text-primary"
                                    >
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-center text-muted-foreground mb-4">
                                    Após pagar, suas moedas cairão automaticamente em alguns instantes.
                                </p>
                                <button onClick={() => setQrCodeData(null)} className="text-sm text-primary hover:underline">
                                    Voltar para pacotes
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {PACKAGES.map(pkg => (
                                    <button
                                        key={pkg.id}
                                        onClick={() => initiateBuy(pkg)}
                                        className={`w-full p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-all group relative overflow-hidden text-left flex items-center justify-between`}
                                    >
                                        {pkg.popular && (
                                            <div className="absolute top-0 right-0 bg-primary text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                                MAIS VENDIDO
                                            </div>
                                        )}
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${pkg.color} flex items-center justify-center font-bold text-white shadow-lg`}>
                                                {pkg.id}
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{pkg.coins} Moedas</div>
                                                <div className="text-sm text-muted-foreground">{pkg.label}</div>
                                            </div>
                                        </div>
                                        <div className="text-xl font-bold font-mono">
                                            R$ {pkg.price},00
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
