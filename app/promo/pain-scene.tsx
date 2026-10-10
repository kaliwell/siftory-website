'use client'

import { memo, type CSSProperties } from 'react'
import { painFrame, scratchArmPose } from './promo-timeline'

type SceneStyle = CSSProperties & Record<`--${string}`, number | string>

const FOLDER_NAMES = [
  '2026项目',
  '2025归档',
  '客户A_资料',
  '客户B_旧版',
  '产品摄影',
  '包装设计',
  'LOGO源文件',
  '品牌提案',
  '新建文件夹',
  '新建文件夹 (2)',
  '临时放这里',
  '桌面备份',
  '最终版',
  '最终版_旧',
  '20260312',
  '待整理',
  '电商详情页',
  '海报_不要删',
  '杂七杂八',
  '改稿_客户意见',
  '工作素材备份',
  '旧电脑拷贝',
  '去年做的',
  '备用素材',
  '新建文件夹 (7)',
  '未分类',
  '活动物料',
  '项目归档_副本',
  '给同事的',
  '其他_有用',
  '2024_勿动',
  '下载的素材',
]
const FOLDERS = Array.from({ length: 348 }, (_, i) =>
  i === 26
    ? '文具项目_改改改'
    : i < FOLDER_NAMES.length
      ? FOLDER_NAMES[i]
      : `${FOLDER_NAMES[i % FOLDER_NAMES.length]}_${['备份', '副本', '临时', '旧', '待整理'][Math.floor(i / FOLDER_NAMES.length) % 5]}${Math.floor(i / FOLDER_NAMES.length)}`,
)
const VERSIONS = [
  '产品图_v1.psd',
  '产品图_v2.psd',
  '产品图_v2_修改.psd',
  '产品图_v3_客户意见.psd',
  '产品图_v4_再调整.psd',
  '产品图_第二轮修改.psd',
  '产品图_给同事看.jpg',
  '产品图_确认稿.psd',
  '产品图_确认稿_改.psd',
  '产品图_最终版.psd',
  '产品图_最终版_改.psd',
  '产品图_最终版_改2.psd',
  '产品图_最终版_新.psd',
  '产品图_最终版_新_副本.psd',
  '产品图_最终版_真的.psd',
  '产品图_这次真是最终版.psd',
  '产品图_这次真是最终版_再改.psd',
  '产品图_final_final_2.ai',
  '产品图_客户说再调一下.psd',
  '产品图_改回第一版.psd',
  '产品图_最后最后一版.psd',
]

