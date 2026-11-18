import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'

export const RANDOM_MAP_ID = 'random'

export interface MapListItem {
  id: string
  name: string
  description: string
  width: number
  height: number
  unitsPerTeam: number[]
  rounds: number
  /** data URL of the rendered map */
  preview: string
  /** data URLs of each team's units, in spawn order */
  roster: string[][]
}

/**
 * Map selector: scrollable list on the left, details of the highlighted map
 * on the right. Keyboard: ↑/↓ choose, Enter start, Esc back.
 * Fires `start` (detail = map id or RANDOM_MAP_ID) and `back`.
 */
@customElement('map-select')
export class MapSelect extends LitElement {
  static styles = [theme, css`
    :host { display: block; width: calc(1640 * var(--u)); max-width: 96vw; }
    .header { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: calc(14 * var(--u)); }
    h2 { margin: 0; font-weight: normal; font-size: calc(44 * var(--t)); text-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000; }
    .mode { font-size: calc(18 * var(--t)); color: var(--muted); }
    .mode b { font-weight: normal; color: var(--gold); }

    .layout { display: grid; grid-template-columns: calc(470 * var(--u)) 1fr; gap: calc(24 * var(--u)); height: calc(780 * var(--u)); }

    .list { display: flex; flex-direction: column; min-height: 0; }
    .list .panel-title { font-size: calc(18 * var(--t)); justify-content: space-between; }
    .items { flex: 1; overflow-y: auto; padding: calc(8 * var(--u)); display: flex; flex-direction: column; gap: calc(8 * var(--u)); scrollbar-color: var(--edge) transparent; }
    .item {
      all: unset;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: calc(128 * var(--u)) 1fr;
      gap: calc(12 * var(--u));
      align-items: center;
      padding: calc(8 * var(--u));
      border: calc(3 * var(--u)) solid transparent;
      cursor: pointer;
    }
    .item:hover { background: rgba(255, 255, 255, 0.06); }
    .item.selected { border-color: var(--gold); background: rgba(255, 210, 63, 0.12); }
    .thumb {
      width: 100%;
      aspect-ratio: 28 / 17;
      object-fit: cover;
      image-rendering: pixelated;
      border: calc(2 * var(--u)) solid #000;
      background: #000;
      display: grid;
      place-items: center;
      font-size: calc(36 * var(--t));
      color: var(--gold);
    }
    .item .name { font-size: calc(20 * var(--t)); line-height: 1.1; }
    .item .meta { font-size: calc(14 * var(--t)); color: var(--muted); margin-top: calc(4 * var(--u)); }

    .detail { display: flex; flex-direction: column; min-height: 0; }
    .preview {
      position: relative;
      flex: 1;
      min-height: 0;
      display: grid;
      place-items: center;
      background: #000;
      border-bottom: calc(3 * var(--u)) solid var(--edge);
      overflow: hidden;
    }
    .preview img { max-width: 100%; max-height: 100%; image-rendering: pixelated; display: block; }
    .mosaic { position: absolute; inset: 0; display: grid; gap: calc(6 * var(--u)); padding: calc(6 * var(--u)); opacity: 0.35; filter: grayscale(0.6); }
    .mosaic img { width: 100%; height: 100%; min-height: 0; object-fit: cover; image-rendering: pixelated; }
    .question { position: relative; font-size: calc(160 * var(--t)); color: var(--gold); text-shadow: calc(8 * var(--u)) calc(8 * var(--u)) 0 #000; }

    .info { display: grid; grid-template-columns: 1fr auto; gap: calc(10 * var(--u)) calc(24 * var(--u)); padding: calc(16 * var(--u)) calc(20 * var(--u)); }
    .info h3 { margin: 0; font-weight: normal; font-size: calc(36 * var(--t)); line-height: 1; }
    .info p { margin: 0; grid-column: 1; font-size: calc(17 * var(--t)); line-height: 1.35; color: var(--muted); }
    .chips { grid-column: 1; display: flex; flex-wrap: wrap; gap: calc(8 * var(--u)); }
    .chips .chip { color: var(--ink); font-size: calc(15 * var(--t)); }
    .roster { grid-column: 2; grid-row: 1 / span 3; display: flex; flex-direction: column; gap: calc(6 * var(--u)); justify-content: center; }
    .army { display: flex; align-items: center; gap: calc(2 * var(--u)); }
    .army span { width: calc(46 * var(--u)); font-size: calc(14 * var(--t)); color: var(--team); }
    .army img { width: calc(40 * var(--u)); height: calc(40 * var(--u)); image-rendering: pixelated; }

    .actions { display: flex; justify-content: flex-end; gap: calc(14 * var(--u)); padding: 0 calc(20 * var(--u)) calc(18 * var(--u)); }
    .actions .btn { font-size: calc(26 * var(--t)); padding: calc(10 * var(--u)) calc(26 * var(--u)); }
    .actions .start { --team: var(--red); min-width: calc(220 * var(--u)); }
    .actions .back { --team: #2a2d3a; }
    .keys { flex: 1; align-self: center; font-size: calc(14 * var(--t)); color: var(--muted); }
  `]

