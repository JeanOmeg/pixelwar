import { t } from '../i18n'
/* eslint-disable no-console -- out-of-sync details go to the console for debugging */
import * as ex from 'excalibur'
import type { Board } from '../board'
import type { CameraController } from '../camera-controller'
import type { GameUI } from '../game-ui'
import { HumanPlayer } from '../human-player'
import type { Player } from '../player'
import { Resources } from '../resources'
import type { SelectionManager } from '../selection-manager'
import type { MatchResult, TurnManager } from '../turn-manager'
import type { GameOverChoice } from '../ui-components/game-over'
import type { OnlineHudView, Team } from '../ui-components/view-models'
import { boardHash } from './actions'
import type { ActionFeed } from './feed'
import {
  ONLINE_TURN_SECONDS, RECONNECT_SECONDS, TURN_GRACE_SECONDS, TURN_WARNING_SECONDS, type Emote, type Seat
} from './protocol'
import { RemotePlayer } from './remote-player'
import type { MatchEndInfo, OnlineSession } from './session'

const TEAMS: Team[] = ['blue', 'red']
const EMOTE_MS = 3000
const PREF_MUTE_EMOTES = 'pixelfantasywar.muteEmotes'
const TICK_MS = 250

function readMuted(): boolean {
  try { return localStorage.getItem(PREF_MUTE_EMOTES) === '1' } catch { return false }
}

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * One online match on this device: builds the players (this device's seat is
 * a HumanPlayer, the others are RemotePlayers fed by the network), and runs
 * what only exists online: the turn timer, emotes, lost connections, the
 * end-of-turn check that both boards match, forfeits and rematches.
 */
export class OnlineMatch {
  private players: Player[] = []
  private turnManager: TurnManager | null = null
  private ui: GameUI | null = null
  private board: Board | null = null
  private interval = 0
  private stops: (() => void)[] = []

  /** When the current turn runs out (ms, Date.now()); null = no timer */
  private deadline: number | null = null
  /** Turn time frozen while a player is disconnected (seconds left) */
  private frozenLeft: number | null = null
  private warned = false
  private timedOut = false
  /** The opponent ran out of time: "not responding" shows after the grace period, again after Wait */
  private unresponsiveAfter: number | null = null

  /** A player dropped (ms); they lose after RECONNECT_SECONDS */
  private lostSince: number | null = null

  private notice: 'lost' | 'unresponsive' | 'rematch' | 'closed' | null = null
  private emotes: Partial<Record<Team, { text: string, until: number }>> = {}
  private emotesMuted = readMuted()

  private localHashes = new Map<number, string>()
  private remoteHashes = new Map<number, string>()
  private over = false
  private leaving = false

  constructor(private session: OnlineSession, private engine: ex.Engine) {}

  private get feed(): ActionFeed {
    return this.session.feed as ActionFeed
  }

  private get seat(): Seat | null {
    return this.session.seat
  }

  createPlayers(board: Board, selection: SelectionManager, ui: GameUI, camera: CameraController): Player[] {
    this.board = board
    const seat = this.seat
    this.players = ([0, 1] as Seat[]).map(s => {
      const name = this.session.memberName(s)
      if (s === seat) {
        const human = new HumanPlayer(name, this.engine, selection, ui, board, camera)
        human.displayName = name
        human.feed = this.feed
        human.onOutOfSync = error => this.outOfSync(error)
        return human
      }
      return new RemotePlayer(name, board, this.feed, selection, error => this.outOfSync(error))
    })
    return this.players
  }

  attach(turnManager: TurnManager, ui: GameUI) {
    this.turnManager = turnManager
    this.ui = ui
    turnManager.hooks = {
      skipBanner: () => this.feed.catchingUp,
      phaseStarted: () => this.phaseStarted(),
      phaseEnded: player => this.phaseEnded(player),
      ended: () => this.ended(),
      finished: (result, choice) => this.finished(result, choice)
    }
    ui.onlineView = () => this.hudView()
    ui.onEmote = emote => {
      if (this.session.sendEmote(emote as Emote)) Resources.SelectSound.play()
    }
    ui.onToggleEmotes = () => this.toggleEmotes()
    ui.setPauseOptions({
      quitWarning: this.seat === null ? t().online.leaveWarning : t().online.forfeitWarning,
      emotesMuted: this.emotesMuted
    })
    ui.setRematchLabel(this.seat === null ? t().online.stayInRoom : t().online.rematch)
    ui.onQuit = () => {
      this.leaving = true
      this.session.leave()
      void turnManager.quit()
    }

    this.stops.push(
      this.session.emotes.on((seat, emote) => this.showEmote(seat, emote)),
      this.session.matchEnded.on(info => this.matchEnded(info)),
      this.session.turnHash.on((index, hash) => this.remoteHash(index, hash))
    )
    this.interval = window.setInterval(() => this.tick(), TICK_MS)
  }

  dispose() {
    window.clearInterval(this.interval)
    this.stops.forEach(stop => stop())
    this.stops = []
  }

