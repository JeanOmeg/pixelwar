import type { Direction } from './controller'

/**
 * Moving the focus between the buttons on screen with a controller: the
 * direction picks the nearest button that way (spatial navigation), so the
 * menus need no per-screen code. Only buttons that can be seen and reached
 * count: under an open dialog, the screen behind it is out.
 */

export interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Index of the box in `candidates` that the focus moves to from `from`, going
 * `direction`; -1 when nothing lies that way. Prefers boxes in line with
 * `from` (overlapping across the direction), then the nearest one.
 */
export function pickInDirection(from: Box, candidates: Box[], direction: Direction): number {
  const horizontal = direction === 'left' || direction === 'right'
  const sign = direction === 'right' || direction === 'down' ? 1 : -1
  const center = (b: Box) => horizontal ? (b.left + b.right) / 2 : (b.top + b.bottom) / 2
  const cross = (b: Box) => horizontal ? (b.top + b.bottom) / 2 : (b.left + b.right) / 2
  let best = -1
  let bestScore = Infinity
  candidates.forEach((box, i) => {
    // must lie ahead: its center past ours
    if ((center(box) - center(from)) * sign <= 1) return
    const gap = horizontal
      ? Math.max(0, sign > 0 ? box.left - from.right : from.left - box.right)
      : Math.max(0, sign > 0 ? box.top - from.bottom : from.top - box.bottom)
    const crossGap = horizontal
      ? Math.max(0, box.top - from.bottom, from.top - box.bottom)
      : Math.max(0, box.left - from.right, from.left - box.right)
    const score = gap + crossGap * 3 + Math.abs(cross(box) - cross(from)) * 0.2 + Math.abs(center(box) - center(from)) * 0.05
    if (score < bestScore) {
      bestScore = score
      best = i
    }
  })
  return best
}

// --- DOM ---

const FOCUSABLE = 'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
/** The match's own dialogs: the only match UI the focus may enter */
const MATCH_DIALOGS = new Set(['PAUSE-MENU', 'GAME-OVER', 'GAME-NOTICE', 'UNIT-MENU'])
/** Buttons a controller should never land on (sound, fullscreen) */
const NEVER = new Set(['AUDIO-MENU'])
/** Preferred first focus when a screen or dialog opens */
const DEFAULT_FOCUS = ['.resume', '.primary', '.confirm']

/** Parent across shadow roots */
function composedParent(el: Element): Element | null {
  return el.parentElement ?? ((el.getRootNode() as ShadowRoot).host ?? null)
}

/** The focused element, looking inside shadow roots */
export function deepActiveElement(): HTMLElement | null {
  let el: Element | null = document.activeElement
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement
  return el instanceof HTMLElement && el !== document.body ? el : null
}

/** The element drawn at a page point, looking inside shadow roots */
function deepElementFromPoint(x: number, y: number): Element | null {
  let hit = document.elementFromPoint(x, y)
  while (hit?.shadowRoot) {
    const inner = hit.shadowRoot.elementFromPoint(x, y)
    if (!inner || inner === hit) break
    hit = inner
  }
  return hit
}

function isAncestor(ancestor: Element, el: Element | null): boolean {
  for (let node = el; node; node = composedParent(node)) if (node === ancestor) return true
  return false
}

/**
 * In a match only its dialogs and the emote list take the focus; the HUD
 * buttons have their own controller buttons (Start, View, R3).
 */
function allowedHere(el: Element): boolean {
  let inMatchUi = false
  let inDialog = false
  for (let node: Element | null = el; node; node = composedParent(node)) {
    if (NEVER.has(node.tagName)) return false
    if (MATCH_DIALOGS.has(node.tagName) || node.classList.contains('emote-list')) inDialog = true
    if (node.classList.contains('game-ui')) inMatchUi = true
  }
  return !inMatchUi || inDialog
}

function scrollParent(el: Element): Element | null {
  for (let node = composedParent(el); node; node = composedParent(node)) {
    const style = getComputedStyle(node)
    if (/(auto|scroll)/.test(style.overflowY + style.overflowX)) return node
  }
  return null
}

/** Visible, enabled, allowed and not covered by something else (a dialog over the screen) */
function isNavigable(el: HTMLElement): boolean {
  if ((el as HTMLButtonElement).disabled || el.closest('[inert]')) return false
  const rect = el.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return false
  const style = getComputedStyle(el)
  if (style.visibility === 'hidden' || style.pointerEvents === 'none') return false
  if (!allowedHere(el)) return false
  // test the part of it that can be on screen (it may be scrolled out of its list)
  const scroller = scrollParent(el)
  const area = scroller ? scroller.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
  const x = Math.min(Math.max((rect.left + rect.right) / 2, Math.max(area.left, 0) + 1), Math.min(area.right, window.innerWidth) - 1)
  const y = Math.min(Math.max((rect.top + rect.bottom) / 2, Math.max(area.top, 0) + 1), Math.min(area.bottom, window.innerHeight) - 1)
  const hit = deepElementFromPoint(x, y)
  if (!hit) return false
  return isAncestor(el, hit) || (!!scroller && isAncestor(scroller, hit))
}

