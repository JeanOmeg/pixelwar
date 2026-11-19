import { ARMY_BUDGET, UNIT_CLASSES, armyCost } from '../unit-classes'
import type { UnitClass } from '../unit-types'
import { DeployMap, Placement, isValidPlacement } from '../deploy'

/** Last army and placement used per map and team (pre-fill the army screen) */
const prefArmy = (mapId: string, team: number) => `pixelfantasywar.army.${mapId}.${team}`
const prefPlacement = (mapId: string, team: number) => `pixelfantasywar.placement.${mapId}.${team}`

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

/** The saved placement ("x:y,x:y,..."), if it is still valid on this map */
export function savedPlacement(mapId: string, team: number, map: DeployMap): Placement | null {
  let saved: Placement | undefined
  try {
    saved = localStorage.getItem(prefPlacement(mapId, team))?.split(',').map(cell => cell.split(':').map(Number) as [number, number])
  } catch {
    return null
  }
  return isValidPlacement(map, team, saved) ? saved : null
}

export function savePlacement(mapId: string, team: number, placement: Placement) {
  try { localStorage.setItem(prefPlacement(mapId, team), placement.map(([x, y]) => `${x}:${y}`).join(',')) } catch { /* storage unavailable */ }
}
