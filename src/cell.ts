import * as ex from "excalibur"
import { Board } from "./board"
import { CursorAnimation, HighlightAnimation, RedHighlightAnimation, TileSpriteSheet } from "./resources"
import { SCALE } from "./config"
import { PathNodeComponent } from "./path-finding/path-node-component"
import { Unit } from "./unit"
import { Terrain } from './maps/tarrain-enum'

const RangeHighlightAnimation = HighlightAnimation.clone()
const PathHighlightAnimation = HighlightAnimation.clone()
const AttackHighlightAnimation = RedHighlightAnimation.clone()

export class Cell extends ex.Actor {
  decoration: ex.Actor
  sprite!: ex.Sprite
  pathNode: PathNodeComponent
  unit: Unit | null = null
  private _terrain: Terrain = Terrain.r3c1

  /**
   * Individual cells on the board
   * 
   * @param x integer coordinate
   * @param y integer coordinate
   * @param board 
   */
  constructor(public x: number, public y: number, public board: Board) {
    super({
      name: `cell(${x}, ${y})`,
      pos: ex.vec(
        x * (board.tileWidth + board.margin) * SCALE.x,
        y * (board.tileHeight + board.margin) * SCALE.y
      ),
      anchor: ex.Vector.Zero
    })
    this.decoration = new ex.Actor({ anchor: ex.vec(0, 0) })
    this.addChild(this.decoration)

    this.pathNode = new PathNodeComponent(this.pos)
    this.addComponent(this.pathNode)

    this.terrain = Terrain.r3c1

    RangeHighlightAnimation.scale = ex.vec(2, 2)
    RangeHighlightAnimation.opacity = 0.8

    PathHighlightAnimation.scale = ex.vec(2, 2)
    PathHighlightAnimation.opacity = 0.5

    AttackHighlightAnimation.scale = ex.vec(2, 2)
    AttackHighlightAnimation.opacity = 0.8

    CursorAnimation.scale = ex.vec(2, 2)
    CursorAnimation.opacity = 0.8

    this.decoration.graphics.add('range', RangeHighlightAnimation)
    this.decoration.graphics.add('path', PathHighlightAnimation)
    this.decoration.graphics.add('attack', AttackHighlightAnimation)
    this.decoration.graphics.add('cursor', CursorAnimation)

    this.decoration.graphics.offset = ex.vec(-4, -4)
  }

  get terrain() {
    return this._terrain
  }

