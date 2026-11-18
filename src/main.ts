import * as ex from 'excalibur'
import { loader } from './resources'
import { LevelBase } from './levels/level-base'
import { MAPS } from './maps'
import './ui-components/audio-menu'
import './ui-components/start-screen-ui'
import { AudioManager } from './audio-manager'

const game = new ex.Engine({
  resolution: { width: 1920, height: 1080 },
  displayMode: ex.DisplayMode.FitScreenAndFill,
  antialiasing: false,
  pixelRatio: 1,
  uvPadding: 0.5,
  suppressConsoleBootMessage: true,
  suppressHiDPIScaling: true,
  backgroundColor: ex.Color.Black,
  maxFps: 60,
  configurePerformanceCanvas2DFallback: {
    allow: false
  }
})

AudioManager.init()

function isMobileDevice() {
  const userAgent = navigator.userAgent
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}

function mountMobileWarning() {
  document.body.innerHTML = `
    <div
      style="
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: black;
        color: white;
        padding: 24px;
        text-align: center;
        font-family: 'notjamslab14', sans-serif;
      "
    >
      <div
        style="
          max-width: 900px;
          border: 4px solid white;
          padding: 32px 24px;
          background: #111;
          box-shadow: 6px 6px 0 black;
        "
      >
        <h1
          style="
            margin: 0 0 24px;
            font-size: 56px;
            font-weight: normal;
            text-shadow: 3px 3px 0 black;
          "
        >
          PixelFantasyWar
        </h1>

        <p
          style="
            margin: 0 0 16px;
            font-size: 28px;
            line-height: 1.4;
          "
        >
          This game is not yet available for mobile phones or tablets.
        </p>

        <p
          style="
            margin: 0;
            font-size: 22px;
            line-height: 1.4;
            opacity: 0.9;
          "
        >
          For now, access it via computer or laptop.
        </p>
      </div>
    </div>
  `
}

/** One scene per entry in MAPS (maps.ts), plus an empty scene behind the menus */
function addMaps() {
  game.addScene('menu-shell', new ex.Scene())
  for (const map of MAPS) {
    const level = new LevelBase(map)
    game.addScene(level.name, level)
  }
}

function mountStartScreen() {
  document.querySelector('start-screen-ui')?.remove()

  const startScreen = document.createElement('start-screen-ui') as HTMLElement & {
    engine: ex.Engine
  }

  startScreen.engine = game
  document.body.appendChild(startScreen)
}

if (isMobileDevice()) {
  mountMobileWarning()
} else {
  addMaps()

  game.start(loader).then(() => {
    // Excalibur's loader leaves a keyup(Enter) listener that calls its play
    // button getter, which rebuilds the "PLAY!" button after the loader is gone.
    // From now on that getter builds an invisible button instead.
    loader.startButtonFactory = () => {
      const hiddenButton = document.createElement('button')
      hiddenButton.hidden = true
      hiddenButton.tabIndex = -1
      return hiddenButton
    }
    mountStartScreen()
  })
}

export { game }