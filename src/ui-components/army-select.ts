import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { classDetailStyles, renderClassAbilities, renderClassStats } from './class-details'
import { CLASS_INFO } from '../unit-classes'
import type { UnitClass } from '../path-finding/terrain-rules'

export interface ArmyClassOption {
  unitClass: UnitClass
  role: string
  cost: number
  /** data URL of the class in this team's colors */
  portrait: string
}

export interface ArmySlot {
  /** spawn cell */
  x: number
  y: number
}

/**
 * Army builder for one team: pick a class for each spawn slot of the map
 * within a point budget. Fires `confirm` (detail = UnitClass[] in slot order)
 * and `back`.
 */
@customElement('army-select')
export class ArmySelect extends LitElement {
  static styles = [theme, classDetailStyles, css`
    :host { display: block; width: calc(1680 * var(--u)); max-width: 97vw; }
    .header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: calc(12 * var(--u)); }
    h2 { margin: 0; font-weight: normal; font-size: calc(44 * var(--t)); text-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000; }
    h2 span { color: var(--team); }
    .points { font-size: calc(26 * var(--t)); }
    .points.over { color: var(--red); }
    .points small { color: var(--muted); font-size: calc(16 * var(--t)); }

    .layout { display: grid; grid-template-columns: calc(760 * var(--u)) 1fr; gap: calc(20 * var(--u)); height: calc(800 * var(--u)); }

    .field { display: flex; flex-direction: column; min-height: 0; }
    .field .panel-title { font-size: calc(18 * var(--t)); justify-content: space-between; }
    .map { position: relative; margin: calc(12 * var(--u)); background: #000; }
    .map img { display: block; width: 100%; image-rendering: pixelated; opacity: 0.85; }
    .slot {
      all: unset;
      position: absolute;
      transform: translate(-50%, -62%);
      width: calc(46 * var(--u));
      height: calc(46 * var(--u));
      display: grid;
      place-items: center;
      cursor: pointer;
      border: calc(3 * var(--u)) solid transparent;
    }
    .slot img { width: 100%; height: 100%; image-rendering: pixelated; }
    .slot:hover { border-color: rgba(255, 255, 255, 0.6); }
    .slot.selected { border-color: var(--gold); background: rgba(255, 210, 63, 0.25); animation: pulse 900ms steps(2) infinite; }
    @keyframes pulse { 50% { border-color: #fff; } }

    .roster { display: flex; flex-direction: column; gap: calc(4 * var(--u)); padding: 0 calc(14 * var(--u)) calc(14 * var(--u)); overflow-y: auto; }
    .row { all: unset; display: grid; grid-template-columns: calc(26 * var(--u)) calc(40 * var(--u)) 1fr auto; align-items: center; gap: calc(8 * var(--u)); padding: calc(3 * var(--u)) calc(6 * var(--u)); cursor: pointer; font-size: calc(16 * var(--t)); }
    .row:hover { background: rgba(255, 255, 255, 0.06); }
    .row.selected { background: rgba(255, 210, 63, 0.15); outline: calc(2 * var(--u)) solid var(--gold); }
    .row img { width: calc(40 * var(--u)); height: calc(40 * var(--u)); image-rendering: pixelated; }
    .row .num { color: var(--muted); }
    .row .cost { color: var(--gold); }

    .classes { display: flex; flex-direction: column; min-height: 0; }
    .classes .panel-title { font-size: calc(18 * var(--t)); justify-content: space-between; }
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: calc(8 * var(--u)); padding: calc(10 * var(--u)); overflow-y: auto; align-items: start; }
    .card {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.05);
      border: calc(3 * var(--u)) solid transparent;
    }
    .card:hover { background: rgba(255, 255, 255, 0.1); }
    .card.current { border-color: var(--gold); }
    .card.open { border-color: var(--edge); background: rgba(255, 255, 255, 0.08); }
    .card.open.current { border-color: var(--gold); }
    .card.unaffordable:not(.open) { opacity: 0.4; }
    .card .toggle {
      all: unset;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: calc(8 * var(--u));
      padding: calc(10 * var(--u));
      cursor: pointer;
    }
    .card .head { display: grid; grid-template-columns: calc(64 * var(--u)) 1fr auto auto; gap: calc(10 * var(--u)); align-items: center; }
    .card img { width: calc(64 * var(--u)); height: calc(64 * var(--u)); image-rendering: pixelated; background: rgba(0, 0, 0, 0.3); }
    .card .name { font-size: calc(22 * var(--t)); line-height: 1; }
    .card .name small { display: block; font-size: calc(14 * var(--t)); color: var(--gold); margin-top: calc(3 * var(--u)); }
    .card .price { font-size: calc(24 * var(--t)); color: var(--gold); text-align: right; }
    .card .price small { display: block; font-size: calc(14 * var(--t)); color: var(--muted); }
    .card .chevron { font-size: calc(16 * var(--t)); color: var(--muted); width: calc(16 * var(--u)); text-align: center; }
    .card.open .chevron { color: var(--ink); }
    .card .more { display: flex; flex-direction: column; gap: calc(10 * var(--u)); padding: 0 calc(10 * var(--u)) calc(10 * var(--u)); }
    .card .pick-row { display: flex; align-items: center; justify-content: flex-end; gap: calc(12 * var(--u)); }
    .card .pick-row .note { font-size: calc(14 * var(--t)); color: var(--red); }
    .card .pick { font-size: calc(20 * var(--t)); padding: calc(8 * var(--u)) calc(20 * var(--u)); }

    .actions { display: flex; align-items: center; gap: calc(14 * var(--u)); margin-top: calc(14 * var(--u)); }
    .actions .keys { flex: 1; font-size: calc(14 * var(--t)); color: var(--muted); }
    .actions .btn { font-size: calc(24 * var(--t)); padding: calc(10 * var(--u)) calc(24 * var(--u)); --team: #2a2d3a; }
    .actions .confirm { --team: var(--red); min-width: calc(220 * var(--u)); }
    .actions .confirm:disabled { opacity: 0.4; }
  `]

