import { isTouchDevice } from '../device'
import { PadTracker, buttonLabel, controllerFamily, readAnalog, type ControllerFamily, type PadAnalog, type PadButton, type PadPress, type PadSnapshot } from './controller'
import { deepActiveElement, focusDefault, isTextField, moveFocus, navigableElements, navigableFocus, scrollMenus, visibleBox } from './focus-nav'

/**
 * Controller support. Reads every connected controller once per frame (its
 * own requestAnimationFrame: the pause menu stops the engine's clock) and
 * plays the game through the keyboard shortcuts it already has: D-pad =
 * arrows, A = Enter, B = Esc, and so on, sent to the focused element like a
 * real key. Where the keyboard has nothing (moving between menu buttons), the
 * focus moves to the nearest button in that direction (focus-nav.ts).
 */

export type InputMode = 'mouse' | 'touch' | 'keyboard' | 'gamepad'

/** What the controller needs from the match on screen (GameUI) */
export interface GamepadMatch {
  /** Right stick and triggers, every frame */
  padCamera(analog: PadAnalog, elapsedMs: number): void
}

let mode: InputMode = isTouchDevice() ? 'touch' : 'mouse'
let family: ControllerFamily = 'generic'
const modeListeners = new Set<() => void>()

/** The last kind of input used: hints and the focus ring follow it */
export function inputMode(): InputMode {
  return mode
}

/** `listener` runs when the input mode or the controller changes; returns an unsubscribe */
export function onInputModeChange(listener: () => void): () => void {
  modeListeners.add(listener)
  return () => modeListeners.delete(listener)
}

/** What is printed on a button of the controller in use */
export function padLabel(button: PadButton): string {
  return buttonLabel(family, button)
}

function setMode(next: InputMode, nextFamily = family) {
  if (next === mode && nextFamily === family) return
  mode = next
  family = nextFamily
  document.documentElement.classList.toggle('input-gamepad', mode === 'gamepad')
  modeListeners.forEach(listener => listener())
}

/** How often to look for a button to focus when nothing is focused */
const SCAN_EVERY_MS = 200
/** Right stick in the menus: page pixels scrolled per second, fully tilted */
const MENU_SCROLL_PER_SECOND = 1400

const ARROW_KEYS: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }

/** A keydown at the focused element, as a real key would arrive; true if someone handled it */
function sendKey(key: string, shiftKey = false): boolean {
  const target = deepActiveElement() ?? document.body
  const event = new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, composed: true, cancelable: true })
  target.dispatchEvent(event)
  return event.defaultPrevented
}

function press({ button }: PadPress, match: GamepadMatch | null) {
  const focused = navigableFocus()
  switch (button) {
  case 'up': case 'down': case 'left': case 'right':
    // the screen's own arrow handling first (board cursor, map list, unit menu)
    if (!sendKey(ARROW_KEYS[button])) moveFocus(button)
    return
  case 'a':
    if (focused) {
      if (!isTextField(focused)) focused.click()
    } else if (match || !focusDefault()) {
      sendKey('Enter')
    }
    return
  case 'b':
    if (focused && isTextField(focused)) focused.blur()
    else sendKey('Escape')
    return
  case 'start':
    sendKey(match ? 'p' : 'Enter')
    return
  }
  if (!match) return
  switch (button) {
  case 'x': sendKey('f'); return
  case 'y': sendKey('r'); return
  case 'lb': sendKey('Tab', true); return
  case 'rb': sendKey('Tab'); return
  case 'select': sendKey('e'); return
  case 'l3': sendKey('h'); return
  case 'r3': sendKey('t'); return
  }
}

function snapshots(): { pads: PadSnapshot[], last: Gamepad | null } {
  const pads: PadSnapshot[] = []
  let last: Gamepad | null = null
  for (const pad of navigator.getGamepads?.() ?? []) {
    if (!pad || !pad.connected) continue
    pads.push({
      buttons: pad.buttons.map(b => b.pressed ? Math.max(b.value, 0.5) : b.value),
      axes: [...pad.axes]
    })
    if (!last || pad.timestamp > last.timestamp) last = pad
  }
  return { pads, last }
}

