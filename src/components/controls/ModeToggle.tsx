import { useDashboard } from '../../lib/store'
import type { DriveMode } from '../../lib/types'

const MODES: DriveMode[] = ['AUTO', 'MANUAL']

/**
 * AUTO / MANUAL segmented toggle. Switching to MANUAL is what unlocks the
 * WASD + joystick teleop controls.
 */
export function ModeToggle() {
  const mode = useDashboard((s) => s.mode)
  const setMode = useDashboard((s) => s.setMode)

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pr-2 pl-3 shadow-pill backdrop-blur">
      <span className="text-[10px] font-bold tracking-[0.18em] text-ink-500">
        MODE
      </span>
      <div className="flex rounded-full bg-black/5 p-0.5">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide transition ${
              mode === m
                ? 'bg-ink-800 text-white shadow-sm'
                : 'text-ink-500 hover:text-ink-800'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}
