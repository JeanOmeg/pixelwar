import type { Board } from '../board'
import type { Cell } from '../cell'
import type { Player } from '../player'
import type { Unit } from '../unit'
import type { PathNodeComponent } from '../path-finding/path-node-component'
import { AttackContext, Facing, PLAIN_ATTACK, facingBetween, forecastAttack } from '../combat'
import { getTerrainRules } from '../path-finding/terrain-rules'
import {
  CLASS_SKILL, FIREBALL_SPLASH, FRENZY_ATK, FRENZY_DEF, MP_PER_CRITICAL, MP_PER_KILL, SKILLS, STEAL_MP, SkillId, skillBonusDamage
} from '../skills'
import { CLASS_INFO } from '../unit-classes'
import { unitClassOf } from '../unit-types'
import { ArmyRole, roleOf } from '../army-ai'
import { AI_WEIGHTS, AiWeights, DIFFICULTIES, Difficulty, PERSONALITIES, Personality, VALUE_PER_POINT } from './weights'
import { ThreatMap, defenseAt } from './threat'

/**
 * Turn planning for one unit. A plan is the whole turn: where to end up
 * (walking or running), whether to attack, from where and with which skill,
 * and in which order (move then attack, or attack then step away).
 * Every plan gets one score in value points (see weights.ts). Planning
 * doesn't change the game; ComputerPlayer (or the simulation) executes it.
 */

export interface PlannedAttack {
  target: Unit
  /** Skill used right before the attack (attack skill, Special or Frenzy) */
  skill: SkillId | null
  /** attack-first: hit from where it stands, then move ("hit and run") */
  order: 'move-first' | 'attack-first'
}

export interface AiPlan {
  unit: Unit
  /** Path to the destination; [start] (or []) when staying */
  path: PathNodeComponent[]
  dest: PathNodeComponent
  run: boolean
  attack: PlannedAttack | null
  score: number
  /** Score parts, for the debug log */
  parts: Record<string, number>
}

export interface AiContext {
  board: Board
  player: Player
  threat: ThreatMap
  weights: AiWeights
  difficulty: Difficulty
  personality: Personality
  random: () => number
  /** Own units that haven't acted yet this turn */
  waiting: Unit[]
  /**
   * > 1 when ahead (or the match drags on): fear less, close in more.
   * From the value of each army's living units and the round number.
   */
  aggression: number
}

export function makeContext(board: Board, player: Player, opts: { difficulty?: Difficulty, personality?: Personality, random?: () => number, waiting?: Unit[], round?: number, weights?: Partial<AiWeights> } = {}): AiContext {
  const difficulty = opts.difficulty ?? 'normal'
  return {
    aggression: aggressionOf(board, player, opts.round ?? 1),
    board,
    player,
    threat: new ThreatMap(board, player, DIFFICULTIES[difficulty].enemyRun),
    weights: { ...AI_WEIGHTS, ...DIFFICULTIES[difficulty].weights, ...opts.weights },
    difficulty,
    personality: opts.personality ?? 'balanced',
    random: opts.random ?? Math.random,
    waiting: opts.waiting ?? []
  }
}

/**
 * Ahead in army value (HP-weighted) → more aggressive, behind → more careful;
 * and more aggressive every round so matches don't stall into draws.
 * Last stand: with only 1-2 units left and behind, running away only delays
 * the defeat (or drags the match into a draw), so it fights instead.
 */
export function aggressionOf(board: Board, player: Player, round: number): number {
  let own = 0
  let enemy = 0
  let ownUnits = 0
  for (const unit of board.getUnits()) {
    const value = unitValue(unit) * (0.5 + 0.5 * unit.health / unit.unitConfig.health)
    if (unit.player === player) { own += value; ownUnits++ } else enemy += value
  }
  let balance = enemy > 0 ? Math.min(2, Math.max(BEHIND_AGGRESSION, own / enemy)) : 2
  if (ownUnits <= LAST_STAND_UNITS && own < enemy) balance = LAST_STAND_AGGRESSION
  return balance * (1 + Math.max(0, round - AGGRESSION_FROM_ROUND) / AGGRESSION_ROUNDS)
}

/** Lowest aggression when behind (fear x2 at 0.5) */
const BEHIND_AGGRESSION = 0.7
/** Units left at which the losing side stops running */
const LAST_STAND_UNITS = 2
const LAST_STAND_AGGRESSION = 1.3
/** From this round on aggression grows by 1 every AGGRESSION_ROUNDS rounds */
const AGGRESSION_FROM_ROUND = 6
const AGGRESSION_ROUNDS = 10

