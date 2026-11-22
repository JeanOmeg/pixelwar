// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from 'vitest'
import { type MatchSummary, addMatch, betterDaily, dailyStreak, emptyRecords, loadRecords, previousDay, saveRecords } from '../src/records'
import { ACHIEVEMENT_IDS, type AchievementContext, achievementProgress, loadUnlocked, newAchievements, unlock } from '../src/achievements'
import { dailyChallenge, dailySettings, seededRandom, todayKey } from '../src/daily'
import { MatchStats } from '../src/match-stats'
import { fixedRolls } from '../src/unit'
import { roleOf } from '../src/army-ai'
import { ARMY_BUDGET, armyCost } from '../src/unit-classes'
import { UNIT_CLASSES, type UnitClass } from '../src/unit-types'
import { en } from '../src/i18n/en'
import { makeBoard, makePlayers, place } from './helpers'

const noFeats = { criticals: 0, backAttacksInPhase: 0, counterKills: 0, oneShots: 0 }

function match(overrides: Partial<MatchSummary> = {}): MatchSummary {
  return {
    bucket: 'normal', mapId: 'twin-keeps', outcome: 'won', rounds: 15, army: ['Archer', 'Archer', 'Warrior'],
    lost: 2, survivors: 3, kills: 5, damage: 60, feats: noFeats, ...overrides
  }
}

const context = (m: MatchSummary | null, records = addMatch(emptyRecords(), m ?? match()), today = '2026-11-22'): AchievementContext =>
  ({ match: m, records, today, mapCount: 12 })

beforeEach(() => localStorage.clear())

describe('records', () => {
  test('counts the match per map, difficulty and class (each class once)', () => {
    let records = addMatch(emptyRecords(), match())
    records = addMatch(records, match({ outcome: 'lost', bucket: 'hard', mapId: 'greenwood', army: ['Thief'] }))
    records = addMatch(records, match({ outcome: 'drawn', rounds: 50 }))
    expect(records.total).toEqual({ played: 3, won: 1, lost: 1, drawn: 1 })
    expect(records.byMap['twin-keeps']).toEqual({ played: 2, won: 1, lost: 0, drawn: 1 })
    expect(records.byBucket.hard).toEqual({ played: 1, won: 0, lost: 1, drawn: 0 })
    expect(records.byClass.Archer).toEqual({ played: 2, won: 1, lost: 0, drawn: 1 })
    expect(records.byClass.Thief?.lost).toBe(1)
    expect(records.kills).toBe(15)
    expect(records.fastestWin).toBe(15)
    expect(records.hardMaps).toEqual([])
    records = addMatch(records, match({ bucket: 'hard', rounds: 9 }))
    expect(records.hardMaps).toEqual(['twin-keeps'])
    expect(records.fastestWin).toBe(9)
  })

  test('addMatch leaves the old records untouched', () => {
    const before = emptyRecords()
    addMatch(before, match({ daily: '2026-11-22' }))
    expect(before).toEqual(emptyRecords())
  })

  test('daily: keeps the best attempt of the day', () => {
    expect(betterDaily({ won: true, rounds: 20, lost: 3 }, { won: false, rounds: 5, lost: 0 })).toBe(true)
    expect(betterDaily({ won: true, rounds: 12, lost: 3 }, { won: true, rounds: 14, lost: 0 })).toBe(true)
    expect(betterDaily({ won: true, rounds: 12, lost: 1 }, { won: true, rounds: 12, lost: 2 })).toBe(true)
    expect(betterDaily({ won: false, rounds: 30, lost: 6 }, { won: true, rounds: 30, lost: 1 })).toBe(false)
    let records = addMatch(emptyRecords(), match({ daily: '2026-11-22', outcome: 'lost', rounds: 10 }))
    records = addMatch(records, match({ daily: '2026-11-22', rounds: 18, lost: 1 }))
    records = addMatch(records, match({ daily: '2026-11-22', rounds: 25, lost: 0 }))
    expect(records.daily['2026-11-22']).toEqual({ won: true, rounds: 18, lost: 1 })
  })

  test('daily streak: consecutive won days, alive until today is played', () => {
    expect(previousDay('2026-03-01')).toBe('2026-02-28')
    expect(previousDay('2027-01-01')).toBe('2026-12-31')
    let records = emptyRecords()
    for (const daily of ['2026-11-19', '2026-11-20', '2026-11-21']) records = addMatch(records, match({ daily }))
    expect(dailyStreak(records, '2026-11-22')).toBe(3)
    expect(dailyStreak(records, '2026-11-23')).toBe(0)
    records = addMatch(records, match({ daily: '2026-11-22' }))
    expect(dailyStreak(records, '2026-11-22')).toBe(4)
    records = addMatch(records, match({ daily: '2026-11-23', outcome: 'lost' }))
    expect(dailyStreak(records, '2026-11-23')).toBe(4)
  })

  test('saved and loaded; anything malformed is dropped', () => {
    const records = addMatch(emptyRecords(), match({ daily: '2026-11-22' }))
    saveRecords(records)
    expect(loadRecords()).toEqual(records)
    localStorage.setItem('pixelfantasywar.records', JSON.stringify({ total: { played: -1 }, byMap: { a: { played: 1, won: 1, lost: 0, drawn: 0 }, b: 'x' }, daily: { nope: {} }, fastestWin: 'x' }))
    const loaded = loadRecords()
    expect(loaded.total).toEqual({ played: 0, won: 0, lost: 0, drawn: 0 })
    expect(Object.keys(loaded.byMap)).toEqual(['a'])
    expect(loaded.daily).toEqual({})
    expect(loaded.fastestWin).toBeNull()
    localStorage.setItem('pixelfantasywar.records', '{not json')
    expect(loadRecords()).toEqual(emptyRecords())
  })
})

