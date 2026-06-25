import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { plantsData, CLIMATE_OPTIONS } from './data/plants.ts'
import { createPlantInstancedMeshes } from './utils/plantMesh.ts'
import { raycastPlants } from './utils/raycaster.ts'
import { flyToCoord, worldToScreen } from './utils/cameraAnimation.ts'
import { latLngToVector3 } from './utils/geo.ts'
import { classifyRegion, regionCenter } from './utils/region.ts'
import { createWeatherSystem } from './utils/weather.ts'
import { createCosmos } from './utils/cosmos.ts'
import { landmarksData } from './data/landmarks.ts'
import { createLandmarkMeshes } from './utils/landmarkMesh.ts'
import { ConnectionLines } from './utils/connectionLines.ts'
import { raycastLandmarks } from './utils/landmarkRaycaster.ts'
import PlantCard from './PlantCard.jsx'
import LandmarkCard from './LandmarkCard.jsx'
import ControlPanel from './ControlPanel.jsx'
import './PlantCard.css'
import './LandmarkCard.css'
import './ControlPanel.css'

const GLOBE_RADIUS = 100

function App() {
  const globeRef = useRef(null)
  const meshResultRef = useRef(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  // 植物卡片状态
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [cardPos, setCardPos] = useState({ x: 0, y: 0 })
  const [cardVisible, setCardVisible] = useState(false)

  // 地标卡片状态
  const [selectedLandmark, setSelectedLandmark] = useState(null)
  const [lmCardPos, setLmCardPos] = useState({ x: 0, y: 0 })
  const [lmCardVisible, setLmCardVisible] = useState(false)

  const animatingRef = useRef(false)
  const landmarkMeshRef = useRef(null)
  const autoRotatePausedRef = useRef(false)
  const connectionLinesRef = useRef(null)
  const [connectionMode, setConnectionMode] = useState(false)

  // 过滤器状态
  const [filters, setFilters] = useState({
    region: '全部',
    climates: CLIMATE_OPTIONS,
    altitudeMin: 0,
    altitudeMax: 5000,
  })

  // 天气状态
  const [weather, setWeather] = useState({ snow: false, rain: false })
  const weatherSystemRef = useRef(null)
  const weatherRafRef = useRef(null)
  const cosmosRef = useRef(null)

  // 本地贴图（来自 three-globe 自带示例图），不再依赖 unpkg CDN，离线可用
  const EARTH_TEXTURE_URL = '/assets/textures/earth-blue-marble.jpg'
  const BUMP_MAP_URL = '/assets/textures/earth-topology.png'

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls()

      // 自动旋转：平稳慢速
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.35

      // 缩放限制
      controls.minDistance = 150   // 最小缩放（最近视角）
      controls.maxDistance = 600 // 最大缩放（最远视角）

      // 阻尼平滑：让用户拖拽和地球自转都不出现"机械顿挫"
      controls.enableDamping = true
      controls.dampingFactor = 0.08
      controls.rotateSpeed = 0.6
      controls.zoomSpeed = 0.8

      controls.update()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (meshResultRef.current) {
        meshResultRef.current.cleanup()
      }
      if (landmarkMeshRef.current) {
        landmarkMeshRef.current.cleanup()
      }
      if (connectionLinesRef.current) {
        connectionLinesRef.current.dispose()
      }
      if (weatherSystemRef.current) {
        weatherSystemRef.current.dispose()
      }
      if (cosmosRef.current) {
        cosmosRef.current.dispose()
      }
      if (weatherRafRef.current) {
        cancelAnimationFrame(weatherRafRef.current)
      }
    }
  }, [])

  // 实时更新植物卡片屏幕位置
  useEffect(() => {
    if (!cardVisible || !selectedPlant || !globeRef.current) return

    let rafId
    const updateCardPos = () => {
      if (!globeRef.current || !selectedPlant) return
      const camera = globeRef.current.camera()
      if (!camera) return
      const pos3d = latLngToVector3(selectedPlant.lat, selectedPlant.lng, GLOBE_RADIUS + 4)
      const screen = worldToScreen(pos3d, camera, dimensions.width, dimensions.height)
      if (!screen) return
      setCardPos({ x: screen.x, y: screen.y })
      rafId = requestAnimationFrame(updateCardPos)
    }
    rafId = requestAnimationFrame(updateCardPos)
    return () => cancelAnimationFrame(rafId)
  }, [cardVisible, selectedPlant, dimensions])

  // 实时更新地标卡片屏幕位置
  useEffect(() => {
    if (!lmCardVisible || !selectedLandmark || !globeRef.current) return

    let rafId
    const updateLmCardPos = () => {
      if (!globeRef.current || !selectedLandmark) return
      const camera = globeRef.current.camera()
      if (!camera) return
      const pos3d = latLngToVector3(selectedLandmark.lat, selectedLandmark.lng, GLOBE_RADIUS + 5)
      const screen = worldToScreen(pos3d, camera, dimensions.width, dimensions.height)
      if (!screen) return
      // 钳制卡片位置到视口内，防止被遮挡
      const cardW = 380, cardH = 420
      const cx = Math.max(cardW / 2, Math.min(dimensions.width - cardW / 2, screen.x))
      const cy = Math.max(cardH, Math.min(dimensions.height - 10, screen.y))
      setLmCardPos({ x: cx, y: cy })
      rafId = requestAnimationFrame(updateLmCardPos)
    }
    rafId = requestAnimationFrame(updateLmCardPos)
    return () => cancelAnimationFrame(rafId)
  }, [lmCardVisible, selectedLandmark, dimensions])

  // 构建过滤 predicate
  const filterPredicate = useCallback((plant) => {
    // 区域
    if (filters.region !== '全部') {
      const r = classifyRegion(plant.lat, plant.lng)
      if (r !== filters.region) return false
    }
    // 气候
    if (!filters.climates.includes(plant.climate)) return false
    // 海拔
    if (plant.altitude < filters.altitudeMin || plant.altitude > filters.altitudeMax) return false
    return true
  }, [filters])

  const handleGlobeReady = () => {
    if (!globeRef.current) return
    const scene = globeRef.current.scene()
    if (scene) {
      meshResultRef.current = createPlantInstancedMeshes(scene, plantsData)
      // 防止 globe ready 之前过滤器已变化导致的竞态：创建后立即应用当前 predicate
      meshResultRef.current.animateFilter(filterPredicate)
      landmarkMeshRef.current = createLandmarkMeshes(scene, landmarksData)
      connectionLinesRef.current = new ConnectionLines(scene)
      weatherSystemRef.current = createWeatherSystem(scene)

      // 宇宙氛围层：星空 + 极淡星云 + 菲涅尔大气辉光
      cosmosRef.current = createCosmos(scene, globeRef.current.getGlobeRadius())

      // 自然光照（“太空中的地球”）：
      // 较强的暖色定向主光形成明确的昼夜晨昏线；较低的冷色环境光让夜半球自然变暗，
      // 而植物/地标材质带自发光，会在暗面继续柔和发亮，不会被吞没。
      const existingLights = scene.children.filter((c) => c.isLight)
      existingLights.forEach((l) => scene.remove(l))

      const ambient = new THREE.AmbientLight(0x536480, 0.5)
      ambient.name = 'earth-ambient'
      scene.add(ambient)

      const sun = new THREE.DirectionalLight(0xfff1d6, 1.5)
      sun.name = 'earth-sun'
      sun.position.set(220, 130, 200)
      scene.add(sun)

      // 冷色补光：从背面极轻地勾勒夜半球轮廓，避免死黑
      const fill = new THREE.DirectionalLight(0x5c7da6, 0.3)
      fill.name = 'earth-fill'
      fill.position.set(-200, -120, -160)
      scene.add(fill)
    }

    // 陆地浮雕立体感：适当提高 bump 贴图强度，山脉陆地明显凸起
    // 注：react-globe.gl 2.31+ 移除了 ref.globeMaterial() 方法，改为从场景中按半径查找地球网格
    let globeMaterial = null
    if (scene) {
      const R = globeRef.current.getGlobeRadius()
      scene.traverse((o) => {
        if (!globeMaterial && o.isMesh && o.geometry?.parameters?.radius === R && o.material?.isMeshPhongMaterial) {
          globeMaterial = o.material
        }
      })
    }
    if (globeMaterial) {
      globeMaterial.bumpScale = 8
      // 让地表更柔和，避免过硬的赛博反光（Phong 材质由 shininess/specular 控制高光）
      globeMaterial.shininess = 6
      globeMaterial.specular = new THREE.Color(0x1c2733)
      globeMaterial.needsUpdate = true
    }
  }

  // 当过滤器变化时，触发平滑动画
  useEffect(() => {
    if (meshResultRef.current) {
      meshResultRef.current.animateFilter(filterPredicate)
    }
  }, [filterPredicate])

  // 点击洲区域 → 飞行定位并暂停旋转
  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    const camera = globeRef.current.camera()
    if (!controls || !camera) return

    if (filters.region === '全部') {
      // 恢复自动旋转
      if (autoRotatePausedRef.current) {
        controls.autoRotate = true
        autoRotatePausedRef.current = false
      }
      return
    }

    const center = regionCenter[filters.region]
    if (!center) return

    // 暂停自动旋转并飞行
    controls.autoRotate = false
    autoRotatePausedRef.current = true
    animatingRef.current = true

    flyToCoord(camera, controls, center.lat, center.lng, 2800, center.zoom).then(() => {
      animatingRef.current = false
    })
  }, [filters.region])

  // 天气开关变化时，更新粒子系统可见性
  useEffect(() => {
    if (!weatherSystemRef.current) return
    weatherSystemRef.current.setSnow(weather.snow)
    weatherSystemRef.current.setRain(weather.rain)
  }, [weather])

  // 天气粒子动画循环
  useEffect(() => {
    let lastTime = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      lastTime = now
      if (weatherSystemRef.current) {
        weatherSystemRef.current.update(dt)
      }
      if (cosmosRef.current) {
        cosmosRef.current.update(dt)
      }
      weatherRafRef.current = requestAnimationFrame(tick)
    }
    weatherRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (weatherRafRef.current) cancelAnimationFrame(weatherRafRef.current)
    }
  }, [])

  const handleClick = useCallback((event) => {
    if (animatingRef.current) return
    if (!globeRef.current) return

    const camera = globeRef.current.camera()
    const renderer = globeRef.current.renderer()
    if (!camera || !renderer) return

    // 优先检测地标
    if (landmarkMeshRef.current) {
      const lmHit = raycastLandmarks(
        event, camera,
        landmarkMeshRef.current.hitboxes,
        landmarkMeshRef.current.landmarks,
        renderer.domElement
      )
      if (lmHit) {
        const { landmark } = lmHit
        setSelectedLandmark(landmark)
        setCardVisible(false)
        setSelectedPlant(null)
        animatingRef.current = true
        setLmCardVisible(false)

        flyToCoord(camera, globeRef.current.controls(), landmark.lat, landmark.lng, 1200).then(() => {
          const pos3d = latLngToVector3(landmark.lat, landmark.lng, GLOBE_RADIUS + 5)
          const screen = worldToScreen(pos3d, camera, dimensions.width, dimensions.height)
          if (!screen) { animatingRef.current = false; return }
          setLmCardPos({ x: screen.x, y: screen.y })
          setLmCardVisible(true)
          animatingRef.current = false
        })
        return
      }
    }

    // 其次检测植物
    if (meshResultRef.current) {
      const { meshes, plantMap } = meshResultRef.current
      const hit = raycastPlants(event, camera, meshes, plantMap, renderer.domElement)

      if (hit) {
        const { plant } = hit
        setSelectedPlant(plant)
        setLmCardVisible(false)
        setSelectedLandmark(null)
        animatingRef.current = true
        setCardVisible(false)

        flyToCoord(camera, globeRef.current.controls(), plant.lat, plant.lng, 1200).then(() => {
          const pos3d = latLngToVector3(plant.lat, plant.lng, GLOBE_RADIUS + 4)
          const screen = worldToScreen(pos3d, camera, dimensions.width, dimensions.height)
          if (!screen) { animatingRef.current = false; return }
          setCardPos({ x: screen.x, y: screen.y })
          setCardVisible(true)
          animatingRef.current = false
        })
        return
      }
    }

    // 点击空白处关闭所有卡片
    setCardVisible(false)
    setSelectedPlant(null)
    setLmCardVisible(false)
    setSelectedLandmark(null)
    setConnectionMode(false)
    if (connectionLinesRef.current) connectionLinesRef.current.clear()

    // 点击空白处恢复自动旋转
    if (autoRotatePausedRef.current && filters.region === '全部') {
      const controls = globeRef.current.controls()
      controls.autoRotate = true
      autoRotatePausedRef.current = false
    }
  }, [dimensions, filters.region])

  const handleCloseCard = useCallback(() => {
    setCardVisible(false)
    setSelectedPlant(null)
  }, [])

  const handleCloseLandmarkCard = useCallback(() => {
    setLmCardVisible(false)
    setSelectedLandmark(null)
    setConnectionMode(false)
    if (connectionLinesRef.current) connectionLinesRef.current.clear()
  }, [])

  const handleToggleConnections = useCallback(() => {
    if (!selectedLandmark || !connectionLinesRef.current) return
    if (connectionMode) {
      setConnectionMode(false)
      connectionLinesRef.current.clear()
    } else {
      setConnectionMode(true)
      connectionLinesRef.current.show(selectedLandmark.id)
    }
  }, [selectedLandmark, connectionMode])

  return (
    <div
      style={{ width: '100vw', height: '100vh', background: '#000011' }}
      onClick={handleClick}
    >
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={EARTH_TEXTURE_URL}
        bumpImageUrl={BUMP_MAP_URL}
        backgroundColor="#05070e"
        showAtmosphere={false}
        polygonCapColor={() => 'rgba(0,0,0,0)'}
        polygonSideColor={() => 'rgba(0,0,0,0)'}
        polygonStrokeColor={() => 'rgba(0,0,0,0)'}
        polygonsData={[]}
        arcsData={[]}
        labelsData={[]}
        onGlobeReady={handleGlobeReady}
      />
      <PlantCard
        plant={selectedPlant}
        x={cardPos.x}
        y={cardPos.y}
        visible={cardVisible}
        onClose={handleCloseCard}
      />
      <LandmarkCard
        landmark={selectedLandmark}
        x={lmCardPos.x}
        y={lmCardPos.y}
        visible={lmCardVisible}
        onClose={handleCloseLandmarkCard}
        connectionMode={connectionMode}
        onToggleConnections={handleToggleConnections}
      />
      <ControlPanel filters={filters} onFiltersChange={setFilters} weather={weather} onWeatherChange={setWeather} />
    </div>
  )
}

export default App