/** White frame over the focused button while playing with a controller */
function createFocusRing(): HTMLElement {
  const ring = document.createElement('div')
  ring.className = 'pad-focus'
  Object.assign(ring.style, {
    position: 'fixed',
    pointerEvents: 'none',
    zIndex: '2147483000',
    boxSizing: 'border-box',
    // white, not gold: gold already means "selected" (map, slot, current class)
    border: '3px solid #ffffff',
    boxShadow: 'inset 0 0 0 2px #000, 0 0 0 2px #000',
    // no transition: while a list scrolls, an animated frame trails behind and looks doubled
    display: 'none'
  })
  document.body.appendChild(ring)
  return ring
}

/**
 * Starts listening to controllers. `match` gives the match on screen (null
 * in the menus). Runs for the whole session.
 */
export function startGamepadInput(match: () => GamepadMatch | null) {
  if (!('getGamepads' in navigator)) return
  const tracker = new PadTracker()
  const ring = createFocusRing()
  let frame = 0
  let lastFrame = performance.now()
  let lastScan = 0

  const loop = (now: number) => {
    frame = requestAnimationFrame(loop)
    const elapsed = Math.min(now - lastFrame, 100)
    lastFrame = now
    const { pads, last } = snapshots()
    const presses = tracker.update(pads, now)
    if (presses.length > 0) setMode('gamepad', last ? controllerFamily(last.id) : family)
    const current = match()
    for (const p of presses) press(p, current)

    if (mode !== 'gamepad') {
      ring.style.display = 'none'
      return
    }
    const analog = readAnalog(pads)
    if (current && (analog.panX || analog.panY || analog.zoomIn || analog.zoomOut)) current.padCamera(analog, elapsed)
    // menus: the right stick scrolls long pages and lists
    if (!current && analog.panY) scrollMenus(analog.panY * MENU_SCROLL_PER_SECOND * elapsed / 1000)
    // a screen or dialog just opened: put the focus on its main button
    // (looking for buttons walks the whole page: not every frame)
    let focused = navigableFocus()
    if (!focused && now - lastScan > SCAN_EVERY_MS) {
      lastScan = now
      if (navigableElements().length > 0 && focusDefault()) focused = navigableFocus()
    }
    // right on the element's edge (over its own gold border, if it has one),
    // and only the part that shows: a button half scrolled out of its list
    // must not draw a frame over the header or the panel next to it
    const box = focused && visibleBox(focused)
    if (box) {
      Object.assign(ring.style, { display: 'block', left: `${box.left}px`, top: `${box.top}px`, width: `${box.right - box.left}px`, height: `${box.bottom - box.top}px` })
    } else {
      ring.style.display = 'none'
    }
  }

  const start = () => {
    if (frame) return
    lastFrame = performance.now()
    frame = requestAnimationFrame(loop)
  }
  const stop = () => {
    if (navigator.getGamepads().some(pad => pad?.connected)) return
    cancelAnimationFrame(frame)
    frame = 0
    tracker.reset()
    ring.style.display = 'none'
    if (mode === 'gamepad') setMode(isTouchDevice() ? 'touch' : 'mouse')
  }
  window.addEventListener('gamepadconnected', start)
  window.addEventListener('gamepaddisconnected', stop)
  if (navigator.getGamepads().some(pad => pad?.connected)) start()

  // the mouse, a finger or a real key take over from the controller
  window.addEventListener('pointerdown', event => setMode(event.pointerType === 'touch' ? 'touch' : 'mouse'), true)
  window.addEventListener('pointermove', event => { if (event.pointerType === 'mouse' && (event.movementX || event.movementY)) setMode('mouse') }, true)
  window.addEventListener('keydown', event => { if (event.isTrusted) setMode('keyboard') }, true)
}
