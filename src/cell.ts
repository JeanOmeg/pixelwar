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
        x * (board.tileWidth) * SCALE.x,
        y * (board.tileHeight) * SCALE.y
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
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(0, 4)]
        break
      case Terrain.r1c5:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(4, 3)]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r1c8:
        this.sprite = TileSpriteSheet.sprites[[7, 8, 9, 17][this.getRandomNumber(0, 4)]]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 2
      case Terrain.r2c1:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(10, 4)]
        break
      case Terrain.r2c5:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(14, 3)]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r2c9:
        this.sprite = TileSpriteSheet.sprites[[18, 19, 28, 29][this.getRandomNumber(0, 4)]]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 3
      case Terrain.r3c1:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(20, 4)]
        break
      case Terrain.r3c5:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(24, 3)]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r3c8:
        this.sprite = TileSpriteSheet.sprites[27]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 4
      case Terrain.r4c1:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(30, 4)]
        break
      case Terrain.r4c5:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(34, 3)]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r4c8:
        this.sprite = TileSpriteSheet.sprites[37]
        this.pathNode.isAttackable = false
        this.pathNode.isDoor = true
        break
      case Terrain.r4c9:
        this.sprite = TileSpriteSheet.sprites[38]
        this.pathNode.isAttackable = false
        this.pathNode.isDoor = true
        break
      case Terrain.r4c10:
        this.sprite = TileSpriteSheet.sprites[39]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      // ROW 5
      case Terrain.r5c1:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(40, 4)]
        this.pathNode.isWalkable = false
        break
      case Terrain.r5c5:
        this.sprite = TileSpriteSheet.sprites[this.getRandomNumber(44, 3)]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
      case Terrain.r5c8:
        this.sprite = TileSpriteSheet.sprites[47]
        this.pathNode.isWalkable = false
        this.pathNode.isAttackable = false
        break
      case Terrain.r5c9:
        this.sprite = TileSpriteSheet.sprites[48]
        break
      case Terrain.r5c10:
        this.sprite = TileSpriteSheet.sprites[49]
        break
      // ROW 6
      case Terrain.r6c1:
        this.sprite = TileSpriteSheet.sprites[50]
        this.pathNode.isFast = false
        break
      case Terrain.r6c2:
        this.sprite = TileSpriteSheet.sprites[51]
        this.pathNode.isFast = false
        break
      case Terrain.r6c3:
        this.sprite = TileSpriteSheet.sprites[52]
        this.pathNode.isFast = false
        break
      case Terrain.r6c4:
        this.sprite = TileSpriteSheet.sprites[53]
        this.pathNode.isFast = false
        break
      case Terrain.r6c5:
        this.sprite = TileSpriteSheet.sprites[54]
        this.pathNode.isFast = false
        break
      case Terrain.r6c6:
        this.sprite = TileSpriteSheet.sprites[55]
        this.pathNode.isFast = false
        break
      case Terrain.r6c7:
        this.sprite = TileSpriteSheet.sprites[56]
        this.pathNode.isFast = false
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
        this.pathNode.isFast = false
        break
      case Terrain.r7c2:
        this.sprite = TileSpriteSheet.sprites[61]
        this.pathNode.isFast = false
        break
      case Terrain.r7c3:
        this.sprite = TileSpriteSheet.sprites[62]
        this.pathNode.isFast = false
        break
      case Terrain.r7c4:
        this.sprite = TileSpriteSheet.sprites[63]
        this.pathNode.isFast = false
        break
      case Terrain.r7c5:
        this.sprite = TileSpriteSheet.sprites[64]
        this.pathNode.isFast = false
        break
      case Terrain.r7c6:
        this.sprite = TileSpriteSheet.sprites[65]
        this.pathNode.isFast = false
        break
      case Terrain.r7c7:
        this.sprite = TileSpriteSheet.sprites[66]
        this.pathNode.isFast = false
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
        this.pathNode.isFast = false
        break
      case Terrain.r8c2:
        this.sprite = TileSpriteSheet.sprites[71]
        this.pathNode.isFast = false
        break
      case Terrain.r8c3:
        this.sprite = TileSpriteSheet.sprites[72]
        this.pathNode.isFast = false
        break
      case Terrain.r8c4:
        this.sprite = TileSpriteSheet.sprites[73]
        this.pathNode.isFast = false
        break
      case Terrain.r8c5:
        this.sprite = TileSpriteSheet.sprites[74]
        this.pathNode.isFast = false
        break
      case Terrain.r8c6:
        this.sprite = TileSpriteSheet.sprites[75]
        this.pathNode.isFast = false
        break
      case Terrain.r8c7:
        this.sprite = TileSpriteSheet.sprites[76]
        this.pathNode.isFast = false
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
        this.pathNode.isFast = false
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
      case Terrain.r9c5:
        this.sprite = TileSpriteSheet.sprites[84]
        break
      case Terrain.r9c7:
        this.sprite = TileSpriteSheet.sprites[86]
        break
      case Terrain.r9c8:
        this.sprite = TileSpriteSheet.sprites[[87, 117][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r9c9:
        this.sprite = TileSpriteSheet.sprites[[88, 118][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r9c10:
        this.sprite = TileSpriteSheet.sprites[[89, 119][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      // ROW 10
      case Terrain.r10c1:
        this.sprite = TileSpriteSheet.sprites[90]
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
      case Terrain.r10c8:
        this.sprite = TileSpriteSheet.sprites[[97, 127][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r10c9:
        this.sprite = TileSpriteSheet.sprites[[98, 128][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r10c10:
        this.sprite = TileSpriteSheet.sprites[[99, 129][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
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
      case Terrain.r11c5:
        this.sprite = TileSpriteSheet.sprites[104]
        break
      case Terrain.r11c6:
        this.sprite = TileSpriteSheet.sprites[105]
        break
      case Terrain.r11c8:
        this.sprite = TileSpriteSheet.sprites[[107, 137][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r11c9:
        this.sprite = TileSpriteSheet.sprites[[108, 138][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r11c10:
        this.sprite = TileSpriteSheet.sprites[[109, 139][this.getRandomNumber(0, 2)]]
        this.pathNode.isWalkable = false
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
      case Terrain.r12c5:
        this.sprite = TileSpriteSheet.sprites[114]
        break
      case Terrain.r12c7:
        this.sprite = TileSpriteSheet.sprites[116]
        break
      // ROW 13
      case Terrain.r13c1:
        this.sprite = TileSpriteSheet.sprites[120]
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
      // ROW 14
      case Terrain.r14c1:
        this.sprite = TileSpriteSheet.sprites[130]
        break
      case Terrain.r14c2:
        this.sprite = TileSpriteSheet.sprites[131]
        break
      case Terrain.r14c3:
        this.sprite = TileSpriteSheet.sprites[132]
        break
      case Terrain.r14c5:
        this.sprite = TileSpriteSheet.sprites[134]
        break
      case Terrain.r14c7:
        this.sprite = TileSpriteSheet.sprites[136]
        break
      // ROW 15
      case Terrain.r15c1:
        this.sprite = TileSpriteSheet.sprites[140]
        break
      case Terrain.r15c2:
        this.sprite = TileSpriteSheet.sprites[141]
        break
      case Terrain.r15c3:
        this.sprite = TileSpriteSheet.sprites[142]
        break
      case Terrain.r15c5:
        this.sprite = TileSpriteSheet.sprites[144]
        break
      case Terrain.r15c7:
        this.sprite = TileSpriteSheet.sprites[146]
        break
      case Terrain.r15c8:
        this.sprite = TileSpriteSheet.sprites[[147, 148][Math.floor(Math.random() * 1 * 1)]]
        this.pathNode.isWalkable = false
        break
      case Terrain.r15c10:
        this.sprite = TileSpriteSheet.sprites[[149, 159][Math.floor(Math.random() * 1 * 1)]]
        this.pathNode.isWalkable = false
        break
      // ROW 16
      case Terrain.r16c1:
        this.sprite = TileSpriteSheet.sprites[150]
        break
      case Terrain.r16c3:
        this.sprite = TileSpriteSheet.sprites[152]
        break
      case Terrain.r16c4:
        this.sprite = TileSpriteSheet.sprites[153]
        break
      case Terrain.r16c5:
        this.sprite = TileSpriteSheet.sprites[154]
        break
      case Terrain.r16c6:
        this.sprite = TileSpriteSheet.sprites[155]
        break
      case Terrain.r16c8:
        this.sprite = TileSpriteSheet.sprites[157]
        this.pathNode.isWalkable = false
        break
      case Terrain.r16c9:
        this.sprite = TileSpriteSheet.sprites[158]
        this.pathNode.isWalkable = false
        break
      // ROW 17
      case Terrain.r17c1:
        this.sprite = TileSpriteSheet.sprites[160]
        break
      case Terrain.r17c2:
        this.sprite = TileSpriteSheet.sprites[161]
        break
      case Terrain.r17c3:
        this.sprite = TileSpriteSheet.sprites[162]
        break
      case Terrain.r17c5:
        this.sprite = TileSpriteSheet.sprites[164]
        break
      case Terrain.r17c7:
        this.sprite = TileSpriteSheet.sprites[166]
        break
      case Terrain.r17c8:
        this.sprite = TileSpriteSheet.sprites[167]
        break
      case Terrain.r17c9:
        this.sprite = TileSpriteSheet.sprites[168]
        break
      case Terrain.r17c10:
        this.sprite = TileSpriteSheet.sprites[169]
        break
      // ROW 18
      case Terrain.r18c1:
        this.sprite = TileSpriteSheet.sprites[170]
        break
      case Terrain.r18c2:
        this.sprite = TileSpriteSheet.sprites[171]
        break
      case Terrain.r18c3:
        this.sprite = TileSpriteSheet.sprites[172]
        break
      case Terrain.r18c4:
        this.sprite = TileSpriteSheet.sprites[173]
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
        break
      case Terrain.r19c2:
        this.sprite = TileSpriteSheet.sprites[181]
        break
      case Terrain.r19c3:
        this.sprite = TileSpriteSheet.sprites[182]
        break
      case Terrain.r19c4:
        this.sprite = TileSpriteSheet.sprites[183]
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
    }

    this.sprite.scale = SCALE
    this.graphics.use(this.sprite.clone())
  }

  getRandomNumber(num1: number, num2: number) {
    return Math.floor(Math.random() * num2) + num1
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