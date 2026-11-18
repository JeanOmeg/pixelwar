import type { GameAction } from './protocol'

export interface FeedEntry {
  index: number
  action: GameAction
  /** Played before this board joined (spectator mid-match, reconnection): apply at once */
  catchUp: boolean
}

/**
 * The match history in order: every action of both players. Local actions
 * are recorded as they happen (and sent); received ones wait here until the
 * player whose turn it is takes them. Both boards apply the same list in the
 * same order, so they stay the same.
 */
export class ActionFeed {
  readonly history: GameAction[] = []
  /** Next history index this board hasn't applied yet */
  private cursor = 0
  /** Entries below this were already played when the history arrived */
  private catchUpUntil = 0
  private wake: (() => void) | null = null
  /** Arrived ahead of a missing one (e.g. live actions before the history): kept until the gap fills */
  private early = new Map<number, GameAction>()
  private closed = false
  /** A local action was recorded: send it */
  onLocal: ((action: GameAction, index: number) => void) | null = null

  get length(): number {
    return this.history.length
  }

  /** Actions applied on this board so far (received ones may be waiting beyond it) */
  get applied(): number {
    return this.cursor
  }

  /** Something received is waiting to be applied */
  get hasPending(): boolean {
    return this.cursor < this.history.length
  }

  /** Still replaying what happened before this board joined */
  get catchingUp(): boolean {
    return this.cursor < this.catchUpUntil
  }

  /** The local player just did `action` on this board */
  recordLocal(action: GameAction) {
    if (this.closed) return
    const index = this.history.length
    this.history.push(action)
    this.cursor = this.history.length
    this.onLocal?.(action, index)
  }

  /**
   * An action from the network. Returns false when one is missing before it
   * (the caller asks for the whole history again); repeats are ignored.
   */
  receive(index: number, action: GameAction): boolean {
    if (index < this.history.length) return true
    if (index > this.history.length) {
      this.early.set(index, action)
      return false
    }
    this.history.push(action)
    this.drainEarly()
    this.wakeUp()
    return true
  }

  /**
   * The whole history so far (joining mid-match). Only replaces what this
   * board has if it is longer: entries this board already applied stay.
   */
  load(actions: GameAction[]) {
    if (actions.length <= this.history.length) return
    this.history.push(...actions.slice(this.history.length))
    this.catchUpUntil = this.history.length
    this.drainEarly()
    this.wakeUp()
  }

  /** Next action to apply, waiting for it if needed; null once closed */
  async next(): Promise<FeedEntry | null> {
    while (!this.closed && !this.hasPending) {
      await new Promise<void>(resolve => { this.wake = resolve })
    }
    if (this.closed) return null
    const index = this.cursor++
    return { index, action: this.history[index], catchUp: index < this.catchUpUntil }
  }

  /** Takes the next action only if it is already here (no waiting) */
  take(): FeedEntry | null {
    if (this.closed || !this.hasPending) return null
    const index = this.cursor++
    return { index, action: this.history[index], catchUp: index < this.catchUpUntil }
  }

  private drainEarly() {
    for (let next = this.early.get(this.history.length); next; next = this.early.get(this.history.length)) {
      this.early.delete(this.history.length)
      this.history.push(next)
    }
    for (const index of this.early.keys()) if (index < this.history.length) this.early.delete(index)
  }

  private wakeUp() {
    const wake = this.wake
    this.wake = null
    wake?.()
  }

  close() {
    this.closed = true
    this.onLocal = null
    this.wakeUp()
  }
}
