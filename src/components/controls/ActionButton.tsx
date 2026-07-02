import type { ReactNode } from 'react'
import { ArrowRightIcon } from '../icons'

interface ActionButtonProps {
  label: string
  onClick?: () => void
  /** Icon rendered inside the trailing dark circle (defaults to an arrow). */
  icon?: ReactNode
}

/**
 * White pill with a label and a trailing dark circular icon button — the shape
 * used by "QUICK GOAL" and "INITIATE" in the reference design.
 */
export function ActionButton({ label, onClick, icon }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-full bg-white/95 py-1.5 pr-1.5 pl-4 shadow-pill backdrop-blur transition hover:bg-white"
    >
      <span className="text-xs font-semibold tracking-wide text-ink-800">
        {label}
      </span>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-white transition group-hover:bg-ink-600 group-active:scale-95">
        {icon ?? <ArrowRightIcon width={16} height={16} />}
      </span>
    </button>
  )
}
