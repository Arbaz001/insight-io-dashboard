import { useEffect } from 'react'
import { useDashboard } from '../lib/store'

/** Bottom-centre transient notification driven by the store's `toast` value. */
export function Toast() {
  const toast = useDashboard((s) => s.toast)
  const clearToast = useDashboard((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(clearToast, 2400)
    return () => window.clearTimeout(id)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 z-40 -translate-x-1/2">
      <div className="rounded-full bg-ink-800/95 px-4 py-2 text-xs font-semibold text-white shadow-float backdrop-blur">
        {toast}
      </div>
    </div>
  )
}
