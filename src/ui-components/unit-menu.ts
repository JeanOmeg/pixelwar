import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, query, state } from 'lit/decorators'
import { styleMap } from 'lit/directives/style-map'
import { classMap } from 'lit/directives/class-map'
import { Unit } from '../unit'

@customElement('unit-menu')
export class UnitMenu extends LitElement {
  static override styles = css`
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }

    .menu {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(74px * var(--pixel-conversion));
        display: none;
        opacity: 0;
        flex-direction: column;
        font-size: calc(8px * var(--pixel-conversion));
        background-color: white;
        border: black calc(1px * var(--pixel-conversion)) solid;
        z-index: 1;
    }

    .overlay {
        position: fixed;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
    }

    .show {
        display: flex;
        opacity: 1;
        animation: fadeIn 140ms ease normal;
    }

    .hide {
        animation: fadeOut 140ms ease normal;
    }

    .options {
        display: flex;
        flex-direction: column;
    }

    .title-bar {
        display: flex;
        color: white;
        justify-content: center;
        align-items: center;
        height: calc(8px * var(--pixel-conversion));
        padding: calc(1px * var(--pixel-conversion));
    }

    .sheet {
        display: flex;
        color: white;
        justify-content: center;
        align-items: center;
        font-size: calc(6px * var(--pixel-conversion));
        height: calc(8px * var(--pixel-conversion));
        padding: calc(1px * var(--pixel-conversion));
    }

    button {
      all: unset;
      padding-left: calc(2px * var(--pixel-conversion));
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
    }

    button:focus, button:hover, .focus {
        background-color: rgba(220, 200, 200, 1);
    }

    button:active, .active {
        background-color: rgba(250, 240, 240, 1);
    }

    .memory--heart {
      display: inline-block;
      width: calc(6px * var(--pixel-conversion));
      height: calc(6px * var(--pixel-conversion));
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M12 20h-2v-1H9v-1H8v-1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-2H1V5h1V4h1V3h1V2h5v1h1v1h2V3h1V2h5v1h1v1h1v1h1v5h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1zm-7-9v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1V9h1V6h-1V5h-1V4h-3v1h-1v1h-1v1h-2V6H9V5H8V4H5v1H4v1H3v3h1v2z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: calc(2px * var(--pixel-conversion));
    }

    .memory--sword {
      display: inline-block;
      width: calc(6px * var(--pixel-conversion));
      height: calc(6px * var(--pixel-conversion));
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M5 20H3v-1H2v-2h1v-1h1v-1h1v-1H4v-1H3v-2h2v1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h1V3h1V2h5v5h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v2H9v-1H8v-1H7v1H6v1H5m5-6v-1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H9v1H8v1Z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: calc(2px * var(--pixel-conversion));
      margin-left: calc(2px * var(--pixel-conversion));
    }

    .vaadin--shield {
      display: inline-block;
      width: calc(6px * var(--pixel-conversion));
      height: calc(6px * var(--pixel-conversion));
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='%23000' d='M1 0v7c0 5.6 7 9 7 9s7-3.4 7-9V0zm13 7c0 4.2-4.6 7.1-6 7.9V1h6z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: calc(2px * var(--pixel-conversion));
      margin-left: calc(2px * var(--pixel-conversion));
    }

    .memory--bow-arrow {
      display: inline-block;
      width: calc(6px * var(--pixel-conversion));
      height: calc(6px * var(--pixel-conversion));
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M1 3h10v1h2v1h3V4h1V2h3v3h-2v1h-1v3h1v2h1v10h-2v-2h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1H9v1H8v1H7v3H6v1H5v1H4v-1H3v-1H2v-1H1v-1h1v-1h1v-1h3v-1h1v-1h1v-2H7v-1H6V9H5V8H4V7H3V5H1zm15 15h1v-6h-1v-2h-1V9h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v1h1zM12 7V6h-2V5H4v1h1v1h1v1h1v1h1v1h1v1h1v-1h1V9h1V8h1V7z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: calc(2px * var(--pixel-conversion));
      margin-left: calc(2px * var(--pixel-conversion));
    }

    .mdi--shoe-print {
      display: inline-block;
      width: calc(6px * var(--pixel-conversion));
      height: calc(6px * var(--pixel-conversion));
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M10.74 11.72c.47 1.23.42 2.51-.99 3.02c-2.9 1.07-3.55-1.74-3.59-1.88zm-5.03-.81l4.32-1.07c-.19-1.05.1-2.1.1-3.34c0-1.68-1.33-4.97-3.45-4.44c-2.42.6-2.77 3.29-2.68 4.59c.12 1.3 1.64 4.08 1.71 4.26m12.14 8.94c-.03.15-.69 2.95-3.59 1.89c-1.4-.52-1.46-1.8-.99-3.03zm2.15-6.2c.1-1.3-.24-4-2.67-4.6c-2.11-.55-3.44 2.76-3.44 4.45c0 1.23.28 2.28.11 3.33l4.3 1.07c.08-.18 1.59-2.96 1.7-4.25'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: calc(2px * var(--pixel-conversion));
      margin-left: calc(2px * var(--pixel-conversion));
    }

    .tooltip {
      padding-top: calc(2px * var(--pixel-conversion));
      position: relative;
      display: inline-block;
    }

    .tooltip .tooltiptext {
      font-size: calc(7px * var(--pixel-conversion));
      border: black calc(1px * var(--pixel-conversion)) solid;
      visibility: hidden;
      width: calc(100px * var(--pixel-conversion));
      color: white;
      text-align: center;
      padding: calc(3px * var(--pixel-conversion));
      position: absolute;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .tooltip:hover .tooltiptext {
      visibility: visible;
      opacity: 1;
    }
  `