  // --- turn timer ---

  private phaseStarted() {
    this.timedOut = false
    this.warned = false
    this.unresponsiveAfter = null
    // catching up on what already happened: no timer until it's live
    this.deadline = this.feed.catchingUp ? null : Date.now() + ONLINE_TURN_SECONDS * 1000
    this.frozenLeft = null
    this.session.round = this.turnManager?.round ?? 1
    this.session.updateListing()
    this.session.touch()
  }

  private timeLeft(): number | null {
    if (this.frozenLeft !== null) return this.frozenLeft
    return this.deadline === null ? null : (this.deadline - Date.now()) / 1000
  }

  private tick() {
    if (this.over || this.leaving) return
    this.checkConnection()
    const current = this.turnManager?.currentPlayer
    if (!current) return

    // the turn went live after catching up: start its timer now
    if (this.deadline === null && this.frozenLeft === null && !this.feed.catchingUp && this.turnManager) {
      this.deadline = Date.now() + ONLINE_TURN_SECONDS * 1000
    }

    const left = this.timeLeft()
    if (left === null || this.frozenLeft !== null) return

    if (current.isLocal && current instanceof HumanPlayer) {
      if (!this.warned && left <= TURN_WARNING_SECONDS) {
        this.warned = true
        Resources.TargetSelectSound.play()
      }
      // time's up: end the turn (retried while an animation is still playing)
      if (left <= 0 && !this.timedOut) {
        void current.endTurn('timeout').then(ended => {
          if (ended) {
            this.timedOut = true
            this.ui?.dismissAll()
          }
        })
      }
    } else if (this.seat !== null && left <= -TURN_GRACE_SECONDS) {
      this.unresponsiveAfter ??= Date.now()
      if (Date.now() >= this.unresponsiveAfter && !this.notice) void this.showUnresponsive(current)
    }
  }

  private async showUnresponsive(current: Player) {
    if (!this.ui) return
    this.notice = 'unresponsive'
    const name = current.displayName ?? t().gameOver.theOpponent
    const choice = await this.ui.showNotice({
      title: t().online.notResponding(name),
      text: t().online.notRespondingText,
      buttons: [{ id: 'wait', label: t().online.wait, primary: true }, { id: 'leave', label: t().online.leave }]
    })
    if (this.notice === 'unresponsive') this.notice = null
    if (choice === 'leave') this.session.claimWin('abandoned')
    else if (choice === 'wait') this.unresponsiveAfter = Date.now() + TURN_GRACE_SECONDS * 1000
  }

  // --- lost connections ---

  private checkConnection() {
    const room = this.session.room
    if (this.session.status === 'closed' || this.session.status === 'rejected') {
      if (this.notice !== 'closed' && !this.over) void this.showClosed()
      return
    }
    if (!room) return
    const lost = ([0, 1] as Seat[]).find(s => s !== this.seat && room.seats[s] && !room.seats[s]?.connected) ?? null

    if (lost !== null && this.lostSince === null) {
      this.lostSince = Date.now()
      // the turn clock waits for them
      const left = this.timeLeft()
      if (left !== null) this.frozenLeft = Math.max(left, 0)
      void this.showLost(lost)
    } else if (lost === null && this.lostSince !== null) {
      this.lostSince = null
      if (this.frozenLeft !== null) {
        this.deadline = Date.now() + this.frozenLeft * 1000
        this.frozenLeft = null
      }
      if (this.notice === 'lost') this.ui?.closeNotice()
    }

    if (this.lostSince !== null && this.notice === 'lost') {
      const left = RECONNECT_SECONDS - (Date.now() - this.lostSince) / 1000
      this.ui?.changeNotice({ text: this.lostText(left) })
      if (left <= 0 && this.seat !== null) {
        this.ui?.closeNotice()
        this.session.claimWin('abandoned')
      }
    }
  }

  private lostText(secondsLeft: number): string {
    return this.seat === null
      ? t().online.waitingBack(formatTime(secondsLeft))
      : t().online.waitingBackWin(formatTime(secondsLeft))
  }

  private async showLost(seat: Seat) {
    if (!this.ui) return
    this.ui.closeNotice()
    this.notice = 'lost'
    const name = this.session.memberName(seat)
    const choice = await this.ui.showNotice({
      title: t().online.connectionLost(name),
      text: this.lostText(RECONNECT_SECONDS),
      buttons: this.seat === null ? [{ id: 'leave', label: t().online.leaveRoom }] : [{ id: 'leave', label: t().online.leaveAndWin }]
    })
    if (this.notice === 'lost') this.notice = null
    if (choice !== 'leave') return
    if (this.seat === null) this.quitToMenu()
    else this.session.claimWin('abandoned')
  }

  private async showClosed() {
    if (!this.ui) return
    this.ui.closeNotice()
    this.notice = 'closed'
    await this.ui.showNotice({
      title: t().online.disconnected,
      text: this.session.rejectReason === 'kicked' ? t().online.removed : t().online.connectionClosed,
      buttons: [{ id: 'menu', label: t().common.mainMenu, primary: true }]
    })
    this.quitToMenu()
  }

