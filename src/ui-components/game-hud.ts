import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { iconStyles } from './icons'
import { HudHighlight, HudView, TeamView, hpLevel } from './view-models'
import { EMOTES, TURN_WARNING_SECONDS, emoteLabel } from '../online/protocol'

/**
 * Top bar: both teams (units left, total HP), round/phase and End Turn.
 * Fires `end-turn` when the current human player confirms, `pause` and
 * `speed` (cycle the game speed). Online it also shows the turn timer (a
 * countdown and a bar along the bottom of the center panel), the spectator
 * count and the emotes; picking one fires `emote` (detail: the text).
 */
@customElement('game-hud')
export class GameHud extends LitElement {
  static styles = [theme, iconStyles, css`
    :host {
      position: absolute;
      top: calc(6 * var(--u));
      left: calc(14 * var(--u));
      right: calc(14 * var(--u));
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: start;
      gap: calc(16 * var(--u));
      pointer-events: none;
    }

    .team {
      display: flex;
      align-items: center;
      gap: calc(10 * var(--u));
      width: calc(330 * var(--u));
      padding: calc(5 * var(--u)) calc(10 * var(--u));
      opacity: 0.8;
      transition: opacity 200ms;
    }
    .team.right { justify-self: end; flex-direction: row-reverse; text-align: right; }
    .team.active { opacity: 1; border-color: var(--team); }

    .badge {
      display: grid;
      place-items: center;
      width: calc(34 * var(--u));
      height: calc(34 * var(--u));
      background: var(--team);
      border: calc(3 * var(--u)) solid var(--edge);
      color: #fff;
      font-size: calc(18 * var(--t));
      text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    }
    .active .badge { animation: pulse 900ms steps(2) infinite; }
    @keyframes pulse { 50% { filter: brightness(1.5); } }

    .info { flex: 1; display: flex; flex-direction: column; gap: calc(5 * var(--u)); min-width: 0; }
    .name { display: flex; gap: calc(8 * var(--u)); align-items: baseline; font-size: calc(17 * var(--t)); line-height: 1; }
    .right .name { flex-direction: row-reverse; }
    .name small { font-size: calc(14 * var(--t)); }

    .pips { display: flex; gap: calc(3 * var(--u)); }
    .right .pips { flex-direction: row-reverse; }
    .pip {
      width: calc(9 * var(--u));
      height: calc(9 * var(--u));
      background: var(--team);
      box-shadow: 0 0 0 calc(1 * var(--u)) #000;
    }
    .pip.dead { background: #2a2d3a; }
    .bar { height: calc(6 * var(--u)); }

    .center {
      display: flex;
      align-items: center;
      gap: calc(12 * var(--u));
      padding: calc(5 * var(--u)) calc(8 * var(--u)) calc(5 * var(--u)) calc(14 * var(--u));
      pointer-events: auto;
    }
    .phase { display: flex; flex-direction: column; gap: calc(4 * var(--u)); text-align: center; min-width: calc(150 * var(--u)); }
    .phase small { font-size: calc(14 * var(--t)); color: var(--muted); line-height: 1; }
    .phase strong {
      font-weight: normal;
      font-size: calc(22 * var(--t));
      line-height: 1;
      color: var(--team);
      text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    }
    .end-turn { font-size: calc(16 * var(--t)); padding: calc(7 * var(--u)) calc(12 * var(--u)); }
    .pause { --team: #2a2d3a; padding: calc(8 * var(--u)); }
    .speed { --team: #2a2d3a; font-size: calc(16 * var(--t)); padding: calc(7 * var(--u)) calc(10 * var(--u)); min-width: calc(48 * var(--u)); justify-content: center; }
    /* pixel pause sign: two bars */
    .pause i {
      display: block;
      width: calc(16 * var(--u));
      height: calc(18 * var(--u));
      background: linear-gradient(90deg, currentColor 0 35%, transparent 35% 65%, currentColor 65%);
    }
    .end-turn.confirm { background: var(--orange); }
    /* tutorial: End turn before its step, speed locked */
    .btn-solid:disabled { filter: grayscale(1) brightness(0.6); box-shadow: none; }
    /* tutorial: the part of the bar the lesson talks about */
    .tutorial-lit { outline: calc(3 * var(--u)) solid var(--gold); outline-offset: calc(3 * var(--u)); animation: lit 700ms steps(2) infinite; }
    @keyframes lit { 50% { outline-color: transparent; } }

    /* online: turn timer, emotes, spectators */
    .center { position: relative; }
    .clock { font-size: calc(22 * var(--t)); line-height: 1; min-width: calc(58 * var(--u)); text-align: center; text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000; }
    .timer-bar {
      position: absolute;
      left: calc(3 * var(--u));
      right: calc(3 * var(--u));
      bottom: calc(3 * var(--u));
      height: calc(4 * var(--u));
      background: rgba(0, 0, 0, 0.5);
      pointer-events: none;
    }
    .timer-bar i { display: block; height: 100%; background: var(--team); transition: width 250ms linear; }
    .warning .clock { color: var(--red); animation: blink 500ms steps(1) infinite; }
    .warning .timer-bar i { background: var(--red); animation: blink 500ms steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0.35; } }
    .watching { font-size: calc(16 * var(--t)); color: var(--muted); padding: 0 calc(6 * var(--u)); }
    .spectators { color: var(--muted); white-space: nowrap; }
    .emote-btn { --team: #2a2d3a; font-size: calc(16 * var(--t)); padding: calc(7 * var(--u)) calc(10 * var(--u)); }
    .emote-list {
      position: absolute;
      top: calc(100% + 6 * var(--u));
      left: 50%;
      transform: translateX(-50%);
      display: grid;
      grid-template-columns: repeat(3, auto);
      gap: calc(6 * var(--u));
      padding: calc(8 * var(--u));
      max-height: calc(420 * var(--u));
      overflow-y: auto;
      pointer-events: auto;
    }
    .emote-list .btn { --team: #2a2d3a; font-size: calc(16 * var(--t)); padding: calc(6 * var(--u)) calc(10 * var(--u)); justify-content: center; white-space: nowrap; }
    .emote-list small { font-size: calc(14 * var(--t)); color: var(--gold); margin-right: calc(4 * var(--u)); }
    .team-slot { position: relative; }
    .team-slot.right { justify-self: end; }
    .bubble {
      position: absolute;
      top: calc(100% + 8 * var(--u));
      padding: calc(6 * var(--u)) calc(12 * var(--u));
      font-size: calc(20 * var(--t));
      white-space: nowrap;
      background: #fff;
      color: #0b0d16;
      border: calc(3 * var(--u)) solid var(--team);
      box-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000;
      animation: pop 200ms steps(3) both;
    }
    .team-slot.left .bubble { left: calc(20 * var(--u)); }
    .team-slot.right .bubble { right: calc(20 * var(--u)); }
    @keyframes pop { from { transform: scale(0.4); opacity: 0; } }
  `]

