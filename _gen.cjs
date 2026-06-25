const fs=require('fs');
const c=`import * as THREE from 'three'
import { Landmark } from '../data/landmarks'
import { latLngToVector3 } from './geo'

const GLOBE_RADIUS = 100
const dummy = new THREE.Object3D()

export interface LandmarkMeshResult {
  cleanup: () => void
  mesh: THREE.InstancedMesh
  hitbox: THREE.InstancedMesh
  landmarks: Landmark[]
}

type ShapeType = 'pyramid' | 'dome' | 'pillar' | 'crystal' | 'obelisk' | 'tower' | 'ring' | 'spike'

const categoryShape: Record<string, ShapeType> = {
  '建筑奇迹':'pyramid','军事防御':'pillar','失落文明':'crystal','帝国荣光':'dome',
  '宗教圣殿':'dome','远古谜团':'crystal','沙漠玫瑰':'spike','永恒之泪':'crystal',
  '孤岛谜像':'obelisk','信仰交汇':'dome','众神之城':'pyramid','时间凝固':'crystal',
  '民主摇篮':'pillar','失落城市':'crystal','知识圣殿':'tower','文明起源':'pyramid',
  '大地画谜':'ring','佛塔宇宙':'dome','非洲石城':'pillar','太平洋威尼斯':'tower',
  '羽蛇神殿':'pyramid','帝国仪典':'obelisk','水利文明':'pillar','安第斯之谜':'crystal',
  '万塔之城':'tower','传说与真相':'obelisk','摩尔遗梦':'dome','圣地之魂':'spike',
  '消逝之光':'crystal','古典荣光':'pillar','深海禁区':'spike','深渊之门':'spike',
  '沉没大陆':'crystal','吞噬之涡':'ring','东方百慕大':'ring','深海异响':'spike',
  '古海巨兽':'spike','深渊之眼':'ring','冰渊传说':'crystal','海底遗物':'crystal',
  '吸血鬼传说':'spike','自杀森林':'spike','鬼魂迷宫':'ring','核灾废墟':'crystal',
  '诅咒人偶':'spike','丧尸起源':'spike','地下鬼城':'pillar','恐怖电影':'spike',
  '幽灵船':'tower','凶宅传说':'spike','万骨之城':'pillar','女巫猎杀':'spike',
  '蛇神崇拜':'spike','雪山谜案':'crystal','圣骨圣殿':'dome','法老诅咒':'pyramid',
  '都市怪谈':'spike','克苏鲁神话':'spike','圣物之谜':'crystal','连环杀手':'spike',
  '东方巫术':'spike','鬼镇炼狱':'spike','外星遗迹':'crystal','末日预言':'spike',
  '史前巨兽':'spike','时间之谜':'crystal','失落神器':'crystal','神王之城':'pyramid',
  '人类终焉':'spike','帝国永生':'dome','佛教宇宙':'dome','帝国穹顶':'dome',
  '众神之殿':'dome','太平洋谜团':'crystal','沙漠知识':'tower','古代巨像':'obelisk',
  '史诗战场':'pillar','灰烬之城':'crystal','众神竞技场':'pillar',
}

const categoryColor: Record<string, number> = {
  '建筑奇迹':0xffd700,'军事防御':0xcc4444,'失落文明':0x8866cc,'帝国荣光':0xff8844,
  '宗教圣殿':0xeecc44,'远古谜团':0xaa44ff,'沙漠玫瑰':0xff6688,'永恒之泪':0x44ccff,
  '孤岛谜像':0x66cc88,'信仰交汇':0xdddd44,'众神之城':0xffaa00,'时间凝固':0x6688ff,
  '民主摇篮':0x44aaff,'失落城市':0x8866cc,'知识圣殿':0x44ddaa,'文明起源':0xff6622,
  '大地画谜':0xcc8844,'佛塔宇宙':0xffcc44,'非洲石城':0xaa8866,'太平洋威尼斯':0x44bbcc,
  '羽蛇神殿':0x44cc44,'帝国仪典':0xcc8844,'水利文明':0x4488cc,'安第斯之谜':0x88aacc,
  '万塔之城':0xccaa44,'传说与真相':0xaa8844,'摩尔遗梦':0xcc6688,'圣地之魂':0x88aa44,
  '消逝之光':0x6666aa,'古典荣光':0xddbb44,'深海禁区':0xff2244,'深渊之门':0x880044,
  '沉没大陆':0x2244aa,'吞噬之涡':0x440088,'东方百慕大':0x884400,'深海异响':0x004466,
  '古海巨兽':0x226644,'深渊之眼':0x440044,'冰渊传说':0x88ccff,'海底遗物':0x448866,
  '吸血鬼传说':0xaa0044,'自杀森林':0x224422,'鬼魂迷宫':0x888888,'核灾废墟':0x44ff44,
  '诅咒人偶':0xcc4444,'丧尸起源':0x446622,'地下鬼城':0x554433,'恐怖电影':0xcc2222,
  '幽灵船':0x446688,'凶宅传说':0x664422,'万骨之城':0xccbbaa,'女巫猎杀':0x884488,
  '蛇神崇拜':0x448844,'雪山谜案':0xaacccc,'圣骨圣殿':0xddcc88,'法老诅咒':0xccaa22,
  '都市怪谈':0x888444,'克苏鲁神话':0x224488,'圣物之谜':0xccaa66,'连环杀手':0x880000,
  '东方巫术':0xaa4488,'鬼镇炼狱':0x882200,'外星遗迹':0x44ffaa,'末日预言':0xff4400,
  '史前巨兽':0x886622,'时间之谜':0x4488ff,'失落神器':0xaacc44,'神王之城':0xffaa44,
  '人类终焉':0xff2200,'帝国永生':0xddaa44,'佛教宇宙':0xffcc44,'帝国穹顶':0xdd8844,
  '众神之殿':0xccbb44,'太平洋谜团':0x44aacc,'沙漠知识':0xccaa66,'古代巨像':0xbbaa88,
  '史诗战场':0xcc4422,'灰烬之城':0x886644,'众神竞技场':0xcc8822,
}

function getShape(shape: ShapeType): THREE.BufferGeometry {
  switch (shape) {
    case 'pyramid': return new THREE.ConeGeometry(1.2, 3, 4)
    case 'dome': return new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI*2, 0, Math.PI/2)
    case 'pillar': return new THREE.CylinderGeometry(0.6, 0.8, 3.5, 8)
    case 'crystal': return new THREE.OctahedronGeometry(1.2, 0)
    case 'obelisk': return new THREE.BoxGeometry(0.8, 4, 0.8)
    case 'tower': return new THREE.CylinderGeometry(0.3, 0.9, 4, 6)
    case 'ring': return new THREE.TorusGeometry(1.2, 0.3, 8, 24)
    case 'spike': return new THREE.ConeGeometry(0.5, 3, 6)
  }
}

function getEmissive(shape: ShapeType): number {
  if (shape === 'crystal') return 0x4400ff
  if (shape === 'spike') return 0x440000
  if (shape === 'dome') return 0x442200
  return 0x221100
}

export function createLandmarkMeshes(
  scene: THREE.Scene,
  landmarks: Landmark[]
): LandmarkMeshResult {
  // 按分类分组创建 InstancedMesh
  const shapeGroups = new Map<ShapeType, { indices: number[], color: number }>()
  landmarks.forEach((lm, i) => {
    const shape = categoryShape[lm.category] || 'crystal'
    if (!shapeGroups.has(shape)) {
      shapeGroups.set(shape, { indices: [], color: categoryColor[lm.category] || 0xffd700 })
    }
    shapeGroups.get(shape)!.indices.push(i)
  })

  const allMeshes: THREE.InstancedMesh[] = []
  const allHitboxes: THREE.InstancedMesh[] = []
  const hitboxGeo = new THREE.SphereGeometry(3.0, 8, 6)
  const hitboxMat = new THREE.MeshBasicMaterial({ visible: false })

  for (const [shape, group] of shapeGroups) {
    const geo = getShape(shape)
    const baseColor = group.color
    const mat = new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: getEmissive(shape),
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.3,
    })
    const mesh = new THREE.InstancedMesh(geo, mat, group.indices.length)
    mesh.name = 'landmark-' + shape
    const hitbox = new THREE.InstancedMesh(hitboxGeo, hitboxMat, group.indices.length)
    hitbox.name = 'landmark-hitbox-' + shape

    group.indices.forEach((lmIdx, grpIdx) => {
      const lm = landmarks[lmIdx]
      const pos = latLngToVector3(lm.lat, lm.lng, GLOBE_RADIUS + 2)
      const normal = pos.clone().normalize()

      dummy.position.copy(pos)
      dummy.scale.set(1, 1, 1)
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
      dummy.updateMatrix()
      mesh.setMatrixAt(grpIdx, dummy.matrix)

      dummy.position.copy(pos)
      dummy.scale.set(1, 1, 1)
      dummy.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
      dummy.updateMatrix()
      hitbox.setMatrixAt(grpIdx, dummy.matrix)
    })

    mesh.instanceMatrix.needsUpdate = true
    hitbox.instanceMatrix.needsUpdate = true
    scene.add(mesh)
    scene.add(hitbox)
    allMeshes.push(mesh)
    allHitboxes.push(hitbox)
  }

  // 底部光环
  const ringGeo = new THREE.RingGeometry(1.0, 1.6, 32)
  const ringMeshes: THREE.Mesh[] = []
  landmarks.forEach((lm) => {
    const color = categoryColor[lm.category] || 0xffd700
    const pos = latLngToVector3(lm.lat, lm.lng, GLOBE_RADIUS + 0.3)
    const normal = pos.clone().normalize()
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
    }))
    ring.position.copy(pos)
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal)
    ring.name = 'landmark-ring'
    scene.add(ring)
    ringMeshes.push(ring)
  })

  // 光柱（从地表射出的半透明光柱）
  const beamMeshes: THREE.Mesh[] = []
  const beamGeo = new THREE.CylinderGeometry(0.15, 0.4, 6, 6, 1, true)
  landmarks.forEach((lm) => {
    const color = categoryColor[lm.category] || 0xffd700
    const pos = latLngToVector3(lm.lat, lm.lng, GLOBE_RADIUS + 3)
    const normal = pos.clone().normalize()
    const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.15, side: THREE.DoubleSide,
    }))
    beam.position.copy(pos)
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
    beam.name = 'landmark-beam'
    scene.add(beam)
    beamMeshes.push(beam)
  })

  // 合并 hitbox 用于射线检测
  const mergedHitbox = allHitboxes[0] || new THREE.InstancedMesh(hitboxGeo, hitboxMat, 1)

  // 脉冲动画
  let rafId: number | null = null
  const startTime = performance.now()
  const animateRings = () => {
    const t = (performance.now() - startTime) / 1000
    ringMeshes.forEach((ring, i) => {
      const pulse = 0.25 + 0.2 * Math.sin(t * 2 + i * 0.5)
      ring.material.opacity = pulse
      const s = 1 + 0.2 * Math.sin(t * 2 + i * 0.5)
      ring.scale.set(s, s, 1)
    })
    beamMeshes.forEach((beam, i) => {
      beam.material.opacity = 0.08 + 0.1 * Math.sin(t * 1.5 + i * 0.7)
    })
    rafId = requestAnimationFrame(animateRings)
  }
  rafId = requestAnimationFrame(animateRings)

  const cleanup = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    allMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose() })
    allHitboxes.forEach(h => { scene.remove(h); h.geometry.dispose(); h.material.dispose() })
    ringMeshes.forEach(r => { scene.remove(r); r.geometry.dispose(); r.material.dispose() })
    beamMeshes.forEach(b => { scene.remove(b); b.geometry.dispose(); b.material.dispose() })
    hitboxGeo.dispose()
    ringGeo.dispose()
    beamGeo.dispose()
    hitboxMat.dispose()
  }

  return { cleanup, mesh: allMeshes[0] || new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial(), 1), hitbox: mergedHitbox, landmarks }
}
`;
fs.writeFileSync('src/utils/landmarkMesh.ts', c);
console.log('Written', c.length, 'bytes');
