'use client'

import { sitePath } from '../site-path'
import { memo, useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  SHOTS,
  TOTAL,
  ease,
  chatStage,
  filmFrame,
  painFrame,
  searchFrame,
  indexFrame,
  resultFrame,
} from './promo-timeline'
import { PainScene } from './pain-scene'
const stamp = (n: number) => `00:${String(Math.floor(n)).padStart(2, '0')}`
type FilmStyle = CSSProperties & Record<`--${string}`, string | number>

const PencilArt = memo(function PencilArt({ variant = 0 }: { variant?: number }) {
  return (
    <div className={`film-art art-${variant}`} aria-hidden="true">
      <i className="film-pencil" />
    </div>
  )
})

function ChatWindow({ local, compact = false }: { local: number; compact?: boolean }) {
  const stage = compact ? 4 : chatStage(local)
  return (
    <div className={`wx-window ${compact ? 'wx-compact' : ''}`}>
      <div className="wx-rail" aria-hidden="true">
        <span className="wx-avatar self-avatar">我</span>
        <span className="wx-chat-icon" />
        <span className="wx-contact-icon">▤</span>
        <span className="wx-rail-bottom">☰</span>
      </div>
      <div className="wx-main">
        <div className="wx-title">
          <span>
            小林<span className="wx-person-note">项目沟通</span>
          </span>
          <span className="wx-more">···</span>
        </div>
        <div className="wx-conversation">
          <div className="wx-time">今天 10:24</div>
          <div className="wx-message">
            <span className="wx-avatar">林</span>
            <div className="wx-bubble">帮我找一下这张图的源文件。</div>
          </div>
          <div
            className={`wx-message wx-image-message ${stage >= 2 ? 'message-shown' : 'message-hidden'}`}
          >
            <span className="wx-avatar">林</span>
            <div className="wx-image">
              <PencilArt />
            </div>
          </div>
          <div className={`wx-message ${stage >= 3 ? 'message-shown' : 'message-hidden'}`}>
            <span className="wx-avatar">林</span>
            <div className="wx-bubble">有 PSD、AI 的话也一起发我。</div>
          </div>
          <div className={`wx-message outgoing ${stage >= 4 ? 'message-shown' : 'message-hidden'}`}>
            <span className="wx-avatar self-avatar">我</span>
            <div className="wx-bubble">收到，我找找。</div>
          </div>
        </div>
        <div className="wx-compose">
          <span>☺ &nbsp; ▱ &nbsp; ···</span>
          {!compact && local >= 3.7 && local < 4.5 && (
            <span className="wx-draft">
              收到，我找找。
              <i />
            </span>
          )}
          <span className="wx-send">发送</span>
        </div>
      </div>
    </div>
  )
}

const IndexArray = memo(function IndexArray() {
  return (
    <div className="index-volume" aria-hidden="true">
      {Array.from({ length: 5 }, (_, layer) => (
        <div
          className="index-slab"
          key={layer}
          style={{ '--layer': layer, '--drawer': `var(--drawer-${layer}, 0)` } as FilmStyle}
        >
          <div className="slab-grid">
            {Array.from({ length: 24 }, (_, index) => (
              <div
                key={index}
                className={`index-tile tile-${(index + layer * 3) % 5} ${(index + layer * 3) % 5 === 1 && index % 3 === 1 ? 'tile-match' : ''}`}
              >
                <i />
              </div>
            ))}
          </div>
          <span className="slab-caption">本地索引 / {String(layer + 1).padStart(2, '0')}</span>
        </div>
      ))}
    </div>
  )
})

