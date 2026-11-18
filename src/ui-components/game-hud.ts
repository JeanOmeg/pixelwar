import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { iconStyles } from './icons'
import { HudView, TeamView, hpLevel } from './view-models'

/**
 * Top bar: both teams (units left, total HP), round/phase and End Turn.
 * Fires `end-turn` when the current human player confirms, `pause` and
 * `speed` (cycle the game speed).
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
  `]

  @property({ attribute: false })
    view: HudView | null = null

  @state()
  private confirming = false

  private confirmTimer = 0

  /** Same as clicking End turn (keyboard shortcut): asks first if units can still act */
  requestEndTurn() {
    this.onEndTurn()
  }

  private onEndTurn() {
    if (!this.view?.canEndTurn) return
    if (this.view.unitsWithActions > 0 && !this.confirming) {
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
  }

  private renderTeam(team: TeamView, side: 'left' | 'right', active: boolean) {
    const pips = Array.from({ length: team.total }, (_, i) => i < team.alive)
    return html`
      <div class="panel team team-${team.team} ${side} ${active ? 'active' : ''}">
        <div class="badge">${team.alive}</div>
        <div class="info">
          <div class="name">${team.label}<small class="muted">${team.controller}</small></div>
          <div class="pips">${pips.map(alive => html`<span class="pip ${alive ? '' : 'dead'}"></span>`)}</div>
          <div class="bar hp ${hpLevel(team.hp, team.maxHp)}"><i style="width: ${(team.hp / Math.max(team.maxHp, 1)) * 100}%"></i></div>
        </div>
      </div>
    `
  }

  override render() {
    const view = this.view
    if (!view || view.teams.length < 2) return nothing
    const [left, right] = view.teams
    const active = view.teams.find(t => t.team === view.activeTeam) ?? left

    return html`
      ${this.renderTeam(left, 'left', view.activeTeam === left.team)}
      <div class="panel center team-${active.team}">
        ${view.canPause ? html`
          <button class="btn btn-solid pause" title="Pause (P)" @click=${() => this.dispatchEvent(new Event('pause'))}><i></i></button>
          <button class="btn btn-solid speed" title="Game speed" @click=${() => this.dispatchEvent(new Event('speed'))}>x${view.speed}</button>
        ` : nothing}
        <div class="phase">
          <small>Round ${view.round}</small>
          <strong>${active.label} phase</strong>
        </div>
        ${view.canEndTurn ? html`
          <button class="btn btn-solid end-turn ${this.confirming ? 'confirm' : ''}" title="End turn (E)" @click=${this.onEndTurn}>
            ${this.confirming ? `${view.unitsWithActions} left - sure?` : 'End turn'}
          </button>
        ` : nothing}
      </div>
      ${this.renderTeam(right, 'right', view.activeTeam === right.team)}
    `
  }
}

/** One-line contextual help at the bottom of the screen */
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
  `]

  /** Segments separated by '·'; text inside [brackets] is highlighted */
  @property()
    text = ''

  override render() {
    if (!this.text) return nothing
    const parts = this.text.split(/(\[[^\]]+\])/).map(part =>
      part.startsWith('[') ? html`<b>${part.slice(1, -1)}</b>` : part)
    return html`<div>${parts}</div>`
  }
}
