import { css, unsafeCSS } from 'lit'

/** Pixel-art icons (SVG masks) painted with currentColor: <i class="icon i-heart"></i> */
const ICONS: Record<string, string> = {
  heart: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 22 22\'%3E%3Cpath fill=\'%23000\' d=\'M12 20h-2v-1H9v-1H8v-1H7v-1H6v-1H5v-1H4v-1H3v-1H2v-2H1V5h1V4h1V3h1V2h5v1h1v1h2V3h1V2h5v1h1v1h1v1h1v5h-1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1zm-7-9v1h1v1h1v1h1v1h1v1h1v1h2v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1V9h1V6h-1V5h-1V4h-3v1h-1v1h-1v1h-2V6H9V5H8V4H5v1H4v1H3v3h1v2z\'/%3E%3C/svg%3E")',
  sword: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 22 22\'%3E%3Cpath fill=\'%23000\' d=\'M5 20H3v-1H2v-2h1v-1h1v-1h1v-1H4v-1H3v-2h2v1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h1V3h1V2h5v5h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h1v2H9v-1H8v-1H7v1H6v1H5m5-6v-1h1v-1h1v-1h1V9h1V8h1V7h1V6h1V5h1V4h-2v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H9v1H8v1Z\'/%3E%3C/svg%3E")',
  shield: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23000\' d=\'M1 0v7c0 5.6 7 9 7 9s7-3.4 7-9V0zm13 7c0 4.2-4.6 7.1-6 7.9V1h6z\'/%3E%3C/svg%3E")',
  bow: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 22 22\'%3E%3Cpath fill=\'%23000\' d=\'M1 3h10v1h2v1h3V4h1V2h3v3h-2v1h-1v3h1v2h1v10h-2v-2h-2v-1h-1v-1h-1v-1h-1v-1h-1v-1H9v1H8v1H7v3H6v1H5v1H4v-1H3v-1H2v-1H1v-1h1v-1h1v-1h3v-1h1v-1h1v-2H7v-1H6V9H5V8H4V7H3V5H1zm15 15h1v-6h-1v-2h-1V9h-1v1h-1v1h-1v1h-1v1h1v1h1v1h1v1h1v1h1zM12 7V6h-2V5H4v1h1v1h1v1h1v1h1v1h1v1h1v-1h1V9h1V8h1V7z\'/%3E%3C/svg%3E")',
  boot: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23000\' d=\'M10.74 11.72c.47 1.23.42 2.51-.99 3.02c-2.9 1.07-3.55-1.74-3.59-1.88zm-5.03-.81l4.32-1.07c-.19-1.05.1-2.1.1-3.34c0-1.68-1.33-4.97-3.45-4.44c-2.42.6-2.77 3.29-2.68 4.59c.12 1.3 1.64 4.08 1.71 4.26m12.14 8.94c-.03.15-.69 2.95-3.59 1.89c-1.4-.52-1.46-1.8-.99-3.03zm2.15-6.2c.1-1.3-.24-4-2.67-4.6c-2.11-.55-3.44 2.76-3.44 4.45c0 1.23.28 2.28.11 3.33l4.3 1.07c.08-.18 1.59-2.96 1.7-4.25\'/%3E%3C/svg%3E")',
  star: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23000\' d=\'M7 1h2v1h-2zM7 2h2v1h-2zM6 3h4v1h-4zM6 4h4v1h-4zM1 5h14v1h-14zM2 6h12v1h-12zM3 7h10v1h-10zM4 8h8v1h-8zM4 9h8v1h-8zM3 10h10v1h-10zM3 11h4v1h-4zM9 11h4v1h-4zM2 12h4v1h-4zM10 12h4v1h-4zM2 13h3v1h-3zM11 13h3v1h-3z\'/%3E%3C/svg%3E")',
  mana: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%23000\' d=\'M12 2c-5.33 4.55-8 8.48-8 11.8C4 17.78 7.67 22 12 22s8-4.22 8-8.2c0-3.32-2.67-7.25-8-11.8\'/%3E%3C/svg%3E")',
}

const iconRules = Object.entries(ICONS)
  .map(([name, url]) => `.i-${name} { -webkit-mask-image: ${url}; mask-image: ${url}; }`)
  .join('\n')

export const iconStyles = css`
  .icon {
    display: inline-block;
    flex-shrink: 0;
    width: calc(14 * var(--u));
    height: calc(14 * var(--u));
    background-color: currentColor;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-size: 100% 100%;
    mask-size: 100% 100%;
  }
  ${unsafeCSS(iconRules)}
`
