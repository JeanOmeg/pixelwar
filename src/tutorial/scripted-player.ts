import * as ex from 'excalibur'
import { Player } from '../player'

/**
 * The red side of the tutorial. It doesn't think: TutorialMatch plays its
 * scripted actions and calls `endPhase` when the script ends its turn.
 */
export class ScriptedPlayer extends Player {
  private phase = new ex.Future<void>()

  /** The script ended this player's turn */
  endPhase() {
    this.phase.resolve()
  }

  override dispose() {
    super.dispose()
    this.phase.resolve()
  }

  override async makeMove(): Promise<boolean> {
    await this.phase.promise
    this.phase = new ex.Future()
    return true
  }
}
