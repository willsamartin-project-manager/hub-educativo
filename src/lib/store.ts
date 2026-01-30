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
    mode: 'standard' | 'marathon' | 'daily'
    subject: string
    grade: string
    lives: number

    // Actions
    startGame: (deck: Question[], deckId: string, mode?: 'standard' | 'marathon' | 'daily', subject?: string, grade?: string) => void
    answerQuestion: (index: number) => 'correct' | 'wrong'
    nextQuestion: () => void
    appendQuestions: (questions: Question[]) => void
    useLifeline: (type: 'skip' | 'fiftyFifty') => void
    resetGame: () => void
    restartGame: () => void
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
    mode: 'standard',
    subject: '',
    grade: '',
    lives: 3,

    startGame: (deck, deckId, mode = 'standard', subject = '', grade = '') => set({
        status: 'playing',
        deck,
        deckId,
        mode,
        subject,
        grade,
        lives: 3,
        currentQuestionIndex: 0,
        score: 0,
        lifelines: { skip: true, fiftyFifty: true }
    }),

    answerQuestion: (optionIndex) => {
        const { deck, currentQuestionIndex, score, lives } = get()
        const question = deck[currentQuestionIndex]

        if (optionIndex === question.correctIndex) {
            set({ score: score + 100 })
            return 'correct'
        } else {
            const newLives = lives - 1
            if (newLives <= 0) {
                set({ lives: 0, status: 'lost' }) // Immediate game over if 0 lives
            } else {
                set({ lives: newLives })
            }
            return 'wrong'
        }
    },

    nextQuestion: () => {
        const { deck, currentQuestionIndex, score, mode } = get()
        const isLastQuestion = currentQuestionIndex === deck.length - 1

        if (isLastQuestion) {
            if (mode === 'marathon') {
                // In marathon, if we ran out of questions, we just wait (or maybe set a loading status if we wanted)
                // ideally appendQuestions should have happened before this.
                // If we are here in marathon, user beat the generator.
                return
            }
            set({ status: 'won', score: score + 1000 })
        } else {
            set({ currentQuestionIndex: currentQuestionIndex + 1 })
        }
    },

    appendQuestions: (newQuestions) => set((state) => ({
        deck: [...state.deck, ...newQuestions]
    })),

    useLifeline: (type) => {
        set((state) => ({
            lifelines: {
                ...state.lifelines,
                [type]: false
            },
            currentQuestionIndex: type === 'skip' ? state.currentQuestionIndex + 1 : state.currentQuestionIndex
        }))
    },

    resetGame: () => set({ status: 'idle', deck: [] }),

    restartGame: () => set({
        status: 'playing',
        currentQuestionIndex: 0,
        score: 0,
        lives: 3,
        lifelines: { skip: true, fiftyFifty: true }
    })
}))
