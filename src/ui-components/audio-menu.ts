import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators'
import { AudioManager } from '../audio-manager'
import { canFullscreen, isFullscreen, isStandalone, needsHomeScreenForFullscreen, toggleFullscreen } from '../device'

/**
 * Corner buttons: sound on/off and fullscreen (entering fullscreen also turns
 * a phone to landscape). The fullscreen button appears only after PLAY! (from
 * the main menu on). Where the browser can't go fullscreen (iPhone) it opens a
 * tip on adding the game to the home screen; in the installed app (already
 * without browser bars) it is hidden.
 */
@customElement('audio-menu')
export class AudioMenu extends LitElement {
  static styles = css`
    :host {
        position: absolute;
        left: 0;
        bottom: 0;
        margin: 16px;
        margin-left: max(16px, env(safe-area-inset-left, 0px));
        /* above the "rotate your device" hint (10000): always reachable */
        z-index: 10001;
        display: flex;
        gap: 12px;
    }
    button {
        all: unset;
        cursor: pointer;
        color: white;
        font-size: 32px;
    }
    .material-symbols-outlined {
        font-family: 'Material Symbols Outlined';
        font-weight: normal;
        font-style: normal;
        font-size: 24px;
        line-height: 1;
        letter-spacing: normal;
        text-transform: none;
        display: inline-block;
        white-space: nowrap;
        word-wrap: normal;
        direction: ltr;
        font-feature-settings: 'liga';
        -moz-font-feature-settings: 'liga';
        -moz-osx-font-smoothing: grayscale;
    }
    .tip {
        position: absolute;
        left: 0;
        bottom: calc(100% + 12px);
        width: min(320px, calc(100vw - 32px));
        box-sizing: border-box;
        padding: 14px 16px;
        border: 3px solid #f4f1e8;
        box-shadow: 4px 4px 0 #000;
        background: #0e101a;
        color: #f4f1e8;
        font-family: notjamslab14, monospace;
        font-size: 14px;
        line-height: 1.5;
        cursor: pointer;
    }
    .tip strong {
        display: block;
        margin-bottom: 6px;
        font-size: 16px;
    }
    .tip .icon {
        font-size: 18px;
        vertical-align: -4px;
    }
    .tip small {
        display: block;
        margin-top: 8px;
        color: #9ea3b8;
        font-size: 14px;
    }
  `

  @property({ type: Boolean })
    soundOn = !AudioManager.muted

  /** The fullscreen button only shows once the player is past the loader (main.ts) */
  @property({ type: Boolean, attribute: 'fullscreen-ready' })
    fullscreenReady = false

  @state()
  private fullscreen = isFullscreen()

  /** iPhone: tip on adding the game to the home screen */
  @state()
  private tipOpen = false

  private onFullscreenChange = () => { this.fullscreen = isFullscreen() }

  private fullscreenButton() {
    if (!this.fullscreenReady || isStandalone()) return nothing
    if (canFullscreen()) {
      return html`<button @click=${() => toggleFullscreen()} class="material-symbols-outlined" title="Fullscreen">${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</button>`
    }
    if (!needsHomeScreenForFullscreen()) return nothing
    return html`
      <button @click=${() => { this.tipOpen = !this.tipOpen }} class="material-symbols-outlined" title="Fullscreen" aria-expanded=${this.tipOpen}>fullscreen</button>
      ${this.tipOpen ? html`
        <div class="tip" role="dialog" @click=${() => { this.tipOpen = false }}>
          <strong>Play in fullscreen</strong>
          Tap <span class="material-symbols-outlined icon">ios_share</span> Share, then <b>Add to Home Screen</b>, and open PixelWar from the new icon.
          <small>Tap to close</small>
        </div>
      ` : nothing}
    `
  }

  override connectedCallback() {
    super.connectedCallback()
    document.addEventListener('fullscreenchange', this.onFullscreenChange)
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange)
  }

  override disconnectedCallback() {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange)
    super.disconnectedCallback()
  }

  toggleSound() {
    this.soundOn = !this.soundOn
    AudioManager.toggleMute(!this.soundOn)
  }

  override render() {
    // material symbols
    // https://fonts.google.com/icons?selected=Material+Symbols+Outlined:volume_off:FILL@0;wght@400;GRAD@0;opsz@24&icon.query=speaker
    return html`
      <button @click=${this.toggleSound} class="material-symbols-outlined" title="Sound">${this.soundOn ? 'volume_up' : 'volume_off'}</button>
      ${this.fullscreenButton()}
    `
  }
}
