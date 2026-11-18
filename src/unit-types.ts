/**
 * Class and unit type names. No engine or asset imports, so rules and tests
 * can use them outside the browser.
 */

/** Original 8 classes first, then the newer 6 (the order the menus show them) */
export const UNIT_CLASSES = [
  'Archer', 'Mage', 'Spearman', 'Thief', 'Fighter', 'Cleric', 'Barbarian', 'Warrior',
  'Paladin', 'Berserker', 'Assassin', 'Ranger', 'Necromancer', 'Halberdier'
] as const

export type UnitClass = typeof UNIT_CLASSES[number]

/** A = blue (team 0), B = red (team 1). Both variants have the same stats. */
export type UnitType = `${UnitClass}${'A' | 'B'}`

export const UNIT_TYPES: UnitType[] = UNIT_CLASSES.flatMap(c => [`${c}A`, `${c}B`] as UnitType[])

/** 'ArcherA' -> 'Archer' */
export function unitClassOf(unitName: string): UnitClass {
  return unitName.replace(/[AB]$/, '') as UnitClass
}

/** Unit type of a class for a team: team 0 = A (blue), 1 = B (red) */
export function unitTypeOf(unitClass: UnitClass, team: number): UnitType {
  return `${unitClass}${team === 0 ? 'A' : 'B'}`
}
