// @vitest-environment happy-dom
import { beforeEach, describe, expect, test } from 'vitest'
import { MAX_SAVED_ARMIES, deleteSavedArmy, loadSavedArmies, nextArmyName, saveNamedArmy } from '../src/saved-armies'
import { idleHint, noteHintUse, resetHintProgress } from '../src/hint-progress'
import type { UnitClass } from '../src/unit-types'

const ARMY: UnitClass[] = ['Archer', 'Mage', 'Warrior']

describe('saved armies', () => {
  beforeEach(() => localStorage.clear())

  test('saves, replaces by name and deletes', () => {
    expect(loadSavedArmies()).toEqual([])
    saveNamedArmy('  Rush  ', ARMY)
    expect(loadSavedArmies()).toEqual([{ name: 'Rush', army: ARMY }])
    // same name in another case: replaced, not added
    saveNamedArmy('rush', ['Thief', 'Thief', 'Thief'])
    expect(loadSavedArmies()).toEqual([{ name: 'rush', army: ['Thief', 'Thief', 'Thief'] }])
    expect(deleteSavedArmy(0)).toEqual([])
  })

  test('holds at most MAX_SAVED_ARMIES, but a full list still replaces', () => {
    for (let i = 1; i <= MAX_SAVED_ARMIES; i++) expect(saveNamedArmy(`A${i}`, ARMY)).not.toBeNull()
    expect(saveNamedArmy('One more', ARMY)).toBeNull()
    expect(saveNamedArmy('A1', ['Cleric'])).not.toBeNull()
    expect(loadSavedArmies()).toHaveLength(MAX_SAVED_ARMIES)
    expect(saveNamedArmy('   ', ARMY)).toBeNull()
  })

  test('ignores broken or unknown data', () => {
    localStorage.setItem('pixelfantasywar.armies.saved', JSON.stringify([{ name: 'ok', army: ARMY }, { name: 'bad', army: ['Dragon'] }, 7]))
    expect(loadSavedArmies()).toEqual([{ name: 'ok', army: ARMY }])
    localStorage.setItem('pixelfantasywar.armies.saved', '{not json')
    expect(loadSavedArmies()).toEqual([])
  })

  test('offers the first free default name', () => {
    expect(nextArmyName([{ name: 'army 1', army: ARMY }], n => `Army ${n}`)).toBe('Army 2')
  })
})

describe('idle hint', () => {
  beforeEach(() => {
    localStorage.clear()
    resetHintProgress()
  })

  test('drops the commands already used, per input', () => {
    const parts: Parameters<typeof idleHint>[1] = [['select', 'A'], ['move-range', 'B'], ['next-unit', 'C']]
    expect(idleHint('desktop', parts)).toBe('A · B · C')
    noteHintUse('desktop', 'move-range')
    expect(idleHint('desktop', parts)).toBe('A · C')
    // the controller has other buttons: still shown there
    expect(idleHint('pad', parts)).toBe('A · B · C')
    noteHintUse('desktop', 'select')
    noteHintUse('desktop', 'next-unit')
    expect(idleHint('desktop', parts)).toBe('')
  })
})
