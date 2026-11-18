import { describe, expect, test } from 'vitest'
import { PadTracker, REPEAT_DELAY_MS, REPEAT_EVERY_MS, STANDARD_BUTTONS, buttonLabel, controllerFamily, readAnalog, type PadButton, type PadSnapshot } from '../src/gamepad/controller'
import { pickInDirection, type Box } from '../src/gamepad/focus-nav'

/** A controller with these buttons held and the sticks at `axes` */
function pad(held: PadButton[] = [], axes: number[] = [0, 0, 0, 0], extra: Partial<Record<PadButton, number>> = {}): PadSnapshot {
  const buttons = Array(17).fill(0)
  for (const b of held) buttons[STANDARD_BUTTONS[b]] = 1
  for (const [b, v] of Object.entries(extra)) buttons[STANDARD_BUTTONS[b as PadButton]] = v
  return { buttons, axes }
}

describe('controller family', () => {
  test.each([
    ['Xbox 360 Controller (XInput STANDARD GAMEPAD)', 'xbox'],
    ['Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)', 'xbox'],
    ['Xbox Wireless Controller', 'xbox'], // Safari
    ['045e-0b12-Microsoft Xbox Series S|X Controller', 'xbox'], // Firefox
    ['Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)', 'playstation'],
    ['DualSense Wireless Controller', 'playstation'],
    ['054c-0ce6-Wireless Controller', 'playstation'],
    ['Pro Controller (STANDARD GAMEPAD Vendor: 057e Product: 2009)', 'nintendo'],
    ['Joy-Con L+R', 'nintendo'],
    ['USB Gamepad (Vendor: 0810 Product: e501)', 'generic']
  ])('%s → %s', (id, family) => {
    expect(controllerFamily(id)).toBe(family)
  })

  test('each controller names its buttons; Nintendo keeps the positions', () => {
    expect(buttonLabel('xbox', 'a')).toBe('A')
    expect(buttonLabel('playstation', 'a')).toBe('✕')
    expect(buttonLabel('playstation', 'rb')).toBe('R1')
    expect(buttonLabel('nintendo', 'a')).toBe('B')
    expect(buttonLabel('nintendo', 'select')).toBe('−')
    expect(buttonLabel('generic', 'start')).toBe('Start')
  })
})

describe('PadTracker', () => {
  test('a button counts once per press', () => {
    const t = new PadTracker()
    expect(t.update([pad(['a'])], 0)).toEqual([{ button: 'a', repeat: false }])
    expect(t.update([pad(['a'])], 16)).toEqual([])
    expect(t.update([pad()], 32)).toEqual([])
    expect(t.update([pad(['a'])], 48)).toEqual([{ button: 'a', repeat: false }])
  })

  test('a held direction repeats like a held key', () => {
    const t = new PadTracker()
    expect(t.update([pad(['right'])], 0)).toHaveLength(1)
    expect(t.update([pad(['right'])], REPEAT_DELAY_MS - 1)).toEqual([])
    expect(t.update([pad(['right'])], REPEAT_DELAY_MS)).toEqual([{ button: 'right', repeat: true }])
    expect(t.update([pad(['right'])], REPEAT_DELAY_MS + REPEAT_EVERY_MS - 1)).toEqual([])
    expect(t.update([pad(['right'])], REPEAT_DELAY_MS + REPEAT_EVERY_MS)).toEqual([{ button: 'right', repeat: true }])
    // face buttons never repeat
    const u = new PadTracker()
    u.update([pad(['a'])], 0)
    expect(u.update([pad(['a'])], 5000)).toEqual([])
  })

  test('the left stick is a D-pad past the threshold', () => {
    const t = new PadTracker()
    expect(t.update([pad([], [0.3, 0])], 0)).toEqual([])
    expect(t.update([pad([], [0.8, 0])], 16)).toEqual([{ button: 'right', repeat: false }])
    expect(t.update([pad([], [0, -0.9])], 32)).toEqual([{ button: 'up', repeat: false }])
  })

  test('any connected controller plays; a half-pressed trigger is not a press', () => {
    const t = new PadTracker()
    expect(t.update([pad(), pad(['b'])], 0)).toEqual([{ button: 'b', repeat: false }])
    expect(t.update([pad([], undefined, { rt: 0.3 })], 16)).toEqual([])
  })
})

describe('analog', () => {
  test('dead zone on the right stick and the triggers', () => {
    expect(readAnalog([pad([], [0, 0, 0.1, 0.1], { lt: 0.1 })])).toEqual({ panX: 0, panY: 0, zoomOut: 0, zoomIn: 0 })
    const a = readAnalog([pad([], [0, 0, 0.6, -0.5], { rt: 0.7 })])
    expect(a.panX).toBeCloseTo(0.6)
    expect(a.panY).toBeCloseTo(-0.5)
    expect(a.zoomIn).toBeCloseTo(0.7)
  })
})

describe('spatial focus', () => {
  const box = (left: number, top: number, w = 100, h = 40): Box => ({ left, top, right: left + w, bottom: top + h })

  test('goes to the nearest box that way, preferring the one in line', () => {
    const from = box(100, 100)
    const inLine = box(300, 100)
    const diagonalCloser = box(220, 300)
    expect(pickInDirection(from, [diagonalCloser, inLine], 'right')).toBe(1)
    expect(pickInDirection(from, [box(100, 200), box(100, 400)], 'down')).toBe(0)
  })

  test('nothing that way: -1', () => {
    expect(pickInDirection(box(100, 100), [box(100, 300)], 'up')).toBe(-1)
    expect(pickInDirection(box(100, 100), [box(400, 100)], 'left')).toBe(-1)
  })

  test('a grid: down from a card lands on the card below, not the next row start', () => {
    const grid = [box(0, 0), box(120, 0), box(240, 0), box(0, 60), box(120, 60), box(240, 60)]
    expect(pickInDirection(grid[1], grid.filter((_, i) => i !== 1), 'down')).toBe(3) // index of box(120, 60) in the filtered list
    expect(pickInDirection(grid[4], grid.filter((_, i) => i !== 4), 'up')).toBe(1)
  })
})