/** Value of a unit in score points: its army cost x VALUE_PER_POINT */
export function unitValue(unit: Unit): number {
  return CLASS_INFO[unitClassOf(unit.name)].cost * VALUE_PER_POINT
}

/** How much each role fears getting hit */
const ROLE_THREAT: Record<ArmyRole, number> = { ranged: 1.3, reach: 1, skirmisher: 1, melee: 0.9, heavy: 0.75 }

/**
 * Tiles from which `unit` could attack some enemy, by the real attack rules
 * (straight lines, range cost of the terrain, walls and doors block, enemies
 * block the line). Allies are ignored: they will move. The reverse of
 * PathFinder.getRangeAttack, walked outward from each enemy.
 */
function attackPositions(board: Board, unit: Unit): PathNodeComponent[] {
  const rules = getTerrainRules(unit.name)
  const range = unit.unitConfig.range
  const own = unit.cell?.pathNode
  const isEnemy = (node: PathNodeComponent) => node.isOccupied && node !== own && !(node.walkableMask & unit.player.mask)
  const result = new Set<PathNodeComponent>()
  for (const enemy of board.getUnits()) {
    if (enemy.player === unit.player || !enemy.cell) continue
    const target = enemy.cell.pathNode
    if (!target.isAttackable || target.isDoor) continue
    for (const first of target.connections) {
      const dx = first.x - target.x
      const dy = first.y - target.y
      // range spent from a tile on this line to the target (the target's tile included)
      let spent = board.pathFinder.attackCost(target, rules)
      let node: PathNodeComponent | undefined = first
      while (node && spent <= range) {
        if (node.isWalkable && !node.isDoor && !isEnemy(node)) result.add(node)
        if (!node.isAttackable || node.isDoor || isEnemy(node)) break
        spent += board.pathFinder.attackCost(node, rules)
        const current: PathNodeComponent = node
        node = current.connections.find(c => c.x === current.x + dx && c.y === current.y + dy)
      }
    }
  }
  return [...result]
}

/**
 * Path cost (movement points, by this unit's terrain rules) from every tile
 * to the nearest tile it can attack an enemy from (0 there). Walls, water and
 * enemies block the way; allies don't. Without this, a unit "next to" an enemy
 * on the other side of a door thought it was there and never went around.
 * Tiles that can't reach any attack spot (enemy walled in) fall back to the
 * plain distance to the enemies, a bit worse, so units still close in.
 */
export function distanceToEnemies(board: Board, unit: Unit): Map<PathNodeComponent, number> {
  const rules = getTerrainRules(unit.name)
  const own = unit.cell?.pathNode
  const blocked = (node: PathNodeComponent) => !node.isWalkable || (node.isOccupied && node !== own && !(node.walkableMask & unit.player.mask))
  const dist = reverseDijkstra(board, attackPositions(board, unit), blocked, rules)

  const enemyCells = board.getUnits().filter(u => u.player !== unit.player && u.cell).map(u => u.cell!.pathNode)
  const plain = reverseDijkstra(board, enemyCells, node => !node.isWalkable, rules)
  for (const [node, cost] of plain) {
    if (!dist.has(node)) dist.set(node, cost + FALLBACK_EXTRA)
  }
  return dist
}

/** Extra distance of tiles that can't reach any attack spot */
const FALLBACK_EXTRA = 6

/** Cost of walking from each tile to the nearest source (sources are 0) */
function reverseDijkstra(board: Board, sources: PathNodeComponent[], blocked: (node: PathNodeComponent) => boolean, rules: ReturnType<typeof getTerrainRules>): Map<PathNodeComponent, number> {
  const dist = new Map<PathNodeComponent, number>()
  const queue: [PathNodeComponent, number][] = []
  for (const node of sources) {
    dist.set(node, 0)
    queue.push([node, 0])
  }
  // small grid: a sorted array is enough as a priority queue
  while (queue.length > 0) {
    queue.sort((a, b) => b[1] - a[1])
    const [node, cost] = queue.pop()!
    if (cost > (dist.get(node) ?? Infinity)) continue
    // sources may be enemy tiles (fallback): walking out of them is free
    const step = blocked(node) ? 0 : board.pathFinder.movementCost(node, rules)
    for (const next of node.connections) {
      if (blocked(next)) continue
      // stepping from `next` into `node`
      const total = cost + step
      if (total < (dist.get(next) ?? Infinity)) {
        dist.set(next, total)
        queue.push([next, total])
      }
    }
  }
  return dist
}

