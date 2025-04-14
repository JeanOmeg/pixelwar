import * as ex from 'excalibur'
import { TiledResource } from '@excaliburjs/plugin-tiled'

// Utils
import TileSpritePath from '../assets/game/tiles/NewFullTile.png'
import CursorPath from '../assets/game/utils/SelectionCursor.png'
import HighlightSheetPath from '../assets/game/utils/MoveCursor.png'
import RedHighlightSheetPath from '../assets/game/utils/DamageCursor.png'
import ExplosionSoundPath from '../assets/game/explosion.wav'
import SmokePath from '../assets/game/Smoke.png'
import HitSoundPath from '../assets/game/hit.wav'
import MoveSoundPath from '../assets/game/move.wav'
import SelectSoundPath from '../assets/game/unitselect.wav'
import TargetSelectPath from '../assets/game/targetselect.wav'
import LevelMusic1Path from '../assets/game/Battle_of_Hastings.mp3'
import LevelMusic2Path from '../assets/game/Battle_of_Hastings.mp3'
import TitleScreenMusic from '../assets/game/Path_of_the_Warrior.mp3'
import CloudSheetPath from '../assets/game/utils/StarsScreen.png'

// Minis
import ArcherASpriteSheetPath from '../assets/game/minis/ArcherA.png'
import ArcherBSpriteSheetPath from '../assets/game/minis/ArcherB.png'
import BarbarianASpriteSheetPath from '../assets/game/minis/BarbarianA.png'
import BarbarianBSpriteSheetPath from '../assets/game/minis/BarbarianB.png'
import ClericASpriteSheetPath from '../assets/game/minis/ClericA.png'
import ClericBSpriteSheetPath from '../assets/game/minis/ClericB.png'
import FighterASpriteSheetPath from '../assets/game/minis/FighterA.png'
import FighterBSpriteSheetPath from '../assets/game/minis/FighterB.png'
import MageASpriteSheetPath from '../assets/game/minis/MageA.png'
import MageBSpriteSheetPath from '../assets/game/minis/MageB.png'
import SpearmanASpriteSheetPath from '../assets/game/minis/SpearmanA.png'
import SpearmanBSpriteSheetPath from '../assets/game/minis/SpearmanB.png'
import WarriorASpriteSheetPath from '../assets/game/minis/WarriorA.png'
import WarriorBSpriteSheetPath from '../assets/game/minis/WarriorB.png'
import ThiefASpriteSheetPath from '../assets/game/minis/ThiefA.png'
import ThiefBSpriteSheetPath from '../assets/game/minis/ThiefB.png'

// maps
import Map1Path from '../assets/game/maps/Map1.png'
import Map2Path from '../assets/game/maps/Map2.png'

export const Resources = {
  //Maps
  Map1: new ex.ImageSource(Map1Path),
  Map2: new ex.ImageSource(Map2Path),
  MapLevel1: new TiledResource('../assets/game/tiledMap/map_1.tmx', {
    strict: false
 }),
  MapLevel2: new TiledResource('../assets/game/tiledMap/map_2.tmx', {
    strict: false,
 }),
  // Utils
  TileSheet: new ex.ImageSource(TileSpritePath),
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
  CloudSheet: new ex.ImageSource(CloudSheetPath),
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
} as const

export const TileSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.TileSheet,
  grid: {
    rows: 19,
    columns: 10,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

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

export const loader = new ex.Loader()
loader.backgroundColor = 'black'
loader.startButtonFactory = () => {
  const myButton = document.createElement('button')
  myButton.textContent = 'PLAY!'
  myButton.style.backgroundColor = 'red'
  myButton.style.color = 'white'
  myButton.style.fontFamily = '\'Press Start 2P\', cursive'
  myButton.style.fontSize = '60px'
  myButton.style.textDecoration = 'none'
  myButton.style.border = 'none'
  myButton.style.paddingTop = '20px'
  myButton.style.paddingLeft = '20px'
  myButton.style.paddingBottom = '10px'
  myButton.style.paddingRight = '10px'
  myButton.style.textAlign = 'center'
  myButton.style.textDecoration = 'none'
  myButton.style.display = 'inline-block'
  myButton.style.cursor = 'pointer'

  myButton.onfocus = () => {
    myButton.style.outline = 'none'
  }

  const fontLink = document.createElement('link')
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap'
  fontLink.rel = 'stylesheet'
  document.head.appendChild(fontLink)

  return myButton
}
loader.logoWidth = 256
loader.logoHeight = 54
loader.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAwCAYAAAD+f6R/AAAAAXNSR0IArs4c6QAAAkRJREFUeJzt3NtyhCAMgGHs9P1fmd7UjrNTDzmQBPy/621EYAMYt60BAAAAAAAAAAAAAAAAmN4m+XDvvbs3YNvc2iCNtZqn43PXT9pxHtn/Fdu0gq/sBvRf1WKtbFQ/Vex75sS19AQAIE+ZBCDZvrKtA3yUSQCt1dxCAiv7zm7Apz0J3K3y7AIAu1I7AACxVKtoxFb9uMJHl7f+i+PVBkksaVxp7BHlwKuYHiVc73Kgtb/O/v7zs5brjCx9q44A+0Xvbko7GaCnSZx3sSzj7K1im2a21BHAq+ZriTOyxr5y0pzh/iTts9xL1HVaWywBAJApVwVYkefK9rRKgnNRq7OFZhegmRPsAIAXIwFMaoYzM2Jp5kRKApA20mu7y2vEOvSZXdW5N/QZgOcK9bT84xkrqtTkUaMe7arPrs6g0ns4ixVZ9rOMx9M3WKuU0DkCKEVk84orxpURDzsrWfH19FcngBkHDPCct5QBlY4rlHVAKq52qG3bts1j3pRJAFmrseezBSCSx3fm1UeAI0tnkjwwKxIARKqWs6CT/l+B/xoyoOxh+UmmlkcpTHs9r356otquR3IPGfMgcmwkhj4DyF4peu/d0gbNl8vjXf3oftP0U/azk+y5dcc6945xWht3vxwBgBcrUwVYmbRk4/HGGc55ldBWQAIIkr1lriLqFden7bD8LmWFseQIEMxr5ebXgPlW2IWRAIAXEyWArBqw13UtcTzvfVQfzjw2eyyPONJrRlRseH8CAAAAAAAAAAAAAAAAwDA/212gaw4Jm7oAAAAASUVORK5CYII='

for (const res of Object.values(Resources)) {
  loader.addResource(res)
}
