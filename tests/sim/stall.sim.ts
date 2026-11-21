/* eslint-disable no-console -- report */
import { test } from 'vitest'
import { Unit } from '../../src/unit'
import { Player } from '../../src/player'
import { buildCpuArmy } from '../../src/army-ai'
import { ARMY_BUDGET } from '../../src/unit-classes'
import type { UnitClass } from '../../src/unit-types'
import { Contender, newAi, runMatch } from './match'
import { GAMES } from './duel'
import { loadMap, mapFiles } from './map-loader'

/**
 * yarn ai:stall — CPU x CPU of the same level: how often matches stall.
 * Draws, phases, attack-less streaks, unit turns ended on/next to a door,
 * unit turns ended on ice, and the endgame (a side with 1-2 units left): phases until it ends.
 */

interface Stats {
  games: number, draws: number, phases: number, longestQuiet: number,
  doorTurns: number, nearDoorTurns: number, iceTurns: number, unitTurns: number,
  endgamePhases: number, endgameAttacks: number, endgames: number, endgameDraws: number
}

async function measure(a: Contender, b: Contender): Promise<Stats> {
  const s: Stats = { games: 0, draws: 0, phases: 0, longestQuiet: 0, doorTurns: 0, nearDoorTurns: 0, iceTurns: 0, unitTurns: 0, endgamePhases: 0, endgameAttacks: 0, endgames: 0, endgameDraws: 0 }
  let attacks = 0
  const original = Unit.prototype.attackInstant
  Unit.prototype.attackInstant = function (this: Unit, target: Unit) { attacks++; return original.call(this, target) }
  const originalEnd = Player.prototype.turnEnd
  let quiet = 0
  let inEndgame = false
  Player.prototype.turnEnd = async function (this: Player) {
    const units = this.board.getUnits()
    const mine = units.filter(u => u.player === this)
    for (const u of mine) {
      s.unitTurns++
      if (u.cell!.pathNode.isIce) s.iceTurns++
      if (u.cell!.pathNode.isDoor) s.doorTurns++
      else if (u.cell!.pathNode.connections.some(n => n.isDoor)) s.nearDoorTurns++
    }
    const counts = new Map<Player, number>()
    for (const u of units) counts.set(u.player, (counts.get(u.player) ?? 0) + 1)
    const endgame = counts.size === 2 && [...counts.values()].some(c => c <= 2)
    if (endgame) {
      if (!inEndgame) s.endgames++
      inEndgame = true
      s.endgamePhases++
      if (attacks > 0) s.endgameAttacks++
    }
    quiet = attacks > 0 ? 0 : quiet + 1
    s.longestQuiet = Math.max(s.longestQuiet, quiet)
    attacks = 0
    return originalEnd.call(this)
  }
  try {
    for (const file of mapFiles()) {
      const map = loadMap(file)
      for (let game = 0; game < GAMES; game++) {
        let armies: [UnitClass[] | null, UnitClass[] | null] | undefined
        if (game % 2 === 1) {
          const classic = (team: number) => map.spawns.filter(sp => sp.team === team).map(sp => sp.unitClass)
          armies = [buildCpuArmy(classic(0), ARMY_BUDGET), buildCpuArmy(classic(1), ARMY_BUDGET)]
        }
        for (const side of [0, 1]) {
          inEndgame = false
          quiet = 0
          const result = await runMatch(map, side === 0 ? [a, b] : [b, a], armies)
          s.games++
          s.phases += result.phases
          if (result.winner === null) {
            s.draws++
            if (inEndgame) s.endgameDraws++
            if (process.env.SIM_VERBOSE) console.log(`  draw ${file}: ${result.left.join(' ')}`)
          }
        }
      }
    }
  } finally {
    Unit.prototype.attackInstant = original
    Player.prototype.turnEnd = originalEnd
  }
  return s
}

const pct = (n: number, d: number) => `${Math.round(n / Math.max(1, d) * 100)}%`

test('matches between CPUs of the same level', async () => {
  const runs: [Contender, Contender][] = [
    [newAi('normal'), newAi('normal')],
    [newAi('hard'), newAi('hard')],
    [newAi('normal', 'defensive'), newAi('normal', 'aggressive')]
  ]
  for (const [a, b] of runs) {
    const s = await measure(a, b)
    console.log(`${a.label} x ${b.label}: ${s.games} games, draws ${pct(s.draws, s.games)}, ${(s.phases / s.games).toFixed(0)} phases/game,` +
      ` longest quiet streak ${s.longestQuiet}, door ${pct(s.doorTurns, s.unitTurns)} / next to door ${pct(s.nearDoorTurns, s.unitTurns)} of unit turns, ice ${pct(s.iceTurns, s.unitTurns)},` +
      ` endgame ${(s.endgamePhases / Math.max(1, s.endgames)).toFixed(0)} phases (attacks in ${pct(s.endgameAttacks, s.endgamePhases)}), endgame draws ${s.endgameDraws}`)
  }
})