  set terrain(terrain: Terrain) {
    this._terrain = terrain
    switch (this.terrain) {
      // ROW 1
      case Terrain.r1c1:
        this.sprite = TileSpriteSheet.sprites[0]
        break
      case Terrain.r1c2:
        this.sprite = TileSpriteSheet.sprites[1]
        break
      case Terrain.r1c3:
        this.sprite = TileSpriteSheet.sprites[2]
        break
      case Terrain.r1c4:
        this.sprite = TileSpriteSheet.sprites[3]
        break
      case Terrain.r1c5:
        this.sprite = TileSpriteSheet.sprites[4]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c6:
        this.sprite = TileSpriteSheet.sprites[5]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c7:
        this.sprite = TileSpriteSheet.sprites[6]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c8:
        this.sprite = TileSpriteSheet.sprites[7]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c9:
        this.sprite = TileSpriteSheet.sprites[8]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c10:
        this.sprite = TileSpriteSheet.sprites[9]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 2
      case Terrain.r2c1:
        this.sprite = TileSpriteSheet.sprites[10]
        break
      case Terrain.r2c2:
        this.sprite = TileSpriteSheet.sprites[11]
        break
      case Terrain.r2c3:
        this.sprite = TileSpriteSheet.sprites[12]
        break
      case Terrain.r2c4:
        this.sprite = TileSpriteSheet.sprites[13]
        break
      case Terrain.r2c5:
        this.sprite = TileSpriteSheet.sprites[14]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c6:
        this.sprite = TileSpriteSheet.sprites[15]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c7:
        this.sprite = TileSpriteSheet.sprites[16]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c8:
        this.sprite = TileSpriteSheet.sprites[17]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c9:
        this.sprite = TileSpriteSheet.sprites[18]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c10:
        this.sprite = TileSpriteSheet.sprites[19]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 3
      case Terrain.r3c1:
        this.sprite = TileSpriteSheet.sprites[20]
        break
      case Terrain.r3c2:
        this.sprite = TileSpriteSheet.sprites[21]
        break
      case Terrain.r3c3:
        this.sprite = TileSpriteSheet.sprites[22]
        break
      case Terrain.r3c4:
        this.sprite = TileSpriteSheet.sprites[23]
        break
      case Terrain.r3c5:
        this.sprite = TileSpriteSheet.sprites[24]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c6:
        this.sprite = TileSpriteSheet.sprites[25]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c7:
        this.sprite = TileSpriteSheet.sprites[26]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c8:
        this.sprite = TileSpriteSheet.sprites[27]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c9:
        this.sprite = TileSpriteSheet.sprites[28]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c10:
        this.sprite = TileSpriteSheet.sprites[29]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 4
      case Terrain.r4c1:
        this.sprite = TileSpriteSheet.sprites[30]
        break
      case Terrain.r4c2:
        this.sprite = TileSpriteSheet.sprites[31]
        break
      case Terrain.r4c3:
        this.sprite = TileSpriteSheet.sprites[32]
        break
      case Terrain.r4c4:
        this.sprite = TileSpriteSheet.sprites[33]
        break
      case Terrain.r4c5:
        this.sprite = TileSpriteSheet.sprites[34]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r4c6:
        this.sprite = TileSpriteSheet.sprites[35]
        this.pathNode.isAttackable = false
        this.pathNode.isDoor = true
        break
      case Terrain.r4c7:
        this.sprite = TileSpriteSheet.sprites[36]
        break
      case Terrain.r4c8:
        this.sprite = TileSpriteSheet.sprites[37]
        this.pathNode.isAttackable = false
        this.pathNode.isDoor = true
        break
      case Terrain.r4c9:
        this.sprite = TileSpriteSheet.sprites[38]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r4c10:
        this.sprite = TileSpriteSheet.sprites[39]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 5
      case Terrain.r5c1:
        this.sprite = TileSpriteSheet.sprites[40]
        break
      case Terrain.r5c2:
        this.sprite = TileSpriteSheet.sprites[41]
        break
      case Terrain.r5c3:
        this.sprite = TileSpriteSheet.sprites[42]
        break
      case Terrain.r5c4:
        this.sprite = TileSpriteSheet.sprites[43]
        break
      case Terrain.r5c5:
        this.sprite = TileSpriteSheet.sprites[44]
        break
      case Terrain.r5c6:
        this.sprite = TileSpriteSheet.sprites[45]
        break
      case Terrain.r5c7:
        this.sprite = TileSpriteSheet.sprites[46]
        break
      case Terrain.r5c8:
        this.sprite = TileSpriteSheet.sprites[47]
        this.pathNode.isFast = false
        break
      case Terrain.r5c9:
        this.sprite = TileSpriteSheet.sprites[48]
        this.pathNode.isFast = false
        break
      case Terrain.r5c10:
        this.sprite = TileSpriteSheet.sprites[49]
        this.pathNode.isFast = false
        break
      // ROW 6
      case Terrain.r6c1:
        this.sprite = TileSpriteSheet.sprites[50]
        break
      case Terrain.r6c2:
        this.sprite = TileSpriteSheet.sprites[51]
        break
      case Terrain.r6c3:
        this.sprite = TileSpriteSheet.sprites[52]
        break
      case Terrain.r6c4:
        this.sprite = TileSpriteSheet.sprites[53]
        break
      case Terrain.r6c5:
        this.sprite = TileSpriteSheet.sprites[54]
        break
      case Terrain.r6c6:
        this.sprite = TileSpriteSheet.sprites[55]
        break
      case Terrain.r6c7:
        this.sprite = TileSpriteSheet.sprites[56]
        break
      case Terrain.r6c8:
        this.sprite = TileSpriteSheet.sprites[57]
        this.pathNode.isFast = false
        break
      case Terrain.r6c9:
        this.sprite = TileSpriteSheet.sprites[58]
        this.pathNode.isFast = false
        break
      case Terrain.r6c10:
        this.sprite = TileSpriteSheet.sprites[59]
        this.pathNode.isFast = false
        break
      // ROW 7
      case Terrain.r7c1:
        this.sprite = TileSpriteSheet.sprites[60]
        break
      case Terrain.r7c2:
        this.sprite = TileSpriteSheet.sprites[61]
        break
      case Terrain.r7c3:
        this.sprite = TileSpriteSheet.sprites[62]
        break
      case Terrain.r7c4:
        this.sprite = TileSpriteSheet.sprites[63]
        break
      case Terrain.r7c5:
        this.sprite = TileSpriteSheet.sprites[64]
        break
      case Terrain.r7c6:
        this.sprite = TileSpriteSheet.sprites[65]
        break
      case Terrain.r7c7:
        this.sprite = TileSpriteSheet.sprites[66]
        break
      case Terrain.r7c8:
        this.sprite = TileSpriteSheet.sprites[67]
        this.pathNode.isFast = false
        break
      case Terrain.r7c9:
        this.sprite = TileSpriteSheet.sprites[68]
        this.pathNode.isFast = false
        break
      case Terrain.r7c10:
        this.sprite = TileSpriteSheet.sprites[69]
        this.pathNode.isFast = false
        break
      // ROW 8
      case Terrain.r8c1:
        this.sprite = TileSpriteSheet.sprites[70]
        break
      case Terrain.r8c2:
        this.sprite = TileSpriteSheet.sprites[71]
        break
      case Terrain.r8c3:
        this.sprite = TileSpriteSheet.sprites[72]
        break
      case Terrain.r8c4:
        this.sprite = TileSpriteSheet.sprites[73]
        break
      case Terrain.r8c5:
        this.sprite = TileSpriteSheet.sprites[74]
        break
      case Terrain.r8c6:
        this.sprite = TileSpriteSheet.sprites[75]
        break
      case Terrain.r8c7:
        this.sprite = TileSpriteSheet.sprites[76]
        break
      case Terrain.r8c8:
        this.sprite = TileSpriteSheet.sprites[77]
        this.pathNode.isFast = false
        break
      case Terrain.r8c9:
        this.sprite = TileSpriteSheet.sprites[78]
        this.pathNode.isFast = false
        break
      case Terrain.r8c10:
        this.sprite = TileSpriteSheet.sprites[79]
        break
      // ROW 9
      case Terrain.r9c1:
        this.sprite = TileSpriteSheet.sprites[80]
        break
      case Terrain.r9c2:
        this.sprite = TileSpriteSheet.sprites[81]
        break
      case Terrain.r9c3:
        this.sprite = TileSpriteSheet.sprites[82]
        break
      case Terrain.r9c4:
        this.sprite = TileSpriteSheet.sprites[83]
        break
      case Terrain.r9c5:
        this.sprite = TileSpriteSheet.sprites[84]
        break
      case Terrain.r9c6:
        this.sprite = TileSpriteSheet.sprites[85]
        break
      case Terrain.r9c7:
        this.sprite = TileSpriteSheet.sprites[86]
        break
      case Terrain.r9c8:
        this.sprite = TileSpriteSheet.sprites[87]
        this.pathNode.isFast = false
        break
      case Terrain.r9c9:
        this.sprite = TileSpriteSheet.sprites[88]
        this.pathNode.isFast = false
        break
      case Terrain.r9c10:
        this.sprite = TileSpriteSheet.sprites[89]
        break
      // ROW 10
      case Terrain.r10c1:
        this.sprite = TileSpriteSheet.sprites[90]
        break
      case Terrain.r10c2:
        this.sprite = TileSpriteSheet.sprites[91]
        break
      case Terrain.r10c3:
        this.sprite = TileSpriteSheet.sprites[92]
        break
      case Terrain.r10c4:
        this.sprite = TileSpriteSheet.sprites[93]
        break
      case Terrain.r10c5:
        this.sprite = TileSpriteSheet.sprites[94]
        break
      case Terrain.r10c6:
        this.sprite = TileSpriteSheet.sprites[95]
        break
      case Terrain.r10c7:
        this.sprite = TileSpriteSheet.sprites[96]
        break
      case Terrain.r10c8:
        this.sprite = TileSpriteSheet.sprites[97]
        this.pathNode.isFast = false
        break
      case Terrain.r10c9:
        this.sprite = TileSpriteSheet.sprites[98]
        this.pathNode.isFast = false
        break
      case Terrain.r10c10:
        this.sprite = TileSpriteSheet.sprites[99]
        break
      // ROW 11
      case Terrain.r11c1:
        this.sprite = TileSpriteSheet.sprites[100]
        break
      case Terrain.r11c2:
        this.sprite = TileSpriteSheet.sprites[101]
        break
      case Terrain.r11c3:
        this.sprite = TileSpriteSheet.sprites[102]
        break
      case Terrain.r11c4:
        this.sprite = TileSpriteSheet.sprites[103]
        break
      case Terrain.r11c5:
        this.sprite = TileSpriteSheet.sprites[104]
        break
      case Terrain.r11c6:
        this.sprite = TileSpriteSheet.sprites[105]
        break
      case Terrain.r11c7:
        this.sprite = TileSpriteSheet.sprites[106]
        break
      case Terrain.r11c8:
        this.sprite = TileSpriteSheet.sprites[107]
        this.pathNode.isFast = false
        break
      case Terrain.r11c9:
        this.sprite = TileSpriteSheet.sprites[108]
        this.pathNode.isFast = false
        break
      case Terrain.r11c10:
        this.sprite = TileSpriteSheet.sprites[109]
        break
      // ROW 12
      case Terrain.r12c1:
        this.sprite = TileSpriteSheet.sprites[110]
        break
      case Terrain.r12c2:
        this.sprite = TileSpriteSheet.sprites[111]
        break
      case Terrain.r12c3:
        this.sprite = TileSpriteSheet.sprites[112]
        break
      case Terrain.r12c4:
        this.sprite = TileSpriteSheet.sprites[113]
        break
      case Terrain.r12c5:
        this.sprite = TileSpriteSheet.sprites[114]
        break
      case Terrain.r12c6:
        this.sprite = TileSpriteSheet.sprites[115]
        break
      case Terrain.r12c7:
        this.sprite = TileSpriteSheet.sprites[116]
        break
      case Terrain.r12c8:
        this.sprite = TileSpriteSheet.sprites[117]
        this.pathNode.isFast = false
        break
      case Terrain.r12c9:
        this.sprite = TileSpriteSheet.sprites[118]
        this.pathNode.isFast = false
        break
      case Terrain.r12c10:
        this.sprite = TileSpriteSheet.sprites[119]
        break
      // ROW 13
      case Terrain.r13c1:
        this.sprite = TileSpriteSheet.sprites[120]
        break
      case Terrain.r13c2:
        this.sprite = TileSpriteSheet.sprites[121]
        break
      case Terrain.r13c3:
        this.sprite = TileSpriteSheet.sprites[122]
        break
      case Terrain.r13c4:
        this.sprite = TileSpriteSheet.sprites[123]
        break
      case Terrain.r13c5:
        this.sprite = TileSpriteSheet.sprites[124]
        break
      case Terrain.r13c6:
        this.sprite = TileSpriteSheet.sprites[125]
        break
      case Terrain.r13c7:
        this.sprite = TileSpriteSheet.sprites[126]
        break
      case Terrain.r13c8:
        this.sprite = TileSpriteSheet.sprites[127]
        break
      case Terrain.r13c9:
        this.sprite = TileSpriteSheet.sprites[128]
        break
      case Terrain.r13c10:
        this.sprite = TileSpriteSheet.sprites[129]
        break
      // ROW 14
      case Terrain.r14c1:
        this.sprite = TileSpriteSheet.sprites[130]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c2:
        this.sprite = TileSpriteSheet.sprites[131]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c3:
        this.sprite = TileSpriteSheet.sprites[132]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c4:
        this.sprite = TileSpriteSheet.sprites[133]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c5:
        this.sprite = TileSpriteSheet.sprites[134]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c6:
        this.sprite = TileSpriteSheet.sprites[135]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c7:
        this.sprite = TileSpriteSheet.sprites[136]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c8:
        this.sprite = TileSpriteSheet.sprites[137]
        this.pathNode.isWalkable = false
        break
      case Terrain.r14c9:
        this.sprite = TileSpriteSheet.sprites[138]
        break
      case Terrain.r14c10:
        this.sprite = TileSpriteSheet.sprites[139]
        break
      // ROW 15
      case Terrain.r15c1:
        this.sprite = TileSpriteSheet.sprites[140]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c2:
        this.sprite = TileSpriteSheet.sprites[141]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c3:
        this.sprite = TileSpriteSheet.sprites[142]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c4:
        this.sprite = TileSpriteSheet.sprites[143]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c5:
        this.sprite = TileSpriteSheet.sprites[144]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c6:
        this.sprite = TileSpriteSheet.sprites[145]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c7:
        this.sprite = TileSpriteSheet.sprites[146]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c8:
        this.sprite = TileSpriteSheet.sprites[147]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c9:
        this.sprite = TileSpriteSheet.sprites[148]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c10:
        this.sprite = TileSpriteSheet.sprites[149]
        this.pathNode.isWalkable = false
        break
      // ROW 16
      case Terrain.r16c1:
        this.sprite = TileSpriteSheet.sprites[150]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c2:
        this.sprite = TileSpriteSheet.sprites[151]
        break
      case Terrain.r16c3:
        this.sprite = TileSpriteSheet.sprites[152]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c4:
        this.sprite = TileSpriteSheet.sprites[153]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c5:
        this.sprite = TileSpriteSheet.sprites[154]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c6:
        this.sprite = TileSpriteSheet.sprites[155]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c7:
        this.sprite = TileSpriteSheet.sprites[156]
        break
      case Terrain.r16c8:
        this.sprite = TileSpriteSheet.sprites[157]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c9:
        this.sprite = TileSpriteSheet.sprites[158]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c10:
        this.sprite = TileSpriteSheet.sprites[159]
        this.pathNode.isWalkable = false
        break
      // ROW 17
      case Terrain.r17c1:
        this.sprite = TileSpriteSheet.sprites[160]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c2:
        this.sprite = TileSpriteSheet.sprites[161]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c3:
        this.sprite = TileSpriteSheet.sprites[162]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c4:
        this.sprite = TileSpriteSheet.sprites[163]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c5:
        this.sprite = TileSpriteSheet.sprites[164]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c6:
        this.sprite = TileSpriteSheet.sprites[165]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c7:
        this.sprite = TileSpriteSheet.sprites[166]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c8:
        this.sprite = TileSpriteSheet.sprites[167]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c9:
        this.sprite = TileSpriteSheet.sprites[168]
        this.pathNode.isWalkable = false
        break
      case Terrain.r17c10:
        this.sprite = TileSpriteSheet.sprites[169]
        this.pathNode.isWalkable = false
        break
      // ROW 18
      case Terrain.r18c1:
        this.sprite = TileSpriteSheet.sprites[170]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c2:
        this.sprite = TileSpriteSheet.sprites[171]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c3:
        this.sprite = TileSpriteSheet.sprites[172]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c4:
        this.sprite = TileSpriteSheet.sprites[173]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c5:
        this.sprite = TileSpriteSheet.sprites[174]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c6:
        this.sprite = TileSpriteSheet.sprites[175]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c7:
        this.sprite = TileSpriteSheet.sprites[176]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c8:
        this.sprite = TileSpriteSheet.sprites[177]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c9:
        this.sprite = TileSpriteSheet.sprites[178]
        this.pathNode.isWalkable = false
        break
      case Terrain.r18c10:
        this.sprite = TileSpriteSheet.sprites[179]
        this.pathNode.isWalkable = false
        break
      // ROW 19
      case Terrain.r19c1:
        this.sprite = TileSpriteSheet.sprites[180]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c2:
        this.sprite = TileSpriteSheet.sprites[181]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c3:
        this.sprite = TileSpriteSheet.sprites[182]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c4:
        this.sprite = TileSpriteSheet.sprites[183]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c5:
        this.sprite = TileSpriteSheet.sprites[184]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c6:
        this.sprite = TileSpriteSheet.sprites[185]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c7:
        this.sprite = TileSpriteSheet.sprites[186]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c8:
        this.sprite = TileSpriteSheet.sprites[187]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c9:
        this.sprite = TileSpriteSheet.sprites[188]
        this.pathNode.isWalkable = false
        break
      case Terrain.r19c10:
        this.sprite = TileSpriteSheet.sprites[189]
        this.pathNode.isWalkable = false
        break
      // ROW 20
      case Terrain.r20c1:
        this.sprite = TileSpriteSheet.sprites[190]
        break
      case Terrain.r20c2:
        this.sprite = TileSpriteSheet.sprites[191]
        break
      case Terrain.r20c3:
        this.sprite = TileSpriteSheet.sprites[192]
        break
      case Terrain.r20c4:
        this.sprite = TileSpriteSheet.sprites[193]
        break
      case Terrain.r20c5:
        this.sprite = TileSpriteSheet.sprites[194]
        break
      case Terrain.r20c6:
        this.sprite = TileSpriteSheet.sprites[195]
        break
      case Terrain.r20c7:
        this.sprite = TileSpriteSheet.sprites[196]
        break
      case Terrain.r20c8:
        this.sprite = TileSpriteSheet.sprites[197]
        break
      case Terrain.r20c9:
        this.sprite = TileSpriteSheet.sprites[198]
        break
      case Terrain.r20c10:
        this.sprite = TileSpriteSheet.sprites[199]
        break
      // ROW 21
      case Terrain.r21c1:
        this.sprite = TileSpriteSheet.sprites[200]
        break
      case Terrain.r21c2:
        this.sprite = TileSpriteSheet.sprites[201]
        break
      case Terrain.r21c3:
        this.sprite = TileSpriteSheet.sprites[202]
        break
      case Terrain.r21c4:
        this.sprite = TileSpriteSheet.sprites[203]
        break
      case Terrain.r21c5:
        this.sprite = TileSpriteSheet.sprites[204]
        break
      case Terrain.r21c6:
        this.sprite = TileSpriteSheet.sprites[205]
        break
      case Terrain.r21c7:
        this.sprite = TileSpriteSheet.sprites[206]
        break
      case Terrain.r21c8:
        this.sprite = TileSpriteSheet.sprites[207]
        break
      case Terrain.r21c9:
        this.sprite = TileSpriteSheet.sprites[208]
        break
      case Terrain.r21c10:
        this.sprite = TileSpriteSheet.sprites[209]
        break
      // ROW 22
      case Terrain.r22c1:
        this.sprite = TileSpriteSheet.sprites[210]
        break
      case Terrain.r22c2:
        this.sprite = TileSpriteSheet.sprites[211]
        break
      case Terrain.r22c3:
        this.sprite = TileSpriteSheet.sprites[212]
        break
      case Terrain.r22c4:
        this.sprite = TileSpriteSheet.sprites[213]
        break
      case Terrain.r22c5:
        this.sprite = TileSpriteSheet.sprites[214]
        break
      case Terrain.r22c6:
        this.sprite = TileSpriteSheet.sprites[215]
        break
      case Terrain.r22c7:
        this.sprite = TileSpriteSheet.sprites[216]
        break
      case Terrain.r22c8:
        this.sprite = TileSpriteSheet.sprites[217]
        break
      case Terrain.r22c9:
        this.sprite = TileSpriteSheet.sprites[218]
        break
      case Terrain.r22c10:
        this.sprite = TileSpriteSheet.sprites[219]
        break
    }

    this.sprite.scale = SCALE
    this.graphics.use(this.sprite.clone())
  }

