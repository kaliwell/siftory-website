import { sitePath } from './site-path'
import { ProcessDemo, ThemeSwitcher } from './site-interactions'
import { IndexLifecycle } from './index-lifecycle'

const completedFeatures = [
  {
    index: '01',
    tone: 'mint',
    title: '统一搜索',
    description:
      '从一个入口按文件名、自然语言、参考图片和主体搜索已索引来源，并继续按媒体类型、时长、方向、日期和索引状态筛选。',
    tags: ['文件名', '自然语言', '参考图片', '主体蒙版'],
  },
  {
    index: '02',
    tone: 'cyan',
    title: '多层图片相似检索',
    description:
      '结合感知哈希、视觉向量、颜色和形状进行召回与精排；支持重复与近重复发现，以及模型就绪时的主体、人脸和行人特征检索。',
    tags: ['Hash + Vector', '颜色与形状', '主体裁剪', '安全降级'],
  },
  {
    index: '03',
    tone: 'orange',
    title: '视频关键帧与命中导航',
    description:
      '用图片或文字寻找视频画面，并在相应外置模型就绪后利用事件、字幕、对白和音频证据；结果可回到播放器的准确时间位置。',
    tags: ['关键帧', '图搜视频', '对白证据', '片段导出'],
  },
  {
    index: '04',
    tone: 'violet',
    title: '智能素材库',
    description:
      '使用分类、标签、集合、收藏、参考图和本地反馈整理素材；个人备份、恢复和删除历史让重要整理结果可追溯。',
    tags: ['分类与标签', '收集篮', '本地反馈', '备份恢复'],
  },
  {
    index: '05',
    tone: 'blue',
    title: '面向大图库的检索链路',
    description:
      'Native 扫描、增量索引、Float16 缓存、ANN 候选与 Worker 流水线减少等待。ANN 只做候选召回，最终仍执行精确重排。',
    tags: ['Native', 'F16', 'ANN 候选', 'Exact 回退'],
  },
  {
    index: '06',
    tone: 'rose',
    title: '可见的准备与维护',
    description:
      '准备中心统一显示现在能搜什么、任务正在做什么和下一步是什么；支持模型校验、存储盘点与按来源清理派生数据。',
    tags: ['模型状态', '统一任务', '健康报告', '派生数据清理'],
  },
] as const

const userScenarios = [
  {
    role: '摄影师与图片创作者',
    label: 'PHOTO',
    description: '按画面、主体、颜色和相似构图找回照片，发现重复素材，保留自己的分类与反馈。',
    outcome: '更少翻文件夹，更快回到原片',
  },
  {
    role: '视频剪辑师',
    label: 'VIDEO',
    description: '按画面、字幕或对白定位片段，在播放器核对命中，并输出 EDL、FCPXML 或选定片段。',
    outcome: '从搜索结果直接进入剪辑流程',
  },
  {
    role: '电商、设计与 VFX/3D',
    label: 'DESIGN',
    description: '用收到的图片寻找产品原图与视觉参考，打开候选工程文件或所在目录继续核对。',
    outcome: '让视觉参考与交付素材更易复用',
  },
  {
    role: '重视本地控制的收藏者',
    label: 'LOCAL',
    description: '不必上传整个素材库，通过本地索引、个人备份和来源级清理掌握自己的数据。',
    outcome: '搜索能力与数据边界都留在手中',
  },
] as const

const releaseSteps = [
  '完成正式安装包与更新准备',
  '公布使用授权与隐私说明',
  '开放软件下载与商业授权办理',
] as const

