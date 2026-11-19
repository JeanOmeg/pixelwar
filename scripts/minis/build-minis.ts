/* eslint-disable no-console -- command line tool */
// yarn minis: rebuilds the spritesheets of the 6 newer classes (both teams) from the
// original minis they are based on. Each recipe recolors the sheet, finds the head
// in every frame (template match, so it follows bobbing, attacks and death) and
// draws hand-made pieces over it (helmet, hood, horns...) with the art's outline.
// The original minis are never touched.
import { join } from 'path'
import {
  BASE_PALETTE, COLS, Grid, Palette, Patch, ROWS, Template,
  applyPatch, cloneGrid, cutTemplate, findTemplate, readSheet, recolor, recolorMatch, regions, writeSheet
} from './sheet'

const MINIS = join(__dirname, '..', '..', 'src', 'assets', 'minis')

/** Where to cut a template from the base sheet: frame (row, col) and box. Only `keep` letters */
interface TemplateSpec { row: number, col: number, box: [number, number, number, number], keep?: string }

interface Recipe {
  name: string
  base: string
  /** Extra colors (letters not in BASE_PALETTE), team pairs as [A, B] */
  colors: Palette
  /** Recolor of the whole sheet, applied outside the head */
  body: Record<string, string>
  /** Minimum share of a head template that must match (default 0.6) */
  minScore?: number
  /** Head templates of the base class, by view */
  heads: Record<string, TemplateSpec>
  /** Recolor of the head pixels, by view ('*' = every view) */
  head: Record<string, Record<string, string>>
  /** Pieces drawn relative to the head, by view */
  patches: Record<string, Patch[]>
  /** First step (before any recolor), e.g. to repaint the weapon */
  prepare?: (frame: Grid) => void
}

const HEAD_KEEP = '#hsw'

// ------------------------------------------------------------------ recipes

// Steel shared by the armored classes: light, mid, dark
const STEEL = { m: 'd5dbe6', M: '949db0', k: '5c6478' }
const GOLD = { Y: 'fff000', y: 'c99a1e' }

const FIGHTER_HEADS: Record<string, TemplateSpec> = {
  side: { row: 0, col: 0, box: [12, 9, 18, 13] },
  front: { row: 5, col: 0, box: [13, 9, 19, 13] },
  back: { row: 10, col: 0, box: [12, 9, 18, 12] },
  deadSide: { row: 3, col: 1, box: [16, 16, 23, 23] },
  deadFront: { row: 8, col: 1, box: [13, 18, 20, 24] },
  deadBack: { row: 13, col: 1, box: [11, 13, 17, 17] }
}

const PALADIN: Recipe = {
  name: 'Paladin',
  base: 'Fighter',
  colors: { ...STEEL, ...GOLD, a: ['c4cbe8', 'e8c8cc'], P: ['4f6dff', 'ff4545'] },
  body: { w: 'y', L: 'a' },
  heads: FIGHTER_HEADS,
  head: { '*': { h: 'M' } },
  patches: {
    // template rows (origin = box corner):
    // ######.   .##hh##   .hhhhs#   .hhhs##   ..##ww#
    side: [{ dx: 0, dy: 0, rows: [
      '       ',
      '   mm  ',
      ' mMMMs ',
      ' kMMs  '
    ] }, { dx: 1, dy: -2, rows: ['PP  ', ' PP '] }],
    // .#####.   ##hhh##   #hhhhh#   #h#s#h#   w.wwwh.
    front: [{ dx: 0, dy: 0, rows: [
      '       ',
      '  mmm  ',
      ' MMYMM ',
      ' M   M '
    ] }, { dx: 3, dy: -2, rows: ['P', 'P'] }],
    // .####..   ##hh##.   .hhhh##   D#hhhDh
    back: [{ dx: 0, dy: 0, rows: [
      '       ',
      '  mm   ',
      ' MMMM  ',
      '  kkk k'
    ] }, { dx: 2, dy: -2, rows: ['P ', 'PP'] }]
  }
}

