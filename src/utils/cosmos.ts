import * as THREE from 'three'

/**
 * Cosmos — “太空中的地球”自然氛围层
 * ──────────────────────────────────────────────
 * 三个相互独立、可单独 dispose 的子系统：
 *   1. Starfield  程序化星空（带柔和闪烁与冷暖色温）
 *   2. Nebula     极淡的远景星云 / 银河尘带（克制、不喧宾夺主）
 *   3. Atmosphere 菲涅尔大气辉光（双层光壳，营造蔚蓝的地球边缘）
 *
 * 设计取向：自然、安静、有纵深感——不是高饱和的“赛博霓虹”。
 */

export interface Cosmos {
  update: (dt: number) => void
  dispose: () => void
}

/* ----------------------------------------------------------------
 * 1. 星空
 * --------------------------------------------------------------*/

// 生成一个柔和的圆形星点贴图（径向渐变），避免方块状硬边
function makeStarSprite(): THREE.Texture {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.2, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.35)')
  g.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

const starVert = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uScale;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vColor = aColor;
    // 柔和闪烁：低频、相位错开，绝不机械
    vTwinkle = 0.65 + 0.35 * sin(uTime * 1.3 + aPhase * 6.2831853);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / max(-mv.z, 1.0);
  }
`

const starFrag = /* glsl */ `
  uniform sampler2D uTex;
  varying vec3 vColor;
  varying float vTwinkle;
  void main() {
    vec4 t = texture2D(uTex, gl_PointCoord);
    if (t.a < 0.01) discard;
    gl_FragColor = vec4(vColor, t.a * vTwinkle);
  }
`

function createStarfield(scene: THREE.Scene, globeRadius: number, count = 5200) {
  // 星空半径和点大小比例均基于 globeRadius 自适应
  const radius = globeRadius * 22
  // uScale 经验公式：globeRadius=100 → 520，保持视觉比例不随 globe 大小改变
  const uScale = globeRadius * 5.2
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const phases = new Float32Array(count)
  const colors = new Float32Array(count * 3)

  // 星色：以白为主，掺入冷蓝与暖金，模拟真实星空的色温分布
  const cool = new THREE.Color(0xbcd4ff)
  const warm = new THREE.Color(0xffe6c2)
  const white = new THREE.Color(0xffffff)
  const c = new THREE.Color()

  for (let i = 0; i < count; i++) {
    // 在球壳上均匀取点（避免极点聚集）
    const u = Math.random()
    const v = Math.random()
    const theta = 2 * Math.PI * u
    const phi = Math.acos(2 * v - 1)
    const r = radius * (0.85 + Math.random() * 0.15) // 轻微的径向厚度
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)

    // 大小分布：多数细小，少数明亮
    const m = Math.random()
    sizes[i] = m < 0.92 ? 6 + Math.random() * 10 : 18 + Math.random() * 26
    phases[i] = Math.random()

    const tint = Math.random()
    if (tint < 0.55) c.copy(white)
    else if (tint < 0.8) c.copy(cool)
    else c.copy(warm)
    // 整体压暗一点，让最亮的少数星星脱颖而出
    const b = 0.55 + Math.random() * 0.45
    colors[i * 3] = c.r * b
    colors[i * 3 + 1] = c.g * b
    colors[i * 3 + 2] = c.b * b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))

  const tex = makeStarSprite()
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uScale: { value: uScale },
      uTex:   { value: tex },
    },
    vertexShader: starVert,
    fragmentShader: starFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  const points = new THREE.Points(geo, mat)
  points.name = 'cosmos-starfield'
  points.frustumCulled = false
  // 缓慢自转，使星空相对地球有极轻微的视差流动
  scene.add(points)

  return {
    update: (dt: number) => {
      mat.uniforms.uTime.value += dt
      points.rotation.y += dt * 0.004
    },
    dispose: () => {
      scene.remove(points)
      geo.dispose()
      mat.dispose()
      tex.dispose()
    },
  }
}

/* ----------------------------------------------------------------
 * 2. 星云 / 银河尘带（极淡）
 * --------------------------------------------------------------*/

function makeNebulaTexture(): THREE.Texture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, size, size)

  // 几团柔和的、自然的云气；冷蓝紫 + 一点暖青
  const blobs = [
    { x: 0.32, y: 0.4, r: 0.42, col: [70, 110, 180] },
    { x: 0.66, y: 0.58, r: 0.5, col: [110, 80, 150] },
    { x: 0.5, y: 0.3, r: 0.34, col: [60, 120, 130] },
    { x: 0.6, y: 0.72, r: 0.3, col: [90, 70, 130] },
  ]
  blobs.forEach((b) => {
    const g = ctx.createRadialGradient(
      b.x * size, b.y * size, 0,
      b.x * size, b.y * size, b.r * size
    )
    const [r, gg, bb] = b.col
    g.addColorStop(0, `rgba(${r},${gg},${bb},0.5)`)
    g.addColorStop(1, `rgba(${r},${gg},${bb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  })

  // 叠一层细噪点，打散过于平滑的渐变，更接近真实尘埃
  const img = ctx.getImageData(0, 0, size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 26
    img.data[i] = Math.max(0, img.data[i] + n)
    img.data[i + 1] = Math.max(0, img.data[i + 1] + n)
    img.data[i + 2] = Math.max(0, img.data[i + 2] + n)
  }
  ctx.putImageData(img, 0, 0)

  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function createNebula(scene: THREE.Scene, globeRadius: number) {
  const radius = globeRadius * 20
  // 一块面向相机后方的巨大半透明面片，极低不透明度，作为远景氛围底色
  const tex = makeNebulaTexture()
  const geo = new THREE.PlaneGeometry(radius * 3.4, radius * 3.4)
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    opacity: 0.16, // 克制：仅作为隐约的色彩氛围
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
  const plane = new THREE.Mesh(geo, mat)
  plane.name = 'cosmos-nebula'
  plane.position.set(-radius * 0.4, radius * 0.25, -radius * 1.4)
  plane.lookAt(0, 0, 0)
  plane.renderOrder = -10
  plane.frustumCulled = false
  scene.add(plane)

  return {
    update: (_dt: number) => {},
    dispose: () => {
      scene.remove(plane)
      geo.dispose()
      mat.dispose()
      tex.dispose()
    },
  }
}

