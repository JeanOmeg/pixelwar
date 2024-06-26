/// <reference lib="dom" />

import * as ex from 'excalibur'
import { Cloud } from '../cloud'
import { Resources, Title } from '../resources'
import { SCALE } from '../config'

export class StartScreen extends ex.Scene {
  title!: ex.Actor
  p1VsCpuButton!: ex.Actor
  p1VsP2Button!: ex.Actor

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine

    // Adicionando as nuvens ao fundo
    this.add(new Cloud(ex.vec(0, 0)))

    // Adicionando o título
    this.title = new ex.Actor({
      name: 'title',
      pos: ex.vec(400, 300),
      coordPlane: ex.CoordPlane.Screen,
    })
    this.title.scale = SCALE
    this.title.graphics.use(Title)
    this.title.actions.repeatForever(ctx => {
      ctx.easeBy(ex.vec(0, -30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
        .easeBy(ex.vec(0, 30 * SCALE.y), 1000, ex.EasingFunctions.EaseInOutQuad)
    })
    this.add(this.title)

    // Estilo de fonte para os botões
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

    // Criando botão P1 vs CPU
    this.p1VsCpuButton = new ex.Actor({
      name: 'p1VsCpuButton',
      pos: ex.vec(400, 500),
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
      localStorage.setItem('start_screen', 'CPU')
      this.engine.goToScene('level1')
    })
    this.add(this.p1VsCpuButton)

    // Criando botão P1 vs P2
    this.p1VsP2Button = new ex.Actor({
      name: 'p1VsP2Button',
      pos: ex.vec(400, 630),
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
      if (this.isMobile()) {
        alert('Fullscren')
        this.setLandscapeAndFullscreen()
      }
      localStorage.setItem('start_screen', 'P2')
      this.engine.goToScene('level1')
    })
    this.add(this.p1VsP2Button)
  }

  isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i
    return mobileRegex.test(userAgent)
  }

  setLandscapeAndFullscreen(): void {
    // Solicita a tela cheia
    const docElm = document.documentElement as HTMLElement & {
      mozRequestFullScreen?: () => Promise<void>;
      webkitRequestFullscreen?: () => Promise<void>;
      msRequestFullscreen?: () => Promise<void>;
    };
  
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) { // Firefox
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullscreen) { // Chrome, Safari, and Opera
      docElm.webkitRequestFullscreen();
    } else if (docElm.msRequestFullscreen) { // IE/Edge
      docElm.msRequestFullscreen();
    }
  
    // Define a orientação da tela para paisagem
    const screenOrientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: "portrait" | "portrait-primary" | "portrait-secondary" | "landscape" | "landscape-primary" | "landscape-secondary") => Promise<void>;
    };
  
    if (screenOrientation && screenOrientation.lock) {
      screenOrientation.lock('landscape').catch(function(error) {
        console.error('Erro ao tentar definir a orientação para paisagem:', error);
      });
    } else {
      console.error('API de bloqueio de orientação não é suportada.');
    }
  }

  _subscriptions: ex.Subscription[] = [];
  onActivate(): void {
    console.log('activate start screen')
    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  onDeactivate(): void {
    Resources.TitleMusic.stop()
    this._subscriptions.forEach(h => h.close())
  }
}
