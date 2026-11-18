/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { css, html } from 'lit'
import { CLASS_INFO, classStats, classTraits, rangeNote } from '../unit-classes'
import { CLASS_SKILL, skillsOf } from '../skills'
import { STARTING_MP } from '../config'
import type { UnitClass } from '../path-finding/terrain-rules'

/**
 * Everything a player needs to know about a class: description, stats, how
 * its range works, every skill (cost and effect) and its special rules.
 * Shared by the Units page and the army builder so both always show the same.
 */

export const classDetailStyles = css`
  .details { display: flex; flex-direction: column; gap: calc(8 * var(--u)); text-align: left; }
  .details .desc { margin: 0; font-size: calc(14 * var(--t)); line-height: 1.35; color: var(--muted); }
  .details .stats { display: grid; grid-template-columns: repeat(6, 1fr); text-align: center; gap: calc(4 * var(--u)); }
  .details .stats div { background: rgba(0, 0, 0, 0.35); padding: calc(4 * var(--u)) 0; font-size: calc(18 * var(--t)); line-height: 1; color: var(--ink); }
  .details .stats small { display: block; font-size: calc(12 * var(--t)); color: var(--muted); margin-top: calc(3 * var(--u)); }
  .details .range { font-size: calc(14 * var(--t)); line-height: 1.3; color: var(--muted); }
  .details .range b { font-weight: normal; color: var(--ink); }
  .details .skills { display: flex; flex-direction: column; gap: calc(4 * var(--u)); }
  .details .skill { font-size: calc(14 * var(--t)); line-height: 1.35; color: var(--muted); }
  .details .skill b { font-weight: normal; color: var(--ink); }
  .details .skill.own b { color: var(--gold); }
  .details .skill .mp { color: var(--mp); }
  .details .traits { display: flex; flex-wrap: wrap; gap: calc(5 * var(--u)); }
  .details .traits .chip { font-size: calc(13 * var(--t)); color: var(--mp); }
`

export function renderClassDetails(unitClass: UnitClass) {
  const stats = classStats(unitClass)
  const traits = classTraits(unitClass)
  const own = CLASS_SKILL[unitClass]
  // the class skill first: it is what sets the class apart
  const skills = skillsOf(unitClass).sort((a, b) => Number(b.id === own) - Number(a.id === own))
  return html`
    <div class="details">
      <p class="desc">${CLASS_INFO[unitClass].description}</p>
      <div class="stats">
        <div>${stats.health}<small>HP</small></div>
        <div>${stats.attack}<small>ATK</small></div>
        <div>${stats.defense}<small>DEF</small></div>
        <div>${stats.range}<small>RNG</small></div>
        <div>${stats.movement}<small>MOV</small></div>
        <div>${STARTING_MP}<small>MP</small></div>
      </div>
      <div class="range"><b>Range:</b> ${rangeNote(unitClass, stats.range)}</div>
      <div class="skills">
        ${skills.map(skill => html`
          <div class="skill ${skill.id === own ? 'own' : ''}">
            <b>${skill.name}</b> <span class="mp">${skill.cost} MP</span>: ${skill.description}
          </div>
        `)}
      </div>
      ${traits.length ? html`<div class="traits">${traits.map(t => html`<span class="chip">${t}</span>`)}</div>` : ''}
    </div>
  `
}
