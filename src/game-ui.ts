import * as ex from 'excalibur'
import { Board } from './board'
import { Cell } from './cell'
import { SCALE } from './config'
import { forecastAttack, PLAIN_ATTACK } from './combat'
import { Player } from './player'
import { SelectionManager } from './selection-manager'
import { Unit } from './unit'
import { GameHint, GameHud } from './ui-components/game-hud'
import { UnitCard } from './ui-components/unit-card'
import { UnitMenu } from './ui-components/unit-menu'
import { PhaseBanner } from './ui-components/phase-banner'
import { GameOver, GameOverChoice } from './ui-components/game-over'
import { PauseMenu } from './ui-components/pause-menu'
import { Resources } from './resources'
import { MatchMusic } from './music'
import type { CameraController } from './camera-controller'
import { isTouchDevice, readableBoost } from './device'
import { SKILLS, SkillId } from './skills'
import { DIFFICULTIES, Difficulty } from './ai/weights'
import { cycleSpeed, getSpeed, isSpeedLocked } from './speed'
import { className, rangeNote } from './unit-classes'
import { unitClassOf } from './unit-types'
import { ForecastView, GameResultView, HudHighlight, HudView, MenuItem, OnlineHudView, Team, UnitStatus, UnitView } from './ui-components/view-models'
import { GameNotice, NoticeView } from './ui-components/game-notice'
import { inputMode, onInputModeChange, padLabel, type GamepadMatch } from './gamepad/gamepad-input'
import type { PadAnalog, PadButton } from './gamepad/controller'
import { t } from './i18n'
import { terrainView } from './terrain-info'
import { screenFacing } from './board-markers'
import { CombatLog } from './combat-log'
import { CombatLogPanel } from './ui-components/combat-log'
import type { AttackEventResult } from './board'
import type { AttackEvent } from './unit'
import { idleHint, noteHintUse, type HintCommand, type HintInput } from './hint-progress'

export interface MenuOptions {
  move: () => void
  attack: () => void
  pass: () => void
  undo: () => void
  skill: (id: SkillId) => void
  /** Tutorial: only these items (ids: move, attack, undo, pass, skill ids) can be picked, and they are highlighted */
  allows?: (id: string) => boolean
}

/** What the tutorial (TutorialMatch) changes in the match UI */
export interface TutorialUiControl {
  /** End turn can be pressed now */
  endTurnAllowed(): boolean
  /** Part of the top bar the current lesson talks about */
  hudHighlight(): HudHighlight | null
  /** The balloon waits for Next: the board ignores keys */
  blocksInput(): boolean
}

const TEAMS: Team[] = ['blue', 'red']
const REFRESH_MS = 150
/** Size of the in-game UI relative to the base sizes in the components */
const UI_SCALE = 1.3
const TEXT_SCALE = 1.1
/** Default top of the unit card in base units (keep in sync with unit-card.ts) */
const CARD_TOP = 84
/** Tiles above a unit used by floating texts (damage, skill names); the card keeps clear of them */
const FLOATING_TEXT_TILES = 1.5
/** The combat log stays open or closed between matches */
const PREF_LOG_OPEN = 'pixelfantasywar.combatLog.open'

/**
 * In-game HTML UI: top HUD, contextual hint, unit card / attack forecast,
 * unit action menu, phase banner and game over screen.
 *
 * Created per match by LevelBase and removed with `destroy()` when the scene
 * is deactivated. Reads the game state on pointer move and on a short timer.
 */
