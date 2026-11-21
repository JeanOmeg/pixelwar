import { LitElement, css, html, nothing, svg } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { theme } from './theme'
import { iconStyles } from './icons'
import { ForecastView, UnitView, hpLevel, percent } from './view-models'
import type { Facing } from '../combat'
import { t } from '../i18n'

const FACING_ROTATION: Record<Facing, number> = { up: 0, right: 90, down: 180, left: 270 }

function facingArrow(facing: Facing) {
  return html`<svg class="facing" viewBox="0 0 7 7" style="transform: rotate(${FACING_ROTATION[facing]}deg)" aria-label=${t().card.facing(t().card.directions[facing])}>
    ${svg`<path fill="currentColor" d="M3 0h1v1h1v1h1v1h1v1H5v3H2V4H0V3h1V2h1V1h1z"/>`}
  </svg>`
}

/** A stat changed by skills or terrain: green when above its base value, red below */
function changed(value: number, base: number) {
  if (value === base) return html`${value}`
  return html`<span class="${value > base ? 'up' : 'down'}">${value}</span>`
}

/**
 * Bottom card: the hovered/selected unit, or the attack forecast when the
 * player is aiming at an enemy. Placed on the side opposite to the pointer.
 */
@customElement('unit-card')
export class UnitCard extends LitElement {
  static styles = [theme, iconStyles, css`
    /* right under the team bars of the HUD (same side margin and width) */
    :host {
      position: absolute;
      top: calc(84 * var(--u)); /* CARD_TOP in game-ui.ts */
      pointer-events: none;
      transition: opacity 120ms;
    }
    :host([side='left']) { left: calc(14 * var(--u)); }
    :host([side='right']) { right: calc(14 * var(--u)); }

    /* same outer width as a HUD team bar (330 + its 2x10 padding) */
    .card { width: calc(350 * var(--u)); }
    .panel-title { justify-content: space-between; }
    .panel-title small { font-size: calc(14 * var(--t)); opacity: 0.85; }
    .facing { width: calc(16 * var(--u)); height: calc(16 * var(--u)); shape-rendering: crispEdges; }
    .body { display: flex; flex-direction: column; gap: calc(10 * var(--u)); padding: calc(12 * var(--u)); }

    .meter { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: calc(8 * var(--u)); font-size: calc(16 * var(--t)); }
    .meter .value { min-width: calc(64 * var(--u)); text-align: right; }
    .i-heart { color: var(--hp-low); }
    .i-mana { color: var(--mp); }

    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(6 * var(--u)); }
    .stat {
      display: flex; flex-direction: column; align-items: center; gap: calc(4 * var(--u));
      padding: calc(6 * var(--u)) 0;
      background: rgba(255, 255, 255, 0.06);
      font-size: calc(18 * var(--t));
      line-height: 1;
    }
    .stat small { font-size: calc(13 * var(--t)); color: var(--muted); }
    .stat .up { color: var(--hp); }
    .stat .down { color: var(--hp-low); }
    .range-note { font-size: calc(14 * var(--t)); color: var(--muted); }

    .status { display: flex; flex-wrap: wrap; gap: calc(5 * var(--u)); }
    .status .chip { color: var(--muted); }
    .status .chip.hot { color: var(--gold); }

    /* Forecast */
    .forecast { width: calc(560 * var(--u)); }
    .versus { display: grid; grid-template-columns: 1fr auto 1fr; gap: calc(12 * var(--u)); padding: calc(12 * var(--u)); align-items: center; }
    .fighter { display: flex; flex-direction: column; gap: calc(7 * var(--u)); }
    .fighter .who { display: flex; align-items: center; gap: calc(6 * var(--u)); font-size: calc(18 * var(--t)); line-height: 1; color: var(--team); text-shadow: calc(2 * var(--u)) calc(2 * var(--u)) 0 #000; }
    .fighter.right .who { flex-direction: row-reverse; }
    .fighter .hp-text { font-size: calc(14 * var(--t)); }
    .fighter.right .hp-text { text-align: right; }
    .hp-text .kill { color: var(--gold); }

    .numbers { display: grid; grid-template-columns: auto auto; gap: calc(4 * var(--u)) calc(12 * var(--u)); font-size: calc(15 * var(--t)); line-height: 1.1; }
    .numbers dt { color: var(--muted); }
    .numbers dd { margin: 0; text-align: right; font-size: calc(20 * var(--t)); }
    .numbers .kill { color: var(--gold); }

    .badges { display: flex; justify-content: center; gap: calc(6 * var(--u)); padding: 0 calc(12 * var(--u)) calc(12 * var(--u)); }
    .badge-back { color: var(--orange); }
    .badge-crit { color: var(--gold); }
    .counter { display: flex; justify-content: center; gap: calc(10 * var(--u)); padding: 0 calc(12 * var(--u)) calc(12 * var(--u)); font-size: calc(15 * var(--t)); }
    .counter .label { color: var(--orange); }
    .counter .kill { color: var(--gold); }
  `]

  @property({ attribute: false })
    unit: UnitView | null = null

  @property({ attribute: false })
    forecast: ForecastView | null = null

  @property({ reflect: true })
    side: 'left' | 'right' = 'left'

