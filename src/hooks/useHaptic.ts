'use client'

import { useCallback } from 'react'

export function useHaptic() {
    const vibrate = useCallback((pattern: number | number[] = 10) => {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern)
        }
    }, [])

    const success = useCallback(() => vibrate([10, 30, 10]), [vibrate])
    const error = useCallback(() => vibrate([50, 100, 50]), [vibrate])
    const light = useCallback(() => vibrate(5), [vibrate]) // Click feel

    return { vibrate, success, error, light }
}
