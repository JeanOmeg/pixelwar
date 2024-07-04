import * as ex from 'excalibur'
import { loader } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import { StartScreen } from './levels/start-screen'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'

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
  data: [
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',

    'GAAA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GAAB2',
    'GAFA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GC', 'RA', 'RA', 'GC', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GAFB2',
    'GACA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GC', 'RA', 'RA', 'RA', 'RA', 'GC', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GACB2',
    'GAWA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'B1', 'B2', 'B2', 'B3', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GAWB2',
    'GABA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GC', 'RA', 'RA', 'RA', 'RA', 'GC', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GABB2',
    'GASA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GC', 'RA', 'RA', 'GC', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GASB2',
    'GAMA1', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GAMB2',

    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'RA', 'RA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA', 'GA',
    'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'RB', 'RB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB', 'GB',
  ]
}

const level1 = new LevelBase(Level1Data, 'level1')
game.addScene(level1.name, level1)

export const originalCameraPos = game.currentScene.camera.pos.clone()
export const originalZoom = game.currentScene.camera.zoom

game.start(loader).then(() => {
  game.goToScene('start')
})