function SearchScene({ local }: { local: number }) {
  const frame = searchFrame(local)
  const { drag, entered, searching } = frame
  const ghostStyle = { '--drag': drag, '--ghost-opacity': frame.ghost } as FilmStyle
  return (
    <div
      className="drag-story"
      data-searching={searching}
      style={{ '--cursor-travel': frame.cursor, '--click': frame.click } as FilmStyle}
    >
      <div className="drag-chat">
        <ChatWindow local={10} compact />
      </div>
      <div className={`siftory-drop ${entered ? 'drop-ready' : ''}`}>
        <div className="drop-brand">
          <span className="promo-logo" aria-hidden="true" />
          <b>寻藏</b>
          <span>Siftory</span>
        </div>
        <div className="drop-area">
          <div className="drop-corners" />
          {entered ? (
            <div className="dropped-reference">
              <PencilArt />
            </div>
          ) : (
            <span className="drop-plus">+</span>
          )}
          <b>{searching ? '正在查询本地索引' : entered ? '参考图片已加入' : '把参考图拖到这里'}</b>
          <span>{searching ? '按画面，寻找相似文件' : '以图搜图'}</span>
        </div>
        <div className="drop-query">
          {entered ? (
            <>
              <span className="query-thumb">
                <PencilArt />
              </span>
              <span>参考图片</span>
              <strong>{searching ? '检索中' : '搜索 →'}</strong>
            </>
          ) : (
            <span className="query-placeholder">用一张图，寻找相似素材</span>
          )}
        </div>
      </div>
      <div className="drag-ghost" style={ghostStyle}>
        <PencilArt />
        <i className="film-cursor" />
      </div>
      <div
        className="search-pointer"
        aria-hidden="true"
        style={{ opacity: local >= 2.85 && local < 4.6 ? 1 : 0 }}
      >
        <i className="click-ring" />
        <i className="film-cursor" />
      </div>
      <div className="drag-label">
        参考图片 <span>→</span> 本地素材库
      </div>
    </div>
  )
}