  /**
   * Page px to place the card at instead of its default spot under the HUD
   * (used to move it out of the way of the hovered unit). null = default.
   */
  @property({ attribute: false })
    top: number | null = null

  override updated() {
    this.style.top = this.top === null ? '' : `${this.top}px`
  }

  private renderUnit(unit: UnitView) {
    return html`
      <div class="panel card team-${unit.team}">
        <div class="panel-title">
          <span>${unit.name}</span>
          <small>${unit.team === 'blue' ? t().common.blue : t().common.red} ${facingArrow(unit.facing)}</small>
        </div>
        <div class="body">
          <div class="meter">
            <i class="icon i-heart"></i>
            <div class="bar hp ${hpLevel(unit.hp, unit.maxHp)}"><i style="width: ${(unit.hp / unit.maxHp) * 100}%"></i></div>
            <span class="value">${unit.hp}/${unit.maxHp}</span>
          </div>
          <div class="meter">
            <i class="icon i-mana"></i>
            <div class="bar mp"><i style="width: ${(unit.mp / Math.max(unit.maxMp, 1)) * 100}%"></i></div>
            <span class="value">${unit.mp}/${unit.maxMp}</span>
          </div>
          <div class="stats">
            <div class="stat"><i class="icon i-sword"></i>${changed(unit.attack, unit.baseAttack)}<small>${t().stats.atk}</small></div>
            <div class="stat"><i class="icon i-shield"></i>${changed(unit.defense, unit.baseDefense)}<small>${t().stats.def}</small></div>
            <div class="stat"><i class="icon i-bow"></i>${unit.range}<small>${t().stats.rng}</small></div>
            <div class="stat"><i class="icon i-boot"></i>${unit.movement}<small>${t().stats.mov}</small></div>
          </div>
          <div class="range-note">${t().card.range(unit.rangeNote)}</div>
          ${unit.status.length > 0 ? html`
            <div class="status">
              ${unit.status.map(s => html`<span class="chip ${s.hot ? 'hot' : ''}">${s.label}</span>`)}
            </div>
          ` : nothing}
        </div>
      </div>
    `
  }

  /**
   * HP bar of a fighter. With `incoming` damage: solid = HP left in the worst
   * case, blinking = HP that may or may not be lost.
   */
  private renderFighter(unit: UnitView, side: 'left' | 'right', incoming?: { min: number, max: number }) {
    const pct = (hp: number) => `${(Math.max(hp, 0) / unit.maxHp) * 100}%`
    const worst = incoming ? Math.max(unit.hp - incoming.max, 0) : unit.hp
    const best = incoming ? Math.max(unit.hp - incoming.min, 0) : unit.hp
    const hpText = incoming
      ? html`${unit.hp} → <span class="${worst === 0 ? 'kill' : ''}">${worst}${best !== worst ? `-${best}` : ''}</span>`
      : html`${unit.hp}/${unit.maxHp}`
    return html`
      <div class="fighter ${side} team-${unit.team}">
        <div class="who">${unit.name} ${facingArrow(unit.facing)}</div>
        <div class="bar hp ${hpLevel(best, unit.maxHp)}">
          ${incoming ? html`<i class="ghost" style="width: ${pct(best)}"></i>` : nothing}
          <i style="width: ${pct(worst)}"></i>
        </div>
        <div class="hp-text">${hpText}</div>
      </div>
    `
  }

  private renderForecast(view: ForecastView) {
    const f = view.forecast
    const damage = f.minDamage === f.maxDamage ? `${f.maxDamage}` : `${f.minDamage}-${f.maxDamage}`
    return html`
      <div class="panel forecast team-${view.attacker.team}">
        <div class="panel-title"><span>${t().card.forecast}</span></div>
        <div class="versus">
          ${this.renderFighter(view.attacker, 'left')}
          <dl class="numbers">
            <dt>${t().card.hit}</dt><dd>${percent(f.hitChance)}</dd>
            <dt>${t().card.damage}</dt><dd>${damage}</dd>
            <dt>${t().card.kill}</dt><dd class="kill">${percent(f.killChance)}</dd>
          </dl>
          ${this.renderFighter(view.defender, 'right', { min: f.minDamage, max: f.maxDamage })}
        </div>
        ${view.counter ? html`
          <div class="counter">
            <span class="label">${t().card.counterIfSurvives}</span>
            <span>${t().card.counterHit(percent(view.counter.hitChance))}</span>
            <span>${t().card.counterDmg(view.counter.minDamage === view.counter.maxDamage ? `${view.counter.maxDamage}` : `${view.counter.minDamage}-${view.counter.maxDamage}`)}</span>
            ${view.counter.killChance > 0 ? html`<span class="kill">${t().card.killsYou(percent(view.counter.killChance))}</span>` : nothing}
          </div>
        ` : nothing}
        ${f.backAttack || f.critChance >= 1 ? html`
          <div class="badges">
            ${f.backAttack ? html`<span class="chip badge-back">${t().card.backAttack}</span>` : nothing}
            ${f.critChance >= 1 ? html`<span class="chip badge-crit">${t().card.critical}</span>` : nothing}
          </div>
        ` : nothing}
      </div>
    `
  }

  override render() {
    if (this.forecast) return this.renderForecast(this.forecast)
    if (this.unit) return this.renderUnit(this.unit)
    return nothing
  }
}
