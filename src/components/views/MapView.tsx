import { Grid, Html, OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import { useDashboard } from '../../lib/store'
import { PointCloud } from './PointCloud'
import { RobotMarker } from './RobotMarker'

const MAP_URL = `${import.meta.env.BASE_URL}data/warehouse_map.pcd`

const isDriving = (s: ReturnType<typeof useDashboard.getState>) =>
  s.canDrive() &&
  (s.keys.forward || s.keys.back || s.keys.left || s.keys.right)

/** Maps the 0–100 zoom slider onto an orbit-camera distance. */
function ZoomRig() {
  const zoom = useDashboard((s) => s.zoom)
  const camera = useThree((s) => s.camera)
  const invalidate = useThree((s) => s.invalidate)
  const controls = useThree((s) => s.controls) as unknown as
    | { target: THREE.Vector3; update: () => void }
    | null

  useEffect(() => {
    const target = controls?.target ?? new THREE.Vector3()
    const dir = new THREE.Vector3().subVectors(camera.position, target)
    if (dir.lengthSq() < 1e-6) dir.set(0, 1, 0.8)
    dir.normalize()
    const distance = THREE.MathUtils.lerp(72, 15, zoom / 100)
    camera.position.copy(target).addScaledVector(dir, distance)
    controls?.update()
    invalidate() // demand-mode render loop needs a nudge to redraw
  }, [zoom, camera, controls, invalidate])

  return null
}

/**
 * Keeps the on-demand render loop ticking only while the robot is actually
 * being driven. When idle (or just orbiting), the GPU sits at ~0% instead of
 * re-rendering 60fps forever — the main fix for the laptop running hot.
 */
function DriveLoop() {
  const invalidate = useThree((s) => s.invalidate)

  useEffect(() => {
    let raf = 0
    let running = false

    const tick = () => {
      if (isDriving(useDashboard.getState())) {
        invalidate()
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }

    const unsub = useDashboard.subscribe((state) => {
      if (isDriving(state) && !running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      unsub()
    }
  }, [invalidate])

  return null
}

function Loader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-ink-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-500/30 border-t-ink-700" />
        <span className="text-xs font-medium">Loading point cloud…</span>
      </div>
    </Html>
  )
}

/**
 * The 3D map: an orbitable point cloud loaded from a `.pcd` file with the robot
 * avatar composited on top. Wheel-zoom is disabled so the vertical slider is the
 * single source of truth for zoom.
 */
export function MapView() {
  return (
    <Canvas
      frameloop="demand"
      camera={{ position: [0, 34, 26], fov: 42, near: 0.1, far: 500 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <color attach="background" args={['#eceae5']} />
      <fog attach="fog" args={['#eceae5', 60, 130]} />

      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 20, 8]} intensity={1.1} />

      <Grid
        position={[0, -0.01, 0]}
        args={[120, 120]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#c9c6c0"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#b4b0a8"
        fadeDistance={110}
        fadeStrength={1.5}
        infiniteGrid
      />

      <Suspense fallback={<Loader />}>
        {/* Rotate the file's Z-up frame into three.js' Y-up world. */}
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <PointCloud url={MAP_URL} />
          <RobotMarker />
        </group>
      </Suspense>

      <OrbitControls
        makeDefault
        enableZoom={false}
        enablePan
        maxPolarAngle={Math.PI / 2.05}
        minDistance={10}
        maxDistance={90}
      />
      <ZoomRig />
      <DriveLoop />
    </Canvas>
  )
}
