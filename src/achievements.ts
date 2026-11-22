import { t } from './i18n'
import { UNIT_CLASSES, type UnitClass } from './unit-types'
import { CLASS_STATS } from './class-stats'
import { armyCost } from './unit-classes'
import type { FeatRecord } from './match-stats'
import { type MatchSummary, type Records, classesWon, dailyStreak, mapsWon } from './records'

/**
 * Achievements: earned at the end of a match (TurnManager) from the match
 * summary and the records already updated with it. Shown on the game over
 * screen when unlocked and listed on the Records screen. Pure, except
 * `loadUnlocked`/`unlock` (localStorage).
 */

export const ACHIEVEMENT_IDS = [
  // first steps and victories
  'graduate', 'first-win', 'seasoned', 'veteran', 'legend', 'regular',
  // how a match was won
  'flawless', 'last-stand', 'close-call', 'comeback', 'blitz', 'hard-win', 'clean-sweep', 'storm',
  // feats in a match
  'one-shot', 'overkill', 'lucky', 'long-shot', 'grazed', 'counter-kill', 'long-reach', 'backstabber', 'silent-blade',
  'deadeye', 'scorched', 'pickpocket', 'field-medic', 'life-leech', 'pinned-down', 'thin-ice', 'sweep', 'rampage', 'iron-wall',
  // army
  'legion', 'mixed-company', 'marksmen', 'vanguard', 'frugal', 'every-class',
  // over many matches
  'slayer', 'warlord', 'devastator', 'every-map', 'hard-veteran', 'hard-every-map',
  'online-win', 'online-champion', 'daily-win', 'daily-streak', 'daily-regular', 'daily-devotee'
] as const
export type AchievementId = typeof ACHIEVEMENT_IDS[number]

/** Rounds of a fast victory (Blitz) */
export const BLITZ_ROUNDS = 10
/** Rounds of a fast victory on Hard (Eye of the storm) */
export const STORM_ROUNDS = 12
/** Back attacks in one turn (Backstabber) */
export const BACKSTABBER_ATTACKS = 3
/** Real critical hits in one match (Lucky star) */
export const LUCKY_CRITICALS = 4
/** Units behind before winning (Comeback) */
export const COMEBACK_DEFICIT = 3
/** HP left on the whole army when winning (Close call) */
export const CLOSE_CALL_HP = 5
/** Damage of one strike (Overkill) */
export const OVERKILL_DAMAGE = 15
/** MP stolen in one match (Pickpocket) */
export const PICKPOCKET_MP = 6
/** HP restored with Heal in one match (Field medic) */
export const FIELD_MEDIC_HP = 18
/** HP drained in one match (Life leech) */
export const LIFE_LEECH_HP = 12
/** Enemies pinned in one match (Pinned down) */
export const PINNED_DOWN_PINS = 3
/** Kills in one turn (Sweep) */
export const SWEEP_KILLS = 3
/** Kills of one unit in a match (Rampage) */
export const RAMPAGE_KILLS = 4
/** HP lost by one unit that survives (Iron wall) */
export const IRON_WALL_DAMAGE = 25
/** Cost of a cheap winning army (Frugal) */
export const FRUGAL_COST = 80
/** Victories (Seasoned, Veteran, Legend) */
export const SEASONED_WINS = 10
export const VETERAN_WINS = 25
export const LEGEND_WINS = 100
/** Matches played (Regular) */
export const REGULAR_MATCHES = 50
/** Enemies defeated over all matches (Slayer, Warlord) */
export const SLAYER_KILLS = 100
export const WARLORD_KILLS = 500
/** Damage dealt over all matches (Devastator) */
export const DEVASTATOR_DAMAGE = 3000
/** Victories on Hard (Hard veteran) */
export const HARD_VETERAN_WINS = 10
/** Online victories (Champion) */
export const ONLINE_CHAMPION_WINS = 5
/** Daily challenges won on consecutive days (Daily habit, Devotee) */
export const DAILY_STREAK_DAYS = 3
export const DAILY_DEVOTEE_DAYS = 7
/** Daily challenges won (Daily regular) */
export const DAILY_REGULAR_WINS = 10

/** Everything a check may look at: the match just played (null = none) and the records after it */
export interface AchievementContext {
  match: MatchSummary | null
  records: Records
  /** Date of today (daily streak) */
  today: string
  /** Number of maps (every map, every map on Hard) */
  mapCount: number
}

interface AchievementRule {
  earned: (context: AchievementContext) => boolean
  /** [done, goal] for the achievements that take many matches */
  progress?: (context: AchievementContext) => [number, number]
}

const won = ({ match }: AchievementContext) => match?.outcome === 'won'
const wonOnHard = (c: AchievementContext) => won(c) && c.match?.bucket === 'hard'

/** A feat of the match reaches `goal` (feats count in a defeat too) */
const feat = (key: keyof FeatRecord, goal = 1): AchievementRule => ({
  earned: c => (c.match?.feats[key] ?? 0) >= goal
})

/** Won with an army that passes `test` */
const wonWithArmy = (test: (army: UnitClass[]) => boolean): AchievementRule => ({
  earned: c => won(c) && !!c.match && c.match.army.length > 0 && test(c.match.army)
})

/** A total that keeps growing over the matches, with a progress bar */
const total = (value: (c: AchievementContext) => number, goal: number | ((c: AchievementContext) => number)): AchievementRule => {
  const goalOf = (c: AchievementContext) => typeof goal === 'number' ? goal : goal(c)
  return {
    earned: c => value(c) >= goalOf(c),
    progress: c => [Math.min(value(c), goalOf(c)), goalOf(c)]
  }
}

const ranged = (unitClass: UnitClass) => CLASS_STATS[unitClass].range >= 2
const dailyWins = (records: Records) => Object.values(records.daily).filter(result => result.won).length

