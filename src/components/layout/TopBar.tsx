import { useDashboard } from '../../lib/store'
import type { StatusLevel } from '../../lib/types'
import { ActionButton } from '../controls/ActionButton'
import { ModeToggle } from '../controls/ModeToggle'
import { PauseIcon, PlayIcon, SignalIcon } from '../icons'

/** Small battery glyph whose fill + colour track the charge level. */
function Battery({ level }: { level: number }) {
  const color =
    level <= 15
      ? 'var(--color-estop-red)'
      : level <= 30
        ? 'var(--color-estop-yellow)'
        : 'var(--color-status)'
  return (
    <span className="inline-flex items-center gap-1.5 text-white">
      <span className="text-xs font-semibold">{Math.round(level)}%</span>
      <span className="relative inline-block h-3.5 w-7 rounded-[3px] border border-white/50">
        <span className="absolute top-1/2 -right-1 h-1.5 w-0.5 -translate-y-1/2 rounded-r bg-white/50" />
        <span
          className="absolute inset-y-0.5 left-0.5 rounded-[1px] transition-all"
          style={{
            width: `calc(${Math.max(4, level)}% - 4px)`,
            background: color,
          }}
        />
      </span>
    </span>
  )
}

function StatusChip({ label, level }: { label: string; level: StatusLevel }) {
  const dot =
    level === 'Okay'
      ? 'bg-status'
      : level === 'Warning'
        ? 'bg-estop-yellow'
        : 'bg-estop-red'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-white/55">{label}</span>
      <span className="text-xs font-semibold text-white">{level}</span>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
    </span>
  )
}

/**
 * The floating top chrome: mission status + pause on the left, live telemetry
 * and the current-view label in the centre, drive mode + initiate on the right.
 * It sits above the stage and only its interactive pills capture pointer events.
 */
export function TopBar() {
  const mission = useDashboard((s) => s.mission)
  const paused = useDashboard((s) => s.paused)
  const togglePause = useDashboard((s) => s.togglePause)
  const telemetry = useDashboard((s) => s.telemetry)
  const estop = useDashboard((s) => s.estop)
  const mainView = useDashboard((s) => s.mainView)
  const notify = useDashboard((s) => s.notify)

  const systemLevel: StatusLevel = estop ? 'Fault' : telemetry.system

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-3">
      {/* Left cluster */}
      <div className="pointer-events-auto flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-full bg-white/95 py-1.5 pr-1.5 pl-4 shadow-pill backdrop-blur">
          <span className="text-[11px] text-ink-500">Status</span>
          <span className="text-xs font-semibold text-ink-800">{mission}</span>
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? 'Resume mission' : 'Pause mission'}
            className="ml-1 grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-white transition hover:bg-ink-600 active:scale-95"
          >
            {paused ? (
              <PlayIcon width={15} height={15} />
            ) : (
              <PauseIcon width={15} height={15} />
            )}
          </button>
        </div>
        <ActionButton
          label="QUICK GOAL"
          onClick={() => notify('Quick goal set')}
        />
      </div>

      {/* Centre cluster */}
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        <div className="hidden items-center gap-5 rounded-2xl bg-ink-800/95 px-5 py-2.5 shadow-float backdrop-blur lg:flex">
          <Battery level={telemetry.battery} />
          <span className="inline-flex items-center gap-1.5 text-white">
            <SignalIcon width={15} height={15} className="text-status" />
            <span className="text-xs font-semibold">{telemetry.signal}</span>
          </span>
          <StatusChip label="Failsafe" level={telemetry.failsafe} />
          <StatusChip label="System" level={systemLevel} />
        </div>
        <span className="rounded-full bg-ink-800/95 px-4 py-1.5 text-xs font-semibold tracking-wide text-white shadow-float backdrop-blur">
          {mainView === 'map' ? 'Map View' : 'Camera View'}
        </span>
      </div>

      {/* Right cluster */}
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <ModeToggle />
        <ActionButton
          label="INITIATE"
          onClick={() => notify('Mission initiated')}
        />
      </div>
    </header>
  )
}
