import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import test from 'node:test'

test('both Pages routes prerender usable content and keep local assets under the repository prefix', async () => {
  for (const file of ['index.html', 'promo/index.html']) {
    const html = await readFile(new URL('../dist/' + file, import.meta.url), 'utf8')
    assert.match(html, /<html lang="zh-CN">/)
    assert.doesNotMatch(html, /<!--site-(head|content)-->/)
    assert.match(html, file.startsWith('promo') ? /这张图/ : /Alpha 1\.0\.1-alpha\.1/)
    for (const [, asset] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g)) {
      assert.ok(asset.startsWith('/siftory-website/'), asset)
      const relative = asset.slice('/siftory-website/'.length)
      if (relative && !relative.endsWith('/'))
        await access(new URL('../dist/' + relative, import.meta.url))
    }
    assert.match(html, /type="module"/)
  }
  const promo = await readFile(new URL('../dist/promo/index.html', import.meta.url), 'utf8')
  assert.match(promo, /href="\/siftory-website\/"/)
  const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
  assert.match(home, /href="\/siftory-website\/promo\/"/)
  assert.match(home, /https:\/\/github\.com\/kaliwell\/Siftory\/issues/)
})
