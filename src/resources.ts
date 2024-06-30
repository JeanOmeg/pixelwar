import * as ex from 'excalibur'
import KnightSpriteSheetPath from '../res/minis/SwordFighter_LongHair_Blue1.png'
import SpiderSheetPath from '../res/SpiderSheet.png'
import SlimeSheetPath from '../res/slime.png'
import CrabSheetPath from '../res/crab.png'
import HeartSheetPath from '../res/utils/HeartSheet.png'
import UISheetPath from '../res/UISheet.png'
import SelectionCursorPath from '../res/utils/SelectionCursor.png'
import TileSpritePath from '../res/tiles/FullTileset.png'
import HighlightSheetPath from '../res/utils/MoveCursor.png'
import RedHighlightSheetPath from '../res/utils/DamageCursor.png'
import CloudSheetPath from '../res/utils/StarsScreen.png'
import SmokePath from '../res/Smoke.png'
import HitSoundPath from '../res/hit.wav'
import MoveSoundPath from '../res/move.wav'
import SelectSoundPath from '../res/unitselect.wav'
import TargetSelectPath from '../res/targetselect.wav'
import TutorialTextPath from '../res/tutorial-text.png'
import LevelMusic1Path from '../res/5 Action Chiptunes By Juhani Junkala/Juhani Junkala [Retro Game Music Pack] Level 3.wav'
import LevelMusic2Path from '../res/gba1complete.mp3'
import ExplosionPath from '../res/explosion.png'
import ExplosionSoundPath from '../res/explosion.wav'
import TitleScreenMusic from '../res/two_left_socks.ogg'

export const Resources = {
  KnightSpriteSheet: new ex.ImageSource(KnightSpriteSheetPath),
  SpiderSheet: new ex.ImageSource(SpiderSheetPath),
  SlimeSheet: new ex.ImageSource(SlimeSheetPath),
  CrabSheet: new ex.ImageSource(CrabSheetPath),
  HeartSheet: new ex.ImageSource(HeartSheetPath),
  UISheet: new ex.ImageSource(UISheetPath),
  CursorSheet: new ex.ImageSource(SelectionCursorPath),
  TileSheet: new ex.ImageSource(TileSpritePath),
  HighlightSheet: new ex.ImageSource(HighlightSheetPath),
  RedHighlightSheet: new ex.ImageSource(RedHighlightSheetPath),
  CloudSheet: new ex.ImageSource(CloudSheetPath),
  SmokeSheet: new ex.ImageSource(SmokePath),
  TutorialText: new ex.ImageSource(TutorialTextPath),
  ExplosionSheet: new ex.ImageSource(ExplosionPath),
  HitSound: new ex.Sound(HitSoundPath),
  MoveSound: new ex.Sound(MoveSoundPath),
  SelectSound: new ex.Sound(SelectSoundPath),
  TargetSelectSound: new ex.Sound(TargetSelectPath),
  LevelMusic1: new ex.Sound(LevelMusic1Path),
  LevelMusic2: new ex.Sound(LevelMusic2Path),
  ExplosionSound: new ex.Sound(ExplosionSoundPath),
  TitleMusic: new ex.Sound(TitleScreenMusic),
} as const

export const TutorialTextSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.TutorialText,
  grid: {
    rows: 1,
    columns: 8,
    spriteWidth: 128,
    spriteHeight: 64
  }
})

export const TileSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.TileSheet,
  grid: {
    rows: 8,
    columns: 7,
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
export const RedHighlightSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.RedHighlightSheet,
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


export const SpiderSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SpiderSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SpiderIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpiderSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 200 },
    { x: 1, y: 0, duration: 200 },
    { x: 2, y: 0, duration: 200 },
    { x: 3, y: 0, duration: 200 }
  ]
})

export const SlimeSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SlimeSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SlimeIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SlimeSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 200 },
    { x: 1, y: 0, duration: 200 },
    { x: 2, y: 0, duration: 200 },
    { x: 3, y: 0, duration: 200 }
  ]
})

export const CrabSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.CrabSheet,
  grid: {
    rows: 1,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const CrabIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: CrabSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 200 },
    { x: 1, y: 0, duration: 200 },
    { x: 2, y: 0, duration: 200 },
    { x: 3, y: 0, duration: 200 }
  ]
})

export const KnightSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.KnightSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const KnightIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: KnightSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 200 },
    { x: 1, y: 0, duration: 200 },
    { x: 2, y: 0, duration: 200 },
    { x: 3, y: 0, duration: 200 }
  ]
})

export const HeartSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.HeartSheet,
  grid: {
    rows: 1,
    columns: 36,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ExplosionSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ExplosionSheet,
  grid: {
    rows: 2,
    columns: 5,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const Explosion = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ExplosionSpriteSheet,
  frameCoordinates: [
    { x: 0, y: 0, duration: 100 },
    { x: 1, y: 0, duration: 100 },
    { x: 2, y: 0, duration: 100 },
    { x: 3, y: 0, duration: 100 },
    { x: 4, y: 0, duration: 100 },
    { x: 0, y: 1, duration: 100 },
    { x: 1, y: 1, duration: 100 },
    { x: 2, y: 1, duration: 100 },
  ]
})

export const Smoke = Resources.SmokeSheet.toSprite()

export const loader = new ex.Loader()
loader.backgroundColor = 'black'
loader.logoWidth = 256
loader.logoHeight = 54
loader.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAwCAYAAAD+f6R/AAAAAXNSR0IArs4c6QAAAkRJREFUeJzt3NtyhCAMgGHs9P1fmd7UjrNTDzmQBPy/621EYAMYt60BAAAAAAAAAAAAAAAAmN4m+XDvvbs3YNvc2iCNtZqn43PXT9pxHtn/Fdu0gq/sBvRf1WKtbFQ/Vex75sS19AQAIE+ZBCDZvrKtA3yUSQCt1dxCAiv7zm7Apz0J3K3y7AIAu1I7AACxVKtoxFb9uMJHl7f+i+PVBkksaVxp7BHlwKuYHiVc73Kgtb/O/v7zs5brjCx9q44A+0Xvbko7GaCnSZx3sSzj7K1im2a21BHAq+ZriTOyxr5y0pzh/iTts9xL1HVaWywBAJApVwVYkefK9rRKgnNRq7OFZhegmRPsAIAXIwFMaoYzM2Jp5kRKApA20mu7y2vEOvSZXdW5N/QZgOcK9bT84xkrqtTkUaMe7arPrs6g0ns4ixVZ9rOMx9M3WKuU0DkCKEVk84orxpURDzsrWfH19FcngBkHDPCct5QBlY4rlHVAKq52qG3bts1j3pRJAFmrseezBSCSx3fm1UeAI0tnkjwwKxIARKqWs6CT/l+B/xoyoOxh+UmmlkcpTHs9r356otquR3IPGfMgcmwkhj4DyF4peu/d0gbNl8vjXf3oftP0U/azk+y5dcc6945xWht3vxwBgBcrUwVYmbRk4/HGGc55ldBWQAIIkr1lriLqFden7bD8LmWFseQIEMxr5ebXgPlW2IWRAIAXEyWArBqw13UtcTzvfVQfzjw2eyyPONJrRlRseH8CAAAAAAAAAAAAAAAAwDA/212gaw4Jm7oAAAAASUVORK5CYII='

for (let res of Object.values(Resources)) {
  loader.addResource(res)
}