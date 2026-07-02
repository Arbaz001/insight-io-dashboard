import { useState } from 'react'
import type { ComponentType, SVGProps } from 'react'
import {
  AnalyticsIcon,
  FrameIcon,
  GridIcon,
  MapIcon,
  PinIcon,
  TargetIcon,
  UserIcon,
} from '../icons'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

const NAV: { id: string; label: string; Icon: Icon }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: GridIcon },
  { id: 'map', label: 'Maps', Icon: MapIcon },
  { id: 'waypoints', label: 'Waypoints', Icon: PinIcon },
  { id: 'zones', label: 'Zones', Icon: FrameIcon },
  { id: 'missions', label: 'Missions', Icon: TargetIcon },
  { id: 'analytics', label: 'Analytics', Icon: AnalyticsIcon },
]

/**
 * The fixed vertical rail: brand mark, primary navigation and the account icon.
 * Purely presentational for this assignment (the dashboard tab is the active
 * screen); each item is still a real, focusable button.
 */
export function Sidebar() {
  const [active, setActive] = useState('dashboard')

  return (
    <nav className="relative z-30 flex h-full w-14 shrink-0 flex-col items-center bg-linear-to-b from-ink-800 to-ink-900 text-white/70 md:w-16">
      <div className="mt-3 mb-6 text-center leading-none select-none">
        <div className="text-lg font-extrabold tracking-tight text-white">
          ERIC
        </div>
        <div className="text-[6px] font-semibold tracking-[0.32em] text-white/45">
          ROBOTICS
        </div>
      </div>

      <ul className="flex flex-1 flex-col items-center gap-1">
        {NAV.map(({ id, label, Icon }) => {
          const isActive = id === active
          return (
            <li key={id}>
              <button
                type="button"
                title={label}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => setActive(id)}
                className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/45 hover:bg-white/5 hover:text-white/80'
                }`}
              >
                <Icon width={20} height={20} />
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        title="Account"
        aria-label="Account"
        className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-white/45 transition-colors hover:bg-white/5 hover:text-white/80"
      >
        <UserIcon width={20} height={20} />
      </button>
    </nav>
  )
}
