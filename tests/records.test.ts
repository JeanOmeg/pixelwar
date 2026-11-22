// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from 'vitest'
import { type MatchSummary, addMatch, betterDaily, dailyStreak, emptyRecords, loadRecords, previousDay, saveRecords } from '../src/records'
import { ACHIEVEMENT_IDS, type AchievementContext, achievementProgress, loadUnlocked, newAchievements, unlock } from '../src/achievements'
import { dailyChallenge, dailySettings, seededRandom, todayKey } from '../src/daily'
import { MatchStats, emptyFeats } from '../src/match-stats'
import { fixedRolls } from '../src/unit'
import { FIREBALL_SPLASH, HEAL_HP } from '../src/skills'
import { roleOf } from '../src/army-ai'
import { ARMY_BUDGET, armyCost } from '../src/unit-classes'
import { UNIT_CLASSES, type UnitClass } from '../src/unit-types'
import { en } from '../src/i18n/en'
import { makeBoard, makePlayers, place } from './helpers'

const noFeats = emptyFeats()

function match(overrides: Partial<MatchSummary> = {}): MatchSummary {
  return {
    bucket: 'normal', mapId: 'twin-keeps', outcome: 'won', rounds: 15, army: ['Archer', 'Archer', 'Warrior', 'Warrior', 'Barbarian', 'Cleric'],
    lost: 2, survivors: 3, survivorHp: 30, kills: 5, damage: 60, feats: noFeats, ...overrides
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
    const flawless = match({ lost: 0, rounds: 8, survivors: 1, bucket: 'hard', feats: { ...noFeats, criticals: 4, backAttacksInPhase: 3, counterKills: 1, oneShots: 1 } })
    expect(newAchievements(context(flawless), {})).toEqual([
      'first-win', 'flawless', 'last-stand', 'blitz', 'hard-win', 'clean-sweep', 'storm', 'one-shot', 'lucky', 'counter-kill', 'backstabber'
    ])
    // feats count even in a defeat; victories don't
    const lost = match({ outcome: 'lost', lost: 0, feats: { ...noFeats, backAttacksInPhase: 3 } })
    expect(newAchievements(context(lost), {})).toEqual(['backstabber'])
    expect(newAchievements(context(match({ bucket: 'online' })), {})).toContain('online-win')
    expect(newAchievements(context(match({ daily: '2026-11-22' })), {})).toContain('daily-win')
  })

  test('feats of the match reach their goals', () => {
    const earned = (feats: Partial<typeof noFeats>, overrides: Partial<MatchSummary> = {}) =>
      newAchievements(context(match({ outcome: 'lost', ...overrides, feats: { ...noFeats, ...feats } })), {})
    expect(earned({ biggestStrike: 14 })).toEqual([])
    expect(earned({ biggestStrike: 15 })).toEqual(['overkill'])
    expect(earned({ longShots: 1, missKills: 1, reachCounterKills: 1, backstabKills: 1, farKills: 1, burnKills: 1, iceKills: 1 }))
      .toEqual(['long-shot', 'grazed', 'long-reach', 'silent-blade', 'deadeye', 'scorched', 'thin-ice'])
    expect(earned({ mpStolen: 5, healed: 17, drained: 11, pins: 2, killsInPhase: 2, bestUnitKills: 3, toughest: 24 })).toEqual([])
    expect(earned({ mpStolen: 6, healed: 18, drained: 12, pins: 3, killsInPhase: 3, bestUnitKills: 4, toughest: 25 }))
      .toEqual(['pickpocket', 'field-medic', 'life-leech', 'pinned-down', 'sweep', 'rampage', 'iron-wall'])
    // a comeback and a close call need the victory
    expect(earned({ maxDeficit: 3 }, { survivorHp: 4 })).toEqual([])
    expect(earned({ maxDeficit: 3 }, { outcome: 'won', survivorHp: 4 })).toEqual(['first-win', 'close-call', 'comeback'])
  })

  test('the winning army: one class, no repeats, ranged only, melee only, cheap', () => {
    const earned = (army: UnitClass[], outcome: MatchSummary['outcome'] = 'won') =>
      newAchievements(context(match({ army, outcome })), { 'first-win': '2026-11-01' })
    expect(earned(['Mage', 'Mage', 'Mage'])).toEqual(['legion', 'marksmen', 'frugal'])
    expect(earned(['Warrior', 'Barbarian', 'Cleric', 'Paladin', 'Berserker'])).toEqual(['mixed-company', 'vanguard'])
    expect(earned(['Archer', 'Spearman', 'Halberdier', 'Ranger', 'Mage', 'Necromancer', 'Archer', 'Warrior', 'Warrior'])).toEqual([])
    expect(earned(['Mage', 'Mage', 'Mage'], 'lost')).toEqual([])
  })

  test('already unlocked ones are not earned again', () => {
    expect(newAchievements(context(match()), { 'first-win': '2026-11-01' })).toEqual([])
  })

  test('long ones: every map, every class, veteran, streak (with progress)', () => {
    let records = emptyRecords()
    const maps = Array.from({ length: 12 }, (_, i) => `map-${i}`)
    maps.forEach((mapId, i) => { records = addMatch(records, match({ mapId, army: [UNIT_CLASSES[i]] })) })
    expect(newAchievements(context(null, records), {})).toEqual(['seasoned', 'every-map'])
    expect(achievementProgress('every-class', context(null, records))).toEqual([12, 14])
    records = addMatch(records, match({ army: ['Ranger', 'Necromancer', 'Halberdier'] }))
    expect(newAchievements(context(null, records), {})).toContain('every-class')
    expect(achievementProgress('veteran', context(null, records))).toEqual([13, 25])
    for (const [i, daily] of ['2026-11-20', '2026-11-21', '2026-11-22'].entries()) {
      records = addMatch(records, match({ daily }))
      expect(newAchievements(context(null, records), {}).includes('daily-streak')).toBe(i === 2)
    }
    maps.forEach(mapId => { records = addMatch(records, match({ mapId, bucket: 'hard' })) })
    expect(newAchievements(context(null, records), {})).toEqual([
      'seasoned', 'veteran', 'every-class', 'slayer', 'every-map', 'hard-veteran', 'hard-every-map', 'daily-streak'
    ])
    expect(achievementProgress('legend', context(null, records))).toEqual([28, 100])
    expect(achievementProgress('devastator', context(null, records))).toEqual([1680, 3000])
    expect(achievementProgress('daily-devotee', context(null, records))).toEqual([3, 7])
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

  test('kills from afar, with a miss, by burn, by Backstab, on ice; kills per turn and per unit', () => {
    const board = makeBoard(['.......', '.......', '...i...'])
    const [a, b] = makePlayers(board)
    const stats = new MatchStats()
    board.onAttackEvent = (event, result) => stats.record(event, result)
    stats.phaseStarted()

    // a miss still deals 1: from 5 tiles, a 1 HP thief falls
    const archer = place(board, 'ArcherA', 0, 0, a)
    const far = place(board, 'ThiefB', 5, 0, b)
    far.health = 1
    far.miniDirection = 'left'
    archer.attackInstant(far, fixedRolls([[2, 1]]))
    expect(stats.feat(a)).toMatchObject({ farKills: 1, missKills: 1, longShots: 0 })
    far.cell?.removeUnit(far)

    // Fireball: the strike misses, the burn finishes it
    const mage = place(board, 'MageA', 0, 1, a)
    const burnt = place(board, 'ThiefB', 3, 1, b)
    burnt.health = 1 + FIREBALL_SPLASH
    burnt.miniDirection = 'left'
    mage.startSkill('skill-fireball')
    mage.attackInstant(burnt, fixedRolls([[2, 1]]))
    expect(stats.feat(a).burnKills).toBe(1)
    burnt.cell?.removeUnit(burnt)

    // Backstab on a unit standing on ice
    const assassin = place(board, 'AssassinA', 2, 2, a)
    const iced = place(board, 'WarriorB', 3, 2, b)
    iced.health = 1
    assassin.startSkill('skill-backstab')
    assassin.attackInstant(iced, fixedRolls([[2, 1]]))
    expect(stats.feat(a)).toMatchObject({ backstabKills: 1, iceKills: 1, killsInPhase: 3, bestUnitKills: 1 })
    stats.phaseStarted()
    expect(stats.feat(a).killsInPhase).toBe(3)
  })

  test('Steal, Pinning Shot, Drain and Heal add up; the toughest survivor; how far behind a team was', () => {
    const board = makeBoard(['......', '......'])
    const [a, b] = makePlayers(board)
    const stats = new MatchStats()
    board.onAttackEvent = (event, result) => stats.record(event, result)
    board.onHeal = (healer, amount) => stats.healed(healer, amount)
    board.onUnitDown = unit => stats.unitLost(unit)

    const thief = place(board, 'ThiefA', 0, 0, a)
    const warrior = place(board, 'WarriorB', 1, 0, b)
    warrior.miniDirection = 'left'
    thief.startSkill('skill-steal')
    thief.attackInstant(warrior, fixedRolls([[20, 1], [2, 1]]))
    expect(stats.feat(a).mpStolen).toBe(2)

    const ranger = place(board, 'RangerA', 4, 0, a)
    ranger.startSkill('skill-pinning-shot')
    ranger.attackInstant(warrior, fixedRolls([[20, 1]]))
    expect(stats.feat(a).pins).toBe(1)

    const necromancer = place(board, 'NecromancerB', 4, 1, b)
    necromancer.startSkill('skill-drain')
    necromancer.attackInstant(ranger, fixedRolls([[20, 1]]))
    expect(stats.feat(b).drained).toBeGreaterThan(0)

    const cleric = place(board, 'ClericB', 1, 1, b)
    const taken = warrior.unitConfig.health - warrior.health
    expect(cleric.useSkillOn('skill-heal', warrior)).toBe(true)
    expect(stats.feat(b).healed).toBe(Math.min(HEAL_HP, taken))
    // the warrior took every hit and is still standing
    expect(stats.feat(b).toughest).toBe(taken)

    board.onUnitDown?.(thief)
    board.onUnitDown?.(ranger)
    board.onUnitDown?.(warrior)
    expect(stats.feat(a).maxDeficit).toBe(2)
    expect(stats.feat(b).maxDeficit).toBe(0)
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
