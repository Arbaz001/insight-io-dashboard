import { useEffect } from 'react'
import { useDashboard } from '../lib/store'

const SIGNALS = ['Strong', 'Strong', 'Strong', 'Fair', 'Weak'] as const

/**
 * Drives the fake telemetry stream: a slow battery drain and an occasional
 * signal-strength flicker so the top bar feels live. A real deployment would
 * swap this hook for a WebSocket / roslibjs subscription (see README).
 */
export function useTelemetrySim() {
  const setTelemetry = useDashboard((s) => s.setTelemetry)

  useEffect(() => {
    const id = window.setInterval(() => {
      const { paused, telemetry } = useDashboard.getState()
      if (paused) return

      // Trickle the battery down, recharging softly once it gets low.
      const battery =
        telemetry.battery <= 20
          ? Math.min(100, telemetry.battery + 3)
          : Math.max(0, telemetry.battery - 1)

      // Bias toward "Strong" but flicker occasionally.
      const signal = SIGNALS[Math.floor(Math.random() * SIGNALS.length)]

      setTelemetry({ battery, signal })
    }, 2500)

    return () => window.clearInterval(id)
  }, [setTelemetry])
}
