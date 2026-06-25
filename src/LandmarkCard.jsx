import React, { useState, useEffect } from 'react'
import { connectionsData } from './data/connections'
import './LandmarkCard.css'

const categoryIcon = {
  '建筑奇迹': '🏛️', '军事防御': '⚔️', '失落文明': '🌫️', '帝国荣光': '👑',
  '宗教圣殿': '🙏', '远古谜团': '🔮', '沙漠玫瑰': '🏜️', '永恒之泪': '💎',
  '孤岛谜像': '🏝️', '信仰交汇': '🕊️', '众神之城': '🌞', '时间凝固': '⏳',
  '民主摇篮': '🗳️', '失落城市': '🏚️', '知识圣殿': '📜', '大地画谜': '🗺️',
  '佛塔宇宙': '☸️', '太平洋威尼斯': '🌊', '羽蛇神殿': '🐍', '帝国仪典': '🦁',
  '水利文明': '💧', '万塔之城': '🗼', '传说与真相': '🐴', '摩尔遗梦': '🌙',
  '圣地之魂': '🪨', '消逝之光': '🕯️', '古典荣光': '🏛️', '深海禁区': '🔺',
  '深渊之门': '🕳️', '沉没大陆': '🌊', '吞噬之涡': '🌀', '东方百慕大': '🐉',
  '深海异响': '🔊', '古海巨兽': '🦑', '深渊之眼': '👁️', '冰渊传说': '🧊',
  '海底遗物': '🛸', '吸血鬼传说': '🧛', '自杀森林': '🌲', '鬼魂迷宫': '👻',
  '核灾废墟': '☢️', '诅咒人偶': '🎎', '丧尸起源': '🧟', '地下鬼城': '🏚️',
  '恐怖电影': '🎬', '幽灵船': '⛵', '凶宅传说': '🏚️', '万骨之城': '💀',
  '女巫猎杀': '🧹', '蛇神崇拜': '🐍', '雪山谜案': '🏔️', '圣骨圣殿': '⛪',
  '法老诅咒': '⚱️', '都市怪谈': '🥟', '克苏鲁神话': '🐙', '圣物之谜': '✝️',
  '连环杀手': '🔪', '东方巫术': '🧙', '鬼镇炼狱': '🔥', '外星遗迹': '👽',
  '末日预言': '☄️', '史前巨兽': '🦖', '时间之谜': '⏳', '文明起源': '🌾',
  '失落神器': '🔱', '神王之城': '👑', '人类终焉': '☢️', '帝国永生': '🏺',
  '安第斯之谜': '🏔️', '佛教宇宙': '☸️', '帝国穹顶': '🕌', '众神之殿': '🏛️',
  '太平洋谜团': '🌊', '沙漠知识': '📚', '古代巨像': '🗿', '史诗战场': '⚔️',
  '灰烬之城': '🌋', '众神竞技场': '🏅', '非洲石城': '🪨', '神王永恒': '👑',
  '失落王朝': '🏚️', '万塔佛国': '🏯', '超自然领域': '👁️', '天降之灾': '☄️',
}

const connectionTypeIcon = {
  '小说': '📖', '电影': '🎬', '历史': '📜', '传说': '🔮',
  '游戏': '🎮', '真实事件': '📰', '宗教': '🕊️', '民间': '🏮',
}

export default function LandmarkCard({ landmark, x, y, visible, onClose, connectionMode, onToggleConnections }) {
  const [showConnections, setShowConnections] = useState(false)
  const [rendered, setRendered] = useState(false)
  const [exiting,  setExiting]  = useState(false)

  useEffect(() => {
    if (visible) {
      setExiting(false)
      setRendered(true)
    } else if (rendered) {
      setExiting(true)
      const t = setTimeout(() => {
        setExiting(false)
        setRendered(false)
        setShowConnections(false)
      }, 220)
      return () => clearTimeout(t)
    }
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!rendered || !landmark) return null

  const connections = connectionsData[landmark.id] || []

  return (
    <div
      className="landmark-card-overlay"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`landmark-card-body${exiting ? ' is-exiting' : ''}`}>
        <button
          className="landmark-card-close"
          onClick={(e) => { e.stopPropagation(); onClose() }}
        >✕</button>

        <div className="landmark-card-header">
          <span className="landmark-card-icon">{categoryIcon[landmark.category] || '📍'}</span>
          <div className="landmark-card-title-group">
            <span className="landmark-card-name">{landmark.name}</span>
            <span className="landmark-card-name-en">{landmark.nameEn}</span>
          </div>
        </div>

        <div className="landmark-card-meta">
          <span className="landmark-card-era">🕐 {landmark.era}</span>
          <span className="landmark-card-category-badge">{landmark.category}</span>
        </div>

        <div className="landmark-card-divider" />

        <div className="landmark-card-story">{landmark.story}</div>

        {connections.length > 0 && (
          <>
            <button
              className={`landmark-card-connection-mode-btn${connectionMode ? ' active' : ''}`}
              onClick={(e) => { e.stopPropagation(); onToggleConnections?.() }}
            >
              <span className="landmark-card-connection-mode-icon">🌐</span>
              {connectionMode ? '隐藏关联线' : '显示关联线'}
            </button>

            <button
              className="landmark-card-connections-toggle"
              onClick={(e) => { e.stopPropagation(); setShowConnections(!showConnections) }}
            >
              <span className="landmark-card-connections-toggle-icon">🔗</span>
              相关故事 · 小说 · 电影
              <span className={`landmark-card-connections-arrow${showConnections ? ' open' : ''}`}>▾</span>
            </button>

            {showConnections && (
              <div className="landmark-card-connections">
                {connections.map((conn, i) => (
                  <div key={i} className="landmark-card-connection-item">
                    <div className="landmark-card-connection-header">
                      <span className="landmark-card-connection-type">
                        {connectionTypeIcon[conn.type] || '📎'} {conn.type}
                      </span>
                      <span className="landmark-card-connection-title">{conn.title}</span>
                    </div>
                    <div className="landmark-card-connection-desc">{conn.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <div className="landmark-card-coords">
          {landmark.lat.toFixed(2)}°, {landmark.lng.toFixed(2)}°
        </div>
      </div>
      <div className="landmark-card-stem" />
    </div>
  )
}
