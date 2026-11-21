/* eslint-disable no-console -- command line tool */
// yarn tileset: rebuilds the extra rows of NewFullTile.png (ids 190+) from the
// original 19 rows, and their properties in NewFullTile.tsx. The original tiles are
// never touched, so the existing maps keep their ids. Everything is a recolor,
// transform or overlay of existing tiles, or a hand-drawn sprite (sprites.ts) in the
// tileset palette, drawn at 2x like the original art.
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { readPng, writePng } from './png'
import * as S from './sprites'

const ROOT = join(__dirname, '..', '..', 'src', 'assets')
const PNG_PATH = join(ROOT, 'tiles', 'NewFullTile.png')
const TSX_PATH = join(ROOT, 'tiledMap', 'NewFullTile.tsx')
const COLUMNS = 10
const ORIGINAL_ROWS = 19
const ORIGINAL_COUNT = COLUMNS * ORIGINAL_ROWS
const SIZE = 32

// 32x32 tile: hex color per pixel, '' = transparent
type Tile = string[][]

interface Props {
  isAttackable: boolean
  isDoor: boolean
  isFast: boolean
  isIce: boolean
  isWalkable: boolean
  isWater: boolean
}

const GROUND: Props = { isAttackable: true, isDoor: false, isFast: true, isIce: false, isWalkable: true, isWater: false }
// walkable but slow: counts as forest (+2 DEF), like the tree tiles
const SLOW: Props = { ...GROUND, isFast: false }
// slippery: costs 2 to cross (1 for Thief/Assassin) and -2 DEF, but open for attacks
const ICE: Props = { ...GROUND, isFast: false, isIce: true }
const BLOCK: Props = { isAttackable: false, isDoor: false, isFast: false, isIce: false, isWalkable: false, isWater: false }
const DOOR: Props = { isAttackable: false, isDoor: true, isFast: false, isIce: false, isWalkable: true, isWater: false }

// ---------------------------------------------------------------- source tiles

const sheet = readPng(PNG_PATH)
const hex = (n: number) => n.toString(16).padStart(2, '0')

function source(id: number): Tile {
  if (id >= ORIGINAL_COUNT) throw new Error(`tile ${id} is not an original tile`)
  const tx = (id % COLUMNS) * SIZE
  const ty = Math.floor(id / COLUMNS) * SIZE
  return Array.from({ length: SIZE }, (_, y) => Array.from({ length: SIZE }, (_, x) => {
    const i = ((ty + y) * sheet.width + tx + x) * 4
    const d = sheet.data
    return d[i + 3] < 128 ? '' : hex(d[i]) + hex(d[i + 1]) + hex(d[i + 2])
  }))
}

const sourceProps = new Map<number, Props>()
const tsxText = readFileSync(TSX_PATH, 'utf8')
for (const match of tsxText.matchAll(/<tile id="(\d+)">([\s\S]*?)<\/tile>/g)) {
  const id = Number(match[1])
  const get = (name: string) => new RegExp(`name="${name}" type="bool" value="true"`).test(match[2])
  sourceProps.set(id, {
    isAttackable: get('isAttackable'),
    isDoor: get('isDoor'),
    isFast: get('isFast'),
    isIce: get('isIce'),
    isWalkable: get('isWalkable'),
    isWater: get('isWater')
  })
}
const propsOf = (id: number) => sourceProps.get(id) ?? GROUND

// ---------------------------------------------------------------- operations

const clone = (t: Tile): Tile => t.map(row => [...row])

function recolor(t: Tile, map: Record<string, string>): Tile {
  return t.map(row => row.map(c => map[c] ?? c))
}

function transpose(t: Tile): Tile {
  return t.map((row, y) => row.map((_, x) => t[x][y]))
}

// draws a 16x16 sprite at 2x; 's' pixels take the shadow color
function paint(base: Tile, sprite: string[], shadow: string, offsetX = 0, offsetY = 0): Tile {
  const t = clone(base)
  sprite.forEach((row, ly) => [...row].forEach((ch, lx) => {
    if (ch === '.') return
    const color = ch === 's' ? shadow : S.PALETTE[ch]
    if (!color) throw new Error(`unknown sprite color '${ch}'`)
    const x0 = (lx + offsetX) * 2
    const y0 = (ly + offsetY) * 2
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        if (y0 + dy >= 0 && y0 + dy < SIZE && x0 + dx >= 0 && x0 + dx < SIZE) t[y0 + dy][x0 + dx] = color
      }
    }
  }))
  return t
}

