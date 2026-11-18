import { ARMY_BUDGET, UNIT_CLASSES, armyCost } from '../unit-classes'
import type { UnitClass } from '../unit-types'

/** Last army used per map and team (pre-fills the army screen) */
const prefArmy = (mapId: string, team: number) => `pixelfantasywar.army.${mapId}.${team}`

/** The saved army for this map/team, if it still fits the slots and the budget */
export function savedArmy(mapId: string, team: number, slots: number): UnitClass[] | null {
  let saved: UnitClass[] | undefined
  try {
    saved = localStorage.getItem(prefArmy(mapId, team))?.split(',') as UnitClass[] | undefined
  } catch {
    return null
  }
  if (!saved || saved.length !== slots || saved.some(c => !UNIT_CLASSES.includes(c))) return null
  return armyCost(saved) <= ARMY_BUDGET ? saved : null
}

export function saveArmy(mapId: string, team: number, army: UnitClass[]) {
  try { localStorage.setItem(prefArmy(mapId, team), army.join(',')) } catch { /* storage unavailable */ }
}
