import { css, html } from 'lit'
import { t } from '../i18n'

/** Static pages of the start screen: Credits */

export const pageStyles = [css`
  .page { width: calc(1500 * var(--u)); max-width: 96vw; max-height: 90vh; display: flex; flex-direction: column; }
  .page .panel-title { font-size: calc(30 * var(--t)); padding: calc(12 * var(--u)) calc(18 * var(--u)); }
  .page-body { overflow-y: auto; padding: calc(20 * var(--u)); scrollbar-color: var(--edge) transparent; }
  .page-footer { display: flex; justify-content: flex-end; padding: 0 calc(20 * var(--u)) calc(18 * var(--u)); }
  .page-footer .btn { --team: #2a2d3a; font-size: calc(24 * var(--t)); padding: calc(10 * var(--u)) calc(26 * var(--u)); }


  .credits { display: flex; flex-direction: column; gap: calc(14 * var(--u)); font-size: calc(20 * var(--t)); line-height: 1.4; }
  .credits ul { margin: 0; padding-left: calc(24 * var(--u)); display: flex; flex-direction: column; gap: calc(8 * var(--u)); }
  .credits a { color: var(--gold); }
  .creator { display: flex; flex-direction: column; gap: calc(4 * var(--u)); padding-bottom: calc(14 * var(--u)); border-bottom: calc(2 * var(--u)) solid rgba(255, 255, 255, 0.15); }
  .creator small { font-size: calc(16 * var(--t)); color: var(--gold); text-transform: uppercase; letter-spacing: calc(2 * var(--u)); }
  .creator strong { font-weight: normal; font-size: calc(32 * var(--t)); color: #fff; }
`]

export function renderCredits() {
  return html`
    <div class="credits">
      <div class="creator">
        <small>${t().credits.createdBy}</small>
        <strong>Jean Fernandes</strong>
        <span>${t().credits.aka} <a href="https://github.com/JeanOmeg" target="_blank" rel="noopener">jeanomeg</a></span>
        <span>${t().credits.source} <a href="https://github.com/JeanOmeg/pixelwar" target="_blank" rel="noopener">github.com/JeanOmeg/pixelwar</a></span>
      </div>
      <div>${t().credits.builtWith} <a href="https://excaliburjs.com" target="_blank" rel="noopener">Excalibur.js</a> ${t().credits.and} <a href="https://lit.dev" target="_blank" rel="noopener">Lit</a>.</div>
      <ul>
        <li>${t().credits.soundBy} <a href="https://erikonarheim.com" target="_blank" rel="noopener">Erik Onarheim</a> ${t().credits.with} <a href="https://sfxr.me/" target="_blank" rel="noopener">JSFXR</a></li>
        <li>${t().credits.musicBy} <a href="https://pixabay.com/users/nakaradaalexander-7260388/" target="_blank" rel="noopener">Alexander Nakarada</a> / <a href="https://www.creatorchords.com" target="_blank" rel="noopener">https://www.creatorchords.com</a></li>
        <li><a href="https://not-jam.itch.io/not-jam-slab-serif-11" target="_blank" rel="noopener">${t().credits.font}</a> (CC0)</li>
      </ul>
    </div>
  `
}
