import { UNIT_CLASSES, type UnitClass } from './unit-types'

/**
 * Armies the player saved by name on the army screen ("Saved armies"). Not
 * tied to a map: an army loads on any map with the same number of slots.
 * Only classes are kept; positions stay the map's (or the last used ones).
 */

export interface SavedArmy {
  name: string
  army: UnitClass[]
}

export const MAX_SAVED_ARMIES = 5
/** Longest name kept */
export const SAVED_NAME_LENGTH = 24

const PREF_SAVED = 'pixelfantasywar.armies.saved'

function isSavedArmy(value: unknown): value is SavedArmy {
  if (!value || typeof value !== 'object') return false
  const { name, army } = value as Partial<SavedArmy>
  return typeof name === 'string' && name.trim() !== '' && Array.isArray(army) && army.length > 0 &&
    army.every(c => (UNIT_CLASSES as readonly unknown[]).includes(c))
}

export function loadSavedArmies(): SavedArmy[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PREF_SAVED) ?? '[]')
    return Array.isArray(saved) ? saved.filter(isSavedArmy).slice(0, MAX_SAVED_ARMIES) : []
  } catch {
    return []
  }
}

function store(list: SavedArmy[]) {
  try { localStorage.setItem(PREF_SAVED, JSON.stringify(list)) } catch { /* storage unavailable */ }
}

export function cleanArmyName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, SAVED_NAME_LENGTH)
}

/**
 * Saves `army` as `name`: replaces an army with the same name (any case),
 * otherwise adds it. Returns the new list, or null when the list is full
 * (or the name is empty).
 */
export function saveNamedArmy(name: string, army: UnitClass[]): SavedArmy[] | null {
  const clean = cleanArmyName(name)
  if (!clean || army.length === 0) return null
  const list = loadSavedArmies()
  const entry: SavedArmy = { name: clean, army: [...army] }
  const same = list.findIndex(saved => saved.name.toLowerCase() === clean.toLowerCase())
  if (same >= 0) list[same] = entry
  else if (list.length >= MAX_SAVED_ARMIES) return null
  else list.push(entry)
  store(list)
  return list
}

export function deleteSavedArmy(index: number): SavedArmy[] {
  const list = loadSavedArmies()
  list.splice(index, 1)
  store(list)
  return list
}

/** First "Army N" not taken yet, the name offered when saving */
export function nextArmyName(list: SavedArmy[], label: (n: number) => string): string {
  for (let n = 1; ; n++) {
    const name = label(n)
    if (!list.some(saved => saved.name.toLowerCase() === name.toLowerCase())) return name
  }
}
