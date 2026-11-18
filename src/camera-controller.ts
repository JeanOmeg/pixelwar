import * as ex from 'excalibur'
import { MIN_ZOOM, anchorAxis, clampAxis, clampZoom, wheelZoom } from './camera-math'

/** A finger that moves less than this (page px) is still a tap */
const TAP_SLOP = 12
/** Time (ms) for the wheel zoom to cover ~63% of the way to its target */
const WHEEL_SMOOTHING_MS = 70

interface Anchor {
  /** world point kept under the focus */
  world: ex.Vector
  /** focus, in screen pixels from the screen center */
  offset: ex.Vector
}

interface Touch {
  start: ex.Vector
  last: ex.Vector
}

/**
 * Map zoom: mouse wheel (smooth, towards the cursor) and, on touch screens,
 * pinch (two fingers zoom and pan) and one-finger drag while zoomed in.
 * Only the camera changes, so the map and the units zoom; the HTML UI doesn't
 * (GameUI scales just the unit menu with `zoom`).
 *
 * On touch, a tap is reported on release (`onTap`) and only if the finger
 * didn't drag and no second finger joined: the first finger of a pinch must
 * not select a unit.
 *
 * Created per match by LevelBase; `dispose()` removes the listeners.
 */
export class CameraController {
  /** Zoom input is ignored while this is false (pause menu, game over...) */
  enabled: () => boolean = () => true

  private targetZoom = MIN_ZOOM
  private wheelAnchor: Anchor | null = null
  private touches = new Map<number, Touch>()
  /** the touch that may still become a tap */
  private tapId: number | null = null
  private pinch: { distance: number, zoom: number, anchor: Anchor } | null = null
  private tapListeners = new Set<(world: ex.Vector) => void>()
  private changeListeners = new Set<() => void>()
  private lastFrame = performance.now()
  private subscription: ex.Subscription

