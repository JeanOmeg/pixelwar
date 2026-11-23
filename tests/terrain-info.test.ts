// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { makeBoard } from './helpers'
import { terrainKind, terrainView } from '../src/terrain-info'
import { language, setLanguage } from '../src/i18n'

const board = makeBoard(['.f#~Di'])
const node = (x: number) => board.getCell(x, 0)!.pathNode

describe('terrain card', () => {
  test('kind comes from the tile flags; plain ground has no card', () => {
    expect([0, 1, 2, 3, 4, 5].map(x => terrainKind(node(x)))).toEqual([null, 'forest', 'obstacle', 'water', 'door', 'ice'])
    expect(terrainView(node(0))).toBeNull()
  })

  test('rules name the classes from TERRAIN_RULES', () => {
    const before = language()
    try {
      setLanguage('en')
      const forest = terrainView(node(1))!.rules.map(r => r.text)
      expect(forest[0]).toBe('Costs 2 movement. Thief, Assassin and Ranger pay 1')
      expect(forest[1]).toContain('+2 DEF')
      expect(forest[2]).toBe('Archer, Mage, Spearman, Ranger and Necromancer pay 2 range points to shoot across it')

      const ice = terrainView(node(5))!
      expect(ice.rules[0].text).toBe('Costs 2 movement. Thief and Assassin pay 1')
      expect(ice.rules[1]).toMatchObject({ icon: 'shield', tone: 'down' })

      const wall = terrainView(node(2))!.rules.map(r => r.text)
      expect(wall).toEqual(['Can\'t be crossed', 'Blocks attacks: nobody can shoot through it'])

      setLanguage('pt-BR')
      expect(terrainView(node(5))!.name).toBe('Gelo')
    } finally {
      setLanguage(before)
    }
  })
})
