import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'

/** Clicks this soon after Next shows up come from the tap that made it show */
const GHOST_CLICK_MS = 350

/**
 * Tutorial balloon at the bottom of the match (TutorialMatch): the current
 * lesson, a Next button when the lesson is only text, and Skip tutorial
 * (asks a second click). Fires `next` and `skip`.
 */
@customElement('tutorial-panel')
export class TutorialPanel extends LitElement {
  static styles = [theme, css`
    :host {
      position: absolute;
      left: 50%;
      bottom: calc(46 * var(--u));
      transform: translateX(-50%);
      width: min(calc(860 * var(--u)), calc(100vw - 32px));
      pointer-events: none;
    }
    .box {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: calc(16 * var(--u));
      padding: calc(14 * var(--u)) calc(18 * var(--u));
      pointer-events: auto;
      animation: pop 160ms steps(3);
    }
    @keyframes pop { from { transform: translateY(calc(16 * var(--u))); opacity: 0; } }
    .box.shake { animation: shake 320ms steps(8); }
    @keyframes shake {
      20% { transform: translateX(calc(-10 * var(--u))); }
      40% { transform: translateX(calc(10 * var(--u))); }
      60% { transform: translateX(calc(-6 * var(--u))); }
      80% { transform: translateX(calc(6 * var(--u))); }
    }
    .progress { position: absolute; left: 0; top: 0; height: calc(3 * var(--u)); background: var(--gold); transition: width 300ms steps(4); }
    .text { flex: 1; font-size: calc(19 * var(--t)); line-height: 1.4; text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000; }
    b { font-weight: normal; color: var(--gold); }
    .actions { display: flex; flex-direction: column; align-items: stretch; gap: calc(8 * var(--u)); }
    .next { --team: var(--blue); font-size: calc(20 * var(--t)); padding: calc(8 * var(--u)) calc(22 * var(--u)); justify-content: center; }
    .next.shake { animation: blink 160ms steps(2) 2; }
    @keyframes blink { 50% { filter: brightness(1.8); } }
    .skip { --team: #2a2d3a; font-size: calc(14 * var(--t)); padding: calc(5 * var(--u)) calc(10 * var(--u)); justify-content: center; white-space: nowrap; }
    .skip.confirm { background: var(--orange); }
  `]

  /** Lesson text; `[text]` is highlighted */
  @property()
    text = ''

  /** Text-only lesson: Next continues */
  @property({ type: Boolean })
    canNext = false

  /** 0..1, how far into the tutorial */
  @property({ type: Number })
    progress = 0

  @state()
  private confirmSkip = false

  @state()
  private shaking = false

  private nextShownAt = 0
  private skipTimer = 0

  override willUpdate(changed: Map<string, unknown>) {
    if (changed.has('canNext') && this.canNext) this.nextShownAt = performance.now()
    if (changed.has('text')) this.confirmSkip = false
  }

  /** The player tried something else: draws the eye to the balloon */
  shake() {
    this.shaking = false
    requestAnimationFrame(() => { this.shaking = true })
    window.setTimeout(() => { this.shaking = false }, 400)
  }

  private next() {
    if (!this.canNext || performance.now() - this.nextShownAt < GHOST_CLICK_MS) return
    this.dispatchEvent(new Event('next'))
  }

  private skip() {
    if (!this.confirmSkip) {
      this.confirmSkip = true
      window.clearTimeout(this.skipTimer)
      this.skipTimer = window.setTimeout(() => { this.confirmSkip = false }, 3000)
      return
    }
    this.dispatchEvent(new Event('skip'))
  }

  override render() {
    if (!this.text) return nothing
    const parts = this.text.split(/(\[[^\]]+\])/).map(part => part.startsWith('[') ? html`<b>${part.slice(1, -1)}</b>` : part)
    return html`
      <div class="panel box ${this.shaking && !this.canNext ? 'shake' : ''}">
        <div class="progress" style="width: ${Math.round(this.progress * 100)}%"></div>
        <div class="text">${parts}</div>
        <div class="actions">
          ${this.canNext ? html`<button class="btn btn-solid next ${this.shaking ? 'shake' : ''}" title="Next (Enter)" @click=${() => this.next()}>Next</button>` : nothing}
          <button class="btn btn-solid skip ${this.confirmSkip ? 'confirm' : ''}" @click=${() => this.skip()}>${this.confirmSkip ? 'Sure? Skip' : 'Skip tutorial'}</button>
        </div>
      </div>
    `
  }
}