export class GameUI implements GamepadMatch {
  /** Called when the current human player clicks End Turn */
  onEndTurn: () => void = () => {}
  /** Called on Esc when no menu is open (cancel the current selection) */
  onCancel: () => void = () => {}
  /** Called when the player leaves the match from the pause menu */
  onQuit: () => void = () => {}
  /** Online: timer, spectators and emotes for the HUD (null offline) */
  onlineView: (() => OnlineHudView | null) | null = null
  /** Online: the player picked an emote */
  onEmote: (emote: string) => void = () => {}
  /** Online: "Mute emotes" in the pause menu */
  onToggleEmotes: () => void = () => {}
  /** Tutorial only (see TutorialMatch) */
  tutorial: TutorialUiControl | null = null

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
  private notice = new GameNotice()
  private logPanel = new CombatLogPanel()
  /** Every attack of the match, for the combat log panel */
  readonly combatLog = new CombatLog(unit => ({ name: this.className(unit), team: this.teamOf(unit.player) }), () => this.round)
  private logVersion = -1
  /** Eye button above the sound button: hides/shows the HUD, the hint and the unit card */
  private eye = document.createElement('button')
  private overlaysHidden = false

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
  private cameraListeners: (() => void)[] = []
  private interval: number
  private scale = 0
  /** UI_SCALE, enlarged on small screens so the text stays readable */
  private uiScale = UI_SCALE
  /** last input came from a finger: hints talk about taps instead of clicks */
  private touch = isTouchDevice()
  private onKeyDown = (event: KeyboardEvent) => this.handleKey(event)
  private stopInputMode: () => void

  constructor(engine: ex.Engine, board: Board, selection: SelectionManager, private camera: CameraController) {
    this.engine = engine
    this.board = board
    this.selection = selection

    this.root = document.createElement('div')
    this.root.className = 'game-ui'
    Object.assign(this.root.style, { position: 'fixed', inset: '0', pointerEvents: 'none', zIndex: '50' })
    // in-game panels are drawn 30% bigger than their base sizes, text a further 10%
    this.root.style.setProperty('--ui-scale', String(UI_SCALE))
    this.root.style.setProperty('--text-scale', String(TEXT_SCALE))
    this.setupEyeButton()
    // the eye comes before the dialogs, so an open menu/pause/game over covers it
    this.root.append(this.hud, this.hint, this.logPanel, this.card, this.eye, this.menu, this.banner, this.notice, this.gameOver, this.pauseMenu)
    document.body.appendChild(this.root)

    this.hud.addEventListener('end-turn', () => {
      this.noteCommand('end-turn')
      this.onEndTurn()
    })
    this.hud.addEventListener('pause', () => void this.pause())
    this.hud.addEventListener('speed', () => { cycleSpeed(); this.refresh() })
    this.logPanel.open = readLogOpen()
    this.logPanel.addEventListener('toggle', () => this.toggleLog())
    this.hud.addEventListener('emote', event => this.onEmote((event as CustomEvent<string>).detail))
    this.pauseMenu.addEventListener('toggle-emotes', () => this.onToggleEmotes())
    this.menu.addEventListener('select', event => this.onMenuSelect((event as CustomEvent<string>).detail))
    this.menu.addEventListener('close', () => this.dismissAll())

    const track = (event: ex.PointerEvent) => {
      // fingers are tracked by the camera's taps: a drag or a pinch doesn't pick a cell
      if (event.pointerType === ex.PointerType.Touch) return
      this.touch = false
      this.hovered = this.board.getCellByWorldPos(event.worldPos)
      this.refresh()
    }
    this.subscriptions.push(engine.input.pointers.on('move', track), engine.input.pointers.on('down', track))
    // on touch screens there is no hover: the tapped cell acts as the hovered one
    this.cameraListeners.push(
      camera.onTap(world => {
        this.touch = true
        this.hovered = this.board.getCellByWorldPos(world)
        this.refresh()
      }),
      camera.onChange(() => this.followCamera())
    )
    window.addEventListener('keydown', this.onKeyDown)
    // controller: hints show its buttons, and the card stops following taps
    this.stopInputMode = onInputModeChange(() => {
      if (inputMode() === 'gamepad') this.touch = false
      this.refresh()
    })
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
    return this.teamOf(player) === 'blue' ? t().common.blue : t().common.red
  }

