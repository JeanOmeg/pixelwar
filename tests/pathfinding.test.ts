// @vitest-environment happy-dom
import { describe, expect, test } from 'vitest'
import { makeBoard, makePlayers, place } from './helpers'

const at = (board: ReturnType<typeof makeBoard>, x: number, y: number) => board.getCell(x, y)!.pathNode

describe('movement', () => {
  test('open ground costs 1, forest 2', () => {
    const board = makeBoard([
      '.....',
      '.ff..',
      '.....'
    ])
    const [a] = makePlayers(board)
    const map = board.pathFinder.getMovementMap(at(board, 0, 1), a.mask, 6, 'FighterA')
    expect(map.costTo(at(board, 1, 1))).toBe(2) // one forest tile
    expect(map.costTo(at(board, 2, 1))).toBe(4) // two forest tiles (going around costs 5)
    expect(map.costTo(at(board, 3, 1))).toBe(5) // around the forest: up, 3 right, down
  })

  test('the Thief crosses forest at full speed', () => {
    const board = makeBoard(['.fff.'])
    const [a] = makePlayers(board)
    const thief = board.pathFinder.getMovementMap(at(board, 0, 0), a.mask, 4, 'ThiefA')
    const fighter = board.pathFinder.getMovementMap(at(board, 0, 0), a.mask, 4, 'FighterA')
    expect(thief.canStopAt(at(board, 4, 0))).toBe(true)
    expect(fighter.canStopAt(at(board, 4, 0))).toBe(false)
  })

  test('allies can be crossed but not stood on; enemies block', () => {
    const board = makeBoard(['.....'])
    const [a, b] = makePlayers(board)
    place(board, 'FighterA', 1, 0, a)
    const map = board.pathFinder.getMovementMap(at(board, 0, 0), a.mask, 6, 'FighterA')
    expect(map.canStopAt(at(board, 1, 0))).toBe(false)
    expect(map.canStopAt(at(board, 2, 0))).toBe(true)
    place(board, 'FighterB', 3, 0, b)
    const blocked = board.pathFinder.getMovementMap(at(board, 0, 0), a.mask, 6, 'FighterA')
    expect(blocked.canStopAt(at(board, 4, 0))).toBe(false)
  })

  test('paths prefer fewer turns when the cost is the same', () => {
    const board = makeBoard([
      '...',
      '...',
      '...'
    ])
    const [a] = makePlayers(board)
    const path = board.pathFinder.getMovementMap(at(board, 0, 0), a.mask, 6, 'FighterA').pathTo(at(board, 2, 2))
    const turns = path.slice(2).filter((node, i) => {
      const [p, q] = [path[i], path[i + 1]]
      return (q.x - p.x) !== (node.x - q.x) || (q.y - p.y) !== (node.y - q.y)
    }).length
    expect(turns).toBe(1)
  })
})

describe('attack range', () => {
  test('straight lines only, stopped by walls', () => {
    const board = makeBoard([
      '.....',
      '.....',
      '..#..'
    ])
    const [a] = makePlayers(board)
    const range = board.pathFinder.getRangeAttack(at(board, 2, 0), ~a.mask, 3, 'HalberdierA')
    expect(range).toContain(at(board, 2, 1))
    expect(range).not.toContain(at(board, 2, 2)) // wall
    expect(range).not.toContain(at(board, 3, 1)) // diagonal
  })

  test('archers pay 2 per forest tile of range', () => {
    const board = makeBoard(['.fff..'])
    const [a] = makePlayers(board)
    const archer = board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 4, 'ArcherA')
    const halberdier = board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 4, 'HalberdierA')
    expect(archer).toContain(at(board, 2, 0))
    expect(archer).not.toContain(at(board, 3, 0))
    expect(halberdier).toContain(at(board, 4, 0))
  })

  test('water costs 1 point of range, even for archers', () => {
    const board = makeBoard(['.~~~..'])
    const [a] = makePlayers(board)
    const archer = board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 4, 'ArcherA')
    expect(archer).toContain(at(board, 4, 0))
    expect(archer).not.toContain(at(board, 5, 0))
  })

  test('only some classes target water; attacks pass over it', () => {
    const board = makeBoard(['.~.'])
    const [a] = makePlayers(board)
    expect(board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 2, 'ArcherA')).toContain(at(board, 1, 0))
    expect(board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 2, 'HalberdierA')).not.toContain(at(board, 1, 0))
    expect(board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 2, 'HalberdierA')).toContain(at(board, 2, 0))
  })

  test('units on a door cannot attack, and doors cannot be attacked', () => {
    const board = makeBoard(['.D.'])
    const [a] = makePlayers(board)
    expect(board.pathFinder.getRangeAttack(at(board, 1, 0), ~a.mask, 1, 'FighterA')).toEqual([])
    expect(board.pathFinder.getRangeAttack(at(board, 0, 0), ~a.mask, 2, 'HalberdierA')).toEqual([])
  })
})