/** A skill the unit has, can afford and hasn't been blocked by another skill this turn */
function canAfford(unit: Unit, id: SkillId, extraMp = 0): boolean {
  return unit.hasSkill(id) && !unit.usedSkill && unit.mp >= SKILLS[id].cost + extraMp
}

/** Skills worth trying before an attack */
function attackSkillOptions(unit: Unit, ctx: AiContext): (SkillId | null)[] {
  const options: (SkillId | null)[] = [null]
  const chance = DIFFICULTIES[ctx.difficulty].skillChance
  const own = CLASS_SKILL[unitClassOf(unit.name)]
  for (const id of ['skill-special-attack', own] as SkillId[]) {
    const kind = SKILLS[id].kind
    if ((kind === 'attack' || id === 'skill-frenzy') && canAfford(unit, id) && ctx.random() < chance) options.push(id)
  }
  return options
}

/**
 * Score of attacking `target` from `from` with `skill`: chance to kill x its
 * value, otherwise the share of its HP removed x its value, plus skill side
 * effects, minus the counterattack the attacker would take and the MP spent.
 */
export function scoreAttack(unit: Unit, target: Unit, from: PathNodeComponent, skill: SkillId | null, ctx: AiContext): { score: number, parts: Record<string, number> } {
  const w = ctx.weights
  const personality = PERSONALITIES[ctx.personality]
  const targetCell = target.cell!.pathNode
  const frenzy = skill === 'skill-frenzy'
  const attackStats = {
    attack: unit.unitConfig.attack + unit.attackBonus + (frenzy ? FRENZY_ATK : 0),
    defense: defenseAt(unit, from) + (frenzy ? FRENZY_DEF : 0)
  }
  const context: AttackContext = {
    forcesCritical: skill === 'skill-special-attack',
    backAttack: facingBetween(from, targetCell) === target.miniDirection || skill === 'skill-backstab',
    guaranteedHit: skill === 'skill-aimed-shot',
    ignoreDefense: skill === 'skill-pierce',
    bonusDamage: skillBonusDamage(skill)
  }
  const value = unitValue(target)
  const selfValue = unitValue(unit)
  // Fireball burns the target after the strike: it dies to strike + burn
  const burn = skill === 'skill-fireball' ? FIREBALL_SPLASH : 0
  const f = forecastAttack(attackStats, target.combatStats(), context, target.health - burn)
  const kill = f.killChance
  const parts: Record<string, number> = {}

  parts.kill = kill * (value + w.killBonus)
  parts.damage = (1 - kill) * Math.min(f.expectedDamage + burn, target.health) / target.unitConfig.health * value * w.damageShare * personality.damage
  if (context.backAttack && roleOf(unitClassOf(unit.name)) === 'skirmisher') parts.back = value * w.skirmisherBackShare

  if (kill < 1 && target.canCounterFrom(from, context)) {
    const counter = forecastAttack(target.combatStats(), attackStats, PLAIN_ATTACK, unit.health)
    parts.counter = -(1 - kill) * w.counterShare * (
      Math.min(counter.expectedDamage, unit.health) / unit.unitConfig.health * selfValue * w.harmShare +
      counter.killChance * selfValue * w.deathShare
    )
  }

  switch (skill) {
  case 'skill-fireball': {
    let splash = 0
    for (const cell of target.cell!.getNeighbors()) {
      const near = cell.unit
      if (!near || near.player === unit.player) continue
      splash += near.health <= FIREBALL_SPLASH
        ? unitValue(near) + w.killBonus
        : FIREBALL_SPLASH / near.unitConfig.health * unitValue(near) * w.damageShare
    }
    parts.skill = splash
    break
  }
  case 'skill-steal': parts.skill = f.hitChance * Math.min(STEAL_MP, target.mp) * w.mp * 1.5; break
  case 'skill-drain': parts.skill = f.hitChance * Math.min(f.expectedDamage, unit.unitConfig.health - unit.health) / unit.unitConfig.health * selfValue * w.harmShare; break
  case 'skill-pinning-shot': parts.skill = (1 - kill) * f.hitChance * value * w.pinShare; break
  }
  if (skill) parts.mp = -SKILLS[skill].cost * w.mp
  // kills and critical hits give MP back (up to the starting MP; Special's forced critical gives none)
  const room = unit.unitConfig.mp - (unit.mp - (skill ? SKILLS[skill].cost : 0))
  const regain = Math.min(room, kill * MP_PER_KILL + (context.forcesCritical ? 0 : f.critChance) * MP_PER_CRITICAL)
  if (regain > 0) parts.mpGain = regain * w.mp

  return { score: Object.values(parts).reduce((a, b) => a + b, 0), parts }
}

