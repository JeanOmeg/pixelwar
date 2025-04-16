import * as ex from 'excalibur'
import { SCALE } from './config'

export class Damage extends ex.Actor {
  constructor(pos: ex.Vector, damage: number, dice: number) {
    super({
      name: 'damage',
      pos,
      z: 10
    })

    const font = new ex.Font({
      family: 'notjamslab14',
      size: 16 * SCALE.x,
      unit: ex.FontUnit.Px,
      color: ex.Color.Yellow,
      baseAlign: ex.BaseAlign.Top,
      quality: 4,
      shadow: {
        offset: ex.vec(2, 2).scale(SCALE),
        color: ex.Color.Black
      }
    })

    const text = new ex.Text({
      text: damage.toFixed(0),
      font
    })

    if (dice === 20) {
      font.color = ex.Color.Green
      text.text = `Critical Hit! ${damage}`
    }

    this.graphics.add(text)
  }
}

export class DamageManager {

  constructor(public scene: ex.Scene) { 
    this.scene = scene
  }

  async spawnDamageNumber(pos: ex.Vector, damage: number, d20: number) {
    const damageNumber = new Damage(pos, damage, d20)
    damageNumber.actions.moveBy({
      offset: ex.vec(0, -50 * SCALE.y),
      duration: 500,
      easing: ex.EasingFunctions.EaseOutCubic
    }).die()
    this.scene.add(damageNumber)
  }
} 