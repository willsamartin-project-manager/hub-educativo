import { create } from 'zustand'

export type Question = {
    id: string
    text: string
    options: string[]
    correctIndex: number
    difficulty: 'easy' | 'medium' | 'hard'
    explanation?: string
}

type GameState = {
    status: 'idle' | 'playing' | 'won' | 'lost'
    currentQuestionIndex: number
    score: number
    lifelines: {
        skip: boolean
        fiftyFifty: boolean
    }
    deck: Question[]
    deckId: string | null

    // Actions
    startGame: (deck: Question[], deckId: string) => void
    answerQuestion: (index: number) => 'correct' | 'wrong'
    nextQuestion: () => void
    useLifeline: (type: 'skip' | 'fiftyFifty') => void
    resetGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
    status: 'idle',
    currentQuestionIndex: 0,
    score: 0,
    lifelines: {
        skip: true,
        fiftyFifty: true
    },
    deck: [],
    deckId: null,

    startGame: (deck, deckId) => set({
        status: 'playing',
        deck,
        deckId,
        currentQuestionIndex: 0,
        score: 0,
        lifelines: { skip: true, fiftyFifty: true }
    }),

    answerQuestion: (optionIndex) => {
        const { deck, currentQuestionIndex, score } = get()
        const question = deck[currentQuestionIndex]

        if (optionIndex === question.correctIndex) {
            // Correct logic
            // We just update score here, DO NOT move index
            set({ score: score + 100 })
            return 'correct'
        } else {
            // Wrong logic - Game Over? 
            // WAIT: If we want to show explanation even on wrong answer, we shouldn't set status='lost' immediately if life system allows continue.
            // But current logic is "Show do Milhão" (Single elimination?).
            // If single elimination, 'lost' status ends game immediately and shows ResultView.
            // Meaning explanation on LOSS is tricky unless we change 'lost' behavior.

            // For now, let's keep Single Elimination but maybe delay the 'lost' status transition?
            // Actually, if we return 'wrong', the UI shows red.
            // We should NOT set 'lost' yet if we want to show explanation. 
            // We can set a temporary 'review' state or just handle it in UI.

            // Let's decided: "loss" means instant game over in Show do Milhão.
            // So explanation on error might be shown IN the ResultView or we change rules.
            // Assuming User wants explanation on error too before Game Over screen.

            // Let's play safe: On Wrong, allow explanation, THEN Game Over when clicking Next.
            return 'wrong'
        }
    },

    nextQuestion: () => {
        const { deck, currentQuestionIndex, score } = get()
        const isLastQuestion = currentQuestionIndex === deck.length - 1

        if (isLastQuestion) {
            set({ status: 'won', score: score + 1000 }) // Bonus for completion
        } else {
            set({ currentQuestionIndex: currentQuestionIndex + 1 })
        }
    },

    useLifeline: (type) => {
        set((state) => ({
            lifelines: {
                ...state.lifelines,
                [type]: false
            },
            // Logic for applying lifeline would happen in UI (e.g. hiding options)
            // For 'skip', we just move next:
            currentQuestionIndex: type === 'skip' ? state.currentQuestionIndex + 1 : state.currentQuestionIndex
        }))
    },

    resetGame: () => set({ status: 'idle', deck: [] })
}))