const FolderCatalog = memo(function FolderCatalog() {
  return (
    <div className="pain-folder-grid">
      {FOLDERS.map((name, index) => (
        <div key={index} className={`catalog-folder ${index === 26 ? 'catalog-target' : ''}`}>
          <i className="win-folder" />
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
})

const VersionList = memo(function VersionList() {
  return (
    <div className="pain-version-list">
      {VERSIONS.map((name, index) => (
        <div key={name} className={`version-row ${index >= 13 ? 'version-confusing' : ''}`}>
          <span>
            <i className={`version-icon ${name.endsWith('.ai') ? 'version-ai' : ''}`}>
              {name.endsWith('.ai') ? 'Ai' : name.endsWith('.jpg') ? '▧' : 'Ps'}
            </i>
            <b>{name}</b>
          </span>
          <span>
            2026/9/{String(12 + Math.floor(index / 3)).padStart(2, '0')} {10 + (index % 8)}:24
          </span>
          <span>
            {name.endsWith('.ai') ? 'AI 文件' : name.endsWith('.jpg') ? 'JPG 图片' : 'PSD 文件'}
          </span>
          <span>{43 + index * 7},824 KB</span>
        </div>
      ))}
    </div>
  )
})

function limb(x1: number, y1: number, x2: number, y2: number, width: number): CSSProperties {
  // Extend each rounded end past the joint so the two sleeve pieces meet cleanly.
  return {
    left: `${x1 - width / 2}cqw`,
    top: `${y1 - width / 2}cqw`,
    width: `${width}cqw`,
    height: `${Math.hypot(x2 - x1, y2 - y1) + width}cqw`,
    transformOrigin: `50% ${width / 2}cqw`,
    transform: `rotate(${(Math.atan2(x1 - x2, y2 - y1) * 180) / Math.PI}deg)`,
  }
}

function FrustratedBack({ lift, scratch }: { lift: number; scratch: number }) {
  const { elbow, wrist, sleeveEnd, handAngle } = scratchArmPose(lift, scratch)
  return (
    <div
      className="frustrated-person"
      aria-hidden="true"
      style={{ '--scratch': scratch } as SceneStyle}
    >
      <div className="back-neck" />
      <div className="back-left-arm" />
      <div className="back-upper-arm" style={limb(11.5, 8.4, elbow.x, elbow.y, 2.45)} />
      <div className="back-torso">
        <i className="hood-fold" />
      </div>
      <div className="back-head">
        <i className="back-ear ear-left" />
        <i className="back-ear ear-right" />
        <div className="back-hair" />
      </div>
      <div className="scratch-front-arm">
        <div
          className="back-forearm"
          style={limb(elbow.x, elbow.y, sleeveEnd.x, sleeveEnd.y, 1.85)}
        />
        <div
          className="scratch-hand"
          style={{
            left: `${wrist.x}cqw`,
            top: `${wrist.y}cqw`,
            transform: `rotate(${handAngle}deg)`,
          }}
        >
          <i className="scratch-wrist" />
          <div className="scratch-palm">
            <i />
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
      <div className="back-chair">
        <i />
      </div>
      <div className="scratch-marks">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

export function PainScene({ local, reducedMotion }: { local: number; reducedMotion: boolean }) {
  const frame = painFrame(local)
  const versions = frame.phase > 0
  const folder = versions ? '文具项目_改改改' : '工作素材'
  const style = {
    '--folder-scroll': frame.folderScroll,
    '--version-scroll': frame.versionScroll,
    '--pullback': frame.pullback,
    '--folder-click': frame.folderClick,
  } as SceneStyle
  return (
    <div
      className="pain-story"
      style={style}
      data-folders-settled={frame.folderSelected}
      data-pain-phase={frame.phase}
    >
      <div className="pain-monitor">
        <div className="explorer-window pain-window">
          <div className="explorer-titlebar">
            <div className="explorer-tab">
              <i className="win-folder" />
              {folder}
              <span>×</span>
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
              <span>工作 (D:)</span>
              <em>›</em>
              <b>工作素材</b>
              {versions && (
                <>
                  <em>›</em>
                  <span>文具项目_改改改</span>
                </>
              )}
            </div>
            <div className="explorer-search">
              搜索 {folder}
              <span>⌕</span>
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
            <span>▤ {versions ? '详细信息' : '中等图标'}⌄</span>
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
              </span>
              <span>
                ↓ <b>下载</b>
              </span>
              <span>
                ▤ <b>文档</b>
              </span>
              <span className="explorer-sidebar-project">
                <i className="win-folder" />
                <b>工作素材</b>
              </span>
              <span>
                <i className="win-folder" />
                <b>临时备份</b>
              </span>
              <hr />
              <span>
                ⌄ <b>此电脑</b>
              </span>
              <span className="explorer-drive">
                ▱ <b>工作 (D:)</b>
              </span>
            </aside>
            <div className={`pain-content ${versions ? 'show-versions' : 'show-folders'}`}>
              {versions ? (
                <>
                  <div className="version-head">
                    <span>名称</span>
                    <span>修改日期</span>
                    <span>类型</span>
                    <span>大小</span>
                  </div>
                  <div className="pain-version-viewport">
                    <VersionList />
                  </div>
                </>
              ) : (
                <div className="pain-folder-viewport">
                  <FolderCatalog />
                </div>
              )}
              <div className="pain-scrollbar">
                <i />
              </div>
            </div>
          </div>
          <div className="explorer-statusbar">
            <span>{versions ? VERSIONS.length : FOLDERS.length} 个项目</span>
            <span>{versions ? '同一个设计，改了又改' : '项目 / 客户 / 年份 / 临时备份'}</span>
            <span>▤</span>
          </div>
          {!versions && frame.folderSelected && (
            <div className="pain-folder-pointer" aria-hidden="true">
              <i className="film-cursor" />
              <i className="pain-double-click" />
            </div>
          )}
        </div>
        <div className="monitor-neck" />
        <div className="monitor-foot" />
      </div>
      <div className="pain-desk" aria-hidden="true">
        <i />
        <span />
      </div>
      <div className="pain-human" style={{ opacity: frame.pullback }}>
        <FrustratedBack lift={frame.lift} scratch={reducedMotion ? 0 : frame.scratch} />
        <span className="pain-thought">
          到底……
          <br />
          哪份才是最后一版？
        </span>
      </div>
      <span className="pain-scene-note">工作目录与人物情景示意</span>
    </div>
  )
}