function IndexScene({ local }: { local: number }) {
  const { phase, candidates, drawers } = indexFrame(local)
  const style = {
    '--candidates': candidates,
    ...Object.fromEntries(drawers.map((pull, i) => [`--drawer-${i}`, pull])),
  } as FilmStyle
  return (
    <div className="index-story" data-phase={phase} style={style}>
      <div className="volume-number">
        <b>
          100,000<span>张</span>
        </b>
        <small>图库规模示意 · 已建立索引</small>
      </div>
      <div className="index-query">
        <PencilArt />
        <span>参考图</span>
      </div>
      <div className="query-line">
        <i />
      </div>
      <IndexArray />
      <div className="index-beam" />
      <div className="candidate-fan">
        <div>
          <PencilArt variant={1} />
          <span>相似候选</span>
        </div>
        <div>
          <PencilArt />
          <span>相似候选</span>
        </div>
        <div>
          <PencilArt variant={2} />
          <span>相似候选</span>
        </div>
      </div>
      <div className="index-stages">
        {['指纹匹配', '视觉检索', '合并排序'].map((name, i) => (
          <span className={i === phase ? 'phase-active' : i < phase ? 'phase-done' : ''} key={name}>
            <i>{i < phase ? '✓' : String(i + 1).padStart(2, '0')}</i>
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

function ResultScene({ local, onOpenFolder }: { local: number; onOpenFolder: () => void }) {
  const frame = resultFrame(local)
  return (
    <div
      className="result-story"
      style={
        {
          '--psd': frame.psd,
          '--ai': frame.ai,
          '--preview': frame.preview,
          '--reply': frame.reply,
          '--click': frame.click,
        } as FilmStyle
      }
    >
      <div className="result-top">
        <span className="result-check">✓</span>
        <span>{local >= 3.5 ? '回到 Windows，找到所在位置。' : '寻藏 · 相似文件找到了。'}</span>
        <small>{local >= 3.5 ? '文件夹示意' : '相似候选'}</small>
      </div>
      <div className="result-files" inert={frame.preview > 0}>
        <div className="result-hero">
          <PencilArt />
          <div>
            <span className="file-kind">JPG · 图片</span>
            <b>pencil-hero.jpg</b>
            <small>项目素材 / 文具项目</small>
            <button
              type="button"
              className="result-open"
              onClick={onOpenFolder}
              title="演示打开 Windows 文件夹"
            >
              打开所在文件夹 ↗
            </button>
          </div>
        </div>
        <div className="project-result psd-result">
          <span className="adobe-icon ps-icon">Ps</span>
          <div>
            <b>pencil-design.psd</b>
            <small>工程文件候选</small>
          </div>
          <span>↗</span>
        </div>
        <div className="project-result ai-result">
          <span className="adobe-icon ai-icon">Ai</span>
          <div>
            <b>pencil-artwork.ai</b>
            <small>工程文件候选</small>
          </div>
          <span>↗</span>
        </div>
        <div
          className="result-pointer"
          aria-hidden="true"
          style={{ opacity: local >= 2.6 && local < 3.65 ? 1 : 0 }}
        >
          <i className="click-ring" />
          <i className="film-cursor" />
        </div>
      </div>
      <div className="explorer-window" aria-hidden={frame.preview === 0}>
        <div className="explorer-titlebar">
          <div className="explorer-tab">
            <i className="win-folder" />
            文具项目 <span>×</span>
          </div>
          <span className="explorer-new-tab">＋</span>
          <div className="explorer-window-buttons">
            ─ <span>□</span> ×
          </div>
        </div>
        <div className="explorer-addressbar">
          <div className="explorer-history">
            ‹ <span>›</span> ↑ ⟳
          </div>
          <div className="explorer-breadcrumb">
            <i className="win-folder" />
            <span>素材 (D:)</span>
            <em>›</em>
            <span>项目素材</span>
            <em>›</em>
            <b>文具项目</b>
          </div>
          <div className="explorer-search">
            搜索 文具项目 <span>⌕</span>
          </div>
        </div>
        <div className="explorer-toolbar">
          <span>⊕ 新建⌄</span>
          <i />
          <span>剪切</span>
          <span>复制</span>
          <span>粘贴</span>
          <i />
          <span>⇅ 排序⌄</span>
          <span>▤ 查看⌄</span>
          <span>···</span>
        </div>
        <div className="explorer-body">
          <aside className="explorer-sidebar">
            <span>
              ⌂ <b>主文件夹</b>
            </span>
            <span>
              ▧ <b>图库</b>
            </span>
            <hr />
            <span>
              ▣ <b>桌面</b>
              <small>⌁</small>
            </span>
            <span>
              ↓ <b>下载</b>
              <small>⌁</small>
            </span>
            <span>
              ▤ <b>文档</b>
              <small>⌁</small>
            </span>
            <span>
              ▧ <b>图片</b>
              <small>⌁</small>
            </span>
            <span className="explorer-sidebar-project">
              <i className="win-folder" />
              <b>文具项目</b>
            </span>
            <hr />
            <span>
              ⌄ <b>此电脑</b>
            </span>
            <span className="explorer-drive">
              ▱ <b>OS (C:)</b>
            </span>
            <span className="explorer-drive">
              ▱ <b>素材 (D:)</b>
            </span>
          </aside>
          <div className="explorer-content">
            <div className="explorer-folder-label">
              文具项目 <span>大图标</span>
            </div>
            <div className="explorer-files">
              <div className="explorer-file selected-file">
                <span className="explorer-selection">✓</span>
                <div className="explorer-image">
                  <PencilArt />
                </div>
                <b>pencil-hero.jpg</b>
              </div>
              <div className="explorer-file">
                <div className="explorer-file-icon psd-file">
                  <span className="file-format">PSD</span>
                  <b>Ps</b>
                </div>
                <b>pencil-design.psd</b>
              </div>
              <div className="explorer-file">
                <div className="explorer-file-icon ai-file">
                  <b>Ai</b>
                  <small>AI</small>
                </div>
                <b>pencil-artwork.ai</b>
              </div>
            </div>
            <div className="explorer-location">
              <i className="win-folder" />
              <span>D:\项目素材\文具项目</span>
            </div>
          </div>
        </div>
        <div className="explorer-statusbar">
          <span>3 个项目</span>
          <span>选中 1 个项目</span>
          <span>▤</span>
        </div>
      </div>
      <div className="result-reply">
        <span className="wx-avatar self-avatar">我</span>
        <span>原图和工程文件都在这儿。</span>
        <i>✓</i>
      </div>
    </div>
  )
}

export function PromoFilm() {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [captions, setCaptions] = useState(true)
  const [presenting, setPresenting] = useState(false)
  const [loop, setLoop] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [hudVisible, setHudVisible] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordMode, setRecordMode] = useState(false)
  const [recordPreparing, setRecordPreparing] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const clockRef = useRef(0)
  const frameRef = useRef(0)
  const hudTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const recordingRun = useRef(0)
  const { activeIndex, shot, local, subtitle } = filmFrame(time)
  const copy = activeIndex === 1 ? painFrame(local) : shot
  const controlsHidden = presenting && !hudVisible && (playing || recordMode)

  const seek = useCallback((next: number) => {
    recordingRun.current += 1
    setCountdown(null)
    clockRef.current = Math.max(0, Math.min(TOTAL, next))
    setTime(clockRef.current)
  }, [])
  const togglePlay = useCallback(() => {
    recordingRun.current += 1
    setCountdown(null)
    setHudVisible(true)
    if (clockRef.current >= TOTAL) seek(0)
    setPlaying((value) => !value)
  }, [seek])
  const replay = useCallback(() => {
    seek(0)
    setPlaying(true)
  }, [seek])
  const jumpTo = useCallback(
    (index: number) => {
      seek(SHOTS[Math.min(SHOTS.length - 1, Math.max(0, index))].start + 0.7)
    },
    [seek],
  )
  const togglePresentation = useCallback(async () => {
    if (presenting) {
      recordingRun.current += 1
      setRecordMode(false)
      setCountdown(null)
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
      setPresenting(false)
    } else {
      setHudVisible(true)
      setPresenting(true)
      await playerRef.current?.requestFullscreen?.().catch(() => {})
    }
  }, [presenting])

  const revealControls = useCallback(() => {
    setHudVisible(true)
    if (hudTimer.current) clearTimeout(hudTimer.current)
    if (presenting && playing) hudTimer.current = setTimeout(() => setHudVisible(false), 1800)
  }, [presenting, playing])

  const startRecordingPlayback = useCallback(async () => {
    seek(0)
    const run = ++recordingRun.current
    setRecordPreparing(true)
    setPlaying(false)
    setPresenting(true)
    setRecordMode(true)
    setHudVisible(false)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    await playerRef.current?.requestFullscreen?.().catch(() => {})
    setRecordPreparing(false)
    if (run === recordingRun.current && !document.hidden) setCountdown(3)
  }, [seek])

  useEffect(() => {
    if (countdown === null) return
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setCountdown(null)
        setPlaying(true)
        setHudVisible(false)
      } else setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (presenting && playing) hudTimer.current = setTimeout(() => setHudVisible(false), 1800)
    return () => {
      if (hudTimer.current) clearTimeout(hudTimer.current)
    }
  }, [presenting, playing])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    // Begin after the first paint so the opening frame is present before autoplay.
    const startup = requestAnimationFrame(() => {
      setReducedMotion(media.matches)
      setPlaying(!media.matches && !document.hidden)
    })
    const handleMotion = () => {
      setReducedMotion(media.matches)
      if (media.matches) setPlaying(false)
    }
    const handleVisibility = () => {
      if (document.hidden) {
        recordingRun.current += 1
        setPlaying(false)
        setCountdown(null)
        setHudVisible(true)
      }
    }
    media.addEventListener('change', handleMotion)
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      recordingRun.current += 1
      cancelAnimationFrame(startup)
      media.removeEventListener('change', handleMotion)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    if (!playing) return
    let previous = performance.now()
    let lastPaint = previous
    function frame(now: number) {
      clockRef.current = Math.min(TOTAL, clockRef.current + Math.min((now - previous) / 1000, 0.12))
      previous = now
      if (now - lastPaint >= 30 || clockRef.current >= TOTAL) {
        setTime(clockRef.current)
        lastPaint = now
      }
      if (clockRef.current >= TOTAL) {
        if (loop) {
          clockRef.current = 0
          setTime(0)
        } else {
          setPlaying(false)
          return
        }
      }
      frameRef.current = requestAnimationFrame(frame)
    }
    frameRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(frameRef.current)
  }, [playing, loop])

  useEffect(() => {
    const handleFullscreen = () => {
      if (!document.fullscreenElement) {
        recordingRun.current += 1
        setPresenting(false)
        setRecordMode(false)
        setCountdown(null)
      }
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        recordingRun.current += 1
        setPresenting(false)
        setRecordMode(false)
        setCountdown(null)
        return
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button, input, select, textarea, a, [contenteditable="true"]')
      )
        return
      if (event.code === 'Space') {
        event.preventDefault()
        togglePlay()
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        jumpTo(activeIndex + 1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        jumpTo(activeIndex - 1)
      }
      if (event.key.toLowerCase() === 'r') replay()
      if (event.key.toLowerCase() === 'f') void togglePresentation()
    }
    document.addEventListener('fullscreenchange', handleFullscreen)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreen)
      window.removeEventListener('keydown', handleKey)
    }
  }, [activeIndex, togglePlay, jumpTo, replay, togglePresentation])

  const filmStyle = {
    '--time': time,
    '--local': local,
    '--entry': reducedMotion ? 1 : 0.4 + 0.6 * ease(local / 0.7),
    '--progress': time / TOTAL,
    '--drift': reducedMotion ? 0 : Math.sin(local * 0.65),
    '--scan': ease(local / 9),
  } as FilmStyle
  return (
    <main className="promo-page">
      <header className="promo-header">
        <a href={sitePath('')} className="promo-wordmark">
          <span className="promo-logo" aria-hidden="true" />
          Siftory <span>寻藏</span>
        </a>
        <span className="promo-header-tag">
          <i />
          功能故事 · 01
        </span>
      </header>
      <div className="promo-intro">
        <div>
          <span className="promo-series">SIFTORY / MOTION STORIES</span>
          <h1>一张参考图，找回原文件。</h1>
        </div>
        <span className="promo-edition">
          动画样片 <i /> {TOTAL} 秒
        </span>
      </div>
      <div
        ref={playerRef}
        className={`promo-player ${presenting ? 'is-presenting' : ''} ${controlsHidden ? 'hud-hidden' : ''}`}
        onPointerMove={presenting ? revealControls : undefined}
        onPointerDown={presenting ? revealControls : undefined}
        onFocusCapture={presenting ? revealControls : undefined}
      >
        <section
          className={`promo-stage ${reducedMotion ? 'reduced-motion' : ''}`}
          data-shot={activeIndex}
          style={filmStyle}
          aria-label={`第 ${activeIndex + 1} 幕：${shot.label}`}
        >
          <div className="film-grain" aria-hidden="true" />
          <div className="film-brand">
            <span className="film-brand-mark">S</span>SIFTORY <span>寻藏</span>
          </div>
          <div className="film-section">
            <b>{String(activeIndex + 1).padStart(2, '0')}</b>
            <span>/ 05</span>
            <i />
            {shot.label}
          </div>
          <div className="film-copy" key={`copy-${activeIndex}`}>
            <div className="film-eyebrow">
              <i />
              {shot.eyebrow}
            </div>
            <h2>
              {copy.title}
              <br />
              <em>{copy.accent}</em>
            </h2>
            <p>{copy.description}</p>
            {activeIndex === 4 && <span className="outcome-line">少一点翻找。多一点创作。</span>}
          </div>
          <div className={`film-visual visual-${activeIndex}`} key={`visual-${activeIndex}`}>
            {activeIndex === 0 && (
              <>
                <div className="chat-underlay" />
                <ChatWindow local={local} />
                <span className="chat-note">微信风格 · 对话示意</span>
              </>
            )}
            {activeIndex === 1 && <PainScene local={local} reducedMotion={reducedMotion} />}
            {activeIndex === 2 && <SearchScene local={local} />}
            {activeIndex === 3 && <IndexScene local={local} />}
            {activeIndex === 4 && (
              <ResultScene
                local={local}
                onOpenFolder={() => {
                  seek(SHOTS[4].start + 4.3)
                  setPlaying(false)
                }}
              />
            )}
          </div>
          {captions && (
            <div className="film-subtitle">
              <span>{subtitle}</span>
            </div>
          )}
          <div className="film-progress" aria-hidden="true">
            <i />
          </div>
          <span className="film-footnote">本地素材 · 已建索引 · 流程示意</span>
        </section>
        <div className="promo-controls" inert={controlsHidden}>
          <button
            type="button"
            className="play-control"
            onClick={togglePlay}
            aria-label={playing ? '暂停动画' : '播放动画'}
          >
            <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
            {playing ? '暂停' : time >= TOTAL ? '重播' : '播放'}
          </button>
          <button type="button" className="replay-control" onClick={replay} aria-label="从头重播">
            ↺
          </button>
          <span className="promo-timer">
            {stamp(time)} <span>/ {stamp(TOTAL)}</span>
          </span>
          <input
            className="promo-scrubber"
            type="range"
            min="0"
            max={TOTAL}
            step="0.05"
            value={time}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="动画播放进度"
            aria-valuetext={`${stamp(time)}，${shot.label}`}
            style={{ '--progress': time / TOTAL } as FilmStyle}
          />
          <button
            type="button"
            className={`secondary-control caption-control ${captions ? 'is-on' : ''}`}
            onClick={() => setCaptions((value) => !value)}
            aria-pressed={captions}
          >
            字幕
          </button>
          <button
            type="button"
            className={`secondary-control loop-control ${loop ? 'is-on' : ''}`}
            onClick={() => setLoop((value) => !value)}
            aria-pressed={loop}
          >
            循环
          </button>
          <button
            type="button"
            className="presentation-control"
            onClick={() => void togglePresentation()}
          >
            <span aria-hidden="true">⛶</span>
            {presenting ? '退出全屏' : '演示模式'}
          </button>
          <button
            type="button"
            className="record-control"
            onClick={() => void startRecordingPlayback()}
            disabled={countdown !== null || recordPreparing}
            title="全屏倒计时 3 秒后从头播放；请使用自己的录屏工具"
          >
            录屏播放
          </button>
        </div>
        {presenting && (
          <button
            type="button"
            className="exit-presentation"
            tabIndex={controlsHidden ? -1 : 0}
            onClick={() => void togglePresentation()}
          >
            退出演示 · Esc
          </button>
        )}
        {countdown !== null && (
          <div className="record-countdown" role="status" aria-live="polite">
            <span>准备录屏</span>
            <b>{countdown}</b>
            <small>从头播放 · 移动鼠标显示控制 · Esc 退出</small>
          </div>
        )}
      </div>
      <nav className="promo-chapters" aria-label="动画分镜">
        {SHOTS.map((item, i) => (
          <button
            type="button"
            onClick={() => jumpTo(i)}
            key={item.label}
            className={i === activeIndex ? 'chapter-active' : ''}
            aria-current={i === activeIndex ? 'step' : undefined}
          >
            <span className="chapter-number">{String(i + 1).padStart(2, '0')}</span>
            <span>{item.label}</span>
            <small>{stamp(item.start)}</small>
          </button>
        ))}
      </nav>
      <div className="promo-bottom">
        <p>录屏播放：3 秒准备，自动收起控件。</p>
        <span>
          空格 播放 / 暂停 <i /> ← → 切换分镜 <i /> F 演示模式
        </span>
      </div>
      <p className="promo-disclaimer">
        微信风格情景与功能流程示意，非软件实录。以模型与索引就绪为前提；图库数量为规模示意，动画时长不代表实际检索耗时。PSD
        / AI 需有可读取预览，结果需打开核对。
      </p>
    </main>
  )
}
