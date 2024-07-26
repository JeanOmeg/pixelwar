import * as ex from 'excalibur'
import { loader } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import { StartScreen } from './levels/start-screen'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'
import { mapList } from './maps/maps'

// NODE 20

const game = new ex.Engine({
  resolution: {
    width: 1360,
    height: 768,
  },
  displayMode: ex.DisplayMode.FitScreenAndFill,
  antialiasing: {
    pixelArtSampler: true,
    canvasImageRendering: 'pixelated',
   },
  uvPadding: 0.5,
  suppressConsoleBootMessage: true,
  suppressHiDPIScaling: false,
  backgroundColor: ex.Color.Black,
  configurePerformanceCanvas2DFallback: {
    allow: false
  }
})

AudioManager.init()

const startScreen = new StartScreen()
game.addScene('start', startScreen)

const Level1M1Data: LevelData = {
  displayName: 'Gentle Plains',
  name: 'level1-map1',
  width: 28,
  height: 17,
  maxTurns: 1000,
  nextLevel: 'start',
  players: [ 'Human', 'CPU' ],
  data: mapList[0]
}

const level1m1 = new LevelBase(Level1M1Data, 'level1-map1')
game.addScene(level1m1.name, level1m1)

const Level1m2Data: LevelData = {
  displayName: 'Gentle Plains',
  name: 'level1-map2',
  width: 28,
  height: 17,
  maxTurns: 1000,
  nextLevel: 'start',
  players: [ 'Human', 'CPU' ],
  data: mapList[1]
}

const level1m2 = new LevelBase(Level1m2Data, 'level1-map2')
game.addScene(level1m2.name, level1m2)

export const originalCameraPos = game.currentScene.camera.pos.clone()
export const originalZoom = game.currentScene.camera.zoom

game.start(loader).then(() => {
  game.goToScene('start')
})
