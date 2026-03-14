import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import * as ex from 'excalibur'
import { Resources } from '../resources'

type TStartMode = 'p1vscpu' | 'p1vsp2' | 'cpuvscpu'
type TStep = 'mode' | 'map' | null
type TScreen = | 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape' | 'landscape-primary' | 'landscape-secondary'

@customElement('start-screen-ui')
export class StartScreenUi extends LitElement {
  @property({ attribute: false })
    engine!: ex.Engine

  @state()
  private step: TStep = 'mode'

  @state()
  private selectedMode: TStartMode | null = null

  @state()
  private isTransitioning = false

  @state()
  private showFade = false

  @state()
  private blinkingButton: string | null = null

  static styles = css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: block;
      overflow: hidden;
      user-select: none;
    }

    .wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      pointer-events: auto;
    }

    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }

    .title {
      font-size: 56px;
      font-weight: bold;
      color: white;
      text-shadow: 3px 3px 0 black;
      margin-bottom: 12px;
    }

    .buttons {
      display: flex;
      flex-direction: column;
      gap: 18px;
      align-items: center;
    }

    button {
      min-width: 260px;
      min-height: 56px;
      padding: 10px 18px;
      border: 4px solid white;
      color: white;
      font-size: 20px;
      font-weight: bold;
      background: blue;
      cursor: pointer;
      image-rendering: pixelated;
      box-shadow: 4px 4px 0 black;
      transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;
    }

    button:hover:not(:disabled) {
      transform: scale(1.03);
      filter: brightness(1.08);
    }

    button:disabled {
      cursor: default;
      opacity: 0.7;
    }

    .red {
      background: red;
    }

    .blue {
      background: blue;
    }

    .map-button {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: flex-start;
    }

    .map-thumb {
      width: 52px;
      height: 34px;
      object-fit: cover;
      border: 2px solid white;
      background: black;
      image-rendering: pixelated;
      flex-shrink: 0;
    }

    .fade {
      position: absolute;
      inset: 0;
      background: black;
      opacity: 0;
      pointer-events: none;
      transition: opacity 1000ms ease;
    }

    .fade.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .blink {
      animation: blink 200ms linear 6;
    }

    @keyframes blink {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.2;
      }
    }

    @media (max-width: 768px) {
      .title {
        font-size: 38px;
      }

      button {
        min-width: 220px;
        font-size: 18px;
      }
    }
  `

  connectedCallback(): void {
    super.connectedCallback()
    this.isMobile()

    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  disconnectedCallback(): void {
    Resources.TitleMusic.stop()
    super.disconnectedCallback()
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="panel">
          <div class="title">Pixel War</div>

          ${this.step === 'mode'
    ? this.renderModeButtons()
    : this.renderMapButtons()}
        </div>

        <div class="fade ${this.showFade ? 'visible' : ''}"></div>
      </div>
    `
  }

  private renderModeButtons() {
    return html`
      <div class="buttons">
        <button
          class="blue ${this.blinkingButton === 'p1vscpu' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMode('p1vscpu')}
        >
          P1 vs CPU
        </button>

        <button
          class="red ${this.blinkingButton === 'p1vsp2' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMode('p1vsp2')}
        >
          P1 vs P2
        </button>

        <button
          class="blue ${this.blinkingButton === 'cpuvscpu' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMode('cpuvscpu')}
        >
          CPU vs CPU
        </button>
      </div>
    `
  }

  private renderMapButtons() {
    return html`
      <div class="buttons">
        <button
          class="red ${this.blinkingButton === 'map1' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMap('map1')}
        >
          <span class="map-button">
            <img class="map-thumb" src=${Resources.Map1.path} alt="Map 1" />
            <span>Map 1</span>
          </span>
        </button>

        <button
          class="blue ${this.blinkingButton === 'map2' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMap('map2')}
        >
          <span class="map-button">
            <img class="map-thumb" src=${Resources.Map2.path} alt="Map 2" />
            <span>Map 2</span>
          </span>
        </button>

        <button
          class="red ${this.blinkingButton === 'random' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${() => this.selectMap('random')}
        >
          Random Map
        </button>

        <button
          class="blue ${this.blinkingButton === 'back' ? 'blink' : ''}"
          ?disabled=${this.isTransitioning}
          @click=${this.backToModeSelection}
        >
          Back
        </button>
      </div>
    `
  }

  private async selectMode(mode: TStartMode) {
    if (this.isTransitioning) return

    localStorage.setItem('start_screen', mode)
    this.selectedMode = mode

    await this.fadeButtonMenu(mode, 'map')
  }

  private async backToModeSelection() {
    if (this.isTransitioning) return

    await this.fadeButtonMenu('back', 'mode')
  }

  private async selectMap(map: 'map1' | 'map2' | 'random') {
    if (this.isTransitioning) return

    let nextScene = ''

    if (map === 'map1') {
      nextScene = 'level1-map1'
    } else if (map === 'map2') {
      nextScene = 'level1-map2'
    } else {
      const maps = ['level1-map1', 'level1-map2']
      nextScene = maps[Math.floor(Math.random() * maps.length)]
    }

    await this.fadeButtonMenu(map)

    this.engine.goToScene(nextScene)
    this.remove()
  }

  private wait(ms: number) {
    return new Promise(resolve => {
      window.setTimeout(resolve, ms)
    })
  }

  private async fadeButtonMenu(button: string, step: TStep = null) {
    this.isTransitioning = true
    this.blinkingButton = button

    Resources.SelectSound.play()
    this.showFade = true

    await this.wait(1000)

    if (step) {
      this.step = step
    }

    this.showFade = false
    this.isTransitioning = false
  }

  private isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i

    if (mobileRegex.test(userAgent)) {
      this.setLandscapeAndFullscreen()
    }
  }

  private setLandscapeAndFullscreen() {
    const docElement = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>
      webkitRequestFullscreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    if (docElement.requestFullscreen) {
      void docElement.requestFullscreen()
    } else if (docElement.mozRequestFullScreen) {
      void docElement.mozRequestFullScreen()
    } else if (docElement.webkitRequestFullscreen) {
      void docElement.webkitRequestFullscreen()
    } else if (docElement.msRequestFullscreen) {
      void docElement.msRequestFullscreen()
    }

    const screenOrientation = screen.orientation as ScreenOrientation & {
      // eslint-disable-next-line no-unused-vars
      lock?: (orientation: TScreen) => Promise<void>
    }

    if (screenOrientation?.lock) {
      void screenOrientation.lock('landscape').catch(error => {
        // eslint-disable-next-line no-console
        console.error('Erro ao tentar definir a orientação para paisagem:', error)
      })
    }
  }
}