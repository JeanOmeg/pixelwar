/**
 * Pure camera math for the map zoom (no engine, so it runs in tests).
 *
 * Zoom 1 is the default view and the minimum; MAX_ZOOM (2x) is the closest view.
 * Positions are world pixels; `view` is the screen resolution in world pixels
 * at zoom 1.
 */

export const MIN_ZOOM = 1
export const MAX_ZOOM = 2
/** Zoom factor of one mouse wheel notch (~8%): the zoom grows bit by bit */
export const WHEEL_STEP = 1.08

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return MIN_ZOOM
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

/** Zoom after a wheel event with vertical delta `deltaY` in pixels (100 ≈ one notch) */
export function wheelZoom(zoom: number, deltaY: number): number {
  const notches = Math.max(-1, Math.min(1, deltaY / 100))
  return clampZoom(zoom * Math.pow(WHEEL_STEP, -notches))
}

/**
 * Camera center on one axis: the view (`view / zoom` wide) stays inside the
 * map (`size` wide). At the minimum zoom, or when the view is wider than the
 * map, the map is centered, as in the default view.
 */
export function clampAxis(pos: number, zoom: number, view: number, size: number): number {
  const half = view / zoom / 2
  if (zoom <= MIN_ZOOM || half * 2 >= size) return size / 2
  return Math.min(size - half, Math.max(half, pos))
}

/**
 * Camera center that keeps world point `world` under the screen point at
 * `offset` from the screen center (screen pixels) at `zoom`.
 */
export function anchorAxis(world: number, offset: number, zoom: number): number {
  return world - offset / zoom
}
