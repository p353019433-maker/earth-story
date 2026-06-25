import * as THREE from 'three'
import { Landmark } from '../data/landmarks'

export interface HitboxGroup {
  mesh: THREE.InstancedMesh
  landmarkIndices: number[]
}

/**
 * 射线检测：检测点击是否命中地标 InstancedMesh
 * 支持多个 hitbox mesh（按分类分组）
 */
export function raycastLandmarks(
  event: MouseEvent,
  camera: THREE.Camera,
  groups: HitboxGroup[],
  landmarks: Landmark[],
  rendererDom: HTMLElement
): { landmark: Landmark; point: THREE.Vector3 } | null {
  const rect = rendererDom.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const hitboxMeshes = groups.map(g => g.mesh)
  const intersects = raycaster.intersectObjects(hitboxMeshes, false)
  if (intersects.length === 0) return null

  const hit = intersects[0]
  const instanceId = hit.instanceId
  if (instanceId === undefined) return null

  // 找到被命中的 hitbox mesh 对应的 group
  const group = groups.find(g => g.mesh === hit.object)
  if (!group || instanceId >= group.landmarkIndices.length) return null

  const lmIdx = group.landmarkIndices[instanceId]
  if (lmIdx >= landmarks.length) return null

  return { landmark: landmarks[lmIdx], point: hit.point.clone() }
}
