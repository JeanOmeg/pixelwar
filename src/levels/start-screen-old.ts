/// <reference lib="dom" />
import * as ex from 'excalibur'
import { ActorStartScreen } from '../actors/actor-start-screen'
import { SCALE } from '../config'
import { FontNotjamslab14 } from '../fonts/font-notjamslab14'
import { Resources } from '../resources'
import { p1VsP2Text, cpuVscputext } from '../texts/text'

export class StartScreen extends ex.Scene {
  title: ex.Actor = ActorStartScreen.createTitle()
  p1VsCpuButton: ex.Actor = ActorStartScreen.createP1VsCpuButton()
  p1VsP2Button!: ex.Actor
  cpuVscpuButton!: ex.Actor
  map1Button!: ex.Actor
  map2Button!: ex.Actor
  ramdomMapButton!: ex.Actor
  fadeOverlay!: ex.Actor
  isTransitioning: boolean = false

  override onInitialize(engine: ex.Engine): void {
    this.isMobile()

    this.engine = engine
    this.fadeOverlay = ActorStartScreen.createFadeOverlay(engine)

    this.add(this.title)
    this.add(this.p1VsCpuButton)

    this.p1VsCpuButton.on('pointerenter', () => {
      if (this.isTransitioning) return
      this.engine.canvas.style.cursor = 'pointer'
    })
    
    this.p1VsCpuButton.on('pointerleave', () => {
      this.engine.canvas.style.cursor = 'default'
    })

    this.p1VsCpuButton.on('pointerup', () => this.pointerUp())

    this.p1VsP2Button = new ex.Actor({
      name: 'p1VsP2Button',
      pos: ex.vec(650, 520),
      width: 200 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Blue,
      coordPlane: ex.CoordPlane.Screen
    })
    
    this.p1VsP2Button.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.p1VsP2Button.width,
            height: this.p1VsP2Button.height,
            color: this.p1VsP2Button.color,
            lineWidth: 4,
          }),
          offset: ex.vec(0, 0),
        },
        {
          graphic: p1VsP2Text,
          offset: ex.vec(this.p1VsP2Button.width / 2 - p1VsP2Text.width / 2,
            this.p1VsP2Button.height / 2 - p1VsP2Text.height / 2),
        }
      ]
    }))

    this.p1VsP2Button.on('pointerup', async () => {
      this.p1VsCpuButton.kill()
      this.cpuVscpuButton.kill()
      Resources.SelectSound.play()
      localStorage.setItem('start_screen', 'p1vsp2')
      await this.p1VsP2Button.actions.blink(100, 100, 6).toPromise()
      this.selectMap()
    })

    this.p1VsP2Button.scale = SCALE
    this.add(this.p1VsP2Button)

    this.cpuVscpuButton = new ex.Actor({
      name: 'cpuVscpuButton',
      pos: ex.vec(650, 640),
      width: 200 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Red,
      coordPlane: ex.CoordPlane.Screen
    })

    this.cpuVscpuButton.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.cpuVscpuButton.width,
            height: this.cpuVscpuButton.height,
            color: this.cpuVscpuButton.color,
            lineWidth: 4,
          }),
          offset: ex.vec(0, 0),
        },
        {
          graphic: cpuVscputext,
          offset: ex.vec(this.cpuVscpuButton.width / 2 - cpuVscputext.width / 2,
            this.cpuVscpuButton.height / 2 - cpuVscputext.height / 2),
        }
      ]
    }))

    this.cpuVscpuButton.on('pointerup', async () => {
      this.p1VsCpuButton.kill()
      this.p1VsP2Button.kill()
      Resources.SelectSound.play()
      localStorage.setItem('start_screen', 'cpuvscpu')
      await this.cpuVscpuButton.actions.blink(100, 100, 6).toPromise()
      this.selectMap()
    })

    this.cpuVscpuButton.scale = SCALE
    this.add(this.cpuVscpuButton)
  }

  _subscriptions: ex.Subscription[] = []
  onActivate(): void {
    if (this.p1VsCpuButton.isKilled()) {
      this.add(this.p1VsCpuButton)
    }
    if (this.p1VsP2Button.isKilled()) {
      this.add(this.p1VsP2Button)
    }
    if (this.cpuVscpuButton.isKilled()) {
      this.add(this.cpuVscpuButton)
    }

    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  onDeactivate(): void {
    Resources.TitleMusic.stop()
    this._subscriptions.forEach(h => h.close())
  }

  async pointerUp() {
    if (this.isTransitioning) return
    this.isTransitioning = true
    this.engine.canvas.style.cursor = 'default'

    Resources.SelectSound.play()
    localStorage.setItem('start_screen', 'p1vscpu')

    this.add(this.fadeOverlay)

    await this.smoothFade(this.fadeOverlay, 0, 1, 1000)
    await this.killButtoms()

    await this.selectMap()

    await this.fadeOverlay.actions.fade(0, 1000).toPromise()
    this.fadeOverlay.kill()

    this.isTransitioning = false
  }

  async selectMap() {
    this.map1Button = new ex.Actor({
      name: 'map1',
      pos: ex.vec(650, 400),
      width: 210 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Red,
      coordPlane: ex.CoordPlane.Screen
    })

    const choseMap1text = new ex.Text({
      text: 'Map 1',
      font: FontNotjamslab14.buttonFont,
    })

    const loader = new ex.Loader()
    const mapTexture1 = Resources.Map1
    const mapTexture2 = Resources.Map2

    loader.addResource(mapTexture1)
    loader.addResource(mapTexture2)

    const mapSprite1 = mapTexture1.toSprite()
    mapSprite1.scale = ex.vec(0.05, 0.05)
    const mapSprite2 = mapTexture2.toSprite()
    mapSprite2.scale = ex.vec(0.05, 0.05)

    this.map1Button.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.map1Button.width,
            height: this.map1Button.height,
            color: this.map1Button.color,
            lineWidth: 4,
          }),
          offset: ex.vec(0, 0),
        },
        {
          graphic: mapSprite1,
          offset: ex.vec(5,
            this.map1Button.height / 2 - mapSprite1.height / 2),
        },
        {
          graphic: choseMap1text,
          offset: ex.vec(mapSprite1.width + 10,
            this.map1Button.height / 2 - choseMap1text.height / 2),
        }
      ]
    }))

    this.map1Button.on('pointerup', async () => {
      this.map2Button.kill()
      this.ramdomMapButton.kill()
      Resources.SelectSound.play()
      await this.map1Button.actions.blink(100, 100, 6).toPromise()

      this.engine.goToScene('level1-map1')
      this.killMaps()
    })

    this.map1Button.scale = SCALE
    this.add(this.map1Button)

    this.map2Button = new ex.Actor({
      name: 'map2',
      pos: ex.vec(650, 520),
      width: 210 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Blue,
      coordPlane: ex.CoordPlane.Screen
    })

    const choseMap2text = new ex.Text({
      text: 'Map 2',
      font: FontNotjamslab14.buttonFont,
    })

    this.map2Button.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.map2Button.width,
            height: this.map2Button.height,
            color: this.map2Button.color,
            lineWidth: 4,
          }),
          offset: ex.vec(0, 0),
        },
        {
          graphic: mapSprite2,
          offset: ex.vec(5,
            this.map2Button.height / 2 - mapSprite2.height / 2),
        },
        {
          graphic: choseMap2text,
          offset: ex.vec(mapSprite2.width + 10,
            this.map2Button.height / 2 - choseMap2text.height / 2),
        }
      ]
    }))

    this.map2Button.on('pointerup', async () => {
      this.map1Button.kill()
      this.ramdomMapButton.kill()
      Resources.SelectSound.play()
      await this.map2Button.actions.blink(100, 100, 6).toPromise()

      this.killMaps()
      this.engine.goToScene('level1-map2')
    })

    this.map2Button.scale = SCALE
    this.add(this.map2Button)

    this.ramdomMapButton = new ex.Actor({
      name: 'ramdomMap',
      pos: ex.vec(650, 640),
      width: 210 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Red,
      coordPlane: ex.CoordPlane.Screen
    })

    const choseRamdomMaptext = new ex.Text({
      text: 'Random Map',
      font: FontNotjamslab14.buttonFont,
    })

    this.ramdomMapButton.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.ramdomMapButton.width,
            height: this.ramdomMapButton.height,
            color: this.ramdomMapButton.color,
            lineWidth: 4,
          }),
          offset: ex.vec(0, 0),
        },
        {
          graphic: choseRamdomMaptext,
          offset: ex.vec(this.ramdomMapButton.width / 2 - choseRamdomMaptext.width / 2,
            this.ramdomMapButton.height / 2 - choseRamdomMaptext.height / 2),
        }
      ]
    }))

    this.ramdomMapButton.on('pointerup', async () => {
      this.map1Button.kill()
      this.map2Button.kill()
      Resources.SelectSound.play()
      await this.ramdomMapButton.actions.blink(100, 100, 6).toPromise()

      // const maps = ['level1-map1', 'level1-map2']
      this.killMaps()
      this.engine.goToScene('start')
    })

    this.ramdomMapButton.scale = SCALE
    this.add(this.ramdomMapButton)

    this.p1VsCpuButton.kill()
    this.p1VsP2Button.kill()
    this.cpuVscpuButton.kill()
  }

  killMaps() {
    this.map1Button.kill()
    this.map2Button.kill()
    this.ramdomMapButton.kill()
  }

  async killButtoms() {
    this.p1VsCpuButton.actions.fade(1, 0)
    this.p1VsP2Button.actions.fade(1, 0)
    this.cpuVscpuButton.actions.fade(1, 0)
    this.p1VsCpuButton.kill()
    this.p1VsP2Button.kill()
    this.cpuVscpuButton.kill()
  }

  isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i

    if (mobileRegex.test(userAgent)) {
      this.setLandscapeAndFullscreen()
    }
  }

  setLandscapeAndFullscreen() {
    const docElement = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>
      webkitRequestFullscreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    if (docElement.requestFullscreen) {
      docElement.requestFullscreen()
    } else if (docElement.mozRequestFullScreen) {
      docElement.mozRequestFullScreen()
    } else if (docElement.webkitRequestFullscreen) {
      docElement.webkitRequestFullscreen()
    } else if (docElement.msRequestFullscreen) {
      docElement.msRequestFullscreen()
    }

    const screenOrientation = screen.orientation as ScreenOrientation & {
      // eslint-disable-next-line no-unused-vars
      lock?: (orientation: 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape' | 'landscape-primary' | 'landscape-secondary') => Promise<void>
    }

    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock('landscape').catch(function (error) {
        // eslint-disable-next-line no-console
        console.error('Erro ao tentar definir a orientação para paisagem:', error)
      })
    }
  }

  async smoothFade(actor: ex.Actor, start: number, end: number, duration: number, steps = 5): Promise<void> {
    const stepDuration = duration / steps
    const fadeSteps = []
  
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const value = ex.EasingFunctions.EaseInOutCubic(t, start, end, 1)
      fadeSteps.push(() => actor.actions.fade(value, stepDuration).toPromise())
    }
  
    return fadeSteps.reduce((p, step) => p.then(step), Promise.resolve())
  }
}
