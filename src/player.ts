import { Board } from './board'

export abstract class Player {
  private static _STARTING_BIT = 0b1 | 0
  private static _CURRENT_GROUP = Player._STARTING_BIT

  public readonly mask: number
  public active: boolean = false
  constructor(public name: string, public board: Board) {
    this.name = name
    this.board = board
    this.mask = Player._CURRENT_GROUP = (Player._CURRENT_GROUP << 1) | 0
  }

  async turnStart(): Promise<void> {
    this.active = true
    this.board.getUnits().filter(u => u.player === this).forEach(u => u.reset())
    this.board.getUnits().forEach(u => u.setAnim(u.selectAnimationIdle()))
  }

  hasLost() {
    const units = this.board.getUnits().filter(u => u.player === this)
    return units.length === 0
  }

  hasWon() {
    const units = this.board.getUnits().filter(u => u.player !== this)
    return units.length === 0
  }

  async turnEnd(): Promise<void> {
    this.active = false
  }

  /**
   * 
   * @returns true if done with turn, false if more moves to make
   */
  abstract makeMove(): Promise<boolean>
}