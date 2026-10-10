'use client'

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

type ModelKind =
  | 'folder'
  | 'scan'
  | 'features'
  | 'index'
  | 'query'
  | 'fingerprint'
  | 'vector'
  | 'results'
  | 'health'
  | 'update'
  | 'repair'
  | 'clean'
type LifecycleStep = {
  title: string
  short: string
  model: ModelKind
  input: string
  action: string
  output: string
  implementation: string
  stack: readonly string[]
}
type LifecycleChapter = {
  id: 'build' | 'search' | 'maintain'
  title: string
  caption: string
  introduction: string
  steps: readonly LifecycleStep[]
}

const chapters: readonly LifecycleChapter[] = [
  {
    id: 'build',
    title: '建立索引',
    caption: '首次准备',
    introduction: '选好素材目录，建立可复用的本机索引。扫描与特征提取可以重叠推进。',
    steps: [
      {
        title: '选择素材目录',
        short: '由你开始准备',
        model: 'folder',
        input: '本地目录，或已挂载、可访问的素材目录。',
        action: '选定范围并开始准备；缺少的模型资源会在这时下载。',
        output: '明确的扫描范围，以及可查看状态的准备任务。',
        implementation:
          '模型资源不随软件打包。用户开始准备后，软件按需下载 DINOv2 与 CLIP；目录与模型的准备状态可分别查看。',
        stack: ['Electron', '目录任务', '外置模型资源'],
      },
      {
        title: '扫描与识别文件',
        short: '记录路径与指纹',
        model: 'scan',
        input: '所选目录中的图片与受支持的工程文件。',
        action: '增量扫描路径、大小和修改时间，计算图片指纹；工程文件读取可用预览。',
        output: '文件元数据与可供匹配的图像指纹。',
        implementation:
          'C++ Native 执行增量扫描。PSD 需要可用的内嵌预览，AI 需要 PDF 兼容预览；不要求先生成全部缩略图再继续。预览能力取决于具体文件。',
        stack: ['C++ Native', 'DiffHash64', 'PSD / AI 兼容预览'],
      },
      {
        title: '提取图像特征',
        short: '在本机计算',
        model: 'features',
        input: '可读取的图片或工程文件预览，以及已就绪的模型。',
        action: 'DINOv2 提取图像视觉特征，CLIP 提取供文字检索使用的图像语义特征。',
        output: '供相似图片与文字检索使用的特征向量。',
        implementation:
          'Transformers.js 与 ONNX Runtime 在本机子进程中完成推理。扫描和特征提取可以重叠推进；CLIP 服务于语义检索，并非默认参考图搜索的模型。',
        stack: ['DINOv2', 'CLIP', 'Transformers.js', 'ONNX Runtime'],
      },
      {
        title: '保存可搜索索引',
        short: '下次直接复用',
        model: 'index',
        input: '图像指纹、特征向量和原文件元数据。',
        action: '将不同类型的数据分别持久化，保留结果到原文件路径的映射。',
        output: '保存在本机、可以持续增量更新的索引。',
        implementation:
          '指纹使用 Native 二进制分段与 manifest；向量使用 JSONL 分片及 Float16 数据；源文件元数据使用 SQLite。向量并非全部存入 SQLite。',
        stack: ['Native segments', 'JSONL / Float16', 'SQLite 元数据'],
      },
    ],
  },
  {
    id: 'search',
    title: '以图搜图',
    caption: '日常查找',
    introduction: '以模型和索引已就绪的标准模式为例：查询已有索引，不逐个打开图库原文件。',
    steps: [
      {
        title: '拖入参考图片',
        short: '读取这张查询图',
        model: 'query',
        input: '甲方或同事发来的参考图片。',
        action: '在本机读取查询图，计算它的图像指纹。',
        output: '用于检索已有图片指纹的查询特征。',
        implementation:
          '这里只处理用户提供的查询图片。标准模式优先进行指纹匹配，再在模型可用时补充 DINOv2 视觉特征检索。',
        stack: ['本机查询', '图像指纹', '标准模式'],
      },
      {
        title: '匹配已有指纹',
        short: '无需重读十万原图',
        model: 'fingerprint',
        input: '查询指纹与索引中缓存的 DiffHash64。',
        action: '比较汉明距离，筛选视觉结构接近的候选。',
        output: '第一批相似图片候选。',
        implementation:
          '比较的是已经保存的指纹记录，不会为每次查询重新读取十万张原图。DINOv2 未就绪时，可退回指纹检索；结果能力与完整模式有所不同。',
        stack: ['DiffHash64', 'Hamming distance', '缓存索引'],
      },
      {
        title: '检索视觉特征',
        short: '补充相似候选',
        model: 'vector',
        input: '查询图、已就绪的 DINOv2 与已保存的向量。',
        action: '计算查询向量，在已有向量索引中寻找视觉相似项。',
        output: '补充到候选集合的视觉匹配结果。',
        implementation:
          '较大的 Float16 索引可先进行近似近邻召回，再精确计算候选分数，并保留回退路径。标准参考图搜索使用 DINOv2；CLIP 用于文字等语义搜索。',
        stack: ['DINOv2', 'Float16', 'ANN / 精确评分'],
      },
      {
        title: '排序并定位原件',
        short: '打开后核对',
        model: 'results',
        input: '指纹与视觉检索返回的候选。',
        action: '合并去重、综合评分并排序，将结果映射回原文件路径。',
        output: '图片，以及有兼容预览的 PSD、AI 等工程文件候选。',
        implementation:
          '结果是相似候选；相似性不证明图片与工程文件的创作关系。工程预览命中后映射回项目文件路径，可打开原文件或所在文件夹再核对。',
        stack: ['合并去重', '综合评分', '原文件路径'],
      },
    ],
  },
  {
    id: 'maintain',
    title: '维护管理',
    caption: '按需进行',
    introduction: '先查看状态，再按需选择更新、修复或清理；这些不是每次搜索后的必做步骤。',
    steps: [
      {
        title: '查看运行状态',
        short: '维护的状态入口',
        model: 'health',
        input: '素材目录、处理任务和本机索引存储。',
        action: '查看目录可访问性、任务进度与失败项，以及存储健康状态。',
        output: '有依据地选择需要执行的维护操作。',
        implementation:
          '状态检查与后面的维护操作不是强制串行流程。目录暂时不可访问时保留记录，不把断开的磁盘或挂载源直接当成素材删除。',
        stack: ['来源状态', '任务状态', '存储状态'],
      },
      {
        title: '增量更新',
        short: '处理新增与变化',
        model: 'update',
        input: '目录中新加入或已修改的文件。',
        action: '更新新增或变化项，并补齐缺失特征；复用未变化且已有特征的内容。',
        output: '跟随素材变化更新的索引。',
        implementation:
          '利用已记录的文件信息识别变化。更新新增或变化项，并补齐缺失特征；未变化且已有特征的内容直接复用。',
        stack: ['C++ Native', '增量扫描', '特征复用'],
      },
      {
        title: '重试与修复',
        short: '针对失败或异常',
        model: 'repair',
        input: '失败任务，或需要重建的相关索引与缓存。',
        action: '重试失败项，按所选范围重建派生数据。',
        output: '恢复可用的任务结果、索引或缓存。',
        implementation:
          '修复针对相关索引和缓存，不等同于修改原始素材。具体重试与重建范围由相应维护操作决定。',
        stack: ['任务重试', '索引重建', '缓存修复'],
      },
      {
        title: '预览后清理',
        short: '确认范围再执行',
        model: 'clean',
        input: '派生数据，以及已确认缺失的文件记录。',
        action: '先预览同步或清理范围，再确认移除相应数据。',
        output: '整理过的索引存储，原始素材仍然保留。',
        implementation:
          '清理派生数据与确认缺失的记录；暂时不可访问的来源继续保留。清理索引不会顺带删除原始图片或工程文件。',
        stack: ['预览与确认', '派生数据', '原件保留'],
      },
    ],
  },
]

