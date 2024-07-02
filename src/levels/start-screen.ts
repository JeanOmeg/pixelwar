/// <reference lib="dom" />

import * as ex from 'excalibur'
import { Cloud } from '../cloud'
import { Resources } from '../resources'
import { SCALE } from '../config'

export class StartScreen extends ex.Scene {
  title!: ex.Actor
  p1VsCpuButton!: ex.Actor
  p1VsP2Button!: ex.Actor
  cpuVscpuButton!: ex.Actor

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine

    this.add(new Cloud(ex.vec(0, 0)))

    const titleFont = new ex.Font({
      family: 'notjamslab14',
      size: 32 * SCALE.x,
      unit: ex.FontUnit.Px,
      color: ex.Color.White,
      baseAlign: ex.BaseAlign.Top,
      shadow: {
        offset: ex.vec(2, 2).scale(SCALE),
        color: ex.Color.White
      }
    })

    this.title = new ex.Actor({
      name: 'title',
      pos: ex.vec(400, 200),
      coordPlane: ex.CoordPlane.Screen,
    })

    const titleText = new ex.Text({
      text: 'PixelWar',
      font: titleFont,
    })

    this.title.scale = SCALE
    this.title.graphics.use(titleText)
    this.title.actions.repeatForever(ctx => {
      ctx.easeBy(ex.vec(0, -30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
        .easeBy(ex.vec(0, 30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
    })
    this.add(this.title)

    const buttonFont = new ex.Font({
      family: 'notjamslab14',
      size: 32 * SCALE.x,
      unit: ex.FontUnit.Px,
      color: ex.Color.White,
      baseAlign: ex.BaseAlign.Top,
      shadow: {
        offset: ex.vec(2, 2).scale(SCALE),
        color: ex.Color.Black
      }
    })

    this.p1VsCpuButton = new ex.Actor({
      name: 'p1VsCpuButton',
      pos: ex.vec(400, 400),
      width: 200 * SCALE.x,
      height: 50 * SCALE.y,
      color: ex.Color.fromHex('#ff6347'),
      coordPlane: ex.CoordPlane.Screen
    })

    const p1VsCpuText = new ex.Text({
      text: 'P1 vs CPU',
      font: buttonFont,
    })

    this.p1VsCpuButton.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.p1VsCpuButton.width,
            height: this.p1VsCpuButton.height,
            color: this.p1VsCpuButton.color,
            strokeColor: ex.Color.Black,
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

    this.p1VsCpuButton.on('pointerup', () => {
      localStorage.setItem('start_screen', 'p1vscpu')
      this.engine.goToScene('level1')
    })

    this.add(this.p1VsCpuButton)

    this.p1VsP2Button = new ex.Actor({
      name: 'p1VsP2Button',
      pos: ex.vec(400, 525),
      width: 200 * SCALE.x,
      height: 50 * SCALE.y,
      color: ex.Color.fromHex('#4682b4'),
      coordPlane: ex.CoordPlane.Screen
    })

    const p1VsP2Text = new ex.Text({
      text: 'P1 vs P2',
      font: buttonFont,
    })

    this.p1VsP2Button.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.p1VsP2Button.width,
            height: this.p1VsP2Button.height,
            color: this.p1VsP2Button.color,
            strokeColor: ex.Color.Black,
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

    this.p1VsP2Button.on('pointerup', () => {
      localStorage.setItem('start_screen', 'p1vsp2')
      this.engine.goToScene('level1')
    })

    this.add(this.p1VsP2Button)

    this.cpuVscpuButton = new ex.Actor({
      name: 'cpuVscpuButton',
      pos: ex.vec(400, 650),
      width: 200 * SCALE.x,
      height: 50 * SCALE.y,
      color: ex.Color.fromHex('#ff6347'),
      coordPlane: ex.CoordPlane.Screen
    })

    const cpuVscputext = new ex.Text({
      text: 'CPU vs CPU',
      font: buttonFont,
    })

    this.cpuVscpuButton.graphics.use(new ex.GraphicsGroup({
      members: [
        {
          graphic: new ex.Rectangle({
            width: this.cpuVscpuButton.width,
            height: this.cpuVscpuButton.height,
            color: this.cpuVscpuButton.color,
            strokeColor: ex.Color.Black,
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

    this.cpuVscpuButton.on('pointerup', () => {
      localStorage.setItem('start_screen', 'cpuvscpu')
      this.engine.goToScene('level1')
    })

    this.add(this.cpuVscpuButton)
  }

  _subscriptions: ex.Subscription[] = []
  onActivate(): void {
    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  onDeactivate(): void {
    Resources.TitleMusic.stop()
    this._subscriptions.forEach(h => h.close())
  }
}
