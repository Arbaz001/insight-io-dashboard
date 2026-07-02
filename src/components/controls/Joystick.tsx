import type { ReactNode } from 'react'
import { useDashboard } from '../../lib/store'
import type { DriveKeys } from '../../lib/types'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from '../icons'

/** One directional press-and-hold pad button. */
function DirButton({
  dir,
  className,
  children,
}: {
  dir: keyof DriveKeys
  className: string
  children: ReactNode
}) {
  const active = useDashboard((s) => s.keys[dir])
  const setKey = useDashboard((s) => s.setKey)

  const press = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setKey(dir, true)
  }
  const release = () => setKey(dir, false)

  return (
    <button
      type="button"
      aria-label={dir}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={`absolute grid place-items-center text-white/70 transition ${
        active ? 'text-accent' : 'hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  )
}

/** Small WASD chip in the inner hub that lights up when its key is held. */
function KeyChip({ dir, label, className }: { dir: keyof DriveKeys; label: string; className: string }) {
  const active = useDashboard((s) => s.keys[dir])
  return (
    <span
      className={`absolute text-[11px] font-bold transition ${
        active ? 'text-accent' : 'text-ink-500'
      } ${className}`}
    >
      {label}
    </span>
  )
}

/**
 * On-screen teleop pad mirroring the reference joystick: outer directional
 * chevrons plus a WASD hub. Buttons share the exact same store actions as the
 * keyboard hook, so mouse and keyboard drive are fully interchangeable. The pad
 * dims and ignores input unless MANUAL mode is active.
 */
export function Joystick() {
  const enabled = useDashboard((s) => s.canDrive())

  return (
    <div
      className={`relative h-36 w-36 rounded-full bg-ink-800 shadow-float transition ${
        enabled ? '' : 'opacity-45'
      }`}
      title={enabled ? 'Drive (WASD / arrows)' : 'Switch to MANUAL to drive'}
    >
      <DirButton dir="forward" className="top-1.5 left-1/2 -translate-x-1/2">
        <ChevronUpIcon width={18} height={18} />
      </DirButton>
      <DirButton dir="back" className="bottom-1.5 left-1/2 -translate-x-1/2">
        <ChevronDownIcon width={18} height={18} />
      </DirButton>
      <DirButton dir="left" className="top-1/2 left-1.5 -translate-y-1/2">
        <ChevronLeftIcon width={18} height={18} />
      </DirButton>
      <DirButton dir="right" className="top-1/2 right-1.5 -translate-y-1/2">
        <ChevronRightIcon width={18} height={18} />
      </DirButton>

      {/* Inner hub */}
      <div className="absolute top-1/2 left-1/2 grid h-[76px] w-[76px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-canvas-hi shadow-inner">
        <KeyChip dir="forward" label="W" className="top-2.5" />
        <KeyChip dir="left" label="A" className="left-3" />
        <KeyChip dir="right" label="D" className="right-3" />
        <KeyChip dir="back" label="S" className="bottom-2.5" />
        <span className="text-center text-[8px] leading-tight font-semibold text-ink-500/70">
          ⌘ +<br />
          key
        </span>
      </div>
    </div>
  )
}
