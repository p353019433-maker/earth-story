import React, { useState, useEffect } from 'react'
import './PlantCard.css'

const typeLabel    = { '乔木': '🌳 乔木', '花卉': '🌸 花卉' }
const climateLabel = { '温带': '🌤 温带', '湿地': '💧 湿地' }

export default function PlantCard({ plant, x, y, visible, onClose }) {
  // rendered: 卡片是否挂载到 DOM
  // exiting:  是否正在播放退出动画
  const [rendered, setRendered] = useState(false)
  const [exiting,  setExiting]  = useState(false)

  useEffect(() => {
    if (visible) {
      setExiting(false)
      setRendered(true)
    } else if (rendered) {
      // 先播退出动画，220ms 后再卸载
      setExiting(true)
      const t = setTimeout(() => {
        setExiting(false)
        setRendered(false)
      }, 220)
      return () => clearTimeout(t)
    }
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered || !plant) return null

  return (
    <div
      className="plant-card-overlay"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`plant-card-body${exiting ? ' is-exiting' : ''}`}>
        <button
          className="plant-card-close"
          onClick={(e) => { e.stopPropagation(); onClose() }}
        >✕</button>

        <div className="plant-card-header">
          <span className="plant-card-name">{plant.name}</span>
          <span className="plant-card-type-badge">{typeLabel[plant.type]}</span>
        </div>

        <div className="plant-card-science">{plant.scientificName}</div>
        <div className="plant-card-divider" />

        <div className="plant-card-grid">
          <div className="plant-card-field">
            <span className="field-label">纬度</span>
            <span className="field-value">{plant.lat.toFixed(1)}°</span>
          </div>
          <div className="plant-card-field">
            <span className="field-label">经度</span>
            <span className="field-value">{plant.lng.toFixed(1)}°</span>
          </div>
          <div className="plant-card-field">
            <span className="field-label">海拔</span>
            <span className="field-value accent">{plant.altitude} m</span>
          </div>
          <div className="plant-card-field">
            <span className="field-label">气候</span>
            <span className="field-value">{climateLabel[plant.climate]}</span>
          </div>
        </div>
      </div>
      <div className="plant-card-stem" />
    </div>
  )
}
