import * as ex from 'excalibur'
import { SCALE } from './config'
import { Resources } from './resources'
import type { AttackOutcome } from './combat'
import type { UnitClass } from './unit-types'

/**
 * Match effects that change nothing in the game: sounds, projectiles,
 * particles, auras, camera shake and flash. Everything here runs on the
 * engine clock (follows the game speed, freezes with the pause).
 */

// ---- Quiet mode ----

let quiet = 0

/** Runs `work` without sounds or visual effects (online catch-up replays many actions at once) */
export async function withoutEffects<T>(work: () => Promise<T>): Promise<T> {
  quiet++
  try {
    return await work()
  } finally {
    quiet--
  }
}

/** The scene to draw effects in, or null (not on stage: AI simulation, tests; or quiet) */
export function effectScene(actor: ex.Actor): ex.Scene | null {
  return quiet > 0 ? null : actor.scene
}

/** Plays a sound unless effects are off; never throws (no audio in tests) */
export function playSound(sound: ex.Sound) {
  if (quiet > 0) return
  try {
    sound.play().catch(() => { /* no audio */ })
  } catch { /* no audio */ }
}

// ---- Sounds of an attack ----

export function impactSound(outcome: AttackOutcome): ex.Sound {
  if (outcome.critical) return Resources.CriticalSound
  if (!outcome.hit && !outcome.backAttack) return Resources.MissSound
  return Resources.HitSound
}

// ---- Projectiles ----

export type ProjectileKind = 'arrow' | 'fire' | 'dark'

/** Ranged classes shoot something; reach-2 melee (Spearman, Halberdier) strikes */
const PROJECTILES: Partial<Record<UnitClass, ProjectileKind>> = {
  Archer: 'arrow',
  Ranger: 'arrow',
  Mage: 'fire',
  Necromancer: 'dark'
}

export function projectileOf(unitClass: UnitClass): ProjectileKind | null {
  return PROJECTILES[unitClass] ?? null
}

export function launchSound(kind: ProjectileKind): ex.Sound {
  return kind === 'arrow' ? Resources.BowSound : kind === 'fire' ? Resources.FireSound : Resources.DarkSound
}

/** Pixel art drawn in a canvas (1 = one pixel, scaled by SCALE) */
function pixels(width: number, height: number, draw: (px: (x: number, y: number, color: string) => void) => void): ex.Canvas {
  return new ex.Canvas({
    width: width * SCALE.x,
    height: height * SCALE.y,
    cache: true,
    draw: ctx => {
      draw((x, y, color) => {
        ctx.fillStyle = color
        ctx.fillRect(x * SCALE.x, y * SCALE.y, SCALE.x, SCALE.y)
      })
    }
  })
}

const OUTLINE = '#0a0d2a'

/** Rows of characters → pixels ('.' = empty) */
function sprite(rows: string[], palette: Record<string, string>): ex.Canvas {
  return pixels(rows[0].length, rows.length, px => {
    rows.forEach((row, y) => [...row].forEach((c, x) => { if (palette[c]) px(x, y, palette[c]) }))
  })
}

const PROJECTILE_SPRITES: Record<ProjectileKind, () => ex.Canvas> = {
  // pointing right; rotated towards the target
  arrow: () => sprite([
    '.##.........#.',
    '#ww#######.#s#',
    '.#wbbbbbbbbsss',
    '#ww#######.#s#',
    '.##.........#.'
  ], { '#': OUTLINE, w: '#ffffff', b: '#bc9148', s: '#d8dce6' }),
  fire: () => sprite([
    '..####..',
    '.#oooo#.',
    '#oyyyoo#',
    '#oywyyo#',
    '#oyyyoo#',
    '.#oooo#.',
    '..####..'
  ], { '#': '#a61414', o: '#ff8c42', y: '#fff000', w: '#ffffff' }),
  dark: () => sprite([
    '..####..',
    '.#gggg#.',
    '#gllggg#',
    '#glwlgg#',
    '#gllggg#',
    '.#gggg#.',
    '..####..'
  ], { '#': '#0f3b1e', g: '#2f9e4a', l: '#7dff9a', w: '#e8ffe8' })
}

const projectileCache = new Map<ProjectileKind, ex.Canvas>()

function projectileGraphic(kind: ProjectileKind): ex.Canvas {
  let graphic = projectileCache.get(kind)
  if (!graphic) {
    graphic = PROJECTILE_SPRITES[kind]()
    projectileCache.set(kind, graphic)
  }
  return graphic
}

const TRAIL_COLORS: Record<ProjectileKind, string[]> = {
  arrow: [],
  fire: ['#ff8c42', '#fff000', '#ff4d4d'],
  dark: ['#7dff9a', '#2f9e4a', '#0f3b1e']
}

/** Time per tile of flight (ms) */
const FLIGHT_MS_PER_TILE: Record<ProjectileKind, number> = { arrow: 55, fire: 90, dark: 100 }

