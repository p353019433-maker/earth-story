import * as THREE from 'three'
import { latLngToVector3 } from './geo'
import { LandmarkLink, getLinksForLandmark } from '../data/landmarkLinks'
import { landmarksData } from '../data/landmarks'
import { GLOBE_RADIUS } from '../constants'

const SEGMENTS = 64  // 每条弧线的分段数
const DRAW_DURATION = 1.2  // 每条弧线绘制时长（秒）
const ARC_DELAY = 0.18      // 相邻弧线出现延迟（秒）

interface ArcEntry {
  line: THREE.Line
  totalCount: number  // SEGMENTS + 1
  delay: number       // 出现延迟（秒）
}

/**
 * 在地球上绘制弧线连接相关地标
 * - 弧线沿大圆路径，高度随距离增加
 * - drawRange 逐段绘制动画（不是突然出现）
 * - 绘制完后叠加脉冲透明度
 */
export class ConnectionLines {
  private scene: THREE.Scene
  private group: THREE.Group
  private arcEntries: ArcEntry[] = []
  private rafId: number | null = null
  private startTime: number = 0
  private currentLandmarkId: string | null = null

  constructor(scene: THREE.Scene) {
    this.scene = scene
    this.group = new THREE.Group()
    this.group.name = 'connection-lines-group'
  }

  /** 显示与指定地标关联的所有弧线（逐段绘制动画） */
  show(landmarkId: string) {
    this.clear()
    this.currentLandmarkId = landmarkId

    const links = getLinksForLandmark(landmarkId)
    if (links.length === 0) return

    const landmarkMap = new Map(landmarksData.map(lm => [lm.id, lm]))

    links.forEach((link, idx) => {
      const fromLm = landmarkMap.get(link.from)
      const toLm = landmarkMap.get(link.to)
      if (!fromLm || !toLm) return

      const arc = this.createArc(fromLm.lat, fromLm.lng, toLm.lat, toLm.lng, idx)
      // 初始 drawRange = 0，动画逐步展开
      arc.geometry.setDrawRange(0, 0)

      const entry: ArcEntry = {
        line: arc,
        totalCount: SEGMENTS + 1,
        delay: idx * ARC_DELAY,
      }
      this.arcEntries.push(entry)
      this.group.add(arc)
    })

    this.scene.add(this.group)
    this.startTime = performance.now()
    this.animate()
  }

  /** 清除所有弧线 */
  clear() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.currentLandmarkId = null

    this.arcEntries.forEach(({ line }) => {
      line.geometry.dispose()
      ;(line.material as THREE.LineBasicMaterial).dispose()
    })
    this.arcEntries = []

    this.scene.remove(this.group)
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0])
    }
  }

  getCurrentLandmarkId(): string | null {
    return this.currentLandmarkId
  }

  private createArc(lat1: number, lng1: number, lat2: number, lng2: number, index: number): THREE.Line {
    const start = latLngToVector3(lat1, lng1, GLOBE_RADIUS + 3)
    const end = latLngToVector3(lat2, lng2, GLOBE_RADIUS + 3)

    const distance = start.distanceTo(end)
    const arcHeight = Math.max(distance * 0.15, 5)

    const positions = new Float32Array((SEGMENTS + 1) * 3)
    const point = new THREE.Vector3()

    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS
      point.lerpVectors(start, end, t)
      const targetR = GLOBE_RADIUS + 3 + arcHeight * 4 * t * (1 - t)
      point.normalize().multiplyScalar(targetR)
      positions[i * 3]     = point.x
      positions[i * 3 + 1] = point.y
      positions[i * 3 + 2] = point.z
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xffd700),
      transparent: true,
      opacity: 0,
      linewidth: 1,
    })

    const line = new THREE.Line(geometry, material)
    line.name = `connection-arc-${index}`
    return line
  }

  private animate = () => {
    const t = (performance.now() - this.startTime) / 1000

    this.arcEntries.forEach(({ line, totalCount, delay }) => {
      const mat = line.material as THREE.LineBasicMaterial

      // drawRange 进度（smoothstep）
      const localT = Math.max(0, Math.min(1, (t - delay) / DRAW_DURATION))
      const smoothT = localT * localT * (3 - 2 * localT)
      line.geometry.setDrawRange(0, Math.ceil(smoothT * totalCount))

      // 透明度：绘制中正比于进度，绘制完后脉冲
      if (localT < 1) {
        mat.opacity = 0.8 * smoothT
      } else {
        mat.opacity = 0.3 + 0.45 * Math.sin(t * 2.2 + delay * 5)
      }
    })

    this.rafId = requestAnimationFrame(this.animate)
  }

  dispose() {
    this.clear()
  }
}
