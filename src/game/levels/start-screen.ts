/// <reference lib="dom" />
import * as ex from 'excalibur'
import { ActorStartScreen } from '../actors/actor-start-screen'
import { SCALE } from '../config'
import { FontNotjamslab14 } from '../fonts/font-notjamslab14'
import { Resources } from '../resources'

export class StartScreen extends ex.Scene {
  title = ActorStartScreen.createTitleActor()
  p1VsCpuButton = ActorStartScreen.createP1VsCpuButtonActor()
  p1VsP2Button = ActorStartScreen.createP1VsP2ButtonActor()
  cpuVscpuButton = ActorStartScreen.createCpuVsCpuButtonActor()
  map1Button!: ex.Actor
  map2Button!: ex.Actor
  ramdomMapButton!: ex.Actor
  fadeOverlay!: ex.Actor
  isTransitioning = false

  override onInitialize(engine: ex.Engine) {
    this.engine = engine
    this.fadeOverlay = ActorStartScreen.createFadeOverlayActor(engine)

    this.addActors()

    void this.isMobile()
    this.addPointerEnterListeners(this.startButtons)
    this.addPointerLeaveListeners(this.startButtons)
    this.addPointerUpListener(this.startButtons)
  }

  override onActivate() {
    this.checkKillButtons(this.startButtons)
    Resources.TitleMusic.loop = true
    void Resources.TitleMusic.play()
  }

  override onDeactivate() {
    Resources.TitleMusic.stop()
  }

  private get startButtons() {
    return [this.p1VsCpuButton, this.p1VsP2Button, this.cpuVscpuButton]
  }

  private get mapButtons() {
    return [this.map1Button, this.map2Button, this.ramdomMapButton]
  }

  private killButtons(buttons: ex.Actor[]) {
    for (const button of buttons) {
      button.kill()
    }
  }

  private createMapButton(
    name: string,
    position: ex.Vector,
    color: ex.Color,
    text: string,
    texture: ex.ImageSource | null,
    scene: ex.Scene
  ): ex.Actor {
    const button = new ex.Actor({
      name,
      pos: position,
      width: 210 * SCALE.x,
      height: 45 * SCALE.y,
      color,
      coordPlane: ex.CoordPlane.Screen
    })

    const buttonText = new ex.Text({
      text,
      font: FontNotjamslab14.buttonFont,
    })

    const graphicsGroupMembers: (ex.GraphicsGrouping | ex.Graphic)[] = [
      {
        graphic: new ex.Rectangle({
          width: button.width,
          height: button.height,
          color: button.color,
          lineWidth: 4,
        }),
        offset: ex.vec(0, 0),
      }
    ]

    if (texture) {
      const sprite = texture.toSprite()
      sprite.scale = ex.vec(0.05, 0.05)

      graphicsGroupMembers.push({
        graphic: sprite,
        offset: ex.vec(5, button.height / 2 - sprite.height / 2),
      })
    }

    graphicsGroupMembers.push({
      graphic: buttonText,
      offset: ex.vec(5 + (texture ? 100 : 0), button.height / 2 - buttonText.height / 2),
    })

    button.graphics.use(new ex.GraphicsGroup({
      members: graphicsGroupMembers
    }))

    button.scale = SCALE
    scene.add(button)

    return button
  }

  addActors() {
    this.add(this.title)
    this.add(this.p1VsCpuButton)
    this.add(this.p1VsP2Button)
    this.add(this.cpuVscpuButton)
  }

  async pointerUp(actorPrincipal: ex.Actor, ...actorsToKill: ex.Actor[]) {
    if (this.isTransitioning) return
    this.isTransitioning = true
    this.pointerLeave()

    localStorage.setItem('start_screen', actorPrincipal.name)
    void Resources.SelectSound.play()

    await Promise.all([
      ...actorsToKill.map(actor => actor.actions.fade(0, 1000).toPromise()),
      actorPrincipal.actions.blink(200, 200, 4).toPromise()
    ])

    this.killButtons(this.startButtons)

    this.selectMap()

    this.isTransitioning = false
  }

  pointerEnter() {
    if (this.isTransitioning) return
    this.engine.canvas.style.cursor = 'pointer'
  }

  pointerLeave() {
    this.engine.canvas.style.cursor = 'default'
  }

  addPointerEnterListeners(actors: ex.Actor[]) {
    for (const actor of actors) {
      actor.on('pointerenter', () => this.pointerEnter())
    }
  }

  addPointerLeaveListeners(actors: ex.Actor[]) {
    for (const actor of actors) {
      actor.on('pointerleave', () => this.pointerLeave())
    }
  }

  addPointerUpListener(buttons: ex.Actor[]) {
    for (const button of buttons) {
      const others = buttons.filter(b => b !== button)
      button.on('pointerup', () => void this.pointerUp(button, ...others))
    }
  }

  selectMap() {
    this.map1Button = this.createMapButton('map1', ex.vec(650, 400), ex.Color.Red, 'Map 1', Resources.Map1, this)
    this.map2Button = this.createMapButton('map2', ex.vec(650, 520), ex.Color.Blue, 'Map 2', Resources.Map2, this)
    this.ramdomMapButton = this.createMapButton('ramdomMap', ex.vec(650, 640), ex.Color.Red, 'Random Map', null, this)

    this.map1Button.on('pointerup', () => {
      this.map2Button.kill()
      this.ramdomMapButton.kill()
      void Resources.SelectSound.play()
      void this.map1Button.actions.blink(100, 100, 6).toPromise()

      this.killButtons(this.mapButtons)
      void this.engine.goToScene('level1-map1')
    })

    this.map2Button.on('pointerup', () => {
      this.map1Button.kill()
      this.ramdomMapButton.kill()
      void Resources.SelectSound.play()
      void  this.map2Button.actions.blink(100, 100, 6).toPromise()

      this.killButtons(this.mapButtons)
      void this.engine.goToScene('level1-map2')
    })

    this.ramdomMapButton.on('pointerup', () => {
      this.map1Button.kill()
      this.map2Button.kill()
      void Resources.SelectSound.play()
      void this.ramdomMapButton.actions.blink(100, 100, 6).toPromise()

      this.killButtons(this.mapButtons)
      void this.engine.goToScene('start')
    })
  }

  checkKillButtons(buttons: ex.Actor[]) {
    for (const button of buttons) {
      if (button.isKilled()) {
        this.add(button)
        button.actions.fade(1, 100)
      }
    }
  }

  async isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i

    if (mobileRegex.test(userAgent)) {
      await this.setLandscapeAndFullscreen()
    }
  }

  async setLandscapeAndFullscreen() {
    const docElement = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>
      webkitRequestFullscreen?: () => Promise<void>
      msRequestFullscreen?: () => Promise<void>
    }

    if (docElement.requestFullscreen) {
      await docElement.requestFullscreen()
    } else if (docElement.mozRequestFullScreen) {
      await docElement.mozRequestFullScreen()
    } else if (docElement.webkitRequestFullscreen) {
      await docElement.webkitRequestFullscreen()
    } else if (docElement.msRequestFullscreen) {
      await docElement.msRequestFullscreen()
    }

    const screenOrientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'portrait' | 'portrait-primary' | 'portrait-secondary' | 'landscape' | 'landscape-primary' | 'landscape-secondary') => Promise<void>
    }

    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock('landscape').catch(function (error) {
        console.error('Erro ao tentar definir a orientação para paisagem:', error)
      })
    }
  }
}