  controllerLabel(player: Player): string {
    if (player.displayName) return player.displayName
    const sameKind = this.players.filter(p => p.isHuman === player.isHuman)
    const n = sameKind.indexOf(player) + 1
    const label = sameKind.length > 1
      ? (player.isHuman ? t().match.playerN(n) : t().match.cpuN(n))
      : (player.isHuman ? t().common.player : t().common.cpu)
    const difficulty = (player as Partial<{ difficulty: Difficulty }>).difficulty
    return difficulty ? t().match.withDifficulty(label, DIFFICULTIES[difficulty].label) : label
  }

  async playPhaseBanner(player: Player, round: number): Promise<void> {
    this.dismissAll()
    this.bannerActive = true
    this.refresh()
    // online: "Jean's turn"; otherwise "Blue phase"
    const title = player.displayName ? t().match.turnOf(player.displayName) : t().hud.phase(this.teamOf(player))
    const subtitle = t().match.roundOf(round, player.displayName ? this.teamLabel(player) : this.controllerLabel(player))
    await this.banner.play(this.teamOf(player), title, subtitle)
    this.bannerActive = false
    this.refresh()
  }

  /** Keyboard cursor: the cell under it is shown like the one under the mouse */
  setHovered(cell: Cell | null) {
    this.touch = false
    this.hovered = cell
    this.refresh()
  }

  /** One step of an attack was applied (Board.onAttackEvent, through the TurnManager) */
  recordAttack(event: AttackEvent, result: AttackEventResult) {
    this.combatLog.record(event, result)
  }

  /** Opens or closes the combat log (its button or L) */
  toggleLog() {
    this.logPanel.open = !this.logPanel.open
    try { localStorage.setItem(PREF_LOG_OPEN, this.logPanel.open ? '1' : '0') } catch { /* storage unavailable */ }
  }

  /** The player used a command: the idle hint stops showing it (hint-progress.ts) */
  noteCommand(command: HintCommand) {
    noteHintUse(this.hintInput(), command)
  }

  /** Which buttons the hints talk about */
  private hintInput(): HintInput {
    if (inputMode() === 'gamepad') return 'pad'
    return this.touch ? 'touch' : 'desktop'
  }

  /** A dialog or banner is up: the board shouldn't react to keys */
  isBlockingInput(): boolean {
    return this.menu.open || this.notice.open || this.hud.emotesOpen || this.isModalOpen() || !!this.tutorial?.blocksInput()
  }

  /**
   * Extra overlay of the match (the tutorial balloon): under the unit menu and
   * the dialogs, removed with the rest of the UI
   */
  addOverlay(element: HTMLElement) {
    this.root.insertBefore(element, this.menu)
  }

  /** Controller (gamepad-input.ts): right stick pans, triggers zoom towards the cursor */
  padCamera(analog: PadAnalog, elapsedMs: number) {
    const cell = this.hovered
    const tile = ex.vec(this.board.tileWidth * SCALE.x, this.board.tileHeight * SCALE.y)
    const focus = cell ? cell.pos.add(tile.scale(0.5)) : null
    this.camera.padControl(analog.panX, analog.panY, analog.zoomIn - analog.zoomOut, focus, elapsedMs)
  }

  /** Online: a message over the match (see GameNotice); resolves with the button picked */
  showNotice(view: NoticeView): Promise<string | null> {
    this.dismissAll()
    return this.notice.show(view)
  }

  changeNotice(changes: Partial<NoticeView>) {
    this.notice.change(changes)
  }

  closeNotice() {
    this.notice.close()
  }

  get noticeOpen(): boolean {
    return this.notice.open
  }

  /** Online: pause menu texts and the emote switch */
  setPauseOptions(options: { quitWarning?: string, emotesMuted?: boolean | null }) {
    if (options.quitWarning !== undefined) this.pauseMenu.quitWarning = options.quitWarning
    if (options.emotesMuted !== undefined) this.pauseMenu.emotesMuted = options.emotesMuted
  }

  /** Online: "Rematch" or "Stay in room" instead of "Play again" */
  setRematchLabel(label: string) {
    this.gameOver.rematchLabel = label
  }