// logical (16x16) pixel access
const getL = (t: Tile, lx: number, ly: number) => t[ly * 2][lx * 2]
function setL(t: Tile, lx: number, ly: number, color: string) {
  for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) t[ly * 2 + dy][lx * 2 + dx] = color
}

// big drawing (several tiles wide) built at logical resolution, cut into tiles
function cutRegion(region: string[][], col: number, row: number): Tile {
  const t: Tile = Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  for (let ly = 0; ly < 16; ly++) for (let lx = 0; lx < 16; lx++) setL(t, lx, ly, region[row * 16 + ly][col * 16 + lx])
  return t
}

// ---------------------------------------------------------------- palettes

const C = S.PALETTE
const DIRT_TO_SAND = { b08840: C.S, a87629: C.T, '876a3b': C.y }
const GRASS_TO_SNOW = { '56b439': C.l, '2da236': C.m, '438b36': C.m }
const WATER_TO_ICE = { '0070d4': C.m, '5087f6': C.l, '0258aa': C.d }
const DIRT_TO_SNOW = { b08840: C.l, a87629: C.m, '876a3b': C.m }

interface Ground { tile: Tile, shadow: string }
const GRASS: Ground = { tile: source(20), shadow: C.h }
const DIRT: Ground = { tile: source(0), shadow: C.b }
const SAND: Ground = { tile: recolor(source(0), DIRT_TO_SAND), shadow: C.y }
const SNOW: Ground = { tile: recolor(source(20), GRASS_TO_SNOW), shadow: C.m }
const FLOOR: Ground = { tile: source(30), shadow: C.q }

const on = (ground: Ground, sprite: string[]) => paint(ground.tile, sprite, ground.shadow)

// ---------------------------------------------------------------- derived art

function snowyTree(): Tile {
  const t = recolor(source(78), GRASS_TO_SNOW)
  // full resolution: this tree is not aligned to the 2x grid
  const src = clone(t)
  const leaf = (x: number, y: number) => y >= 0 && (src[y][x] === C.e || src[y][x] === C.f)
  for (let x = 0; x < SIZE; x++) {
    for (let y = 0; y < SIZE; y++) {
      if (!leaf(x, y) || leaf(x, y - 1)) continue
      // snow on top of every clump of leaves, thicker in the middle of the crown
      // (the outline pixel stays, so the snow cap does not melt into snowy ground)
      const depth = y < 20 ? 5 : 3
      for (let d = 2; d < depth && leaf(x, y + d); d++) t[y + d][x] = d < depth - 1 ? C.l : C.m
    }
  }
  return t
}

// Facade rows 7..13 of the wall tiles are plain face (no wall top); the house and
// tower walls repeat them, ending with the shadow rows 13..15
function plainWall(variant: number): Tile {
  const a = source(18)
  const b = source(28)
  const t = clone(a)
  const faceRows = [7, 8, 9, 10, 11, 12, 13]
  for (let ly = 0; ly < 13; ly++) {
    const src = (ly + variant) % 2 === 0 ? a : b
    const from = faceRows[(ly + variant * 3) % faceRows.length]
    for (let lx = 0; lx < 16; lx++) setL(t, lx, ly, getL(src, (lx + variant * 5) % 16, from))
  }
  return t
}

// Wall facade broken on one side: the cut part shows the ground with rubble
function brokenFacade(side: 'left' | 'right'): Tile {
  const wall = source(18)
  const t = clone(FLOOR.tile)
  // how far the wall still reaches on each logical row (top rows broke more)
  const reach = [6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12]
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const d = side === 'right' ? lx : 15 - lx
      if (d < reach[ly]) setL(t, lx, ly, getL(wall, lx, ly))
      else if (d === reach[ly]) setL(t, lx, ly, ly < 7 ? C.m : C.k)
    }
  }
  const pile = side === 'right' ? S.cropColumns(S.RUBBLE, 8, 16) : S.cropColumns(S.RUBBLE, 0, 8)
  return paint(t, pile, FLOOR.shadow, side === 'right' ? 2 : -2, 1)
}

