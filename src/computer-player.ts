import { Player } from './player'
import type { SelectionManager } from './selection-manager'
import type { Board } from './board'
import type { Cell } from './cell'
import { ENEMY_SPEED } from './config'
import { gameDelay } from './speed'
import { AiExecutor, playAiTurn } from './ai/turn'
import { Difficulty, Personality, randomPersonality } from './ai/weights'

/**
 * CPU player. The decisions live in src/ai/ (planner, threat map, weights);
 * this class plays them with the game's animations and pauses.
 */
export class ComputerPlayer extends Player {
  public override active = false
  readonly difficulty: Difficulty
  readonly personality: Personality
  /** Own turns played this match (the AI gets bolder as it drags on) */
  private turns = 0

  constructor(name: string, private selectionManager: SelectionManager, board: Board, difficulty: Difficulty = 'normal', personality: Personality = randomPersonality()) {
    super(name, board)
    this.difficulty = difficulty
    this.personality = personality
  }

  override async turnStart() {
    this.active = true
    const units = this.board.getUnits()
    units.filter(unit => unit.player === this).forEach(unit => unit.reset())
    units.forEach(unit => unit.setAnim(unit.selectAnimationIdle()))
  }

  override async turnEnd() {
    this.active = false
  }

  private executor: AiExecutor = {
    move: async (unit, path) => {
      this.selectionManager.showHighlight(path, 'path')
      await gameDelay(ENEMY_SPEED * 2)
      const dest = path[path.length - 1].owner as Cell
      await this.selectionManager.selectDestinationAndMove(unit, dest, path)
    },
    attack: async (unit, target) => {
      if (target.cell) this.selectionManager.showHighlight([target.cell.pathNode], 'attack')
      await gameDelay(ENEMY_SPEED * 2)
      await unit.attack(target)
      this.selectionManager.reset()
    },
    pause: () => gameDelay(ENEMY_SPEED)
  }

  override async makeMove(): Promise<boolean> {
    await gameDelay(150)
    this.turns++
    await playAiTurn(this.board, this, { difficulty: this.difficulty, personality: this.personality, round: this.turns }, this.executor, () => this.disposed)
    this.selectionManager.reset()
    await gameDelay(ENEMY_SPEED)
    return true
  }
}
