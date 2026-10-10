'use client'

import type { CSSProperties } from 'react'

type Stage = 'receive' | 'drag' | 'match' | 'found'
type PhotoKind = 'pencil' | 'plant' | 'landscape'

const photoKinds: readonly PhotoKind[] = ['pencil', 'plant', 'landscape']
// A bounded illustration of a large index, not one DOM element per indexed file.
const indexPlanes = Array.from({ length: 6 }, (_, depth) =>
  Array.from({ length: 24 }, (_, index) => photoKinds[(index + depth * 2) % photoKinds.length]),
)
const searchCandidates = [
  { format: 'JPG', name: '原图', collectedY: 50, resultY: 0, sourceX: -92, sourceY: 66 },
  { format: 'PSD', name: '工程文件', collectedY: 100, resultY: 50, sourceX: -128, sourceY: 24 },
  { format: 'AI', name: '工程文件', collectedY: 0, resultY: 100, sourceX: -65, sourceY: 104 },
] as const

function indexHit(depth: number, index: number) {
  if ((depth === 0 && index === 0) || (depth === 1 && index === 7)) return 'hash'
  if (
    (depth === 0 && index === 12) ||
    (depth === 2 && index === 8) ||
    (depth === 4 && index === 10)
  )
    return 'visual'
  return undefined
}

function Photo({ kind }: { kind: PhotoKind }) {
  return (
    <div className="depth-photo-art" data-kind={kind}>
      <i className={`depth-${kind === 'landscape' ? 'mountain' : kind}`} />
    </div>
  )
}

function ImageIndex() {
  return (
    <div className="depth-index-volume">
      <div className="depth-index-floor" />
      <div className="depth-index-camera">
        {indexPlanes.map((photos, depth) => (
          <div
            className="depth-index-plane"
            key={depth}
            style={
              { '--index-depth': depth, '--plane-opacity': 0.94 - depth * 0.13 } as CSSProperties
            }
          >
            {photos.map((kind, index) => (
              <div className="depth-index-tile" data-hit={indexHit(depth, index)} key={index}>
                <Photo kind={kind} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function SearchWorkflow() {
  return (
    <div className="depth-search-workflow">
      <div className="depth-query-features">
        <Photo kind="pencil" />
        <i className="depth-feature-arrow">→</i>
        <div className="depth-feature-signal">
          <span className="depth-fingerprint">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} />
            ))}
          </span>
          <span className="depth-visual-vector">
            {[38, 76, 50, 91, 62, 33, 82, 55].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </span>
        </div>
        <div className="depth-query-link">
          <i />
        </div>
      </div>
      <div className="depth-candidate-queue">
        {searchCandidates.map((candidate) => (
          <div
            className="depth-candidate-row"
            data-format={candidate.format.toLowerCase()}
            key={candidate.format}
            style={
              {
                '--candidate-collected-y': `${candidate.collectedY}px`,
                '--candidate-result-y': `${candidate.resultY}px`,
                '--candidate-source-x': `${candidate.sourceX}px`,
                '--candidate-source-y': `${candidate.sourceY}px`,
              } as CSSProperties
            }
          >
            <Photo kind="pencil" />
            <strong>{candidate.format}</strong>
            <span>{candidate.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DepthSearchScene({
  stage,
  isPlaying,
  snapshot,
  reduceMotion,
  playbackRun,
}: {
  stage: Stage
  isPlaying: boolean
  snapshot: boolean
  reduceMotion: boolean
  playbackRun: number
}) {
  return (
    <div
      className="depth-scene"
      data-stage={stage}
      data-snapshot={snapshot || reduceMotion}
      style={{ '--depth-play-state': isPlaying ? 'running' : 'paused' } as CSSProperties}
    >
      <div className="depth-world" key={playbackRun}>
        <div className="depth-chat-window" aria-hidden="true">
          <div className="depth-window-header">
            <i className="depth-chat-symbol">
              <b />
              <b />
            </i>
            <div>
              <strong>项目沟通</strong>
              <small>微信 / 钉钉 · 聊天示意</small>
            </div>
            <span className="depth-window-dots">···</span>
          </div>
          <div className="depth-chat-rail">
            <i>林</i>
            <b />
            <b />
          </div>
          <span className="depth-chat-sender">同事 · 小林</span>
          <div className="depth-chat-message">帮我找一下这张图的原文件。</div>
          <div className="depth-chat-photo">
            <Photo kind="pencil" />
          </div>
          <div className="depth-chat-composer">
            <span>输入消息…</span>
            <i>↗</i>
          </div>
        </div>

        <div className="depth-app-window">
          <div className="depth-app-visual" aria-hidden="true">
            <div className="depth-window-header">
              <i className="depth-app-symbol">S</i>
              <strong>
                寻藏 <span>Siftory</span>
              </strong>
              <small className="depth-library-count">10万张 · 索引示意</small>
            </div>
            <div className="depth-search-field">
              <span className="depth-search-idle">
                <i />
                搜索图片，或拖入参考图
              </span>
              <span className="depth-search-active">
                <Photo kind="pencil" />
                <span>以图搜图</span>
              </span>
              <span className="depth-search-state">
                {stage === 'match' ? (
                  <>
                    <span className="depth-search-phase" data-phase="hash">
                      图像指纹匹配
                    </span>
                    <span className="depth-search-phase" data-phase="visual">
                      视觉特征检索
                    </span>
                    <span className="depth-search-phase" data-phase="merge">
                      合并候选并排序
                    </span>
                  </>
                ) : (
                  '相似结果'
                )}
              </span>
            </div>
            <ImageIndex />
            <SearchWorkflow />
            <div className="depth-drop-target">
              <i>＋</i>
              <strong>{stage === 'drag' ? '松开，开始搜索' : '把图片拖到这里'}</strong>
            </div>
            <div className="depth-found-results">
              <div className="depth-result-original">
                <Photo kind="pencil" />
                <div>
                  <small>原图 · JPG</small>
                  <strong>pencil-hero-final.jpg</strong>
                </div>
                <span className="depth-result-check">✓</span>
              </div>
              <div className="depth-project-result">
                <span className="depth-project-icon" data-format="psd">
                  Ps
                </span>
                <strong>pencil-hero.psd</strong>
                <small>PSD 工程</small>
              </div>
              <div className="depth-project-result">
                <span className="depth-project-icon" data-format="ai">
                  Ai
                </span>
                <strong>pencil-artwork.ai</strong>
                <small>AI 工程</small>
              </div>
              <div className="depth-result-action">
                <small>相似候选，打开后核对</small>
                <span>打开原文件 ↗</span>
              </div>
            </div>
          </div>
        </div>

        <div className="depth-drag-image" aria-hidden="true">
          <Photo kind="pencil" />
          <i className="depth-drag-cursor" />
        </div>
      </div>
    </div>
  )
}
