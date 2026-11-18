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
let engine: ex.Engine | null = null

export function getSpeed(): GameSpeed {
  return speed
}

/** Called once by main.ts so the speed also applies to the engine */
export function attachSpeedToEngine(game: ex.Engine) {
  engine = game
  engine.timescale = speed
}

export function setSpeed(value: GameSpeed) {
  speed = value
  if (engine) engine.timescale = value
  try { localStorage.setItem(PREF_SPEED, String(value)) } catch { /* storage unavailable */ }
}

/** Next speed in SPEEDS (x1 → x2 → x3 → x1) */
export function cycleSpeed(): GameSpeed {
  const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
  setSpeed(next)
  return next
}

/** A pause that gets shorter at higher game speeds */
export function gameDelay(ms: number): Promise<void> {
  return ex.Util.delay(ms / speed)
}
