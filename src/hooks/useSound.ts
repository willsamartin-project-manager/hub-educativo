'use client'

import { useCallback, useEffect, useRef } from 'react'

// Map of sound names to their file paths
// NOTE: You need to add these files to public/sounds/
const SOUNDS = {
    click: '/sounds/click.mp3',
    correct: '/sounds/correct.mp3',
    wrong: '/sounds/wrong.mp3',
    win: '/sounds/win.mp3',
    lose: '/sounds/lose.mp3',
}

type SoundType = keyof typeof SOUNDS

export function useSound() {
    // Refs to keep track of Audio objects to avoid recreation
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({})

    useEffect(() => {
        // Preload sounds
        Object.entries(SOUNDS).forEach(([key, path]) => {
            const audio = new Audio(path)
            audio.volume = 0.5 // Default volume
            audioRefs.current[key] = audio
        })
    }, [])

    const play = useCallback((sound: SoundType) => {
        const audio = audioRefs.current[sound]
        if (audio) {
            audio.currentTime = 0 // Reset to start
            audio.play().catch(e => console.warn('Audio play failed', e))
        }
    }, [])

    return { play }
}
