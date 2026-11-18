import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'

export type PauseChoice = 'resume' | 'quit'

/**
 * Pause dialog shown over the match. `show()` resolves with what the player
 * picked: keep playing, or leave the match for the main menu (asks twice).
 */
@customElement('pause-menu')
export class PauseMenu extends LitElement {
  static styles = [theme, css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .backdrop {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.6);
      pointer-events: auto;
      animation: fade 200ms steps(3) both;
    }
    @keyframes fade { from { opacity: 0; } }
    .dialog { min-width: calc(420 * var(--u)); animation: drop 260ms steps(5) both; }
    @keyframes drop { from { transform: translateY(calc(-60 * var(--u))); opacity: 0; } }
    .panel-title { justify-content: center; font-size: calc(30 * var(--t)); }
    .body { display: flex; flex-direction: column; gap: calc(12 * var(--u)); padding: calc(20 * var(--u)); }
    .body .btn { justify-content: center; font-size: calc(22 * var(--t)); padding: calc(10 * var(--u)) calc(22 * var(--u)); }
    .resume { --team: var(--blue); }
    .quit { --team: #2a2d3a; }
    .quit.confirm { --team: var(--red); }
    .warning { text-align: center; font-size: calc(14 * var(--t)); color: var(--muted); }
  `]

  @state()
  private visible = false

  /** Shown under "Main menu" once armed */
  @property()
    quitWarning = 'The match in progress will be lost.'

  /** Online: the "Mute emotes" switch (null: not shown) */
  @property({ attribute: false })
    emotesMuted: boolean | null = null

  /** First click on "Main menu" only arms it; the second one quits */
  @state()
  private confirming = false

  private settle: ((choice: PauseChoice) => void) | null = null

  get open() {
    return this.visible
  }

  show(): Promise<PauseChoice> {
    this.visible = true
    this.confirming = false
    return new Promise(resolve => { this.settle = resolve })
  }

  override updated(changed: Map<string, unknown>) {
    // keyboard: Enter resumes, Tab/arrows reach Main menu
    if (changed.has('visible') && this.visible) this.shadowRoot?.querySelector<HTMLButtonElement>('.resume')?.focus()
  }

  /** Same as clicking Resume (used by Esc) */
  resume() {
    this.pick('resume')
  }

  private pick(choice: PauseChoice) {
    const settle = this.settle
    this.settle = null
    this.visible = false
    this.confirming = false
    settle?.(choice)
  }

  private onQuit() {
    if (!this.confirming) {
      this.confirming = true
      return
    }
    this.pick('quit')
  }

  override render() {
    if (!this.visible) return nothing
    return html`
      <div class="backdrop">
        <div class="panel dialog">
          <div class="panel-title">Paused</div>
          <div class="body">
            <button class="btn btn-solid resume" @click=${() => this.pick('resume')}>Resume</button>
            <button class="btn btn-solid quit ${this.confirming ? 'confirm' : ''}" @click=${() => this.onQuit()}>
              ${this.confirming ? 'Quit match - sure?' : 'Main menu'}
            </button>
            ${this.emotesMuted !== null ? html`
              <button class="btn btn-solid quit" @click=${() => this.dispatchEvent(new Event('toggle-emotes'))}>${this.emotesMuted ? 'Show emotes' : 'Mute emotes'}</button>
            ` : nothing}
            <div class="warning">${this.confirming ? this.quitWarning : ''}</div>
          </div>
        </div>
      </div>
    `
  }
}
