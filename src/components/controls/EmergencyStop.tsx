import { useDashboard } from '../../lib/store'

/**
 * The classic red/yellow mushroom-head e-stop. Latches on click: engaging it
 * freezes the robot (via the store's `canDrive` guard) and raises the alarm
 * overlay; clicking again releases it.
 */
export function EmergencyStop() {
  const estop = useDashboard((s) => s.estop)
  const toggleEstop = useDashboard((s) => s.toggleEstop)

  return (
    <button
      type="button"
      onClick={toggleEstop}
      aria-pressed={estop}
      aria-label="Emergency stop"
      className={`grid h-20 w-20 place-items-center rounded-full bg-estop-yellow shadow-float transition active:scale-95 ${
        estop ? 'animate-estop' : ''
      }`}
    >
      <span className="flex h-[68px] w-[68px] flex-col items-center justify-center rounded-full bg-estop-yellow text-[8px] leading-tight font-extrabold text-ink-900">
        <span>EMERGENCY</span>
        <span
          className={`my-0.5 grid h-9 w-9 place-items-center rounded-full border-[3px] border-estop-red ${
            estop ? 'bg-estop-red' : ''
          }`}
        >
          {/* rotating-arrows / reset glyph */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4h-4"
              stroke={estop ? '#fff' : 'var(--color-estop-red)'}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>STOP</span>
      </span>
    </button>
  )
}
