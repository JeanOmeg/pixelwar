// Spritesheet of a mini as a grid of palette letters, plus the tools the recipes in
// build-minis.ts use: find the head in each frame (template match), recolor by
// region and draw hand-made patches with an automatic outline.
import { readPng, writePng } from '../tileset/png'

export const SIZE = 32
export const COLS = 4
export const ROWS = 14

// One letter per palette color. '.' = transparent, ',' = shadow (black, alpha 128)
export type Grid = string[][]
export type Team = 'A' | 'B'
export type Palette = Record<string, string | [string, string]>

// The 8 colors of the original minis. Team colors are D (dark) and L (light)
export const BASE_PALETTE: Palette = {
  '#': '0a0d2a',
  D: ['0000c0', 'a61414'],
  L: ['7d7dea', 'f96363'],
  W: 'ffffff',
  h: '684722',
  w: 'bc9148',
  s: 'f3cb87',
  Y: 'fff000'
}

const hex = (n: number) => n.toString(16).padStart(2, '0')

export function colorOf(palette: Palette, letter: string, team: Team): string {
  const c = palette[letter]
  if (c === undefined) throw new Error(`no color for '${letter}'`)
  return typeof c === 'string' ? c : c[team === 'A' ? 0 : 1]
}

/** Reads a team A sheet into frames[row][col] of letters (any team color becomes D/L) */
export function readSheet(path: string): Grid[][] {
  const img = readPng(path)
  const lookup = new Map<string, string>()
  for (const [letter, c] of Object.entries(BASE_PALETTE)) {
    for (const v of typeof c === 'string' ? [c] : c) lookup.set(v, letter)
  }
  lookup.set('424242', '#') // one stray dark pixel in the Barbarian sheets
  return Array.from({ length: ROWS }, (_, row) => Array.from({ length: COLS }, (_, col) =>
    Array.from({ length: SIZE }, (_, y) => Array.from({ length: SIZE }, (_, x) => {
      const i = ((row * SIZE + y) * img.width + col * SIZE + x) * 4
      const a = img.data[i + 3]
      if (a === 0) return '.'
      const k = hex(img.data[i]) + hex(img.data[i + 1]) + hex(img.data[i + 2])
      if (a < 255 && k === '000000') return ','
      const letter = lookup.get(k)
      if (!letter) throw new Error(`${path}: unknown color ${k} at row ${row} col ${col} (${x}, ${y})`)
      return letter
    }))))
}

export function writeSheet(path: string, frames: Grid[][], palette: Palette, team: Team): void {
  const width = COLS * SIZE
  const height = ROWS * SIZE
  const data = new Uint8Array(width * height * 4)
  frames.forEach((line, row) => line.forEach((grid, col) => grid.forEach((cells, y) => cells.forEach((letter, x) => {
    if (letter === '.') return
    const i = ((row * SIZE + y) * width + col * SIZE + x) * 4
    if (letter === ',') {
      data.set([0, 0, 0, 128], i)
      return
    }
    const c = colorOf(palette, letter, team)
    data.set([parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16), 255], i)
  }))))
  writePng(path, { width, height, data })
}

export const cloneGrid = (g: Grid): Grid => g.map(r => [...r])
const isEmpty = (letter: string) => letter === '.' || letter === ','

// ------------------------------------------------------------------ templates

/** A piece of a frame (head, weapon tip...) to find again in other frames */
export interface Template {
  name: string
  cells: Grid // '.' = not part of the template
}

/** Cuts a template from a frame. Only the pixels of `keep` letters are kept */
export function cutTemplate(name: string, frame: Grid, x0: number, y0: number, x1: number, y1: number, keep?: string): Template {
  const cells: Grid = []
  for (let y = y0; y <= y1; y++) {
    cells.push([])
    for (let x = x0; x <= x1; x++) {
      const v = frame[y][x]
      cells[y - y0].push(isEmpty(v) || (keep && !keep.includes(v)) ? '.' : v)
    }
  }
  return { name, cells }
}


export interface Match {
  template: Template
  x: number
  y: number
  score: number
}

