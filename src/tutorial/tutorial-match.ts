/* eslint-disable no-console -- a script out of step with the rules is reported on the console for debugging */
import * as ex from 'excalibur'
import type { Board } from '../board'
import type { Cell } from '../cell'
import type { Player } from '../player'
import type { SelectionManager } from '../selection-manager'
import type { GameUI } from '../game-ui'
import type { CameraController } from '../camera-controller'
import type { TurnManager } from '../turn-manager'
import type { HudHighlight } from '../ui-components/view-models'
import type { GameAction, Pos } from '../online/protocol'
import { HumanPlayer, type ActionGate } from '../human-player'
import { ScriptedPlayer } from './scripted-player'
import { TutorialMarkers } from './tutorial-markers'
import { TUTORIAL_STEPS, type TutorialAction, type TutorialStep } from './script'
import { toGameAction } from './resolve'
import { afterTutorialSettings, markTutorialDone } from './tutorial-mode'
import { applyAction, rollAttackDice, type ActionPresenter } from '../online/actions'
import { fixedRolls } from '../unit'
import { ENEMY_SPEED } from '../config'
import { gameDelay, lockSpeed } from '../speed'
import { TutorialPanel } from '../ui-components/tutorial-panel'
import '../ui-components/tutorial-panel'

const REFRESH_MS = 150
const HUD_PARTS: HudHighlight[] = ['teams', 'round', 'pause', 'end-turn']

const samePos = (a: Pos | undefined, b: Pos | undefined) => !!a && !!b && a[0] === b[0] && a[1] === b[1]

/** Whether the player did exactly the scripted action (the dice are the script's anyway) */
function matches(expected: TutorialAction, got: GameAction): boolean {
  if (expected.a !== got.a) return false
  switch (expected.a) {
  case 'end-turn': return true
  case 'move': return got.a === 'move' && samePos(expected.unit, got.unit) && samePos(expected.to, got.path[got.path.length - 1]) && expected.skill === got.skill
  case 'attack': return got.a === 'attack' && samePos(expected.unit, got.unit) && samePos(expected.target, got.target) && expected.skill === got.skill
  case 'self-skill': return got.a === 'self-skill' && samePos(expected.unit, got.unit) && expected.skill === got.skill
  case 'heal': return got.a === 'heal' && samePos(expected.unit, got.unit) && samePos(expected.target, got.target)
  default: return samePos(expected.unit, (got as { unit?: Pos }).unit)
  }
}

/** Menu item that starts the scripted action */
function menuItemOf(action: TutorialAction): string | null {
  switch (action.a) {
  case 'move': return action.skill ?? 'move'
  case 'attack': return action.skill ?? 'attack'
  case 'self-skill': return action.skill
  case 'heal': return 'skill-heal'
  case 'undo': return 'undo'
  case 'pass': return 'pass'
  default: return null
  }
}

/**
 * The "Learn to play" match (mode 'tutorial'), created by LevelBase. Walks
 * through TUTORIAL_STEPS: shows each lesson in the balloon, lets the player do
 * only the scripted action (ActionGate on the HumanPlayer, with the script's
 * dice), plays the red side's actions itself (ScriptedPlayer) and, at the end,
 * offers a real match on the same map against the CPU on Easy.
 */
export class TutorialMatch {
  private index = 0
  private human!: HumanPlayer
  private red!: ScriptedPlayer
  private players: Player[] = []
  private turnManager: TurnManager | null = null
  private panel = new TutorialPanel()
  private markers: TutorialMarkers
  /** Player whose phase is going on (after its banner) */
  private phasePlayer: Player | null = null
  private phaseWaiters: (() => void)[] = []
  private nextWaiter: (() => void) | null = null
  private actionWaiter: (() => void) | null = null
  /** Cell of the unit that did the last scripted action */
  private lastActed: Pos | null = null
  private interval: number
  private disposed = false
  private onKeyDown = (event: KeyboardEvent) => this.handleKey(event)

  constructor(private engine: ex.Engine, scene: ex.Scene, private board: Board, private selection: SelectionManager, private ui: GameUI) {
    this.markers = new TutorialMarkers(scene)
    lockSpeed(1)
    // before the players' listeners: Enter on Next must not also act on the board
    window.addEventListener('keydown', this.onKeyDown)
    ui.addOverlay(this.panel)
    ui.tutorial = {
      endTurnAllowed: () => this.doStep()?.action.a === 'end-turn',
      hudHighlight: () => this.hudHighlight(),
      blocksInput: () => !!this.nextWaiter
    }
    ui.setRematchLabel('Play a match')
    this.panel.addEventListener('next', () => this.next())
    this.panel.addEventListener('skip', () => void this.turnManager?.quit())
    this.interval = window.setInterval(() => this.refresh(), REFRESH_MS)
  }

