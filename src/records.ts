import type { Difficulty } from './ai/weights'
import type { FeatRecord } from './match-stats'
import { UNIT_CLASSES, type UnitClass } from './unit-types'

/**
 * Local records (Records screen): wins, losses and draws per map, difficulty
 * and class, plus the daily challenge results. Only matches with exactly one
 * player on this device count (vs CPU, online, daily challenge). Pure, except
 * `loadRecords`/`saveRecords` (localStorage).
 */

/** Difficulty of the CPU, or online (a person on the other side) */
export type RecordBucket = Difficulty | 'online'
export const RECORD_BUCKETS: RecordBucket[] = ['easy', 'normal', 'hard', 'online']

export type MatchOutcome = 'won' | 'lost' | 'drawn'

export interface Tally {
  played: number
  won: number
  lost: number
  drawn: number
}

/** Best attempt at one day's challenge */
export interface DailyResult {
  won: boolean
  rounds: number
  /** Own units lost */
  lost: number
}

export interface Records {
  total: Tally
  byMap: Record<string, Tally>
  byBucket: Partial<Record<RecordBucket, Tally>>
  /** Matches where the class was in the player's army */
  byClass: Partial<Record<UnitClass, Tally>>
  /** Map ids won on Hard */
  hardMaps: string[]
  kills: number
  damage: number
  /** Fewest rounds of a victory */
  fastestWin: number | null
  /** Daily challenge: best result per date (YYYY-MM-DD) */
  daily: Record<string, DailyResult>
}

/** One finished match, from the point of view of the player on this device */
export interface MatchSummary {
  bucket: RecordBucket
  mapId: string
  outcome: MatchOutcome
  rounds: number
  /** Classes of the player's army at the start */
  army: UnitClass[]
  /** Own units lost / still alive at the end */
  lost: number
  survivors: number
  /** HP of the own units still alive at the end, added up */
  survivorHp: number
  kills: number
  damage: number
  feats: FeatRecord
  /** Daily challenge date, when it was one */
  daily?: string
}

export const emptyTally = (): Tally => ({ played: 0, won: 0, lost: 0, drawn: 0 })

export function emptyRecords(): Records {
  return { total: emptyTally(), byMap: {}, byBucket: {}, byClass: {}, hardMaps: [], kills: 0, damage: 0, fastestWin: null, daily: {} }
}

function count(tally: Tally | undefined, outcome: MatchOutcome): Tally {
  const next = { ...(tally ?? emptyTally()) }
  next.played++
  next[outcome]++
  return next
}

/** Is `next` a better daily attempt than `best`: a win, then fewer rounds, then fewer losses */
export function betterDaily(next: DailyResult, best: DailyResult | undefined): boolean {
  if (!best) return true
  if (next.won !== best.won) return next.won
  if (next.rounds !== best.rounds) return next.won ? next.rounds < best.rounds : next.rounds > best.rounds
  return next.lost < best.lost
}

/** The records with one more match (a new object; `records` is left as is) */
export function addMatch(records: Records, match: MatchSummary): Records {
  const won = match.outcome === 'won'
  const next: Records = {
    ...records,
    total: count(records.total, match.outcome),
    byMap: { ...records.byMap, [match.mapId]: count(records.byMap[match.mapId], match.outcome) },
    byBucket: { ...records.byBucket, [match.bucket]: count(records.byBucket[match.bucket], match.outcome) },
    byClass: { ...records.byClass },
    hardMaps: won && match.bucket === 'hard' && !records.hardMaps.includes(match.mapId) ? [...records.hardMaps, match.mapId] : records.hardMaps,
    kills: records.kills + match.kills,
    damage: records.damage + match.damage,
    fastestWin: won && (records.fastestWin === null || match.rounds < records.fastestWin) ? match.rounds : records.fastestWin,
    daily: records.daily
  }
  // a class counts once per match, however many of it the army had
  for (const unitClass of new Set(match.army)) next.byClass[unitClass] = count(records.byClass[unitClass], match.outcome)
  if (match.daily) {
    const result: DailyResult = { won, rounds: match.rounds, lost: match.lost }
    if (betterDaily(result, records.daily[match.daily])) next.daily = { ...records.daily, [match.daily]: result }
  }
  return next
}

/** The day before `date` (YYYY-MM-DD), in the same format */
export function previousDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d - 1))
  return day.toISOString().slice(0, 10)
}

/**
 * Daily challenges won on consecutive days, up to `today` (or up to
 * yesterday, while today's isn't won yet: the streak is still alive)
 */
export function dailyStreak(records: Records, today: string): number {
  let day = records.daily[today]?.won ? today : previousDay(today)
  let streak = 0
  while (records.daily[day]?.won) {
    streak++
    day = previousDay(day)
  }
  return streak
}

/** Classes the player has won with at least once */
export function classesWon(records: Records): UnitClass[] {
  return UNIT_CLASSES.filter(c => (records.byClass[c]?.won ?? 0) > 0)
}

/** Map ids won at least once */
export function mapsWon(records: Records): string[] {
  return Object.keys(records.byMap).filter(id => records.byMap[id].won > 0)
}

const PREF_RECORDS = 'pixelfantasywar.records'

function isTally(value: unknown): value is Tally {
  const t = value as Tally
  return !!t && typeof t === 'object' && [t.played, t.won, t.lost, t.drawn].every(n => Number.isInteger(n) && n >= 0)
}

/** Saved records, with anything malformed dropped (never throws) */
export function loadRecords(): Records {
  let saved: Partial<Records>
  try {
    saved = JSON.parse(localStorage.getItem(PREF_RECORDS) ?? '{}') as Partial<Records>
  } catch {
    return emptyRecords()
  }
  if (!saved || typeof saved !== 'object') return emptyRecords()
  const tallies = <K extends string>(value: unknown): Partial<Record<K, Tally>> => {
    const out: Partial<Record<K, Tally>> = {}
    if (value && typeof value === 'object') {
      for (const [key, tally] of Object.entries(value)) if (isTally(tally)) out[key as K] = tally
    }
    return out
  }
  const daily: Record<string, DailyResult> = {}
  if (saved.daily && typeof saved.daily === 'object') {
    for (const [date, result] of Object.entries(saved.daily)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(date) && result && typeof result.won === 'boolean' && Number.isInteger(result.rounds) && Number.isInteger(result.lost)) daily[date] = result
    }
  }
  const number = (value: unknown) => Number.isFinite(value) && (value as number) >= 0 ? value as number : 0
  return {
    total: isTally(saved.total) ? saved.total : emptyTally(),
    byMap: tallies<string>(saved.byMap) as Record<string, Tally>,
    byBucket: tallies<RecordBucket>(saved.byBucket),
    byClass: tallies<UnitClass>(saved.byClass),
    hardMaps: Array.isArray(saved.hardMaps) ? saved.hardMaps.filter(id => typeof id === 'string') : [],
    kills: number(saved.kills),
    damage: number(saved.damage),
    fastestWin: Number.isInteger(saved.fastestWin) && (saved.fastestWin as number) > 0 ? saved.fastestWin as number : null,
    daily
  }
}

export function saveRecords(records: Records) {
  try { localStorage.setItem(PREF_RECORDS, JSON.stringify(records)) } catch { /* storage unavailable */ }
}
