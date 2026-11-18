/**
 * Phone/tablet support: touch detection, fullscreen + landscape (when the
 * player asks), keeping the canvas fitted to the screen and how much to enlarge
 * the UI on small screens.
 */

/** True when the main pointer is a finger (phones, tablets) */
export function isTouchDevice(): boolean {
  return window.matchMedia?.('(pointer: coarse)').matches ?? false
}

/**
 * Smallest page px per UI unit (`--u`) we accept: below this the base text
 * sizes (14+) become unreadable, so small screens get the UI enlarged.
 */
const MIN_PAGE_UNIT = 0.68
const MAX_BOOST = 1.6

/**
 * Factor to multiply the UI scale by so that one UI unit is at least
 * MIN_PAGE_UNIT page px. 1 on desktops; up to MAX_BOOST on phones.
 */
export function readableBoost(pagePxPerUnit: number): number {
  if (!(pagePxPerUnit > 0)) return 1
  return Math.min(MAX_BOOST, Math.max(1, MIN_PAGE_UNIT / pagePxPerUnit))
}

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null
  webkitFullscreenEnabled?: boolean
  webkitExitFullscreen?: () => Promise<void> | void
}
type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>
  unlock?: () => void
}

const doc = document as FullscreenDocument

/** Whether this browser lets the page go fullscreen (iPhone Safari does not) */
export function canFullscreen(): boolean {
  return !!(doc.fullscreenEnabled || doc.webkitFullscreenEnabled)
}

/** Opened from the home screen icon (installed app): already without browser bars */
export function isStandalone(): boolean {
  return startedStandalone
}

/**
 * Measured once, when the page loads: `(display-mode: fullscreen)` also
 * matches while the page is in fullscreen through our own button, and the
 * fullscreen button vanished on the next redraw (back to the menu).
 */
const startedStandalone = (() => {
  if (typeof window === 'undefined') return false
  const media = (query: string) => window.matchMedia?.(query).matches ?? false
  return (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    media('(display-mode: fullscreen)') || media('(display-mode: standalone)')
})()

/**
 * iPhone: no fullscreen API for pages. The closest is adding the game to the
 * home screen (manifest.webmanifest + apple-* tags in index.html), so the
 * fullscreen button explains that instead.
 */
export function needsHomeScreenForFullscreen(): boolean {
  return isTouchDevice() && !canFullscreen() && !isStandalone()
}

export function isFullscreen(): boolean {
  return !!(doc.fullscreenElement || doc.webkitFullscreenElement)
}

/**
 * Fullscreen, then landscape lock (browsers only allow the lock while
 * fullscreen). Must run inside a user gesture (tap/click handler).
 */
export async function enterFullscreen() {
  const root = document.documentElement as FullscreenElement
  try {
    if (!isFullscreen()) {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' })
      else await root.webkitRequestFullscreen?.()
    }
  } catch { /* not allowed: keep the browser chrome */ }
  try {
    await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape')
  } catch { /* not supported (desktop, iPhone) */ }
}

export async function exitFullscreen() {
  try { (screen.orientation as LockableOrientation | undefined)?.unlock?.() } catch { /* not supported */ }
  try {
    if (!isFullscreen()) return
    if (doc.exitFullscreen) await doc.exitFullscreen()
    else await doc.webkitExitFullscreen?.()
  } catch { /* already left */ }
}

export function toggleFullscreen() {
  return isFullscreen() ? exitFullscreen() : enterFullscreen()
}

/**
 * Excalibur's FitScreen sizes the canvas from window.innerWidth/innerHeight on
 * each `resize`. Phones (Android Chrome) send that event while entering or
 * leaving fullscreen and while rotating, often before the viewport reaches its
 * final size, so the board was left small until the next resize. Re-sends a
 * `resize` a few times after every screen change so the canvas fits again.
 */
let refitting = false

/** Makes Excalibur size the canvas again for the current window (a synthetic `resize`) */
export function refitScreen() {
  refitting = true
  try { window.dispatchEvent(new Event('resize')) } finally { refitting = false }
}

function keepScreenFitted() {
  const REFIT_DELAYS_MS = [100, 300, 700, 1200]
  let timers: number[] = []
  const refit = refitScreen
  const schedule = () => {
    if (refitting) return
    timers.forEach(timer => window.clearTimeout(timer))
    timers = REFIT_DELAYS_MS.map(ms => window.setTimeout(refit, ms))
  }
  window.addEventListener('resize', schedule)
  window.addEventListener('orientationchange', schedule)
  document.addEventListener('fullscreenchange', schedule)
  document.addEventListener('webkitfullscreenchange', schedule)
  screen.orientation?.addEventListener?.('change', schedule)
  window.visualViewport?.addEventListener('resize', schedule)
}

/**
 * Touch devices: marks the page (`html.touch`) and keeps the canvas fitted to
 * the screen. Fullscreen is never forced: the player chooses it with the
 * corner button (<audio-menu>), which is always visible.
 */
export function setupTouchDevice() {
  if (!isTouchDevice()) return
  document.documentElement.classList.add('touch')
  keepScreenFitted()
}
