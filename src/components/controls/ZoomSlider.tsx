import { useDashboard } from '../../lib/store'
import { MinusIcon, PlusIcon } from '../icons'

/**
 * Vertical map-zoom control: +/- steppers bracketing a native range input.
 * It writes the single `zoom` value that `MapView`'s ZoomRig turns into an
 * orbit-camera distance.
 */
export function ZoomSlider() {
  const zoom = useDashboard((s) => s.zoom)
  const setZoom = useDashboard((s) => s.setZoom)
  const nudgeZoom = useDashboard((s) => s.nudgeZoom)

  return (
    <div className="flex flex-col items-center gap-2 rounded-full bg-white/90 p-1.5 shadow-pill backdrop-blur">
      <button
        type="button"
        aria-label="Zoom in"
        onClick={() => nudgeZoom(10)}
        className="grid h-7 w-7 place-items-center rounded-full text-ink-700 transition hover:bg-black/5 active:scale-95"
      >
        <PlusIcon width={16} height={16} />
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
        aria-label="Map zoom"
        className="zoom-range"
      />

      <button
        type="button"
        aria-label="Zoom out"
        onClick={() => nudgeZoom(-10)}
        className="grid h-7 w-7 place-items-center rounded-full text-ink-700 transition hover:bg-black/5 active:scale-95"
      >
        <MinusIcon width={16} height={16} />
      </button>
    </div>
  )
}
