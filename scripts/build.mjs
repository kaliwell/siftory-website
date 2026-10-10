import { build } from 'vite'
import { readFile, writeFile, copyFile } from 'node:fs/promises'
await build()
await build({
  build: {
    ssr: 'scripts/prerender.tsx',
    outDir: '.prerender',
    rollupOptions: { input: undefined },
  },
})
const { render } = await import('../.prerender/prerender.js')
const origin = 'https://kaliwell.github.io/siftory-website/'
const escape = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')
for (const [file, promo] of [
  ['index.html', false],
  ['promo/index.html', true],
]) {
  const page = render(promo)
  const url = origin + (promo ? 'promo/' : '')
  const image = origin + 'screenshots/siftory-image-search.png'
  const head =
    '<title>' +
    escape(page.title) +
    '</title><meta name="description" content="' +
    escape(page.description) +
    '"><link rel="canonical" href="' +
    url +
    '"><link rel="icon" href="' +
    origin +
    'brand/siftory-favicon.png"><meta property="og:type" content="website"><meta property="og:locale" content="zh_CN"><meta property="og:url" content="' +
    url +
    '"><meta property="og:title" content="' +
    escape(page.title) +
    '"><meta property="og:description" content="' +
    escape(page.description) +
    '"><meta property="og:image" content="' +
    image +
    '"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="' +
    escape(page.title) +
    '"><meta name="twitter:description" content="' +
    escape(page.description) +
    '"><meta name="twitter:image" content="' +
    image +
    '"><script>' +
    page.documentInitScript +
    '</script>'
  const target = 'dist/' + file
  const template = await readFile(target, 'utf8')
  await writeFile(
    target,
    template.replace('<!--site-head-->', head).replace('<!--site-content-->', page.html),
  )
}
await writeFile('dist/.nojekyll', '')
await writeFile('dist/robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + origin + 'sitemap.xml\n')
await writeFile(
  'dist/sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' +
    origin +
    '</loc></url><url><loc>' +
    origin +
    'promo/</loc></url></urlset>',
)
await copyFile('404.html', 'dist/404.html')