/** Repaints weapons (white edge + team light blade): small groups are the weapon, big ones the swing */
function paintWeapons(frame: Grid, weapon: Record<string, string>, swing: Record<string, string>, swingSize = 40): void {
  for (const group of regions(frame, 'W', 'WL')) {
    const map = group.length >= swingSize ? swing : weapon
    for (const [x, y] of group) frame[y][x] = map[frame[y][x]] ?? frame[y][x]
  }
}

const HORN_OVER = '.,#'

const BERSERKER: Recipe = {
  name: 'Berserker',
  base: 'Barbarian',
  colors: {
    ...STEEL,
    R: 'c4532b', // red hair
    n: 'e8ad78', // tanned skin
    v: 'b0703f',
    B: 'f2ead2', // horn
    b: 'b9aa82',
    o: 'ffd36b', // swing: hot core and orange edge
    O: 'f27a24'
  },
  prepare: frame => paintWeapons(frame, { L: 'M' }, { W: 'o', L: 'O' }),
  body: { s: 'n', w: 'v' },
  heads: {
    side: { row: 0, col: 0, box: [14, 9, 19, 13] },
    front: { row: 5, col: 0, box: [13, 9, 20, 13] },
    back: { row: 10, col: 0, box: [11, 9, 17, 12] },
    deadSide: { row: 3, col: 1, box: [17, 14, 23, 22] },
    deadFront: { row: 8, col: 1, box: [13, 19, 21, 23] },
    deadBack: { row: 13, col: 1, box: [10, 13, 18, 18] },
    deadBack2: { row: 13, col: 2, box: [9, 13, 17, 17] }
  },
  head: { '*': { h: 'R', s: 'n', w: 'v' } },
  // horns curve out of the head; the axe stays in front of them (over)
  patches: {
    side: [{ dx: -2, dy: -3, over: HORN_OVER, rows: [
      'B      B',
      'Bb    bB',
      ' bb  bb '
    ] }],
    front: [{ dx: -2, dy: -2, over: HORN_OVER, rows: [
      'B         B',
      'Bb       bB',
      ' bb     bb '
    ] }],
    back: [{ dx: -1, dy: -2, over: HORN_OVER, rows: [
      'B        B',
      'Bb      bB',
      ' bb    bb '
    ] }]
  }
}

// Dark cloak that still reads as the team, mask and scarf in the bright team color
const ASSASSIN: Recipe = {
  name: 'Assassin',
  base: 'Thief',
  colors: {
    K: ['282b52', '522628'], // cloak
    N: ['454c8f', '8f454a'], // cloak light
    P: ['5c80ff', 'ff4848'], // scarf
    p: 'e4d0ff', // violet blade
    q: '9b5df0'
  },
  prepare: frame => paintWeapons(frame, { W: 'p' }, { W: 'p', L: 'q' }),
  body: { D: 'K', L: 'N' },
  minScore: 0.7,
  heads: {
    side: { row: 0, col: 0, box: [13, 9, 20, 13], keep: '#LDsw' },
    front: { row: 5, col: 0, box: [12, 9, 20, 14], keep: '#LDsw' },
    back: { row: 10, col: 0, box: [13, 9, 20, 13], keep: '#LDw' }
  },
  head: { '*': { D: 'K', L: 'N' } },
  patches: {
    // ######   #LLLD##   #LLDDs#   ##DDs##   ####ww###
    side: [
      { dx: 4, dy: 3, outline: false, rows: ['P', 'PP'] },
      { dx: -3, dy: 3, over: '.,', rows: ['  P', ' PP', 'P  '] }
    ],
    // ..####.   ..#LL##   ..#DLL#   .##sss##   ##D#s#D##   #sswwwDL#
    front: [{ dx: 3, dy: 5, outline: false, rows: ['PPP'] }]
  }
}

