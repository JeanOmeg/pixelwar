import * as ex from 'excalibur'
import { loader, Resources } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
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
          PixelWar
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

function addMaps() {
  const menuShell = new ex.Scene()
  game.addScene('menu-shell', menuShell)

  const level1M1Data: LevelData = {
    name: 'level1-map1',
    maxTurns: 100,
    players: ['Human', 'CPU'],
    tiledMap: Resources.TiledMap1
  }

  const level1m1 = new LevelBase(level1M1Data, 'level1-map1')
  game.addScene(level1m1.name, level1m1)

  const level1M2Data: LevelData = {
    name: 'level1-map2',
    maxTurns: 100,
    players: ['Human', 'CPU'],
    tiledMap: Resources.TiledMap2
  }

  const level1m2 = new LevelBase(level1M2Data, 'level1-map2')
  game.addScene(level1m2.name, level1m2)
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
    mountStartScreen()
  })
}

export { game }