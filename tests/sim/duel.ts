/* eslint-disable no-console -- report */
import { buildCpuArmy } from '../../src/army-ai'
import { ARMY_BUDGET } from '../../src/unit-classes'
import type { UnitClass } from '../../src/unit-types'
import { Contender, runMatch } from './match'
import { loadMap, mapFiles } from './map-loader'

/**
 * yarn ai:sim — the AI against other AIs on every map, from both sides.
 * SIM_GAMES (env) = games per map and side (default 6).
 */
export const GAMES = Number(process.env.SIM_GAMES ?? 6)

export interface Tally { wins: number, losses: number, draws: number, kept: number, lost: number }

export async function duel(a: Contender, b: Contender): Promise<Tally> {
  const tally: Tally = { wins: 0, losses: 0, draws: 0, kept: 0, lost: 0 }
  for (const file of mapFiles()) {
    const map = loadMap(file)
    for (let game = 0; game < GAMES; game++) {
      // half the games with the map's armies, half with random CPU armies
      let armies: [UnitClass[] | null, UnitClass[] | null] | undefined
      if (game % 2 === 1) {
        const classic = (team: number) => map.spawns.filter(s => s.team === team).map(s => s.unitClass)
        armies = [buildCpuArmy(classic(0), ARMY_BUDGET), buildCpuArmy(classic(1), ARMY_BUDGET)]
      }
      for (const side of [0, 1] as const) {
        const pair: [Contender, Contender] = side === 0 ? [a, b] : [b, a]
        const sideArmies = armies && side === 1 ? [armies[1], armies[0]] as typeof armies : armies
        const result = await runMatch(map, pair, sideArmies)
        const mine = result.survivors[side]
        const theirs = result.survivors[1 - side]
        tally.kept += mine
        tally.lost += theirs
        if (result.winner === null) tally.draws++
        else if (result.winner === side) tally.wins++
        else tally.losses++
      }
    }
  }
  return tally
}

export function report(a: Contender, b: Contender, t: Tally) {
  const games = t.wins + t.losses + t.draws
  console.log(`${a.label.padEnd(22)} vs ${b.label.padEnd(10)} ${games} games: ${t.wins} W / ${t.losses} L / ${t.draws} D` +
    ` (win ${Math.round(t.wins / games * 100)}%) · units left per game ${(t.kept / games).toFixed(1)} vs ${(t.lost / games).toFixed(1)}`)
}
