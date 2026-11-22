/**
 * Commands the player already used, so the idle hint at the bottom of the
 * match stops repeating them (see GameUI.hintText). Kept per input kind,
 * because each one shows other buttons: knowing the right click doesn't
 * teach the controller's Y.
 */

export type HintCommand = 'select' | 'move-range' | 'attack-range' | 'next-unit' | 'end-turn' | 'pause'
export type HintInput = 'desktop' | 'touch' | 'pad'

const PREF_HINTS = 'pixelfantasywar.hints.learned'

let learned: Set<string> | null = null

function load(): Set<string> {
  if (learned) return learned
  learned = new Set()
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(PREF_HINTS) ?? '[]')
    if (Array.isArray(saved)) saved.forEach(key => { if (typeof key === 'string') learned!.add(key) })
  } catch { /* storage unavailable or broken: show every hint */ }
  return learned
}

export function hintLearned(input: HintInput, command: HintCommand): boolean {
  return load().has(`${input}:${command}`)
}

/** The player used `command` with `input`: its part of the idle hint goes away */
export function noteHintUse(input: HintInput, command: HintCommand) {
  const set = load()
  const key = `${input}:${command}`
  if (set.has(key)) return
  set.add(key)
  try { localStorage.setItem(PREF_HINTS, JSON.stringify([...set])) } catch { /* storage unavailable */ }
}

/** Tests: forget what was learned */
export function resetHintProgress() {
  learned = new Set()
  try { localStorage.removeItem(PREF_HINTS) } catch { /* storage unavailable */ }
}

/**
 * The idle hint: the parts whose command wasn't used yet, joined by ' · '.
 * Empty when every command is known.
 */
export function idleHint(input: HintInput, parts: [HintCommand, string][]): string {
  return parts.filter(([command]) => !hintLearned(input, command)).map(([, text]) => text).join(' · ')
}