  constructor(private engine: ex.Engine, private camera: ex.Camera, private mapSize: () => ex.Vector) {
    const canvas = engine.canvas
    window.addEventListener('wheel', this.onWheel, { passive: false })
    canvas.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerCancel)
    this.subscription = engine.on('preupdate', () => this.update())
    this.camera.zoom = MIN_ZOOM
    this.apply(MIN_ZOOM, this.camera.pos)
  }

  get zoom(): number {
    return this.camera.zoom
  }

  /** `listener` gets the world position of every tap (touch only); returns an unsubscribe */
  onTap(listener: (world: ex.Vector) => void): () => void {
    this.tapListeners.add(listener)
    return () => this.tapListeners.delete(listener)
  }

  /** `listener` runs whenever the zoom or the camera position changes */
  onChange(listener: () => void): () => void {
    this.changeListeners.add(listener)
    return () => this.changeListeners.delete(listener)
  }

  /** Page coordinates of a world point, with the camera as it is now (no frame lag) */
  worldToPage(world: ex.Vector): ex.Vector {
    const screen = this.engine.screen
    const raw = world.sub(this.camera.pos).scale(this.camera.zoom).add(this.halfResolution())
    return screen.screenToPageCoordinates(raw.sub(ex.vec(screen.contentArea.left, screen.contentArea.top)))
  }

  /** Pans the least needed to show the world rectangle (keyboard cursor while zoomed in) */
  ensureVisible(topLeft: ex.Vector, size: ex.Vector, margin = 0) {
    const zoom = this.camera.zoom
    if (zoom <= MIN_ZOOM) return
    const half = this.halfResolution().scale(1 / zoom)
    const pos = this.camera.pos.clone()
    const min = topLeft.sub(ex.vec(margin, margin))
    const max = topLeft.add(size).add(ex.vec(margin, margin))
    if (min.x < pos.x - half.x) pos.x = min.x + half.x
    else if (max.x > pos.x + half.x) pos.x = max.x - half.x
    if (min.y < pos.y - half.y) pos.y = min.y + half.y
    else if (max.y > pos.y + half.y) pos.y = max.y - half.y
    this.apply(zoom, pos)
  }

  dispose() {
    const canvas = this.engine.canvas
    window.removeEventListener('wheel', this.onWheel)
    canvas.removeEventListener('pointerdown', this.onPointerDown)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerCancel)
    this.subscription.close()
    this.tapListeners.clear()
    this.changeListeners.clear()
    this.camera.zoom = MIN_ZOOM
  }

  private halfResolution(): ex.Vector {
    const resolution = this.engine.screen.resolution
    return ex.vec(resolution.width / 2, resolution.height / 2)
  }

  /** Page point → screen pixels from the screen center (independent of the camera) */
  private pageToOffset(page: ex.Vector): ex.Vector {
    const screen = this.engine.screen
    const raw = screen.pageToScreenCoordinates(page).add(ex.vec(screen.contentArea.left, screen.contentArea.top))
    return raw.sub(this.halfResolution())
  }

  /** World point under a page point, with the camera as it is now */
  private anchorAt(page: ex.Vector): Anchor {
    const offset = this.pageToOffset(page)
    return { offset, world: this.camera.pos.add(offset.scale(1 / this.camera.zoom)) }
  }

  private positionFor(anchor: Anchor, zoom: number): ex.Vector {
    return ex.vec(anchorAxis(anchor.world.x, anchor.offset.x, zoom), anchorAxis(anchor.world.y, anchor.offset.y, zoom))
  }

  /** Sets zoom and position, keeping the view inside the map */
  private apply(zoom: number, pos: ex.Vector) {
    zoom = clampZoom(zoom)
    const size = this.mapSize()
    const resolution = this.engine.screen.resolution
    const next = ex.vec(
      clampAxis(pos.x, zoom, resolution.width, size.x),
      clampAxis(pos.y, zoom, resolution.height, size.y)
    )
    const changed = zoom !== this.camera.zoom || !next.equals(this.camera.pos)
    if (zoom !== this.camera.zoom) this.camera.zoom = zoom
    this.camera.pos = next
    if (changed) this.changeListeners.forEach(listener => listener())
  }

  /** Every frame: eases the wheel zoom towards its target and keeps the view inside the map */
  private update() {
    const now = performance.now()
    const elapsed = Math.min(now - this.lastFrame, 100)
    this.lastFrame = now
    const zoom = this.camera.zoom
    if (this.wheelAnchor && zoom !== this.targetZoom) {
      const t = 1 - Math.exp(-elapsed / WHEEL_SMOOTHING_MS)
      let next = zoom + (this.targetZoom - zoom) * t
      if (Math.abs(this.targetZoom - next) < 0.002) next = this.targetZoom
      this.apply(next, this.positionFor(this.wheelAnchor, clampZoom(next)))
    } else {
      // window resized / rotated: the view may have left the map
      this.apply(zoom, this.camera.pos)
    }
  }

  private onWheel = (event: WheelEvent) => {
    if (!this.enabled() || this.touches.size > 0) return
    // over a panel (HUD, unit menu...) the wheel belongs to the UI
    if (event.composedPath().some(el => el instanceof HTMLElement && el.classList.contains('panel'))) return
    event.preventDefault()
    const pixels = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? event.deltaY * 33 : event.deltaY
    // trackpad pinch arrives as ctrl + wheel with small deltas: make it as fast as a notch per ~10 px
    const delta = event.ctrlKey ? pixels * 10 : pixels
    const from = this.wheelAnchor ? this.targetZoom : this.camera.zoom
    this.targetZoom = wheelZoom(from, delta)
    this.wheelAnchor = this.anchorAt(ex.vec(event.clientX, event.clientY))
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return
    const page = ex.vec(event.clientX, event.clientY)
    this.touches.set(event.pointerId, { start: page, last: page })
    this.stopWheel()
    if (this.touches.size === 1) {
      this.tapId = event.pointerId
    } else {
      this.tapId = null
      this.startPinch()
    }
  }

  private onPointerMove = (event: PointerEvent) => {
    const touch = this.touches.get(event.pointerId)
    if (!touch) return
    const page = ex.vec(event.clientX, event.clientY)
    const previous = touch.last
    touch.last = page
    if (this.tapId === event.pointerId && page.distance(touch.start) > TAP_SLOP) this.tapId = null
    if (!this.enabled()) return

    if (this.pinch && this.touches.size >= 2) {
      const [a, b] = [...this.touches.values()]
      const distance = a.last.distance(b.last)
      const zoom = clampZoom(this.pinch.zoom * distance / this.pinch.distance)
      const anchor = { world: this.pinch.anchor.world, offset: this.pageToOffset(a.last.add(b.last).scale(0.5)) }
      this.apply(zoom, this.positionFor(anchor, zoom))
    } else if (this.touches.size === 1 && this.tapId === null) {
      // one finger dragging: pan
      const delta = this.pageToOffset(page).sub(this.pageToOffset(previous))
      this.apply(this.camera.zoom, this.camera.pos.sub(delta.scale(1 / this.camera.zoom)))
    }
  }

  private onPointerUp = (event: PointerEvent) => {
    const touch = this.touches.get(event.pointerId)
    if (!touch) return
    this.touches.delete(event.pointerId)
    if (this.tapId === event.pointerId) {
      this.tapId = null
      const { world } = this.anchorAt(touch.last)
      this.tapListeners.forEach(listener => listener(world))
    }
    // two fingers again (a third one lifted): restart the pinch from here; one finger left: it pans
    this.pinch = null
    if (this.touches.size >= 2) this.startPinch()
  }

  private onPointerCancel = (event: PointerEvent) => {
    if (this.tapId === event.pointerId) this.tapId = null
    this.touches.delete(event.pointerId)
    this.pinch = null
    if (this.touches.size >= 2) this.startPinch()
  }

  private startPinch() {
    const [a, b] = [...this.touches.values()]
    const distance = a.last.distance(b.last)
    if (distance < 1) return
    this.pinch = { distance, zoom: this.camera.zoom, anchor: this.anchorAt(a.last.add(b.last).scale(0.5)) }
  }

  private stopWheel() {
    this.wheelAnchor = null
    this.targetZoom = this.camera.zoom
  }
}
