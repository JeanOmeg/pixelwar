import type { Board } from '../board'
import type { Cell } from '../cell'
import type { Player } from '../player'
import type { PathNodeComponent } from '../path-finding/path-node-component'
import { fixedRolls, rollStrike, type Unit } from '../unit'
import { SKILLS } from '../skills'
import type { GameAction, Pos } from './protocol'

/**
 * Online play: turning board moves into GameActions and back. A received
 * action is checked against the rules before it is applied: anything that
 * doesn't fit means the two games went out of sync.
 */

export function posOf(cell: Cell): Pos {
  return [cell.x, cell.y]
}

/** Dice for one attack: the strike and a possible counterattack (always two pairs, the second may go unused) */
export function rollAttackDice(): [number, number][] {
  return [rollStrike(), rollStrike()]
}

/** How a received action is shown: with the game's animations, or all at once (catching up) */
export interface ActionPresenter {
  move(unit: Unit, path: PathNodeComponent[]): Promise<void>
  attack(unit: Unit, target: Unit, rolls: [number, number][]): Promise<void>
}

export const instantPresenter: ActionPresenter = {
  move: async (unit, path) => unit.moveInstant(path),
  attack: async (unit, target, rolls) => { unit.attackInstant(target, fixedRolls(rolls)) }
}

export class ActionError extends Error {}

function cellAt(board: Board, pos: unknown): Cell {
  const [x, y] = Array.isArray(pos) ? pos : []
  const cell = Number.isInteger(x) && Number.isInteger(y) ? board.getCell(x, y) : null
  if (!cell) throw new ActionError(`No cell at ${String(pos)}`)
  return cell
}

function ownUnitAt(board: Board, player: Player, pos: unknown): Unit {
  const unit = cellAt(board, pos).unit
  if (!unit || unit.player !== player || unit.health <= 0) throw new ActionError(`No unit of ${player.name} at ${String(pos)}`)
  return unit
}

function startSkill(unit: Unit, skill: unknown, kind: 'move' | 'attack' | 'self') {
  const definition = SKILLS[skill as keyof typeof SKILLS]
  if (!definition || definition.kind !== kind || !unit.startSkill(definition.id)) {
    throw new ActionError(`${unit.name} can't use ${String(skill)}`)
  }
}

/**
 * Applies `action`, played by `player`. Returns true when it ended the turn.
 * Throws ActionError when the action breaks the rules (out of sync).
 */
export async function applyAction(board: Board, player: Player, action: GameAction, presenter: ActionPresenter): Promise<boolean> {
  switch (action.a) {
  case 'move': {
    const unit = ownUnitAt(board, player, action.unit)
    if (!Array.isArray(action.path) || action.path.length < 2) throw new ActionError('Bad path')
    const path = action.path.map(pos => cellAt(board, pos).pathNode)
    const destination = path[path.length - 1].owner as Cell
    if (path[0].owner !== unit.cell || !unit.canMove() || destination.unit) throw new ActionError(`${unit.name} can't move there`)
    if (action.skill) startSkill(unit, action.skill, 'move')
    await presenter.move(unit, path)
    unit.settlePendingSkill()
    return false
  }
  case 'attack': {
    const unit = ownUnitAt(board, player, action.unit)
    const target = cellAt(board, action.target).unit
    if (!target || target.player === player || !unit.getPossibleTargets()?.includes(target.cell as Cell) || unit.attacked) {
      throw new ActionError(`${unit.name} can't attack ${String(action.target)}`)
    }
    if (action.skill) startSkill(unit, action.skill, 'attack')
    const rolls = Array.isArray(action.rolls) ? action.rolls : []
    await presenter.attack(unit, target, rolls)
    unit.settlePendingSkill()
    return false
  }
  case 'self-skill':
    startSkill(ownUnitAt(board, player, action.unit), action.skill, 'self')
    return false
  case 'heal': {
    const unit = ownUnitAt(board, player, action.unit)
    const target = cellAt(board, action.target).unit
    if (!target || !unit.useSkillOn('skill-heal', target)) throw new ActionError(`${unit.name} can't heal ${String(action.target)}`)
    return false
  }
  case 'undo': {
    const unit = ownUnitAt(board, player, action.unit)
    if (!unit.canUndoMove()) throw new ActionError(`${unit.name} can't undo its move`)
    unit.undoMove()
    return false
  }
  case 'pass': {
    const unit = ownUnitAt(board, player, action.unit)
    unit.setAnim(unit.selectAnimationIdle())
    await unit.pass()
    return false
  }
  case 'end-turn':
    for (const unit of board.getUnits().filter(u => u.player === player)) {
      unit.setAnim(unit.selectAnimationIdle())
      await unit.pass()
    }
    return true
  default:
    throw new ActionError(`Unknown action ${JSON.stringify(action)}`)
  }
}

/**
 * Short summary of the board (every unit's place, HP, MP and facing). Both
 * sides compare it after each turn to catch a match that went out of sync.
 */
export function boardHash(board: Board): string {
  const text = board.getUnits()
    .map(u => `${u.name}@${u.cell?.x},${u.cell?.y}:${u.health}/${u.mp}/${u.miniDirection}`)
    .sort()
    .join('|')
  // FNV-1a, 32 bits
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}
