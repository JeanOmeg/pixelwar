import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators'
import { AudioManager } from '../audio-manager'
import { canFullscreen, isFullscreen, toggleFullscreen } from '../device'

/**
 * Corner buttons: sound on/off and fullscreen (entering fullscreen also turns
 * a phone to landscape). The fullscreen button is hidden where the browser
 * can't do it (iPhone Safari).
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
  `

  @property({ type: Boolean })
    soundOn = !AudioManager.muted

  @state()
  private fullscreen = isFullscreen()

  private onFullscreenChange = () => { this.fullscreen = isFullscreen() }

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
      ${canFullscreen() ? html`
        <button @click=${() => toggleFullscreen()} class="material-symbols-outlined" title="Fullscreen">${this.fullscreen ? 'fullscreen_exit' : 'fullscreen'}</button>
      ` : nothing}
    `
  }
}