  /** Step being played (browser tests read it through window.__game) */
  get currentStep(): TutorialStep | undefined {
    return TUTORIAL_STEPS[this.index]
  }

  createPlayers(camera: CameraController): Player[] {
    this.human = new HumanPlayer('Human', this.engine, this.selection, this.ui, this.board, camera)
    this.human.gate = this.gate
    this.red = new ScriptedPlayer('CPU', this.board)
    this.players = [this.human, this.red]
    return this.players
  }

  attach(turnManager: TurnManager) {
    this.turnManager = turnManager
    turnManager.hooks = {
      phaseStarted: player => {
        this.phasePlayer = player
        const waiters = this.phaseWaiters
        this.phaseWaiters = []
        waiters.forEach(resolve => resolve())
      },
      phaseEnded: () => { this.phasePlayer = null },
      ended: result => { if (result.winner === this.human) markTutorialDone() },
      describe: result => {
        if (result.winner !== this.human) return null
        // the dialog takes over from the balloon
        this.show('', false)
        return { title: 'Tutorial complete!', subtitle: 'Ready for a real match? Same map and armies, against the CPU on Easy.', team: 'blue' }
      },
      finished: async (result, choice) => {
        if (choice === 'menu') await turnManager.returnToMainMenu()
        else await turnManager.level.restart(result.winner === this.human ? afterTutorialSettings() : undefined)
      }
    }
    void this.run()
  }

  dispose() {
    if (this.disposed) return
    this.disposed = true
    window.clearInterval(this.interval)
    window.removeEventListener('keydown', this.onKeyDown)
    this.markers.clear()
    lockSpeed(null)
    this.ui.tutorial = null
    // let the step loop see `disposed` and stop
    this.phaseWaiters.forEach(resolve => resolve())
    this.phaseWaiters = []
    this.nextWaiter?.()
    this.actionWaiter?.()
  }

  // ---- the step loop ----

  private async run() {
    for (this.index = 0; this.index < TUTORIAL_STEPS.length; this.index++) {
      const step = TUTORIAL_STEPS[this.index]
      const team = this.teamOf(this.index)
      // after the winning blow: the text stays while the game over screen comes
      if (team === null) {
        this.show(step.text ?? '', false)
        continue
      }
      await this.waitForPhase(team)
      if (this.disposed) return

      if (step.kind === 'info') {
        this.show(step.text, true)
        await this.waitForNext()
      } else if (step.kind === 'do') {
        const done = new Promise<void>(resolve => { this.actionWaiter = resolve })
        this.show(step.text, false)
        this.reopenMenu(step.action)
        await done
        this.actionWaiter = null
      } else {
        // an announcement ("Here they come!") stays up while the enemy keeps playing
        if (step.text) this.show(step.text, false)
        if (!await this.playCpu(step)) return
        // a lesson about an enemy attack: read it before going on
        if (step.text && step.action.a === 'attack' && !this.disposed) {
          this.show(step.text, true)
          await this.waitForNext()
          this.show('', false)
        }
      }
      if (this.disposed) return
    }
  }

  /** Side that plays step `index` (0 Blue, 1 Red); texts belong to the next action. null: after the last action */
  private teamOf(index: number): 0 | 1 | null {
    const action = TUTORIAL_STEPS.slice(index).find(step => step.kind !== 'info')
    if (!action) return null
    return action.kind === 'do' ? 0 : 1
  }

  private async waitForPhase(team: 0 | 1) {
    // the other side's turn and the phase banner come first: no stale lesson meanwhile
    if (this.phasePlayer !== this.players[team]) this.show('', false)
    while (!this.disposed && this.phasePlayer !== this.players[team]) {
      await new Promise<void>(resolve => this.phaseWaiters.push(resolve))
    }
  }

  private waitForNext(): Promise<void> {
    return new Promise<void>(resolve => {
      this.nextWaiter = () => {
        this.nextWaiter = null
        resolve()
      }
    })
  }

  private next() {
    this.nextWaiter?.()
  }

  /** Same unit as the last action (move, then attack): its menu opens again by itself */
  private reopenMenu(action: TutorialAction) {
    if (action.a === 'end-turn' || !samePos(action.unit, this.lastActed ?? undefined)) return
    if (this.ui.openMenuUnit || this.selection.currentUnitSelection) return
    this.human.maybeSelectUnit(this.cellAt(action.unit), true)
  }

  private show(text: string, canNext: boolean) {
    this.panel.text = text
    this.panel.canNext = canNext
    this.panel.progress = this.index / TUTORIAL_STEPS.length
    this.refresh()
  }