// Vertical wall (wall top seen from above) broken at the top or bottom end
function brokenWallTop(end: 'top' | 'bottom'): Tile {
  const wall = source(8)
  const t = clone(FLOOR.tile)
  const reach = [5, 6, 6, 7, 8, 8, 7, 7, 8, 9, 9, 10, 9, 9, 10, 10]
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const d = end === 'bottom' ? ly : 15 - ly
      if (d < reach[lx]) setL(t, lx, ly, getL(wall, lx, ly))
      else if (d === reach[lx] && getL(wall, lx, ly) !== C.y) setL(t, lx, ly, end === 'bottom' ? C.d : C.m)
      else if (d === reach[lx] + 1 && end === 'bottom' && getL(wall, lx, ly) !== C.y) setL(t, lx, ly, C.k)
    }
  }
  return paint(t, S.cropColumns(S.RUBBLE, 0, 16), FLOOR.shadow, 0, end === 'bottom' ? 2 : -3)
}

function overlayFacade(id: number, sprite: string[]): Tile {
  return paint(source(id), sprite, C.k)
}

function openDoor(): Tile {
  return recolor(source(38), { ad5736: C.o, b08840: C.k, a87629: C.o })
}

function gate(): Tile {
  const t = openDoor()
  for (let ly = 0; ly < 16; ly++) {
    for (let lx = 0; lx < 16; lx++) {
      const c = getL(t, lx, ly)
      if (c !== C.o && c !== C.k) continue
      if (lx % 3 === 1 || ly % 4 === 2) setL(t, lx, ly, ly % 4 === 2 ? C.d : C.m)
    }
  }
  return t
}

// Roof, 3 tiles wide x 2 tall (drawn in the wall colors, recolored to clay)
function roofRegion(): string[][] {
  const W = 48
  const H = 32
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    if (y === 0) return C.k
    if (x === 0 || x === W - 1) return C.k
    if (y <= 2) return x === 1 || x === W - 2 ? C.d : (y === 1 ? C.l : C.m)
    if (y === 3) return C.k
    if (y >= H - 3) return y === H - 3 ? C.n : y === H - 2 ? C.k : C.o
    if (x === 1) return C.m
    if (x === W - 2) return C.n
    const band = Math.floor((y - 4) / 4)
    const row = (y - 4) % 4
    if (row === 0) return C.n
    if ((x + (band % 2) * 3) % 6 === 0) return C.n
    if (row === 1) return C.m
    return C.d
  }))
}

// Tower top (2 tiles wide): stone floor behind a crenellated rim
function towerTopRegion(): string[][] {
  const W = 32
  const H = 16
  const floor = source(30)
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const edge = Math.min(x, W - 1 - x, y)
    if (edge === 0) return C.k
    if (edge <= 2) {
      const along = y <= 2 ? x : y
      return Math.floor((along - 1) / 3) % 2 === 0 ? (edge === 1 ? C.l : C.m) : C.n
    }
    if (y === H - 1) return C.k
    if (y === 3 || x === 3 || x === W - 4) return C.d
    return getL(floor, x % 16, y)
  }))
}

const HOUSE_DOOR = [
  '................',
  '................',
  '.....wwwwww.....',
  '....wrrrrrrw....',
  '...wrryyyyrrw...',
  '...wryayyayrw...',
  '...wryayyayrw...',
  '...wryayyayrw...',
  '...wryayyaoow...',
  '...wryayyayrw...',
  '...wryayyayrw...',
  '...wryayyayrw...',
  '...wrrrrrrrrw...',
  '...wkkkkkkkkw...',
  '...wwwwwwwwww...',
  '................'
]

// ---------------------------------------------------------------- layout

const NEW = new Map<number, { tile: Tile, props: Props }>()
function put(id: number, tile: Tile, props: Props) {
  if (NEW.has(id)) throw new Error(`tile ${id} set twice`)
  NEW.set(id, { tile, props })
}
const at = (col: number, row: number) => row * COLUMNS + col

// copies a block of original tiles, recolored, to (col, row)
function block(ids: number[][], col: number, row: number, map: Record<string, string>, props?: Props) {
  ids.forEach((line, dy) => line.forEach((id, dx) => put(at(col + dx, row + dy), recolor(source(id), map), props ?? propsOf(id))))
}
const range = (from: number, n: number) => Array.from({ length: n }, (_, i) => from + i)
const transitionSet = (first: number) => [range(first, 7), range(first + 10, 7), range(first + 20, 7)]
const ISLAND = [[87, 88, 89], [97, 98, 99], [107, 108, 109]]
const LAKE = [[170, 138, 173], [99, 40, 97], [180, 88, 183]]

// row 19: sand
block([[0, 1, 2, 3, 4, 5, 6]], 0, 19, DIRT_TO_SAND)
put(at(7, 19), on(SAND, S.CACTUS), BLOCK)
put(at(8, 19), on(SAND, S.DEAD_SHRUB), SLOW)
put(at(9, 19), on(SAND, S.PEBBLES), GROUND)

