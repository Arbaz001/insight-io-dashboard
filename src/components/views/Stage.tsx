import type { ReactNode } from 'react'
import { useDashboard } from '../../lib/store'
import type { ViewKind } from '../../lib/types'
import { CameraView } from './CameraView'
import { MapView } from './MapView'

/**
 * Wraps a view either as the full-bleed main stage or as the clickable
 * picture-in-picture tile. Both views stay mounted at all times — only the
 * wrapper's styling changes — so swapping never reloads the point cloud or
 * restarts the video.
 */
function ViewFrame({
  kind,
  isMain,
  children,
}: {
  kind: ViewKind
  isMain: boolean
  children: ReactNode
}) {
  const swapView = useDashboard((s) => s.swapView)
  const label = kind === 'map' ? 'map view' : 'camera view'

  if (isMain) {
    return <div className="absolute inset-0 z-0">{children}</div>
  }

  return (
    <button
      type="button"
      onClick={swapView}
      aria-label={`Enter ${label}`}
      className="group absolute bottom-4 left-16 z-10 h-32 w-52 overflow-hidden rounded-xl border border-white/40 shadow-float ring-1 ring-black/5 transition hover:scale-[1.02] sm:h-36 sm:w-64"
    >
      <div className="pointer-events-none h-full w-full">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
        <span className="rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">
          Click to enter {label}
        </span>
      </div>
    </button>
  )
}

/** The main viewport: swaps the 3D map and the camera feed between the large
 *  stage and the picture-in-picture tile. */
export function Stage() {
  const mainView = useDashboard((s) => s.mainView)

  return (
    <div className="absolute inset-0">
      <ViewFrame kind="map" isMain={mainView === 'map'}>
        <MapView />
      </ViewFrame>
      <ViewFrame kind="camera" isMain={mainView === 'camera'}>
        <CameraView />
      </ViewFrame>
    </div>
  )
}
