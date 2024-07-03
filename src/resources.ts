import * as ex from 'excalibur'
// Utils
import TileSpritePath from '../res/tiles/FullTileset.png'
import CursorPath from '../res/utils/SelectionCursor.png'
import HighlightSheetPath from '../res/utils/MoveCursor.png'
import RedHighlightSheetPath from '../res/utils/DamageCursor.png'
import HeartSheetPath from '../res/utils/HeartSheet.png'
import ExplosionPath from '../res/explosion.png'
import ExplosionSoundPath from '../res/explosion.wav'
import UISheetPath from '../res/UISheet.png'
import SmokePath from '../res/Smoke.png'
import HitSoundPath from '../res/hit.wav'
import MoveSoundPath from '../res/move.wav'
import SelectSoundPath from '../res/unitselect.wav'
import TargetSelectPath from '../res/targetselect.wav'
import LevelMusic1Path from '../res/5 Action Chiptunes By Juhani Junkala/Juhani Junkala [Retro Game Music Pack] Level 3.wav'
import LevelMusic2Path from '../res/gba1complete.mp3'
import TitleScreenMusic from '../res/two_left_socks.ogg'
import CloudSheetPath from '../res/utils/StarsScreen.png'
// Minis
import ArcherASpriteSheetPath from '../res/minis/ArcherA.png'
import ArcherBSpriteSheetPath from '../res/minis/ArcherB.png'
import BarbarianASpriteSheetPath from '../res/minis/BarbarianA.png'
import BarbarianBSpriteSheetPath from '../res/minis/BarbarianB.png'
import ClericASpriteSheetPath from '../res/minis/ClericA.png'
import ClericBSpriteSheetPath from '../res/minis/ClericB.png'
import FighterASpriteSheetPath from '../res/minis/FighterA.png'
import FighterBSpriteSheetPath from '../res/minis/FighterB.png'
import MageASpriteSheetPath from '../res/minis/MageA.png'
import MageBSpriteSheetPath from '../res/minis/MageB.png'
import SpearmanASpriteSheetPath from '../res/minis/SpearmanA.png'
import SpearmanBSpriteSheetPath from '../res/minis/SpearmanB.png'
import WarriorASpriteSheetPath from '../res/minis/WarriorA.png'
import WarriorBSpriteSheetPath from '../res/minis/WarriorB.png'

export const Resources = {
  // Utils
  TileSheet: new ex.ImageSource(TileSpritePath),
  CursorSheet: new ex.ImageSource(CursorPath),
  HeartSheet: new ex.ImageSource(HeartSheetPath),
  UISheet: new ex.ImageSource(UISheetPath),
  HighlightSheet: new ex.ImageSource(HighlightSheetPath),
  RedHighlightSheet: new ex.ImageSource(RedHighlightSheetPath),
  SmokeSheet: new ex.ImageSource(SmokePath),
  ExplosionSheet: new ex.ImageSource(ExplosionPath),
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
} as const

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

// Archers
export const ArcherASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ArcherASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ArcherAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const ArcherBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ArcherBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ArcherBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ArcherBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Barbarians
export const BarbarianASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.BarbarianASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const BarbarianAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const BarbarianBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.BarbarianBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const BarbarianBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: BarbarianBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Clerics
export const ClericASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ClericASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ClericAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const ClericBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.ClericBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const ClericBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: ClericBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Fighters
export const FighterASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.FighterASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const FighterAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const FighterBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.FighterBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const FighterBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: FighterBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Mages
export const MageASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.MageASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const MageAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const MageBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.MageBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const MageBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: MageBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Spearmans
export const SpearmanASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SpearmanASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SpearmanAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const SpearmanBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.SpearmanBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const SpearmanBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: SpearmanBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

// Warriors
export const WarriorASpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.WarriorASpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const WarriorAIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorASpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const WarriorBSpriteSheet = ex.SpriteSheet.fromImageSource({
  image: Resources.WarriorBSpriteSheet,
  grid: {
    rows: 4,
    columns: 4,
    spriteHeight: 32,
    spriteWidth: 32
  }
})

export const WarriorBIdle = ex.Animation.fromSpriteSheetCoordinates({
  spriteSheet: WarriorBSpriteSheet,
  strategy: ex.AnimationStrategy.Loop,
  frameCoordinates: [
    { x: 0, y: 0, duration: 150 },
    { x: 1, y: 0, duration: 150 },
    { x: 2, y: 0, duration: 150 },
    { x: 3, y: 0, duration: 150 }
  ]
})

export const loader = new ex.Loader()
loader.backgroundColor = 'black'
loader.startButtonFactory = () => {
  // Create the button
  let myButton = document.createElement('button');
  myButton.textContent = 'PLAY';

  // Apply the styles directly to the button
  myButton.style.backgroundColor = 'red';
  myButton.style.color = 'white';
  myButton.style.fontFamily = "'Press Start 2P', cursive";
  myButton.style.fontSize = '60px';
  myButton.style.textDecoration = 'none';
  myButton.style.border = 'none';
  myButton.style.paddingTop = '20px';
  myButton.style.paddingLeft = '20px';
  myButton.style.paddingBottom = '10px';
  myButton.style.paddingRight = '10px';
  myButton.style.textAlign = 'center';
  myButton.style.textDecoration = 'none';
  myButton.style.display = 'inline-block';
  myButton.style.cursor = 'pointer';

  // Remove the focus outline when the button is focused
  myButton.onfocus = () => {
      myButton.style.outline = 'none';
  };

  // Import the font
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  return myButton;
}
loader.logoWidth = 256
loader.logoHeight = 54
loader.logo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAAwCAYAAAD+f6R/AAAAAXNSR0IArs4c6QAAAkRJREFUeJzt3NtyhCAMgGHs9P1fmd7UjrNTDzmQBPy/621EYAMYt60BAAAAAAAAAAAAAAAAmN4m+XDvvbs3YNvc2iCNtZqn43PXT9pxHtn/Fdu0gq/sBvRf1WKtbFQ/Vex75sS19AQAIE+ZBCDZvrKtA3yUSQCt1dxCAiv7zm7Apz0J3K3y7AIAu1I7AACxVKtoxFb9uMJHl7f+i+PVBkksaVxp7BHlwKuYHiVc73Kgtb/O/v7zs5brjCx9q44A+0Xvbko7GaCnSZx3sSzj7K1im2a21BHAq+ZriTOyxr5y0pzh/iTts9xL1HVaWywBAJApVwVYkefK9rRKgnNRq7OFZhegmRPsAIAXIwFMaoYzM2Jp5kRKApA20mu7y2vEOvSZXdW5N/QZgOcK9bT84xkrqtTkUaMe7arPrs6g0ns4ixVZ9rOMx9M3WKuU0DkCKEVk84orxpURDzsrWfH19FcngBkHDPCct5QBlY4rlHVAKq52qG3bts1j3pRJAFmrseezBSCSx3fm1UeAI0tnkjwwKxIARKqWs6CT/l+B/xoyoOxh+UmmlkcpTHs9r356otquR3IPGfMgcmwkhj4DyF4peu/d0gbNl8vjXf3oftP0U/azk+y5dcc6945xWht3vxwBgBcrUwVYmbRk4/HGGc55ldBWQAIIkr1lriLqFden7bD8LmWFseQIEMxr5ebXgPlW2IWRAIAXEyWArBqw13UtcTzvfVQfzjw2eyyPONJrRlRseH8CAAAAAAAAAAAAAAAAwDA/212gaw4Jm7oAAAAASUVORK5CYII='

for (let res of Object.values(Resources)) {
  loader.addResource(res)
}