// Green hood and a forest-green cloak (its shadows keep the team color); bow as the Archer
const RANGER: Recipe = {
  name: 'Ranger',
  base: 'Archer',
  colors: {
    G: '2f6b35', // hood
    g: '5ea84a'
  },
  body: { L: 'g' },
  minScore: 0.75,
  heads: {
    side: { row: 0, col: 0, box: [13, 9, 19, 12], keep: '#LDs' },
    front: { row: 5, col: 0, box: [13, 9, 20, 13], keep: '#LDs' },
    back: { row: 10, col: 0, box: [13, 9, 18, 12], keep: '#LD' }
  },
  head: { '*': { D: 'G', L: 'g' } },
  patches: {}
}

// Hood instead of the pointed hat, pale face with glowing eyes, bone staff, green magic.
// The death frames keep the hat shape (only recolored): the head is too turned to match
const NECROMANCER: Recipe = {
  name: 'Necromancer',
  base: 'Mage',
  colors: {
    K: ['1d1d6b', '6b1d1d'], // robe
    J: ['0000c0', 'a61414'], // hood light (team dark)
    X: '120f24', // shadow inside the hood
    z: 'c3cbb0', // pale skin
    E: '7dff8a', // eyes and magic
    e: '2fb35a',
    B: 'e6dfc8' // bone
  },
  prepare: frame => paintWeapons(frame, { W: 'B' }, { W: 'E', L: 'e' }),
  body: { D: 'K', L: 'D', s: 'z' },
  minScore: 0.75,
  heads: {
    side: { row: 0, col: 0, box: [11, 7, 19, 12], keep: '#LDs' },
    sideLean: { row: 1, col: 2, box: [12, 7, 20, 12], keep: '#LDs' },
    front: { row: 5, col: 0, box: [11, 7, 19, 13], keep: '#LDs' },
    back: { row: 10, col: 0, box: [12, 8, 21, 12], keep: '#LD' }
  },
  head: { '*': { D: 'K', L: 'D', s: 'z' } },
  patches: {
    // ..###....   ..#L##...   .##LL####   ##DLLDL##   #LLDss###   ###ss####
    side: [{ dx: 0, dy: 0, rows: [
      '  ___',
      '  ####',
      ' #JJJK#',
      '#JKKKKK#',
      '#KKXzE#',
      '##Xzz#'
    ] }],
    // walking: the hat leans back, so its tip has to go too
    sideLean: [{ dx: 0, dy: 0, rows: [
      '  ___',
      '  ####__',
      ' #JJJK#_',
      '#JKKKKK#',
      '#KKXzE#',
      '##Xzz#'
    ] }],
    front: [{ dx: -1, dy: 0, rows: [
      '   ___',
      '   #####',
      '  #JJJJJ#',
      ' #JKKKKKK#',
      ' #KXzzzXK#',
      '_#KXEzEXK#'
    ] }],
    back: [{ dx: 0, dy: 0, rows: [
      '    ___',
      '  ######',
      ' #JJJJJJ#',
      ' #JKKKKK#',
      ' #KKKKXX#'
    ] }]
  }
}

/**
 * Spear: wooden shaft and steel head. The hand splits the spear in pieces, so the
 * head is found once per frame: the end of a piece with the most spear pixels
 * around it (the blade is wider than the shaft). The swing (big group) is kept.
 */
