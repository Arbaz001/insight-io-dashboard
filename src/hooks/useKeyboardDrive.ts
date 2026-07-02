import { useEffect } from 'react'
import { useDashboard } from '../lib/store'
import type { DriveKeys } from '../lib/types'

const KEY_MAP: Record<string, keyof DriveKeys> = {
  w: 'forward',
  arrowup: 'forward',
  s: 'back',
  arrowdown: 'back',
  a: 'left',
  arrowleft: 'left',
  d: 'right',
  arrowright: 'right',
}

/**
 * Global WASD / arrow-key teleop. Key presses only take effect in MANUAL mode
 * (enforced by the store's `canDrive` guard); key releases always clear so the
 * robot can never get "stuck" driving after a mode change or window blur.
 */
export function useKeyboardDrive() {
  useEffect(() => {
    const { setKey, releaseKeys } = useDashboard.getState()

    const onKeyDown = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key.toLowerCase()]
      if (!dir || e.repeat) return
      e.preventDefault()
      setKey(dir, true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const dir = KEY_MAP[e.key.toLowerCase()]
      if (!dir) return
      // Clear directly (bypassing the canDrive guard) so releases always land.
      useDashboard.setState((s) => ({ keys: { ...s.keys, [dir]: false } }))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseKeys)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', releaseKeys)
    }
  }, [])
}