  @property({ attribute: false })
    view: HudView | null = null

  @state()
  private confirming = false

  /** The emote list is open (read by GameUI: the board ignores keys meanwhile) */
  @state()
    emotesOpen = false

  /** T (controller: R3): opens or closes the emote list */
  toggleEmotes() {
    this.emotesOpen = this.view?.online?.canEmote ? !this.emotesOpen : false
  }

  private confirmTimer = 0

  /** Same as clicking End turn (keyboard shortcut): asks first if units can still act */
  requestEndTurn() {
    this.onEndTurn()
  }

  private onEndTurn() {
    if (!this.view?.canEndTurn || this.view.endTurnLocked) return
    if (this.view.unitsWithActions > 0 && this.view.confirmEndTurn !== false && !this.confirming) {
      this.confirming = true
      window.clearTimeout(this.confirmTimer)
      this.confirmTimer = window.setTimeout(() => { this.confirming = false }, 2500)
      return
    }
    this.confirming = false
    this.dispatchEvent(new Event('end-turn'))
  }

  override updated() {
    if (this.confirming && !this.view?.canEndTurn) this.confirming = false
    if (this.emotesOpen && !this.view?.online?.canEmote) this.emotesOpen = false
  }

  /** Keys 1-9 (GameUI): sends that emote */
  sendEmote(index: number) {
    const emote = EMOTES[index]
    if (emote && this.view?.online?.canEmote) this.pickEmote(emote)
  }

  private pickEmote(emote: string) {
    this.emotesOpen = false
    this.dispatchEvent(new CustomEvent('emote', { detail: emote }))
  }

  private renderClock() {
    const online = this.view?.online
    if (!online || online.timeLeft === null) return nothing
    const left = Math.max(0, Math.ceil(online.timeLeft))
    return html`<span class="clock" title="Time left in this turn">${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}</span>`
  }

  private renderTimerBar() {
    const online = this.view?.online
    if (!online || online.timeLeft === null) return nothing
    const ratio = Math.max(0, Math.min(1, online.timeLeft / online.timeTotal))
    return html`<div class="timer-bar"><i style="width: ${ratio * 100}%"></i></div>`
  }

  private renderEmotes() {
    const online = this.view?.online
    if (!online?.canEmote) return nothing
    return html`
      <button class="btn btn-solid emote-btn" title="Send a quick message (T, 1-9)" @click=${() => { this.emotesOpen = !this.emotesOpen }}>Say...</button>
      ${this.emotesOpen ? html`
        <div class="panel emote-list">
          ${EMOTES.map((emote, i) => html`<button class="btn btn-solid" @click=${() => this.pickEmote(emote)}>${i < 9 ? html`<small class="keys-only">${i + 1}</small>` : nothing}${emoteLabel(emote)}</button>`)}
        </div>
      ` : nothing}
    `
  }

  /** Tutorial: class for the part of the bar the current lesson points at */
  private lit(part: HudHighlight): string {
    return this.view?.highlight === part ? 'tutorial-lit' : ''
  }

