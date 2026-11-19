import * as ex from 'excalibur'
import { TiledResource } from '@excaliburjs/plugin-tiled'
import { UNIT_TYPES, type UnitType } from './unit-types'

// Paths
import TilesetPath from './assets/tiles/NewFullTile.png'
import CursorPath from './assets/utils/SelectionCursor.png'
import HighlightSheetPath from './assets/utils/MoveCursor.png'
import RedHighlightSheetPath from './assets/utils/DamageCursor.png'
import ExplosionSoundPath from './assets/explosion.wav'
import SmokePath from './assets/Smoke.png'
import HitSoundPath from './assets/hit.wav'
import MoveSoundPath from './assets/move.wav'
import SelectSoundPath from './assets/unitselect.wav'
import TargetSelectPath from './assets/targetselect.wav'
import LevelMusic2Path from './assets/Battle_of_Hastings.mp3'
import TitleScreenMusic from './assets/Path_of_the_Warrior.mp3'
import ArcherASpriteSheetPath from './assets/minis/ArcherA.png'
import ArcherBSpriteSheetPath from './assets/minis/ArcherB.png'
import BarbarianASpriteSheetPath from './assets/minis/BarbarianA.png'
import BarbarianBSpriteSheetPath from './assets/minis/BarbarianB.png'
import ClericASpriteSheetPath from './assets/minis/ClericA.png'
import ClericBSpriteSheetPath from './assets/minis/ClericB.png'
import FighterASpriteSheetPath from './assets/minis/FighterA.png'
import FighterBSpriteSheetPath from './assets/minis/FighterB.png'
import MageASpriteSheetPath from './assets/minis/MageA.png'
import MageBSpriteSheetPath from './assets/minis/MageB.png'
import SpearmanASpriteSheetPath from './assets/minis/SpearmanA.png'
import SpearmanBSpriteSheetPath from './assets/minis/SpearmanB.png'
import WarriorASpriteSheetPath from './assets/minis/WarriorA.png'
import WarriorBSpriteSheetPath from './assets/minis/WarriorB.png'
import ThiefASpriteSheetPath from './assets/minis/ThiefA.png'
import ThiefBSpriteSheetPath from './assets/minis/ThiefB.png'
import PaladinASpriteSheetPath from './assets/minis/PaladinA.png'
import PaladinBSpriteSheetPath from './assets/minis/PaladinB.png'
import BerserkerASpriteSheetPath from './assets/minis/BerserkerA.png'
import BerserkerBSpriteSheetPath from './assets/minis/BerserkerB.png'
import AssassinASpriteSheetPath from './assets/minis/AssassinA.png'
import AssassinBSpriteSheetPath from './assets/minis/AssassinB.png'
import RangerASpriteSheetPath from './assets/minis/RangerA.png'
import RangerBSpriteSheetPath from './assets/minis/RangerB.png'
import NecromancerASpriteSheetPath from './assets/minis/NecromancerA.png'
import NecromancerBSpriteSheetPath from './assets/minis/NecromancerB.png'
import HalberdierASpriteSheetPath from './assets/minis/HalberdierA.png'
import HalberdierBSpriteSheetPath from './assets/minis/HalberdierB.png'
import Map1TmxPath from './assets/tiledMap/map_1.tmx'
import Map2TmxPath from './assets/tiledMap/map_2.tmx'
import Map3TmxPath from './assets/tiledMap/map_3.tmx'
import Map4TmxPath from './assets/tiledMap/map_4.tmx'
import Map5TmxPath from './assets/tiledMap/map_5.tmx'
import Map6TmxPath from './assets/tiledMap/map_6.tmx'
import Map7TmxPath from './assets/tiledMap/map_7.tmx'
import Map8TmxPath from './assets/tiledMap/map_8.tmx'
import Map9TmxPath from './assets/tiledMap/map_9.tmx'
import Map10TmxPath from './assets/tiledMap/map_10.tmx'
import Map11TmxPath from './assets/tiledMap/map_11.tmx'
import Map12TmxPath from './assets/tiledMap/map_12.tmx'
import TilesetTsxPath from './assets/tiledMap/NewFullTile.tsx'

