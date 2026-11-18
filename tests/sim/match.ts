import { Player } from '../../src/player'
import { Unit } from '../../src/unit'
import type { Board } from '../../src/board'
import type { UnitClass } from '../../src/unit-types'
import { unitTypeOf } from '../../src/unit-types'
import { AiExecutor, playAiTurn } from '../../src/ai/turn'
import type { AiWeights, Difficulty, Personality } from '../../src/ai/weights'
import { LegacyAi } from './legacy-ai'
import { SimMap, boardOf } from './map-loader'

/** Instant moves and attacks: the whole match runs without the engine loop */
const instant: AiExecutor = {
  move: async (unit, path) => unit.moveInstant(path),
  attack: async (unit, target) => { unit.attackInstant(target) },
  pause: async () => {}
}

/** The current AI (src/ai/) as a player */
class SimAi extends Player {
  constructor(name: string, board: Board, private difficulty: Difficulty, private personality: Personality, private weights?: Partial<AiWeights>) {
    super(name, board)
  }

  private turns = 0

  async makeMove(): Promise<boolean> {
    this.turns++
    await playAiTurn(this.board, this, { difficulty: this.difficulty, personality: this.personality, round: this.turns, weights: this.weights }, instant)
    return true
  }
}

export type Contender = { label: string, make: (name: string, board: Board) => Player }

export const newAi = (difficulty: Difficulty = 'normal', personality: Personality = 'balanced', weights?: Partial<AiWeights>, label?: string): Contender =>
  ({ label: label ?? `new-${difficulty}${personality === 'balanced' ? '' : `-${personality}`}`, make: (name, board) => new SimAi(name, board, difficulty, personality, weights) })

export const legacyAi: Contender = { label: 'old', make: (name, board) => new LegacyAi(name, board) }

export interface MatchResult {
  /** 0 = blue, 1 = red, null = draw (phase limit) */
  winner: 0 | 1 | null
  phases: number
  /** Units left per team */
  survivors: [number, number]
  /** Who is left, e.g. "ArcherA@3,4:7hp" (for debugging) */
  left: string[]
}

/** One full match on `map` (blue = contenders[0]); 100 player phases like the game */
export async function runMatch(map: SimMap, contenders: [Contender, Contender], armies?: [UnitClass[] | null, UnitClass[] | null], maxPhases = 100): Promise<MatchResult> {
  Player.resetMasks()
  const board = boardOf(map)
  const players = [contenders[0].make('Blue', board), contenders[1].make('Red', board)]
  const slots = [0, 0]
  for (const spawn of map.spawns) {
    const slot = slots[spawn.team]++
    const unitClass = armies?.[spawn.team]?.[slot] ?? spawn.unitClass
    const unit = new Unit(spawn.x, spawn.y, unitTypeOf(unitClass, spawn.team), board, players[spawn.team])
    unit.miniDirection = spawn.team === 0 ? 'right' : 'left'
  }

  const alive = (p: Player) => board.getUnits().filter(u => u.player === p).length
  for (let phase = 0; phase < maxPhases; phase++) {
    const [a, b] = [alive(players[0]), alive(players[1])]
    if (a === 0 || b === 0) return { winner: a === 0 && b === 0 ? null : a === 0 ? 1 : 0, phases: phase, survivors: [a, b], left: describeUnits(board) }
    const current = players[phase % 2]
    await current.turnStart()
    await current.makeMove()
    await current.turnEnd()
  }
  const [a, b] = [alive(players[0]), alive(players[1])]
  return { winner: a === 0 ? 1 : b === 0 ? 0 : null, phases: maxPhases, survivors: [a, b], left: describeUnits(board) }
}

function describeUnits(board: Board): string[] {
  return board.getUnits().map(u => `${u.name}@${u.cell!.x},${u.cell!.y}:${u.health}hp`)
}
