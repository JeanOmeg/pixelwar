import * as ex from 'excalibur'
import { TiledResource } from '@excaliburjs/plugin-tiled'

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
import LevelMusic1Path from './assets/Battle_of_Hastings.mp3'
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
import TilesetTsxPath from './assets/tiledMap/NewFullTile.tsx'
import LoaderLogoPath from './assets/loader-logo.png'

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
  CursorSheet: new ex.ImageSource(CursorPath),
  HighlightSheet: new ex.ImageSource(HighlightSheetPath),
  RedHighlightSheet: new ex.ImageSource(RedHighlightSheetPath),
  SmokeSheet: new ex.ImageSource(SmokePath),
  HitSound: new ex.Sound(HitSoundPath),
  MoveSound: new ex.Sound(MoveSoundPath),
  SelectSound: new ex.Sound(SelectSoundPath),
  TargetSelectSound: new ex.Sound(TargetSelectPath),
  LevelMusic1: new ex.Sound(LevelMusic1Path),
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
export const ArcherASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ArcherASpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ArcherAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ArcherAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ArcherAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ArcherAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ArcherAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ArcherAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ArcherAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ArcherAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ArcherAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ArcherADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ArcherADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ArcherADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const ArcherBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ArcherBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ArcherBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ArcherBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ArcherBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ArcherBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ArcherBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ArcherBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ArcherBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ArcherBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ArcherBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ArcherBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ArcherBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ArcherBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Barbarians
export const BarbarianASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.BarbarianASpriteSheet,
  grid: {
    rows: 114,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const BarbarianAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const BarbarianAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const BarbarianAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const BarbarianAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const BarbarianAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const BarbarianAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const BarbarianAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const BarbarianAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const BarbarianAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const BarbarianADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const BarbarianADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const BarbarianADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const BarbarianBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.BarbarianBSpriteSheet,
  grid: {
    rows: 114,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const BarbarianBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const BarbarianBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const BarbarianBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const BarbarianBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const BarbarianBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const BarbarianBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const BarbarianBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const BarbarianBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const BarbarianBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const BarbarianBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const BarbarianBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const BarbarianBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Clerics
export const ClericASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ClericASpriteSheet,
  grid: {
    rows: 114,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ClericAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ClericAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ClericAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ClericAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ClericAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ClericAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ClericAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ClericAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ClericAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ClericADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ClericADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ClericADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const ClericBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ClericBSpriteSheet,
  grid: {
    rows: 114,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ClericBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ClericBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ClericBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ClericBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ClericBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ClericBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ClericBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ClericBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ClericBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ClericBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ClericBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ClericBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Fighters
export const FighterASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.FighterASpriteSheet,
  grid: {
    rows: 114,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const FighterAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const FighterAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const FighterAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const FighterAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const FighterAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const FighterAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const FighterAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const FighterAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const FighterAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const FighterADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const FighterADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const FighterADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const FighterBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.FighterBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const FighterBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const FighterBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const FighterBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const FighterBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const FighterBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const FighterBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const FighterBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const FighterBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const FighterBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const FighterBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const FighterBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const FighterBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Mages
export const MageASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.MageASpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const MageAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const MageAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const MageAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const MageAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const MageAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const MageAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const MageAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const MageAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const MageAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const MageADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const MageADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const MageADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const MageBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.MageBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const MageBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const MageBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const MageBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const MageBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const MageBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const MageBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const MageBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const MageBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const MageBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const MageBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const MageBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const MageBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Spearmans
export const SpearmanASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SpearmanASpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SpearmanAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const SpearmanAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const SpearmanAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const SpearmanAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const SpearmanAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const SpearmanAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const SpearmanAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const SpearmanAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const SpearmanAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const SpearmanADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const SpearmanADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const SpearmanADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const SpearmanBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SpearmanBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SpearmanBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const SpearmanBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const SpearmanBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const SpearmanBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const SpearmanBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const SpearmanBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const SpearmanBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const SpearmanBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const SpearmanBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const SpearmanBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const SpearmanBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const SpearmanBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

// Warriors
export const WarriorASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.WarriorASpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const WarriorAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const WarriorAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const WarriorAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const WarriorAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const WarriorAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const WarriorAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const WarriorAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const WarriorAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const WarriorAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const WarriorADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const WarriorADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const WarriorADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const WarriorBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.WarriorBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const WarriorBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const WarriorBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const WarriorBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const WarriorBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const WarriorBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const WarriorBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const WarriorBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const WarriorBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const WarriorBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const WarriorBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const WarriorBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const WarriorBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const ThiefASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ThiefASpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ThiefAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ThiefAIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ThiefAIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ThiefAMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ThiefAMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ThiefAMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ThiefAAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ThiefAAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ThiefAAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ThiefADeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ThiefADeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ThiefADeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

export const ThiefBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ThiefBSpriteSheet,
  grid: {
    rows: 14,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ThiefBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 125 },
    { x: 1, y: 0, duration: 125 },
    { x: 2, y: 0, duration: 125 },
    { x: 3, y: 0, duration: 125 }
  ]
})

export const ThiefBIdleUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 10, duration: 125 },
    { x: 1, y: 10, duration: 125 },
    { x: 2, y: 10, duration: 125 },
    { x: 3, y: 10, duration: 125 }
  ]
})

export const ThiefBIdleDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 5, duration: 125 },
    { x: 1, y: 5, duration: 125 },
    { x: 2, y: 5, duration: 125 },
    { x: 3, y: 5, duration: 125 }
  ]
})

