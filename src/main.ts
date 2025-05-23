import * as ex from 'excalibur'
import { loader, Resources } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'
import { StartScreen } from './levels/start-screen'

const game = new ex.Engine({
  resolution: {
    width: 1360,
    height: 768,
  },
  displayMode: ex.DisplayMode.FitScreenAndFill,
  antialiasing: false,
  pixelRatio: 1,
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

export const originalCameraPos = game.currentScene.camera.pos.clone()
export const originalZoom = game.currentScene.camera.zoom

function addMaps () {
  const Level1M1Data: LevelData = {
    name: 'level1-map1',
    maxTurns: 100,
    players: [ 'Human', 'CPU' ],
    tiledMap: Resources.TiledMap1
  }

  const level1m1 = new LevelBase(Level1M1Data, 'level1-map1')
  game.addScene(level1m1.name, level1m1)

  const Level1m2Data: LevelData = {
    name: 'level1-map2',
    maxTurns: 100,
    players: [ 'Human', 'CPU' ],
    tiledMap: Resources.TiledMap2
  }

  const level1m2 = new LevelBase(Level1m2Data, 'level1-map2')
  game.addScene(level1m2.name, level1m2)
}

game.start(loader).then(() => {
  game.goToScene('start')
  Resources.TiledMap1.addToScene(game.currentScene)
  addMaps()
})