const RULES: Record<AchievementId, AchievementRule> = {
  // unlocked by the tutorial itself (TurnManager), never by a check
  graduate: { earned: () => false },
  'first-win': { earned: won },
  seasoned: total(c => c.records.total.won, SEASONED_WINS),
  veteran: total(c => c.records.total.won, VETERAN_WINS),
  legend: total(c => c.records.total.won, LEGEND_WINS),
  regular: total(c => c.records.total.played, REGULAR_MATCHES),

  flawless: { earned: c => won(c) && c.match?.lost === 0 },
  'last-stand': { earned: c => won(c) && c.match?.survivors === 1 },
  'close-call': { earned: c => won(c) && (c.match?.survivorHp ?? Infinity) <= CLOSE_CALL_HP },
  comeback: { earned: c => won(c) && (c.match?.feats.maxDeficit ?? 0) >= COMEBACK_DEFICIT },
  blitz: { earned: c => won(c) && (c.match?.rounds ?? Infinity) <= BLITZ_ROUNDS },
  'hard-win': { earned: wonOnHard },
  'clean-sweep': { earned: c => wonOnHard(c) && c.match?.lost === 0 },
  storm: { earned: c => wonOnHard(c) && (c.match?.rounds ?? Infinity) <= STORM_ROUNDS },

  'one-shot': feat('oneShots'),
  overkill: feat('biggestStrike', OVERKILL_DAMAGE),
  lucky: feat('criticals', LUCKY_CRITICALS),
  'long-shot': feat('longShots'),
  grazed: feat('missKills'),
  'counter-kill': feat('counterKills'),
  'long-reach': feat('reachCounterKills'),
  backstabber: feat('backAttacksInPhase', BACKSTABBER_ATTACKS),
  'silent-blade': feat('backstabKills'),
  deadeye: feat('farKills'),
  scorched: feat('burnKills'),
  pickpocket: feat('mpStolen', PICKPOCKET_MP),
  'field-medic': feat('healed', FIELD_MEDIC_HP),
  'life-leech': feat('drained', LIFE_LEECH_HP),
  'pinned-down': feat('pins', PINNED_DOWN_PINS),
  'thin-ice': feat('iceKills'),
  sweep: feat('killsInPhase', SWEEP_KILLS),
  rampage: feat('bestUnitKills', RAMPAGE_KILLS),
  'iron-wall': feat('toughest', IRON_WALL_DAMAGE),

  legion: wonWithArmy(army => new Set(army).size === 1),
  'mixed-company': wonWithArmy(army => new Set(army).size === army.length),
  marksmen: wonWithArmy(army => army.every(ranged)),
  vanguard: wonWithArmy(army => !army.some(ranged)),
  frugal: wonWithArmy(army => armyCost(army) <= FRUGAL_COST),
  'every-class': total(c => classesWon(c.records).length, UNIT_CLASSES.length),

  slayer: total(c => c.records.kills, SLAYER_KILLS),
  warlord: total(c => c.records.kills, WARLORD_KILLS),
  devastator: total(c => c.records.damage, DEVASTATOR_DAMAGE),
  'every-map': total(c => mapsWon(c.records).length, c => c.mapCount),
  'hard-veteran': total(c => c.records.byBucket.hard?.won ?? 0, HARD_VETERAN_WINS),
  'hard-every-map': total(c => c.records.hardMaps.length, c => c.mapCount),
  'online-win': { earned: c => won(c) && c.match?.bucket === 'online' },
  'online-champion': total(c => c.records.byBucket.online?.won ?? 0, ONLINE_CHAMPION_WINS),
  'daily-win': { earned: c => won(c) && !!c.match?.daily },
  'daily-streak': total(c => dailyStreak(c.records, c.today), DAILY_STREAK_DAYS),
  'daily-regular': total(c => dailyWins(c.records), DAILY_REGULAR_WINS),
  'daily-devotee': total(c => dailyStreak(c.records, c.today), DAILY_DEVOTEE_DAYS)
}

/** Achievements the context earns that aren't in `unlocked` yet, in list order */
export function newAchievements(context: AchievementContext, unlocked: Partial<Record<AchievementId, string>>): AchievementId[] {
  return ACHIEVEMENT_IDS.filter(id => !unlocked[id] && RULES[id].earned(context))
}

export function achievementProgress(id: AchievementId, context: AchievementContext): [number, number] | null {
  return RULES[id].progress?.(context) ?? null
}

/** Name and description in the current language */
export function achievementText(id: AchievementId): { name: string, description: string } {
  return t().achievements[id]
}

const PREF_ACHIEVEMENTS = 'pixelfantasywar.achievements'

/** Unlocked achievements and the date of each (YYYY-MM-DD) */
export function loadUnlocked(): Partial<Record<AchievementId, string>> {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PREF_ACHIEVEMENTS) ?? '{}')
    const out: Partial<Record<AchievementId, string>> = {}
    if (saved && typeof saved === 'object') {
      for (const id of ACHIEVEMENT_IDS) {
        const date = (saved as Record<string, unknown>)[id]
        if (typeof date === 'string') out[id] = date
      }
    }
    return out
  } catch {
    return {}
  }
}

/** Marks the achievements as unlocked today; returns the ones that weren't yet */
export function unlock(ids: AchievementId[], today: string): AchievementId[] {
  const unlocked = loadUnlocked()
  const fresh = ids.filter(id => !unlocked[id])
  if (fresh.length === 0) return []
  for (const id of fresh) unlocked[id] = today
  try { localStorage.setItem(PREF_ACHIEVEMENTS, JSON.stringify(unlocked)) } catch { /* storage unavailable */ }
  return fresh
}
