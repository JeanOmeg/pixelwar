import * as ex from 'excalibur'
import { SCALE, SCALE_UNIT, UNIT_CONFIG, UNIT_OFFSET, UnitType } from './config'
import { MapDefinition, getMapInfo } from './maps'

/** Size of a mini's 32x32 frame on the board, in world pixels */
const FRAME_PX = 32
const TILE_WORLD = FRAME_PX * SCALE.x

/**
 * Where a unit's frame sits relative to its cell, in tiles, exactly as in a
 * match: the Unit actor is placed at `cell.pos - UNIT_OFFSET` and drawn at
 * SCALE_UNIT × SCALE (the Cell scales the actor too), so the frame is wider
 * than a tile and the mini inside it stands on the cell.
 */
export const UNIT_FOOTPRINT = {
  left: -UNIT_OFFSET.x / TILE_WORLD,
  top: -UNIT_OFFSET.y / TILE_WORLD,
  size: (FRAME_PX * SCALE_UNIT.x * SCALE.x) / TILE_WORLD
}

/**
 * Renders game graphics (tiles, unit minis) into data URLs so the HTML menus
 * can show them with <img>. Results are cached. Resources must be loaded.
 */

const portraitCache = new Map<string, string>()
const previewCache = new Map<string, string>()

function drawSprite(ctx: CanvasRenderingContext2D, sprite: ex.Sprite, dx: number, dy: number, dw: number, dh: number, flip = false) {
  const image = sprite.image.image
  const view = sprite.sourceView
  ctx.save()
  if (flip) {
    ctx.translate(dx + dw, dy)
    ctx.scale(-1, 1)
    dx = 0
    dy = 0
  }
  ctx.drawImage(image, view.x, view.y, view.width, view.height, dx, dy, dw, dh)
  ctx.restore()
}

/** First idle frame of a unit */
function unitSprite(unitType: UnitType): ex.Sprite | null {
  const graphic = UNIT_CONFIG[unitType]?.graphics.idle.frames[0]?.graphic
  return graphic instanceof ex.Sprite ? graphic : null
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.imageSmoothingEnabled = false
  return { canvas, ctx }
}

/** 32x32 idle frame of the unit, optionally mirrored (facing left) */
export function unitPortrait(unitType: UnitType, flip = false): string {
  const key = `${unitType}:${flip}`
  const cached = portraitCache.get(key)
  if (cached) return cached

  const sprite = unitSprite(unitType)
  if (!sprite) return ''
  const { canvas, ctx } = createCanvas(32, 32)
  drawSprite(ctx, sprite, 0, 0, 32, 32, flip)
  const url = canvas.toDataURL()
  portraitCache.set(key, url)
  return url
}

/**
 * Whole map at 1 px per source pixel (tiles + units at their starting cells).
 * Team 1 is mirrored so both armies face each other, like in the match.
 * `withUnits = false` draws only the terrain.
 */
export function mapPreview(map: MapDefinition, withUnits = true): string {
  const key = map.id + (withUnits ? '' : ':empty')
  const cached = previewCache.get(key)
  if (cached) return cached

  const info = getMapInfo(map)
  const { width, height, tileWidth, tileHeight } = info
  const { canvas, ctx } = createCanvas(width * tileWidth, height * tileHeight)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gid = info.gids[x + y * width]
      if (!gid) continue
      const sprite = map.tiledMap.getTilesetForTileGid(gid)?.getSpriteForGid(gid)
      if (sprite) drawSprite(ctx, sprite, x * tileWidth, y * tileHeight, tileWidth, tileHeight)
    }
  }

  // same size and place as in a match; lower rows drawn last, on top
  const spawns = withUnits ? [...info.spawns].sort((a, b) => a.y - b.y) : []
  for (const spawn of spawns) {
    const sprite = unitSprite(spawn.unitType)
    if (!sprite) continue
    const { left, top, size } = UNIT_FOOTPRINT
    drawSprite(ctx, sprite, (spawn.x + left) * tileWidth, (spawn.y + top) * tileHeight, size * tileWidth, size * tileHeight, spawn.team === 1)
  }

  const url = canvas.toDataURL()
  previewCache.set(key, url)
  return url
}
