import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { GameResultView } from './view-models'
import { t } from '../i18n'

export type GameOverChoice = 'rematch' | 'menu'

/** End-of-match screen. `show()` resolves with the button the player picked. */
@customElement('game-over')
export class GameOver extends LitElement {
  static styles = [theme, css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .backdrop {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(0, 0, 0, 0.55);
      pointer-events: auto;
      animation: fade 400ms steps(5) both;
    }
    @keyframes fade { from { opacity: 0; } }
    .dialog {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(18 * var(--u));
      min-width: calc(520 * var(--u));
      padding: calc(32 * var(--u)) calc(40 * var(--u));
      animation: drop 500ms steps(8) both;
    }
    @keyframes drop { from { transform: translateY(calc(-120 * var(--u))); opacity: 0; } }
    .title {
      font-size: calc(72 * var(--t));
      line-height: 1;
      color: var(--team);
      text-shadow: calc(5 * var(--u)) calc(5 * var(--u)) 0 #000;
    }
    .subtitle { font-size: calc(20 * var(--t)); color: var(--muted); }
    .actions { display: flex; gap: calc(16 * var(--u)); margin-top: calc(8 * var(--u)); }
    .actions .btn { font-size: calc(24 * var(--t)); padding: calc(10 * var(--u)) calc(22 * var(--u)); }
    .draw { --team: var(--gold); --team-dark: #6b5300; }
  `]

  @state()
  private result: GameResultView | null = null

  /** Online: "Rematch" (players) or "Stay in room" (spectators); null = "Play again" */
  @property()
    rematchLabel: string | null = null

  private chosen: GameOverChoice = 'menu'
  private settle: (() => void) | null = null

  show(result: GameResultView): Promise<GameOverChoice> {
    this.result = result
    return new Promise(resolve => { this.settle = () => resolve(this.chosen) })
  }

  private pick(choice: GameOverChoice) {
    const settle = this.settle
    this.settle = null
    this.chosen = choice
    this.result = null
    settle?.()
  }

  override render() {
    const result = this.result
    if (!result) return nothing
    const teamClass = result.team ? `team-${result.team}` : 'draw'
    return html`
      <div class="backdrop">
        <div class="panel dialog ${teamClass}">
          <div class="title">${result.title}</div>
          <div class="subtitle">${result.subtitle}</div>
          <div class="actions">
            <button class="btn btn-solid" @click=${() => this.pick('rematch')}>${this.rematchLabel ?? t().gameOver.playAgain}</button>
            <button class="btn btn-solid" style="--team: #2a2d3a" @click=${() => this.pick('menu')}>${t().common.mainMenu}</button>
          </div>
        </div>
      </div>
    `
  }
}