function Solid({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`lifecycle-solid ${className}`}>
      <i className="lifecycle-solid-top" />
      <i className="lifecycle-solid-side" />
      <div className="lifecycle-solid-front">{children}</div>
    </div>
  )
}

function Files({ marked = false }: { marked?: boolean }) {
  return (
    <div className="lifecycle-files">
      {[0, 1, 2].map((number) => (
        <span key={number}>
          <i />
          <i />
          <i />
          {marked && number === 2 && <b>＋</b>}
        </span>
      ))}
    </div>
  )
}

function StageModel({ kind }: { kind: ModelKind }) {
  return (
    <div className="lifecycle-model-space" aria-hidden="true">
      <div className="lifecycle-model" data-model={kind}>
        {kind === 'folder' && (
          <>
            <span className="lifecycle-folder-back" />
            <Files />
            <span className="lifecycle-folder-front" />
          </>
        )}
        {(kind === 'scan' || kind === 'update') && (
          <>
            <Files marked={kind === 'update'} />
            <Solid className="lifecycle-small-chip">{kind === 'scan' ? 'C++' : '＋'}</Solid>
          </>
        )}
        {kind === 'features' && (
          <>
            <div className="lifecycle-feature-layers">
              {[0, 1, 2].map((layer) => (
                <span key={layer}>
                  {Array.from({ length: 9 }, (_, cell) => (
                    <i key={cell} />
                  ))}
                </span>
              ))}
            </div>
            <Solid className="lifecycle-small-chip">AI</Solid>
          </>
        )}
        {kind === 'index' && (
          <div className="lifecycle-index-rack">
            {[0, 1, 2].map((layer) => (
              <span key={layer}>
                {Array.from({ length: 12 }, (_, cell) => (
                  <i key={cell} />
                ))}
              </span>
            ))}
          </div>
        )}
        {kind === 'query' && (
          <>
            <span className="lifecycle-picture">
              <i />
            </span>
            <Solid className="lifecycle-query-slot">↓</Solid>
          </>
        )}
        {kind === 'fingerprint' && (
          <Solid className="lifecycle-fingerprint-chip">
            <span>
              {Array.from({ length: 12 }, (_, cell) => (
                <i key={cell} />
              ))}
            </span>
          </Solid>
        )}
        {kind === 'vector' && (
          <>
            <div className="lifecycle-vector-layers">
              {[0, 1, 2].map((layer) => (
                <span key={layer}>
                  {[0, 1, 2, 3, 4, 5].map((cell) => (
                    <i key={cell} />
                  ))}
                </span>
              ))}
            </div>
            <Solid className="lifecycle-small-chip">DINO</Solid>
          </>
        )}
        {kind === 'results' && (
          <div className="lifecycle-result-cards">
            {['JPG', 'PSD', 'AI'].map((format) => (
              <span key={format}>
                <i />
                <b>{format}</b>
              </span>
            ))}
          </div>
        )}
        {kind === 'health' && (
          <Solid className="lifecycle-health-box">
            <span>
              <i />
              <b />
            </span>
            <span>
              <i />
              <b />
            </span>
            <span>
              <i />
              <b />
            </span>
          </Solid>
        )}
        {kind === 'repair' && (
          <>
            <Files />
            <Solid className="lifecycle-small-chip lifecycle-repair-chip">↻</Solid>
          </>
        )}
        {kind === 'clean' && (
          <>
            <span className="lifecycle-retained-file">
              <i />
              <i />
              <b>✓</b>
            </span>
            <Solid className="lifecycle-clean-tray">
              <span />
              <span />
              <span />
            </Solid>
          </>
        )}
      </div>
    </div>
  )
}

