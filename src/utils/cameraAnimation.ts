import * as THREE from 'three'
import { latLngToVector3 } from './geo'
import { GLOBE_RADIUS, FLY_DURATION_MS } from '../constants'

// 全局取消令牌：新飞行开始时自动中止上一次
let activeCancelFn: (() => void) | null = null

/**
 * smootherstep easing (Ken Perlin)
 * 6t^5 - 15t^4 + 10t^3 — 斜率在 0 和 1 处均为 0，无断点
 */
function cinematicEase(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * 沿球面弧线飞行到目标经纬度
 * - 方向向量 slerp（不穿球）
 * - 取消上一次飞行
 * - 飞行期间禁用 OrbitControls（防止其内部阻尼干扰手动位置设定）
 * - 飞行结束后自动恢复 controls.enabled 和 autoRotate 的原始值
 *
 * 目标方向用 latLngToVector3 计算，因为已补偿
 * react-globe.gl 内部对 globe 组施加的 Y(-PI/2) 旋转。
 */
export function flyToCoord(
  camera: THREE.PerspectiveCamera,
  controls: any,
  lat: number,
  lng: number,
  duration: number = FLY_DURATION_MS,
  targetRadius: number = 200
): Promise<void> {
  // 取消上一次飞行
  if (activeCancelFn) {
    activeCancelFn()
    activeCancelFn = null
  }

  // 保存并禁用 OrbitControls（防止渲染循环的 controls.update()
  // 用阻尼状态覆盖我们手动设置的 camera.position）
  const prevAutoRotate = controls.autoRotate as boolean
  const prevEnabled = controls.enabled as boolean
  controls.autoRotate = false
  controls.enabled = false

  // 用 latLngToVector3 计算单位目标方向（补偿了 globe 旋转）
  const destDir = latLngToVector3(lat, lng, 1).normalize()

  const startPos = camera.position.clone()
  const startDir = startPos.clone().normalize()
  const startRadius = startPos.length()

  return new Promise<void>((resolve) => {
    let cancelled = false
    activeCancelFn = () => {
      cancelled = true
      controls.enabled = prevEnabled
      controls.autoRotate = prevAutoRotate
      resolve()
    }

    const startTime = performance.now()

    const tick = () => {
      if (cancelled) return

      const elapsed = performance.now() - startTime
      const raw = Math.min(elapsed / duration, 1)
      const t = cinematicEase(raw)

      // 球面弧线：方向 slerp + 半径线性插值
      const dir = new THREE.Vector3().slerpVectors(startDir, destDir, t)
      const radius = THREE.MathUtils.lerp(startRadius, targetRadius, t)
      camera.position.copy(dir).multiplyScalar(radius)

      if (raw < 1) {
        requestAnimationFrame(tick)
      } else {
        activeCancelFn = null
        controls.enabled = prevEnabled
        controls.autoRotate = prevAutoRotate
        resolve()
      }
    }

    requestAnimationFrame(tick)
  })
}

/**
 * 将 3D 世界坐标投影为屏幕坐标
 * 返回 null 表示点在镜头背后（z > 1）
 */
export function worldToScreen(
  position: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
): { x: number; y: number } | null {
  const projected = position.clone().project(camera)
  if (projected.z > 1.0) return null
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
  }
}