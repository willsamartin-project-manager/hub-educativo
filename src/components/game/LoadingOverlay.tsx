'use client'

import { motion } from 'framer-motion'
import { Brain, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const LOADING_MESSAGES = [
    "Invocando os sábios...",
    "Embaralhando o destino...",
    "Consultando a biblioteca de Alexandria...",
    "Calibrando dificuldade...",
    "Preparando desafio..."
]

export function LoadingOverlay() {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
            <div className="relative">
                {/* Pulsating Glow */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-primary/30 blur-[50px] rounded-full"
                />

                {/* Rotating Icon */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="relative bg-card border border-primary/30 p-6 rounded-2xl shadow-2xl"
                >
                    <Brain className="w-12 h-12 text-primary" />
                </motion.div>

                {/* Floating Particles */}
                <motion.div
                    animate={{ y: [-10, 10, -10], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-4 -right-4"
                >
                    <Sparkles className="w-6 h-6 text-yellow-500" />
                </motion.div>
            </div>

            <motion.div
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-8 text-xl font-bold font-mono text-primary text-center min-h-[2rem]"
            >
                {LOADING_MESSAGES[messageIndex]}
            </motion.div>

            <p className="text-sm text-muted-foreground mt-2 animate-pulse">
                A Inteligência Artificial está criando seu deck...
            </p>
        </div>
    )
}
