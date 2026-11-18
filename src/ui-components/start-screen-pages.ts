/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { css, html } from 'lit'
import { CLASS_INFO, UNIT_CLASSES, classStats, classTraits } from '../unit-classes'
import { unitPortrait } from '../ui-sprites'
import type { UnitType } from '../config'

/** Static pages of the start screen: How to play, Units and Credits */

export const pageStyles = css`
  .page { width: calc(1500 * var(--u)); max-width: 96vw; max-height: 90vh; display: flex; flex-direction: column; }
  .page .panel-title { font-size: calc(30 * var(--t)); padding: calc(12 * var(--u)) calc(18 * var(--u)); }
  .page-body { overflow-y: auto; padding: calc(20 * var(--u)); scrollbar-color: var(--edge) transparent; }
  .page-footer { display: flex; justify-content: flex-end; padding: 0 calc(20 * var(--u)) calc(18 * var(--u)); }
  .page-footer .btn { --team: #2a2d3a; font-size: calc(24 * var(--t)); padding: calc(10 * var(--u)) calc(26 * var(--u)); }

  .howto { display: grid; grid-template-columns: repeat(2, 1fr); gap: calc(16 * var(--u)); }
  .howto section { background: rgba(255, 255, 255, 0.05); padding: calc(14 * var(--u)) calc(18 * var(--u)); }
  .howto h3 { margin: 0 0 calc(10 * var(--u)); font-weight: normal; font-size: calc(24 * var(--t)); color: var(--gold); }
  .howto ul { margin: 0; padding-left: calc(20 * var(--u)); display: flex; flex-direction: column; gap: calc(6 * var(--u)); }
  .howto li { font-size: calc(16 * var(--t)); line-height: 1.35; }
  .howto b { font-weight: normal; color: #fff; text-decoration: underline; text-decoration-thickness: calc(2 * var(--u)); text-underline-offset: calc(3 * var(--u)); }

  .units { display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(14 * var(--u)); }
  .unit { background: rgba(255, 255, 255, 0.05); padding: calc(12 * var(--u)); display: flex; flex-direction: column; gap: calc(8 * var(--u)); }
  .unit-head { display: flex; align-items: center; gap: calc(10 * var(--u)); }
  .unit-head img { width: calc(72 * var(--u)); height: calc(72 * var(--u)); image-rendering: pixelated; background: rgba(0, 0, 0, 0.35); }
  .unit-head h3 { margin: 0; font-weight: normal; font-size: calc(24 * var(--t)); }
  .unit-head small { font-size: calc(14 * var(--t)); color: var(--gold); }
  .unit p { margin: 0; font-size: calc(14 * var(--t)); line-height: 1.35; color: var(--muted); min-height: calc(38 * var(--u)); }
  .unit .stats { display: grid; grid-template-columns: repeat(5, 1fr); text-align: center; gap: calc(4 * var(--u)); }
  .unit .stats div { background: rgba(0, 0, 0, 0.35); padding: calc(4 * var(--u)) 0; font-size: calc(18 * var(--t)); line-height: 1; }
  .unit .stats small { display: block; font-size: calc(12 * var(--t)); color: var(--muted); margin-top: calc(3 * var(--u)); }
  .unit .traits { display: flex; flex-wrap: wrap; gap: calc(5 * var(--u)); }
  .unit .traits .chip { font-size: calc(13 * var(--t)); color: var(--mp); }

  .credits { display: flex; flex-direction: column; gap: calc(14 * var(--u)); font-size: calc(20 * var(--t)); line-height: 1.4; }
  .credits ul { margin: 0; padding-left: calc(24 * var(--u)); display: flex; flex-direction: column; gap: calc(8 * var(--u)); }
  .credits a { color: var(--gold); }
`

