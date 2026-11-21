import { LitElement, css, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { isTouchDevice } from '../device'
import { theme } from './theme'
import { Team } from './view-models'
import { t } from '../i18n'

const SLIDE_MS = 320
const HOLD_MS = 900

/** Full-width band announcing a new phase. Click anywhere to skip. */
@customElement('phase-banner')
export class PhaseBanner extends LitElement {
  static styles = [theme, css`
    :host { position: absolute; inset: 0; pointer-events: none; }
    .catcher { position: absolute; inset: 0; pointer-events: auto; cursor: pointer; }
    .band {
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(8 * var(--u));
      padding: calc(22 * var(--u)) 0;
      background: linear-gradient(90deg, transparent, var(--team-dark) 20%, var(--team-dark) 80%, transparent);
      border-top: calc(4 * var(--u)) solid var(--team);
      border-bottom: calc(4 * var(--u)) solid var(--team);
      animation: band-in ${SLIDE_MS}ms steps(6) both;
    }
    .band.out { animation: band-out ${SLIDE_MS}ms steps(6) both; }
    .title {
      font-size: calc(64 * var(--t));
      line-height: 1;
      color: #fff;
      text-shadow: calc(5 * var(--u)) calc(5 * var(--u)) 0 #000;
      animation: text-in ${SLIDE_MS + 120}ms steps(8) both;
    }
    .subtitle { font-size: calc(20 * var(--t)); color: var(--ink); text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000; }
    .skip { font-size: calc(14 * var(--t)); color: var(--muted); }

    @keyframes band-in { from { clip-path: inset(50% 0 50% 0); } to { clip-path: inset(0 0 0 0); } }
    @keyframes band-out { from { clip-path: inset(0 0 0 0); } to { clip-path: inset(50% 0 50% 0); } }
    @keyframes text-in { from { transform: translateX(calc(-200 * var(--u))); opacity: 0; } }
  `]

  @state()
  private banner: { team: Team, title: string, subtitle: string } | null = null

  @state()
  private leaving = false

  private finish: (() => void) | null = null
  private timers: number[] = []

  /** Shows the banner and resolves when it's gone (or skipped) */
  play(team: Team, title: string, subtitle: string): Promise<void> {
    this.stop()
    this.banner = { team, title, subtitle }
    this.leaving = false
    return new Promise(resolve => {
      this.finish = resolve
      this.timers.push(window.setTimeout(() => this.leave(), SLIDE_MS + HOLD_MS))
    })
  }

  private leave() {
    if (!this.banner || this.leaving) return
    this.leaving = true
    this.timers.push(window.setTimeout(() => this.stop(), SLIDE_MS))
  }

  /** Removes the banner immediately and resolves the pending promise */
  stop() {
    this.timers.forEach(t => window.clearTimeout(t))
    this.timers = []
    this.banner = null
    this.leaving = false
    const finish = this.finish
    this.finish = null
    finish?.()
  }

  override disconnectedCallback() {
    super.disconnectedCallback()
    this.stop()
  }

  override render() {
    const banner = this.banner
    if (!banner) return nothing
    return html`
      <div class="catcher" @click=${() => this.stop()}></div>
      <div class="band team-${banner.team} ${this.leaving ? 'out' : ''}">
        <div class="title">${banner.title}</div>
        <div class="subtitle">${banner.subtitle}</div>
        <div class="skip">${t().banner.skip(isTouchDevice())}</div>
      </div>
    `
  }
}
