import { useLoader } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js'

interface PointCloudProps {
  /** Path to a .pcd file served from /public. */
  url: string
  size?: number
}

/** Linear interpolation between three colours across t ∈ [0,1]. */
function heightColor(t: number, out: THREE.Color) {
  const floor = new THREE.Color('#59626f') // low / ground → slate
  const mid = new THREE.Color('#8794a6') // waist height → cool grey
  const high = new THREE.Color('#e0526f') // walls / obstacles → pink-red
  if (t < 0.5) {
    out.copy(floor).lerp(mid, t / 0.5)
  } else {
    out.copy(mid).lerp(high, (t - 0.5) / 0.5)
  }
}

/**
 * Loads a point cloud with three.js' `PCDLoader` and colours every point by its
 * height (Z), the way LiDAR occupancy maps are usually rendered. The loader is
 * suspense-based, so a parent `<Suspense>` shows the fallback while the ~1 MB
 * file streams and parses.
 */
export function PointCloud({ url, size = 0.07 }: PointCloudProps) {
  const points = useLoader(PCDLoader, url)

  const geometry = useMemo(() => {
    const geo = points.geometry as THREE.BufferGeometry
    const pos = geo.getAttribute('position') as THREE.BufferAttribute

    // Determine the vertical extent to normalise the colour ramp.
    let minZ = Infinity
    let maxZ = -Infinity
    for (let i = 0; i < pos.count; i++) {
      const z = pos.getZ(i)
      if (z < minZ) minZ = z
      if (z > maxZ) maxZ = z
    }
    const span = Math.max(1e-3, maxZ - minZ)

    const colors = new Float32Array(pos.count * 3)
    const c = new THREE.Color()
    for (let i = 0; i < pos.count; i++) {
      heightColor((pos.getZ(i) - minZ) / span, c)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.center()
    return geo
  }, [points])

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={size}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.95}
      />
    </points>
  )
}