  /** Pause menu, phase banner or game over: the map shouldn't zoom or pan */
  isModalOpen(): boolean {
    return this.pauseMenu.open || this.bannerActive || this.matchOver
  }

  /**
   * The camera moved or zoomed: the unit menu (the only UI that zooms with the
   * map) takes the new zoom and stays next to its unit
   */
  private followCamera() {
    this.menu.style.setProperty('--zoom', this.camera.zoom.toFixed(4))
    if (this.menu.open && this.menuUnit) this.menu.anchor = this.cellPageRect(this.menuUnit.cell)
    this.refresh()
  }

  showGameOver(result: GameResultView): Promise<GameOverChoice> {
    this.dismissAll()
    this.matchOver = true
    this.refresh()
    return this.gameOver.show(result)
  }

  /**
   * Freezes the match (engine clock stopped: animations, moves and the CPU's
   * actions wait), pauses the sounds playing and shows the pause menu.
   * Leaving calls `onQuit`.
   */
  async pause() {
    if (this.matchOver || this.pauseMenu.open) return
    this.noteCommand('pause')
    this.dismissAll()
    // Not engine.stop(): its 'stop' event makes every ex.Sound stop and refuse
    // to play again until a 'start' event. Stop only the clock instead.
    this.engine.clock.stop()
    const sounds = [...Object.values(Resources), ...MatchMusic.sounds].filter((r): r is ex.Sound => r instanceof ex.Sound && r.isPlaying())
    sounds.forEach(sound => sound.pause())
    const choice = await this.pauseMenu.show()
    this.engine.clock.start()
    if (choice === 'resume') sounds.forEach(sound => void sound.play())
    if (choice === 'quit') {
      this.matchOver = true
      this.onQuit()
    }
    this.refresh()
  }

  showUnitMenu(unit: Unit, options: MenuOptions) {
    this.menuUnit = unit
    this.menuOptions = options

    const skills = unit.unitConfig.skills
    // tutorial: only the item the lesson asks for can be picked
    const allows = options.allows
    const item = (id: string, label: string, enabled: boolean, extra: Partial<MenuItem> = {}): MenuItem => {
      const ok = enabled && (allows?.(id) ?? true)
      return { id, label, enabled: ok, highlight: !!allows && ok, ...extra }
    }
    const skillItems = skills.map(skill => item(skill.id, skill.name, unit.canUseSkill(skill.id), { detail: `${skill.cost} ${t().stats.mp}`, description: skill.description }))
    const anySkill = allows ? skillItems.some(s => s.enabled) : skills.length > 0
    const items: MenuItem[] = [
      item('move', t().match.move, unit.canMove()),
      item('attack', t().match.attack, unit.canAttack()),
      { id: 'skills', label: t().match.skills, enabled: anySkill, highlight: !!allows && anySkill, children: skillItems },
      ...(unit.canUndoMove() ? [item('undo', t().match.undo, true)] : []),
      item('pass', t().match.wait, true)
    ]

    this.menu.title = this.className(unit)
    this.menu.team = this.teamOf(unit.player)
    this.menu.items = items
    this.menu.anchor = this.cellPageRect(unit.cell)
    this.menu.open = true
    this.refresh()
  }

  /** Unit whose action menu is open */
  get openMenuUnit(): Unit | null {
    return this.menu.open ? this.menuUnit : null
  }

  dismissAll() {
    this.menu.open = false
    this.menuUnit = null
    this.menuOptions = null
  }

  /**
   * Hides or shows the HUD (team bars, pause, speed, End turn), the hint and
   * the unit card, to see the whole map. The unit's action menu, the phase
   * banner and the pause/game over dialogs always show.
   */
  toggleOverlays() {
    this.overlaysHidden = !this.overlaysHidden
    for (const el of [this.hud, this.hint, this.card, this.logPanel]) el.style.display = this.overlaysHidden ? 'none' : ''
    this.eye.textContent = this.overlaysHidden ? 'visibility_off' : 'visibility'
    this.eye.title = this.overlaysHidden ? t().match.showInterface : t().match.hideInterface
    this.eye.setAttribute('aria-pressed', String(this.overlaysHidden))
  }

