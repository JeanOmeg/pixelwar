// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Player } from '../src/player'
import { Unit } from '../src/unit'
import type { Board } from '../src/board'
import { unitTypeOf } from '../src/unit-types'
import { applyAction, boardHash, instantPresenter, rollAttackDice } from '../src/online/actions'
import { ActionFeed } from '../src/online/feed'
import type { GameAction } from '../src/online/protocol'
import { boardOf, loadMap, mapFiles } from './sim/map-loader'
import { TestPlayer } from './helpers'

/** Small seeded random, so a failure can be replayed */
function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Side { board: Board, players: [Player, Player] }

function setUp(file: string, copy: string): Side {
  const map = loadMap(file)
  const board = boardOf({ ...map, name: `${map.name}#${copy}` })
  const players: [Player, Player] = [new TestPlayer('Blue', board), new TestPlayer('Red', board)]
  for (const spawn of map.spawns) {
    const unit = new Unit(spawn.x, spawn.y, unitTypeOf(spawn.unitClass, spawn.team), board, players[spawn.team])
    unit.miniDirection = spawn.team === 0 ? 'right' : 'left'
  }
  return { board, players }
}

const pick = <T>(list: T[], random: () => number): T => list[Math.floor(random() * list.length)]

/** A random legal action for `player`, or end-turn */
function randomAction(board: Board, player: Player, random: () => number): GameAction {
  const units = board.getUnits().filter(u => u.player === player && u.canBeSelected() && u.cell)
  if (units.length === 0 || random() < 0.05) return { a: 'end-turn', reason: 'button' }
  const unit = pick(units, random)
  const at: [number, number] = [unit.cell!.x, unit.cell!.y]
  const options: (() => GameAction | null)[] = [
    () => {
      if (!unit.canMove()) return null
      // with Run the unit could go further; a normal-range path is still a valid Run move
      const run = unit.canUseSkill('skill-run') && random() < 0.3
      const map = board.pathFinder.getMovementMap(unit.cell!.pathNode, player.mask, unit.effectiveMovement, unit.name)
      const dest = map.range.filter(n => n !== unit.cell!.pathNode)
      if (dest.length === 0) return null
      const path = map.pathTo(pick(dest, random)).map(n => [n.x, n.y] as [number, number])
      return { a: 'move', unit: at, path, ...(run ? { skill: 'skill-run' as const } : {}) }
    },
    () => {
      const targets = unit.attacked ? [] : unit.getPossibleTargets() ?? []
      if (targets.length === 0) return null
      const skill = unit.unitConfig.skills.find(s => s.kind === 'attack' && unit.canUseSkill(s.id) && random() < 0.5)
      const target = pick(targets, random)
      return { a: 'attack', unit: at, target: [target.x, target.y], rolls: rollAttackDice(), ...(skill ? { skill: skill.id } : {}) }
    },
    () => {
      const skill = unit.unitConfig.skills.find(s => s.kind === 'self' && unit.canUseSkill(s.id))
      return skill ? { a: 'self-skill', unit: at, skill: skill.id } : null
    },
    () => {
      const target = unit.canUseSkill('skill-heal') ? unit.healTargets()[0] : undefined
      return target?.cell ? { a: 'heal', unit: at, target: [target.cell.x, target.cell.y] } : null
    },
    () => unit.canUndoMove() ? { a: 'undo', unit: at } : null,
    () => ({ a: 'pass', unit: at })
  ]
  for (let tries = 0; tries < 20; tries++) {
    const action = pick(options, random)()
    if (action) return action
  }
  return { a: 'pass', unit: at }
}

const hasMoves = (board: Board, player: Player) =>
  board.getUnits().some(u => u.player === player && u.hasActions()) && board.getUnits().some(u => u.player !== player)

describe('online sync', () => {
  for (const [file, seed] of mapFiles().slice(0, 4).map((f, i) => [f, 1000 + i] as const)) {
    it(`two boards fed the same actions stay the same (${file})`, async () => {
      Player.resetMasks()
      const random = seeded(seed)
      // Math.random drives the dice inside rollAttackDice: fix it too
      const realRandom = Math.random
      Math.random = seeded(seed * 7)
      try {
        const local = setUp(file, 'local')
        const remote = setUp(file, 'remote')
        const feed = new ActionFeed()
        const sent: { index: number, action: GameAction }[] = []
        feed.onLocal = (action, index) => sent.push({ index, action })

        for (let phase = 0; phase < 40; phase++) {
          const team = phase % 2
          const sides = [local, remote]
          if (sides.some(s => s.board.getUnits().every(u => u.player !== s.players[0]) || s.board.getUnits().every(u => u.player !== s.players[1]))) break
          for (const side of sides) await side.players[team].turnStart()

          let ended = false
          while (!ended && hasMoves(local.board, local.players[team])) {
            const action = randomAction(local.board, local.players[team], random)
            feed.recordLocal(action)
            ended = await applyAction(local.board, local.players[team], action, instantPresenter)
            // the other device: same action, received through its own feed
            const received = new ActionFeed()
            received.receive(0, sent[sent.length - 1].action)
            const entry = received.take()!
            const remoteEnded = await applyAction(remote.board, remote.players[team], entry.action, instantPresenter)
            expect(remoteEnded).toBe(ended)
            expect(boardHash(remote.board)).toBe(boardHash(local.board))
          }
        }
        expect(sent.length).toBeGreaterThan(20)
      } finally {
        Math.random = realRandom
      }
    })
  }

  it('a board that joins late catches up from the history', async () => {
    Player.resetMasks()
    const random = seeded(7)
    const local = setUp(mapFiles()[0], 'live')
    const late = setUp(mapFiles()[0], 'late')
    const history: GameAction[] = []
    /** Phase each action was played in */
    const phaseOf: number[] = []
    for (let phase = 0; phase < 10; phase++) {
      const team = phase % 2
      await local.players[team].turnStart()
      let ended = false
      while (!ended && hasMoves(local.board, local.players[team])) {
        const action = randomAction(local.board, local.players[team], random)
        history.push(action)
        phaseOf.push(phase)
        ended = await applyAction(local.board, local.players[team], action, instantPresenter)
      }
    }

    // the late board gets everything at once and replays it phase by phase
    const feed = new ActionFeed()
    feed.load(history)
    let next = 0
    for (let phase = 0; phase < 10; phase++) {
      const team = phase % 2
      await late.players[team].turnStart()
      while (phaseOf[next] === phase) {
        const entry = feed.take()!
        expect(entry.catchUp).toBe(true)
        await applyAction(late.board, late.players[team], entry.action, instantPresenter)
        next++
      }
    }
    expect(feed.catchingUp).toBe(false)
    expect(boardHash(late.board)).toBe(boardHash(local.board))
  })

  it('reports a gap in the received actions', () => {
    const feed = new ActionFeed()
    expect(feed.receive(0, { a: 'end-turn', reason: 'button' })).toBe(true)
    expect(feed.receive(0, { a: 'end-turn', reason: 'button' })).toBe(true)
    expect(feed.receive(2, { a: 'end-turn', reason: 'button' })).toBe(false)
    expect(feed.length).toBe(1)
  })
})
