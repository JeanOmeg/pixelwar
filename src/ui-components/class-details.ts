import { css, html, nothing } from 'lit'
import { CLASS_INFO, classStats, classTraits, rangeNote } from '../unit-classes'
import { CLASS_SKILL, skillsOf } from '../skills'
import { STARTING_MP } from '../config'
import type { UnitClass } from '../path-finding/terrain-rules'
import { t } from '../i18n'

/**
 * Everything a player needs to know about a class: description, stats, how
 * its range works, every skill (cost and effect) and its passives.
 * Shared by the Units page and the army builder so both always show the same.
 * `renderClassStats` and `renderClassAbilities` are the two halves, for the
 * army builder's compact cards (stats only until the card is opened).
 */

export const classDetailStyles = css`
  .details { display: flex; flex-direction: column; gap: calc(8 * var(--u)); text-align: left; }
  .details .desc { margin: 0; font-size: calc(14 * var(--t)); line-height: 1.35; color: var(--muted); }
  .stats { display: grid; grid-template-columns: repeat(var(--stat-count, 6), 1fr); text-align: center; gap: calc(4 * var(--u)); }
  .stats div { background: rgba(0, 0, 0, 0.35); padding: calc(4 * var(--u)) 0; font-size: calc(18 * var(--t)); line-height: 1; color: var(--ink); }
  .stats small { display: block; font-size: calc(12 * var(--t)); color: var(--muted); margin-top: calc(3 * var(--u)); }
  .details .range { font-size: calc(14 * var(--t)); line-height: 1.3; color: var(--muted); }
  .details .range b { font-weight: normal; color: var(--ink); }
  .details .skills { display: flex; flex-direction: column; gap: calc(4 * var(--u)); }
  .details .skill { font-size: calc(14 * var(--t)); line-height: 1.35; color: var(--muted); }
  .details .skill b { font-weight: normal; color: var(--ink); }
  .details .skill.own b { color: var(--gold); }
  .details .skill .mp { color: var(--mp); }
  .details .skill .passive { color: var(--hp); }
`

/** The stat boxes; `mp: false` leaves out MP (the same for every class) */
export function renderClassStats(unitClass: UnitClass, { mp = true } = {}) {
  const stats = classStats(unitClass)
  return html`
    <div class="stats" style="--stat-count: ${mp ? 6 : 5}">
      <div>${stats.health}<small>${t().stats.hp}</small></div>
      <div>${stats.attack}<small>${t().stats.atk}</small></div>
      <div>${stats.defense}<small>${t().stats.def}</small></div>
      <div>${stats.range}<small>${t().stats.rng}</small></div>
      <div>${stats.movement}<small>${t().stats.mov}</small></div>
      ${mp ? html`<div>${STARTING_MP}<small>${t().stats.mp}</small></div>` : nothing}
    </div>
  `
}

/** Range, skills and passives (one list, same look) */
export function renderClassAbilities(unitClass: UnitClass) {
  const own = CLASS_SKILL[unitClass]
  // the class skill first: it is what sets the class apart
  const skills = skillsOf(unitClass).sort((a, b) => Number(b.id === own) - Number(a.id === own))
  return html`
    <div class="range"><b>${t().details.range}</b> ${rangeNote(unitClass, classStats(unitClass).range)}</div>
    <div class="skills">
      ${skills.map(skill => html`
        <div class="skill ${skill.id === own ? 'own' : ''}">
          <b>${skill.name}</b> <span class="mp">${skill.cost} ${t().stats.mp}</span>: ${skill.description}
        </div>
      `)}
      ${classTraits(unitClass).map(trait => html`
        <div class="skill">
          <b>${trait.name}</b> <span class="passive">${t().details.passive}</span>: ${trait.description}
        </div>
      `)}
    </div>
  `
}

export function renderClassDetails(unitClass: UnitClass) {
  return html`
    <div class="details">
      <p class="desc">${CLASS_INFO[unitClass].description}</p>
      ${renderClassStats(unitClass)}
      ${renderClassAbilities(unitClass)}
    </div>
  `
}
