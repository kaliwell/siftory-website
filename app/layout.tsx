export const title = 'Siftory · 寻藏｜本地 AI 媒体搜索与素材管理'
export const description =
  '在 Windows 本机为图片和视频建立可搜索索引，用文件名、自然语言、参考图片、主体或对白找到素材。'
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' }
export const documentInitScript = `(() => {
  try {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }
    const stored = localStorage.getItem('siftory-theme');
    const mode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const resolved = mode === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : mode;
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themeMode = mode;
    document.documentElement.style.colorScheme = resolved;
  } catch {
    document.documentElement.dataset.theme = 'dark';
  }
})();`
