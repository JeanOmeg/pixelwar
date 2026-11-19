// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { Player } from '../src/player'
import { Unit, fixedRolls, type AttackEvent } from '../src/unit'
import { unitTypeOf } from '../src/unit-types'
import { applyAction, type ActionPresenter } from '../src/online/actions'
import { LESSONS, TUTORIAL_STEPS, type TutorialStep } from '../src/tutorial/script'
import { toGameAction } from '../src/tutorial/resolve'
import type { Board } from '../src/board'
import { boardOf, loadMap } from './sim/map-loader'
import { TestPlayer } from './helpers'

/** Twin Keeps with the classic armies, as the tutorial match starts */
function setUp(): { board: Board, players: [Player, Player] } {
  Player.resetMasks()
  const map = loadMap('map_1.tmx')
  const board = boardOf({ ...map, name: `${map.name}#tutorial` })
  const players: [Player, Player] = [new TestPlayer('Blue', board), new TestPlayer('Red', board)]
  for (const spawn of map.spawns) {
    const unit = new Unit(spawn.x, spawn.y, unitTypeOf(spawn.unitClass, spawn.team), board, players[spawn.team])
    unit.miniDirection = spawn.team === 0 ? 'right' : 'left'
  }
  return { board, players }
}

/** Index of the last step that does something (the winning blow) */
const lastActionIndex = () => TUTORIAL_STEPS.reduce((last, step, index) => step.kind === 'info' ? last : index, -1)

const describeStep =(index: number, step: TutorialStep) => `step ${index} (${step.kind}: ${step.text ?? JSON.stringify('action' in step ? step.action : '')})`

describe('tutorial script', () => {
  it('plays out on the real board exactly as written, and Blue wins at the last action', async () => {
    const { board, players } = setUp()
    let events: AttackEvent[] = []
    let rollsUsed = 0
    const presenter: ActionPresenter = {
      move: async (unit, path) => unit.moveInstant(path),
      attack: async (unit, target, rolls) => {
        const next = fixedRolls(rolls)
        events = unit.attackInstant(target, () => { rollsUsed++; return next() })
      }
    }
    const living = (team: number) => board.getUnits().filter(u => u.player === players[team])
    const lastAction = lastActionIndex()

    let team = 0
    let rounds = 1
    await players[0].turnStart()
    for (const [index, step] of TUTORIAL_STEPS.entries()) {
      const where = describeStep(index, step)
      if (step.kind === 'info') continue
      expect(step.kind === 'do' ? 0 : 1, `${where}: played in the other side's phase`).toBe(team)
      const player = players[team]
      const action = step.action

      if (action.a === 'end-turn' && step.kind === 'do') {
        // otherwise the game ends the turn by itself before the player can press End turn
        expect(living(0).some(u => u.hasActions()), `${where}: Blue has nothing left to do`).toBe(true)
      }
      if (action.a === 'move' && action.skill === 'skill-run') {
        const unit = board.getCell(...action.unit)!.unit!
        const walk = board.pathFinder.getMovementMap(unit.cell!.pathNode, player.mask, unit.unitConfig.movement, unit.name)
        expect(walk.canStopAt(board.getCell(...action.to)!.pathNode), `${where}: reachable without Run`).toBe(false)
      }
      if (action.a === 'attack') {
        expect(step.expect, `${where}: every attack needs an expectation`).toBeDefined()
        for (const [d20, d6] of action.rolls) {
          expect(d20 >= 1 && d20 <= 20 && d6 >= 1 && d6 <= 6, `${where}: bad die`).toBe(true)
        }
      }

      events = []
      rollsUsed = 0
      let ended: boolean
      try {
        ended = await applyAction(board, player, toGameAction(board, player, action), presenter)
      } catch (error) {
        throw new Error(`${where}: ${(error as Error).message}`)
      }

      if (action.a === 'attack' && step.expect) {
        const strikes = events.filter((e): e is Extract<AttackEvent, { kind: 'strike' }> => e.kind === 'strike')
        const [strike, counter] = strikes
        const wanted = step.expect
        expect(strike.outcome.damage, `${where}: damage`).toBe(wanted.damage)
        if (wanted.hit !== undefined) expect(strike.outcome.hit, `${where}: hit`).toBe(wanted.hit)
        expect(strike.outcome.critical, `${where}: critical`).toBe(!!wanted.critical)
        expect(strike.outcome.backAttack, `${where}: back attack`).toBe(!!wanted.back)
        expect(strike.defender.health <= 0, `${where}: kills`).toBe(!!wanted.kills)
        expect(counter?.outcome.damage, `${where}: counterattack`).toBe(wanted.counter)
        expect(rollsUsed, `${where}: every die in the script is used`).toBe(action.rolls.length)
      }

      if (index < lastAction) {
        expect(living(1).length, `${where}: Red is wiped out too early`).toBeGreaterThan(0)
      }
      if (ended) {
        await players[team].turnEnd()
        team = 1 - team
        if (team === 0) rounds++
        await players[team].turnStart()
      }
    }

    expect(living(1)).toHaveLength(0)
    expect(living(0).length).toBeGreaterThan(0)
    expect(living(0).length, 'Blue loses a unit on the way').toBeLessThan(8)
    expect(rounds).toBe(5)
  })

  it('teaches every lesson', () => {
    const taught = new Set(TUTORIAL_STEPS.flatMap(step => step.lessons ?? []))
    expect(LESSONS.filter(lesson => !taught.has(lesson))).toEqual([])
  })

  it('only shows text after the last action', () => {
    const lastAction = lastActionIndex()
    expect(TUTORIAL_STEPS.slice(lastAction + 1).every(step => step.kind === 'info')).toBe(true)
    expect(TUTORIAL_STEPS.filter(step => step.kind === 'do').every(step => step.text.length > 0)).toBe(true)
  })
})
