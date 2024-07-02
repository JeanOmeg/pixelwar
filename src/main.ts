import * as ex from 'excalibur'
import { loader } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import { StartScreen } from './levels/start-screen'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'

const game = new ex.Engine({
  width: 800,
  height: 800,
  displayMode: ex.DisplayMode.FitScreenAndFill,
  pixelArt: true,
  suppressConsoleBootMessage: true,
  backgroundColor: ex.Color.Black,
  suppressPlayButton: true,
  configurePerformanceCanvas2DFallback: {
    allow: true,
    threshold: {
      numberOfFrames: 60,
      fps: 30
    }
  }
})

AudioManager.init()

const startScreen = new StartScreen()
game.addScene('start', startScreen)

const Level1Data: LevelData = {
  displayName: 'Gentle Plains',
  name: 'level1',
  nextLevel: 'start',
  width: 22,
  height: 11,
  maxTurns: 1000,
  players: ['Human', 'CPU'],
  data: [
    'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G',
    'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G',
    'GAA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GAB2',
    'GBA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'T', 'W', 'W', 'T', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GBB2',
    'GSA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'T', 'W', 'W', 'W', 'W', 'T', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GSB2',
    'GWA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'S', 'S', 'S', 'S', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GWB2',
    'GFA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'T', 'W', 'W', 'W', 'W', 'T', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GFB2',
    'GCA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'T', 'W', 'W', 'T', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GCB2',
    'GMA1', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'GMB2',
    'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'W', 'W', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G',
    'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'C', 'C', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B',
  ]
}

const level1 = new LevelBase(Level1Data, 'level1')
game.addScene(level1.name, level1)

export const originalCameraPos = game.currentScene.camera.pos.clone()
export const originalZoom = game.currentScene.camera.zoom

game.start(loader).then(() => {
  game.goToScene('start')
})
