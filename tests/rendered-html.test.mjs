import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const previewRoot = new URL('../app/_sites-preview/', import.meta.url)
const siteTitle = 'Siftory · 寻藏｜本地 AI 媒体搜索与素材管理'
const siteDescription =
  '在 Windows 本机为图片和视频建立可搜索索引，用文件名、自然语言、参考图片、主体或对白找到素材。'

let renderedPagePromise

function attributesFromTag(tag) {
  const attributes = new Map()
  for (const match of tag.matchAll(/\s([A-Za-z_:][-A-Za-z0-9_:.]*)=(["'])(.*?)\2/gs)) {
    attributes.set(match[1].toLowerCase(), match[3])
  }
  return attributes
}

function metaContent(html, selectorName, selectorValue) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attributes = attributesFromTag(tag)
    if (attributes.get(selectorName) === selectorValue) {
      return attributes.get('content')
    }
  }
  return undefined
}

function visibleText(fragment) {
  return fragment
    .replace(/<!--.*?-->/gs, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

async function renderPage() {
  renderedPagePromise ??= readFile(new URL('../dist/index.html', import.meta.url), 'utf8').then(
    (html) => ({ status: 200, contentType: 'text/html', html }),
  )
  return renderedPagePromise
}

async function previewFiles() {
  try {
    return await readdir(previewRoot, { recursive: true })
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return []
    throw error
  }
}

test('server-renders Chinese product metadata with absolute social images', async () => {
  const { status, contentType, html } = await renderPage()

  assert.equal(status, 200)
  assert.match(contentType, /^text\/html\b/i)
  assert.match(html, /<html\b[^>]*\blang=["']zh-CN["']/i)
  assert.equal(html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1], siteTitle)
  assert.equal(metaContent(html, 'name', 'description'), siteDescription)
  const viewport = metaContent(html, 'name', 'viewport') ?? ''
  assert.match(viewport, /width=device-width/)
  assert.match(viewport, /initial-scale=1/)
  assert.match(html, /viewport-fit=cover/)
  assert.match(siteTitle, /[\u3400-\u9fff]/u)
  assert.match(siteDescription, /[\u3400-\u9fff]/u)

  assert.equal(metaContent(html, 'property', 'og:title'), siteTitle)
  assert.equal(metaContent(html, 'property', 'og:description'), siteDescription)
  assert.equal(metaContent(html, 'name', 'twitter:title'), siteTitle)
  assert.equal(metaContent(html, 'name', 'twitter:description'), siteDescription)
  assert.equal(metaContent(html, 'name', 'twitter:card'), 'summary_large_image')

  const socialImages = [
    metaContent(html, 'property', 'og:image'),
    metaContent(html, 'name', 'twitter:image'),
  ]
  for (const image of socialImages) {
    assert.equal(typeof image, 'string')
    const parsed = new URL(image)
    assert.equal(parsed.protocol, 'https:')
    assert.equal(parsed.host, 'kaliwell.github.io')
    assert.equal(parsed.pathname, '/siftory-website/screenshots/siftory-image-search.png')
  }
})

test('renders personal-free and commercial-paid usage without tiered plans or premature sales', async () => {
  const { html } = await renderPage()
  const text = visibleText(html)

  assert.match(text, /别人发来一张图， 用寻藏找回你的原文件。/)
  assert.match(text, /Siftory · 寻藏面向 Windows，在本机为图片与视频建立可搜索索引/)
  assert.match(text, /从建立索引，到找到原文件，再到持续维护/)
  assert.match(text, /搜索、整理、定位与维护，形成一个完整闭环/)

  for (const anchor of [
    'workflow',
    'features',
    'scenarios',
    'privacy',
    'license',
    'status',
    'faq',
    'contact',
  ]) {
    assert.match(html, new RegExp(`\\bid=["']${anchor}["']`))
  }

  assert.match(text, /个人免费使用，商业使用付费/)
  assert.match(text, /个人非商业用途 免费使用/)
  assert.match(text, /商业用途 付费授权/)
  assert.match(text, /商业授权的具体费用、适用范围与办理方式，将随正式版本公布/)
  assert.match(text, /尚无对应安装包，商业授权办理尚未开放/)
  assert.match(text, /Alpha 源码已公开于 GitHub/)
  assert.doesNotMatch(
    text,
    /\bCommunity\b|\bPro\b|\bEnterprise\b|Team \/ NAS|SKU|版本对比|版本路线|套餐/,
  )
  assert.doesNotMatch(html, /\bid=["'](?:editions|comparison)["']/)
  assert.match(text, /Local-first，不是一句装饰语/)
  assert.match(text, /我的素材会上传到云端吗？/)
  assert.match(text, /看十万级图库找图演示/)
  assert.match(text, /Alpha 1\.0\.1-alpha\.2/)

  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]))
  for (const [, target] of html.matchAll(/\bhref=["']#([^"']+)["']/g)) {
    assert.ok(ids.has(target), `Navigation target #${target} must exist`)
  }

  for (const claim of [
    '立即购买 Pro',
    'Pro 现已开售',
    'Community 已开源',
    '现已开源',
    'Siftory 已正式发布',
    '正式版现已发布',
    '立即下载正式版',
  ]) {
    assert.doesNotMatch(text, new RegExp(claim, 'i'))
  }

  const marketingSurfaces = visibleText(
    (html.match(/<(?:h[1-6]|a|button)\b[^>]*>[\s\S]*?<\/(?:h[1-6]|a|button)>/gi) ?? []).join(' '),
  )
  assert.doesNotMatch(marketingSurfaces, /立即购买|已开源|现已发布|立即下载/i)
})

test('renders a compact chat-to-search demo with accessible playback', async () => {
  const [{ html }, interactions, depthStyles] = await Promise.all([
    renderPage(),
    readFile(new URL('../app/site-interactions.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/depth-demo.css', import.meta.url), 'utf8'),
  ])
  const text = visibleText(html)

  assert.match(text, /把聊天里的图片，拖进寻藏。/)
  assert.match(text, /微信/)
  assert.match(text, /钉钉/)
  assert.match(text, /同事|甲方/)
  assert.match(text, /10万张/)
  assert.match(text, /相似结果/)
  assert.match(text, /pencil[^\s]*\.jpg/)
  assert.match(text, /pencil[^\s]*\.psd/)
  assert.match(text, /pencil[^\s]*\.ai/)
  assert.match(text, /工程文件均为候选，需要打开核对/)
  assert.match(text, /标准模式流程示意（模型与索引已就绪），动画时长不代表搜索耗时/)
  assert.match(text, /统一搜索读取参考图，通过图片指纹在已有本地索引中寻找候选/)
  assert.match(text, /未下载模型也可使用图片指纹匹配/)
  assert.doesNotMatch(text, /逐层翻找|逐层查找/)
  assert.match(text, /播放演示/)
  assert.match(html, /aria-label=["']演示步骤["']/)
  assert.match(html, /aria-label=["']查看步骤：收到图片["']/)
  assert.match(html, /aria-label=["']查看步骤：拖入寻藏["']/)
  assert.match(html, /aria-label=["']查看步骤：搜索图库["']/)
  assert.match(html, /aria-label=["']查看步骤：查看原文件["']/)
  assert.equal((html.match(/aria-label=["']查看步骤：/g) ?? []).length, 4)
  assert.match(html, /aria-controls=["']chat-demo-stage["']/)
  assert.match(html, /aria-current=["']step["']/)
  assert.match(html, /data-demo-step=["']receive["']/)
  assert.match(html, /data-snapshot=["']true["']/)
  assert.match(depthStyles, /animation-play-state:/)
  assert.match(depthStyles, /prefers-reduced-motion/)

  for (const removed of [
    'process-overview',
    'process-tabs',
    'process-panel-copy',
    'process-visual-bar',
    'depth-scene-toolbar',
    'depth-legend',
    'depth-archive-layers',
    'depth-result-zone',
  ]) {
    assert.ok(!html.includes(`class="${removed}"`), `Removed demo decoration: ${removed}`)
  }
  assert.doesNotMatch(text, /正视查看|切换 3D|橙色：参考图|跨年份、跨文件夹查询/)
  assert.match(interactions, /IntersectionObserver/)
  assert.match(interactions, /visibilitychange/)
  assert.match(interactions, /hasAutoStarted/)
  assert.match(interactions, /stageDurations\[activeIndex\]/)
  assert.match(interactions, /handleStageKeyDown/)
  assert.match(interactions, /localStorage\.setItem\(THEME_STORAGE_KEY/)
  for (const theme of ['自动主题', '浅色主题', '深色主题']) {
    assert.ok(html.includes(`aria-label="${theme}"`))
  }
})

test('defines responsive layouts for desktop, tablet, mobile, touch, and landscape devices', async () => {
  const [styles, page, layout, interactions] = await Promise.all([
    readFile(new URL('../app/globals.css', import.meta.url), 'utf8'),
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/site-interactions.tsx', import.meta.url), 'utf8'),
  ])

  for (const breakpoint of ['1600px', '1180px', '980px', '760px', '540px', '420px']) {
    assert.match(styles, new RegExp(`(?:min|max)-width:\\s*${breakpoint}`))
  }

  assert.match(styles, /max-height:\s*720px/)
  assert.match(styles, /pointer:\s*coarse/)
  assert.match(styles, /hover:\s*none/)
  assert.match(styles, /env\(safe-area-inset-top\)/)
  assert.match(styles, /env\(safe-area-inset-bottom\)/)
  assert.match(styles, /100svh/)
  assert.match(styles, /-webkit-text-size-adjust:\s*100%/)
  assert.match(styles, /\.app-body\s*\{[\s\S]*?grid-template-columns:\s*1fr/)
  assert.match(styles, /\.theme-option\s*\{[\s\S]*?min-width:\s*44px;[\s\S]*?min-height:\s*44px/)
  assert.match(page, /className="mobile-nav-cta"/)
  assert.match(page, /<figure className="product-stage product-stage-real"/)
  const { html } = await renderPage()
  assert.match(html, /src="\/siftory-website\/screenshots\/siftory-image-search\.png"/)
  assert.match(layout, /viewportFit:\s*'cover'/)
  assert.match(layout, /viewportMeta\.setAttribute\([\s\S]*?viewport-fit=cover/)
  assert.match(interactions, /COARSE_POINTER_QUERY = '\(pointer: coarse\)'/)
  assert.match(interactions, /isCoarsePointer/)
})

test('removes the Sites starter preview and loading-skeleton dependency', async () => {
  const [htmlResult, page, layout, packageText, lockfile, files] = await Promise.all([
    renderPage(),
    readFile(new URL('../app/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
    readFile(new URL('../package-lock.json', import.meta.url), 'utf8'),
    previewFiles(),
  ])
  const packageJson = JSON.parse(packageText)

  assert.deepEqual(files, [])
  await assert.rejects(
    access(new URL('SkeletonPreview.tsx', previewRoot)),
    (error) => error?.code === 'ENOENT',
  )
  await assert.rejects(
    access(new URL('preview.css', previewRoot)),
    (error) => error?.code === 'ENOENT',
  )

  for (const section of [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
  ]) {
    assert.equal(Object.hasOwn(packageJson[section] ?? {}, 'react-loading-skeleton'), false)
  }
  assert.doesNotMatch(lockfile, /react-loading-skeleton/i)

  const finishedSources = `${page}\n${layout}`
  const finishedHtml = htmlResult.html
  for (const starterMarker of [
    /codex-preview/i,
    /_sites-preview/i,
    /SkeletonPreview/,
    /react-loading-skeleton/i,
    /Starter Project/i,
    /Your site is taking shape/i,
    /Building your site/i,
  ]) {
    assert.doesNotMatch(finishedSources, starterMarker)
    assert.doesNotMatch(finishedHtml, starterMarker)
  }
})