export const ThiefBMove = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 1, duration: 125 },
    { x: 1, y: 1, duration: 125 },
    { x: 2, y: 1, duration: 125 },
    { x: 3, y: 1, duration: 125 }
  ]
})

export const ThiefBMoveUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 11, duration: 125 },
    { x: 1, y: 11, duration: 125 },
    { x: 2, y: 11, duration: 125 },
    { x: 3, y: 11, duration: 125 }
  ]
})

export const ThiefBMoveDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 6, duration: 125 },
    { x: 1, y: 6, duration: 125 },
    { x: 2, y: 6, duration: 125 },
    { x: 3, y: 6, duration: 125 }
  ]
})

export const ThiefBAttack = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 2, duration: 125 },
    { x: 1, y: 2, duration: 125 },
    { x: 2, y: 2, duration: 125 },
    { x: 3, y: 2, duration: 125 }
  ]
})

export const ThiefBAttackUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 12, duration: 125 },
    { x: 1, y: 12, duration: 125 },
    { x: 2, y: 12, duration: 125 },
    { x: 3, y: 12, duration: 125 }
  ]
})

export const ThiefBAttackDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 7, duration: 125 },
    { x: 1, y: 7, duration: 125 },
    { x: 2, y: 7, duration: 125 },
    { x: 3, y: 7, duration: 125 }
  ]
})

export const ThiefBDeath = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 3, duration: 125 },
    { x: 1, y: 3, duration: 125 },
    { x: 2, y: 3, duration: 125 },
    { x: 3, y: 3, duration: 125 }
  ]
})

export const ThiefBDeathUp = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 13, duration: 125 },
    { x: 1, y: 13, duration: 125 },
    { x: 2, y: 13, duration: 125 },
    { x: 3, y: 13, duration: 125 }
  ]
})

export const ThiefBDeathDown = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ThiefBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 8, duration: 125 },
    { x: 1, y: 8, duration: 125 },
    { x: 2, y: 8, duration: 125 },
    { x: 3, y: 8, duration: 125 }
  ]
})

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
 * Used by the newer classes; the original ones still have their animations spelled out above.
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

export const NewUnitAnimations = {
  PaladinA: buildUnitAnimations(Resources.PaladinASpriteSheet),
  PaladinB: buildUnitAnimations(Resources.PaladinBSpriteSheet),
  BerserkerA: buildUnitAnimations(Resources.BerserkerASpriteSheet),
  BerserkerB: buildUnitAnimations(Resources.BerserkerBSpriteSheet),
  AssassinA: buildUnitAnimations(Resources.AssassinASpriteSheet),
  AssassinB: buildUnitAnimations(Resources.AssassinBSpriteSheet),
  RangerA: buildUnitAnimations(Resources.RangerASpriteSheet),
  RangerB: buildUnitAnimations(Resources.RangerBSpriteSheet),
  NecromancerA: buildUnitAnimations(Resources.NecromancerASpriteSheet),
  NecromancerB: buildUnitAnimations(Resources.NecromancerBSpriteSheet),
  HalberdierA: buildUnitAnimations(Resources.HalberdierASpriteSheet),
  HalberdierB: buildUnitAnimations(Resources.HalberdierBSpriteSheet)
}

export const loader = new ex.Loader()
loader.backgroundColor = 'black'

loader.startButtonFactory = () => {
  const myButton = document.createElement('button')
  myButton.textContent = 'PLAY!'
  // sizes follow the screen like the rest of the game (N = N px at 1920x1080),
  // with a floor so the button stays easy to tap on a phone
  const unit = 'min(100vw / 1920, 100vh / 1080)'
  const size = (px: number, floor: number) => `max(${floor}px, calc(${px} * ${unit}))`
  myButton.style.minWidth = size(250, 120)
  myButton.style.minHeight = size(100, 48)
  myButton.style.padding = `${size(10, 4)} ${size(18, 10)}`
  myButton.style.border = `${size(4, 3)} solid white`
  myButton.style.color = 'white'
  myButton.style.fontFamily = '\'notjamslab14\', sans-serif'
  myButton.style.fontSize = size(70, 26)
  myButton.style.backgroundColor = 'blue'
  myButton.style.cursor = 'pointer'
  myButton.style.imageRendering = 'pixelated'
  myButton.style.boxShadow = `${size(4, 3)} ${size(4, 3)} 0 black`
  // Excalibur puts the button 100px below the screen center: replace that with
  // a scaled offset so it sits right under the logo on any screen
  myButton.style.translate = `0 calc(-100px + ${size(110, 40)})`
  myButton.style.display = 'inline-block'
  myButton.style.transition = 'transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease'

  const blinkAnimationName = 'loaderBlinkAnimation'

  if (!document.getElementById('loader-blink-style')) {
    const style = document.createElement('style')
    style.id = 'loader-blink-style'
    style.textContent = `
      @keyframes ${blinkAnimationName} {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }
    `
    document.head.appendChild(style)
  }

  let triggered = false

  myButton.addEventListener('pointerdown', (event) => {
    if (triggered) return

    event.preventDefault()
    event.stopImmediatePropagation()

    triggered = true
    myButton.style.animation = `${blinkAnimationName} 200ms linear 6`
    myButton.style.pointerEvents = 'none'

    window.setTimeout(() => {
      myButton.click()
    }, 1200)
  }, { capture: true })

  return myButton
}

// same look as the title screen logo (rendered from the game font, 667x329).
// Drawn in canvas resolution units, so it scales with the screen like the game.
loader.logo = LoaderLogoPath
loader.logoWidth = 667
loader.logoHeight = 329

for (let res of Object.values(Resources)) {
  loader.addResource(res)
}