// row 20: snow and ice
block([[20, 21, 22, 23, 24, 25, 26]], 0, 20, GRASS_TO_SNOW)
put(at(7, 20), snowyTree(), BLOCK)
put(at(8, 20), paint(recolor(source(40), WATER_TO_ICE), S.ICE_A, C.d), ICE)
put(at(9, 20), paint(recolor(source(41), WATER_TO_ICE), S.ICE_B, C.d), ICE)

// rows 21-29: transitions (same shapes as the originals) and shores
block(transitionSet(110), 0, 21, DIRT_TO_SAND)
block(ISLAND, 7, 21, DIRT_TO_SAND)
block(transitionSet(110), 0, 24, { '56b439': C.l, '2da236': C.m, b08840: C.g, a87629: C.t })
block(LAKE, 7, 24, DIRT_TO_SAND)
block(transitionSet(140), 0, 27, { '9b9774': C.g, '777562': C.h })
block(LAKE, 7, 27, { ...WATER_TO_ICE, ...DIRT_TO_SNOW, cbd8b9: C.l }, ICE)

// row 30: decorations
put(at(0, 30), on(GRASS, S.BUSH), SLOW)
put(at(1, 30), on(DIRT, S.BUSH), SLOW)
put(at(2, 30), on(SAND, S.BUSH), SLOW)
put(at(3, 30), on(GRASS, S.FLOWERS_A), GROUND)
put(at(4, 30), on(GRASS, S.FLOWERS_B), GROUND)
put(at(5, 30), on(GRASS, S.STUMP), BLOCK)
put(at(6, 30), on(GRASS, S.LOG), BLOCK)
put(at(7, 30), on(DIRT, S.CRATE), BLOCK)
put(at(8, 30), on(DIRT, S.BARREL), BLOCK)
put(at(9, 30), on(FLOOR, S.CRATE), BLOCK)

// row 31: fences, well, ruins
put(at(0, 31), on(GRASS, S.cropColumns(S.FENCE_H, 6, 16)), BLOCK)
put(at(1, 31), on(GRASS, S.FENCE_H), BLOCK)
put(at(2, 31), on(GRASS, S.cropColumns(S.FENCE_H, 0, 9)), BLOCK)
put(at(3, 31), on(GRASS, [...S.FENCE_V_MIDDLE.slice(0, 3).map(() => '................'), ...S.FENCE_V_MIDDLE.slice(3)]), BLOCK)
put(at(4, 31), on(GRASS, S.FENCE_V_MIDDLE), BLOCK)
put(at(5, 31), on(GRASS, [...S.FENCE_V_MIDDLE.slice(0, 9), '.....wwwws......', '......ssss......', ...Array(5).fill('................')]), BLOCK)
put(at(6, 31), on(GRASS, S.WELL), BLOCK)
put(at(7, 31), on(FLOOR, S.RUBBLE), SLOW)
put(at(8, 31), on(GRASS, S.RUBBLE), SLOW)
put(at(9, 31), on(FLOOR, S.BROKEN_PILLAR), BLOCK)

// row 32: castle variations
put(at(0, 32), brokenFacade('right'), BLOCK)
put(at(1, 32), brokenFacade('left'), BLOCK)
put(at(2, 32), brokenWallTop('bottom'), BLOCK)
put(at(3, 32), brokenWallTop('top'), BLOCK)
put(at(4, 32), overlayFacade(18, S.CRACKS), BLOCK)
put(at(5, 32), overlayFacade(28, S.WINDOW), BLOCK)
put(at(6, 32), overlayFacade(19, S.TORCH), BLOCK)
put(at(7, 32), openDoor(), DOOR)
put(at(8, 32), gate(), DOOR)
put(at(9, 32), on(FLOOR, S.BARREL), BLOCK)

