import { describe, expect, test } from 'vitest'
import { MAX_ZOOM, MIN_ZOOM, WHEEL_STEP, anchorAxis, clampAxis, clampZoom, wheelZoom } from '../src/camera-math'

describe('map zoom', () => {
  test('stays between the default view and 2x', () => {
    expect(MIN_ZOOM).toBe(1)
    expect(MAX_ZOOM).toBe(2)
    expect(clampZoom(0.5)).toBe(1)
    expect(clampZoom(5)).toBe(2)
    expect(clampZoom(NaN)).toBe(1)
  })

  test('one wheel notch zooms a little, never past the limits', () => {
    expect(wheelZoom(1, -100)).toBeCloseTo(WHEEL_STEP)
    expect(wheelZoom(1, 100)).toBe(1)
    // a fast wheel event still moves one notch at most
    expect(wheelZoom(1, -1000)).toBeCloseTo(WHEEL_STEP)
    let zoom = 1
    for (let i = 0; i < 100; i++) zoom = wheelZoom(zoom, -100)
    expect(zoom).toBe(2)
    // from 1x to 2x takes several notches
    let notches = 0
    for (zoom = 1; zoom < 2; notches++) zoom = wheelZoom(zoom, -100)
    expect(notches).toBeGreaterThanOrEqual(8)
  })

  test('the view never leaves the map', () => {
    // map 1792 wide, screen 1920 wide
    expect(clampAxis(0, 1, 1920, 1792)).toBe(896)
    expect(clampAxis(5000, 1, 1920, 1792)).toBe(896)
    // at 2x the view is 960 wide: center between 480 and 1312
    expect(clampAxis(0, 2, 1920, 1792)).toBe(480)
    expect(clampAxis(5000, 2, 1920, 1792)).toBe(1312)
    expect(clampAxis(700, 2, 1920, 1792)).toBe(700)
  })

  test('zooming keeps the point under the cursor in place', () => {
    const world = 300
    const offset = 200
    for (const zoom of [1, 1.5, 2]) {
      const pos = anchorAxis(world, offset, zoom)
      expect(pos + offset / zoom).toBeCloseTo(world)
    }
  })
})