export const Resources = {
  //Maps
  // Utils
  TileSet: new ex.ImageSource(TilesetPath),
  TiledMap1:  new TiledResource(Map1TmxPath, {
    pathMap: [
      { path: 'map_1.tmx', output: Map1TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap2:  new TiledResource(Map2TmxPath, {
    pathMap: [
      { path: 'map_2.tmx', output: Map2TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap3:  new TiledResource(Map3TmxPath, {
    pathMap: [
      { path: 'map_3.tmx', output: Map3TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap4:  new TiledResource(Map4TmxPath, {
    pathMap: [
      { path: 'map_4.tmx', output: Map4TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap5:  new TiledResource(Map5TmxPath, {
    pathMap: [
      { path: 'map_5.tmx', output: Map5TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap6:  new TiledResource(Map6TmxPath, {
    pathMap: [
      { path: 'map_6.tmx', output: Map6TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap7:  new TiledResource(Map7TmxPath, {
    pathMap: [
      { path: 'map_7.tmx', output: Map7TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap8:  new TiledResource(Map8TmxPath, {
    pathMap: [
      { path: 'map_8.tmx', output: Map8TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap9:  new TiledResource(Map9TmxPath, {
    pathMap: [
      { path: 'map_9.tmx', output: Map9TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap10:  new TiledResource(Map10TmxPath, {
    pathMap: [
      { path: 'map_10.tmx', output: Map10TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap11:  new TiledResource(Map11TmxPath, {
    pathMap: [
      { path: 'map_11.tmx', output: Map11TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  TiledMap12:  new TiledResource(Map12TmxPath, {
    pathMap: [
      { path: 'map_12.tmx', output: Map12TmxPath },
      { path: 'NewFullTile.png', output: TilesetPath },
      { path: 'NewFullTile.tsx', output: TilesetTsxPath }
    ]
  }),
  CursorSheet: new ex.ImageSource(CursorPath),
  HighlightSheet: new ex.ImageSource(HighlightSheetPath),
  RedHighlightSheet: new ex.ImageSource(RedHighlightSheetPath),
  SmokeSheet: new ex.ImageSource(SmokePath),
  HitSound: new ex.Sound(HitSoundPath),
  MoveSound: new ex.Sound(MoveSoundPath),
  SelectSound: new ex.Sound(SelectSoundPath),
  TargetSelectSound: new ex.Sound(TargetSelectPath),
  LevelMusic2: new ex.Sound(LevelMusic2Path),
  ExplosionSound: new ex.Sound(ExplosionSoundPath),
  TitleMusic: new ex.Sound(TitleScreenMusic),
  // Minis
  ArcherASpriteSheet: new ex.ImageSource(ArcherASpriteSheetPath),
  ArcherBSpriteSheet: new ex.ImageSource(ArcherBSpriteSheetPath),
  BarbarianASpriteSheet: new ex.ImageSource(BarbarianASpriteSheetPath),
  BarbarianBSpriteSheet: new ex.ImageSource(BarbarianBSpriteSheetPath),
  ClericASpriteSheet: new ex.ImageSource(ClericASpriteSheetPath),
  ClericBSpriteSheet: new ex.ImageSource(ClericBSpriteSheetPath),
  FighterASpriteSheet: new ex.ImageSource(FighterASpriteSheetPath),
  FighterBSpriteSheet: new ex.ImageSource(FighterBSpriteSheetPath),
  MageASpriteSheet: new ex.ImageSource(MageASpriteSheetPath),
  MageBSpriteSheet: new ex.ImageSource(MageBSpriteSheetPath),
  SpearmanASpriteSheet: new ex.ImageSource(SpearmanASpriteSheetPath),
  SpearmanBSpriteSheet: new ex.ImageSource(SpearmanBSpriteSheetPath),
  WarriorASpriteSheet: new ex.ImageSource(WarriorASpriteSheetPath),
  WarriorBSpriteSheet: new ex.ImageSource(WarriorBSpriteSheetPath),
  ThiefASpriteSheet: new ex.ImageSource(ThiefASpriteSheetPath),
  ThiefBSpriteSheet: new ex.ImageSource(ThiefBSpriteSheetPath),
  PaladinASpriteSheet: new ex.ImageSource(PaladinASpriteSheetPath),
  PaladinBSpriteSheet: new ex.ImageSource(PaladinBSpriteSheetPath),
  BerserkerASpriteSheet: new ex.ImageSource(BerserkerASpriteSheetPath),
  BerserkerBSpriteSheet: new ex.ImageSource(BerserkerBSpriteSheetPath),
  AssassinASpriteSheet: new ex.ImageSource(AssassinASpriteSheetPath),
  AssassinBSpriteSheet: new ex.ImageSource(AssassinBSpriteSheetPath),
  RangerASpriteSheet: new ex.ImageSource(RangerASpriteSheetPath),
  RangerBSpriteSheet: new ex.ImageSource(RangerBSpriteSheetPath),
  NecromancerASpriteSheet: new ex.ImageSource(NecromancerASpriteSheetPath),
  NecromancerBSpriteSheet: new ex.ImageSource(NecromancerBSpriteSheetPath),
  HalberdierASpriteSheet: new ex.ImageSource(HalberdierASpriteSheetPath),
  HalberdierBSpriteSheet: new ex.ImageSource(HalberdierBSpriteSheetPath)
} as const

export const CursorSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.CursorSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const CursorAnimation = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: CursorSpriteSheet,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 },
  ]
})

export const HighlightSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.HighlightSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const HighlightAnimation = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: HighlightSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 },
  ]
})

export const RedHighlightSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.RedHighlightSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const RedHighlightAnimation = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: RedHighlightSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 },
  ]
})

export const Smoke = Resources.SmokeSheet.toSprite()

// Archers
/** The 12 animations every unit needs (left = side animation flipped) */
export interface UnitAnimations {
  idle: ex.Animation
  idleUp: ex.Animation
  idleDown: ex.Animation
  move: ex.Animation
  moveUp: ex.Animation
  moveDown: ex.Animation
  attack: ex.Animation
  attackUp: ex.Animation
  attackDown: ex.Animation
  death: ex.Animation
  deathUp: ex.Animation
  deathDown: ex.Animation
}

/**
 * Builds all unit animations from a standard mini sheet (4 columns x 14 rows of
 * 32x32): rows 0-3 side, 5-8 facing down, 10-13 facing up; each block is
 * idle / move / attack / death with 4 frames of 125 ms.
 */
export function buildUnitAnimations(image: ex.ImageSource): UnitAnimations {
  const spriteSheet = ex.SpriteSheet.fromImageSource({
    image,
    grid: { rows: 14, columns: 4, spriteHeight: 32, spriteWidth: 32 }
  })
  const row = (y: number) => ex.Animation.fromSpriteSheetCoordinates({
    spriteSheet,
    strategy: ex.AnimationStrategy.Loop,
    frameCoordinates: [0, 1, 2, 3].map(x => ({ x, y, duration: 125 }))
  })
  return {
    idle: row(0), move: row(1), attack: row(2), death: row(3),
    idleDown: row(5), moveDown: row(6), attackDown: row(7), deathDown: row(8),
    idleUp: row(10), moveUp: row(11), attackUp: row(12), deathUp: row(13)
  }
}

/** Every unit type: <Class><A|B> uses the sheet Resources.<Class><A|B>SpriteSheet */
export const UNIT_ANIMATIONS = Object.fromEntries(
  UNIT_TYPES.map(type => [type, buildUnitAnimations(Resources[`${type}SpriteSheet`])])
) as Record<UnitType, UnitAnimations>
