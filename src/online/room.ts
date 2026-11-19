import { UNIT_CLASSES, type UnitClass } from '../unit-types'
import { ARMY_BUDGET, armyCost } from '../unit-classes'
import { isPlacement, type Placement } from '../deploy'
import {
  MAX_SPECTATORS, PROTOCOL_VERSION,
  type JoinIntent, type Member, type RejectReason, type RoomListing, type RoomState, type Seat, type SeatState
} from './protocol'

/**
 * Room rules, as pure functions over RoomState. Only the room's authority
 * (the owner, or the other player while the owner is away) runs them and
 * sends the new state to everybody.
 */

export interface Joiner {
  peerId: string
  name: string
  token: string
}

export type JoinResult =
  | { room: RoomState, role: 'seat', seat: Seat, rejoined: boolean }
  /** `downgraded`: asked to play, but both seats were taken */
  | { room: RoomState, role: 'spectator', downgraded: boolean }
  | { reject: RejectReason }

function seatFor(member: Joiner): SeatState {
  return { ...member, connected: true, ready: false, army: null, placement: null, wantsRematch: false }
}

export function createRoom(code: string, owner: Joiner, mapId: string, locked: boolean): RoomState {
  return {
    code,
    ownerToken: owner.token,
    locked,
    mapId,
    seats: [seatFor(owner), null],
    spectators: [],
    phase: 'lobby',
    matchNo: 0,
    kicked: []
  }
}

function withSeat(room: RoomState, seat: Seat, value: SeatState | null): RoomState {
  const seats: [SeatState | null, SeatState | null] = [...room.seats]
  seats[seat] = value
  return { ...room, seats }
}

export function seatOfToken(room: RoomState, token: string): Seat | null {
  if (room.seats[0]?.token === token) return 0
  if (room.seats[1]?.token === token) return 1
  return null
}

export function seatOfPeer(room: RoomState, peerId: string): Seat | null {
  if (room.seats[0]?.peerId === peerId) return 0
  if (room.seats[1]?.peerId === peerId) return 1
  return null
}

export function ownerSeat(room: RoomState): Seat | null {
  return seatOfToken(room, room.ownerToken)
}

/** Everybody in the room, seats first */
export function members(room: RoomState): Member[] {
  return [...room.seats.filter((s): s is SeatState => !!s), ...room.spectators]
}

/**
 * Who runs the room rules: the owner while connected; otherwise the other
 * player (so spectators and the owner can still get in mid-match).
 */
export function authorityToken(room: RoomState): string | null {
  const owner = ownerSeat(room)
  if (owner !== null && room.seats[owner]?.connected) return room.ownerToken
  const other = room.seats.find(s => s && s.token !== room.ownerToken && s.connected)
  return other?.token ?? null
}

export function joinRoomState(room: RoomState, hello: { version: number, name: string, token: string, intent: JoinIntent }, peerId: string): JoinResult {
  if (hello.version !== PROTOCOL_VERSION) return { reject: 'version' }
  if (room.kicked.includes(hello.token)) return { reject: 'kicked' }
  const joiner: Joiner = { peerId, name: hello.name, token: hello.token }

  // a player coming back (reload, lost connection): same seat
  const seat = seatOfToken(room, hello.token)
  if (seat !== null) {
    const current = room.seats[seat] as SeatState
    return { room: withSeat(room, seat, { ...current, peerId, name: hello.name, connected: true }), role: 'seat', seat, rejoined: true }
  }

  const others = room.spectators.filter(s => s.token !== hello.token)
  if (hello.intent === 'play' && room.phase === 'lobby') {
    const free = room.seats[0] === null ? 0 : room.seats[1] === null ? 1 : null
    if (free !== null) {
      return { room: withSeat({ ...room, spectators: others }, free, seatFor(joiner)), role: 'seat', seat: free, rejoined: false }
    }
  }

  if (others.length >= MAX_SPECTATORS) return { reject: 'full' }
  return {
    room: { ...room, spectators: [...others, { ...joiner, connected: true }] },
    role: 'spectator',
    downgraded: hello.intent === 'play'
  }
}

/**
 * Someone's connection closed, or they left on purpose. In the lobby a player
 * frees the seat; in a match the seat waits for them to come back.
 */
