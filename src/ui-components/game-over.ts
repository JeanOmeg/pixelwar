import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { iconStyles } from './icons'
import { AchievementView, GameResultView, MatchStatsView, StandoutView } from './view-models'
import { t } from '../i18n'

export type GameOverChoice = 'rematch' | 'menu'

/** End-of-match screen. `show()` resolves with the button the player picked. */
@customElement('game-over')
export class GameOver extends LitElement {
  static styles = [theme, iconStyles, css`
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
      max-height: calc(100vh - 32px);
      overflow-y: auto;
      box-sizing: border-box;
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
    .stats { display: flex; flex-direction: column; gap: calc(12 * var(--u)); width: 100%; font-size: calc(18 * var(--t)); }
    table { border-collapse: collapse; width: 100%; }
    th, td { padding: calc(4 * var(--u)) calc(12 * var(--u)); text-align: right; }
    th:first-child, td:first-child { text-align: left; color: var(--muted); }
    th { color: var(--team); }
    tbody tr { border-top: calc(2 * var(--u)) solid #2a2d3a; }
    .rounds { text-align: center; color: var(--muted); font-size: calc(16 * var(--t)); }
    .standouts { display: flex; flex-wrap: wrap; gap: calc(12 * var(--u)); justify-content: center; }
    .standout {
      display: flex;
      align-items: center;
      gap: calc(10 * var(--u));
      padding: calc(6 * var(--u)) calc(14 * var(--u)) calc(6 * var(--u)) calc(6 * var(--u));
      border: calc(3 * var(--u)) solid var(--team);
      background: #14161f;
    }
    .standout img { width: calc(56 * var(--u)); height: calc(56 * var(--u)); image-rendering: pixelated; }
    .standout .what { font-size: calc(14 * var(--t)); color: var(--gold); }
    .standout .name { font-size: calc(18 * var(--t)); }
    .standout .detail { font-size: calc(14 * var(--t)); color: var(--muted); }
    .achievements {
      display: flex;
      flex-direction: column;
      gap: calc(6 * var(--u));
      width: 100%;
      box-sizing: border-box;
      padding: calc(8 * var(--u)) calc(14 * var(--u));
      border: calc(3 * var(--u)) solid var(--gold);
      background: #1f1a0a;
    }
    .achievements .what { font-size: calc(16 * var(--t)); color: var(--gold); }
    .achievement { display: flex; align-items: center; gap: calc(10 * var(--u)); animation: shine 600ms steps(6) both; }
    @keyframes shine { from { opacity: 0; transform: scale(0.9); } }
    .achievement .star { width: calc(22 * var(--u)); height: calc(22 * var(--u)); color: var(--gold); }
    .achievement .name { font-size: calc(18 * var(--t)); }
    .achievement .detail { font-size: calc(14 * var(--t)); color: var(--muted); }
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

  private renderStandout(what: string, unit: StandoutView | null) {
    if (!unit) return nothing
    return html`
      <div class="standout team-${unit.team}">
        <img src=${unit.portrait} alt="">
        <div>
          <div class="what">${what}</div>
          <div class="name">${unit.name}</div>
          <div class="detail">${unit.detail}</div>
        </div>
      </div>
    `
  }

  private renderStats(stats: MatchStatsView) {
    const row = (label: string, value: (team: MatchStatsView['teams'][number]) => number) => html`
      <tr><td>${label}</td>${stats.teams.map(team => html`<td>${value(team)}</td>`)}</tr>
    `
    return html`
      <div class="stats">
        <table>
          <thead><tr><th></th>${stats.teams.map(team => html`<th class="team-${team.team}">${team.label}</th>`)}</tr></thead>
          <tbody>
            ${row(t().gameOver.damageDealt, team => team.damage)}
            ${row(t().gameOver.kills, team => team.kills)}
            ${row(t().gameOver.unitsLost, team => team.lost)}
          </tbody>
        </table>
        <div class="rounds">${t().gameOver.rounds(stats.rounds)}</div>
        <div class="standouts">
          ${this.renderStandout(t().gameOver.mvp, stats.mvp)}
          ${this.renderStandout(t().gameOver.bestCritical, stats.bestCritical)}
        </div>
      </div>
    `
  }

  private renderAchievements(list: AchievementView[]) {
    return html`
      <div class="achievements">
        <div class="what">${t().gameOver.achievementUnlocked(list.length)}</div>
        ${list.map((achievement, i) => html`
          <div class="achievement" style="animation-delay: ${600 + i * 250}ms">
            <i class="icon i-star star" aria-hidden="true"></i>
            <div><span class="name">${achievement.name}</span> <span class="detail">${achievement.description}</span></div>
          </div>
        `)}
      </div>
    `
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
          ${result.stats ? this.renderStats(result.stats) : nothing}
          ${result.achievements?.length ? this.renderAchievements(result.achievements) : nothing}
          <div class="actions">
            <button class="btn btn-solid" @click=${() => this.pick('rematch')}>${this.rematchLabel ?? t().gameOver.playAgain}</button>
            <button class="btn btn-solid" style="--team: #2a2d3a" @click=${() => this.pick('menu')}>${t().common.mainMenu}</button>
          </div>
        </div>
      </div>
    `
  }
}