/** Flies a projectile from `from` to `to` (world positions); resolves on arrival */
export function shootProjectile(scene: ex.Scene, kind: ProjectileKind, from: ex.Vector, to: ex.Vector): Promise<void> {
  const tile = 32 * SCALE.x
  const distance = to.sub(from).size
  const duration = Math.max(120, FLIGHT_MS_PER_TILE[kind] * distance / tile)
  const direction = to.sub(from)
  // a slight arc for arrows
  const lift = kind === 'arrow' ? Math.min(distance * 0.12, tile * 0.6) : 0
  return new Promise(resolve => {
    const trail = TRAIL_COLORS[kind]
    let sinceTrail = 0
    const actor = new TimedEffect(duration, (progress, delta) => {
      const arc = -4 * lift * progress * (1 - progress)
      actor.pos = from.add(direction.scale(progress)).add(ex.vec(0, arc))
      if (kind === 'arrow') {
        const slope = -4 * lift * (1 - 2 * progress)
        actor.rotation = Math.atan2(direction.y + slope, direction.x)
      }
      sinceTrail += delta
      if (trail.length && sinceTrail > 25) {
        sinceTrail = 0
        spawnParticle(scene, actor.pos, { colors: trail, speed: 20, life: 260, size: 2, rise: 30 })
      }
    }, () => resolve())
    actor.anchor = ex.vec(0.5, 0.5)
    actor.pos = from
    actor.z = 12
    actor.graphics.use(projectileGraphic(kind))
    scene.add(actor)
  })
}

// ---- Particles and auras ----

/** Actor that lives `life` ms and calls `update(progress 0..1, delta)` every frame */
class TimedEffect extends ex.Actor {
  private elapsed = 0

  constructor(private readonly life: number, private readonly step: (progress: number, delta: number) => void, private readonly done?: () => void) {
    super({ z: 11 })
  }

  override onPostUpdate(_engine: ex.Engine, delta: number) {
    this.elapsed += delta
    const progress = Math.min(1, this.elapsed / this.life)
    this.step(progress, delta)
    if (progress >= 1) {
      this.kill()
      this.done?.()
    }
  }
}

interface ParticleOptions {
  colors: string[]
  /** Pixels per second (world) */
  speed: number
  life: number
  /** Square size in pixels (before SCALE) */
  size?: number
  /** Upward drift (pixels per second); negative falls */
  rise?: number
  /** Only upwards (sparkles) */
  upward?: boolean
}

function spawnParticle(scene: ex.Scene, pos: ex.Vector, options: ParticleOptions) {
  const angle = options.upward ? -Math.PI / 2 + (Math.random() - 0.5) * 1.6 : Math.random() * Math.PI * 2
  const speed = options.speed * (0.4 + Math.random() * 0.8) * SCALE.x
  let velocity = ex.vec(Math.cos(angle) * speed, Math.sin(angle) * speed)
  const rise = (options.rise ?? 0) * SCALE.y
  const size = (options.size ?? 2) * SCALE.x
  const color = options.colors[Math.floor(Math.random() * options.colors.length)]
  const particle = new TimedEffect(options.life * (0.7 + Math.random() * 0.6), (progress, delta) => {
    const seconds = delta / 1000
    velocity = velocity.add(ex.vec(0, -rise * seconds)).scale(0.97)
    particle.pos = particle.pos.add(velocity.scale(seconds))
    particle.graphics.opacity = 1 - progress
  })
  particle.anchor = ex.vec(0.5, 0.5)
  particle.pos = pos.clone()
  particle.graphics.use(new ex.Rectangle({ width: size, height: size, color: ex.Color.fromHex(color) }))
  scene.add(particle)
}

/** A burst of square particles around `pos` */
export function burst(scene: ex.Scene, pos: ex.Vector, count: number, options: ParticleOptions & { spread?: number }) {
  const spread = (options.spread ?? 6) * SCALE.x
  for (let i = 0; i < count; i++) {
    const offset = ex.vec((Math.random() - 0.5) * 2 * spread, (Math.random() - 0.5) * 2 * spread)
    spawnParticle(scene, pos.add(offset), options)
  }
}

/** Expanding ring (auras of defensive skills, explosions) */
export function ring(scene: ex.Scene, pos: ex.Vector, color: string, radius = 18, life = 450) {
  const actor = new TimedEffect(life, progress => {
    actor.scale = ex.vec(0.3 + progress * 0.9, 0.3 + progress * 0.9)
    actor.graphics.opacity = 1 - progress
  })
  actor.anchor = ex.vec(0.5, 0.5)
  actor.pos = pos.clone()
  actor.graphics.use(new ex.Circle({
    radius: radius * SCALE.x,
    color: ex.Color.Transparent,
    strokeColor: ex.Color.fromHex(color),
    lineWidth: 2 * SCALE.x
  }))
  scene.add(actor)
}

export type AuraKind = 'defense' | 'attack' | 'heal'

const AURA_COLORS: Record<AuraKind, string[]> = {
  defense: ['#4cc9f0', '#ffffff', '#7d7dea'],
  attack: ['#ff4d4d', '#ff8c42', '#fff000'],
  heal: ['#4ee06a', '#ffffff', '#b8ffb0']
}

