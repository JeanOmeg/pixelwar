import { LitElement, css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { theme } from './theme'

export interface NoticeButton {
  id: string
  label: string
  primary?: boolean
}

export interface NoticeView {
  title: string
  text: string
  buttons: NoticeButton[]
}

/**
 * Online: a message over the match that doesn't stop it (connection lost,
 * opponent not responding, waiting for a rematch). `show()` resolves with the
 * id of the button picked, or null when the notice is closed from outside.
 * `change()` updates the text while it is up (countdowns).
 */
@customElement('game-notice')
export class GameNotice extends LitElement {
  static styles = [theme, css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .backdrop {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.45);
      pointer-events: auto;
      animation: fade 200ms steps(3) both;
    }
    @keyframes fade { from { opacity: 0; } }
    .dialog { min-width: calc(460 * var(--u)); max-width: calc(720 * var(--u)); }
    .panel-title { justify-content: center; font-size: calc(28 * var(--t)); }
    .body { display: flex; flex-direction: column; align-items: center; gap: calc(16 * var(--u)); padding: calc(20 * var(--u)) calc(26 * var(--u)); }
    .text { text-align: center; font-size: calc(18 * var(--t)); line-height: 1.4; color: var(--muted); white-space: pre-line; }
    .actions { display: flex; gap: calc(12 * var(--u)); }
    .actions .btn { --team: #2a2d3a; font-size: calc(20 * var(--t)); padding: calc(9 * var(--u)) calc(22 * var(--u)); justify-content: center; }
    .actions .btn.primary { --team: var(--blue); }
  `]

  @state()
  private view: NoticeView | null = null

  private settle: ((id: string | null) => void) | null = null

  get open(): boolean {
    return !!this.view
  }

  show(view: NoticeView): Promise<string | null> {
    this.settle?.(null)
    this.view = view
    return new Promise(resolve => { this.settle = resolve })
  }

  change(changes: Partial<NoticeView>) {
    if (this.view) this.view = { ...this.view, ...changes }
  }

  close() {
    this.pick(null)
  }

  private pick(id: string | null) {
    const settle = this.settle
    this.settle = null
    this.view = null
    settle?.(id)
  }

  override render() {
    const view = this.view
    if (!view) return nothing
    return html`
      <div class="backdrop">
        <div class="panel dialog">
          <div class="panel-title">${view.title}</div>
          <div class="body">
            <div class="text">${view.text}</div>
            ${view.buttons.length > 0 ? html`
              <div class="actions">
                ${view.buttons.map(b => html`<button class="btn btn-solid ${b.primary ? 'primary' : ''}" @click=${() => this.pick(b.id)}>${b.label}</button>`)}
              </div>
            ` : nothing}
          </div>
        </div>
      </div>
    `
  }
}
