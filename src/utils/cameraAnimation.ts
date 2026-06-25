import * as THREE from 'three'

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