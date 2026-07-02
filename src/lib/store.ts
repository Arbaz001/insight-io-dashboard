import { create } from 'zustand'
import type {
  DriveKeys,
  DriveMode,
  Pose,
  Telemetry,
  ViewKind,
} from './types'

/**
 * Central dashboard state.
 *
 * A single Zustand store keeps every widget in sync: swapping the main view,
 * driving the robot, tripping the e-stop and streaming telemetry all read from
 * and write to the same place, which keeps the components themselves thin.
 */
interface DashboardState {
  /** Stream currently shown large; the other is the picture-in-picture. */
  mainView: ViewKind
  swapView: () => void

  mode: DriveMode
  setMode: (mode: DriveMode) => void

  /** Mission pause (freezes robot motion + camera playback). */
  paused: boolean
  togglePause: () => void

  /** Latched emergency stop. */
  estop: boolean
  toggleEstop: () => void

  telemetry: Telemetry
  setTelemetry: (patch: Partial<Telemetry>) => void

  /** Map zoom 0–100, driven by the vertical slider and +/- buttons. */
  zoom: number
  setZoom: (zoom: number) => void
  nudgeZoom: (delta: number) => void

  keys: DriveKeys
  setKey: (key: keyof DriveKeys, pressed: boolean) => void
  releaseKeys: () => void

  pose: Pose
  setPose: (pose: Pose) => void

  mission: string

  /** Transient status message shown as a toast. */
  toast: string | null
  notify: (message: string) => void
  clearToast: () => void

  /** True while the robot may actually move. */
  canDrive: () => boolean
}

const NO_KEYS: DriveKeys = {
  forward: false,
  back: false,
  left: false,
  right: false,
}

export const useDashboard = create<DashboardState>((set, get) => ({
  mainView: 'map',
  swapView: () =>
    set((s) => ({ mainView: s.mainView === 'map' ? 'camera' : 'map' })),

  mode: 'AUTO',
  setMode: (mode) => {
    set({ mode })
    if (mode === 'AUTO') set({ keys: { ...NO_KEYS } })
    get().notify(`Drive mode: ${mode}`)
  },

  paused: false,
  togglePause: () =>
    set((s) => {
      const paused = !s.paused
      return { paused }
    }),

  estop: false,
  toggleEstop: () =>
    set((s) => {
      const estop = !s.estop
      get().notify(
        estop ? 'EMERGENCY STOP engaged' : 'Emergency stop released',
      )
      return { estop, keys: estop ? { ...NO_KEYS } : s.keys }
    }),

  telemetry: {
    battery: 100,
    signal: 'Strong',
    failsafe: 'Okay',
    system: 'Okay',
  },
  setTelemetry: (patch) =>
    set((s) => ({ telemetry: { ...s.telemetry, ...patch } })),

  zoom: 55,
  setZoom: (zoom) => set({ zoom: clamp(zoom, 0, 100) }),
  nudgeZoom: (delta) => set((s) => ({ zoom: clamp(s.zoom + delta, 0, 100) })),

  keys: { ...NO_KEYS },
  setKey: (key, pressed) => {
    if (!get().canDrive()) return
    set((s) => ({ keys: { ...s.keys, [key]: pressed } }))
  },
  releaseKeys: () => set({ keys: { ...NO_KEYS } }),

  pose: { x: 0, y: 0, heading: 0 },
  setPose: (pose) => set({ pose }),

  mission: 'On Mission 1234',

  toast: null,
  notify: (message) => set({ toast: message }),
  clearToast: () => set({ toast: null }),

  canDrive: () => {
    const s = get()
    return s.mode === 'MANUAL' && !s.paused && !s.estop
  },
}))

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