/* ----------------------------------------------------------------
 * 3. 大气辉光（菲涅尔双层光壳）
 * --------------------------------------------------------------*/

const atmoVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const atmoFrag = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  void main() {
    float rim = pow(1.0 - abs(dot(vView, vNormal)), uPower);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`

function createAtmosphere(scene: THREE.Scene, globeRadius: number) {
  const shells: THREE.Mesh[] = []

  const mk = (scale: number, color: number, power: number, intensity: number, name: string) => {
    const geo = new THREE.SphereGeometry(globeRadius * scale, 32, 24)
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uPower: { value: power },
        uIntensity: { value: intensity },
      },
      vertexShader: atmoVert,
      fragmentShader: atmoFrag,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.name = name
    mesh.renderOrder = 2
    scene.add(mesh)
    shells.push(mesh)
  }

  // 仅保留极薄、低强度、偏写实的边缘大气线 —— 去掉原先的“发光蓝环”
  // 紧贴地表的天蓝细边（高 power 让它收得很窄）
  mk(1.008, 0xaecbe8, 8.5, 0.3, 'cosmos-atmo-edge')
  // 一层极淡的过渡，避免边缘过硬
  mk(1.028, 0x7ea3c8, 5.5, 0.12, 'cosmos-atmo-mid')

  return {
    update: (_dt: number) => {},
    dispose: () => {
      shells.forEach((m) => {
        scene.remove(m)
        m.geometry.dispose()
        ;(m.material as THREE.Material).dispose()
      })
    },
  }
}

/* ----------------------------------------------------------------
 * 组合
 * --------------------------------------------------------------*/

export function createCosmos(scene: THREE.Scene, globeRadius = 100): Cosmos {
  const starfield = createStarfield(scene, globeRadius)
  const nebula = createNebula(scene, globeRadius)
  const atmosphere = createAtmosphere(scene, globeRadius)

  return {
    update: (dt: number) => {
      starfield.update(dt)
      nebula.update(dt)
      atmosphere.update(dt)
    },
    dispose: () => {
      starfield.dispose()
      nebula.dispose()
      atmosphere.dispose()
    },
  }
}