export function renderHowToPlay() {
  return html`
    <div class="howto">
      <section>
        <h3>Goal</h3>
        <ul>
          <li>Defeat every enemy unit.</li>
          <li>If nobody wins in 50 rounds, the match is a draw.</li>
        </ul>
      </section>
      <section>
        <h3>Your turn</h3>
        <ul>
          <li>Click a unit and pick <b>Move</b>, <b>Attack</b>, <b>Skills</b> or <b>Wait</b>.</li>
          <li>Each unit can move once and attack once per turn, in any order.</li>
          <li>Press <b>End turn</b> at the top when you are done.</li>
        </ul>
      </section>
      <section>
        <h3>Combat</h3>
        <ul>
          <li>Hit if <b>ATK + d20</b> beats <b>DEF + 10</b>. Damage is <b>d6 + ATK − DEF</b>.</li>
          <li>Dice are rolled twice and the best roll counts.</li>
          <li>A natural 20 is a <b>critical</b>: 12 + ATK − DEF damage.</li>
          <li>Hit an enemy from <b>behind</b> to never miss and use double ATK.</li>
          <li>Attacks go in straight lines and stop at the first unit.</li>
          <li>Aim at an enemy to see the hit and kill chances before attacking.</li>
        </ul>
      </section>
      <section>
        <h3>Terrain</h3>
        <ul>
          <li>Open ground costs 1 move. Woods and rough terrain cost 2.</li>
          <li>Walls and trees block moves and attacks.</li>
          <li>Water blocks moves, but attacks fly over it.</li>
          <li>Doors can be crossed, but block attacks. Units on a door can't attack or be attacked.</li>
        </ul>
      </section>
      <section>
        <h3>Skills</h3>
        <ul>
          <li><b>Run</b> (2 MP): double movement this turn.</li>
          <li><b>Special</b> (4 MP): the next attack is a critical hit.</li>
          <li>One skill per turn. MP does not come back.</li>
        </ul>
      </section>
      <section>
        <h3>Army</h3>
        <ul>
          <li>Before the match, pick a class for each starting slot of the map.</li>
          <li>Every class has a cost in points. Your army can spend up to <b>100</b>.</li>
          <li><b>Classic army</b> restores the units drawn in the map (exactly 100 points).</li>
        </ul>
      </section>
      <section>
        <h3>Controls</h3>
        <ul>
          <li><b>Left click</b>: select and act.</li>
          <li><b>Right click</b>: show a unit's movement range.</li>
          <li><b>Middle click</b>: show a unit's attack range.</li>
          <li><b>Click</b> an enemy (or a unit that already acted): its movement range; click again: its attack range.</li>
          <li><b>Esc</b>: close the menu or cancel the action.</li>
        </ul>
      </section>
      <section>
        <h3>Touch screen</h3>
        <ul>
          <li><b>Tap</b> one of your units to open its menu.</li>
          <li>When moving or attacking, the first <b>tap</b> previews the path or the combat; <b>tap the same tile again</b> to confirm.</li>
          <li><b>Tap</b> outside the highlighted tiles to cancel.</li>
          <li><b>Tap</b> an enemy: its movement range; tap it again: its attack range.</li>
        </ul>
      </section>
    </div>
  `
}

export function renderUnits() {
  return html`
    <div class="units">
      ${UNIT_CLASSES.map(unitClass => {
        const stats = classStats(unitClass)
        const info = CLASS_INFO[unitClass]
        const traits = classTraits(unitClass)
        return html`
          <div class="unit">
            <div class="unit-head">
              <img src=${unitPortrait(`${unitClass}A` as UnitType)} alt="" />
              <div><h3>${unitClass}</h3><small>${info.role} · ${info.cost} pts</small></div>
            </div>
            <p>${info.description}</p>
            <div class="stats">
              <div>${stats.health}<small>HP</small></div>
              <div>${stats.attack}<small>ATK</small></div>
              <div>${stats.defense}<small>DEF</small></div>
              <div>${stats.range}<small>RNG</small></div>
              <div>${stats.movement}<small>MOV</small></div>
            </div>
            ${traits.length ? html`<div class="traits">${traits.map(t => html`<span class="chip">${t}</span>`)}</div>` : ''}
          </div>
        `
      })}
    </div>
  `
}

export function renderCredits() {
  return html`
    <div class="credits">
      <div>Built with <a href="https://excaliburjs.com" target="_blank" rel="noopener">Excalibur.js</a> and <a href="https://lit.dev" target="_blank" rel="noopener">Lit</a>.</div>
      <ul>
        <li>Sound effects by <a href="https://erikonarheim.com" target="_blank" rel="noopener">Erik Onarheim</a> with <a href="https://sfxr.me/" target="_blank" rel="noopener">JSFXR</a></li>
        <li><a href="https://not-jam.itch.io/not-jam-slab-serif-11" target="_blank" rel="noopener">Font NotJamSlabSerif11</a> (CC0)</li>
        <li><a href="https://opengameart.org/content/5-chiptunes-action" target="_blank" rel="noopener">Battle music by Juhani Junkala</a> (CC0)</li>
        <li><a href="https://opengameart.org/content/title-x" target="_blank" rel="noopener">Battle music by poinl</a> (CC0)</li>
        <li><a href="https://opengameart.org/content/two-left-socks" target="_blank" rel="noopener">Title music by congusbongus</a> (CC0)</li>
      </ul>
    </div>
  `
}
