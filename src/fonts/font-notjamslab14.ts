import * as ex from 'excalibur'
import { SCALE } from '../config'

export namespace FontNotjamslab14 {
  export const titleFont = new ex.Font({
    family: 'notjamslab14',
    size: 64 * SCALE.x,
    unit: ex.FontUnit.Px,
    color: ex.Color.White,
    baseAlign: ex.BaseAlign.Top,
  })
  
  export const buttonFont = new ex.Font({
    family: 'notjamslab14',
    size: 32 * SCALE.x,
    unit: ex.FontUnit.Px,
    color: ex.Color.White,
    baseAlign: ex.BaseAlign.Top,
  })
}
