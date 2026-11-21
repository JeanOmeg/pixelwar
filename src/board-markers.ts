import * as ex from 'excalibur'
import { Facing } from './combat'
import { SCALE } from './config'

/**
 * Small pixel-art markers drawn on the board: the facing arrow of each unit,
 * the facing preview on the destination of a move, and the "attack from
 * behind" marker over an enemy. Drawn once and shared (the graphics are cached).
 */

const OUTLINE = '#0a0d2a'
const WHITE = '#ffffff'
const GOLD = '#fff000'

/** Arrow pointing up; the other directions are rotations of it */
const ARROW_UP = [
  '...K...',
  '..KWK..',
  '.KWWWK.',
  'KWWWWWK',
  'KKKKKKK'
]

/** Sword pointing down at the enemy: it can be attacked from behind */
const BACK_SWORD = [
  '.KKK.',
  '.KYK.',
  '.KYK.',
  'KKYKK',
  'KYYYK',
  'KKWKK',
  '.KWK.',
  '.KWK.',
  '.KWK.',
  '..K..'
]

const COLORS: Record<string, string> = { K: OUTLINE, W: WHITE, Y: GOLD }

function rotate(rows: string[], facing: Facing): string[] {
  if (facing === 'up') return rows
  if (facing === 'down') return [...rows].reverse()
  // transpose: the tip (first row) ends up on the left
  const left = Array.from({ length: rows[0].length }, (_, c) => rows.map(row => row[c]).join(''))
  return facing === 'left' ? left : left.map(row => [...row].reverse().join(''))
}

function pixelGraphic(rows: string[], pixel: number): ex.Canvas {
  return new ex.Canvas({
    width: rows[0].length * pixel,
    height: rows.length * pixel,
    cache: true,
    draw: (ctx) => {
      rows.forEach((row, y) => [...row].forEach((key, x) => {
        const color = COLORS[key]
        if (!color) return
        ctx.fillStyle = color
        ctx.fillRect(x * pixel, y * pixel, pixel, pixel)
      }))
    }
  })
}

const cache = new Map<string, ex.Canvas>()

function cached(key: string, build: () => ex.Canvas): ex.Canvas {
  let graphic = cache.get(key)
  if (!graphic) {
    graphic = build()
    cache.set(key, graphic)
  }
  return graphic
}

/** Facing as seen on screen: a mirrored board (online, Red seat) swaps left and right */
export function screenFacing(facing: Facing, mirrored: boolean): Facing {
  if (!mirrored) return facing
  if (facing === 'left') return 'right'
  if (facing === 'right') return 'left'
  return facing
}

/** Small arrow next to the HP bar of a unit */
export function unitFacingArrow(facing: Facing): ex.Canvas {
  return cached(`unit-${facing}`, () => pixelGraphic(rotate(ARROW_UP, facing), SCALE.x))
}

/** Bigger arrow in the middle of the tile where a move ends */
export function destinationFacingArrow(facing: Facing): ex.Canvas {
  return cached(`destination-${facing}`, () => pixelGraphic(rotate(ARROW_UP, facing), SCALE.x * 2))
}

/** Over an enemy that would be attacked from behind */
export function backAttackMarker(): ex.Canvas {
  return cached('back', () => pixelGraphic(BACK_SWORD, SCALE.x * 1.5))
}
