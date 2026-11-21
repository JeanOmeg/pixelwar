import * as ex from 'excalibur'
import { Resources } from './resources'
import LoaderLogoPath from './assets/loader-logo.png'
import { t } from './i18n'

/** Loading screen: loads every asset in Resources, then shows the PLAY! button */
export const loader = new ex.Loader()
loader.backgroundColor = 'black'

loader.startButtonFactory = () => {
  const myButton = document.createElement('button')
  myButton.textContent = t().loader.play
  // sizes follow the screen like the rest of the game (N = N px at 1920x1080),
  // with a floor so the button stays easy to tap on a phone
  const unit = 'min(100vw / 1920, 100vh / 1080)'
  const size = (px: number, floor: number) => `max(${floor}px, calc(${px} * ${unit}))`
  myButton.style.minWidth = size(250, 120)
  myButton.style.minHeight = size(100, 48)
  myButton.style.padding = `${size(10, 4)} ${size(18, 10)}`
  myButton.style.border = `${size(4, 3)} solid white`
  myButton.style.color = 'white'
  myButton.style.fontFamily = '\'notjamslab14\', sans-serif'
  myButton.style.fontSize = size(70, 26)
  myButton.style.backgroundColor = 'blue'
  myButton.style.cursor = 'pointer'
  myButton.style.imageRendering = 'pixelated'
  myButton.style.boxShadow = `${size(4, 3)} ${size(4, 3)} 0 black`
  // Excalibur puts the button 100px below the screen center: replace that with
  // a scaled offset so it sits right under the logo on any screen
  myButton.style.translate = `0 calc(-100px + ${size(110, 40)})`
  myButton.style.display = 'inline-block'
  myButton.style.transition = 'transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease'

  const blinkAnimationName = 'loaderBlinkAnimation'

  if (!document.getElementById('loader-blink-style')) {
    const style = document.createElement('style')
    style.id = 'loader-blink-style'
    style.textContent = `
      @keyframes ${blinkAnimationName} {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }
    `
    document.head.appendChild(style)
  }

  let triggered = false

  myButton.addEventListener('pointerdown', (event) => {
    if (triggered) return

    event.preventDefault()
    event.stopImmediatePropagation()

    triggered = true
    myButton.style.animation = `${blinkAnimationName} 200ms linear 6`
    myButton.style.pointerEvents = 'none'

    window.setTimeout(() => {
      myButton.click()
    }, 1200)
  }, { capture: true })

  return myButton
}

// same look as the title screen logo (rendered from the game font, 667x329).
// Drawn in canvas resolution units, so it scales with the screen like the game.
loader.logo = LoaderLogoPath
loader.logoWidth = 667
loader.logoHeight = 329

for (let res of Object.values(Resources)) {
  loader.addResource(res)
}