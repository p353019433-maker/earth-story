import * as THREE from 'three'
import { Plant } from '../data/plants'

/**
 * 射线检测：检测点击是否命中植物 InstancedMesh
 * @returns 命中的 Plant 数据和 3D 交点坐标，或 null
 */
export function raycastPlants(
  event: MouseEvent,
  camera: THREE.Camera,
  meshes: THREE.Mesh[],
  plantMap: Map<THREE.InstancedMesh, Plant[]>,
  rendererDom: HTMLElement
): { plant: Plant; point: THREE.Vector3 } | null {
  const rect = rendererDom.getBoundingClientRect()
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(meshes, false)
  if (intersects.length === 0) return null

  const hit = intersects[0]
  const mesh = hit.object as THREE.InstancedMesh
  const instanceId = hit.instanceId
  if (instanceId === undefined) return null

  const plants = plantMap.get(mesh)
  if (!plants || instanceId >= plants.length) return null

  return { plant: plants[instanceId], point: hit.point.clone() }
}
