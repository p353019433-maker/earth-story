import React, { useMemo, useState } from 'react'
import { plantsData, CLIMATE_OPTIONS } from './data/plants.ts'
import { classifyRegion, regions } from './utils/region.ts'
import './ControlPanel.css'

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="7" x2="20" y2="7" />
      <circle cx="9" cy="7" r="2.4" fill="currentColor" stroke="none" />
      <line x1="4" y1="17" x2="20" y2="17" />
      <circle cx="15" cy="17" r="2.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function ControlPanel({ filters, onFiltersChange, weather, onWeatherChange }) {
  const [open, setOpen] = useState(false)

  const regionCounts = useMemo(() => {
    const counts = {}
    plantsData.forEach((p) => {
      const r = classifyRegion(p.lat, p.lng)
      counts[r] = (counts[r] || 0) + 1
    })
    return counts
  }, [])

  // 当前生效的筛选条件数量 —— 用于在收起按钮上显示小角标
  const activeCount = useMemo(() => {
    let n = 0
    if (filters.region !== '全部') n++
    if (filters.climates.length !== CLIMATE_OPTIONS.length) n++
    if (filters.altitudeMin > 0 || filters.altitudeMax < 5000) n++
    if (weather.snow || weather.rain) n++
    return n
  }, [filters, weather])

  const handleRegionChange = (region) => onFiltersChange({ ...filters, region })

  const handleClimateToggle = (climate) => {
    const next = filters.climates.includes(climate)
      ? filters.climates.filter((c) => c !== climate)
      : [...filters.climates, climate]
    onFiltersChange({ ...filters, climates: next })
  }

  const handleAltMin = (e) => {
    const val = Math.min(Number(e.target.value), filters.altitudeMax - 100)
    onFiltersChange({ ...filters, altitudeMin: Math.max(0, val) })
  }

  const handleAltMax = (e) => {
    const val = Math.max(Number(e.target.value), filters.altitudeMin + 100)
    onFiltersChange({ ...filters, altitudeMax: Math.min(5000, val) })
  }

  return (
    <div className="cp-root" onClick={(e) => e.stopPropagation()}>
      {/* 收起态：浮动按钮 */}
      <button
        className={`cp-fab${open ? ' is-hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="打开探索面板"
      >
        <SlidersIcon />
        <span className="cp-fab-text">探索地球</span>
        {activeCount > 0 && <span className="cp-fab-badge">{activeCount}</span>}
      </button>

      {/* 展开态：浮层面板 */}
      <div className={`cp-panel${open ? ' is-open' : ''}`} role="dialog" aria-label="探索筛选">
        <div className="cp-head">
          <span className="cp-title">探索地球</span>
          <button className="cp-close" onClick={() => setOpen(false)} aria-label="收起面板">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
          </button>
        </div>

        <div className="cp-body">
          {/* 区域 */}
          <section className="cp-group">
            <div className="cp-group-label"><span>区域</span></div>
            <div className="cp-pills">
              {regions.map((r) => (
                <button
                  key={r}
                  className={`cp-pill${filters.region === r ? ' active' : ''}`}
                  onClick={() => handleRegionChange(r)}
                >
                  {r}
                  {r !== '全部' && regionCounts[r] ? (
                    <span className="cp-pill-count">{regionCounts[r]}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </section>

          {/* 气候 */}
          <section className="cp-group">
            <div className="cp-group-label"><span>气候</span></div>
            <div className="cp-pills">
              {CLIMATE_OPTIONS.map((c) => (
                <button
                  key={c}
                  className={`cp-pill${filters.climates.includes(c) ? ' active' : ''}`}
                  onClick={() => handleClimateToggle(c)}
                >
                  {c === '温带' ? '🌤' : '💧'} {c}
                </button>
              ))}
            </div>
          </section>

          {/* 海拔 */}
          <section className="cp-group">
            <div className="cp-group-label">
              <span>海拔</span>
              <span className="cp-range-readout">
                {filters.altitudeMin} – {filters.altitudeMax} m
              </span>
            </div>
            <div className="cp-dual-slider">
              <div className="cp-slider-track">
                <div
                  className="cp-slider-fill"
                  style={{
                    left: `${(filters.altitudeMin / 5000) * 100}%`,
                    right: `${100 - (filters.altitudeMax / 5000) * 100}%`,
                  }}
                />
              </div>
              <input
                type="range"
                className={`cp-range${filters.altitudeMin >= filters.altitudeMax - 100 ? ' at-limit' : ''}`}
                min={0} max={5000} step={50}
                value={filters.altitudeMin} onChange={handleAltMin} aria-label="最低海拔"
              />
              <input
                type="range"
                className={`cp-range${filters.altitudeMax <= filters.altitudeMin + 100 ? ' at-limit' : ''}`}
                min={0} max={5000} step={50}
                value={filters.altitudeMax} onChange={handleAltMax} aria-label="最高海拔"
              />
            </div>
          </section>

          {/* 天气特效 */}
          <section className="cp-group">
            <div className="cp-group-label"><span>天气特效</span></div>
            <div className="cp-weather">
              <button
                className={`cp-weather-toggle${weather.snow ? ' on' : ''}`}
                onClick={() => onWeatherChange({ ...weather, snow: !weather.snow })}
              >
                <span className="cp-weather-emoji">❄️</span>
                <span className="cp-weather-name">北美降雪</span>
                <span className="cp-switch"><span className="cp-switch-thumb" /></span>
              </button>
              <button
                className={`cp-weather-toggle${weather.rain ? ' on' : ''}`}
                onClick={() => onWeatherChange({ ...weather, rain: !weather.rain })}
              >
                <span className="cp-weather-emoji">🌧️</span>
                <span className="cp-weather-name">南美降雨</span>
                <span className="cp-switch"><span className="cp-switch-thumb" /></span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