  @property({ attribute: false })
    maps: MapListItem[] = []

  /** Label of the chosen game mode, shown in the header */
  @property()
    modeLabel = ''

  /** Map highlighted when the screen opens */
  @property()
    initial: string = RANDOM_MAP_ID

  @state()
  private selected: string | null = null

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const ids = this.ids()
      const index = ids.indexOf(this.current())
      const next = (index + (event.key === 'ArrowDown' ? 1 : -1) + ids.length) % ids.length
      this.select(ids[next])
    } else if (event.key === 'Enter') {
      event.preventDefault()
      this.start()
    } else if (event.key === 'Escape') {
      this.dispatchEvent(new Event('back'))
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

  private ids() {
    return [...this.maps.map(m => m.id), RANDOM_MAP_ID]
  }

  private current(): string {
    const id = this.selected ?? this.initial
    return this.ids().includes(id) ? id : this.ids()[0]
  }

  private select(id: string) {
    this.selected = id
    this.dispatchEvent(new CustomEvent<string>('select', { detail: id }))
    this.updateComplete.then(() => {
      this.shadowRoot?.querySelector('.item.selected')?.scrollIntoView({ block: 'nearest' })
    })
  }

  private start() {
    this.dispatchEvent(new CustomEvent<string>('start', { detail: this.current() }))
  }

  private renderItem(map: MapListItem, selected: boolean) {
    return html`
      <button class="item ${selected ? 'selected' : ''}" @click=${() => this.select(map.id)} @dblclick=${() => this.start()}>
        <img class="thumb" src=${map.preview} alt="" />
        <div>
          <div class="name">${map.name}</div>
          <div class="meta">${map.width}×${map.height} · ${map.unitsPerTeam.join(' vs ')}</div>
        </div>
      </button>
    `
  }

  private renderRandomItem(selected: boolean) {
    return html`
      <button class="item ${selected ? 'selected' : ''}" @click=${() => this.select(RANDOM_MAP_ID)} @dblclick=${() => this.start()}>
        <div class="thumb">?</div>
        <div>
          <div class="name">Random map</div>
          <div class="meta">Any of the ${this.maps.length} maps</div>
        </div>
      </button>
    `
  }

  private renderDetail(map: MapListItem | undefined) {
    if (!map) {
      // near-square grid that fits every map preview
      const cols = Math.max(1, Math.ceil(Math.sqrt(this.maps.length)))
      const rows = Math.max(1, Math.ceil(this.maps.length / cols))
      const grid = `grid-template-columns: repeat(${cols}, 1fr); grid-template-rows: repeat(${rows}, 1fr)`
      return html`
        <div class="preview">
          <div class="mosaic" style=${grid}>${this.maps.map(m => html`<img src=${m.preview} alt="" />`)}</div>
          <div class="question">?</div>
        </div>
        <div class="info">
          <h3>Random map</h3>
          <p>Let fate pick the battlefield. One of the ${this.maps.length} maps is chosen when the match starts.</p>
          <div class="chips"><span class="chip">${this.maps.length} maps</span></div>
        </div>
      `
    }
    const [blue = [], red = []] = map.roster
    return html`
      <div class="preview"><img src=${map.preview} alt=${map.name} /></div>
      <div class="info">
        <h3>${map.name}</h3>
        <div class="roster">
          <div class="army team-blue"><span>Blue</span>${blue.map(src => html`<img src=${src} alt="" />`)}</div>
          <div class="army team-red"><span>Red</span>${red.map(src => html`<img src=${src} alt="" />`)}</div>
        </div>
        <p>${map.description}</p>
        <div class="chips">
          <span class="chip">${map.width}×${map.height} tiles</span>
          <span class="chip">${map.unitsPerTeam.join(' vs ')} units</span>
          <span class="chip">${map.rounds} rounds max</span>
        </div>
      </div>
    `
  }

  override render() {
    const current = this.current()
    const map = this.maps.find(m => m.id === current)
    return html`
      <div class="header">
        <h2>Select map</h2>
        ${this.modeLabel ? html`<div class="mode">Mode: <b>${this.modeLabel}</b></div>` : nothing}
      </div>
      <div class="layout">
        <div class="panel list">
          <div class="panel-title"><span>Maps</span><span>${this.maps.length}</span></div>
          <div class="items">
            ${this.maps.map(m => this.renderItem(m, m.id === current))}
            ${this.renderRandomItem(current === RANDOM_MAP_ID)}
          </div>
        </div>
        <div class="panel detail">
          ${this.renderDetail(map)}
          <div class="actions">
            <span class="keys"><span class="keys-only">↑↓ choose · Enter start · Esc back</span></span>
            <button class="btn btn-solid back" @click=${() => this.dispatchEvent(new Event('back'))}>Back</button>
            <button class="btn btn-solid start" @click=${() => this.start()}>Start</button>
          </div>
        </div>
      </div>
    `
  }
}
