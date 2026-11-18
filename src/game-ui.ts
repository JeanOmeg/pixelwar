import * as ex from 'excalibur'
import { Board } from './board'
import { Cell } from './cell'
import { SCALE } from './config'
import { forecastAttack } from './combat'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { Unit } from './unit'
import { GameHint, GameHud } from './ui-components/game-hud'
import { UnitCard } from './ui-components/unit-card'
import { UnitMenu } from './ui-components/unit-menu'
import { PhaseBanner } from './ui-components/phase-banner'
import { GameOver, GameOverChoice } from './ui-components/game-over'
import { PauseMenu } from './ui-components/pause-menu'
import { isTouchDevice, readableBoost } from './device'
import { ForecastView, GameResultView, HudView, MenuItem, Team, UnitView } from './ui-components/view-models'

export interface MenuOptions {
  move: () => void
  attack: () => void
  pass: () => void
  run: () => void
  specialAttack: () => void
}

const TEAMS: Team[] = ['blue', 'red']
const TEAM_LABELS: Record<Team, string> = { blue: 'Blue', red: 'Red' }
const REFRESH_MS = 150
/** Size of the in-game UI relative to the base sizes in the components */
const UI_SCALE = 1.3
const TEXT_SCALE = 1.1
/** Default top of the unit card in base units (keep in sync with unit-card.ts) */
const CARD_TOP = 84

/**
 * In-game HTML UI: top HUD, contextual hint, unit card / attack forecast,
 * unit action menu, phase banner and game over screen.
 *
 * Created per match by LevelBase and removed with `destroy()` when the scene
 * is deactivated. Reads the game state on pointer move and on a short timer.
 */
export class GameUI {
  /** Called when the current human player clicks End Turn */
  onEndTurn: () => void = () => {}
  /** Called on Esc when no menu is open (cancel the current selection) */
  onCancel: () => void = () => {}
  /** Called when the player leaves the match from the pause menu */
  onQuit: () => void = () => {}

  private engine: ex.Engine
  private board: Board
  private selection: SelectionManager
  private root: HTMLDivElement
  private hud = new GameHud()
  private hint = new GameHint()
  private card = new UnitCard()
  private menu = new UnitMenu()
  private banner = new PhaseBanner()
  private gameOver = new GameOver()
  private pauseMenu = new PauseMenu()

  private players: Player[] = []
  private currentPlayer: Player | null = null
  private round = 1
  private phasesLeft = 0
  private totals = new Map<Player, { units: number, hp: number }>()
  private hovered: Cell | null = null
  private menuUnit: Unit | null = null
  private menuOptions: MenuOptions | null = null
  private bannerActive = false
  private matchOver = false
  private subscriptions: ex.Subscription[] = []
  private interval: number
  private scale = 0
  /** UI_SCALE, enlarged on small screens so the text stays readable */
  private uiScale = UI_SCALE
  /** last input came from a finger: hints talk about taps instead of clicks */
  private touch = isTouchDevice()
  private onKeyDown = (event: KeyboardEvent) => this.handleKey(event)

