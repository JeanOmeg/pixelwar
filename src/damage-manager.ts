import * as ex from 'excalibur'
import { SCALE } from './config'
import type { AttackOutcome } from './combat'

function describe(outcome: AttackOutcome): { text: string, color: ex.Color } {
  if (outcome.critical) return { text: `Critical! ${outcome.damage}`, color: ex.Color.fromHex('#ffd23f') }
  if (outcome.backAttack) return { text: `Back attack! ${outcome.damage}`, color: ex.Color.fromHex('#ff8c42') }
  if (!outcome.hit) return { text: `Miss ${outcome.damage}`, color: ex.Color.fromHex('#b8bcc8') }
  return { text: outcome.damage.toFixed(0), color: ex.Color.White }
}

export class Damage extends ex.Actor {
  constructor(pos: ex.Vector, outcome: AttackOutcome) {
    super({
      name: 'damage',
      pos,
      z: 10
    })

    const { text, color } = describe(outcome)

    const font = new ex.Font({
      family: 'notjamslab14',
      size: 16 * SCALE.x,
      unit: ex.FontUnit.Px,
      color,
      baseAlign: ex.BaseAlign.Top,
      quality: 4,
      shadow: {
        offset: ex.vec(2, 2).scale(SCALE),
        color: ex.Color.Black
      }
    })

    this.graphics.add(new ex.Text({ text, font }))
  }
}

export class DamageManager {

  constructor(public scene: ex.Scene) {
    this.scene = scene
  }

  async spawnDamageNumber(pos: ex.Vector, outcome: AttackOutcome) {
    const damageNumber = new Damage(pos, outcome)
    damageNumber.actions.moveBy({
      offset: ex.vec(0, -50 * SCALE.y),
      duration: 700,
      easing: ex.EasingFunctions.EaseOutCubic
    }).die()
    this.scene.add(damageNumber)
  }
}