export function memberGone(room: RoomState, peerId: string): RoomState {
  const spectators = room.spectators.filter(s => s.peerId !== peerId)
  let next: RoomState = spectators.length === room.spectators.length ? room : { ...room, spectators }
  const seat = seatOfPeer(next, peerId)
  if (seat === null) return next
  const current = next.seats[seat] as SeatState
  if (next.phase === 'lobby' && current.token !== next.ownerToken) {
    next = withSeat(next, seat, null)
    // the one still there must confirm again against a new opponent
    const other = (1 - seat) as Seat
    const remaining = next.seats[other]
    if (remaining) next = withSeat(next, other, { ...remaining, ready: false })
    return next
  }
  return withSeat(next, seat, { ...current, connected: false })
}

export function isValidArmy(army: unknown, slots: number): army is UnitClass[] {
  return Array.isArray(army) && army.length === slots
    && army.every(c => (UNIT_CLASSES as readonly string[]).includes(c as string))
    && armyCost(army as UnitClass[]) <= ARMY_BUDGET
}

/**
 * The placement is only checked for shape here (the room doesn't load maps);
 * the level drops one outside the deploy zone and uses the map's positions.
 */
export function setReady(room: RoomState, token: string, ready: boolean, army: UnitClass[] | null, slots: number, placement: Placement | null = null): RoomState {
  const seat = seatOfToken(room, token)
  if (seat === null || room.phase !== 'lobby') return room
  if (ready && !isValidArmy(army, slots)) return room
  const current = room.seats[seat] as SeatState
  const placed = ready && isPlacement(placement, slots) ? placement : null
  return withSeat(room, seat, { ...current, ready, army: ready ? army : null, placement: placed })
}

/** Changing the map unchecks both players (the army slots change) */
export function setMap(room: RoomState, mapId: string): RoomState {
  if (room.phase !== 'lobby' || room.mapId === mapId) return room
  let next: RoomState = { ...room, mapId }
  for (const seat of [0, 1] as Seat[]) {
    const s = next.seats[seat]
    if (s) next = withSeat(next, seat, { ...s, ready: false, army: null, placement: null })
  }
  return next
}

export function setLocked(room: RoomState, locked: boolean): RoomState {
  return room.phase === 'lobby' ? { ...room, locked } : room
}

/** Owner removes someone from the lobby; they can't come back */
export function kick(room: RoomState, token: string): RoomState {
  if (room.phase !== 'lobby' || token === room.ownerToken) return room
  const kicked = [...room.kicked, token]
  const spectators = room.spectators.filter(s => s.token !== token)
  const seat = seatOfToken(room, token)
  let next: RoomState = { ...room, kicked, spectators }
  if (seat !== null) next = memberGone(next, (room.seats[seat] as SeatState).peerId)
  return next
}

export function canStart(room: RoomState): boolean {
  return room.phase === 'lobby' && room.seats.every(s => !!s && s.connected && s.ready && !!s.army)
}

export function startMatch(room: RoomState): RoomState {
  if (!canStart(room)) return room
  return { ...room, phase: 'match' }
}

export function endMatch(room: RoomState): RoomState {
  if (room.phase !== 'match') return room
  const seats = room.seats.map(s => s && { ...s, wantsRematch: false }) as [SeatState | null, SeatState | null]
  return { ...room, phase: 'over', seats }
}

/**
 * A player asks for a rematch; when both did, back to the lobby with the
 * colors swapped and both unchecked (they can change their army).
 */
export function requestRematch(room: RoomState, token: string): RoomState {
  const seat = seatOfToken(room, token)
  if (seat === null || room.phase !== 'over') return room
  let next = withSeat(room, seat, { ...(room.seats[seat] as SeatState), wantsRematch: true })
  if (!next.seats.every(s => s?.wantsRematch && s.connected)) return next
  const reset = (s: SeatState | null) => s && { ...s, ready: false, army: null, placement: null, wantsRematch: false }
  next = { ...next, phase: 'lobby', matchNo: next.matchNo + 1, seats: [reset(next.seats[1]), reset(next.seats[0])] }
  return next
}

/** What the others may see: armies and placements stay secret until the match starts */
export function publicRoom(room: RoomState): RoomState {
  if (room.phase !== 'lobby') return room
  const seats = room.seats.map(s => s && { ...s, army: null, placement: null }) as [SeatState | null, SeatState | null]
  return { ...room, seats }
}

export function listingOf(room: RoomState, round: number): RoomListing {
  const owner = room.seats.find(s => s?.token === room.ownerToken)
  return {
    code: room.code,
    owner: owner?.name ?? '?',
    mapId: room.mapId,
    phase: room.phase,
    seatOpen: room.phase === 'lobby' && room.seats.some(s => s === null),
    spectators: room.spectators.length,
    round
  }
}