/**
 * Score of ending the turn on `node` facing `facing`: the damage and death
 * risk of the enemy's next turn (threat map), how far it is from where it
 * wants to be, and some team play (line of fire, healer and tank spots).
 */
export function scorePosition(unit: Unit, node: PathNodeComponent, facing: Facing, ctx: AiContext, distances: Map<PathNodeComponent, number>): Record<string, number> {
  const w = ctx.weights
  const personality = PERSONALITIES[ctx.personality]
  const role = roleOf(unitClassOf(unit.name))
  const selfValue = unitValue(unit)
  const parts: Record<string, number> = {}

  const harm = ctx.threat.harmAt(unit, node, facing)
  if (harm.attackers > 0) {
    const scale = DIFFICULTIES[ctx.difficulty].threatScale * personality.threat * ROLE_THREAT[role] / ctx.aggression
    parts.threat = -scale * (
      Math.min(harm.expected, unit.health) / unit.unitConfig.health * selfValue * w.harmShare * w.threatShare +
      harm.death * selfValue * w.deathShare * w.threatShare
    )
  }

  const distance = distances.get(node) ?? w.approachCap
  parts.approach = -w.approach * personality.approach * ctx.aggression * Math.min(w.approachCap, distance)

  if (blocksAllyFire(unit, node, ctx)) parts.block = -w.blockAlly
  if (node.isDoor && node !== unit.cell?.pathNode) parts.door = -w.door * ctx.aggression
  else if (node.isDoor) parts.door = -w.door * ctx.aggression * 1.5

  const cell = ctx.board.getCell(node.x, node.y)!
  const neighbours = cell.getNeighbors().map(c => c.unit).filter((u): u is Unit => !!u && u !== unit && u.player === unit.player)
  if (unit.hasSkill('skill-heal')) {
    parts.support = neighbours.filter(u => u.health < u.unitConfig.health).length * w.nearHurtAlly
  } else if (role === 'heavy' || unit.hasSkill('skill-shield-wall')) {
    parts.support = neighbours.filter(u => roleOf(unitClassOf(u.name)) === 'ranged').length * w.guardAlly
  }
  return parts
}

/** `node` is on the straight line between an allied ranged unit (still to act) and an enemy it can hit */
function blocksAllyFire(unit: Unit, node: PathNodeComponent, ctx: AiContext): boolean {
  for (const ally of ctx.waiting) {
    if (ally === unit || !ally.cell || ally.unitConfig.range <= 1 || ally.attacked) continue
    const origin = ally.cell.pathNode
    if (origin.x !== node.x && origin.y !== node.y) continue
    // the ally's targets once this unit has left its tile
    const targets = ctx.board.pathFinder.getRangeAttack(origin, ~ally.player.mask, ally.unitConfig.range, ally.name, unit.cell?.pathNode)
      .filter(n => { const u = ctx.board.getCell(n.x, n.y)?.unit; return !!u && u.player !== unit.player })
    for (const t of targets) {
      const between = origin.x === node.x && t.x === node.x
        ? (node.y - origin.y) * (node.y - t.y) < 0
        : origin.y === node.y && t.y === node.y && (node.x - origin.x) * (node.x - t.x) < 0
      if (between) return true
    }
  }
  return false
}

/** Facing after walking `path` (unchanged when staying) */
function facingAfter(unit: Unit, path: PathNodeComponent[]): Facing {
  return path.length > 1 ? facingBetween(path[path.length - 2], path[path.length - 1]) : unit.miniDirection
}

const sum = (parts: Record<string, number>) => Object.values(parts).reduce((a, b) => a + b, 0)

