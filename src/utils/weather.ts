import * as THREE from 'three'
import { latLngToVector3 } from './geo'
import { GLOBE_RADIUS } from '../constants'

// ---------- Shader Source ----------

const weatherVertexShader = /* glsl */ `
  attribute vec3 aBasePos;
  attribute float aPhase;
  attribute float aSize;

  uniform float uTime;
  uniform float uSpawnHeight;
  uniform float uFallSpeed;
  uniform float uWobble;

  varying float vAlpha;

  void main() {
    float t = mod(uTime * uFallSpeed + aPhase, 1.0);

    vec3 dir = normalize(aBasePos);
    float surfaceR = length(aBasePos);
    float spawnR = surfaceR + uSpawnHeight;
    float r = mix(spawnR, surfaceR, t);

    // 基础径向位置
    vec3 pos = dir * r;

    // 雪花漂移（wobble > 0 时启用）
    float wobbleAmount = uWobble * (1.0 - t) * 0.8;
    pos.x += sin(uTime * 2.0 + aPhase * 6.283) * wobbleAmount;
    pos.z += cos(uTime * 1.5 + aPhase * 4.0) * wobbleAmount;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // 大小随距离衰减
    gl_PointSize = aSize * (200.0 / -mvPosition.z);

    // 透明度：接近地面时渐隐
    vAlpha = smoothstep(0.0, 0.1, t) * smoothstep(1.0, 0.85, t);
  }
`

const weatherFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // 圆形粒子 + 柔和边缘
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    float softEdge = 1.0 - smoothstep(0.3, 0.5, dist);
    gl_FragColor = vec4(uColor, vAlpha * softEdge);
  }
`

// ---------- Region Bounds ----------

interface RegionBounds {
  latMin: number
  latMax: number
  lngMin: number
  lngMax: number
}

const NORTH_AMERICA: RegionBounds = { latMin: 15, latMax: 65, lngMin: -140, lngMax: -55 }
const SOUTH_AMERICA: RegionBounds = { latMin: -55, latMax: 10, lngMin: -80, lngMax: -35 }

// ---------- Helpers ----------

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function generateRegionParticles(bounds: RegionBounds, count: number): Float32Array[] {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  const sizes = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const lat = randomInRange(bounds.latMin, bounds.latMax)
    const lng = randomInRange(bounds.lngMin, bounds.lngMax)
    const pos = latLngToVector3(lat, lng, GLOBE_RADIUS)

    positions[i * 3]     = pos.x
    positions[i * 3 + 1] = pos.y
    positions[i * 3 + 2] = pos.z

    phases[i] = Math.random()
    sizes[i]  = 0.8 + Math.random() * 1.5
  }

  return [positions, phases, sizes]
}

// ---------- Weather Effect ----------

export interface WeatherEffect {
  points: THREE.Points
  update: (dt: number) => void
  dispose: () => void
}

function createWeatherEffect(
  bounds: RegionBounds,
  count: number,
  color: THREE.Color,
  fallSpeed: number,
  spawnHeight: number,
  wobble: number
): WeatherEffect {
  const [positions, phases, sizes] = generateRegionParticles(bounds, count)

  const geometry = new THREE.BufferGeometry()
  // position 仅作占位（WebGL 需要），aBasePos 才是粒子的"锚点"基准位置
  // 两者共享同一 buffer 数据，避免内存翻倍
  const posAttr = new THREE.BufferAttribute(positions, 3)
  geometry.setAttribute('position', posAttr)
  geometry.setAttribute('aBasePos', posAttr) // 共享，只读；shader 不修改它
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    vertexShader: weatherVertexShader,
    fragmentShader: weatherFragmentShader,
    uniforms: {
      uTime:        { value: 0 },
      uSpawnHeight: { value: spawnHeight },
      uFallSpeed:   { value: fallSpeed },
      uWobble:      { value: wobble },
      uColor:       { value: color },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geometry, material)
  points.name = 'weather-effect'

  return {
    points,
    update: (dt: number) => { material.uniforms.uTime.value += dt },
    dispose: () => {
      geometry.dispose()
      material.dispose()
    },
  }
}

// ---------- Public API ----------

export interface WeatherSystem {
  setSnow: (visible: boolean) => void
  setRain: (visible: boolean) => void
  update: (dt: number) => void
  dispose: () => void
}

/**
 * 懒加载天气系统：粒子 geometry / shader 仅在首次开启对应效果时才创建，
 * 从不使用天气特效的用户不会分配任何 GPU 资源。
 */
export function createWeatherSystem(scene: THREE.Scene): WeatherSystem {
  let snow: WeatherEffect | null = null
  let rain: WeatherEffect | null = null

  const getSnow = (): WeatherEffect => {
    if (!snow) {
      snow = createWeatherEffect(
        NORTH_AMERICA,
        2500,
        new THREE.Color(0.9, 0.95, 1.0),
        0.12,  // fallSpeed — 较慢
        12,    // spawnHeight — 雪从较高处开始
        1.0    // wobble — 有漂移
      )
      snow.points.visible = false
      scene.add(snow.points)
    }
    return snow
  }

  const getRain = (): WeatherEffect => {
    if (!rain) {
      rain = createWeatherEffect(
        SOUTH_AMERICA,
        4000,
        new THREE.Color(0.4, 0.6, 0.85),
        0.35,  // fallSpeed — 较快
        8,     // spawnHeight — 雨从较低云层
        0.0    // wobble — 无漂移
      )
      rain.points.visible = false
      scene.add(rain.points)
    }
    return rain
  }

  return {
    setSnow: (visible: boolean) => {
      const s = visible ? getSnow() : snow
      if (!s) return
      s.points.visible = visible
      // 开启时重置时间，避免从上次停止的帧继续（视觉跳变）
      if (visible) (s.points.material as THREE.ShaderMaterial).uniforms.uTime.value = 0
    },
    setRain: (visible: boolean) => {
      const r = visible ? getRain() : rain
      if (!r) return
      r.points.visible = visible
      if (visible) (r.points.material as THREE.ShaderMaterial).uniforms.uTime.value = 0
    },
    update: (dt: number) => {
      if (snow?.points.visible) snow.update(dt)
      if (rain?.points.visible) rain.update(dt)
    },
    dispose: () => {
      snow?.dispose()
      rain?.dispose()
      if (snow) { scene.remove(snow.points); snow = null }
      if (rain) { scene.remove(rain.points); rain = null }
    },
  }
}
