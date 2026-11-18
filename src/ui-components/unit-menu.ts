import { LitElement, TemplateResult, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { theme } from './theme'
import { MenuItem, Team } from './view-models'

export interface AnchorRect {
  left: number
  right: number
  top: number
  bottom: number
}

/**
 * Action menu shown next to the selected unit. Flips to the other side of the
 * unit when it doesn't fit. Fires `select` (detail = item id) and `close`
 * (click outside).
 */
@customElement('unit-menu')
export class UnitMenu extends LitElement {
  static styles = [theme, css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .overlay { position: absolute; inset: 0; pointer-events: auto; }
    .menu {
      position: absolute;
      width: calc(210 * var(--u));
      pointer-events: auto;
      animation: pop 120ms steps(3);
    }
    @keyframes pop {
      from { transform: scale(0.85); opacity: 0; }
    }
    .items { display: flex; flex-direction: column; padding: calc(4 * var(--u)) 0; }
    .btn { width: 100%; justify-content: space-between; }
    .btn .detail { font-size: calc(14 * var(--t)); color: var(--mp); }
    .btn:hover .detail, .btn:focus-visible .detail { color: #fff; }
    .btn .arrow { font-size: calc(14 * var(--t)); }
    .sub { display: flex; flex-direction: column; background: rgba(255, 255, 255, 0.05); }
    .sub .btn { flex-wrap: wrap; padding-left: calc(24 * var(--u)); }
    .sub .desc {
      flex-basis: 100%;
      font-size: calc(14 * var(--t));
      line-height: 1.25;
      color: var(--muted);
      text-shadow: none;
    }
    .sub .btn:hover:not(:disabled) .desc { color: #fff; }
    .sep { height: calc(3 * var(--u)); margin: calc(4 * var(--u)) 0; background: rgba(255, 255, 255, 0.12); }
  `]

  @property({ type: Boolean, reflect: true })
    open = false

  @property()
    title = ''

  @property()
    team: Team = 'blue'

  @property({ attribute: false })
    items: MenuItem[] = []

  @property({ attribute: false })
    anchor: AnchorRect = { left: 0, right: 0, top: 0, bottom: 0 }

  @state()
  private expanded: string | null = null

  @query('.menu')
  private menuEl?: HTMLDivElement

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('items') || (changed.has('open') && this.open)) this.expanded = null
  }

  override updated() {
    const menu = this.menuEl
    if (!menu) return
    const gap = 8
    const width = menu.offsetWidth
    const height = menu.offsetHeight
    let left = this.anchor.right + gap
    if (left + width > window.innerWidth - gap) left = this.anchor.left - width - gap
    let top = this.anchor.top - height / 3
    top = Math.min(Math.max(top, gap), window.innerHeight - height - gap)
    menu.style.left = `${Math.max(left, gap)}px`
    menu.style.top = `${top}px`
  }

  private choose(item: MenuItem) {
    if (!item.enabled) return
    if (item.children) {
      this.expanded = this.expanded === item.id ? null : item.id
      return
    }
    this.dispatchEvent(new CustomEvent<string>('select', { detail: item.id }))
  }

  private renderItem(item: MenuItem): TemplateResult {
    return html`
      <button class="btn" ?disabled=${!item.enabled} @click=${() => this.choose(item)}>
        <span>${item.label}</span>
        ${item.children ? html`<span class="arrow">${this.expanded === item.id ? '▾' : '▸'}</span>` : nothing}
        ${item.detail ? html`<span class="detail">${item.detail}</span>` : nothing}
        ${item.description ? html`<span class="desc">${item.description}</span>` : nothing}
      </button>
      ${item.children && this.expanded === item.id ? html`
        <div class="sub">${item.children.map(child => this.renderItem(child))}</div>
      ` : nothing}
    `
  }

  override render() {
    if (!this.open) return nothing
    const [main, last] = [this.items.slice(0, -1), this.items[this.items.length - 1]]
    return html`
      <div class="overlay" @click=${() => this.dispatchEvent(new Event('close'))} @contextmenu=${(e: Event) => { e.preventDefault(); this.dispatchEvent(new Event('close')) }}></div>
      <div class="panel menu team-${this.team}">
        <div class="panel-title">${this.title}</div>
        <div class="items">
          ${main.map(item => this.renderItem(item))}
          ${last ? html`<div class="sep"></div>${this.renderItem(last)}` : nothing}
        </div>
      </div>
    `
  }
}
