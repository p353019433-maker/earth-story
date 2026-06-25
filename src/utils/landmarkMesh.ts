import * as THREE from 'three'
import { Landmark } from '../data/landmarks'
import { latLngToVector3 } from './geo'
import { GLOBE_RADIUS } from '../constants'
const dummy = new THREE.Object3D()

export interface LandmarkMeshResult {
  cleanup: () => void
  mesh: THREE.InstancedMesh
  hitbox: THREE.InstancedMesh
  /** 所有 hitbox mesh 及其对应的 landmark 索引映射 */
  hitboxes: { mesh: THREE.InstancedMesh; landmarkIndices: number[] }[]
  landmarks: Landmark[]
}

// 柔和自然色板（已整体去饱和处理见下方）
const categoryColor: Record<string, number> = {
  '建筑奇迹': 0xd9a86c, '军事防御': 0xb56b5b, '失落文明': 0x9a7fb5,
  '帝国荣光': 0xc59262, '宗教圣殿': 0xe5c98a, '远古谜团': 0x8a7a9c,
  '沙漠玫瑰': 0xd18b8b, '永恒之泪': 0x8eb3c4, '孤岛谜像': 0x7fae8a,
  '信仰交汇': 0xcdb777, '众神之城': 0xd49a5b, '时间凝固': 0x9aa8b8,
  '民主摇篮': 0xb5a07a, '失落城市': 0xa087b0, '知识圣殿': 0xc7b88f,
  '文明起源': 0xb88060, '大地画谜': 0xb88a64, '佛塔宇宙': 0xd8b06a,
  '非洲石城': 0xa8855e, '太平洋威尼斯': 0x7fb3a4, '羽蛇神殿': 0x8aa874,
  '帝国仪典': 0xb88a64, '水利文明': 0x7a9b9e, '安第斯之谜': 0x96a7b3,
  '万塔之城': 0xc7a16b, '传说与真相': 0xb89870, '摩尔遗梦': 0xb98a96,
  '圣地之魂': 0xa5a074, '消逝之光': 0x7e8aa6, '古典荣光': 0xc8a87a,
  '深海禁区': 0x3f6b78, '深渊之门': 0x6e4a6b, '沉没大陆': 0x4a6f8a,
  '吞噬之涡': 0x5a3d6e, '东方百慕大': 0x7d4f3e, '深海异响': 0x3d5e6a,
  '古海巨兽': 0x4a6e5a, '深渊之眼': 0x5a3a5e, '冰渊传说': 0x9eb8c8,
  '海底遗物': 0x5a7d72, '吸血鬼传说': 0x8a3e5a, '自杀森林': 0x4a5a3a,
  '鬼魂迷宫': 0x6e6e6e, '核灾废墟': 0x6b8a4a, '诅咒人偶': 0xa45a5a,
  '丧尸起源': 0x5a6a3e, '地下鬼城': 0x5e4e3a, '恐怖电影': 0x9a3a3a,
  '幽灵船': 0x4a5a6a, '凶宅传说': 0x6a5a3e, '万骨之城': 0xb5a98e,
  '女巫猎杀': 0x6e4a6a, '蛇神崇拜': 0x5a6a3e, '雪山谜案': 0xa4b0b0,
  '圣骨圣殿': 0xc8b87a, '法老诅咒': 0xc8a85a, '都市怪谈': 0x7a7050,
  '克苏鲁神话': 0x3a4a6a, '圣物之谜': 0xb89e6e, '连环杀手': 0x7a2a2a,
  '东方巫术': 0x8a4a6a, '鬼镇炼狱': 0x7a3a2a, '外星遗迹': 0x5aaa8e,
  '末日预言': 0xa84a3a, '史前巨兽': 0x7a6a4a, '时间之谜': 0x4a7aaa,
  '失落神器': 0xa0a86a, '神王之城': 0xc8944a, '人类终焉': 0x9a3a3a,
  '帝国永生': 0xc6a05a, '佛教宇宙': 0xd4b06a, '帝国穹顶': 0xb8864a,
  '众神之殿': 0xb5a55e, '太平洋谜团': 0x5a98a8, '沙漠知识': 0xb89e6e,
  '古代巨像': 0xa48e6e, '史诗战场': 0x9a4e3a, '灰烬之城': 0x7a5e3a,
  '众神竞技场': 0xb5844a, '神王永恒': 0xc89e5a, '失落王朝': 0x806a78,
  '万塔佛国': 0xc0a85e, '超自然领域': 0x7a4a9c, '天降之灾': 0x9a3e2a,
}

/**
 * 地标渲染（去 AI 感重构）：
 *  - 单层「哑光标记珠」贴附地表，由场景光照自然照亮
 *  - 不发光、不脉冲、不呼吸、无光晕、无地面光环
 *  - 颜色统一去饱和压亮，远离高饱和荧光
 */
export function createLandmarkMeshes(
  scene: THREE.Scene,
  landmarks: Landmark[]
): LandmarkMeshResult {
  const count = landmarks.length

  // 标记珠：哑光球体，自然受光
  const beadGeo = new THREE.SphereGeometry(0.78, 20, 16)
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0.0,
    emissive: 0x202020,
    emissiveIntensity: 0.55, // 仅保证夜半球仍可辨识，并非"发光"
  })
  const beadMesh = new THREE.InstancedMesh(beadGeo, beadMat, count)
  beadMesh.name = 'landmark-bead'
  beadMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3)

  // 不可见命中盒（供 raycaster 点击）
  const hitboxGeo = new THREE.SphereGeometry(2.4, 10, 8)
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false })
  const hitboxMesh = new THREE.InstancedMesh(hitboxGeo, hitboxMat, count)
  hitboxMesh.name = 'landmark-hitbox'

  const tempColor = new THREE.Color()
  const hsl = { h: 0, s: 0, l: 0 }

  landmarks.forEach((lm, i) => {
    tempColor.setHex(categoryColor[lm.category] || 0xb59a6e)
    // 去饱和 + 压低亮度：远离"赛博/AI"高饱和荧光
    tempColor.getHSL(hsl)
    tempColor.setHSL(hsl.h, hsl.s * 0.6, Math.min(0.58, hsl.l))

    const pos = latLngToVector3(lm.lat, lm.lng, GLOBE_RADIUS + 0.8)
    const normal = pos.clone().normalize()
    dummy.position.copy(pos)
    dummy.scale.set(1, 1, 1)
    dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    dummy.updateMatrix()

    beadMesh.setMatrixAt(i, dummy.matrix)
    beadMesh.instanceColor.setXYZ(i, tempColor.r, tempColor.g, tempColor.b)
    hitboxMesh.setMatrixAt(i, dummy.matrix)
  })

  beadMesh.instanceMatrix.needsUpdate = true
  beadMesh.instanceColor.needsUpdate = true
  hitboxMesh.instanceMatrix.needsUpdate = true

  scene.add(beadMesh)
  scene.add(hitboxMesh)

  const cleanup = () => {
    scene.remove(beadMesh)
    beadMesh.geometry.dispose()
    ;(beadMesh.material as THREE.Material).dispose()
    scene.remove(hitboxMesh)
    hitboxMesh.geometry.dispose()
    ;(hitboxMesh.material as THREE.Material).dispose()
  }

  return {
    cleanup,
    mesh: beadMesh,
    hitbox: hitboxMesh,
    hitboxes: [{ mesh: hitboxMesh, landmarkIndices: landmarks.map((_, i) => i) }],
    landmarks,
  }
}
