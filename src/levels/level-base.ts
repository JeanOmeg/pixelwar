import * as ex from 'excalibur'
import { Board } from '../board'
import { SCALE } from '../config'
import { Unit } from '../unit'
import { Player } from '../player'
import { HumanPlayer } from '../human-player'
import { SelectionManager } from '../selection-manager'
import { GameUI } from '../game-ui'
import { TurnManager } from '../turn-manager'
import { ComputerPlayer } from '../computer-player'
import { DustParticles } from '../dust-particles'
import { Resources } from '../resources'
import { Tile } from '@excaliburjs/plugin-tiled'
import { MapDefinition, getMapInfo, sceneNameOf, spawnsWithArmies } from '../maps'
import type { GameMode, MatchSettings } from '../game-modes'

const DEFAULT_SETTINGS: MatchSettings = { mode: 'p1vscpu' }

/**
 * One scene per map (see MAPS in maps.ts). Every activation builds a fresh
 * match: board, players, UI and turn loop. The game mode comes in through
 * `goToScene(name, { sceneActivationData: { mode } })`.
 */
export class LevelBase extends ex.Scene<MatchSettings> {
  map: MapDefinition
  name: string
  settings: MatchSettings = DEFAULT_SETTINGS
  board!: Board
  selectionManager!: SelectionManager
  ui!: GameUI
  engine!: ex.Engine
  players!: Player[]
  turnManager!: TurnManager

  constructor(map: MapDefinition) {
    super()
    this.map = map
    this.name = sceneNameOf(map)
  }

  override onInitialize(engine: ex.Engine): void {
    this.engine = engine
    document.querySelector('start-screen-ui')?.remove()
  }

  async resetAndLoad() {
    const entities = this.entities
    for (let i = entities.length - 1; i >= 0; i--) {
      this.world.remove(entities[i], false)
    }

    Resources.LevelMusic2.stop()
    this.backgroundColor = ex.Color.fromHex('#0070d4')
    this.board = await this.parse()
    this.add(DustParticles)
    this.camera.pos = this.board.getCenter()
  }

  override async onActivate(context: ex.SceneActivationContext<MatchSettings>) {
    if (context.data) this.settings = context.data
    await this.resetAndLoad()
    // not awaited: the match loop runs until the scene changes
    void this.turnManager.start()
  }

  override onDeactivate(): void {
    Resources.LevelMusic2.instances.forEach(i => i.stop())
    Resources.LevelMusic2.stop()
    this.ui?.destroy()
    this.players?.forEach(p => p.dispose())
  }

  /** Starts the same map and mode again from scratch */
  async restart() {
    await this.engine.goToScene('menu-shell')
    await this.engine.goToScene(this.name, { sceneActivationData: this.settings })
  }

  private createPlayers(mode: GameMode, board: Board): Player[] {
    const human = (name: string) => new HumanPlayer(name, this.engine, this.selectionManager, this.ui, board)
    const cpu = (name: string) => new ComputerPlayer(name, this.selectionManager, board, this.settings.difficulty ?? 'normal')
    switch (mode) {
    case 'p1vsp2': return [human('Human A'), human('Human B')]
    case 'cpuvscpu': return [cpu('CPU A'), cpu('CPU B')]
    default: return [human('Human'), cpu('CPU')]
    }
  }

  async parse(): Promise<Board> {
    const tiledMap = this.map.tiledMap
    const info = getMapInfo(this.map)

    Resources.LevelMusic2.loop = true
    Resources.LevelMusic2.play()

    const board = new Board(info.height, info.width, this)
    this.selectionManager = new SelectionManager(board, this.engine)
    this.ui = new GameUI(this.engine, board, this.selectionManager)


    Player.resetMasks()
    this.players = this.createPlayers(this.settings.mode, board)

    this.ui.setPlayers(this.players)
    this.ui.onEndTurn = () => {
      const current = this.turnManager.currentPlayer
      if (current instanceof HumanPlayer) current.endTurn()
    }
    this.ui.onQuit = () => void this.turnManager.quit()
    this.ui.onCancel = () => {
      const current = this.turnManager.currentPlayer
      if (current instanceof HumanPlayer) current.cancelSelection()
    }

    this.turnManager = new TurnManager(this.engine, this, this.players, this.selectionManager, this.ui, this.map.maxTurns)

    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const gid = info.gids[x + y * info.width]
        const tileset = tiledMap.getTilesetForTileGid(gid)
        const tile = tileset.getTileByGid(gid) as Tile
        const cell = board.getCell(x, y)
        if (!cell) continue

        cell.pathNode.isWalkable = (tile.properties.get('iswalkable') ?? false) as boolean
        cell.pathNode.isAttackable = (tile.properties.get('isattackable') ?? false) as boolean
        cell.pathNode.isFast = (tile.properties.get('isfast') ?? false) as boolean
        cell.pathNode.isDoor = (tile.properties.get('isdoor') ?? false) as boolean
        cell.pathNode.isWater = (tile.properties.get('iswater') ?? false) as boolean
        cell.sprite = tileset.getSpriteForGid(gid).clone()
        cell.sprite.scale = SCALE
        cell.graphics.use(cell.sprite)
      }
    }

    // chosen armies replace the classes drawn in the map, slot by slot;
    // row by row, so lower units are drawn over the ones above them
    const spawns = spawnsWithArmies(info, this.settings.armies).sort((a, b) => a.y - b.y || a.x - b.x)
    for (const spawn of spawns) {
      const unit = new Unit(spawn.x, spawn.y, spawn.unitType, board, this.players[spawn.team])
      // team A starts facing right, team B facing left (towards each other)
      unit.miniDirection = spawn.team == 0 ? 'right' : 'left'
      unit.graphics.flipHorizontal = spawn.team != 0
      this.add(unit)
    }

    return board
  }
}
