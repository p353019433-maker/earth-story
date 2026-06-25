import * as THREE from 'three'
import { Plant } from '../data/plants'
import { latLngToVector3 } from './geo'
import { GLOBE_RADIUS, SPRING_DAMPING } from '../constants'

const dummy = new THREE.Object3D()

/**
 * 根据海拔计算植物离地球表面的视觉高度偏移
 * altitude 0m -> 偏移 1.0 单位
 * altitude 5000m -> 偏移 3.0 单位
 */
function getAltitudeOffset(altitude: number): number {
  return 1.0 + (altitude / 5000) * 2.0
}

/**
 * 根据海拔计算植物视觉缩放
 * altitude 0m -> scale 1.4
 * altitude 5000m -> scale 3.4
 * （加大基础尺寸，保证全球远景下标记点清晰可见）
 */
function getPlantScale(altitude: number): number {
  return 1.4 + (altitude / 5000) * 2.0
}

/**
 * 在 Three.js 场景中为植物数据创建 InstancedMesh
 * - 乔木：椭球树冠 + 圆柱树干，全部光滑无棱角
 * - 花卉：球状花头 + 花心，自然色彩
 * - 所有实例通过 setMatrixAt 定位并垂直于地球表面
 * - 用 PBR Lambert 配合 emissive 提供 3D 立体感
 */
export interface PlantMeshResult {
  cleanup: () => void
  meshes: THREE.InstancedMesh[]
  /** instanceId -> Plant 映射，按 mesh 分组 */
  plantMap: Map<THREE.InstancedMesh, Plant[]>
  /** 平滑过滤动画：将不符合条件的实例缩放至 0 */
  animateFilter: (predicate: (plant: Plant) => boolean) => void
}

/**
 * 把"温和自然"的色彩按种子做小扰动，避免整片森林的视觉单一
 * 同时避免任何高饱和度的"赛博"色彩
 */
function tintColor(base: THREE.Color, seed: number, amount = 0.08): THREE.Color {
  const t = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1
  const k = (t - 0.5) * 2 * amount
  return new THREE.Color(
    Math.min(1, Math.max(0, base.r + k * 0.5)),
    Math.min(1, Math.max(0, base.g + k * 0.3)),
    Math.min(1, Math.max(0, base.b + k * 0.4))
  )
}