export function IndexLifecycle() {
  const [chapterIndex, setChapterIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const chapter = chapters[chapterIndex]
  const step = chapter.steps[stepIndex]
  const branching = chapter.id === 'maintain'
  const StageList = branching ? 'ul' : 'ol'

  function selectChapter(index: number) {
    setChapterIndex(index)
    setStepIndex(0)
  }

  function handleTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % chapters.length
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + chapters.length) % chapters.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = chapters.length - 1
    else return
    event.preventDefault()
    selectChapter(nextIndex)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section className="section lifecycle-section" id="workflow" aria-labelledby="workflow-title">
      <div className="section-heading lifecycle-heading">
        <span className="section-kicker">素材在本机，流程看得见</span>
        <h2 id="workflow-title">从建立索引，到找到原文件，再到持续维护</h2>
        <p>先建库 → 日常搜图 → 按需维护。选择一个环节，查看处理过程与所用技术。</p>
      </div>
      <div className="lifecycle-board">
        <div className="lifecycle-tabs" role="tablist" aria-label="素材索引与搜索流程">
          {chapters.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`lifecycle-tab-${item.id}`}
              aria-controls="lifecycle-panel"
              aria-selected={chapterIndex === index}
              tabIndex={chapterIndex === index ? 0 : -1}
              key={item.id}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              onClick={() => selectChapter(index)}
              onKeyDown={(event) => handleTabKey(event, index)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.title}</strong>
              <small>{item.caption}</small>
            </button>
          ))}
        </div>
        <div
          className="lifecycle-panel"
          id="lifecycle-panel"
          role="tabpanel"
          aria-labelledby={`lifecycle-tab-${chapter.id}`}
        >
          <p className="lifecycle-introduction">{chapter.introduction}</p>
          <div className="lifecycle-stage-map" data-mode={branching ? 'branch' : 'sequence'}>
            <StageList
              className="lifecycle-stages"
              aria-label={branching ? '状态入口与可选维护操作' : `${chapter.title}的四个环节`}
            >
              {chapter.steps.map((item, index) => (
                <li key={item.title}>
                  <button
                    type="button"
                    className="lifecycle-stage"
                    aria-pressed={stepIndex === index}
                    aria-controls="lifecycle-detail"
                    onClick={() => setStepIndex(index)}
                  >
                    <span className="lifecycle-stage-index">
                      {branching ? (index === 0 ? '状态入口' : '按需操作') : `0${index + 1}`}
                    </span>
                    <StageModel kind={item.model} />
                    <strong>{item.title}</strong>
                    <small>{item.short}</small>
                  </button>
                </li>
              ))}
            </StageList>
          </div>
          <div
            className="lifecycle-detail"
            id="lifecycle-detail"
            role="region"
            aria-labelledby="lifecycle-detail-title"
            aria-live="polite"
            aria-atomic="true"
          >
            <div className="lifecycle-detail-heading">
              <span>
                {branching ? '按需维护' : `${String(stepIndex + 1).padStart(2, '0')} / 04`}
              </span>
              <h3 id="lifecycle-detail-title">{step.title}</h3>
            </div>
            <dl>
              <div>
                <dt>输入</dt>
                <dd>{step.input}</dd>
              </div>
              <div>
                <dt>处理</dt>
                <dd>{step.action}</dd>
              </div>
              <div>
                <dt>得到</dt>
                <dd>{step.output}</dd>
              </div>
            </dl>
            <details className="lifecycle-implementation" key={`${chapter.id}-${stepIndex}`}>
              <summary>查看实现与技术</summary>
              <p>{step.implementation}</p>
              <ul aria-label="使用的技术">
                {step.stack.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </details>
          </div>
        </div>
        <div className="lifecycle-tech-band" aria-label="本机技术组成">
          <span>
            <b>界面</b>React · TypeScript · Electron
          </span>
          <span>
            <b>处理</b>C++ Native · Transformers.js · ONNX Runtime
          </span>
          <span>
            <b>存储</b>Native 分段 · Float16 · SQLite 元数据
          </span>
        </div>
      </div>
      <p className="lifecycle-boundary">
        <span aria-hidden="true">✓</span> 索引保存在本机；清理派生数据保留原始素材。
      </p>
    </section>
  )
}