function collect(root: Document | ShadowRoot, out: HTMLElement[]) {
  for (const el of root.querySelectorAll<HTMLElement>('*')) {
    if (el.matches(FOCUSABLE)) out.push(el)
    if (el.shadowRoot) collect(el.shadowRoot, out)
  }
}

/** Every element the focus can go to right now */
export function navigableElements(): HTMLElement[] {
  const all: HTMLElement[] = []
  collect(document, all)
  return all.filter(isNavigable)
}

/** The focused element, if the controller may act on it */
export function navigableFocus(): HTMLElement | null {
  const el = deepActiveElement()
  return el && isNavigable(el) ? el : null
}

function focus(el: HTMLElement) {
  el.focus({ preventScroll: true })
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

/** Focuses the screen's main button (Resume, Play, Confirm...) or the first one; false if there is none */
export function focusDefault(): boolean {
  const elements = navigableElements()
  if (elements.length === 0) return false
  const preferred = DEFAULT_FOCUS.map(selector => elements.find(el => el.matches(selector))).find(Boolean)
  const first = [...elements].sort((a, b) => {
    const ra = a.getBoundingClientRect()
    const rb = b.getBoundingClientRect()
    return ra.top - rb.top || ra.left - rb.left
  })[0]
  focus(preferred ?? first)
  return true
}

/**
 * Where an element counts for the direction: a button scrolled out of its
 * list counts as sitting on the list's edge (the next card below the last
 * visible one is "down" from it; from the buttons under the list it isn't)
 */
function navBox(el: HTMLElement): Box {
  const rect = el.getBoundingClientRect()
  const scroller = scrollParent(el)
  if (!scroller) return rect
  const area = scroller.getBoundingClientRect()
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)
  return {
    left: clamp(rect.left, area.left, area.right - 1),
    right: clamp(rect.right, area.left + 1, area.right),
    top: clamp(rect.top, area.top, area.bottom - 1),
    bottom: clamp(rect.bottom, area.top + 1, area.bottom)
  }
}

/** Its center is inside the visible part of its list */
function inView(el: HTMLElement): boolean {
  const scroller = scrollParent(el)
  if (!scroller) return true
  const rect = el.getBoundingClientRect()
  const area = scroller.getBoundingClientRect()
  const x = (rect.left + rect.right) / 2
  const y = (rect.top + rect.bottom) / 2
  return x >= area.left && x <= area.right && y >= area.top && y <= area.bottom
}

/** Moves the focus `direction`; with nothing focused, focuses the default button */
export function moveFocus(direction: Direction): boolean {
  const current = navigableFocus()
  if (!current) return focusDefault()
  // a button scrolled out of its list is only reached from inside that list
  const list = scrollParent(current)
  const others = navigableElements().filter(el => el !== current && (inView(el) || scrollParent(el) === list))
  const index = pickInDirection(navBox(current), others.map(navBox), direction)
  if (index < 0) return false
  focus(others[index])
  return true
}

let scrollTarget: { el: Element, at: number } | null = null

function canScroll(el: Element): boolean {
  const style = getComputedStyle(el)
  return /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight + 2
}

/** The list the right stick scrolls: the focused button's, or the biggest one on screen (Units, How to play) */
function scrollableArea(): Element | null {
  const focused = navigableFocus()
  const own = focused && scrollParent(focused)
  if (own && canScroll(own)) return own
  if (scrollTarget && performance.now() - scrollTarget.at < 500 && scrollTarget.el.isConnected) return scrollTarget.el
  const all: Element[] = []
  const walk = (root: Document | ShadowRoot) => {
    for (const el of root.querySelectorAll('*')) {
      if (canScroll(el)) all.push(el)
      if (el.shadowRoot) walk(el.shadowRoot)
    }
  }
  walk(document)
  const visible = all.filter(el => {
    const r = el.getBoundingClientRect()
    const hit = deepElementFromPoint((r.left + r.right) / 2, (r.top + r.bottom) / 2)
    return r.width > 0 && r.height > 0 && allowedHere(el) && isAncestor(el, hit)
  })
  const area = (el: Element) => { const r = el.getBoundingClientRect(); return r.width * r.height }
  const biggest = visible.sort((a, b) => area(b) - area(a))[0] ?? null
  scrollTarget = biggest ? { el: biggest, at: performance.now() } : null
  return biggest
}

/** Right stick in the menus: scrolls the list by `pixels` */
export function scrollMenus(pixels: number) {
  scrollableArea()?.scrollBy({ top: pixels })
}

export function isTextField(el: Element): boolean {
  return el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && !['button', 'checkbox', 'radio', 'submit', 'reset'].includes(el.type))
}
