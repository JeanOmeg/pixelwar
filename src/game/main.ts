import * as ex from 'excalibur'
import { loader, Resources } from './resources'
import { LevelBase } from './levels/level-base'
import './ui-components/audio-menu'
import { AudioManager } from './audio-manager'
import { StartScreen } from './levels/start-screen'
import { mapList } from './maps/maps'

export async function setupGame(container: HTMLElement) {
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

  container.appendChild(game.canvas)

  AudioManager.init()

  const startScreen = new StartScreen()
  game.addScene('start', startScreen)

  const level1m1 = new LevelBase({
    displayName: 'Gentle Plains',
    name: 'level1-map1',
    width: 28,
    height: 17,
    maxTurns: 1000,
    nextLevel: 'start',
    players: ['Human', 'CPU'],
    data: mapList[0]!,
    tiled: Resources.MapLevel1
  }, 'level1-map1')
  game.addScene(level1m1.name, level1m1)

  const level1m2 = new LevelBase({
    displayName: 'Gentle Plains',
    name: 'level1-map2',
    width: 28,
    height: 17,
    maxTurns: 1000,
    nextLevel: 'start',
    players: ['Human', 'CPU'],
    data: mapList[1]!,
    tiled: Resources.MapLevel2
  }, 'level1-map2')
  game.addScene(level1m2.name, level1m2)

  await game.start(loader).then(async () => {
    await game.goToScene('start')
  })
}