/** Every plan for `unit` this turn, best first (noise of the difficulty included) */
export function planUnit(unit: Unit, ctx: AiContext): AiPlan[] {
  if (!unit.cell) return []
  const w = ctx.weights
  const board = ctx.board
  const start = unit.cell.pathNode
  const distances = distanceToEnemies(board, unit)
  const plans: AiPlan[] = []

  // where it can end up: stay, walk, or run (only beyond walking range)
  const destinations = new Map<PathNodeComponent, { path: PathNodeComponent[], run: boolean }>()
  destinations.set(start, { path: [start], run: false })
  if (unit.canMove()) {
    const walk = board.pathFinder.getMovementMap(start, unit.player.mask, unit.unitConfig.movement, unit.name)
    for (const node of walk.range) if (node !== start) destinations.set(node, { path: walk.pathTo(node), run: false })
    if (canAfford(unit, 'skill-run') && ctx.random() < DIFFICULTIES[ctx.difficulty].skillChance) {
      const run = board.pathFinder.getMovementMap(start, unit.player.mask, unit.unitConfig.movement * 2, unit.name)
      for (const node of run.range) if (!destinations.has(node)) destinations.set(node, { path: run.pathTo(node), run: true })
    }
  }

  const canAttack = !unit.attacked
  const targetsHere = canAttack ? (unit.getPossibleTargets() ?? []).map(c => c.unit!).filter(Boolean) : []

  for (const [dest, { path, run }] of destinations) {
    const runParts: Record<string, number> = run ? { run: -SKILLS['skill-run'].cost * w.mp } : {}
    const moved = facingAfter(unit, path)
    const position = scorePosition(unit, dest, moved, ctx, distances)

    // just move (or stay)
    plans.push({ unit, path, dest, run, attack: null, parts: { ...position, ...runParts }, score: sum(position) + sum(runParts) })
    if (!canAttack) continue

    // move, then attack from the destination
    const targets = dest === start
      ? targetsHere
      : board.pathFinder.getRangeAttack(dest, ~unit.player.mask, unit.unitConfig.range, unit.name, start)
        .map(node => board.getCell(node.x, node.y)!.unit)
        .filter((u): u is Unit => !!u && u.player !== unit.player)
    if (!dest.isDoor) {
      for (const target of targets) {
        const facing = facingBetween(dest, target.cell!.pathNode)
        const afterAttack = scorePosition(unit, dest, facing, ctx, distances)
        for (const skill of run ? [null] : attackSkillOptions(unit, ctx)) {
          const attack = scoreAttack(unit, target, dest, skill, ctx)
          const parts = { ...afterAttack, ...runParts, ...prefixed(attack.parts) }
          plans.push({ unit, path, dest, run, attack: { target, skill, order: 'move-first' }, parts, score: sum(parts) })
        }
      }
    }

    // attack from where it stands, then step away
    if (dest !== start && !run && !start.isDoor) {
      for (const target of targetsHere) {
        for (const skill of attackSkillOptions(unit, ctx)) {
          const attack = scoreAttack(unit, target, start, skill, ctx)
          const parts = { ...position, ...prefixed(attack.parts) }
          plans.push({ unit, path, dest, run, attack: { target, skill, order: 'attack-first' }, parts, score: sum(parts) })
        }
      }
    }
  }

  const noise = DIFFICULTIES[ctx.difficulty].noise
  for (const plan of plans) plan.score += noise * (ctx.random() * 2 - 1) * (20 + Math.abs(plan.score) / 10)
  return plans.sort((a, b) => b.score - a.score)
}

function prefixed(parts: Record<string, number>): Record<string, number> {
  return Object.fromEntries(Object.entries(parts).map(([k, v]) => [`atk.${k}`, v]))
}

/** Short text of a plan, for the debug log */
export function describePlan(plan: AiPlan): string {
  const where = plan.path.length > 1 ? `${plan.run ? 'run' : 'move'} to ${plan.dest.x},${plan.dest.y}` : 'stay'
  if (!plan.attack) return where
  const hit = `attack ${plan.attack.target.name}${plan.attack.skill ? ` (${SKILLS[plan.attack.skill].name})` : ''}`
  return plan.attack.order === 'attack-first' ? `${hit}, then ${where}` : `${where}, then ${hit}`
}

/** The cell a plan ends on */
export function destCell(plan: AiPlan): Cell {
  return plan.unit.cell!.board.getCell(plan.dest.x, plan.dest.y)!
}
