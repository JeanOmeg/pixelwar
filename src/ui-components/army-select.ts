import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import type { UnitClass } from '../path-finding/terrain-rules'

export interface ArmyClassOption {
  unitClass: UnitClass
  role: string
  cost: number
  hp: number
  attack: number
  defense: number
  range: number
  movement: number
  traits: string[]
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
  static styles = [theme, css`
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
    .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: calc(8 * var(--u)); padding: calc(10 * var(--u)); overflow-y: auto; }
    .card {
      all: unset;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: calc(64 * var(--u)) 1fr auto;
      gap: calc(4 * var(--u)) calc(10 * var(--u));
      align-items: center;
      padding: calc(8 * var(--u));
      background: rgba(255, 255, 255, 0.05);
      border: calc(3 * var(--u)) solid transparent;
      cursor: pointer;
    }
    .card:hover:not(:disabled) { background: rgba(255, 255, 255, 0.1); }
    .card.current { border-color: var(--gold); }
    .card:disabled { opacity: 0.35; cursor: not-allowed; }
    .card img { grid-row: span 2; width: calc(64 * var(--u)); height: calc(64 * var(--u)); image-rendering: pixelated; background: rgba(0, 0, 0, 0.3); }
    .card .name { font-size: calc(20 * var(--t)); line-height: 1; }
    .card .name small { display: block; font-size: calc(14 * var(--t)); color: var(--gold); margin-top: calc(3 * var(--u)); }
    .card .price { font-size: calc(22 * var(--t)); color: var(--gold); text-align: right; }
    .card .price small { display: block; font-size: calc(12 * var(--t)); color: var(--muted); }
    .card .stats { grid-column: 2 / span 2; display: flex; gap: calc(10 * var(--u)); font-size: calc(15 * var(--t)); color: var(--ink); }
    .card .stats b { font-weight: normal; color: var(--muted); font-size: calc(12 * var(--t)); margin-right: calc(2 * var(--u)); }
    .card .traits { grid-column: 1 / span 3; display: flex; flex-wrap: wrap; gap: calc(4 * var(--u)); }
    .card .traits .chip { font-size: calc(12 * var(--t)); color: var(--mp); }

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

  @property({ type: Number })
    budget = 100

  @state()
  private army: UnitClass[] = []

  @state()
  private selected = 0

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') this.dispatchEvent(new Event('back'))
    else if (event.key === 'Enter' && this.canConfirm()) this.confirm()
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
    }
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

  private renderCard(option: ArmyClassOption) {
    const current = this.army[this.selected] === option.unitClass
    return html`
      <button class="card ${current ? 'current' : ''}" ?disabled=${!this.fits(option.unitClass)} @click=${() => this.assign(option.unitClass)}>
        <img src=${option.portrait} alt="" />
        <div class="name">${option.unitClass}<small>${option.role}</small></div>
        <div class="price">${option.cost}<small>pts</small></div>
        <div class="stats">
          <span><b>HP</b>${option.hp}</span><span><b>ATK</b>${option.attack}</span><span><b>DEF</b>${option.defense}</span>
          <span><b>RNG</b>${option.range}</span><span><b>MOV</b>${option.movement}</span>
        </div>
        ${option.traits.length ? html`<div class="traits">${option.traits.map(t => html`<span class="chip">${t}</span>`)}</div>` : nothing}
      </button>
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
        <span class="keys">Pick a slot, then a class<span class="keys-only"> · Enter confirm · Esc back</span></span>
        <button class="btn btn-solid" @click=${() => { this.army = [...this.defaultArmy]; this.selected = 0 }}>Classic army</button>
        <button class="btn btn-solid" @click=${() => this.dispatchEvent(new Event('back'))}>Back</button>
        <button class="btn btn-solid confirm" ?disabled=${!this.canConfirm()} @click=${() => this.confirm()}>Confirm</button>
      </div>
    `
  }
}