  // --- the end ---

  private matchEnded(info: MatchEndInfo) {
    if (this.over || !this.turnManager) return
    const winner = info.winner === null ? null : this.players[info.winner] ?? null
    this.ui?.closeNotice()
    this.turnManager.endWith({ winner, reason: info.reason === 'forfeit' ? 'forfeit' : 'abandoned' })
  }

  private outOfSync(error: unknown) {
    console.warn('Online match out of sync', error)
    this.ui?.closeNotice()
    this.turnManager?.endWith({ winner: null, reason: 'out-of-sync' })
  }

  private phaseEnded(player: Player) {
    if (!this.board) return
    const index = this.feed.applied
    const hash = boardHash(this.board)
    this.localHashes.set(index, hash)
    if (player.isLocal) this.session.sendTurnHash(index, hash)
    const remote = this.remoteHashes.get(index)
    if (remote && remote !== hash) this.outOfSync(new Error(`Board differs after ${index} actions`))
  }

  private remoteHash(index: number, hash: string) {
    this.remoteHashes.set(index, hash)
    const local = this.localHashes.get(index)
    if (local && local !== hash) this.outOfSync(new Error(`Board differs after ${index} actions`))
  }

  /** The game over screen is about to show: no more timer, emotes or notices */
  private ended() {
    this.over = true
    this.deadline = null
    this.frozenLeft = null
    this.emotes = {}
    if (this.notice === 'lost' || this.notice === 'unresponsive') this.ui?.closeNotice()
    this.session.matchOver()
  }

  private async finished(_result: MatchResult, choice: GameOverChoice) {
    if (choice === 'menu') {
      this.quitToMenu()
      return
    }
    if (this.seat === null) {
      // spectator: back to the room, to watch the next one
      await this.toLobby()
      return
    }
    this.session.requestRematch()
    await this.waitForRematch()
  }

  /** Both asked for a rematch: back to the lobby (colors swapped). Or the other one left. */
  private async waitForRematch() {
    const ui = this.ui
    if (!ui) return
    const matchNo = this.session.room?.matchNo ?? 0
    const opponent = this.seat === null ? null : this.session.memberName((1 - this.seat) as Seat)
    this.notice = 'rematch'
    const ready = new Promise<'lobby' | 'gone'>(resolve => {
      const check = () => {
        const room = this.session.room
        if (!room || this.session.status !== 'joined') return resolve('gone')
        if (room.phase === 'lobby' && room.matchNo > matchNo) return resolve('lobby')
        const other = this.seat === null ? null : room.seats[1 - this.seat]
        if (!other || !other.connected) ui.changeNotice({ text: t().online.leftRoom(opponent ?? ''), buttons: [{ id: 'menu', label: t().common.mainMenu, primary: true }] })
      }
      this.stops.push(this.session.changed.on(check))
      check()
    })
    const picked = ui.showNotice({
      title: t().online.rematch,
      text: t().online.waitingAccept(opponent ?? ''),
      buttons: [{ id: 'menu', label: t().common.mainMenu }]
    })
    const outcome = await Promise.race([ready, picked.then(() => 'menu' as const)])
    if (outcome === 'lobby') {
      ui.closeNotice()
      await this.toLobby()
    } else {
      this.quitToMenu()
    }
  }

  private async toLobby() {
    this.leaving = true
    await this.turnManager?.returnToMainMenu()
  }

  private quitToMenu() {
    if (this.leaving) return
    this.leaving = true
    this.session.leave()
    void this.turnManager?.returnToMainMenu()
  }

  // --- HUD ---

  private showEmote(seat: Seat, emote: Emote) {
    if (this.emotesMuted && seat !== this.seat) return
    this.emotes[TEAMS[seat]] = { text: emote, until: Date.now() + EMOTE_MS }
  }

  private toggleEmotes() {
    this.emotesMuted = !this.emotesMuted
    try { localStorage.setItem(PREF_MUTE_EMOTES, this.emotesMuted ? '1' : '0') } catch { /* not saved */ }
    if (this.emotesMuted) this.emotes = {}
    this.ui?.setPauseOptions({ emotesMuted: this.emotesMuted })
  }

  private hudView(): OnlineHudView {
    const now = Date.now()
    const emotes: Partial<Record<Team, string>> = {}
    for (const team of TEAMS) {
      const shown = this.emotes[team]
      if (shown && shown.until > now) emotes[team] = shown.text
    }
    const left = this.over ? null : this.timeLeft()
    return {
      timeLeft: left === null ? null : Math.max(left, 0),
      timeTotal: ONLINE_TURN_SECONDS,
      watching: this.seat === null,
      spectators: this.session.room?.spectators.length ?? 0,
      canEmote: this.seat !== null && !this.over,
      emotes
    }
  }
}
