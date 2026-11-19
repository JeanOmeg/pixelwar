/* eslint-disable no-console -- report */
import { test } from 'vitest'
import { ARMY_BUDGET, armyCost, classCost } from '../../src/unit-classes'
import { UNIT_CLASSES, UnitClass } from '../../src/unit-types'
import { newAi, runMatch } from './match'
import { loadMap, mapFiles } from './map-loader'

/**
 * yarn balance:sim — are the class costs right in real matches?
 *
 * Random armies (any class in any slot, fitted to ARMY_BUDGET) play CPU x CPU
 * on every map. Both armies cost about the same, so what shows is how much a
 * class gives beyond what it costs:
 * - win% of the armies that field the class: 50% = priced right, above = too
 *   cheap, below = too expensive (about ±1.5% of noise with 2000 games);
 * - surplus: logistic regression on (blue count - red count) of each class,
 *   in log-odds per unit (only differences between classes mean something).
 * SIM_GAMES (env) = games per map (default 40), SIM_SEED = random seed.
 */
const GAMES = Number(process.env.SIM_GAMES ?? 40)
const SEED = Number(process.env.SIM_SEED ?? 1)

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/** Any class in any slot, at most `budget` points, spending as much as it can */
export function randomArmy(slots: number, budget: number, random: () => number): UnitClass[] {
  const pick = (list: readonly UnitClass[]) => list[Math.floor(random() * list.length)]
  const army = Array.from({ length: slots }, () => pick(UNIT_CLASSES))
  while (armyCost(army) > budget) {
    const slot = army.indexOf([...army].sort((a, b) => classCost(b) - classCost(a))[0])
    army[slot] = pick(UNIT_CLASSES.filter(c => classCost(c) < classCost(army[slot])))
  }
  for (let tries = 0; tries < slots * 6; tries++) {
    const slot = Math.floor(random() * slots)
    const left = budget - armyCost(army)
    const upgrades = UNIT_CLASSES.filter(c => classCost(c) > classCost(army[slot]) && classCost(c) - classCost(army[slot]) <= left)
    if (upgrades.length > 0) army[slot] = pick(upgrades)
  }
  return army
}

interface Sample { x: number[], y: number }

/** Logistic regression with a small L2 penalty, plain gradient descent */
function fit(samples: Sample[], dims: number): number[] {
  const w = new Array(dims).fill(0)
  const rate = 0.05
  const l2 = 0.001
  for (let epoch = 0; epoch < 4000; epoch++) {
    const grad = new Array(dims).fill(0)
    for (const { x, y } of samples) {
      const z = x.reduce((s, v, i) => s + v * w[i], 0)
      const p = 1 / (1 + Math.exp(-z))
      for (let i = 0; i < dims; i++) grad[i] += (p - y) * x[i]
    }
    for (let i = 0; i < dims; i++) w[i] -= rate * (grad[i] / samples.length + l2 * w[i])
  }
  return w
}

test('class worth against class cost', async () => {
  const random = mulberry32(SEED)
  const samples: Sample[] = []
  const appear = Object.fromEntries(UNIT_CLASSES.map(c => [c, { games: 0, wins: 0 }]))
  let draws = 0
  for (const file of mapFiles()) {
    const map = loadMap(file)
    const slots = map.spawns.filter(s => s.team === 0).length
    for (let game = 0; game < GAMES; game++) {
      const armies: [UnitClass[], UnitClass[]] = [randomArmy(slots, ARMY_BUDGET, random), randomArmy(slots, ARMY_BUDGET, random)]
      const result = await runMatch(map, [newAi('normal'), newAi('normal')], armies)
      const y = result.winner === null ? 0.5 : result.winner === 0 ? 1 : 0
      if (result.winner === null) draws++
      // last feature: blue side (first player) advantage
      const x = [...UNIT_CLASSES.map(c => armies[0].filter(u => u === c).length - armies[1].filter(u => u === c).length), 1]
      samples.push({ x, y })
      for (const team of [0, 1]) {
        for (const c of new Set(armies[team])) {
          appear[c].games++
          if (result.winner === team) appear[c].wins++
          else if (result.winner === null) appear[c].wins += 0.5
        }
      }
    }
  }

  const w = fit(samples, UNIT_CLASSES.length + 1)
  console.log(`${samples.length} games, ${draws} draws, first-player log-odds ${w[UNIT_CLASSES.length].toFixed(2)}`)
  console.log('class        cost  surplus  win% when fielded')
  UNIT_CLASSES.forEach((c, i) => {
    const won = appear[c].wins / Math.max(appear[c].games, 1)
    console.log(c.padEnd(12), String(classCost(c)).padStart(4), w[i].toFixed(2).padStart(8), `${(won * 100).toFixed(1)}%`.padStart(8), `(${appear[c].games} armies)`)
  })
})
