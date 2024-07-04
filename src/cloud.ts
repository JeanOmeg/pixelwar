import * as ex from "excalibur"
import { Resources } from "./resources"

export class Cloud extends ex.Actor {
  cloudSprite!: ex.Sprite
  constructor(pos: ex.Vector) {
    super({
      name: 'cloud',
      pos,
      vel: ex.vec(50, 0),
      width: 100,
      height: 100
    })
  }
  override onInitialize(_engine: ex.Engine): void {
    this.cloudSprite = Resources.CloudSheet.toSprite()
    this.graphics.use(this.cloudSprite)

  }
  override onPostUpdate(engine: ex.Engine, _delta: number): void {
    console.log(this.pos.x + (this.cloudSprite.width - 3800))
    if (this.pos.x + (this.cloudSprite.width - 3800) > 2400) {
      this.pos.x = engine.screen.contentArea.right
    }
  }
}