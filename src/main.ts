import * as ex from 'excalibur'
import { loader, Resources } from './resources'
import { LevelBase, LevelData } from './levels/level-base'
import './ui-components/audio-menu'
import './ui-components/start-screen-ui'
import { AudioManager } from './audio-manager'

const game = new ex.Engine({
  resolution: {
    width: 1920,
    height: 1080,
  },
  displayMode: ex.DisplayMode.FitScreenAndFill,
  antialiasing: false,
  pixelRatio: 1,
  suppressConsoleBootMessage: true,
  backgroundColor: ex.Color.Black
})

AudioManager.init()

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

addMaps()

game.start(loader).then(() => {
  mountStartScreen()
})

export { game }