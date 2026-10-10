import assert from 'node:assert/strict'
import test from 'node:test'
import {
  SHOTS,
  TOTAL,
  filmFrame,
  painFrame,
  scratchArmPose,
  searchFrame,
  indexFrame,
  resultFrame,
} from '../app/promo/promo-timeline.ts'

test('the forty-second film switches at each story boundary and holds its final frame', () => {
  const boundaries = [0, 6, 16, 22, 31, 40]
  assert.deepEqual(
    SHOTS.map((shot) => shot.start),
    boundaries.slice(0, -1),
  )
  assert.deepEqual(
    SHOTS.map((shot) => shot.end),
    boundaries.slice(1),
  )
  for (let index = 0; index < SHOTS.length; index += 1) {
    const atStart = filmFrame(boundaries[index])
    assert.equal(atStart.activeIndex, index)
    assert.equal(atStart.local, 0)
    assert.equal(filmFrame(boundaries[index + 1] - 0.001).activeIndex, index)
  }
  assert.equal(filmFrame(15.99).shot.label, '找图困境')
  assert.equal(filmFrame(16).shot.label, '交给寻藏')
  assert.equal(TOTAL, 40)
  assert.equal(filmFrame(TOTAL).activeIndex, 4)
  assert.equal(filmFrame(TOTAL).local, 9)
  assert.deepEqual(filmFrame(900), filmFrame(TOTAL))
  assert.deepEqual(filmFrame(-5), filmFrame(0))
  assert.deepEqual(filmFrame(Number.NaN), filmFrame(0))
})

test('directory scrolling settles before selection, opening, and the version list', () => {
  const opening = painFrame(0)
  assert.equal(opening.phase, 0)
  assert.equal(opening.folderScroll, 0)
  assert.equal(opening.folderSelected, false)

  const scrolling = painFrame(1.4)
  const settled = painFrame(2.25)
  assert.ok(scrolling.folderScroll > 0 && scrolling.folderScroll < settled.folderScroll)
  assert.equal(settled.folderSelected, false)
  assert.equal(painFrame(2.35).folderSelected, true)
  assert.equal(painFrame(2.9).folderClick, 1)
  assert.equal(painFrame(3.099).phase, 0)

  const versions = painFrame(3.1)
  assert.equal(versions.phase, 1)
  assert.equal(versions.folderScroll, settled.folderScroll)
  assert.equal(versions.versionScroll, 0)
  assert.equal(versions.pullback, 0)
  assert.ok(painFrame(4.5).versionScroll > 0)
  assert.ok(painFrame(4.5).versionScroll < painFrame(5.4).versionScroll)
  assert.equal(painFrame(5.4).versionScroll, painFrame(6.599).versionScroll)
  assert.equal(painFrame(6.599).phase, 1)
  assert.match(filmFrame(10).subtitle, /最终版/)
})

test('the camera pulls back before the hand rises, scratches, and holds still', () => {
  const pullbackStart = painFrame(6.6)
  assert.equal(pullbackStart.phase, 2)
  assert.equal(pullbackStart.pullback, 0)
  assert.equal(pullbackStart.lift, 0)
  assert.ok(painFrame(7).pullback > 0 && painFrame(7).pullback < 1)
  assert.equal(painFrame(7).lift, 0)
  assert.equal(painFrame(7.3).pullback, 1)
  assert.ok(painFrame(7.6).lift > 0 && painFrame(7.6).lift < 1)
  assert.equal(painFrame(7.6).scratch, 0)
  assert.equal(painFrame(8.1).lift, 1)
  assert.notEqual(painFrame(8.1).scratch, 0)

  const hold = painFrame(9.2)
  assert.equal(hold.phase, 2)
  assert.equal(hold.pullback, 1)
  assert.equal(hold.lift, 1)
  assert.equal(hold.scratch, 0)
  assert.deepEqual(painFrame(9.99), hold)
  assert.match(filmFrame(14).subtitle, /挠头/)
})

