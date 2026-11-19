import type { Board } from '../board'
import type { Player } from '../player'
import type { GameAction } from '../online/protocol'
import type { TutorialAction } from './script'

/**
 * Turns a scripted action into the GameAction the game applies (online/actions.ts).
 * A move only names its destination: the path is the one the game itself
 * would take (cheapest, then fewest turns), so the final facing is the same
 * as when the player clicks that tile.
 */
export function toGameAction(board: Board, player: Player, action: TutorialAction): GameAction {
  if (action.a === 'end-turn') return { a: 'end-turn', reason: 'button' }
  if (action.a !== 'move') return action

  const [x, y] = action.unit
  const unit = board.getCell(x, y)?.unit
  const destination = board.getCell(action.to[0], action.to[1])
  if (!unit?.cell || !destination) throw new Error(`Tutorial: no unit at ${x},${y} or no cell at ${action.to}`)
  const budget = unit.unitConfig.movement * (action.skill === 'skill-run' ? 2 : 1)
  const path = board.pathFinder.getMovementMap(unit.cell.pathNode, player.mask, budget, unit.name).pathTo(destination.pathNode)
  if (path.length < 2) throw new Error(`Tutorial: ${unit.name} at ${x},${y} can't reach ${action.to}`)
  return { a: 'move', unit: action.unit, path: path.map(node => [node.x, node.y]), ...(action.skill ? { skill: action.skill } : {}) }
}