function paintSpear(frame: Grid): void {
  const pieces = regions(frame, 'W', 'WL').filter(g => g.length < 40)
  const spear = pieces.flat()
  if (!spear.length) return
  const around = ([x, y]: [number, number]) =>
    spear.filter(([sx, sy]) => (sx - x) ** 2 + (sy - y) ** 2 <= 6).length
  let tip = spear[0]
  let best = -1
  for (const piece of pieces) {
    // ends of the piece: its two most distant pixels
    let ends: [number, number][] = [piece[0], piece[0]]
    let far = -1
    for (const a of piece) {
      for (const b of piece) {
        const d = (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
        if (d > far) { far = d; ends = [a, b] }
      }
    }
    for (const end of ends) {
      const score = around(end) - end[1] / 100 // tie: the higher end
      if (score > best) { best = score; tip = end }
    }
  }
  for (const [x, y] of spear) {
    const d = Math.hypot(x - tip[0], y - tip[1])
    if (d > 3.2) frame[y][x] = 'w'
    else if (d > 1.5) frame[y][x] = frame[y][x] === 'W' ? 'm' : 'M'
  }
}

// Kettle hat (steel with a wide brim) and a polearm with a wooden shaft
const HALBERDIER: Recipe = {
  name: 'Halberdier',
  base: 'Spearman',
  colors: { ...STEEL },
  prepare: paintSpear,
  body: {},
  heads: {
    side: { row: 0, col: 0, box: [12, 9, 18, 13] },
    front: { row: 5, col: 0, box: [13, 9, 19, 13] },
    back: { row: 10, col: 0, box: [12, 9, 18, 12] },
    // back attack: the head is behind the swing, only the hair shows
    backSwing: { row: 12, col: 1, box: [12, 9, 18, 12], keep: '#h' }
  },
  head: {},
  patches: {
    side: [{ dx: 1, dy: -1, rows: [
      ' ####',
      '#mmmm#',
      'MMMMMMM'
    ] }],
    front: [{ dx: 0, dy: -1, rows: [
      '  ###',
      ' #mmm#',
      'MMMMMMM'
    ] }],
    back: [{ dx: 0, dy: -1, rows: [
      ' ####',
      '#mmmm#',
      'MMMMMM'
    ] }],
    backSwing: [{ dx: 0, dy: -1, over: '.,#hLD', rows: [
      ' ####',
      '#mmmm#',
      'MMMMMM'
    ] }]
  }
}

const RECIPES: Recipe[] = [PALADIN, BERSERKER, ASSASSIN, RANGER, NECROMANCER, HALBERDIER]

// ------------------------------------------------------------------- build

function build(recipe: Recipe): void {
  const base = readSheet(join(MINIS, `${recipe.base}A.png`))
  const templates: Template[] = Object.entries(recipe.heads).map(([view, s]) =>
    cutTemplate(view, base[s.row][s.col], ...s.box, s.keep ?? HEAD_KEEP))
  const report: string[] = []
  const frames = base.map((line, row) => line.map((source, col) => {
    const frame = cloneGrid(source)
    if (frame.every(r => r.every(v => v === '.'))) return frame
    const match = findTemplate(source, templates, recipe.minScore ?? 0.6)
    report.push(match ? `${row},${col}:${match.template.name}` : `${row},${col}:-`)
    const inHead = (x: number, y: number) => !!match &&
      match.template.cells[y - match.y]?.[x - match.x] !== undefined &&
      match.template.cells[y - match.y][x - match.x] !== '.'
    recipe.prepare?.(frame)
    recolor(frame, recipe.body, inHead)
    if (match) {
      const view = match.template.name
      recolorMatch(frame, match, { ...recipe.head['*'], ...recipe.head[view] })
      for (const patch of recipe.patches[view] ?? []) applyPatch(frame, match.x, match.y, patch)
    }
    return frame
  }))
  if (frames.length !== ROWS || frames[0].length !== COLS) throw new Error('bad sheet size')
  const palette = { ...BASE_PALETTE, ...recipe.colors }
  writeSheet(join(MINIS, `${recipe.name}A.png`), frames, palette, 'A')
  writeSheet(join(MINIS, `${recipe.name}B.png`), frames, palette, 'B')
  const missing = report.filter(r => r.endsWith(':-'))
  console.log(`${recipe.name}: ${report.length} frames${missing.length ? `, head not found in ${missing.map(r => r.slice(0, -2)).join(' ')}` : ''}`)
}

const only = process.argv[2]
for (const recipe of RECIPES) if (!only || recipe.name === only) build(recipe)
