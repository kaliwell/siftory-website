export const SHOTS = [
  {
    label: '收到需求',
    start: 0,
    end: 6,
    eyebrow: '一个熟悉的工作瞬间',
    title: '这张图，',
    accent: '源文件呢？',
    description: '同事发来一张图。\n要的，是能继续修改的那一份。',
    subtitle: '只有一张参考图，怎么找到能修改的源文件？',
  },
  {
    label: '找图困境',
    start: 6,
    end: 16,
    eyebrow: '记得画面，却记不起路径',
    title: '几百个目录，',
    accent: '从哪儿找？',
    description: '客户、年份、临时备份……\n每一层，都像放过那张图。',
    subtitle: '几百个文件夹，一层一层翻。',
  },
  {
    label: '交给寻藏',
    start: 16,
    end: 22,
    eyebrow: '不用先想起文件名',
    title: '把图片，',
    accent: '拖进寻藏。',
    description: '拖入参考图，点击搜索。\n在自己的图库里找相似素材。',
    subtitle: '从聊天窗口拖出图片，放进寻藏。',
  },
  {
    label: '索引检索',
    start: 22,
    end: 31,
    eyebrow: '查询已经建好的本地索引',
    title: '一张图，',
    accent: '搜十万张。',
    description: '匹配指纹，检索视觉特征。\n让相似的文件，浮现出来。',
    subtitle: '在本地索引中匹配，汇集相似的图片与工程文件。',
  },
  {
    label: '找到所在位置',
    start: 31,
    end: 40,
    eyebrow: '从搜索结果，回到熟悉的文件夹',
    title: '找到文件，',
    accent: '也找到位置。',
    description: '打开所在文件夹。\n原图和工程文件，就在熟悉的位置。',
    subtitle: '在寻藏搜索结果里，点击“打开所在文件夹”。',
  },
] as const

export const TOTAL = SHOTS[SHOTS.length - 1].end
export const clamp = (n: number) => Math.min(1, Math.max(0, n))
export const ease = (n: number) => 1 - (1 - clamp(n)) ** 3
export const chatStage = (local: number) =>
  local >= 4.5 ? 4 : local >= 3 ? 3 : local >= 1.1 ? 2 : 1

export function scratchArmPose(lift: number, scratch: number) {
  const t = clamp(lift)
  const rest = 1 - t
  const elbow = { x: 12.4 + t * 2.6, y: 14.5 - t * 8.4 }
  // A wide cubic arc avoids folding the wrist through the elbow while lifting.
  const wrist = {
    x: rest ** 3 * 10.9 + 3 * rest * t * 18 + t ** 3 * 10.4 + scratch * 0.16,
    y: 17 - 14.8 * t * t * (3 - 2 * t) + scratch * 0.11,
  }
  const reach = Math.hypot(wrist.x - elbow.x, wrist.y - elbow.y)
  const direction = { x: (wrist.x - elbow.x) / reach, y: (wrist.y - elbow.y) / reach }
  return {
    elbow,
    wrist,
    // The rounded sleeve stops before the wrist; the exposed wrist bridges it.
    sleeveEnd: { x: wrist.x - direction.x * 0.95, y: wrist.y - direction.y * 0.95 },
    handAngle: (Math.atan2(direction.x, -direction.y) * 180) / Math.PI,
  }
}

export function painFrame(local: number) {
  const phase = local < 3.1 ? 0 : local < 6.6 ? 1 : 2
  return {
    phase,
    folderScroll: ease((local - 0.5) / 1.7) * 23.25,
    folderSelected: local >= 2.35,
    folderClick: clamp(1 - Math.abs(local - 2.9) / 0.18),
    versionScroll: ease((local - 3.65) / 1.65) * 24.05,
    pullback: ease((local - 6.6) / 0.7),
    lift: ease((local - 7.2) / 0.6),
    scratch: local >= 7.8 && local < 9.15 ? Math.sin(((local - 7.8) / 1.35) * Math.PI * 4) : 0,
    title: phase === 0 ? '几百个目录，' : phase === 1 ? '改了又改，' : '翻到挠头，',
    accent: phase === 0 ? '从哪儿找？' : phase === 1 ? '哪份才对？' : '还是没找到。',
    description:
      phase === 0
        ? '客户、年份、临时备份……\n每一层，都像放过那张图。'
        : phase === 1
          ? '最终版、最终版_改、再改一版。\n名字越来越长，答案越来越模糊。'
          : '记得那张图的样子。\n却想不起，它到底放在哪儿。',
  }
}

export function searchFrame(local: number) {
  return {
    drag: ease((local - 0.65) / 2.1),
    entered: local >= 2.75,
    ghost: clamp((local - 0.45) * 5) * (1 - ease((local - 2.75) / 0.45)),
    cursor: ease((local - 2.9) / 1),
    click: clamp(1 - Math.abs(local - 4.15) / 0.25),
    searching: local >= 4.15,
  }
}

export function indexFrame(local: number) {
  const phase = local < 2.4 ? 0 : local < 5.7 ? 1 : 2
  return {
    phase,
    candidates: ease((local - 5.7) / 0.8),
    drawers: Array.from(
      { length: 5 },
      (_, layer) =>
        Math.max(0, Math.sin(local * 2.2 - layer * 1.25)) ** 4 * (1 - ease((local - 5.4) / 0.8)),
    ),
  }
}

export function resultFrame(local: number) {
  return {
    psd: ease((local - 0.55) / 0.6),
    ai: ease((local - 1.15) / 0.6),
    click: clamp(1 - Math.abs(local - 3.3) / 0.25),
    preview: ease((local - 3.5) / 0.65),
    reply: ease((local - 5.25) / 0.6),
  }
}

export function filmFrame(time: number) {
  const bounded = Math.max(0, Math.min(TOTAL, Number.isFinite(time) ? time : 0))
  const activeIndex =
    bounded === TOTAL ? SHOTS.length - 1 : SHOTS.findIndex((shot) => bounded < shot.end)
  const shot = SHOTS[activeIndex]
  const local = bounded - shot.start
  let subtitle: string = shot.subtitle
  if (activeIndex === 0) {
    subtitle =
      chatStage(local) === 1
        ? '“帮我找一下这张图的源文件。”'
        : chatStage(local) === 2
          ? '一张图片，就是全部线索。'
          : chatStage(local) === 3
            ? '“有 PSD、AI 的话，也一起发我。”'
            : '“收到，我找找。”'
  }
  if (activeIndex === 1) {
    const phase = painFrame(local).phase
    subtitle =
      phase === 0
        ? '客户、年份、临时文件……几百个目录，只能挨个翻。'
        : phase === 1
          ? '最终版、最终版_改、改回第一版……哪份才是要找的？'
          : '翻到开始挠头，文件还是没找着。'
  }
  if (activeIndex === 2 && searchFrame(local).searching)
    subtitle = '点击搜索，开始查询本地素材索引。'
  if (activeIndex === 4 && local >= 3.5)
    subtitle = 'Windows 文件夹打开了。原图、PSD、AI，就在这里。'
  return { time: bounded, activeIndex, shot, local, subtitle }
}
