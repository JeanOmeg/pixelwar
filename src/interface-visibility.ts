/**
 * "Show the match interface" option (HUD, hint, unit card, combat log),
 * saved in localStorage. Changed in Options, in the pause menu, by the eye
 * button that shows while the interface is hidden, or with H in the match.
 */

const KEY = 'pixelfantasywar.interface.hidden'

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

let hidden = read()
const listeners = new Set<() => void>()

export function interfaceHidden(): boolean {
  return hidden
}

export function setInterfaceHidden(value: boolean) {
  if (value === hidden) return
  hidden = value
  try {
    localStorage.setItem(KEY, value ? '1' : '0')
  } catch {
    // private window: the choice lasts until the page closes
  }
  listeners.forEach(listener => listener())
}

/** Calls `listener` on every change; returns the function that stops it */
export function onInterfaceChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}