  private renderTeam(team: TeamView, side: 'left' | 'right', active: boolean) {
    const pips = Array.from({ length: team.total }, (_, i) => i < team.alive)
    const emote = this.view?.online?.emotes[team.team]
    return html`
      <div class="team-slot ${side} team-${team.team}">
      ${emote ? html`<div class="bubble">${emoteLabel(emote)}</div>` : nothing}
      <div class="panel team team-${team.team} ${side} ${active ? 'active' : ''} ${this.lit('teams')}">
        <div class="badge">${team.alive}</div>
        <div class="info">
          <div class="name">${team.label}<small class="muted">${team.controller}</small></div>
          <div class="pips">${pips.map(alive => html`<span class="pip ${alive ? '' : 'dead'}"></span>`)}</div>
          <div class="bar hp ${hpLevel(team.hp, team.maxHp)}"><i style="width: ${(team.hp / Math.max(team.maxHp, 1)) * 100}%"></i></div>
        </div>
      </div>
      </div>
    `
  }

  override render() {
    const view = this.view
    if (!view || view.teams.length < 2) return nothing
    const [left, right] = view.teams
    const active = view.teams.find(t => t.team === view.activeTeam) ?? left
    const online = view.online
    const warning = online && online.timeLeft !== null && online.timeLeft <= TURN_WARNING_SECONDS

    return html`
      ${this.renderTeam(left, 'left', view.activeTeam === left.team)}
      <div class="panel center team-${active.team} ${warning ? 'warning' : ''}">
        ${view.canPause ? html`
          <button class="btn btn-solid pause ${this.lit('pause')}" title="Pause (P)" @click=${() => this.dispatchEvent(new Event('pause'))}><i></i></button>
          <button class="btn btn-solid speed" title=${view.speedLocked ? 'Game speed (fixed in the tutorial)' : 'Game speed'} ?disabled=${view.speedLocked} @click=${() => this.dispatchEvent(new Event('speed'))}>x${view.speed}</button>
        ` : nothing}
        ${this.renderEmotes()}
        <div class="phase ${this.lit('round')}">
          <small>Round ${view.round}${online && online.spectators > 0 ? html` · <span class="spectators" title="People watching">${online.spectators} watching</span>` : nothing}</small>
          <strong>${online ? active.controller : `${active.label} phase`}</strong>
        </div>
        ${this.renderClock()}
        ${online?.watching ? html`<span class="watching">Watching</span>` : nothing}
        ${view.canEndTurn ? html`
          <button class="btn btn-solid end-turn ${this.confirming ? 'confirm' : ''} ${this.lit('end-turn')}" title="End turn (E)" ?disabled=${view.endTurnLocked} @click=${this.onEndTurn}>
            ${this.confirming ? `${view.unitsWithActions} left - sure?` : 'End turn'}
          </button>
        ` : nothing}
        ${this.renderTimerBar()}
      </div>
      ${this.renderTeam(right, 'right', view.activeTeam === right.team)}
    `
  }
}

/** One-line contextual help at the bottom of the screen */
/** PlayStation face buttons keep their colors in the hints */
const PS_SYMBOLS: Record<string, string> = { '✕': 'ps-cross', '◯': 'ps-circle', '▢': 'ps-square', '△': 'ps-triangle' }

@customElement('game-hint')
export class GameHint extends LitElement {
  static styles = [theme, css`
    :host {
      position: absolute;
      left: 50%;
      bottom: calc(10 * var(--u));
      transform: translateX(-50%);
      pointer-events: none;
    }
    div {
      padding: calc(5 * var(--u)) calc(12 * var(--u));
      font-size: calc(15 * var(--t));
      line-height: 1;
      white-space: nowrap;
      background: rgba(0, 0, 0, 0.6);
      text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    }
    b { font-weight: normal; color: var(--gold); }
    /* a controller button: round for one symbol (A, ✕), a pill for names (LB, View) */
    .pad {
      display: inline-block;
      min-width: 1.35em;
      padding: 0.15em 0.35em;
      margin: 0 0.1em;
      box-sizing: border-box;
      border-radius: 0.8em;
      background: #e9ecf5;
      color: #14172a;
      text-align: center;
      text-shadow: none;
      box-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    }
    .pad.ps-cross { color: #3d6fe0; }
    .pad.ps-circle { color: #d8343f; }
    .pad.ps-square { color: #c4489c; }
    .pad.ps-triangle { color: #1b9d78; }
  `]

  /**
   * Segments separated by '·'; text inside [brackets] is highlighted and
   * {A} shows as a controller button
   */
  @property()
    text = ''

  override render() {
    if (!this.text) return nothing
    const parts = this.text.split(/(\[[^\]]+\]|\{[^}]+\})/).map(part => {
      if (part.startsWith('[')) return html`<b>${part.slice(1, -1)}</b>`
      if (part.startsWith('{')) {
        const label = part.slice(1, -1)
        return html`<span class="pad ${PS_SYMBOLS[label] ?? ''}">${label}</span>`
      }
      return part
    })
    return html`<div>${parts}</div>`
  }
}
