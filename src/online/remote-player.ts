import { Player } from '../player'
import type { Board } from '../board'
import type { Cell } from '../cell'
import type { SelectionManager } from '../selection-manager'
import { ENEMY_SPEED } from '../config'
import { gameDelay } from '../speed'
import { fixedRolls } from '../unit'
import { applyAction, instantPresenter, type ActionPresenter } from './actions'
import { withoutEffects } from '../effects'
import type { ActionFeed } from './feed'

/**
 * Online: a player on another device (the opponent, or both players for a
 * spectator). Its turn plays the actions that arrive through the feed, with
 * the same highlights and pauses as the CPU's moves.
 */
export class RemotePlayer extends Player {
  override readonly isHuman = true

  constructor(name: string, board: Board, private feed: ActionFeed, private selectionManager: SelectionManager, private onOutOfSync: (error: unknown) => void) {
    super(name, board)
    this.displayName = name
  }

  override get isLocal(): boolean {
    return false
  }

  private animated: ActionPresenter = {
    move: async (unit, path) => {
      this.selectionManager.showHighlight(path, 'path')
      await gameDelay(ENEMY_SPEED)
      await unit.move(path)
      this.selectionManager.reset()
    },
    attack: async (unit, target, rolls) => {
      if (target.cell) this.selectionManager.showHighlight([(target.cell as Cell).pathNode], 'attack')
      await gameDelay(ENEMY_SPEED)
      await unit.attack(target, fixedRolls(rolls))
      this.selectionManager.reset()
    }
  }

  /** The turn goes on while some unit can still move or attack (same rule as HumanPlayer) */
  private hasMoves(): boolean {
    const units = this.board.getUnits().filter(u => u.player === this && u.hasActions())
    return units.length > 0 && !this.hasWon()
  }

  override async makeMove(): Promise<boolean> {
    while (!this.disposed && this.hasMoves()) {
      const entry = await this.feed.next()
      if (!entry || this.disposed) break
      try {
        const apply = () => applyAction(this.board, this, entry.action, entry.catchUp ? instantPresenter : this.animated)
        const ended = await (entry.catchUp ? withoutEffects(apply) : apply())
        if (ended) break
      } catch (error) {
        this.onOutOfSync(error)
        break
      }
    }
    this.selectionManager.reset()
    return true
  }
}
