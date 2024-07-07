import * as ex from 'excalibur'
import { loader } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import { StartScreen } from './levels/start-screen'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'
import { map1 } from './maps/maps'

const game = new ex.Engine({
  resolution: {
    width: 1360,
    height: 768,
  },
  displayMode: ex.DisplayMode.FitScreenAndFill,
  pixelArt: true,
  suppressHiDPIScaling: true,
  suppressConsoleBootMessage: true,
  backgroundColor: ex.Color.Black,
  configurePerformanceCanvas2DFallback: {
    allow: false
  }
})

AudioManager.init()

const startScreen = new StartScreen()
game.addScene('start', startScreen)

const Level1Data: LevelData = {
  displayName: 'Gentle Plains',
  name: 'level1',
  nextLevel: 'start',
  width: 26,
  height: 15,
  maxTurns: 1000,
  players: [ 'Human', 'CPU' ],
  data: map1
}

const level1 = new LevelBase(Level1Data, 'level1')
game.addScene(level1.name, level1)

export const originalCameraPos = game.currentScene.camera.pos.clone()
export const originalZoom = game.currentScene.camera.zoom

game.start(loader).then(() => {
  game.goToScene('start')
})
