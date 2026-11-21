import { html, svg } from 'lit'
import type { Language } from '../i18n'

/**
 * Small pixel-style flags for the language picker (title screen). Drawn on a
 * 30x21 grid with crisp edges, so they match the pixel-art UI at any size.
 */

const usStripes = Array.from({ length: 7 }, (_, i) => i % 2 === 0
  ? svg`<rect x="0" y=${i * 3} width="30" height="3" fill="#c8102e" />`
  : svg`<rect x="0" y=${i * 3} width="30" height="3" fill="#ffffff" />`)

const usStars = [2, 6, 10].flatMap(x => [2, 5].map(y => svg`<rect x=${x} y=${y} width="1" height="1" fill="#ffffff" />`))
  .concat([4, 8].flatMap(x => [3.5, 6.5].map(y => svg`<rect x=${x} y=${y - 0.5} width="1" height="1" fill="#ffffff" />`)))

const US = html`
  <svg viewBox="0 0 30 21" shape-rendering="crispEdges" aria-hidden="true">
    ${usStripes}
    ${svg`<rect x="0" y="0" width="13" height="9" fill="#0a3161" />`}
    ${usStars}
  </svg>
`

const BRAZIL = html`
  <svg viewBox="0 0 30 21" shape-rendering="crispEdges" aria-hidden="true">
    ${svg`<rect x="0" y="0" width="30" height="21" fill="#009c3b" />`}
    ${svg`<polygon points="15,2 28,10.5 15,19 2,10.5" fill="#ffdf00" /><circle cx="15" cy="10.5" r="5" fill="#002776" /><path d="M10.2 9.2 Q15 8 19.9 11.2 L19.6 12.2 Q15 9.2 10.1 10.3 Z" fill="#ffffff" />`}
  </svg>
`

export function flagIcon(language: Language) {
  return language === 'pt-BR' ? BRAZIL : US
}