test('the raised arm stays connected without collapsing or reversing the palm direction', () => {
  const checkPose = (lift, scratch) => {
    const { elbow, wrist, sleeveEnd, handAngle } = scratchArmPose(lift, scratch)
    const context = `lift=${lift}, scratch=${scratch}`
    for (const value of [elbow.x, elbow.y, wrist.x, wrist.y, sleeveEnd.x, sleeveEnd.y, handAngle]) {
      assert.ok(Number.isFinite(value), `non-finite arm geometry at ${context}`)
    }

    const dx = wrist.x - elbow.x
    const dy = wrist.y - elbow.y
    const length = Math.hypot(dx, dy)
    assert.ok(length >= 2.4, `forearm collapsed to ${length} at ${context}`)

    const sleeveX = sleeveEnd.x - elbow.x
    const sleeveY = sleeveEnd.y - elbow.y
    const progress = (sleeveX * dx + sleeveY * dy) / (length * length)
    assert.ok(
      progress > 0 && progress < 1,
      `sleeve end lies outside the elbow-to-wrist segment at ${context}`,
    )
    assert.ok(
      Math.abs(sleeveX * dy - sleeveY * dx) / length < 1e-9,
      `sleeve and wrist are not aligned at ${context}`,
    )
    assert.ok(
      Math.abs(Math.hypot(wrist.x - sleeveEnd.x, wrist.y - sleeveEnd.y) - 0.95) < 1e-9,
      `cuff-to-wrist connection changed at ${context}`,
    )

    // The hand is drawn pointing up; CSS rotates that vector by handAngle degrees.
    const radians = (handAngle * Math.PI) / 180
    assert.ok(
      Math.hypot(Math.sin(radians) - dx / length, -Math.cos(radians) - dy / length) < 1e-9,
      `palm points away from the forearm at ${context}`,
    )
  }

  for (let frame = 0; frame <= 200; frame += 1) checkPose(frame / 200, 0)
  for (const scratch of [-1, 0, 1]) checkPose(1, scratch)
})

test('a dropped reference precedes the search click and the drag copy disappears', () => {
  const dragging = searchFrame(1.7)
  assert.ok(dragging.drag > 0 && dragging.drag < 1)
  assert.equal(dragging.entered, false)
  assert.equal(dragging.searching, false)
  const waitingForClick = searchFrame(3.6)
  assert.equal(waitingForClick.entered, true)
  assert.equal(waitingForClick.ghost, 0)
  assert.equal(waitingForClick.searching, false)
  assert.equal(searchFrame(4.3).searching, true)
})

test('index drawers are staggered and settle before the collected candidates hold', () => {
  assert.equal(indexFrame(5).candidates, 0)
  assert.ok(new Set(indexFrame(1).drawers).size > 1)
  assert.deepEqual(indexFrame(8).drawers, [0, 0, 0, 0, 0])
  assert.equal(indexFrame(8).candidates, 1)
  for (let time = 0; time <= 9; time += 0.1) {
    for (const pull of indexFrame(time).drawers) assert.ok(pull >= 0 && pull <= 1)
  }
})

test('opening the containing folder happens after its results are visible', () => {
  assert.equal(resultFrame(0).psd, 0)
  assert.equal(resultFrame(2).psd, 1)
  assert.equal(resultFrame(2).ai, 1)
  assert.equal(resultFrame(2).preview, 0)
  assert.equal(resultFrame(4.3).preview, 1)
  assert.equal(resultFrame(4.3).reply, 0)
  assert.equal(resultFrame(6).reply, 1)
})

test('scrubbing backwards restores the same state with no queued reveal animations', () => {
  const sample = (time) => {
    const film = filmFrame(time)
    return {
      film,
      pain: painFrame(film.local),
      search: searchFrame(film.local),
      index: indexFrame(film.local),
      result: resultFrame(film.local),
    }
  }
  const checkpoints = [7.4, 10.4, 14.1, 33]
  const before = checkpoints.map(sample)
  sample(TOTAL)
  for (let index = checkpoints.length - 1; index >= 0; index -= 1) {
    assert.deepEqual(sample(checkpoints[index]), before[index])
  }
  sample(0)
  assert.deepEqual(checkpoints.map(sample), before)
  assert.equal(sample(6).pain.phase, 0)
  assert.equal(sample(6).pain.folderSelected, false)
  assert.equal(sample(6).pain.versionScroll, 0)
  assert.equal(sample(6).pain.pullback, 0)
  assert.equal(sample(6).pain.lift, 0)
  assert.equal(sample(6).pain.scratch, 0)
  assert.equal(filmFrame(0).subtitle.includes('PSD'), false)
  assert.equal(filmFrame(3.5).subtitle.includes('PSD'), true)
})
