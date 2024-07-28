import * as ex from 'excalibur'

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
            transform: translateY(50%);
        }
        to {
            opacity: 1;
            transform: translateY(0%);
        }
    }

    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0%);
        }
        to {
            opacity: 0;
            transform: translateY(50%);
        }
    }

    .menu {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(64px * var(--pixel-conversion));
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
        padding: calc(2px * var(--pixel-conversion));
        padding-left: calc(4px * var(--pixel-conversion));
        cursor: pointer;
    }

    button:focus, button:hover, .focus {
        background-color: rgba(220, 200, 200, 1);
    }

    button:active, .active {
        background-color: rgba(250, 240, 240, 1);
    }

    .memory--sword {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M5 20H3v-1H2v-2h1v-1h1v-1h1v-1H4v-1H3v-2h2v1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h1V3h1V2h5v5h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v2H9v-1H8v-1H7v1H6v1H5m5-6v-1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H9v1H8v1Z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-right: 5px;
    }

    .memory--shield {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M3 4h2V3h2V2h2V1h4v1h2v1h2v1h2v10h-1v2h-1v2h-1v1h-1v1h-2v1H9v-1H7v-1H6v-1H5v-2H4v-2H3zm7-1v1H8v1H6v1H5v7h1v2h1v2h1v1h2v1h2v-1h2v-1h1v-2h1v-2h1V6h-1V5h-2V4h-2V3z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-left: 7px;
      margin-right: 5px;
    }

    .memory--bow-arrow {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M1 3h10v1h2v1h3V4h1V2h3v3h-2v1h-1v3h1v2h1v10h-2v-2h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1H9v1H8v1H7v3H6v1H5v1H4v-1H3v-1H2v-1H1v-1h1v-1h1v-1h3v-1h1v-1h1v-2H7v-1H6V9H5V8H4V7H3V5H1zm15 15h1v-6h-1v-2h-1V9h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v1h1zM12 7V6h-2V5H4v1h1v1h1v1h1v1h1v1h1v1h1v-1h1V9h1V8h1V7z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-left: 7px;
      margin-right: 5px;
    }

    .memory--box-light-dashed-vertical-horizontal {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M12 2h-2V0h2m0 7h-2V4h2M2 12H0v-2h2m5 2H4v-2h3m11 2h-3v-2h3m4 2h-2v-2h2m-10 3h-2v-1H9v-2h1V9h2v1h1v2h-1m0 6h-2v-3h2m0 7h-2v-2h2Z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-left: 7px;
      margin-right: 5px;
    }

    .memory--heart {
      display: inline-block;
      width: 1em;
      height: 1em;
      --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 22 22'%3E%3Cpath fill='%23000' d='M12 20h-2v-1H9v-1H8v-1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-2H1V5h1V4h1V3h1V2h5v1h1v1h2V3h1V2h5v1h1v1h1v1h1v5h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1zm-7-9v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1V9h1V6h-1V5h-1V4h-3v1h-1v1h-1v1h-2V6H9V5H8V4H5v1H4v1H3v3h1v2z'/%3E%3C/svg%3E");
      background-color: currentColor;
      -webkit-mask-image: var(--svg);
      mask-image: var(--svg);
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
      margin-left: 7px;
      margin-right: 5px;
    }
  `

  @property({ type: Number })
  left: number = 0

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

  clearEvents: () => any = () => { };

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

  override render() {
    const dismissOverlayHtml = this._show ? html`<div class="overlay" @click=${this.hide}></div>` : nothing

    return html`
        ${dismissOverlayHtml}
        <div class=${classMap({
      menu: true,
      show: this._show
    })} style=${styleMap({
      left: `${this.left}px`,
      top: `${this.top}px`
    })}>
        <div class="title-bar" style="background-color: #${this.unit?.unitConfig.primary_color}">${this.unit?.name.replace(/[AB]$/, '')}</div>
        <div class="options">
            <div class="sheet" style="background-color: #${this.unit?.unitConfig.secondary_color}">
              <span class="memory--sword"></span>${this.unit?.unitConfig.attack}
              <span class="memory--shield"></span>${this.unit?.unitConfig.defense}
              <span class="memory--bow-arrow"></span>${this.unit?.unitConfig.range}
              <span class="memory--box-light-dashed-vertical-horizontal"></span>${this.unit?.unitConfig.movement}
              <span class="memory--heart"></span>${this.unit?.health}
            </div>
            <button style=${styleMap({ display: this.unit?.canMove() ? 'block' : 'none' })} @click="${this.sendEvent('move')}">Move</button>
            <button style=${styleMap({ display: this.unit?.canAttack() ? 'block' : 'none' })} @click="${this.sendEvent('attack')}">Attack</button>
            <button @click="${this.sendEvent('pass')}">Done</button>
            <button @click="${this.sendEvent('passTurn')}" style="color: red;">Pass Turn</button>
        </div>
    </div>
    `
  }
}