describe('achievements', () => {
  test('every achievement has its texts', () => {
    for (const id of ACHIEVEMENT_IDS) expect(en.achievements[id]?.name, id).toBeTruthy()
  })

  test('earned from the match just played', () => {
    expect(newAchievements(context(match()), {})).toEqual(['first-win'])
    const flawless = match({ lost: 0, rounds: 8, survivors: 1, bucket: 'hard', feats: { criticals: 4, backAttacksInPhase: 3, counterKills: 1, oneShots: 1 } })
    expect(newAchievements(context(flawless), {})).toEqual([
      'first-win', 'flawless', 'last-stand', 'blitz', 'backstabber', 'lucky', 'one-shot', 'counter-kill', 'hard-win'
    ])
    // feats count even in a defeat; victories don't
    const lost = match({ outcome: 'lost', lost: 0, feats: { ...noFeats, backAttacksInPhase: 3 } })
    expect(newAchievements(context(lost), {})).toEqual(['backstabber'])
    expect(newAchievements(context(match({ bucket: 'online' })), {})).toContain('online-win')
    expect(newAchievements(context(match({ daily: '2026-11-22' })), {})).toContain('daily-win')
  })

  test('already unlocked ones are not earned again', () => {
    expect(newAchievements(context(match()), { 'first-win': '2026-11-01' })).toEqual([])
  })

  test('long ones: every map, every class, veteran, streak (with progress)', () => {
    let records = emptyRecords()
    const maps = Array.from({ length: 12 }, (_, i) => `map-${i}`)
    maps.forEach((mapId, i) => { records = addMatch(records, match({ mapId, army: [UNIT_CLASSES[i]] })) })
    expect(newAchievements(context(null, records), {})).toEqual(['every-map'])
    expect(achievementProgress('every-class', context(null, records))).toEqual([12, 14])
    records = addMatch(records, match({ army: ['Ranger', 'Necromancer', 'Halberdier'] }))
    expect(newAchievements(context(null, records), {})).toContain('every-class')
    expect(achievementProgress('veteran', context(null, records))).toEqual([13, 25])
    for (const [i, daily] of ['2026-11-20', '2026-11-21', '2026-11-22'].entries()) {
      records = addMatch(records, match({ daily }))
      expect(newAchievements(context(null, records), {}).includes('daily-streak')).toBe(i === 2)
    }
    maps.forEach(mapId => { records = addMatch(records, match({ mapId, bucket: 'hard' })) })
    expect(newAchievements(context(null, records), {})).toEqual(['every-map', 'hard-every-map', 'every-class', 'veteran', 'daily-streak'])
  })

  test('unlock stores the date once', () => {
    expect(unlock(['first-win', 'graduate'], '2026-11-22')).toEqual(['first-win', 'graduate'])
    expect(unlock(['first-win', 'blitz'], '2026-11-23')).toEqual(['blitz'])
    expect(loadUnlocked()).toEqual({ 'first-win': '2026-11-22', graduate: '2026-11-22', blitz: '2026-11-23' })
  })
})

