import { useEffect, useRef } from 'react'
import { useDashboard } from '../../lib/store'

const VIDEO_URL = `${import.meta.env.BASE_URL}data/camera-feed.mp4`

/**
 * The camera feed — a looping local MP4 dressed with a HUD so it reads as the
 * robot's onboard front camera.
 *
 * Playback is coupled to robot motion, the way a body-mounted camera behaves:
 * the feed only advances while the robot is actually moving. In MANUAL that
 * means "while you're driving (WASD / joystick)"; in AUTO the robot is on a
 * mission so the feed streams continuously. Pausing or e-stopping freezes it.
 * (With a real robot this `src` would be its live MJPEG/WebRTC stream.)
 */
export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)

  const mode = useDashboard((s) => s.mode)
  const paused = useDashboard((s) => s.paused)
  const estop = useDashboard((s) => s.estop)
  const keys = useDashboard((s) => s.keys)

  const driving = keys.forward || keys.back || keys.left || keys.right
  const live = !paused && !estop && (mode === 'AUTO' || driving)

  // Play only while the feed should be "live"; freeze otherwise.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (live) {
      void video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [live])

  // Recover if the browser blocked autoplay (e.g. macOS Low Power Mode denies
  // even muted autoplay): retry on `canplay` and on the first user gesture.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const retry = () => {
      if (live) void video.play().catch(() => {})
    }
    video.addEventListener('canplay', retry)
    window.addEventListener('pointerdown', retry)
    window.addEventListener('keydown', retry)
    return () => {
      video.removeEventListener('canplay', retry)
      window.removeEventListener('pointerdown', retry)
      window.removeEventListener('keydown', retry)
    }
  }, [live])

  const statusLabel = paused
    ? 'PAUSED'
    : estop
      ? 'STOPPED'
      : live
        ? 'REC'
        : 'STANDBY'

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        className="h-full w-full object-cover"
        muted
        loop
        playsInline
      />

      {/* HUD overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-3 left-3 rounded bg-black/40 px-2 py-1 text-[10px] font-semibold tracking-wider text-white/90 backdrop-blur">
          CAM 01 · FRONT
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded bg-black/40 px-2 py-1 text-[10px] font-semibold tracking-wider text-white/90 backdrop-blur">
          <span
            className={`h-2 w-2 rounded-full ${
              live ? 'animate-pulse bg-estop-red' : 'bg-white/50'
            }`}
          />
          {statusLabel}
        </div>
        {/* Centre reticle */}
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2">
          <div className="absolute top-1/2 left-0 h-px w-3 bg-white/60" />
          <div className="absolute top-1/2 right-0 h-px w-3 bg-white/60" />
          <div className="absolute top-0 left-1/2 h-3 w-px bg-white/60" />
          <div className="absolute bottom-0 left-1/2 h-3 w-px bg-white/60" />
        </div>
        <div className="absolute right-3 bottom-3 left-3 h-px bg-linear-to-r from-transparent via-white/25 to-transparent" />
      </div>
    </div>
  )
}
