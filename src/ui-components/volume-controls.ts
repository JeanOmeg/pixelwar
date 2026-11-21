import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { AudioChannel, AudioManager, VOLUME_STEPS } from '../audio-manager'
import { Resources } from '../resources'
import { playSound } from '../effects'
import { onLanguageChange, t } from '../i18n'

/**
 * Music and effects volume (− / + buttons, so the controller and touch reach
 * them too) and the mute switch. Used in the corner sound panel (<audio-menu>)
 * and in the pause menu; sizes use --u/--t when inside the game theme, plain
 * pixels otherwise.
 */
@customElement('volume-controls')
export class VolumeControls extends LitElement {
  static styles = css`
    :host {
      --vu: var(--u, 1px);
      --vt: var(--t, 1px);
      display: flex;
      flex-direction: column;
      gap: calc(10 * var(--vu));
      font-family: notjamslab14, monospace;
      color: #f4f1e8;
    }
    .channels { display: flex; flex-direction: column; gap: calc(10 * var(--vu)); }
    .row { display: flex; align-items: center; gap: calc(8 * var(--vu)); }
    .label { flex: 1; min-width: calc(90 * var(--vu)); font-size: calc(16 * var(--vt)); }
    button {
      all: unset;
      cursor: pointer;
      display: grid;
      place-items: center;
      min-width: calc(30 * var(--vu));
      height: calc(30 * var(--vu));
      border: calc(2 * var(--vu)) solid #f4f1e8;
      background: #2a2d3a;
      box-shadow: calc(2 * var(--vu)) calc(2 * var(--vu)) 0 #000;
      font-size: calc(18 * var(--vt));
    }
    button:hover:not(:disabled), button:focus-visible { background: #3d4155; }
    button:disabled { opacity: 0.4; cursor: default; }
    .bar { display: flex; gap: calc(3 * var(--vu)); }
    .bar span { width: calc(8 * var(--vu)); height: calc(18 * var(--vu)); background: #3d4155; }
    .bar span.on { background: #4cc9f0; }
    .muted .bar span.on { background: #7a7f93; }
    .mute { padding: 0 calc(12 * var(--vu)); font-size: calc(16 * var(--vt)); }
  `

  private stops: (() => void)[] = []

  override connectedCallback() {
    super.connectedCallback()
    this.stops = [
      AudioManager.onChange(() => this.requestUpdate()),
      onLanguageChange(() => this.requestUpdate())
    ]
  }

  override disconnectedCallback() {
    this.stops.forEach(stop => stop())
    this.stops = []
    super.disconnectedCallback()
  }

  private change(channel: AudioChannel, delta: number) {
    AudioManager.setVolume(channel, AudioManager.volumes[channel] + delta)
    // hear the new effects level
    if (channel === 'effects') playSound(Resources.SelectSound)
  }

  private renderChannel(channel: AudioChannel, label: string) {
    const value = AudioManager.volumes[channel]
    return html`
      <div class="row">
        <span class="label">${label}</span>
        <button title="−" aria-label="${label} −" ?disabled=${value <= 0} @click=${() => this.change(channel, -1)}>−</button>
        <span class="bar" role="meter" aria-valuemin="0" aria-valuemax=${VOLUME_STEPS} aria-valuenow=${value}>
          ${Array.from({ length: VOLUME_STEPS }, (_, i) => html`<span class=${i < value ? 'on' : ''}></span>`)}
        </span>
        <button title="+" aria-label="${label} +" ?disabled=${value >= VOLUME_STEPS} @click=${() => this.change(channel, 1)}>+</button>
      </div>
    `
  }

  override render() {
    return html`
      <div class="channels ${AudioManager.muted ? 'muted' : ''}">
        ${this.renderChannel('music', t().audio.music)}
        ${this.renderChannel('effects', t().audio.effects)}
      </div>
      <div class="row">
        <button class="mute" @click=${() => AudioManager.toggleMute(!AudioManager.muted)}>${AudioManager.muted ? t().audio.unmute : t().audio.mute}</button>
      </div>
    `
  }
}