describe('match feats', () => {
  test('back attacks count per phase, criticals, counter kills and one-shots', () => {
    const board = makeBoard(['.....', '.....'])
    const [a, b] = makePlayers(board)
    const stats = new MatchStats()
    board.onAttackEvent = (event, result) => stats.record(event, result)
    const thief = place(board, 'ThiefA', 0, 0, a)
    const target = place(board, 'WarriorB', 1, 0, b)
    target.miniDirection = 'right'
    stats.phaseStarted()
    thief.attackInstant(target, fixedRolls([[10, 3]]))
    thief.reset()
    thief.attackInstant(target, fixedRolls([[10, 3]]))
    expect(stats.feat(a).backAttacksInPhase).toBe(2)
    stats.phaseStarted()
    thief.reset()
    target.miniDirection = 'right'
    thief.attackInstant(target, fixedRolls([[10, 3]]))
    expect(stats.feat(a).backAttacksInPhase).toBe(2)

    // a real critical that kills a unit at full HP in one strike
    const berserker = place(board, 'BerserkerA', 3, 1, a)
    const assassin = place(board, 'AssassinB', 4, 1, b)
    assassin.miniDirection = 'left'
    berserker.attackInstant(assassin, fixedRolls([[20, 6]]))
    expect(stats.feat(a).criticals).toBe(1)
    expect(stats.feat(a).oneShots).toBe(1)

    // counter kill: the defender strikes back and finishes the attacker
    const fighter = place(board, 'FighterB', 0, 1, b)
    const weak = place(board, 'ThiefA', 1, 1, a)
    fighter.miniDirection = 'right'
    weak.miniDirection = 'left'
    weak.health = 1
    weak.attackInstant(fighter, fixedRolls([[2, 1], [15, 6]]))
    expect(stats.feat(b).counterKills).toBe(1)
  })
})

describe('daily challenge', () => {
  const maps = [
    { id: 'one', classic: [['Archer', 'Mage', 'Spearman', 'Thief', 'Fighter', 'Cleric', 'Barbarian', 'Warrior'], ['Archer', 'Mage', 'Spearman', 'Thief', 'Fighter', 'Cleric', 'Barbarian', 'Warrior']] as [UnitClass[], UnitClass[]] },
    { id: 'two', classic: [['Archer', 'Warrior', 'Thief'], ['Mage', 'Barbarian', 'Thief']] as [UnitClass[], UnitClass[]] },
    { id: 'three', classic: [['Cleric', 'Fighter'], ['Cleric', 'Fighter']] as [UnitClass[], UnitClass[]] }
  ]

  test('same date, same challenge; armies keep the roles and the budget', () => {
    const a = dailyChallenge('2026-11-22', maps)
    expect(dailyChallenge('2026-11-22', maps)).toEqual(a)
    const days = Array.from({ length: 30 }, (_, i) => dailyChallenge(`2026-12-${String(i + 1).padStart(2, '0')}`, maps))
    expect(new Set(days.map(d => d.mapId)).size).toBe(3)
    expect(new Set(days.map(d => d.armies.flat().join())).size).toBeGreaterThan(10)
    for (const day of days) {
      const map = maps.find(m => m.id === day.mapId)!
      day.armies.forEach((army, team) => {
        expect(army.map(roleOf)).toEqual(map.classic[team].map(roleOf))
        expect(armyCost(army)).toBeLessThanOrEqual(ARMY_BUDGET)
      })
    }
  })

  test('settings: daily mode, CPU on Hard, the map positions', () => {
    const challenge = dailyChallenge('2026-11-22', maps)
    expect(dailySettings(challenge)).toEqual({ mode: 'daily', armies: challenge.armies, placements: [null, null], difficulty: 'hard', daily: '2026-11-22' })
  })

  test('seeded random and local date', () => {
    const r1 = seededRandom('x')
    const r2 = seededRandom('x')
    const values = Array.from({ length: 5 }, () => r1())
    expect(values).toEqual(Array.from({ length: 5 }, () => r2()))
    expect(values.every(v => v >= 0 && v < 1)).toBe(true)
    expect(todayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})
