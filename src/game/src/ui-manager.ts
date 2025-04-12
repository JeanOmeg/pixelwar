/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ex from 'excalibur'
import './ui-components/unit-menu'
import { UnitMenu } from './ui-components/unit-menu'
import type { Unit } from './unit'
import { SCALE } from './config'

export interface MenuOptions {
  move: () => any
  attack: () => any
  pass: () => any
  passTurn: () => any
}

/**
 * UI manager create html elements for game UI
 */
export class UIManager {
  uiToWorldPos = new Map<UnitMenu, ex.Vector>()

  unitMenu: UnitMenu
  constructor(private engine: ex.Engine) {
    this.engine = engine
    this.unitMenu = new UnitMenu()
    this.unitMenu.top = 3 * this.worldDistanceToPage(1)
    document.body.appendChild(this.unitMenu)
    document.documentElement.style.setProperty('--pixel-conversion', this.worldDistanceToPage(1).toString())
    window.addEventListener('resize', () => {
      document.documentElement.style.setProperty('--pixel-conversion', this.worldDistanceToPage(1).toString())
    })
  }

  isMobile() {
    const userAgent = navigator.userAgent
    const mobileRegex = /Android|webOS|iPhone/i
    return mobileRegex.test(userAgent)
  }

  worldDistanceToPage(distance: number) {
    const mobile = this.isMobile()
    const scaleX = mobile ? SCALE.x + 2 : SCALE.x + 1.5
    const pageOrigin = this.engine.screen.worldToPageCoordinates(ex.Vector.Zero)
    const pageDistance = this.engine.screen.worldToPageCoordinates(ex.vec(distance * scaleX, 0)).sub(pageOrigin)
    return pageDistance.x
  }

  dismissAll() {
    this.unitMenu.hide()
  }

  showUnitMenu(unit: Unit, options: MenuOptions): UnitMenu {
    const menu = this.unitMenu
    menu.unit = unit

    const move = () => {
      options.move()
      clearEvents()
    }
    const attack = () => {
      options.attack()
      clearEvents()
    }
    const pass = () => {
      options.pass()
      clearEvents()
    }
    const passTurn = () => {
      options.passTurn()
      clearEvents()
    }

    menu.addEventListener('move', move)
    menu.addEventListener('attack', attack)
    menu.addEventListener('pass', pass)
    menu.addEventListener('passTurn', passTurn)

    const clearEvents = () => {
      menu.removeEventListener('move', move)
      menu.removeEventListener('attack', attack)
      menu.removeEventListener('pass', pass)
      menu.removeEventListener('passTurn', passTurn)
    }

    menu.clearEvents = clearEvents
    menu.show()
    menu.focus()

    let leftMenu = null
    let rightTooltip = null
    let leftTooltip = null

    if (unit.player.name === 'Human' ||unit.player.name === 'Human A' ) {
      leftMenu = this.engine.screen.viewport.width - (80 * this.worldDistanceToPage(1))
      rightTooltip = 78 * this.worldDistanceToPage(1)
    } else {
      leftMenu = 4 * this.worldDistanceToPage(1)
      leftTooltip = 15 * this.worldDistanceToPage(1)
    }

    menu.left = leftMenu
    menu.rightTooltip = rightTooltip ?? 0
    menu.leftTooltip = leftTooltip ?? 0
    menu.pixelConversion = this.worldDistanceToPage(1)

    this.uiToWorldPos.set(menu, unit.pos)

    return menu
  }
}
