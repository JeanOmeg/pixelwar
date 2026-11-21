import * as ex from 'excalibur'
import { Board } from '../src/board'
import { Player } from '../src/player'
import { Unit } from '../src/unit'
import type { UnitType } from '../src/unit-types'

/**
 * Board from a small ASCII map:
 *   .  open ground (fast)     f  forest (slow)
 *   #  wall / tree            ~  water (attack passes over it)
 *   D  door                   i  ice (slow, -2 DEF, open for attacks)
 */
export function makeBoard(rows: string[], mirrored = false): Board {
  const board = new Board(rows.length, rows[0].length, new ex.Scene(), mirrored)
  rows.forEach((row, y) => [...row].forEach((tile, x) => {
    const node = board.getCell(x, y)!.pathNode
    node.isWalkable = tile === '.' || tile === 'f' || tile === 'D' || tile === 'i'
    node.isFast = tile === '.'
    node.isAttackable = tile === '.' || tile === 'f' || tile === '~' || tile === 'i'
    node.isWater = tile === '~'
    node.isDoor = tile === 'D'
    node.isIce = tile === 'i'
  }))
  return board
}

export class TestPlayer extends Player {
  async makeMove() {
    return true
  }
}

export function makePlayers(board: Board): [TestPlayer, TestPlayer] {
  Player.resetMasks()
  return [new TestPlayer('A', board), new TestPlayer('B', board)]
}

export function place(board: Board, type: UnitType, x: number, y: number, player: Player): Unit {
  return new Unit(x, y, type, board, player)
}
