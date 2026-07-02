import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useDashboard } from '../../lib/store'

const MAX_SPEED = 7 // metres / second
const TURN_RATE = 2.2 // radians / second
const BOUNDS = { x: 20, y: 14 } // keep the robot inside the warehouse

/**
 * The robot avatar on the map. It integrates its own pose every frame from the
 * store's drive keys (populated by both the keyboard hook and the on-screen
 * joystick), so teleop feels immediate without funnelling per-frame updates
 * through React. Motion is gated by `canDrive` (MANUAL, not paused, not e-stop).
 */
export function RobotMarker() {
  const group = useRef<THREE.Group>(null)
  const pose = useRef({ x: 0, y: 0, heading: Math.PI / 2 })

  useFrame((_, rawDelta) => {
    const g = group.current
    if (!g) return
    const delta = Math.min(rawDelta, 0.05) // guard against tab-switch jumps

    const state = useDashboard.getState()
    if (state.canDrive()) {
      const { forward, back, left, right } = state.keys
      const throttle = (forward ? 1 : 0) - (back ? 1 : 0)
      const steer = (left ? 1 : 0) - (right ? 1 : 0)

      pose.current.heading += steer * TURN_RATE * delta
      const dist = throttle * MAX_SPEED * delta
      pose.current.x += Math.cos(pose.current.heading) * dist
      pose.current.y += Math.sin(pose.current.heading) * dist

      pose.current.x = THREE.MathUtils.clamp(pose.current.x, -BOUNDS.x, BOUNDS.x)
      pose.current.y = THREE.MathUtils.clamp(pose.current.y, -BOUNDS.y, BOUNDS.y)
    }

    g.position.set(pose.current.x, pose.current.y, 0.35)
    g.rotation.z = pose.current.heading
  })

  return (
    <group ref={group}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.4, 0.9, 0.55]} />
        <meshStandardMaterial color="#1c2734" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Heading indicator (points along +X = forward) */}
      <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.35, 0.7, 4]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.5}
        />
      </mesh>
      {/* Ground footprint ring */}
      <mesh position={[0, 0, -0.33]} rotation={[0, 0, 0]}>
        <ringGeometry args={[1.1, 1.35, 40]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