  constructor(engine: ex.Engine, board: Board, selection: SelectionManager) {
    this.engine = engine
    this.board = board
    this.selection = selection

    this.root = document.createElement('div')
    this.root.className = 'game-ui'
    Object.assign(this.root.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50' })
    // in-game panels are drawn 30% bigger than their base sizes, text a further 10%
    this.root.style.setProperty('--ui-scale', String(UI_SCALE))
    this.root.style.setProperty('--text-scale', String(TEXT_SCALE))
    this.root.append(this.hud, this.hint, this.card, this.menu, this.banner, this.gameOver, this.pauseMenu)
    document.body.appendChild(this.root)

    this.hud.addEventListener('end-turn', () => this.onEndTurn())
    this.hud.addEventListener('pause', () => void this.pause())
    this.menu.addEventListener('select', event => this.onMenuSelect((event as CustomEvent<string>).detail))
    this.menu.addEventListener('close', () => this.dismissAll())

    // on touch screens there is no hover: the tapped cell acts as the hovered one
    const track = (event: ex.PointerEvent) => {
      this.touch = event.pointerType === ex.PointerType.Touch
      this.hovered = this.board.getCellByWorldPos(event.worldPos)
      this.refresh()
    }
    this.subscriptions.push(engine.input.pointers.on('move', track), engine.input.pointers.on('down', track))
    window.addEventListener('keydown', this.onKeyDown)
    this.interval = window.setInterval(() => this.refresh(), REFRESH_MS)
    this.refresh()
  }

  setPlayers(players: Player[]) {
    this.players = players
  }

  setTurn(player: Player, round: number, phasesLeft: number) {
    if (this.totals.size === 0) this.captureTotals()
    this.currentPlayer = player
    // a tap has no "pointer leaves": drop the last tapped cell at each phase
    if (this.touch) this.hovered = null
    this.round = round
    this.phasesLeft = phasesLeft
    this.refresh()
  }

  teamOf(player: Player): Team {
    return TEAMS[this.players.indexOf(player)] ?? 'blue'
  }

  teamLabel(player: Player): string {
    return TEAM_LABELS[this.teamOf(player)]
  }

  controllerLabel(player: Player): string {
    const sameKind = this.players.filter(p => p.isHuman === player.isHuman)
    const base = player.isHuman ? 'Player' : 'CPU'
    return sameKind.length > 1 ? `${base} ${sameKind.indexOf(player) + 1}` : base
  }

  async playPhaseBanner(player: Player, round: number): Promise<void> {
    this.dismissAll()
    this.bannerActive = true
    this.refresh()
    await this.banner.play(this.teamOf(player), `${this.teamLabel(player)} phase`, `Round ${round} - ${this.controllerLabel(player)}`)
    this.bannerActive = false
    this.refresh()
  }

  showGameOver(result: GameResultView): Promise<GameOverChoice> {
    this.dismissAll()
    this.matchOver = true
    this.refresh()
    return this.gameOver.show(result)
  }

  /**
   * Freezes the match (engine loop stopped: animations, moves and the CPU's
   * actions wait) and shows the pause menu. Leaving calls `onQuit`.
   */
  async pause() {
    if (this.matchOver || this.pauseMenu.open) return
    this.dismissAll()
    this.engine.stop()
    const choice = await this.pauseMenu.show()
    // engine.start() would run the loader again: just restart the main loop
    this.engine.browser.resume()
    this.engine.clock.start()
    if (choice === 'quit') {
      this.matchOver = true
      this.onQuit()
    }
    this.refresh()
  }

  showUnitMenu(unit: Unit, options: MenuOptions) {
    this.menuUnit = unit
    this.menuOptions = options

    const skills = unit.unitConfig.skill ?? []
    const items: MenuItem[] = [
      { id: 'move', label: 'Move', enabled: unit.canMove() },
      { id: 'attack', label: 'Attack', enabled: unit.canAttack() },
      {
        id: 'skills',
        label: 'Skills',
        enabled: skills.length > 0,
        children: skills.map(skill => ({
          id: skill.event,
          label: skill.name,
          detail: `${skill.cost} MP`,
          description: skill.description,
          enabled: unit.canUseSkill(skill.event)
        }))
      },
      { id: 'pass', label: 'Wait', enabled: true }
    ]

    this.menu.title = this.className(unit)
    this.menu.team = this.teamOf(unit.player)
    this.menu.items = items
    this.menu.anchor = this.cellPageRect(unit.cell)
    this.menu.open = true
    this.refresh()
  }

  dismissAll() {
    this.menu.open = false
    this.menuUnit = null
    this.menuOptions = null
  }

  destroy() {
    window.clearInterval(this.interval)
    if (this.pauseMenu.open) this.pauseMenu.resume()
    window.removeEventListener('keydown', this.onKeyDown)
    this.subscriptions.forEach(s => s.close())
    this.subscriptions = []
    this.banner.stop()
    this.root.remove()
  }

  private onMenuSelect(id: string) {
    const options = this.menuOptions
    this.dismissAll()
    if (!options) return
    switch (id) {
    case 'move': options.move(); break
    case 'attack': options.attack(); break
    case 'pass': options.pass(); break
    case 'skill-run': options.run(); break
    case 'skill-special-attack': options.specialAttack(); break
    }
    this.refresh()
  }

  private handleKey(event: KeyboardEvent) {
    if (event.key !== 'Escape') return
    if (this.pauseMenu.open) {
      this.pauseMenu.resume()
    } else if (this.matchOver) {
      return
    } else if (this.menu.open) {
      this.dismissAll()
    } else if (this.bannerActive) {
      this.banner.stop()
    } else if (this.selection.currentUnitSelection) {
      this.onCancel()
    } else {
      void this.pause()
    }
    this.refresh()
  }

  private captureTotals() {
    const units = this.board.getLivingUnits()
    for (const player of this.players) {
      const own = units.filter(u => u.player === player)
      this.totals.set(player, { units: own.length, hp: own.reduce((sum, u) => sum + u.unitConfig.health, 0) })
    }
  }

  private className(unit: Unit) {
    return unit.name.replace(/[AB]$/, '')
  }

  private unitView(unit: Unit): UnitView {
    const status: string[] = []
    const done = !unit.hasActions()
    if (done) status.push('Done')
    else {
      if (unit.moved) status.push('Moved')
      if (unit.attacked) status.push('Attacked')
    }
    if (unit.isRunning) status.push('Running')
    if (unit.forcesCritical) status.push('Critical ready')
    if (unit.usedSkill && !unit.isRunning && !unit.forcesCritical) status.push('Skill used')

    return {
      name: this.className(unit),
      team: this.teamOf(unit.player),
      hp: Math.max(unit.health, 0),
      maxHp: unit.unitConfig.health,
      mp: unit.mp,
      maxMp: unit.unitConfig.mp,
      attack: unit.unitConfig.attack,
      defense: unit.unitConfig.defense,
      range: unit.unitConfig.range,
      movement: unit.effectiveMovement,
      facing: unit.miniDirection,
      status,
      done
    }
  }

  private hudView(): HudView | null {
    const current = this.currentPlayer
    if (!current || this.players.length < 2) return null
    const units = this.board.getLivingUnits()
    return {
      teams: this.players.map(player => {
        const own = units.filter(u => u.player === player)
        const total = this.totals.get(player) ?? { units: own.length, hp: 0 }
        return {
          team: this.teamOf(player),
          label: this.teamLabel(player),
          controller: this.controllerLabel(player),
          alive: own.length,
          total: total.units,
          hp: own.reduce((sum, u) => sum + Math.max(u.health, 0), 0),
          maxHp: total.hp
        }
      }),
      activeTeam: this.teamOf(current),
      round: this.round,
      phasesLeft: this.phasesLeft,
      canEndTurn: current.isHuman && current.active && !this.matchOver,
      unitsWithActions: units.filter(u => u.player === current && u.hasActions()).length,
      canPause: !this.matchOver
    }
  }

  private forecastView(): ForecastView | null {
    const attacker = this.selection.currentUnitSelection
    const target = this.hovered?.unit
    if (!attacker || !target || this.selection.currentSelectionMode !== 'attack') return null
    if (target.player === attacker.player || !target.cell) return null
    if (!this.selection.findAttackRange(attacker).includes(target.cell.pathNode)) return null

    return {
      attacker: this.unitView(attacker),
      defender: this.unitView(target),
      forecast: forecastAttack(
        attacker.unitConfig,
        target.unitConfig,
        { forcesCritical: attacker.forcesCritical, backAttack: attacker.isBehind(target) },
        target.health
      )
    }
  }

  private hintText(): string {
    const current = this.currentPlayer
    if (this.matchOver || this.bannerActive || !current) return ''
    if (!current.isHuman) return `${this.teamLabel(current)} (${this.controllerLabel(current)}) is thinking...`
    if (this.touch) return this.touchHintText()
    if (this.menu.open) return 'Choose an action · [Esc] close'
    if (this.selection.currentUnitSelection) {
      return this.selection.currentSelectionMode === 'move'
        ? 'Click a highlighted tile to move · [Esc] cancel'
        : 'Click an enemy in range to attack · [Esc] cancel'
    }
    return '[Left click] select unit · [Right click] move range · [Middle click] attack range'
  }

  private touchHintText(): string {
    if (this.menu.open) return 'Choose an action · [tap outside] close'
    if (this.selection.currentUnitSelection) {
      return this.selection.currentSelectionMode === 'move'
        ? '[Tap] a tile to preview, [tap again] to move · tap outside to cancel'
        : '[Tap] an enemy to preview, [tap again] to attack · tap outside to cancel'
    }
    return '[Tap] your unit to act · [tap] other units to see their range (again: attack range)'
  }

  private refresh() {
    this.updateScale()
    this.hud.view = this.hudView()
    this.hint.text = this.hintText()

    if (this.matchOver || this.bannerActive) {
      this.card.unit = null
      this.card.forecast = null
      return
    }

    const forecast = this.forecastView()
    const unit = this.hovered?.unit ?? this.menuUnit ?? this.selection.currentUnitSelection
    this.card.forecast = forecast
    this.card.unit = unit ? this.unitView(unit) : null

    // under the bar of the unit's own team (Blue left, Red right);
    // the forecast goes under the attacker's team
    const owner = forecast ? this.selection.currentUnitSelection : unit
    if (this.touch && this.hovered) {
      // on a phone the card covers a big part of the map: keep it on the half
      // of the screen away from the tapped tile
      const cell = this.cellPageRect(this.hovered)
      this.card.side = (cell.left + cell.right) / 2 < window.innerWidth / 2 ? 'right' : 'left'
    } else if (owner) {
      this.card.side = this.teamOf(owner.player) === 'blue' ? 'left' : 'right'
    }

    // the card sits over a corner of the map: if it would cover the unit under
    // the pointer, drop it right below that unit instead
    this.card.top = this.hovered ? this.cardTopAvoiding(this.cellPageRect(this.hovered)) : null
  }

  /** Page pixels per world pixel; drives every size in the UI through `--s` */
  private updateScale() {
    const screen = this.engine.screen
    const origin = screen.worldToPageCoordinates(ex.Vector.Zero)
    const scale = (screen.worldToPageCoordinates(ex.vec(1000, 0)).x - origin.x) / 1000
    if (Number.isFinite(scale) && scale > 0 && Math.abs(scale - this.scale) > 0.0001) {
      this.scale = scale
      this.uiScale = UI_SCALE * readableBoost(scale * UI_SCALE)
      this.root.style.setProperty('--s', scale.toFixed(4))
      this.root.style.setProperty('--ui-scale', this.uiScale.toFixed(4))
    }
  }

  /**
   * Page `top` for the unit card: null keeps its default place under the HUD,
   * a number moves it below `cell` when the default place would cover it.
   */
  private cardTopAvoiding(cell: { left: number, right: number, top: number, bottom: number }): number | null {
    const box = this.card.shadowRoot?.firstElementChild?.getBoundingClientRect()
    if (!box || box.width === 0) return null
    const defaultTop = CARD_TOP * this.scale * this.uiScale
    const defaultBottom = defaultTop + box.height
    const covers = cell.left < box.right && cell.right > box.left && cell.top < defaultBottom && cell.bottom > defaultTop
    return covers ? cell.bottom + 8 : null
  }

  private cellPageRect(cell: Cell | null) {
    if (!cell) return { left: 0, right: 0, top: 0, bottom: 0 }
    const screen = this.engine.screen
    const topLeft = screen.worldToPageCoordinates(cell.pos)
    const size = ex.vec(this.board.tileWidth * SCALE.x, this.board.tileHeight * SCALE.y)
    const bottomRight = screen.worldToPageCoordinates(cell.pos.add(size))
    return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y }
  }
}