export function createPlantInstancedMeshes(
  scene: THREE.Scene,
  plants: Plant[]
): PlantMeshResult {
  const trees = plants.filter((p) => p.type === '乔木')
  const flowers = plants.filter((p) => p.type === '花卉')

  const meshes: THREE.InstancedMesh[] = []
  const plantMap = new Map<THREE.InstancedMesh, Plant[]>()
  const tempColor = new THREE.Color()

  // ---------- 乔木：椭球树冠 + 光滑树干 ----------
  if (trees.length > 0) {
    // 树冠：椭球（高细分），柔和森林绿
    const canopyGeo = new THREE.SphereGeometry(0.55, 24, 18)
    canopyGeo.scale(1, 1.35, 1) // 略纵向拉长，形成自然树冠形状
    const canopyBase = new THREE.Color(0x4d7a4a)
    const canopyMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x1a2618,
      emissiveIntensity: 0.16,
    })
    const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, trees.length)
    canopyMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(trees.length * 3),
      3
    )

    // 树干：光滑细圆柱，深褐色
    const trunkGeo = new THREE.CylinderGeometry(0.09, 0.13, 0.55, 16)
    const trunkMat = new THREE.MeshLambertMaterial({
      color: 0x6b4f37,
      emissive: 0x1a120a,
      emissiveIntensity: 0.12,
    })
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, trees.length)

    trees.forEach((plant, i) => {
      const offset = getAltitudeOffset(plant.altitude)
      const pos = latLngToVector3(plant.lat, plant.lng, GLOBE_RADIUS + offset)
      const normal = pos.clone().normalize()
      const scale = getPlantScale(plant.altitude)
      const baseQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      )

      // 树冠：在树木中心略偏上
      const canopyPos = pos.clone().add(normal.clone().multiplyScalar(0.55 * scale))
      dummy.position.copy(canopyPos)
      dummy.scale.set(scale, scale, scale)
      dummy.quaternion.copy(baseQuat)
      dummy.updateMatrix()
      canopyMesh.setMatrixAt(i, dummy.matrix)

      tempColor.copy(tintColor(canopyBase, i + 1))
      canopyMesh.instanceColor.setXYZ(i, tempColor.r, tempColor.g, tempColor.b)

      // 树干：在树木中心略偏下，连接地表
      const trunkPos = pos.clone().add(normal.clone().multiplyScalar(-0.15 * scale))
      dummy.position.copy(trunkPos)
      dummy.scale.set(scale, scale, scale)
      dummy.quaternion.copy(baseQuat)
      dummy.updateMatrix()
      trunkMesh.setMatrixAt(i, dummy.matrix)
    })

    canopyMesh.instanceMatrix.needsUpdate = true
    canopyMesh.instanceColor.needsUpdate = true
    trunkMesh.instanceMatrix.needsUpdate = true
    canopyMesh.name = 'instanced-tree-canopies'
    trunkMesh.name = 'instanced-tree-trunks'
    scene.add(canopyMesh)
    scene.add(trunkMesh)
    plantMap.set(canopyMesh, trees)
    plantMap.set(trunkMesh, trees)
    meshes.push(canopyMesh, trunkMesh)
  }

  // ---------- 花卉：球状花头 + 花心 ----------
  if (flowers.length > 0) {
    // 花瓣层：球形柔色
    const petalGeo = new THREE.SphereGeometry(0.42, 20, 16)
    const petalBase = new THREE.Color(0xc97090)
    const petalMat = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      emissive: 0x2e1620,
      emissiveIntensity: 0.16,
    })
    const petalMesh = new THREE.InstancedMesh(petalGeo, petalMat, flowers.length)
    petalMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(flowers.length * 3),
      3
    )

    // 花心：略小的球，暖黄
    const centerGeo = new THREE.SphereGeometry(0.18, 16, 12)
    const centerMat = new THREE.MeshLambertMaterial({
      color: 0xe8c87a,
      emissive: 0x35280f,
      emissiveIntensity: 0.22,
    })
    const centerMesh = new THREE.InstancedMesh(centerGeo, centerMat, flowers.length)

    flowers.forEach((plant, i) => {
      const offset = getAltitudeOffset(plant.altitude)
      const pos = latLngToVector3(plant.lat, plant.lng, GLOBE_RADIUS + offset)
      const normal = pos.clone().normalize()
      const scale = getPlantScale(plant.altitude)
      const baseQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      )

      // 花瓣：在花朵中心
      const petalPos = pos.clone().add(normal.clone().multiplyScalar(0.05 * scale))
      dummy.position.copy(petalPos)
      dummy.scale.set(scale, scale, scale)
      dummy.quaternion.copy(baseQuat)
      dummy.updateMatrix()
      petalMesh.setMatrixAt(i, dummy.matrix)

      tempColor.copy(tintColor(petalBase, i + 13, 0.12))
      petalMesh.instanceColor.setXYZ(i, tempColor.r, tempColor.g, tempColor.b)

      // 花心：略高一点
      const centerPos = pos.clone().add(normal.clone().multiplyScalar(0.25 * scale))
      dummy.position.copy(centerPos)
      dummy.scale.set(scale, scale, scale)
      dummy.quaternion.copy(baseQuat)
      dummy.updateMatrix()
      centerMesh.setMatrixAt(i, dummy.matrix)
    })

    petalMesh.instanceMatrix.needsUpdate = true
    petalMesh.instanceColor.needsUpdate = true
    centerMesh.instanceMatrix.needsUpdate = true
    petalMesh.name = 'instanced-flower-petals'
    centerMesh.name = 'instanced-flower-centers'
    scene.add(petalMesh)
    scene.add(centerMesh)
    plantMap.set(petalMesh, flowers)
    plantMap.set(centerMesh, flowers)
    meshes.push(petalMesh, centerMesh)
  }

  // ---------- 过滤动画系统 ----------
  // 存储每个实例的原始矩阵和当前缩放因子
  const baseMatrices = new Map<THREE.InstancedMesh, THREE.Matrix4[]>()
  const currentScales = new Map<THREE.InstancedMesh, number[]>()
  const targetScales = new Map<THREE.InstancedMesh, number[]>()
  // 存储每个实例的"初始姿态"参数（位置、切线、基础缩放），用于过滤后做轻微摆动
  const basePositions = new Map<THREE.InstancedMesh, THREE.Vector3[]>()
  const baseTangents = new Map<THREE.InstancedMesh, THREE.Vector3[]>()
  const baseQuats = new Map<THREE.InstancedMesh, THREE.Quaternion[]>()
  const baseScales = new Map<THREE.InstancedMesh, number[]>()

  meshes.forEach((mesh) => {
    const plantsForMesh = plantMap.get(mesh)!
    const count = plantsForMesh.length
    const bases: THREE.Matrix4[] = []
    const scales: number[] = []
    const targets: number[] = []
    const positions: THREE.Vector3[] = []
    const tangents: THREE.Vector3[] = []
    const quats: THREE.Quaternion[] = []
    const baseS: number[] = []
    const up = new THREE.Vector3(0, 1, 0)
    for (let i = 0; i < count; i++) {
      const m = new THREE.Matrix4()
      mesh.getMatrixAt(i, m)
      bases.push(m)
      scales.push(1)
      targets.push(1)

      // 提取位置、法线和朝向四元数，作为摆动动画的基线
      const p = new THREE.Vector3()
      const q = new THREE.Quaternion()
      const s = new THREE.Vector3()
      m.decompose(p, q, s)
      const normal = p.clone().normalize()
      positions.push(p)
      // 切线固定，避免每帧重新计算
      tangents.push(new THREE.Vector3().crossVectors(up, normal).normalize())
      quats.push(q)
      baseS.push((s.x + s.y + s.z) / 3)
    }
    baseMatrices.set(mesh, bases)
    currentScales.set(mesh, scales)
    targetScales.set(mesh, targets)
    basePositions.set(mesh, positions)
    baseTangents.set(mesh, tangents)
    baseQuats.set(mesh, quats)
    baseScales.set(mesh, baseS)
  })

  let filterRafId: number | null = null
  const startTime = performance.now()

  // ── 永续摇摆 RAF ──────────────────────────────────────────────
  // 完全独立于 filter 状态，始终运行，隐藏实例（scale≈0）跳过
  let swayRafId: number | null = null

  const swayTick = () => {
    const t = (performance.now() - startTime) / 1000

    meshes.forEach((mesh) => {
      const scales   = currentScales.get(mesh)!
      const positions = basePositions.get(mesh)!
      const tangents  = baseTangents.get(mesh)!
      const quats     = baseQuats.get(mesh)!
      const baseS     = baseScales.get(mesh)!

      for (let i = 0; i < scales.length; i++) {
        if (scales[i] < 0.01) continue  // 完全隐藏的实例跳过，节省 CPU

        const s0 = baseS[i]
        const sway = 0.08 * s0 * scales[i] * Math.sin(t * 1.6 + i * 0.7)

        dummy.position.copy(positions[i]).addScaledVector(tangents[i], sway)
        dummy.quaternion.copy(quats[i])
        const effective = s0 * scales[i]
        dummy.scale.set(effective, effective, effective)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    })

    swayRafId = requestAnimationFrame(swayTick)
  }
  swayRafId = requestAnimationFrame(swayTick)

  // ── 过滤动画 RAF ──────────────────────────────────────────────
  // 仅负责插值 currentScales → targetScales，不再驱动矩阵
  // allSettled 后自动退出，等待下次 animateFilter 调用时重启
  const animateFilter = (predicate: (plant: Plant) => boolean) => {
    meshes.forEach((mesh) => {
      const plantsForMesh = plantMap.get(mesh)!
      const targets = targetScales.get(mesh)!
      plantsForMesh.forEach((plant, i) => {
        targets[i] = predicate(plant) ? 1 : 0
      })
    })

    if (filterRafId !== null) return  // 已在跑，更新 targets 即可

    const filterTick = () => {
      let allSettled = true

      meshes.forEach((mesh) => {
        const scales  = currentScales.get(mesh)!
        const targets = targetScales.get(mesh)!
        for (let i = 0; i < scales.length; i++) {
          const diff = targets[i] - scales[i]
          if (Math.abs(diff) > 0.005) {
            scales[i] = Math.max(0, scales[i] + diff * SPRING_DAMPING)
            allSettled = false
          } else {
            scales[i] = targets[i]
          }
        }
      })

      if (allSettled) {
        filterRafId = null
      } else {
        filterRafId = requestAnimationFrame(filterTick)
      }
    }

    filterRafId = requestAnimationFrame(filterTick)
  }

  const cleanup = () => {
    if (filterRafId !== null) cancelAnimationFrame(filterRafId)
    if (swayRafId !== null) cancelAnimationFrame(swayRafId)
    meshes.forEach((mesh) => {
      scene.remove(mesh)
      mesh.geometry.dispose()
      const mat = mesh.material
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose())
      } else {
        mat.dispose()
      }
    })
  }

  return { cleanup, meshes, plantMap, animateFilter }
}
