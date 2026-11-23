import * as ex from 'excalibur'
import { loader } from './loader'
import { LevelBase } from './levels/level-base'
import { MAPS } from './maps'
import './ui-components/start-screen-ui'
import { AudioManager } from './audio-manager'
import { installDeniedSound } from './effects'
import { isTouchDevice, refitScreen, setupTouchDevice } from './device'
import { attachSpeedToEngine } from './speed'
import { startGamepadInput } from './gamepad/gamepad-input'
import { onLanguageChange, t } from './i18n'

const game = new ex.Engine({
  resolution: { width: 1920, height: 1080 },
  // touch: FitScreen keeps 16:9 so a phone held upright doesn't stretch the canvas past the WebGL texture limit
  displayMode: isTouchDevice() ? ex.DisplayMode.FitScreen : ex.DisplayMode.FitScreenAndFill,
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
installDeniedSound()
attachSpeedToEngine(game)

setupTouchDevice()
localizePage()
onLanguageChange(localizePage)

// controllers: the match on screen gets the camera (zoom/pan); everything else goes through keys and focus
startGamepadInput(() => game.currentScene instanceof LevelBase ? game.currentScene.ui ?? null : null)

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

addMaps()

game.start(loader).then(() => {
  // Excalibur's loader saves the canvas size when loading starts and restores
  // it after PLAY!: a phone opened upright and turned on the loader screen kept
  // the portrait size (a tiny board in the match). Fit the current window again.
  refitScreen()
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
  // the loader starts on pointerup: the click that follows a tap would land on
  // the start screen button under the finger, so ignore input for a moment
  const startScreen = document.querySelector<HTMLElement>('start-screen-ui')
  if (startScreen) {
    startScreen.style.pointerEvents = 'none'
    window.setTimeout(() => { startScreen.style.pointerEvents = '' }, 400)
  }
})

// dev builds only: lets automated browser tests reach the engine (see CLAUDE.md)
if (process.env.NODE_ENV !== 'production') (window as unknown as { __game: ex.Engine }).__game = game

export { game }
/** Texts written in index.html (the "rotate your device" hint) follow the language */
function localizePage() {
  const hint = document.querySelector('.rotate-hint-box')
  const title = hint?.querySelector('p')
  const text = hint?.querySelector('small')
  if (title) title.textContent = t().rotate.title
  if (text) text.textContent = t().rotate.text
}