/** Glow of a skill on a unit: a ring and sparkles going up */
export function aura(scene: ex.Scene, pos: ex.Vector, kind: AuraKind) {
  const colors = AURA_COLORS[kind]
  if (kind !== 'heal') ring(scene, pos, colors[0])
  burst(scene, pos.add(ex.vec(0, 6 * SCALE.y)), kind === 'heal' ? 14 : 10, { colors, speed: 14, life: 700, size: 2, rise: 40, upward: true, spread: 10 })
}

/** Fireball: blast on a tile */
export function explosion(scene: ex.Scene, pos: ex.Vector) {
  ring(scene, pos, '#ff8c42', 20, 380)
  burst(scene, pos, 22, { colors: ['#fff000', '#ff8c42', '#ff4d4d', '#a61414'], speed: 70, life: 450, size: 3, rise: 20, spread: 4 })
  burst(scene, pos, 6, { colors: ['#4a4a4a', '#2a2d3a'], speed: 15, life: 800, size: 3, rise: 30, spread: 8 })
}

/** Where a strike lands */
export function impact(scene: ex.Scene, pos: ex.Vector, outcome: AttackOutcome) {
  if (!outcome.hit && !outcome.critical && !outcome.backAttack) {
    burst(scene, pos.add(ex.vec(0, 10 * SCALE.y)), 6, { colors: ['#d8dce6', '#b8bcc8'], speed: 25, life: 350, size: 2, rise: 15 })
    return
  }
  const strong = outcome.critical || outcome.backAttack
  const colors = outcome.critical ? ['#ffffff', '#fff000', '#ffd23f'] : outcome.backAttack ? ['#ffffff', '#ff8c42'] : ['#ffffff', '#ff4d4d']
  burst(scene, pos, strong ? 16 : 8, { colors, speed: strong ? 90 : 60, life: 300, size: 2, spread: 3 })
}

/** Particles flowing from one unit to another (Drain, Steal) */
export function stream(scene: ex.Scene, from: ex.Vector, to: ex.Vector, colors: string[], count = 8) {
  for (let i = 0; i < count; i++) {
    const delay = i * 45
    const wobble = (Math.random() - 0.5) * 12 * SCALE.y
    const size = 2 * SCALE.x
    const color = colors[i % colors.length]
    const dot = new TimedEffect(420 + delay, progress => {
      const local = Math.max(0, (progress * (420 + delay) - delay) / 420)
      dot.graphics.opacity = local > 0 ? 1 - local * 0.5 : 0
      dot.pos = from.add(to.sub(from).scale(local)).add(ex.vec(0, wobble * Math.sin(local * Math.PI)))
    })
    dot.anchor = ex.vec(0.5, 0.5)
    dot.pos = from.clone()
    dot.graphics.use(new ex.Rectangle({ width: size, height: size, color: ex.Color.fromHex(color) }))
    scene.add(dot)
  }
}

// ---- Camera shake and flash ----

/** Critical hits and back attacks shake the camera and flash the board */
export function heavyHit(scene: ex.Scene, outcome: AttackOutcome) {
  if (outcome.critical) {
    scene.camera.shake(7, 7, 280)
    flash(scene, '#ffffff', 0.45)
  } else if (outcome.backAttack) {
    scene.camera.shake(4, 4, 200)
    flash(scene, '#ff8c42', 0.25)
  }
}

/** Short colored flash over the whole board (screen space: ignores zoom) */
class Flash extends ex.ScreenElement {
  private elapsed = 0

  constructor(color: string, private readonly opacity: number, screen: ex.Vector) {
    // a small rectangle stretched over the screen (a screen-sized one would be a huge texture)
    super({ pos: ex.vec(-16, -16), z: 50, scale: screen.add(ex.vec(32, 32)).scale(1 / 8) })
    this.graphics.use(new ex.Rectangle({ width: 8, height: 8, color: ex.Color.fromHex(color) }))
    this.graphics.opacity = opacity
  }

  override onPostUpdate(_engine: ex.Engine, delta: number) {
    this.elapsed += delta
    this.graphics.opacity = this.opacity * Math.max(0, 1 - this.elapsed / FLASH_MS)
    if (this.elapsed >= FLASH_MS) this.kill()
  }
}

const FLASH_MS = 180

function flash(scene: ex.Scene, color: string, opacity: number) {
  const { width, height } = scene.engine.screen.resolution
  scene.add(new Flash(color, opacity, ex.vec(width, height)))
}

/**
 * A press on a disabled button (menus, HUD, army screen) plays the "not
 * allowed" sound. Disabled buttons get no click, but pointerdown still
 * reaches the document, and composedPath() sees inside the shadow roots.
 */
export function installDeniedSound() {
  document.addEventListener('pointerdown', event => {
    const pressed = event.composedPath().find((node): node is HTMLButtonElement => node instanceof HTMLButtonElement)
    if (pressed?.disabled) playSound(Resources.DeniedSound)
  }, true)
}
