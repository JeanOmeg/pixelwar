import { t } from './i18n'
import { UNIT_CLASSES } from './unit-types'
import { type MatchSummary, type Records, classesWon, dailyStreak, mapsWon } from './records'

/**
 * Achievements: earned at the end of a match (TurnManager) from the match
 * summary and the records already updated with it. Shown on the game over
 * screen when unlocked and listed on the Records screen. Pure, except
 * `loadUnlocked`/`unlock` (localStorage).
 */

export const ACHIEVEMENT_IDS = [
  'graduate', 'first-win', 'flawless', 'last-stand', 'blitz', 'backstabber', 'lucky', 'one-shot',
  'counter-kill', 'hard-win', 'every-map', 'hard-every-map', 'every-class', 'veteran', 'online-win',
  'daily-win', 'daily-streak'
] as const
export type AchievementId = typeof ACHIEVEMENT_IDS[number]

/** Rounds of a fast victory (Blitz) */
export const BLITZ_ROUNDS = 10
/** Back attacks in one turn (Backstabber) */
export const BACKSTABBER_ATTACKS = 3
/** Real critical hits in one match (Lucky star) */
export const LUCKY_CRITICALS = 4
/** Victories (Veteran) */
export const VETERAN_WINS = 25
/** Daily challenges won on consecutive days (Daily habit) */
export const DAILY_STREAK_DAYS = 3

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

const RULES: Record<AchievementId, AchievementRule> = {
  // unlocked by the tutorial itself (TurnManager), never by a check
  graduate: { earned: () => false },
  'first-win': { earned: won },
  flawless: { earned: c => won(c) && c.match?.lost === 0 },
  'last-stand': { earned: c => won(c) && c.match?.survivors === 1 },
  blitz: { earned: c => won(c) && (c.match?.rounds ?? Infinity) <= BLITZ_ROUNDS },
  backstabber: { earned: c => (c.match?.feats.backAttacksInPhase ?? 0) >= BACKSTABBER_ATTACKS },
  lucky: { earned: c => (c.match?.feats.criticals ?? 0) >= LUCKY_CRITICALS },
  'one-shot': { earned: c => (c.match?.feats.oneShots ?? 0) > 0 },
  'counter-kill': { earned: c => (c.match?.feats.counterKills ?? 0) > 0 },
  'hard-win': { earned: c => won(c) && c.match?.bucket === 'hard' },
  'every-map': {
    earned: c => mapsWon(c.records).length >= c.mapCount,
    progress: c => [Math.min(mapsWon(c.records).length, c.mapCount), c.mapCount]
  },
  'hard-every-map': {
    earned: c => c.records.hardMaps.length >= c.mapCount,
    progress: c => [Math.min(c.records.hardMaps.length, c.mapCount), c.mapCount]
  },
  'every-class': {
    earned: c => classesWon(c.records).length >= UNIT_CLASSES.length,
    progress: c => [classesWon(c.records).length, UNIT_CLASSES.length]
  },
  veteran: {
    earned: c => c.records.total.won >= VETERAN_WINS,
    progress: c => [Math.min(c.records.total.won, VETERAN_WINS), VETERAN_WINS]
  },
  'online-win': { earned: c => won(c) && c.match?.bucket === 'online' },
  'daily-win': { earned: c => won(c) && !!c.match?.daily },
  'daily-streak': {
    earned: c => dailyStreak(c.records, c.today) >= DAILY_STREAK_DAYS,
    progress: c => [Math.min(dailyStreak(c.records, c.today), DAILY_STREAK_DAYS), DAILY_STREAK_DAYS]
  }
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
