import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { flagIcon } from './flags'
import './volume-controls'
import { LANGUAGES, Language, language, onLanguageChange, setLanguage, t } from '../i18n'
import { canFullscreen, isFullscreen, isStandalone, needsHomeScreenForFullscreen, toggleFullscreen } from '../device'
import { interfaceHidden, onInterfaceChange, setInterfaceHidden } from '../interface-visibility'
import { Resources } from '../resources'

export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', 'pt-BR': 'Português (Brasil)' }

/**
 * Every game setting in one place: sound (music, effects, mute), fullscreen,
 * the match interface and, on the main menu only (`languages`), the language
 * (a match never changes language midway). Used by the Options screen and the
 * pause menu.
 */
@customElement('settings-controls')
export class SettingsControls extends LitElement {
  static styles = [theme, css`
    :host { display: flex; flex-direction: column; gap: calc(16 * var(--u)); }
    .section { display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
    .section + .section { padding-top: calc(14 * var(--u)); border-top: calc(2 * var(--u)) solid #3d4155; }
    .label { font-size: calc(18 * var(--t)); color: var(--gold); text-transform: uppercase; letter-spacing: calc(2 * var(--u)); }
    .row { display: flex; flex-wrap: wrap; gap: calc(10 * var(--u)); }
    .row .btn { --team: #2a2d3a; font-size: calc(18 * var(--t)); padding: calc(8 * var(--u)) calc(18 * var(--u)); }
    .row .btn.on { --team: var(--blue); }
    .note { font-size: calc(14 * var(--t)); color: var(--muted); line-height: 1.4; }
    .note b { color: var(--ink); font-weight: normal; }
    .icon { font-family: 'Material Symbols Outlined'; font-size: calc(18 * var(--t)); vertical-align: -0.2em; font-feature-settings: 'liga'; }
    .flag {
      appearance: none;
      display: grid;
      place-items: center;
      padding: calc(6 * var(--u));
      background: rgba(0, 0, 0, 0.45);
      border: calc(3 * var(--u)) solid var(--edge);
      box-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000;
      cursor: pointer;
      opacity: 0.6;
    }
    .flag svg { display: block; width: calc(60 * var(--u)); height: calc(42 * var(--u)); image-rendering: pixelated; }
    .flag:hover, .flag:focus-visible { opacity: 1; }
    .flag.on { opacity: 1; border-color: var(--gold); }
  `]

  /** Shows the language flags (main menu only) */
  @property({ type: Boolean })
    languages = false

  @state()
  private fullscreen = isFullscreen()

  /** iPhone: tip on adding the game to the home screen */
  @state()
  private tipOpen = false

  private stops: (() => void)[] = []
  private onFullscreenChange = () => { this.fullscreen = isFullscreen() }

  override connectedCallback() {
    super.connectedCallback()
    this.stops = [
      onLanguageChange(() => this.requestUpdate()),
      onInterfaceChange(() => this.requestUpdate())
    ]
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
  }

  override disconnectedCallback() {
    this.stops.forEach(stop => stop())
    this.stops = []
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
    super.disconnectedCallback()
  }

  private choice(on: boolean, label: string, pick: () => void) {
    return html`<button class="btn btn-solid ${on ? 'on' : ''}" aria-pressed=${on} @click=${() => { if (!on) { Resources.SelectSound.play(); pick() } }}>${label}</button>`
  }

  private renderFullscreen() {
    // the installed app already has no browser bars
    if (isStandalone()) return nothing
    const o = t().options
    if (canFullscreen()) {
      return html`
        <div class="section">
          <span class="label">${t().audio.fullscreen}</span>
          <div class="row">
            ${this.choice(this.fullscreen, o.on, () => toggleFullscreen())}
            ${this.choice(!this.fullscreen, o.off, () => toggleFullscreen())}
          </div>
        </div>
      `
    }
    if (!needsHomeScreenForFullscreen()) return nothing
    const a = t().audio
    return html`
      <div class="section">
        <span class="label">${a.fullscreen}</span>
        <div class="row">
          <button class="btn btn-solid" aria-expanded=${this.tipOpen} @click=${() => { this.tipOpen = !this.tipOpen }}>${a.tipTitle}</button>
        </div>
        ${this.tipOpen ? html`
          <div class="note">${a.tipBefore} <span class="icon">ios_share</span> ${a.tipShare} <b>${a.tipAdd}</b>${a.tipAfter}</div>
        ` : nothing}
      </div>
    `
  }

  private renderLanguages() {
    if (!this.languages) return nothing
    return html`
      <div class="section">
        <span class="label">${t().title.language}</span>
        <div class="row" role="group" aria-label=${t().title.language}>
          ${LANGUAGES.map(lang => html`
            <button class="flag ${lang === language() ? 'on' : ''}" title=${LANGUAGE_NAMES[lang]} aria-label=${LANGUAGE_NAMES[lang]}
              aria-pressed=${lang === language()} @click=${() => this.chooseLanguage(lang)}>${flagIcon(lang)}</button>
          `)}
        </div>
      </div>
    `
  }

  private chooseLanguage(next: Language) {
    if (next === language()) return
    Resources.SelectSound.play()
    setLanguage(next)
  }

  override render() {
    const o = t().options
    const hidden = interfaceHidden()
    return html`
      <div class="section">
        <span class="label">${t().audio.sound}</span>
        <volume-controls></volume-controls>
      </div>
      ${this.renderFullscreen()}
      <div class="section">
        <span class="label">${o.interface}</span>
        <div class="row">
          ${this.choice(!hidden, o.shown, () => setInterfaceHidden(false))}
          ${this.choice(hidden, o.hidden, () => setInterfaceHidden(true))}
        </div>
        <div class="note">${o.interfaceNote}</div>
      </div>
      ${this.renderLanguages()}
    `
  }
}
