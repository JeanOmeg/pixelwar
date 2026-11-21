import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { classDetailStyles, renderClassAbilities, renderClassStats } from './class-details'
import { CLASS_INFO } from '../unit-classes'
import { UNIT_FOOTPRINT } from '../ui-sprites'
import type { UnitClass } from '../path-finding/terrain-rules'
import type { Placement } from '../deploy'
import { t } from '../i18n'

export interface ArmyClassOption {
  unitClass: UnitClass
  /** Class name in the current language */
  name: string
  role: string
  cost: number
  /** data URL of the class in this team's colors */
  portrait: string
}

export interface ArmySlot {
  /** board cell */
  x: number
  y: number
}

/** What `confirm` sends: class and cell of each slot, in slot order */
export interface ArmyChoice {
  army: UnitClass[]
  placement: Placement
}

/**
 * Army builder for one team: pick a class for each slot of the map within a
 * point budget, and where it starts inside the team's deploy zone. Fires
 * `confirm` (detail = ArmyChoice) and `back`.
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
    .map > img { display: block; width: 100%; image-rendering: pixelated; opacity: 0.85; }
    /* one tile per slot (the click area); the mini inside is drawn at its
       real size and place on the board (UNIT_FOOTPRINT), spilling out of it */
    .slot {
      all: unset;
      box-sizing: border-box;
      position: absolute;
      cursor: pointer;
      outline: calc(2 * var(--u)) solid transparent;
    }
    /* deploy zone: free tiles where the selected slot's unit can be moved */
    .zone {
      all: unset;
      box-sizing: border-box;
      position: absolute;
      cursor: pointer;
      background: color-mix(in srgb, var(--team) 28%, transparent);
      outline: calc(1 * var(--u)) solid color-mix(in srgb, var(--team) 45%, transparent);
      outline-offset: calc(-1 * var(--u));
    }
    .zone:hover, .zone:focus-visible { background: rgba(255, 255, 255, 0.35); }
    .slot img { position: absolute; image-rendering: pixelated; pointer-events: none; max-width: none; }
    .slot:hover { outline-color: rgba(255, 255, 255, 0.6); }
    .slot.empty { outline: calc(2 * var(--u)) dashed rgba(255, 255, 255, 0.55); background: rgba(0, 0, 0, 0.35); }
    .slot.selected { outline: calc(3 * var(--u)) solid var(--gold); background: rgba(255, 210, 63, 0.3); animation: pulse 900ms steps(2) infinite; z-index: 1; }
    @keyframes pulse { 50% { outline-color: #fff; } }

    .roster { display: flex; flex-direction: column; gap: calc(4 * var(--u)); padding: 0 calc(14 * var(--u)) calc(14 * var(--u)); overflow-y: auto; }
    .row { display: grid; grid-template-columns: 1fr auto; align-items: center; }
    .row:hover { background: rgba(255, 255, 255, 0.06); }
    .row.selected { background: rgba(255, 210, 63, 0.15); outline: calc(2 * var(--u)) solid var(--gold); }
    .row .pick-slot { all: unset; display: grid; grid-template-columns: calc(26 * var(--u)) calc(40 * var(--u)) 1fr auto; align-items: center; gap: calc(8 * var(--u)); padding: calc(3 * var(--u)) calc(6 * var(--u)); cursor: pointer; font-size: calc(16 * var(--t)); }
    .row img { width: calc(40 * var(--u)); height: calc(40 * var(--u)); image-rendering: pixelated; }
    .row .num { color: var(--muted); }
    .row .cost { color: var(--gold); }
    .row.empty .label { color: var(--muted); }
    .row .placeholder { width: calc(32 * var(--u)); height: calc(32 * var(--u)); margin: calc(4 * var(--u)); box-sizing: border-box; border: calc(2 * var(--u)) dashed rgba(255, 255, 255, 0.35); }
    .row .remove { all: unset; cursor: pointer; width: calc(36 * var(--u)); height: calc(36 * var(--u)); margin-right: calc(4 * var(--u)); display: grid; place-items: center; font-size: calc(18 * var(--t)); color: var(--muted); }
    .row .remove:hover { color: var(--red); background: rgba(255, 77, 77, 0.15); }
    .row .remove[hidden] { display: none; }

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

  /** the map's position of each slot ("Classic army" puts the units back there) */
  @property({ attribute: false })
    slots: ArmySlot[] = []

  /** cells of the team's deploy zone where a unit can start */
  @property({ attribute: false })
    zone: ArmySlot[] = []

  /** positions shown when the screen opens (last choice or the map's) */
  @property({ attribute: false })
    initialPlacement: ArmySlot[] = []

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

  /** one entry per slot; null = empty (removed) */
  @state()
  private army: (UnitClass | null)[] = []

  /** cell of each slot */
  @state()
  private positions: ArmySlot[] = []

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
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      const target = event.composedPath()[0]
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return
      this.removeAt(this.selected)
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
    if (changed.has('team') || changed.has('initialArmy') || changed.has('slots') || changed.has('initialPlacement')) {
      this.army = [...this.initialArmy]
      this.positions = (this.initialPlacement.length === this.slots.length ? this.initialPlacement : this.slots).map(p => ({ ...p }))
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

  private option(unitClass: UnitClass | null) {
    return unitClass ? this.classes.find(c => c.unitClass === unitClass) : undefined
  }

  private total(army = this.army) {
    return army.reduce((sum, c) => sum + (this.option(c)?.cost ?? 0), 0)
  }

  private isFull() {
    return this.army.length === this.slots.length && this.army.every(c => c !== null)
  }

  private canConfirm() {
    return this.isFull() && this.total() <= this.budget
  }

  /** Cheapest first (ties keep the class order), to find what fits the points left */
  private sortedClasses() {
    return this.classes
      .map((option, order) => ({ option, order }))
      .sort((a, b) => a.option.cost - b.option.cost || a.order - b.order)
      .map(({ option }) => option)
  }

  /** Empties one slot (its points go back to the budget) */
  private removeAt(index: number) {
    if (!this.army[index]) return
    const next = [...this.army]
    next[index] = null
    this.army = next
    this.selected = index
  }

  /** Empties every slot, to build the army from scratch */
  private clearAll() {
    this.army = this.slots.map(() => null)
    this.selected = 0
    this.expanded = null
  }

  /** After a pick: the next empty slot, or simply the next one when all are filled */
  private nextSlot(from: number) {
    const count = this.slots.length
    for (let step = 1; step <= count; step++) {
      const index = (from + step) % count
      if (!this.army[index]) return index
    }
    return (from + 1) % count
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
    this.selected = this.nextSlot(this.selected)
    this.collapse()
    this.dispatchEvent(new Event('pick'))
  }

  private confirm() {
    if (!this.canConfirm()) return
    const detail: ArmyChoice = {
      army: this.army.filter((c): c is UnitClass => c !== null),
      placement: this.positions.map(p => [p.x, p.y])
    }
    this.dispatchEvent(new CustomEvent<ArmyChoice>('confirm', { detail }))
  }

  /** Moves the selected slot's unit to a free cell of the zone */
  private moveTo(cell: ArmySlot) {
    if (this.positions.some(p => p.x === cell.x && p.y === cell.y)) return
    const next = [...this.positions]
    next[this.selected] = { ...cell }
    this.positions = next
    this.dispatchEvent(new Event('pick'))
  }

  /** Back to the map's classes and positions */
  private classic() {
    this.army = [...this.defaultArmy]
    this.positions = this.slots.map(p => ({ ...p }))
    this.selected = 0
  }

  private tileBox(cell: ArmySlot) {
    return `left: ${(cell.x / this.mapWidth) * 100}%; top: ${(cell.y / this.mapHeight) * 100}%;`
      + ` width: ${100 / this.mapWidth}%; height: ${100 / this.mapHeight}%`
  }

  private renderZoneCell(cell: ArmySlot) {
    return html`
      <button
        class="zone"
        style=${this.tileBox(cell)}
        title=${t().army.moveHere(this.selected + 1)}
        aria-label=${t().army.moveTo(this.selected + 1, cell.x, cell.y)}
        @click=${() => this.moveTo(cell)}
      ></button>
    `
  }

  private renderSlot(index: number) {
    const slot = this.positions[index] ?? this.slots[index]
    const unitClass = this.army[index]
    const option = this.option(unitClass)
    const { left, top, size } = UNIT_FOOTPRINT
    const box = this.tileBox(slot)
    // in % of the slot (one tile), so the mini scales with the map
    const mini = `left: ${left * 100}%; top: ${top * 100}%; width: ${size * 100}%; height: ${size * 100}%`
    return html`
      <button
        class="slot ${index === this.selected ? 'selected' : ''} ${option ? '' : 'empty'}"
        style=${box}
        title=${t().army.slotTitle(index + 1, option?.name ?? t().army.emptyLower)}
        @click=${() => { this.selected = index }}
      >${option ? html`<img src=${option.portrait} alt=${option.name} style=${mini} />` : nothing}</button>
    `
  }

  private renderRosterRow(unitClass: UnitClass | null, index: number) {
    const option = this.option(unitClass)
    return html`
      <div class="row ${index === this.selected ? 'selected' : ''} ${option ? '' : 'empty'}">
        <button class="pick-slot" @click=${() => { this.selected = index }}>
          <span class="num">${index + 1}</span>
          ${option ? html`<img src=${option.portrait} alt="" />` : html`<span class="placeholder"></span>`}
          <span class="label">${option ? option.name : t().army.empty}</span>
          <span class="cost">${option ? option.cost : ''}</span>
        </button>
        <button class="remove" title=${t().army.remove} aria-label=${t().army.removeUnit(option?.name ?? '')} ?hidden=${!option} @click=${() => this.removeAt(index)}>✕</button>
      </div>
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
            <div class="name">${option.name}<small>${option.role}</small></div>
            <div class="price">${option.cost}<small>${t().common.pts}</small></div>
            <span class="chevron">${open ? '▾' : '▸'}</span>
          </div>
          ${renderClassStats(unitClass, { mp: false })}
        </button>
        ${open ? html`
          <div class="more details">
            <p class="desc">${CLASS_INFO[unitClass].description}</p>
            ${renderClassAbilities(unitClass)}
            <div class="pick-row">
              ${fits ? nothing : html`<span class="note">${t().army.notEnough}</span>`}
              <button class="btn btn-solid pick" ?disabled=${!fits} @click=${() => this.assign(unitClass)}>
                ${t().army.pickForSlot(this.selected + 1)}
              </button>
            </div>
          </div>
        ` : nothing}
      </div>
    `
  }

  override render() {
    const total = this.total()
    const empty = this.army.filter(c => c === null).length
    const teamClass = this.team === 0 ? 'team-blue' : 'team-red'
    return html`
      <div class="header ${teamClass}">
        <h2>${t().army.heading} <span>· ${this.playerLabel}</span></h2>
        <div class="points ${total > this.budget ? 'over' : ''}">${total} / ${this.budget} <small>${t().army.points}</small></div>
      </div>
      <div class="layout">
        <div class="panel field ${teamClass}">
          <div class="panel-title"><span>${this.mapName}</span><span>${t().army.slotOf(this.selected + 1, this.slots.length)}</span></div>
          <div class="map">
            <img src=${this.preview} alt="" />
            ${this.zone.map(cell => this.renderZoneCell(cell))}
            ${this.slots.map((_, i) => this.renderSlot(i))}
          </div>
          <div class="roster">
            ${this.army.map((unitClass, i) => this.renderRosterRow(unitClass, i))}
          </div>
        </div>
        <div class="panel classes ${teamClass}">
          <div class="panel-title"><span>${t().army.pickFor(this.selected + 1)}</span><span>${t().army.left(this.budget - total)}</span></div>
          <div class="grid">${this.sortedClasses().map(option => this.renderCard(option))}</div>
        </div>
      </div>
      <div class="actions">
        <span class="keys">${this.isFull() ? t().army.fullHint : t().army.emptyHint(empty)}<span class="keys-only">${t().army.keys}</span></span>
        <button class="btn btn-solid" ?disabled=${this.army.every(c => c === null)} @click=${() => this.clearAll()}>${t().army.removeAll}</button>
        <button class="btn btn-solid" @click=${() => this.classic()}>${t().army.classic}</button>
        ${this.randomize ? html`<button class="btn btn-solid" @click=${() => { this.army = this.randomize?.() ?? this.army; this.selected = 0 }}>${t().common.random}</button>` : nothing}
        <button class="btn btn-solid" @click=${() => this.dispatchEvent(new Event('back'))}>${t().common.back}</button>
        <button class="btn btn-solid confirm" ?disabled=${!this.canConfirm()} @click=${() => this.confirm()}>${t().common.confirm}</button>
      </div>
    `
  }
}