/** Best place of one of the templates in the frame (share of template pixels that match) */
export function findTemplate(frame: Grid, templates: Template[], minScore = 0.86): Match | undefined {
  let best: Match | undefined
  for (const template of templates) {
    const h = template.cells.length
    const w = template.cells[0].length
    let total = 0
    for (const r of template.cells) for (const v of r) if (v !== '.') total++
    for (let y = -2; y <= SIZE - h + 2; y++) {
      for (let x = -2; x <= SIZE - w + 2; x++) {
        let hits = 0
        for (let ty = 0; ty < h; ty++) {
          for (let tx = 0; tx < w; tx++) {
            const v = template.cells[ty][tx]
            if (v !== '.' && frame[y + ty]?.[x + tx] === v) hits++
          }
        }
        const score = hits / total
        if (score >= minScore && (!best || score > best.score)) best = { template, x, y, score }
      }
    }
  }
  return best
}

/** Recolors the matched template pixels (only where the frame still matches it) */
export function recolorMatch(frame: Grid, match: Match, map: Record<string, string>): void {
  match.template.cells.forEach((r, ty) => r.forEach((v, tx) => {
    const y = match.y + ty
    const x = match.x + tx
    if (v === '.' || frame[y]?.[x] !== v) return
    if (map[v] !== undefined) frame[y][x] = map[v]
  }))
}

export function recolor(frame: Grid, map: Record<string, string>, skip?: (x: number, y: number) => boolean): void {
  frame.forEach((r, y) => r.forEach((v, x) => {
    if (map[v] !== undefined && !skip?.(x, y)) r[x] = map[v]
  }))
}

/**
 * Groups of connected pixels (4-neighbours) that start on a `seed` letter and
 * spread only through `through` letters. Used to tell weapons (white edge + team
 * color blade) from clothes: the art always keeps an outline between them.
 */
export function regions(frame: Grid, seed: string, through: string): [number, number][][] {
  const seen = new Set<number>()
  const groups: [number, number][][] = []
  frame.forEach((r, y) => r.forEach((v, x) => {
    if (!seed.includes(v) || seen.has(y * SIZE + x)) return
    const group: [number, number][] = []
    const stack: [number, number][] = [[x, y]]
    seen.add(y * SIZE + x)
    while (stack.length) {
      const [cx, cy] = stack.pop()!
      group.push([cx, cy])
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        if (nx < 0 || ny < 0 || nx >= SIZE || ny >= SIZE || seen.has(ny * SIZE + nx)) continue
        if (!through.includes(frame[ny][nx])) continue
        seen.add(ny * SIZE + nx)
        stack.push([nx, ny])
      }
    }
    groups.push(group)
  }))
  return groups
}

// -------------------------------------------------------------------- patches

/**
 * Hand-drawn piece placed relative to a match: `rows` start at (match.x + dx,
 * match.y + dy). ' ' keeps the pixel, '_' erases it, '#' outline, any other
 * letter paints it. With `outline` (default) every empty pixel next to a painted
 * one becomes outline, so added pieces get the same black border as the art.
 * `over` limits painting to pixels that currently hold one of these letters.
 */
export interface Patch {
  dx: number
  dy: number
  rows: string[]
  outline?: boolean
  over?: string
}

export function applyPatch(frame: Grid, ox: number, oy: number, patch: Patch): void {
  const painted: [number, number][] = []
  patch.rows.forEach((line, py) => [...line].forEach((v, px) => {
    const x = ox + patch.dx + px
    const y = oy + patch.dy + py
    if (v === ' ' || x < 0 || y < 0 || x >= SIZE || y >= SIZE) return
    if (patch.over && !patch.over.includes(frame[y][x])) return
    frame[y][x] = v === '_' ? '.' : v
    if (v !== '_' && v !== '#') painted.push([x, y])
  }))
  if (patch.outline === false) return
  for (const [x, y] of painted) {
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) {
      if (nx >= 0 && ny >= 0 && nx < SIZE && ny < SIZE && isEmpty(frame[ny][nx])) frame[ny][nx] = '#'
    }
  }
}

