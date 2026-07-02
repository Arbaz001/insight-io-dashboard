/** Which stream is shown in the large stage; the other one goes to the PiP. */
export type ViewKind = 'map' | 'camera'

/** Drive mode toggle in the top bar. */
export type DriveMode = 'AUTO' | 'MANUAL'

export type StatusLevel = 'Okay' | 'Warning' | 'Fault'

/** Simulated robot telemetry shown in the top bar. */
export interface Telemetry {
  battery: number
  signal: 'Strong' | 'Fair' | 'Weak'
  failsafe: StatusLevel
  system: StatusLevel
}

/** Planar pose of the robot on the map (metres + radians). */
export interface Pose {
  x: number
  y: number
  heading: number
}

/** WASD / arrow drive input, one flag per direction. */
export interface DriveKeys {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
}