  /** The red side's scripted action, animated like the CPU's. False when the script broke */
  private async playCpu(step: TutorialStep & { kind: 'cpu' }): Promise<boolean> {
    try {
      const ended = await applyAction(this.board, this.red, toGameAction(this.board, this.red, step.action), this.animated)
      if (ended) this.red.endPhase()
      return true
    } catch (error) {
      // only if the rules or the map changed without updating the script (tests/tutorial.test.ts)
      console.error('Tutorial script out of step', error)
      this.show('Something went wrong with the tutorial. Back to the menu...', false)
      await gameDelay(2500)
      await this.turnManager?.quit()
      return false
    }
  }

  private animated: ActionPresenter = {
    move: async (unit, path) => {
      this.selection.showHighlight(path, 'path')
      await gameDelay(ENEMY_SPEED)
      await unit.move(path)
      this.selection.reset()
    },
    attack: async (unit, target, rolls) => {
      if (target.cell) this.selection.showHighlight([(target.cell as Cell).pathNode], 'attack')
      await gameDelay(ENEMY_SPEED)
      await unit.attack(target, fixedRolls(rolls))
      this.selection.reset()
    }
  }

  // ---- what the player may do ----

  /** The current step when it waits for the player */
  private doStep(): (TutorialStep & { kind: 'do' }) | null {
    const step = TUTORIAL_STEPS[this.index]
    return step?.kind === 'do' && this.actionWaiter && this.phasePlayer === this.human ? step : null
  }

  private cellAt(pos: Pos): Cell | null {
    return this.board.getCell(pos[0], pos[1])
  }

  private gate: ActionGate = {
    allowsUnit: unit => {
      const action = this.doStep()?.action
      return !!action && action.a !== 'end-turn' && this.cellAt(action.unit)?.unit === unit
    },
    allowsMenu: (unit, id) => {
      const action = this.doStep()?.action
      return !!action && action.a !== 'end-turn' && this.cellAt(action.unit)?.unit === unit && menuItemOf(action) === id
    },
    allowsTarget: (unit, cell) => {
      const action = this.doStep()?.action
      if (!action || action.a === 'end-turn' || this.cellAt(action.unit)?.unit !== unit) return false
      if (action.a === 'move') return this.cellAt(action.to) === cell
      if (action.a === 'attack' || action.a === 'heal') return this.cellAt(action.target) === cell
      return false
    },
    allowsEndTurn: () => this.doStep()?.action.a === 'end-turn',
    attackRolls: () => {
      const action = this.doStep()?.action
      return action?.a === 'attack' ? action.rolls : rollAttackDice()
    },
    done: action => {
      const step = this.doStep()
      if (!step) return
      if (!matches(step.action, action)) {
        console.warn('Tutorial: unexpected action', action, 'wanted', step.action)
        return
      }
      // the step is over right now (the game may reopen the unit's menu at once)
      const resolve = this.actionWaiter
      this.actionWaiter = null
      this.lastActed = action.a === 'move' ? action.path[action.path.length - 1] : 'unit' in action ? action.unit : null
      resolve?.()
    },
    refused: () => this.panel.shake()
  }

  /** Enter / Space (controller: A) = Next */
  private handleKey(event: KeyboardEvent) {
    if (!this.nextWaiter || (event.key !== 'Enter' && event.key !== ' ')) return
    if (this.ui.isModalOpen()) return
    event.preventDefault()
    event.stopImmediatePropagation()
    this.next()
  }

  // ---- highlights ----

  private hudHighlight(): HudHighlight | null {
    const step = TUTORIAL_STEPS[this.index]
    if (!step || this.phasePlayer === null) return null
    if (step.kind === 'do' && step.action.a === 'end-turn') return 'end-turn'
    return step.ui && (HUD_PARTS as string[]).includes(step.ui) ? step.ui as HudHighlight : null
  }

  /** Frames the unit to select, then (once it is in the right mode) the tile to pick */
  private refresh() {
    const step = TUTORIAL_STEPS[this.index]
    if (this.disposed || !step || this.phasePlayer === null || step.kind === 'cpu') {
      this.markers.clear()
      return
    }
    const cells = (step.cells ?? []).map(pos => this.cellAt(pos))
    if (step.kind === 'do' && step.action.a !== 'end-turn') {
      const action = step.action
      const unitCell = this.cellAt(action.unit)
      const target = action.a === 'move' ? action.to : action.a === 'attack' || action.a === 'heal' ? action.target : null
      const mode = this.selection.currentSelectionMode
      const picking = !!target && !!unitCell?.unit && this.selection.currentUnitSelection === unitCell.unit &&
        mode === (action.a === 'move' ? 'move' : action.a === 'attack' ? 'attack' : 'heal')
      cells.push(picking && target ? this.cellAt(target) : unitCell)
    }
    this.markers.show(cells.filter((cell): cell is Cell => !!cell))
  }
}