const faqs = [
  {
    question: '我的素材会上传到云端吗？',
    answer:
      '当前核心扫描、建库、检索和反馈都在本机完成。远程来源由用户显式配置；未来官网、支付或授权服务的数据范围必须在正式隐私政策中单独说明。',
  },
  {
    question: '模型会在我不知情时自动下载吗？',
    answer:
      '不会。托管模型的下载、修复和移除需要用户明确操作；外置视频与音频模型当前不会因为打开页面或面板而自动下载。',
  },
  {
    question: '现在支持 NAS 和团队协作吗？',
    answer:
      '当前可以把挂载网络目录及已配置远程来源作为单用户数据源。多人共享索引、成员权限与集中管理仍在规划中。',
  },
  {
    question: '高级 OCR 已经可以使用了吗？',
    answer: '高级 OCR 与版面理解仍在规划中，暂未提供正式功能。',
  },
  {
    question: '清理索引会删除原始图片或视频吗？',
    answer:
      '来源级清理面向索引、向量、缩略图、视频帧和语义缓存等派生数据，并提供预览与确认。原始素材不属于该清理目标。',
  },
  {
    question: '演示中的十万级图库代表什么？',
    answer:
      '演示用向纵深延伸、逐渐淡出的矩形阵列表现 100,000 张图片的索引规模。实际搜索需要先完成索引，速度和结果取决于硬件、模型、图库规模与索引状态；动画时长不代表搜索耗时。',
  },
  {
    question: '拖入图片后，寻藏实际怎样搜索？',
    answer:
      '统一搜索读取参考图，通过图片指纹在已有本地索引中寻找候选；模型与对应索引就绪时，可以进一步使用视觉特征和主体检索。系统合并、去重并排列候选，显示命中依据和未就绪状态。需要先完成来源扫描与图片索引，未下载模型也可使用图片指纹匹配。',
  },
  {
    question: '能找到 PSD、AI 等工程文件吗？',
    answer:
      '具有可读取内容预览的 PSD、AI 等工程文件，可以通过预览内容参与相似检索，结果指向工程文件本身。PSD 依赖可用的内嵌预览，AI 需要兼容的 PDF 内容。找到的原图和工程文件均为候选，需要打开核对。',
  },
  {
    question: '个人使用免费吗？商业使用如何授权？',
    answer:
      '个人非商业使用免费；用于商业项目、客户交付或经营活动等商业用途，需要取得付费商业授权。具体费用、授权范围与办理方式将在正式发布时公布。',
  },
  {
    question: '现在可以下载、购买授权或查看源码吗？',
    answer:
      'Alpha 源码已公开于 GitHub，当前版本为 1.0.1-alpha.2，采用精简工作台。Release 提供源码快照、备份说明与校验清单，尚无对应安装包，商业授权办理尚未开放。正式许可条款仍待定稿，源码公开不等于采用开源许可证。',
  },
] as const

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Siftory 寻藏首页">
          <span className="brand-image" aria-hidden="true" />
          <span>
            <strong>Siftory</strong>
            <small>寻藏</small>
          </span>
        </a>
        <nav className="primary-nav" aria-label="主导航">
          <a href="#demo">演示</a>
          <a href="#features">能力</a>
          <a href="#scenarios">场景</a>
          <a href="#license">使用授权</a>
          <a href="#faq">FAQ</a>
          <a className="mobile-nav-cta" href="#demo">
            观看演示
          </a>
        </nav>
        <div className="header-actions">
          <ThemeSwitcher />
          <a className="header-cta" href="#demo">
            观看找图演示
          </a>
        </div>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" aria-hidden="true" /> 本地优先的 AI 媒体搜索
            </div>
            <h1 id="hero-title">
              别人发来一张图，<span>用寻藏找回你的原文件。</span>
            </h1>
            <p className="hero-lead">
              Siftory · 寻藏面向 Windows，在本机为图片与视频建立可搜索索引。
              把收到的图片作为参考，在自己的图库中查找相似候选，直接打开原文件或所在文件夹。
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#demo">
                看十万级图库找图演示 <span aria-hidden="true">→</span>
              </a>
              <a className="button button-secondary" href="#status">
                查看当前进度
              </a>
            </div>
            <ul className="trust-list" aria-label="产品特性">
              <li>Windows 本地运行</li>
              <li>图片与视频统一检索</li>
              <li>索引与反馈默认留在本机</li>
              <li>个人非商业使用免费</li>
            </ul>
          </div>

          <figure className="product-stage product-stage-real">
            <div className="stage-glow" aria-hidden="true" />
            <a
              className="product-capture"
              href={sitePath('screenshots/siftory-image-search.png')}
              target="_blank"
              rel="noreferrer"
              aria-label="查看寻藏真实软件界面大图"
            >
              <picture>
                <img
                  src={sitePath('screenshots/siftory-image-search.png')}
                  width={2560}
                  height={1392}
                  alt="寻藏 Alpha 2 Windows 实际运行界面：精简导航、参考图查询与图片指纹命中结果"
                  fetchPriority="high"
                  decoding="async"
                />
              </picture>
            </a>
            <figcaption className="product-capture-caption">
              <span>寻藏 1.0.1-alpha.2 · Windows 实际运行 · 生成示例素材</span>
              <a
                href={sitePath('screenshots/siftory-image-search.png')}
                target="_blank"
                rel="noreferrer"
              >
                查看大图 <span aria-hidden="true">↗</span>
              </a>
            </figcaption>
          </figure>
        </section>

        <ProcessDemo />

        <IndexLifecycle />

        <section className="section" id="features" aria-labelledby="features-title">
          <div className="section-heading centered-heading">
            <span className="section-kicker">当前主线已有能力</span>
            <h2 id="features-title">搜索、整理、定位与维护，形成一个完整闭环</h2>
            <p>
              以下能力已经进入当前主项目和自动化回归；模型依赖项会在界面中明确显示就绪或降级状态。
            </p>
          </div>
          <div className="feature-grid">
            {completedFeatures.map((feature) => (
              <article className={`feature-card tone-${feature.tone}`} key={feature.index}>
                <div className="feature-index" aria-hidden="true">
                  {feature.index}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <ul aria-label={`${feature.title} 关键词`}>
                  {feature.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <aside className="secondary-tools" aria-label="精简工作台">
            <span>精简工作台</span>
            <p>统一搜索 · 素材库 · 数据源 · 视频建库 · 重复文件查找 · 索引与维护</p>
          </aside>
        </section>

        <section className="section" id="scenarios" aria-labelledby="scenarios-title">
          <div className="section-heading section-heading-row">
            <div>
              <span className="section-kicker">为真实素材工作流设计</span>
              <h2 id="scenarios-title">不是云端素材平台的缩小版</h2>
            </div>
            <p>
              围绕本地素材、现有文件结构和专业创作工具工作，不要求先把整个素材库搬到另一个系统。
            </p>
          </div>
          <div className="scenario-grid">
            {userScenarios.map((scenario) => (
              <article className="scenario-card" key={scenario.label}>
                <span className="scenario-label">{scenario.label}</span>
                <h3>{scenario.role}</h3>
                <p>{scenario.description}</p>
                <strong>
                  <span aria-hidden="true">↳</span> {scenario.outcome}
                </strong>
              </article>
            ))}
          </div>
        </section>

        <section className="section trust-section" id="privacy" aria-labelledby="privacy-title">
          <div className="trust-copy">
            <span className="section-kicker">Local-first，不是一句装饰语</span>
            <h2 id="privacy-title">数据边界、模型状态和降级原因，都应该看得见</h2>
            <p>
              当前核心扫描、建库、检索和反馈在本机完成。Siftory
              不会把“模型缺失”伪装成“没有结果”，也不会把派生索引和原始素材混为一谈。
            </p>
            <a className="text-link" href="#faq">
              查看数据与模型常见问题 <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="trust-principles">
            <article>
              <span aria-hidden="true">01</span>
              <div>
                <h3>本地索引与本地反馈</h3>
                <p>个人搜索反馈、索引和素材库默认保存在自己的设备上。</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">02</span>
              <div>
                <h3>模型操作由用户触发</h3>
                <p>下载、校验、修复和移除都有明确入口；外置视频与音频模型不会自动下载。</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">03</span>
              <div>
                <h3>派生数据与原素材分离</h3>
                <p>来源级清理先预览索引、向量、帧和缓存，原始素材不属于清理目标。</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">04</span>
              <div>
                <h3>加速失败仍可精确回退</h3>
                <p>ANN 是可重建的候选层；损坏或过期时不会用不可信结果代替精确检索。</p>
              </div>
            </article>
          </div>
        </section>

        <section className="section usage-section" id="license" aria-labelledby="license-title">
          <div className="section-heading section-heading-row">
            <div>
              <span className="section-kicker">使用授权</span>
              <h2 id="license-title">个人免费使用，商业使用付费</h2>
            </div>
            <p>按照实际使用用途选择授权，让个人收藏与商业工作都有清楚的使用边界。</p>
          </div>
          <dl className="usage-policy">
            <div>
              <dt>
                <span>个人非商业用途</span>
                <strong>免费使用</strong>
              </dt>
              <dd>整理自己的照片、学习资料与非商业收藏，用图片、文字或文件名找回素材。</dd>
            </div>
            <div>
              <dt>
                <span>商业用途</span>
                <strong>付费授权</strong>
              </dt>
              <dd>用于商业项目、客户交付或经营活动等用途，需取得商业授权。</dd>
            </div>
          </dl>
          <p className="usage-note">商业授权的具体费用、适用范围与办理方式，将随正式版本公布。</p>
          <a className="text-link" href="#status">
            查看发布进度 <span aria-hidden="true">→</span>
          </a>
        </section>

        <section className="section status-section" id="status" aria-labelledby="status-title">
          <div className="status-summary">
            <span className="status-badge">Alpha 1.0.1-alpha.2 · 精简工作台源码</span>
            <h2 id="status-title">先了解寻藏，正式版本准备好后再下载</h2>
            <p>
              现在可以查看找图流程、宣传动画与 Alpha
              源码，向我们反馈问题。正式安装包下载和商业授权办理将在正式发布时开放。
            </p>
            <a
              className="text-link"
              href="https://github.com/kaliwell/Siftory"
              target="_blank"
              rel="noreferrer"
            >
              查看 Alpha 源码 <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="release-gates">
            <h3>正式发布前的准备</h3>
            <ol>
              {releaseSteps.map((gate, index) => (
                <li key={gate}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{gate}</strong>
                  <small>准备中</small>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="section-heading centered-heading">
            <span className="section-kicker">FAQ</span>
            <h2 id="faq-title">使用寻藏前，你可能想了解</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>
                  <span>{faq.question}</span>
                  <i aria-hidden="true">＋</i>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="section final-cta" id="contact" aria-labelledby="contact-title">
          <div className="cta-grid" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <span className="section-kicker">从一张参考图开始</span>
          <h2 id="contact-title">不记得文件名，也能从画面开始找</h2>
          <p>
            看看别人发来的图片，如何在十万级图库的场景中成为查找原文件的线索。个人非商业使用免费，商业用途需付费授权。
          </p>
          <div className="hero-actions cta-actions">
            <a className="button button-primary" href="#demo">
              查看找图演示 <span aria-hidden="true">→</span>
            </a>
            <a className="button button-secondary" href="#license">
              了解使用授权
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="brand-image" aria-hidden="true" />
          <div>
            <strong>Siftory · 寻藏</strong>
            <small>本地 AI 媒体搜索与素材管理</small>
          </div>
        </div>
        <nav className="footer-nav" aria-label="页脚导航">
          <a href={sitePath('promo/')}>宣传动画</a>
          <a href="https://github.com/kaliwell/Siftory" target="_blank" rel="noreferrer">
            GitHub 源码
          </a>
          <a href="https://github.com/kaliwell/Siftory/issues" target="_blank" rel="noreferrer">
            问题反馈
          </a>
          <a href="#features">当前能力</a>
          <a href="#license">使用授权</a>
          <a href="#status">发布状态</a>
          <a href="#faq">FAQ</a>
        </nav>
        <p>Siftory · 寻藏正在准备正式发布。个人非商业使用免费，商业使用需付费授权。</p>
      </footer>
    </>
  )
}
