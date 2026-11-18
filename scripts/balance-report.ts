/* eslint-disable no-console -- command line report */
// yarn balance: class costs from the combat math (src/balance.ts), with and
// without the counterattack/forest rules, next to the costs in CLASS_INFO
import { classPower, computeCosts } from '../src/balance'
import { CLASS_INFO } from '../src/unit-classes'
import { UNIT_CLASSES } from '../src/unit-types'

const old = computeCosts({ counterattack: false, forest: false })
const now = computeCosts()
const orig = UNIT_CLASSES.slice(0, 8)
console.log('class        listed  old-rules  new-rules  power')
for (const c of UNIT_CLASSES) {
  console.log(c.padEnd(12), String(CLASS_INFO[c].cost).padStart(6), String(old[c]).padStart(10), String(now[c]).padStart(10), classPower(c).power.toFixed(2).padStart(7))
}
const total = (costs: Record<string, number>) => orig.reduce((s, c) => s + costs[c], 0)
console.log('originals total: old', total(old), 'new', total(now))
const powers = UNIT_CLASSES.map(c => classPower(c).power)
const avg = orig.reduce((s, c) => s + classPower(c).power, 0) / 8
console.log('relative power range:', (Math.min(...powers) / avg).toFixed(2), '-', (Math.max(...powers) / avg).toFixed(2))
