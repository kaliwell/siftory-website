import assert from 'node:assert/strict'
import test from 'node:test'
import { createStageClock } from '../app/demo-playback.ts'

function createFakeClock() {
  let now = 0
  let sequence = 0
  const timers = new Map()
  const scheduledDelays = []

  const clock = {
    now: () => now,
    schedule(callback, delay) {
      const timer = ++sequence
      timers.set(timer, { callback, dueAt: now + delay })
      scheduledDelays.push(delay)
      return timer
    },
    cancel(timer) {
      timers.delete(timer)
    },
  }

  function advanceBy(duration) {
    const target = now + duration
    while (true) {
      const next = [...timers.entries()]
        .filter(([, timer]) => timer.dueAt <= target)
        .sort(([leftId, left], [rightId, right]) => left.dueAt - right.dueAt || leftId - rightId)[0]
      if (!next) break
      const [id, timer] = next
      timers.delete(id)
      now = Math.max(now, timer.dueAt)
      timer.callback()
    }
    now = target
  }

  return {
    clock,
    advanceBy,
    // A background tab can have a due timeout whose callback has not run yet.
    elapseWithoutCallbacks(duration) {
      now += duration
    },
    get pendingCount() {
      return timers.size
    },
    scheduledDelays,
  }
}

test('pausing and resuming preserves the remaining stage time', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  let completions = 0
  const complete = () => completions++

  stage.reset(1000)
  stage.start(complete)
  fake.advanceBy(275)
  stage.pause()
  assert.equal(fake.pendingCount, 0)

  fake.advanceBy(5000)
  assert.equal(completions, 0)
  stage.start(complete)
  assert.deepEqual(fake.scheduledDelays, [1000, 725])
  fake.advanceBy(724)
  assert.equal(completions, 0)
  fake.advanceBy(1)
  assert.equal(completions, 1)
})

test('repeated pauses while offscreen do not subtract elapsed time twice', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  let completions = 0
  const complete = () => completions++

  stage.reset(1200)
  stage.start(complete)
  fake.advanceBy(300)
  stage.pause()
  fake.advanceBy(400)
  stage.pause()
  fake.advanceBy(700)
  stage.pause()
  assert.equal(fake.pendingCount, 0)
  assert.equal(completions, 0)

  stage.start(complete)
  assert.deepEqual(fake.scheduledDelays, [1200, 900])
  fake.advanceBy(899)
  assert.equal(completions, 0)
  fake.advanceBy(1)
  assert.equal(completions, 1)
})

test('starting an active stage twice keeps one timer and its original callback', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  let completions = 0
  let duplicateCompletions = 0

  stage.reset(800)
  stage.start(() => completions++)
  fake.advanceBy(200)
  stage.start(() => duplicateCompletions++)
  stage.start(() => duplicateCompletions++)
  assert.equal(fake.pendingCount, 1)
  assert.deepEqual(fake.scheduledDelays, [800])

  fake.advanceBy(599)
  assert.equal(completions, 0)
  fake.advanceBy(1)
  assert.equal(completions, 1)
  assert.equal(duplicateCompletions, 0)
  assert.equal(fake.pendingCount, 0)
})

test('reset cancels the previous stage and starts the next stage with its full duration', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  const completions = []

  stage.reset(1000)
  stage.start(() => completions.push('old'))
  fake.advanceBy(400)
  stage.reset(2000)
  assert.equal(fake.pendingCount, 0)
  stage.start(() => completions.push('new'))
  assert.deepEqual(fake.scheduledDelays, [1000, 2000])

  fake.advanceBy(600)
  assert.deepEqual(completions, [])
  fake.advanceBy(1399)
  assert.deepEqual(completions, [])
  fake.advanceBy(1)
  assert.deepEqual(completions, ['new'])
})

test('a completed timer calls back only once through later pauses and time advances', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  let completions = 0

  stage.reset(250)
  stage.start(() => {
    completions++
    stage.pause()
  })
  fake.advanceBy(250)
  assert.equal(completions, 1)
  assert.equal(fake.pendingCount, 0)

  stage.pause()
  fake.advanceBy(10000)
  stage.pause()
  fake.advanceBy(0)
  assert.equal(completions, 1)
  assert.equal(fake.pendingCount, 0)
})

test('an expired stage paused before callback execution can resume with zero remaining time', () => {
  const fake = createFakeClock()
  const stage = createStageClock(fake.clock)
  let completions = 0
  const complete = () => completions++

  stage.reset(100)
  stage.start(complete)
  fake.elapseWithoutCallbacks(150)
  stage.pause()
  assert.equal(fake.pendingCount, 0)
  assert.equal(completions, 0)

  fake.advanceBy(500)
  stage.start(complete)
  stage.start(complete)
  assert.deepEqual(fake.scheduledDelays, [100, 0])
  assert.equal(fake.pendingCount, 1)
  assert.equal(completions, 0, 'zero delay still schedules instead of completing synchronously')
  fake.advanceBy(0)
  assert.equal(completions, 1)
  assert.equal(fake.pendingCount, 0)
  fake.advanceBy(1000)
  assert.equal(completions, 1)
})
