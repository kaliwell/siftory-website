'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'
import { DepthSearchScene } from './depth-search-scene'
import { createStageClock } from './demo-playback'

type ThemeMode = 'system' | 'light' | 'dark'

const themeOptions: Array<{ value: ThemeMode; label: string; symbol: string }> = [
  { value: 'system', label: '自动', symbol: '◐' },
  { value: 'light', label: '浅色', symbol: '☼' },
  { value: 'dark', label: '深色', symbol: '☾' },
]

const processStages = [
  { id: 'receive', label: '收到图片', caption: '同事发来一张图片' },
  { id: 'drag', label: '拖入寻藏', caption: '拖进寻藏，开始找图' },
  { id: 'match', label: '搜索图库', caption: '图像指纹匹配 → 视觉特征检索 → 合并候选并排序' },
  { id: 'found', label: '查看原文件', caption: '找到原图与 PSD、AI 工程文件候选' },
] as const

// Illustrative durations for the standard search pipeline, not search latency.
const stageDurations = [2400, 2600, 7200, 2800] as const

const THEME_STORAGE_KEY = 'siftory-theme'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const COMPACT_VIEW_QUERY = '(max-width: 760px)'
const COARSE_POINTER_QUERY = '(pointer: coarse)'

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark'
}

function applyTheme(mode: ThemeMode) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const resolvedTheme = mode === 'system' ? (prefersDark ? 'dark' : 'light') : mode
  const root = document.documentElement

  root.dataset.theme = resolvedTheme
  root.dataset.themeMode = mode
  root.style.colorScheme = resolvedTheme
}

function getThemeSnapshot(): ThemeMode {
  const mode = document.documentElement.dataset.themeMode ?? null
  return isThemeMode(mode) ? mode : 'system'
}

function getServerThemeSnapshot(): ThemeMode {
  return 'system'
}

function subscribeTheme(onStoreChange: () => void) {
  const syncStoredTheme = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return
    const nextMode = isThemeMode(event.newValue) ? event.newValue : 'system'
    applyTheme(nextMode)
    onStoreChange()
  }
  const syncLocalTheme = () => onStoreChange()

  window.addEventListener('storage', syncStoredTheme)
  window.addEventListener('siftory-theme-change', syncLocalTheme)
  return () => {
    window.removeEventListener('storage', syncStoredTheme)
    window.removeEventListener('siftory-theme-change', syncLocalTheme)
  }
}

function subscribeMediaQuery(query: string, onStoreChange: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', onStoreChange)
  return () => media.removeEventListener('change', onStoreChange)
}

function subscribeReducedMotion(onStoreChange: () => void) {
  return subscribeMediaQuery(REDUCED_MOTION_QUERY, onStoreChange)
}

function subscribeCompactView(onStoreChange: () => void) {
  return subscribeMediaQuery(COMPACT_VIEW_QUERY, onStoreChange)
}

function subscribeCoarsePointer(onStoreChange: () => void) {
  return subscribeMediaQuery(COARSE_POINTER_QUERY, onStoreChange)
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getCompactViewSnapshot() {
  return window.matchMedia(COMPACT_VIEW_QUERY).matches
}

function getCoarsePointerSnapshot() {
  return window.matchMedia(COARSE_POINTER_QUERY).matches
}

function getFalseSnapshot() {
  return false
}

function subscribePageVisibility(onStoreChange: () => void) {
  document.addEventListener('visibilitychange', onStoreChange)
  return () => document.removeEventListener('visibilitychange', onStoreChange)
}

function getPageVisibilitySnapshot() {
  return document.visibilityState === 'visible'
}

function getServerVisibilitySnapshot() {
  return true
}

export function ThemeSwitcher() {
  const mode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const syncSystemTheme = () => {
      if (mode === 'system') applyTheme('system')
    }

    media.addEventListener('change', syncSystemTheme)
    return () => media.removeEventListener('change', syncSystemTheme)
  }, [mode])

  const selectTheme = (nextMode: ThemeMode) => {
    applyTheme(nextMode)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode)
    } catch {
      // The visual theme still changes when storage is unavailable.
    }
    window.dispatchEvent(new Event('siftory-theme-change'))
  }

  return (
    <div className="theme-switcher" role="group" aria-label="网站主题">
      {themeOptions.map((option) => (
        <button
          className="theme-option"
          type="button"
          key={option.value}
          aria-label={`${option.label}主题`}
          aria-pressed={mode === option.value}
          title={`${option.label}主题`}
          onClick={() => selectTheme(option.value)}
        >
          <span aria-hidden="true">{option.symbol}</span>
          <small>{option.label}</small>
        </button>
      ))}
    </div>
  )
}

