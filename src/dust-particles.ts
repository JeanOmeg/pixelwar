import * as ex from 'excalibur'
import { Smoke } from './resources'

export const DustParticles = new ex.ParticleEmitter({
  emitterType: ex.EmitterType.Circle,
  radius: 16,
  particle: {
    minVel: 0,
    maxVel: 20,
    minAngle: 0,
    maxAngle: 6.2,
    opacity: 1,
    minSize: 1,
    maxSize: 3,
    startSize: 2,
    randomRotation: true,
    endSize: .01,
    graphic: Smoke,
    rotation: Math.PI,
    fade: true,
    acc: ex.vec(0, -32),
    life: 200,
  },
  emitRate: 3,
  isEmitting: false
})