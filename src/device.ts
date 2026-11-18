/**
 * Phone/tablet support: touch detection, fullscreen + landscape on the first
 * tap, and how much to enlarge the UI on small screens.
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

type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
// eslint-disable-next-line no-unused-vars -- parameter name of a type
type LockableOrientation = ScreenOrientation & { lock?: (orientation: string) => Promise<void> }

/** Fullscreen and landscape lock (where the browser allows it; iPhone does not) */
async function enterFullscreen() {
  const root = document.documentElement as FullscreenElement
  try {
    if (!document.fullscreenElement) {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' })
      else await root.webkitRequestFullscreen?.()
    }
  } catch { /* not allowed: keep the browser chrome */ }
  try {
    await (screen.orientation as LockableOrientation | undefined)?.lock?.('landscape')
  } catch { /* not supported */ }
}

/** On touch devices, goes fullscreen on the first tap (needs a user gesture) */
export function setupTouchDevice() {
  if (!isTouchDevice()) return
  document.documentElement.classList.add('touch')
  const onFirstTap = () => {
    window.removeEventListener('pointerup', onFirstTap, true)
    enterFullscreen()
  }
  window.addEventListener('pointerup', onFirstTap, true)
}