  /** Same look and spot as the <audio-menu> buttons (index.html), one row above them */
  private setupEyeButton() {
    const eye = this.eye
    eye.type = 'button'
    eye.className = 'material-symbols-outlined'
    eye.textContent = 'visibility'
    eye.title = t().match.hideInterface
    eye.setAttribute('aria-label', t().match.toggleInterface)
    eye.setAttribute('aria-pressed', 'false')
    Object.assign(eye.style, {
      position: 'fixed',
      left: 'max(16px, env(safe-area-inset-left, 0px))',
      bottom: '56px',
      margin: '0',
      padding: '0',
      border: 'none',
      background: 'none',
      color: 'white',
      fontSize: '24px',
      lineHeight: '1',
      cursor: 'pointer',
      pointerEvents: 'auto'
    })
    eye.addEventListener('click', () => this.toggleOverlays())
  }

  destroy() {
    window.clearInterval(this.interval)
    if (this.pauseMenu.open) this.pauseMenu.resume()
    this.notice.close()
    this.stopInputMode()
    window.removeEventListener('keydown', this.onKeyDown)
    this.subscriptions.forEach(s => s.close())
    this.subscriptions = []
    this.cameraListeners.forEach(stop => stop())
    this.cameraListeners = []
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
    case 'undo': options.undo(); break
    default: if (id in SKILLS) options.skill(id as SkillId)
    }
    this.refresh()
  }

  private handleKey(event: KeyboardEvent) {
    const key = event.key.toLowerCase()
    // P (controller: Start) also closes the pause menu it opened
    if (key === 'p' && this.pauseMenu.open) { this.pauseMenu.resume(); return }
    // Enter (controller: A) skips the phase banner, like a click
    if (key === 'enter' && this.bannerActive) { this.banner.stop(); return }
    if (!this.pauseMenu.open && !this.matchOver && !this.menu.open && !event.ctrlKey && !event.metaKey) {
      if (key === 'e' && this.hud.view?.canEndTurn) { this.hud.requestEndTurn(); return }
      if (/^[1-9]$/.test(key) && this.hud.view?.online?.canEmote) { this.hud.sendEmote(Number(key) - 1); return }
      if (key === 't' && this.hud.view?.online?.canEmote) { this.hud.toggleEmotes(); this.refresh(); return }
      if (key === 'p') { void this.pause(); return }
      if (key === 'h') { this.toggleOverlays(); return }
      if (key === 'l') { this.toggleLog(); return }
    }
    if (event.key !== 'Escape') return
    if (this.pauseMenu.open) {
      this.pauseMenu.resume()
    } else if (this.matchOver || this.notice.open) {
      return
    } else if (this.hud.emotesOpen) {
      this.hud.toggleEmotes()
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
    return className(unitClassOf(unit.name))
  }

  private unitView(unit: Unit): UnitView {
    const status: UnitStatus[] = []
    const text = t().match
    const done = !unit.hasActions()
    if (done) status.push({ label: text.done })
    else {
      if (unit.moved) status.push({ label: text.moved })
      if (unit.attacked) status.push({ label: text.attacked })
    }
    if (unit.pendingSkill) status.push({ label: text.skillReady(unit.pendingSkill.name), hot: true })
    else if (unit.usedSkill) status.push({ label: text.skillUsed })
    if (unit.isInForest()) status.push({ label: text.forest })
    if (unit.isOnIce()) status.push({ label: text.ice })
    if (unit.braced) status.push({ label: text.braced })
    if (unit.pinned) status.push({ label: text.pinned })
    const stats = unit.combatStats()

    return {
      name: this.className(unit),
      team: this.teamOf(unit.player),
      hp: Math.max(unit.health, 0),
      maxHp: unit.unitConfig.health,
      mp: unit.mp,
      maxMp: unit.unitConfig.mp,
      attack: stats.attack,
      baseAttack: unit.unitConfig.attack,
      defense: stats.defense,
      baseDefense: unit.unitConfig.defense,
      range: unit.unitConfig.range,
      rangeNote: rangeNote(unit.name, unit.unitConfig.range),
      movement: unit.effectiveMovement,
      // the way it faces on screen (a mirrored board swaps left and right)
      facing: screenFacing(unit.miniDirection, this.board.mirrored),
      status,
      skills: unit.unitConfig.skills.map(skill => ({ name: skill.name, cost: skill.cost, affordable: unit.mp >= skill.cost })),
      done
    }
  }

  private hudView(): HudView | null {
    const current = this.currentPlayer
    if (!current || this.players.length < 2) return null
    const units = this.board.getLivingUnits()
    // the team drawn on the left of the board goes on the left of the bar
    const leftToRight = this.board.mirrored ? [...this.players].reverse() : this.players
    return {
      teams: leftToRight.map(player => {
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
      canEndTurn: current.isLocal && current.active && !this.matchOver,
      unitsWithActions: units.filter(u => u.player === current && u.hasActions()).length,
      canPause: !this.matchOver,
      speed: getSpeed(),
      speedLocked: isSpeedLocked(),
      endTurnLocked: this.tutorial ? !this.tutorial.endTurnAllowed() : false,
      confirmEndTurn: !this.tutorial,
      highlight: this.tutorial?.hudHighlight() ?? null,
      online: this.onlineView?.() ?? undefined
    }
  }

  private forecastView(): ForecastView | null {
    const attacker = this.selection.currentUnitSelection
    const target = this.hovered?.unit
    if (!attacker || !target || this.selection.currentSelectionMode !== 'attack') return null
    if (target.player === attacker.player || !target.cell) return null
    if (!this.selection.findAttackRange(attacker).includes(target.cell.pathNode)) return null

    const context = attacker.attackContext(target)
    const forecast = forecastAttack(attacker.combatStats(), target.combatStats(), context, target.health)
    // if the target may survive and can strike back, show the counterattack too
    const counter = forecast.killChance < 1 && target.canCounter(attacker, context)
      ? forecastAttack(target.combatStats(), attacker.combatStats(), PLAIN_ATTACK, attacker.health)
      : null
    return {
      attacker: this.unitView(attacker),
      defender: this.unitView(target),
      forecast,
      counter
    }
  }

  private hintText(): string {
    const current = this.currentPlayer
    if (this.matchOver || this.bannerActive || !current) return ''
    if (!current.isLocal) {
      return current.isHuman ? t().match.waitingFor(this.controllerLabel(current)) : t().match.thinking(this.teamLabel(current), this.controllerLabel(current))
    }
    if (inputMode() === 'gamepad') return this.padHintText()
    if (this.touch) return this.touchHintText()
    if (this.menu.open) return t().match.hintMenu
    if (this.selection.currentUnitSelection) {
      switch (this.selection.currentSelectionMode) {
      case 'move': return t().match.hintMove
      case 'attack': return t().match.hintAttack
      case 'heal': return t().match.hintHeal
      }
    }
    const idle = t().match.hintIdle
    return idleHint('desktop', [['select', idle.select], ['move-range', idle.moveRange], ['attack-range', idle.attackRange], ['next-unit', idle.nextUnit]])
  }

  /** Controller hints: {button} shows as that button of the controller in use */
  private padHintText(): string {
    const b = (button: PadButton) => `{${padLabel(button)}}`
    if (this.hud.emotesOpen) return t().match.padEmotes(b('a'), b('b'))
    if (this.menu.open) return t().match.padMenu(b('a'), b('b'))
    if (this.selection.currentUnitSelection) {
      switch (this.selection.currentSelectionMode) {
      case 'move': return t().match.padMove(b('a'), b('b'))
      case 'attack': return t().match.padAttack(b('a'), b('b'))
      case 'heal': return t().match.padHeal(b('a'), b('b'))
      }
    }
    const idle = t().match.padIdle
    return idleHint('pad', [
      ['select', idle.select(b('a'))],
      ['move-range', idle.moveRange(b('y'))],
      ['attack-range', idle.attackRange(b('x'))],
      ['next-unit', idle.nextUnit(`${b('lb')}${b('rb')}`)],
      ['end-turn', idle.endTurn(b('select'))],
      ['pause', idle.pause(b('start'))]
    ])
  }

  private touchHintText(): string {
    if (this.menu.open) return t().match.touchMenu
    if (this.selection.currentUnitSelection) {
      switch (this.selection.currentSelectionMode) {
      case 'move': return t().match.touchMove
      case 'attack': return t().match.touchAttack
      case 'heal': return t().match.touchHeal
      }
    }
    const idle = t().match.touchIdle
    // the inspect part covers both taps (range, then attack range)
    return idleHint('touch', [['select', idle.select], ['attack-range', idle.inspect]])
  }

  private refresh() {
    this.updateScale()
    this.hud.view = this.hudView()
    this.hint.text = this.hintText()
    if (this.combatLog.version !== this.logVersion) {
      this.logVersion = this.combatLog.version
      this.logPanel.entries = this.combatLog.entries
      this.logPanel.version = this.logVersion
    }

    if (this.matchOver || this.bannerActive) {
      this.card.unit = null
      this.card.forecast = null
      this.card.terrain = null
      return
    }

    const forecast = this.forecastView()
    const unit = this.hovered?.unit ?? this.menuUnit ?? this.selection.currentUnitSelection
    this.card.forecast = forecast
    this.card.unit = unit ? this.unitView(unit) : null
    // rules of the tile under the pointer (or of the shown unit's tile), above the unit card
    const terrainCell = this.hovered ?? unit?.cell
    this.card.terrain = !forecast && terrainCell ? terrainView(terrainCell.pathNode) : null

    // under the bar of the unit's own team (Blue left, Red right; swapped on a mirrored board);
    // the forecast goes under the attacker's team, a terrain card alone under the team playing
    const owner = (forecast ? this.selection.currentUnitSelection : unit)?.player ?? (this.card.terrain ? this.currentPlayer : null)
    if (this.touch && this.hovered) {
      // on a phone the card covers a big part of the map: keep it on the half
      // of the screen away from the tapped tile
      const cell = this.cellPageRect(this.hovered)
      this.card.side = (cell.left + cell.right) / 2 < window.innerWidth / 2 ? 'right' : 'left'
    } else if (owner) {
      this.card.side = (this.teamOf(owner) === 'blue') !== this.board.mirrored ? 'left' : 'right'
    }

    // the card sits over a corner of the map: if it would cover the unit under
    // the pointer, or the space above it where damage and skill names float up,
    // drop it right below that unit instead
    if (this.hovered) {
      const cell = this.cellPageRect(this.hovered)
      const floatingText = (cell.bottom - cell.top) * FLOATING_TEXT_TILES
      this.card.top = this.cardTopAvoiding({ ...cell, top: cell.top - floatingText })
    } else {
      this.card.top = null
    }
  }

  /** Page pixels per world pixel; drives every size in the UI through `--s` */
  private updateScale() {
    // screen space, not world: the map zoom (camera) must not scale the UI
    const screen = this.engine.screen
    const origin = screen.screenToPageCoordinates(ex.Vector.Zero)
    const scale = (screen.screenToPageCoordinates(ex.vec(1000, 0)).x - origin.x) / 1000
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
    // from the camera as it is now: the engine's transform lags a frame behind a zoom/pan
    const topLeft = this.camera.worldToPage(cell.pos)
    const size = ex.vec(this.board.tileWidth * SCALE.x, this.board.tileHeight * SCALE.y)
    const bottomRight = this.camera.worldToPage(cell.pos.add(size))
    return { left: topLeft.x, right: bottomRight.x, top: topLeft.y, bottom: bottomRight.y }
  }
}

function readLogOpen(): boolean {
  try { return localStorage.getItem(PREF_LOG_OPEN) === '1' } catch { return false }
}
