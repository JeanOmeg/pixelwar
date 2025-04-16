import { LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators'
import { Unit } from '../unit'
import { renderUnitMenu } from './unit-menu.view'
@customElement('unit-menu')
export class UnitMenu extends LitElement {

  createRenderRoot() {
    return this
  }

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
    _show: boolean = false

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
    return renderUnitMenu(this)
  }
}
