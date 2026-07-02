import { useEffect, useRef } from 'react'
import { useDashboard } from '../../lib/store'

const VIDEO_URL = `${import.meta.env.BASE_URL}data/camera-feed.mp4`

/**
 * The camera feed: a looping local MP4 dressed with a lightweight HUD so it
 * reads as a live robot front-camera. Playback follows the global pause state.
 * Swapping to a live MJPEG/WebRTC stream would only mean changing the `src`.
 */
export function CameraView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const paused = useDashboard((s) => s.paused)

  // Kick off playback, and recover if the browser blocked autoplay (common in
  // macOS Low Power Mode / battery-saver, where even muted autoplay is denied).
  // Retrying on `canplay` and on the first user gesture makes the feed reliable.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const tryPlay = () => {
      if (!useDashboard.getState().paused) void video.play().catch(() => {})
    }

    tryPlay()
    video.addEventListener('canplay', tryPlay)
    window.addEventListener('pointerdown', tryPlay)
    window.addEventListener('keydown', tryPlay)

    return () => {
      video.removeEventListener('canplay', tryPlay)
      window.removeEventListener('pointerdown', tryPlay)
      window.removeEventListener('keydown', tryPlay)
    }
  }, [])

  // Mirror the global pause state.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (paused) {
      video.pause()
    } else {
      void video.play().catch(() => {})
    }
  }, [paused])

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        className="h-full w-full object-cover"
        autoPlay
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
            className={`h-2 w-2 rounded-full bg-estop-red ${paused ? '' : 'animate-pulse'}`}
          />
          {paused ? 'PAUSED' : 'REC'}
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