  /** 0 = Blue, 1 = Red */
  @property({ type: Number })
    team = 0

  /** e.g. "Player 1" */
  @property()
    playerLabel = ''

  @property()
    mapName = ''

  /** terrain-only preview of the map */
  @property()
    preview = ''

  @property({ type: Number })
    mapWidth = 28

  @property({ type: Number })
    mapHeight = 17

  @property({ attribute: false })
    slots: ArmySlot[] = []

  @property({ attribute: false })
    classes: ArmyClassOption[] = []

  /** army drawn in the map ("Classic army" button) */
  @property({ attribute: false })
    defaultArmy: UnitClass[] = []

  /** army shown when the screen opens (last choice or the default) */
  @property({ attribute: false })
    initialArmy: UnitClass[] = []

  /** builds a random valid army ("Random" button) */
  @property({ attribute: false })
    randomize?: () => UnitClass[]

  @property({ type: Number })
    budget = 100

  @state()
  private army: UnitClass[] = []

  @state()
  private selected = 0

  /** class card opened to show everything about it */
  @state()
  private expanded: UnitClass | null = null

  /** element to focus after the next render (keyboard / gamepad flow) */
  private focusAfterRender: string | null = null

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (this.expanded) this.collapse()
      else this.dispatchEvent(new Event('back'))
    } else if (event.key === 'Enter' && this.canConfirm()) {
      // Enter on a focused button is that button's click, not "confirm army"
      const target = event.composedPath()[0]
      if (target instanceof HTMLElement && target.closest('button') && !target.classList.contains('confirm')) return
      this.confirm()
    }
  }

  override connectedCallback() {
    super.connectedCallback()
    window.addEventListener('keydown', this.onKeyDown)
  }

  override disconnectedCallback() {
    window.removeEventListener('keydown', this.onKeyDown)
    super.disconnectedCallback()
  }

  override willUpdate(changed: Map<string, unknown>) {
    // new team or new map: start from the initial army again
    if (changed.has('team') || changed.has('initialArmy') || changed.has('slots')) {
      this.army = [...this.initialArmy]
      this.selected = 0
      this.expanded = null
    }
  }

  override updated() {
    if (!this.focusAfterRender) return
    const element = this.renderRoot.querySelector<HTMLElement>(this.focusAfterRender)
    this.focusAfterRender = null
    if (!element) return
    element.focus({ preventScroll: true })
    element.closest('.card')?.scrollIntoView({ block: 'nearest' })
  }

  private toggle(unitClass: UnitClass) {
    if (this.expanded === unitClass) {
      this.collapse()
      return
    }
    this.expanded = unitClass
    // straight to "Pick" when it can be picked, so A / Enter twice recruits
    this.focusAfterRender = this.fits(unitClass)
      ? `.card[data-class="${unitClass}"] .pick`
      : `.card[data-class="${unitClass}"] .toggle`
  }

  private collapse() {
    if (!this.expanded) return
    this.focusAfterRender = `.card[data-class="${this.expanded}"] .toggle`
    this.expanded = null
  }

  private option(unitClass: UnitClass) {
    return this.classes.find(c => c.unitClass === unitClass)
  }

  private total(army = this.army) {
    return army.reduce((sum, c) => sum + (this.option(c)?.cost ?? 0), 0)
  }

  private canConfirm() {
    return this.army.length === this.slots.length && this.total() <= this.budget
  }

  /** Points left if the selected slot became `unitClass` */
  private fits(unitClass: UnitClass) {
    const next = [...this.army]
    next[this.selected] = unitClass
    return this.total(next) <= this.budget
  }

  private assign(unitClass: UnitClass) {
    if (!this.fits(unitClass)) return
    const next = [...this.army]
    next[this.selected] = unitClass
    this.army = next
    this.selected = (this.selected + 1) % this.slots.length
    this.collapse()
    this.dispatchEvent(new Event('pick'))
  }

  private confirm() {
    this.dispatchEvent(new CustomEvent<UnitClass[]>('confirm', { detail: [...this.army] }))
  }

  private renderSlot(slot: ArmySlot, index: number) {
    const unitClass = this.army[index]
    const left = ((slot.x + 0.5) / this.mapWidth) * 100
    const top = ((slot.y + 0.5) / this.mapHeight) * 100
    return html`
      <button
        class="slot ${index === this.selected ? 'selected' : ''}"
        style="left: ${left}%; top: ${top}%"
        title="Slot ${index + 1}: ${unitClass}"
        @click=${() => { this.selected = index }}
      ><img src=${this.option(unitClass)?.portrait ?? ''} alt=${unitClass} /></button>
    `
  }

  /** Compact card (portrait, role, cost, stats); click opens the rest and the Pick button */
  private renderCard(option: ArmyClassOption) {
    const { unitClass } = option
    const current = this.army[this.selected] === unitClass
    const open = this.expanded === unitClass
    const fits = this.fits(unitClass)
    const classes = ['card', current ? 'current' : '', open ? 'open' : '', fits ? '' : 'unaffordable'].join(' ')
    return html`
      <div class=${classes} data-class=${unitClass}>
        <button class="toggle" aria-expanded=${open} @click=${() => this.toggle(unitClass)}>
          <div class="head">
            <img src=${option.portrait} alt="" />
            <div class="name">${unitClass}<small>${option.role}</small></div>
            <div class="price">${option.cost}<small>pts</small></div>
            <span class="chevron">${open ? '▾' : '▸'}</span>
          </div>
          ${renderClassStats(unitClass, { mp: false })}
        </button>
        ${open ? html`
          <div class="more details">
            <p class="desc">${CLASS_INFO[unitClass].description}</p>
            ${renderClassAbilities(unitClass)}
            <div class="pick-row">
              ${fits ? nothing : html`<span class="note">Not enough points</span>`}
              <button class="btn btn-solid pick" ?disabled=${!fits} @click=${() => this.assign(unitClass)}>
                Pick for slot ${this.selected + 1}
              </button>
            </div>
          </div>
        ` : nothing}
      </div>
    `
  }

  override render() {
    const total = this.total()
    const teamClass = this.team === 0 ? 'team-blue' : 'team-red'
    return html`
      <div class="header ${teamClass}">
        <h2>Build your army <span>· ${this.playerLabel}</span></h2>
        <div class="points ${total > this.budget ? 'over' : ''}">${total} / ${this.budget} <small>points</small></div>
      </div>
      <div class="layout">
        <div class="panel field ${teamClass}">
          <div class="panel-title"><span>${this.mapName}</span><span>Slot ${this.selected + 1} of ${this.slots.length}</span></div>
          <div class="map">
            <img src=${this.preview} alt="" />
            ${this.slots.map((slot, i) => this.renderSlot(slot, i))}
          </div>
          <div class="roster">
            ${this.army.map((unitClass, i) => html`
              <button class="row ${i === this.selected ? 'selected' : ''}" @click=${() => { this.selected = i }}>
                <span class="num">${i + 1}</span>
                <img src=${this.option(unitClass)?.portrait ?? ''} alt="" />
                <span>${unitClass}</span>
                <span class="cost">${this.option(unitClass)?.cost ?? 0}</span>
              </button>
            `)}
          </div>
        </div>
        <div class="panel classes ${teamClass}">
          <div class="panel-title"><span>Pick a class for slot ${this.selected + 1}</span><span>${this.budget - total} left</span></div>
          <div class="grid">${this.classes.map(option => this.renderCard(option))}</div>
        </div>
      </div>
      <div class="actions">
        <span class="keys">Pick a slot, then open a class to see it and pick it<span class="keys-only"> · Enter confirm · Esc back</span></span>
        <button class="btn btn-solid" @click=${() => { this.army = [...this.defaultArmy]; this.selected = 0 }}>Classic army</button>
        ${this.randomize ? html`<button class="btn btn-solid" @click=${() => { this.army = this.randomize?.() ?? this.army; this.selected = 0 }}>Random</button>` : nothing}
        <button class="btn btn-solid" @click=${() => this.dispatchEvent(new Event('back'))}>Back</button>
        <button class="btn btn-solid confirm" ?disabled=${!this.canConfirm()} @click=${() => this.confirm()}>Confirm</button>
      </div>
    `
  }
}
