/** A paused stage keeps its remaining reading time, including when the tab is hidden. */
export function createStageClock(
  clock = {
    now: () => performance.now(),
    schedule: (callback: () => void, delay: number) => setTimeout(callback, delay),
    cancel: (timer: ReturnType<typeof setTimeout>) => clearTimeout(timer),
  },
) {
  let remaining = 0
  let startedAt: number | null = null
  let timer: ReturnType<typeof setTimeout> | null = null

  const pause = () => {
    if (startedAt !== null) remaining = Math.max(0, remaining - (clock.now() - startedAt))
    if (timer !== null) clock.cancel(timer)
    timer = null
    startedAt = null
  }

  return {
    reset(duration: number) {
      pause()
      remaining = Math.max(0, duration)
    },
    start(onComplete: () => void) {
      if (timer !== null) return
      startedAt = clock.now()
      timer = clock.schedule(() => {
        timer = null
        startedAt = null
        remaining = 0
        onComplete()
      }, remaining)
    },
    pause,
  }
}
