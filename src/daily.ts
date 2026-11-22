import type { Difficulty } from './ai/weights'
import { buildCpuArmy } from './army-ai'
import { ARMY_BUDGET } from './unit-classes'
import type { UnitClass } from './unit-types'
import type { MatchSettings } from './game-modes'

/**
 * Daily challenge: the date (local, YYYY-MM-DD) seeds the draw of the map and
 * of both armies, so everybody plays the same match that day. The player is
 * Blue against the CPU on DAILY_DIFFICULTY, positions are the map's. Pure.
 */

export const DAILY_DIFFICULTY: Difficulty = 'hard'

/** Local date as YYYY-MM-DD */
export function todayKey(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/** Deterministic random numbers in [0, 1) from a text seed (FNV-1a + mulberry32) */
export function seededRandom(seed: string): () => number {
  let state = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    state ^= seed.charCodeAt(i)
    state = Math.imul(state, 0x01000193)
  }
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let x = Math.imul(state ^ (state >>> 15), 1 | state)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

/** A map the challenge can draw: its id and the army it draws for each team */
export interface DailyMapOption {
  id: string
  classic: [UnitClass[], UnitClass[]]
}

export interface DailyChallenge {
  date: string
  mapId: string
  /** [Blue (the player), Red (the CPU)] */
  armies: [UnitClass[], UnitClass[]]
  difficulty: Difficulty
}

/** The challenge of `date`: same date and map list, same challenge */
export function dailyChallenge(date: string, maps: DailyMapOption[]): DailyChallenge {
  const random = seededRandom(`pixelfantasywar-daily-${date}`)
  const map = maps[Math.floor(random() * maps.length)]
  const armies = map.classic.map(classic => buildCpuArmy(classic, ARMY_BUDGET, random)) as [UnitClass[], UnitClass[]]
  return { date, mapId: map.id, armies, difficulty: DAILY_DIFFICULTY }
}

export function dailySettings(challenge: DailyChallenge): MatchSettings {
  return { mode: 'daily', armies: challenge.armies, placements: [null, null], difficulty: challenge.difficulty, daily: challenge.date }
}
