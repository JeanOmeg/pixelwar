import * as ex from 'excalibur'

/**
 * Game speed (x1, x2, x3), chosen in the HUD and remembered between visits.
 * Speeds up animations and moves (engine.timescale) and the pauses between the
 * CPU's steps (`gameDelay`).
 */

export const SPEEDS = [1, 2, 3] as const
export type GameSpeed = typeof SPEEDS[number]

const PREF_SPEED = 'pixelfantasywar.speed'

function readSpeed(): GameSpeed {
  try {
    const saved = Number(localStorage.getItem(PREF_SPEED))
    return (SPEEDS as readonly number[]).includes(saved) ? saved as GameSpeed : 1
  } catch {
    return 1
  }
}

let speed: GameSpeed = readSpeed()
/** Tutorial: a fixed speed that overrides the chosen one (and isn't saved) */
let locked: GameSpeed | null = null
let engine: ex.Engine | null = null

export function getSpeed(): GameSpeed {
  return locked ?? speed
}

export function isSpeedLocked(): boolean {
  return locked !== null
}

/** Called once by main.ts so the speed also applies to the engine */
export function attachSpeedToEngine(game: ex.Engine) {
  engine = game
  engine.timescale = getSpeed()
}

export function setSpeed(value: GameSpeed) {
  speed = value
  if (engine) engine.timescale = getSpeed()
  try { localStorage.setItem(PREF_SPEED, String(value)) } catch { /* storage unavailable */ }
}

/** Forces a speed until `lockSpeed(null)`; the saved choice stays as it was */
export function lockSpeed(value: GameSpeed | null) {
  locked = value
  if (engine) engine.timescale = getSpeed()
}

/** Next speed in SPEEDS (x1 → x2 → x3 → x1); nothing while the speed is locked */
export function cycleSpeed(): GameSpeed {
  if (locked !== null) return locked
  const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
  setSpeed(next)
  return next
}

/** A pause that gets shorter at higher game speeds */
export function gameDelay(ms: number): Promise<void> {
  return ex.Util.delay(ms / getSpeed())
}