  @property({ type: Number })
    left: number = 0

  @property({ type: Number })
    leftTooltip: number = 0

  @property({ type: Number })
    rightTooltip: number = 0

  @property({ type: Number })
    top: number = 0

  @property({ type: Number })
    fontSize: number = 0

  @property({ type: Number })
    width: number = 0

  @property({ attribute: false })
    unit: Unit | null = null

  @property({ type: Number })
    pixelConversion: number = 1

  @state()
  private _show: boolean = false

  @query('.menu')
    menuHtml?: HTMLDivElement

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clearEvents: () => any = () => { }

  override firstUpdated(): void {
    this.menuHtml?.addEventListener('animationend', evt => {
      if (evt.animationName === 'fadeOut') {
        this._show = false
        this.menuHtml?.classList.remove('hide')
        this.requestUpdate()
      }
    })
  }

  sendEvent(type: string) {
    return () => {
      this.dispatchEvent(new Event(type))
      this.hide()
      this.requestUpdate()
    }
  }

  private _debounce: number = 0
  show() {
    this._show = true
    this._debounce = Date.now()
  }

  hide() {
    const now = Date.now()
    if (now - this._debounce > 250) {
      this.menuHtml?.classList.add('hide')
      this.clearEvents()
    }
  }

  tooltipDirection(min = 0) {
    return `${this.leftTooltip > 0 ? 'left:' : 'right:'} ${this.leftTooltip > 0 ? this.leftTooltip : this.rightTooltip - min}px; background-color: #${this.unit?.unitConfig.primary_color};`
  }

  override render() {
    const dismissOverlayHtml = this._show ? html`<div class="overlay" @click=${this.hide}></div>` : nothing
    const unitName = html`<div class="title-bar" style="background-color: #${this.unit?.unitConfig.primary_color}">${this.unit?.name.replace(/[AB]$/, '')}</div>`
    
    const buttonMove = html`
      <button ?disabled=${!this.unit?.canMove()} style=${styleMap({ color: !this.unit?.canMove() ? '#D3D3D3' : 'black', cursor: !this.unit?.canMove() ? 'default' : 'pointer' })} @click="${this.sendEvent('move')}">
        <div>
          Move
        </div>
        <div class="tooltip">{?}
          <span class="tooltiptext" style="${this.tooltipDirection()}">Move the selected unit</span>
        </div>
      </button>
    `
    const buttonAttack = html`
      <button ?disabled=${!this.unit?.canAttack()} style=${styleMap({ color: !this.unit?.canAttack() ? '#D3D3D3' : 'black', cursor: !this.unit?.canAttack() ? 'default' : 'pointer' })} @click="${this.sendEvent('attack')}">
        <div>
          Attack
        </div>
        <div class="tooltip">{?}
          <span class="tooltiptext" style="${this.tooltipDirection()}">Attack the selected enemy unit</span>
        </div>
      </button>
    `
    const done = html`
      <button @click="${this.sendEvent('pass')}">
        <div>
          Done
        </div>
        <div class="tooltip">{?}
          <span class="tooltiptext" style="${this.tooltipDirection()}">Pass unit turn</span>
        </div>
      </button>
    `
    const passTurn = html`
      <button @click="${this.sendEvent('passTurn')}" style="color: #${this.unit?.unitConfig.primary_color};">
        <div>
          Pass Turn
        </div>
        <div class="tooltip">{?}
          <span class="tooltiptext" style="${this.tooltipDirection()}">Pass player turn</span>
        </div>
      </button>
    `
    const sheet = html`
      <div class="tooltip">
        <span class="memory--heart"></span>${this.unit?.health}
        <span class="tooltiptext" style="${this.tooltipDirection(62 * this.pixelConversion)}">Health Points are used to know how much damage the unit can take before being eliminated</span>
      </div>
      <div class="tooltip">
        <span class="memory--sword"></span>${this.unit?.unitConfig.attack}
        <span class="tooltiptext" style="${this.tooltipDirection(62 * this.pixelConversion)}">Attack Points are used in attack and damage tests</span>
      </div>
      <div class="tooltip">
        <span class="vaadin--shield"></span>${this.unit?.unitConfig.defense}
        <span class="tooltiptext" style="${this.tooltipDirection(62 * this.pixelConversion)}">Defense Points are used in defense tests and damage absorption</span>
      </div>
      <div class="tooltip">
        <span class="memory--bow-arrow"></span>${this.unit?.unitConfig.range}
        <span class="tooltiptext" style="${this.tooltipDirection(62 * this.pixelConversion)}">Range Points are used to know how many cells the unit's attack reaches</span>
      </div>
      <div class="tooltip">
        <span class="mdi--shoe-print"></span>${this.unit?.unitConfig.movement}
        <span class="tooltiptext" style="${this.tooltipDirection(62 * this.pixelConversion)}">Move Points are used to know how many cells the unit can move</span>
      </div>
    `
    const separator = html`
      <div style=${styleMap({ backgroundColor: 'black', height: 'calc(1px * var(--pixel-conversion))' })}></div>
    `

    return html`
      ${dismissOverlayHtml}
      <div class=${classMap({ menu: true, show: this._show })} style=${styleMap({ left: `${this.left}px`, top: `${this.top}px` })}>
        ${unitName}
        <div class="options">
          <div class="sheet" style="background-color: #${this.unit?.unitConfig.secondary_color}">
            ${sheet}
          </div>
          ${buttonMove}
          ${buttonAttack}
          ${separator}
          ${done}
          ${passTurn}
        </div>
      </div>
    `
  }
}
