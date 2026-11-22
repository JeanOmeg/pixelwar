import { LitElement, css, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { theme } from './theme'
import type { LogEntry, LogUnit } from '../combat-log'
import { percent } from './view-models'
import { t } from '../i18n'

/**
 * Combat history in the bottom right corner of the match: a small button
 * when closed, a scrolling list of the last attacks when open (newest at the
 * bottom). Fires `toggle`; GameUI keeps the open state (key L).
 */
@customElement('combat-log')
export class CombatLogPanel extends LitElement {
  static styles = [theme, css`
    :host {
      position: absolute;
      right: calc(14 * var(--u));
      bottom: calc(14 * var(--u));
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: calc(6 * var(--u));
    }
    .toggle {
      all: unset;
      pointer-events: auto;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: calc(6 * var(--u));
      padding: calc(5 * var(--u)) calc(12 * var(--u));
      font-size: calc(15 * var(--t));
      background: rgba(0, 0, 0, 0.6);
      text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000;
    }
    .toggle:hover, .toggle:focus-visible { background: rgba(0, 0, 0, 0.8); color: var(--gold); }
    .toggle .count { color: var(--muted); }
    .log {
      pointer-events: auto;
      width: calc(430 * var(--u));
      max-width: calc(100vw - 32px);
      display: flex;
      flex-direction: column;
    }
    .list {
      max-height: calc(300 * var(--u));
      overflow-y: auto;
      padding: calc(8 * var(--u)) calc(10 * var(--u));
      display: flex;
      flex-direction: column;
      gap: calc(4 * var(--u));
      font-size: calc(14 * var(--t));
      line-height: 1.25;
    }
    .round { margin-top: calc(4 * var(--u)); color: var(--muted); }
    .round:first-child { margin-top: 0; }
    .entry { padding-left: calc(8 * var(--u)); }
    .entry.counter { padding-left: calc(20 * var(--u)); }
    .blue { color: #7da6ff; }
    .red { color: #ff7a7a; }
    .dmg { color: var(--ink); }
    .miss { color: var(--muted); }
    .chance { color: var(--muted); }
    .crit { color: var(--gold); }
    .back { color: var(--orange); }
    .kill { color: var(--gold); }
    .effect { color: var(--mp); }
    .none { color: var(--muted); }
  `]

  @property({ attribute: false })
    entries: readonly LogEntry[] = []

  /** Changes whenever an entry is added (the list itself is the same array) */
  @property({ type: Number })
    version = 0

  @property({ type: Boolean, reflect: true })
    open = false

  private stickToBottom = true

  override updated() {
    const list = this.renderRoot.querySelector('.list')
    if (list && this.stickToBottom) list.scrollTop = list.scrollHeight
  }

  private onScroll(event: Event) {
    // reading older entries: don't jump down when a new one comes
    const list = event.currentTarget as HTMLElement
    this.stickToBottom = list.scrollTop + list.clientHeight >= list.scrollHeight - 4
  }

  private toggle() {
    this.stickToBottom = true
    this.dispatchEvent(new Event('toggle'))
  }

  private who(unit: LogUnit) {
    return html`<span class=${unit.team}>${unit.name}</span>`
  }

  private renderEntry(entry: LogEntry) {
    const text = t().log
    switch (entry.kind) {
    case 'strike': {
      const chance = entry.hitChance !== null && entry.hitChance < 0.995 ? html` <span class="chance">(${percent(entry.hitChance)})</span>` : nothing
      const result = entry.hit
        ? html`<span class="dmg">${text.damage(entry.damage)}</span>`
        : html`<span class="miss">${text.miss(entry.damage)}</span>`
      return html`<div class="entry ${entry.counter ? 'counter' : ''}">
        ${entry.counter ? html`<span class="miss">${text.counter}</span> ` : nothing}${this.who(entry.attacker)} ${entry.counter ? '↩' : '→'} ${this.who(entry.defender)}: ${result}${chance}
        ${entry.critical ? html` <span class="crit">${text.critical}</span>` : nothing}
        ${entry.back ? html` <span class="back">${text.back}</span>` : nothing}
        ${entry.killed ? html` <span class="kill">${text.defeated}</span>` : nothing}
      </div>`
    }
    case 'burn':
      return html`<div class="entry">${this.who(entry.attacker)} → ${this.who(entry.defender)}: <span class="effect">${text.burn(entry.damage)}</span>${entry.killed ? html` <span class="kill">${text.defeated}</span>` : nothing}</div>`
    case 'heal':
      return html`<div class="entry">${this.who(entry.unit)} <span class="effect">${text.heal(entry.amount)}</span></div>`
    case 'steal':
      return html`<div class="entry">${this.who(entry.attacker)} <span class="effect">${text.steal(entry.amount)}</span> ${this.who(entry.defender)}</div>`
    case 'pin':
      return html`<div class="entry">${this.who(entry.unit)} <span class="effect">${text.pinned}</span></div>`
    }
  }

  private renderList() {
    if (this.entries.length === 0) return html`<div class="none">${t().log.empty}</div>`
    let round = -1
    return this.entries.map(entry => {
      const header = entry.round !== round ? html`<div class="round">${t().log.round(entry.round)}</div>` : nothing
      round = entry.round
      return html`${header}${this.renderEntry(entry)}`
    })
  }

  override render() {
    return html`
      ${this.open ? html`
        <div class="panel log">
          <div class="panel-title"><span>${t().log.title}</span></div>
          <div class="list" @scroll=${(event: Event) => this.onScroll(event)}>${this.renderList()}</div>
        </div>
      ` : nothing}
      <button class="toggle" aria-expanded=${this.open} title=${t().log.toggle} @click=${() => this.toggle()}>
        ${this.open ? '▾' : '▸'} ${t().log.title}
        ${this.open ? nothing : html`<span class="count">${this.entries.length}</span>`}
        <span class="keys-only count">(L)</span>
      </button>
    `
  }
}