  getRandomNumber(num1: number, num2: number) {
    return Math.floor(Math.random() * num1) + num2
  }

  addUnit(unit: Unit) {
    this.unit = unit
    this.unit.scale = SCALE
    this.unit.offset = ex.vec(0, 0)
    this.unit.cell = this
    this.pathNode.walkableMask = unit.player.mask
  }

  removeUnit(unit: Unit) {
    this.pathNode.walkableMask = -1
    this.unit = null
    unit.cell = null
  }

  toggleHighlight(show: boolean, type: 'range' | 'path' | 'attack') {
    this.decoration.graphics.hide()

    if (show) {
      this.decoration.graphics.use(type)
    } else {
      this.decoration.graphics.hide()
    }
  }

  toggleCursor(show: boolean) {
    if (show) {
      this.decoration.graphics.use('cursor')
    } else {
      this.decoration.graphics.hide()
    }
  }

  getDistance(other: Cell) {
    return Math.abs(this.pos.x - other.pos.x) + Math.abs(this.pos.y - other.pos.y)
  }

  /**
   * Returns the orthogonal neighbors (up, down, left, right)
   * @returns 
   */
  getNeighbors(): Cell[] {
    return [
      this.board.getCell(this.x, this.y - 1),
      this.board.getCell(this.x, this.y + 1),
      this.board.getCell(this.x + 1, this.y),
      this.board.getCell(this.x - 1, this.y),
    ].filter(function (cell) {
      return cell !== null
    }) as Cell[]
  }

}