export function ProcessDemo() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInViewport, setIsInViewport] = useState(false)
  const [hasUserControlled, setHasUserControlled] = useState(false)
  const [manualStage, setManualStage] = useState(true)
  const [playbackRun, setPlaybackRun] = useState(0)
  const [hasCompleted, setHasCompleted] = useState(false)
  const [stageClock] = useState(() => createStageClock())
  const userControlled = useRef(false)
  const hasAutoStarted = useRef(false)
  const reduceMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getFalseSnapshot,
  )
  const isCompact = useSyncExternalStore(
    subscribeCompactView,
    getCompactViewSnapshot,
    getFalseSnapshot,
  )
  const isCoarsePointer = useSyncExternalStore(
    subscribeCoarsePointer,
    getCoarsePointerSnapshot,
    getFalseSnapshot,
  )
  const isPageVisible = useSyncExternalStore(
    subscribePageVisibility,
    getPageVisibilitySnapshot,
    getServerVisibilitySnapshot,
  )
  const activeStage = processStages[activeIndex]
  const allowsPlayback = !reduceMotion && ((!isCompact && !isCoarsePointer) || hasUserControlled)
  const isActivelyPlaying = isPlaying && isInViewport && isPageVisible && allowsPlayback

  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.1
        setIsInViewport(isVisible)
        if (
          isVisible &&
          entry.intersectionRatio >= 0.6 &&
          !userControlled.current &&
          !hasAutoStarted.current &&
          !window.matchMedia(REDUCED_MOTION_QUERY).matches &&
          !window.matchMedia(COMPACT_VIEW_QUERY).matches &&
          !window.matchMedia(COARSE_POINTER_QUERY).matches
        ) {
          hasAutoStarted.current = true
          setManualStage(false)
          setIsPlaying(true)
        }
      },
      { threshold: [0, 0.1, 0.6] },
    )

    observer.observe(scene)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const motionMedia = window.matchMedia(REDUCED_MOTION_QUERY)
    const compactMedia = window.matchMedia(COMPACT_VIEW_QUERY)
    const coarsePointerMedia = window.matchMedia(COARSE_POINTER_QUERY)
    const stopDisallowedPlayback = () => {
      if (
        motionMedia.matches ||
        ((compactMedia.matches || coarsePointerMedia.matches) && !userControlled.current)
      ) {
        setIsPlaying(false)
        if (motionMedia.matches) setManualStage(true)
      }
    }

    motionMedia.addEventListener('change', stopDisallowedPlayback)
    compactMedia.addEventListener('change', stopDisallowedPlayback)
    coarsePointerMedia.addEventListener('change', stopDisallowedPlayback)
    return () => {
      motionMedia.removeEventListener('change', stopDisallowedPlayback)
      compactMedia.removeEventListener('change', stopDisallowedPlayback)
      coarsePointerMedia.removeEventListener('change', stopDisallowedPlayback)
    }
  }, [])

  useEffect(() => {
    stageClock.reset(stageDurations[activeIndex])
  }, [activeIndex, playbackRun, stageClock])

  useEffect(() => {
    if (!isActivelyPlaying) return

    stageClock.start(() => {
      if (activeIndex === processStages.length - 1) {
        setIsPlaying(false)
        setHasCompleted(true)
        return
      }
      setActiveIndex((current) => current + 1)
    })

    return () => stageClock.pause()
  }, [activeIndex, isActivelyPlaying, playbackRun, stageClock])

  const selectStage = (index: number) => {
    userControlled.current = true
    setHasUserControlled(true)
    setIsPlaying(false)
    setManualStage(true)
    setHasCompleted(false)
    setActiveIndex(index)
  }

  const togglePlayback = () => {
    userControlled.current = true
    setHasUserControlled(true)
    if (isPlaying) {
      setIsPlaying(false)
      return
    }
    if (hasCompleted || (manualStage && activeIndex === processStages.length - 1)) {
      setActiveIndex(0)
      setPlaybackRun((current) => current + 1)
    } else if (manualStage) {
      setPlaybackRun((current) => current + 1)
    }
    setHasCompleted(false)
    setManualStage(false)
    setIsPlaying(true)
  }

  const handleStageKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % processStages.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + processStages.length) % processStages.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = processStages.length - 1
    }

    if (nextIndex === null) return
    event.preventDefault()
    selectStage(nextIndex)
    window.requestAnimationFrame(() => {
      document.getElementById(`process-tab-${processStages[nextIndex!].id}`)?.focus()
    })
  }

  return (
    <section className="section process-section" id="demo" aria-labelledby="demo-title">
      <div className="section-heading process-heading">
        <h2 id="demo-title">把聊天里的图片，拖进寻藏。</h2>
      </div>
      <div className="process-demo chat-demo-shell" data-demo-step={activeStage.id}>
        <div
          className="chat-demo-stage"
          id="chat-demo-stage"
          ref={sceneRef}
          role="region"
          aria-labelledby="process-caption"
          aria-describedby="demo-note"
        >
          <DepthSearchScene
            stage={activeStage.id}
            isPlaying={isActivelyPlaying}
            snapshot={manualStage}
            reduceMotion={reduceMotion}
            playbackRun={playbackRun}
          />
        </div>
        <div className="chat-demo-controls">
          <h3
            className="chat-demo-caption"
            id="process-caption"
            aria-live="polite"
            aria-atomic="true"
          >
            {activeStage.caption}
          </h3>
          <div className="chat-demo-actions">
            <div className="chat-demo-steps" role="group" aria-label="演示步骤">
              {processStages.map((stage, index) => (
                <button
                  type="button"
                  id={`process-tab-${stage.id}`}
                  key={stage.id}
                  aria-label={`查看步骤：${stage.label}`}
                  aria-controls="chat-demo-stage"
                  aria-current={activeIndex === index ? 'step' : undefined}
                  title={stage.label}
                  onClick={() => selectStage(index)}
                  onKeyDown={(event) => handleStageKeyDown(event, index)}
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
            <button
              className="chat-demo-play"
              type="button"
              onClick={togglePlayback}
              disabled={reduceMotion}
              title={reduceMotion ? '已按系统设置减少动态效果，可选择圆点逐步查看' : undefined}
            >
              <span aria-hidden="true">{isPlaying ? 'Ⅱ' : '▶'}</span>
              {reduceMotion
                ? '静态演示'
                : isPlaying
                  ? '暂停'
                  : hasCompleted || (manualStage && activeIndex === processStages.length - 1)
                    ? '重播'
                    : manualStage
                      ? '播放演示'
                      : '继续'}
            </button>
          </div>
        </div>
      </div>
      <p className="process-demo-note" id="demo-note">
        标准模式流程示意（模型与索引已就绪），动画时长不代表搜索耗时。
      </p>
    </section>
  )
}
