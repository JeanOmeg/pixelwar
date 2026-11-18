/* eslint-disable no-console -- debug log, only with localStorage.debugAI = '1' */
import type { Board } from '../board'
import type { Player } from '../player'
import type { Unit } from '../unit'
import type { PathNodeComponent } from '../path-finding/path-node-component'
import { CLASS_SKILL } from '../skills'
import { unitClassOf } from '../unit-types'
import { AiWeights, DIFFICULTIES, Difficulty, Personality } from './weights'
import { AiContext, AiPlan, describePlan, makeContext, planUnit } from './planner'

/** How a plan is carried out: animated in the game, instant in the simulation */
export interface AiExecutor {
  move(unit: Unit, path: PathNodeComponent[]): Promise<void>
  attack(unit: Unit, target: Unit): Promise<void>
  /** Pause between units (none in the simulation) */
  pause(): Promise<void>
}

export interface AiSettings {
  difficulty: Difficulty
  personality: Personality
  random?: () => number
  /** Round of the match (the AI gets bolder as it drags on) */
  round?: number
  /** Weight overrides (tuning) */
  weights?: Partial<AiWeights>
}

/** localStorage.debugAI = '1' logs the best plans of each decision */
function debugEnabled(): boolean {
  try { return typeof localStorage !== 'undefined' && localStorage.getItem('debugAI') === '1' } catch { return false }
}

/**
 * One AI turn. At each step every unit that hasn't acted plans its turn, and
 * the one that gains the most from acting now goes (kills first, so damage
 * focuses on targets that can die). The board is re-read after every unit.
 */
export async function playAiTurn(board: Board, player: Player, settings: AiSettings, executor: AiExecutor, cancelled: () => boolean = () => false) {
  const random = settings.random ?? Math.random
  const debug = debugEnabled()
  const acted = new Set<Unit>()

  for (;;) {
    if (cancelled()) return
    const waiting = board.getUnits().filter(u => u.player === player && !acted.has(u) && !u.passed)
    if (waiting.length === 0) return
    const ctx = makeContext(board, player, { ...settings, random, waiting })

    let best: { unit: Unit, plans: AiPlan[], gain: number } | null = null
    for (const unit of waiting) {
      const plans = planUnit(unit, ctx)
      if (plans.length === 0) continue
      const idle = plans.find(p => !p.attack && p.path.length <= 1)?.score ?? plans[plans.length - 1].score
      const gain = plans[0].score - idle
      if (!best || gain > best.gain) best = { unit, plans, gain }
    }
    if (!best) return

    const plan = pickPlan(best.plans, ctx)
    if (debug) logDecision(plan, best.plans)
    await executePlan(plan, executor)
    acted.add(best.unit)
    if (cancelled()) return
    if (best.unit.health > 0 && best.unit.cell) useEndOfTurnSkill(best.unit, makeContext(board, player, { ...settings, random }))
    await best.unit.pass()
    await executor.pause()
  }
}

/** Usually the best plan; on easier levels sometimes a close second or third */
function pickPlan(plans: AiPlan[], ctx: AiContext): AiPlan {
  const { mistakeChance } = DIFFICULTIES[ctx.difficulty]
  if (plans.length > 1 && ctx.random() < mistakeChance) {
    const close = plans.slice(1, 4).filter(p => p.score > plans[0].score - 120)
    if (close.length > 0) return close[Math.floor(ctx.random() * close.length)]
  }
  return plans[0]
}

export async function executePlan(plan: AiPlan, executor: AiExecutor) {
  const unit = plan.unit
  const attack = plan.attack
  const moves = plan.path.length > 1

  const strike = async () => {
    if (!attack || unit.health <= 0 || attack.target.health <= 0 || !attack.target.cell) return
    // the target must still be in range (a counterattack or Fireball may have changed things)
    const inRange = (unit.getPossibleTargets() ?? []).some(cell => cell.unit === attack.target)
    if (!inRange) return
    if (attack.skill) unit.startSkill(attack.skill)
    await executor.attack(unit, attack.target)
    unit.settlePendingSkill()
  }

  if (attack?.order === 'attack-first') {
    await strike()
    if (moves && unit.health > 0 && unit.cell) await executor.move(unit, freshPath(plan))
    return
  }
  if (moves) {
    if (plan.run) unit.startSkill('skill-run')
    await executor.move(unit, plan.path)
    unit.settlePendingSkill()
  }
  await strike()
}

/** The planned path, recomputed if units moved or died since planning */
function freshPath(plan: AiPlan): PathNodeComponent[] {
  const unit = plan.unit
  if (!unit.cell) return []
  const map = unit.cell.board.pathFinder.getMovementMap(unit.cell.pathNode, unit.player.mask, unit.effectiveMovement, unit.name)
  const path = map.pathTo(plan.dest)
  return path.length > 1 ? path : []
}

/**
 * After acting: the class skill that doesn't need an attack. Guard, Brace and
 * Shield Wall when an enemy can hit it next turn; Second Wind and Heal when
 * HP is missing (sooner when threatened).
 */
export function useEndOfTurnSkill(unit: Unit, ctx: AiContext) {
  if (!unit.cell || unit.usedSkill) return
  if (ctx.random() >= DIFFICULTIES[ctx.difficulty].skillChance) return
  const id = CLASS_SKILL[unitClassOf(unit.name)]
  if (!unit.canUseSkill(id)) return
  const threatened = ctx.threat.threatsAt(unit.cell.pathNode).length > 0
  const missing = unit.unitConfig.health - unit.health
  switch (id) {
  case 'skill-guard':
  case 'skill-brace':
    if (threatened) unit.startSkill(id)
    break
  case 'skill-shield-wall': {
    const allies = unit.cell.getNeighbors().filter(c => c.unit?.player === unit.player).length
    if (threatened && (allies > 0 || missing > 0)) unit.startSkill(id)
    break
  }
  case 'skill-second-wind':
    if (missing >= 6 || (threatened && missing >= 4)) unit.startSkill(id)
    break
  case 'skill-heal': {
    // the most hurt one, preferring allies the enemy can reach
    const scored = unit.healTargets().map(target => ({
      target,
      need: (target.unitConfig.health - target.health) + (ctx.threat.threatsAt(target.cell!.pathNode).length > 0 ? 4 : 0)
    })).sort((a, b) => b.need - a.need)
    if (scored[0] && scored[0].need >= 5) unit.useSkillOn(id, scored[0].target)
    break
  }
  }
}

function logDecision(chosen: AiPlan, plans: AiPlan[]) {
  const round = (n: number) => Math.round(n)
  console.groupCollapsed(`[AI] ${chosen.unit.name}: ${describePlan(chosen)} (${round(chosen.score)})`)
  console.table(plans.slice(0, 3).map(plan => ({
    plan: describePlan(plan),
    score: round(plan.score),
    ...Object.fromEntries(Object.entries(plan.parts).map(([k, v]) => [k, round(v)]))
  })))
  console.groupEnd()
}
