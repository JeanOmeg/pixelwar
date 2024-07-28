/// <reference lib="dom" />

import * as ex from 'excalibur'
import { Resources } from '../resources'
import { SCALE } from '../config'

export class StartScreen extends ex.Scene {

  title!: ex.Actor
  p1VsCpuButton!: ex.Actor
  p1VsP2Button!: ex.Actor
  cpuVscpuButton!: ex.Actor

  map1Button!: ex.Actor
  map2Button!: ex.Actor
  ramdomMapButton!: ex.Actor
  buttonFont!: ex.Font

  override onInitialize(engine: ex.Engine): void {
    const mobile = this.isMobile()
    if (mobile) {
      this.setLandscapeAndFullscreen()
    }
    this.engine = engine

    const titleFont = new ex.Font({
      family: 'notjamslab14',
      size: 64 * SCALE.x,
      unit: ex.FontUnit.Px,
      color: ex.Color.White,
      baseAlign: ex.BaseAlign.Top,
    })

    this.title = new ex.Actor({
      name: 'title',
      pos: ex.vec(650, 200),
      coordPlane: ex.CoordPlane.Screen,
    })

    const titleText = new ex.Text({
      text: 'PixelWar',
      font: titleFont,
    })

    this.title.scale = ex.vec(2, 2)
    this.title.graphics.use(titleText)
    this.title.actions.repeatForever(ctx => {
      ctx.easeBy(ex.vec(0, -30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
        .easeBy(ex.vec(0, 30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
    })

    this.add(this.title)

    this.buttonFont = new ex.Font({
      family: 'notjamslab14',
      size: 32 * SCALE.x,
      unit: ex.FontUnit.Px,
      color: ex.Color.White,
      baseAlign: ex.BaseAlign.Top,
    })

    this.p1VsCpuButton = new ex.Actor({
      name: 'p1VsCpuButton',
      pos: ex.vec(650, 400),
      width: 200 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Red,
      coordPlane: ex.CoordPlane.Screen
    })

    const p1VsCpuText = new ex.Text({
      text: 'P1 vs CPU',
      font: this.buttonFont,
    })

    this.p1VsCpuButton.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.p1VsCpuButton.width,
            height: this.p1VsCpuButton.height,
            color: this.p1VsCpuButton.color,
            lineWidth: 4,
          }), offset: ex.vec(0, 0),
        },
        {
          graphic: p1VsCpuText,
          offset: ex.vec(this.p1VsCpuButton.width / 2 - p1VsCpuText.width / 2,
            this.p1VsCpuButton.height / 2 - p1VsCpuText.height / 2),
        }
      ]
    }))

    this.p1VsCpuButton.on('pointerup', async () => {
      this.p1VsP2Button.kill()
      this.cpuVscpuButton.kill()
      Resources.SelectSound.play()
      localStorage.setItem('start_screen', 'p1vscpu')
      await this.p1VsCpuButton.actions.blink(100, 100, 6).toPromise()
      this.selectMap()
    })

    this.p1VsCpuButton.scale = SCALE
    this.add(this.p1VsCpuButton)

    this.p1VsP2Button = new ex.Actor({
      name: 'p1VsP2Button',
      pos: ex.vec(650, 520),
      width: 200 * SCALE.x,
      height: 45 * SCALE.y,
      color: ex.Color.Blue,
      coordPlane: ex.CoordPlane.Screen
    })

    const p1VsP2Text = new ex.Text({
      text: 'P1 vs P2',
      font: this.buttonFont,
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

    const cpuVscputext = new ex.Text({
      text: 'CPU vs CPU',
      font: this.buttonFont,
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

  selectMap() {
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
      font: this.buttonFont,
    })

    const loader = new ex.Loader();
    const mapTexture1 = Resources.Map1
    const mapTexture2 = Resources.Map2
    
    loader.addResource(mapTexture1);
    loader.addResource(mapTexture2);

    const mapSprite1 = mapTexture1.toSprite();
    mapSprite1.scale = ex.vec(0.05, 0.05);
    const mapSprite2 = mapTexture2.toSprite();
    mapSprite2.scale = ex.vec(0.05, 0.05);

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
      await this.map1Button.actions.blink(100, 100, 6).toPromise()
      
      this.engine.goToScene('level1-map1')
      this.killDiffMap(this.map1Button.name)
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
      font: this.buttonFont,
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
      await this.map2Button.actions.blink(100, 100, 6).toPromise()
      
      this.engine.goToScene('level1-map2')
      this.killDiffMap(this.map2Button.name)
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
      font: this.buttonFont,
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
      await this.ramdomMapButton.actions.blink(100, 100, 6).toPromise()
      
      const maps = ['level1-map1', 'level1-map2']
      this.engine.goToScene(maps[Math.floor(Math.random() * 2)])
      this.killDiffMap(this.ramdomMapButton.name)
    })

    this.ramdomMapButton.scale = SCALE
    this.add(this.ramdomMapButton)
    
    this.p1VsCpuButton.kill()
    this.p1VsP2Button.kill()
    this.cpuVscpuButton.kill()
  }

  killDiffMap(nameButton: string) {
    if (nameButton !== this.map1Button.name) {
      this.map1Button.kill()
    }
    if (nameButton !== this.map2Button.name) {
      this.map2Button.kill()
    }
    if (nameButton !== this.ramdomMapButton.name) {
      this.ramdomMapButton.kill()
    }
  }

  isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i
    return mobileRegex.test(userAgent)
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
      lock?: (orientation: "portrait" | "portrait-primary" | "portrait-secondary" | "landscape" | "landscape-primary" | "landscape-secondary") => Promise<void>
    }

    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock('landscape').catch(function (error) {
        console.error('Erro ao tentar definir a orientação para paisagem:', error)
      })
    }
  }
}