// rows 33-35: house (3x3), tower (2x2), vertical bridge, wooden bridge
// clay tiles in the door colors, so a house never reads as a castle wall
const CLAY: Record<string, string> = { [C.k]: C.o, [C.l]: C.y, [C.m]: C.a, [C.d]: C.r, [C.n]: C.w }
const roof = roofRegion().map(row => row.map(c => CLAY[c] ?? c))
for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) put(at(c, 33 + r), cutRegion(roof, c, r), BLOCK)
put(at(0, 35), paint(plainWall(0), S.WINDOW, C.k), BLOCK)
put(at(1, 35), paint(plainWall(1), HOUSE_DOOR, C.k), DOOR)
put(at(2, 35), paint(plainWall(0), S.WINDOW, C.k), BLOCK)
const tower = towerTopRegion()
put(at(3, 33), cutRegion(tower, 0, 0), BLOCK)
put(at(4, 33), cutRegion(tower, 1, 0), BLOCK)
put(at(3, 34), paint(plainWall(0), S.ARROW_SLIT, C.k, 4), BLOCK)
put(at(4, 34), paint(plainWall(1), S.ARROW_SLIT, C.k, -4), BLOCK)
put(at(3, 35), on(FLOOR, S.STAIRS), GROUND)
put(at(4, 35), on(FLOOR, S.ALTAR), BLOCK)
put(at(5, 33), transpose(source(167)), propsOf(167))
put(at(5, 34), transpose(source(168)), propsOf(168))
put(at(5, 35), transpose(source(169)), propsOf(169))
const WOOD = { cbd8b9: C.y, '939bbb': C.b, b0a29e: C.a, '9b9774': C.b, '596598': C.w }
block([[167, 168, 169]], 6, 33, WOOD)
put(at(9, 33), on(GRASS, S.BARREL), BLOCK)
put(at(6, 34), on(SNOW, S.BUSH), SLOW)
put(at(7, 34), on(GRASS, S.PEBBLES), GROUND)
put(at(8, 34), on(DIRT, S.PEBBLES), GROUND)
put(at(9, 34), on(SAND, S.CRATE), BLOCK)
put(at(6, 35), on(GRASS, S.TALL_GRASS), SLOW)
put(at(7, 35), on(DIRT, S.FLOWERS_A), GROUND)
put(at(8, 35), on(SNOW, S.DEAD_SHRUB), SLOW)
put(at(9, 35), on(DIRT, S.LOG), BLOCK)

// ---------------------------------------------------------------- output

const rows = Math.max(...NEW.keys()) / COLUMNS + 1 | 0
const total = rows * COLUMNS
for (let id = ORIGINAL_COUNT; id < total; id++) if (!NEW.has(id)) throw new Error(`tile ${id} missing`)

const out = { width: COLUMNS * SIZE, height: rows * SIZE, data: new Uint8Array(COLUMNS * SIZE * rows * SIZE * 4) }
out.data.set(sheet.data.subarray(0, COLUMNS * SIZE * ORIGINAL_ROWS * SIZE * 4))
for (const [id, { tile }] of NEW) {
  const tx = (id % COLUMNS) * SIZE
  const ty = Math.floor(id / COLUMNS) * SIZE
  tile.forEach((line, y) => line.forEach((c, x) => {
    const i = ((ty + y) * out.width + tx + x) * 4
    if (c) out.data.set([parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16), 255], i)
  }))
}
writePng(PNG_PATH, out)

const bool = (name: string, value: boolean) => `   <property name="${name}" type="bool" value="${value}"/>`
const tileXml = (id: number, p: Props) => [
  ` <tile id="${id}">`,
  '  <properties>',
  bool('isAttackable', p.isAttackable),
  bool('isDoor', p.isDoor),
  bool('isFast', p.isFast),
  bool('isIce', p.isIce),
  bool('isWalkable', p.isWalkable),
  bool('isWater', p.isWater),
  '   <property name="walkableMask" type="int" value="-1"/>',
  '  </properties>',
  ' </tile>'
].join('\n')

const eol = tsxText.includes('\r\n') ? '\r\n' : '\n'
const lines = tsxText.split(/\r?\n/)
const keep: string[] = []
let skipping = false
for (const line of lines) {
  const open = line.match(/^ <tile id="(\d+)">/)
  if (open) skipping = Number(open[1]) >= ORIGINAL_COUNT
  if (line.startsWith('</tileset>')) break
  if (!skipping) keep.push(line)
  if (line.startsWith(' </tile>')) skipping = false
}
const header = keep.join('\n')
  .replace(/tilecount="\d+"/, `tilecount="${total}"`)
  .replace(/(<image source="[^"]+" width="\d+" height=")\d+"/, `$1${out.height}"`)
const extra = [...NEW.keys()].sort((a, b) => a - b).map(id => tileXml(id, NEW.get(id)!.props))
writeFileSync(TSX_PATH, [header, ...extra, '</tileset>', ''].join('\n').replace(/\n/g, eol))
console.log(`tileset: ${ORIGINAL_COUNT} original + ${NEW.size} new tiles (${COLUMNS}x${rows}, ${out.width}x${out.height})`)
