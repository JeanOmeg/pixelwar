import { describe, expect, it } from 'vitest'
import {
  authorityToken, canStart, createRoom, endMatch, joinRoomState, kick, listingOf, memberGone,
  publicRoom, requestRematch, seatOfToken, setMap, setReady, startMatch, type JoinResult
} from '../src/online/room'
import { MAX_SPECTATORS, PROTOCOL_VERSION, cleanName, normalizeRoomCode, newRoomCode, type RoomState } from '../src/online/protocol'
import { LocalTransport } from '../src/online/transport'
import type { UnitClass } from '../src/unit-types'

const owner = { peerId: 'p-owner', name: 'Jean', token: 't-owner' }
const hello = (token: string, intent: 'play' | 'watch' = 'play', name = token) => ({ version: PROTOCOL_VERSION, name, token, intent })
const army: UnitClass[] = ['Warrior', 'Archer', 'Mage', 'Cleric']

function joined(result: JoinResult): RoomState {
  if ('reject' in result) throw new Error(`rejected: ${result.reject}`)
  return result.room
}

function lobbyWithGuest(): RoomState {
  return joined(joinRoomState(createRoom('ABCDE', owner, 'map_1', false), hello('t-guest'), 'p-guest'))
}

function readyRoom(): RoomState {
  let room = lobbyWithGuest()
  room = setReady(room, 't-owner', true, army, 4)
  room = setReady(room, 't-guest', true, army, 4)
  return room
}

describe('room codes and names', () => {
  it('generates codes the player can type back', () => {
    for (let i = 0; i < 50; i++) {
      const code = newRoomCode()
      expect(normalizeRoomCode(code.toLowerCase())).toBe(code)
    }
  })

  it('rejects codes with confusing or missing characters', () => {
    expect(normalizeRoomCode('ABC0E')).toBeNull()
    expect(normalizeRoomCode('ABCD')).toBeNull()
    expect(normalizeRoomCode(' k7q-mx ')).toBe('K7QMX')
  })

  it('cleans names', () => {
    expect(cleanName('  Jean   Fernandes  ')).toBe('Jean Fernandes')
    expect(cleanName('a'.repeat(30))).toHaveLength(16)
    expect(cleanName('   ')).toBe('')
  })
})

describe('joining a room', () => {
  it('seats the owner on Blue and the first player on Red', () => {
    const room = lobbyWithGuest()
    expect(seatOfToken(room, 't-owner')).toBe(0)
    expect(seatOfToken(room, 't-guest')).toBe(1)
  })

  it('sends a third player to watch', () => {
    const result = joinRoomState(lobbyWithGuest(), hello('t-late'), 'p-late')
    expect(result).toMatchObject({ role: 'spectator', downgraded: true })
  })

  it('refuses other versions, kicked players and a full room', () => {
    const room = lobbyWithGuest()
    expect(joinRoomState(room, { ...hello('x'), version: PROTOCOL_VERSION + 1 }, 'p-x')).toEqual({ reject: 'version' })
    expect(joinRoomState(kick(room, 't-guest'), hello('t-guest'), 'p-guest2')).toEqual({ reject: 'kicked' })

    let full = room
    for (let i = 0; i < MAX_SPECTATORS; i++) full = joined(joinRoomState(full, hello(`s${i}`, 'watch'), `ps${i}`))
    expect(joinRoomState(full, hello('one-more', 'watch'), 'p-more')).toEqual({ reject: 'full' })
  })

  it('gives a player the seat back after a reload, mid-match', () => {
    let room = startMatch(readyRoom())
    room = memberGone(room, 'p-guest')
    expect(room.seats[1]?.connected).toBe(false)
    const result = joinRoomState(room, hello('t-guest', 'play', 'Guest'), 'p-guest-new')
    expect(result).toMatchObject({ role: 'seat', seat: 1, rejoined: true })
    expect(joined(result).seats[1]).toMatchObject({ connected: true, peerId: 'p-guest-new' })
  })

  it('frees a lobby seat when the player leaves', () => {
    let room = setReady(lobbyWithGuest(), 't-owner', true, army, 4)
    room = memberGone(room, 'p-guest')
    expect(room.seats[1]).toBeNull()
    // the owner must confirm again against whoever comes next
    expect(room.seats[0]?.ready).toBe(false)
  })

  it('lets the other player run the room while the owner is away', () => {
    let room = startMatch(readyRoom())
    expect(authorityToken(room)).toBe('t-owner')
    room = memberGone(room, 'p-owner')
    expect(authorityToken(room)).toBe('t-guest')
  })
})

describe('lobby', () => {
  it('starts only when both are ready with a valid army', () => {
    let room = lobbyWithGuest()
    room = setReady(room, 't-owner', true, army, 4)
    expect(canStart(room)).toBe(false)
    // wrong slot count and over budget are ignored
    expect(setReady(room, 't-guest', true, ['Warrior'], 4).seats[1]?.ready).toBe(false)
    expect(setReady(room, 't-guest', true, ['Warrior', 'Warrior', 'Warrior', 'Warrior', 'Warrior'], 5).seats[1]?.ready).toBe(false)
    room = setReady(room, 't-guest', true, army, 4)
    expect(canStart(room)).toBe(true)
    expect(startMatch(room).phase).toBe('match')
  })

  it('hides the armies until the match starts', () => {
    const room = readyRoom()
    expect(publicRoom(room).seats.map(s => s?.army)).toEqual([null, null])
    expect(publicRoom(startMatch(room)).seats.map(s => s?.army)).toEqual([army, army])
  })

  it('keeps a well-formed placement and hides it until the match starts', () => {
    const placement: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 0]]
    let room = setReady(lobbyWithGuest(), 't-owner', true, army, 4, placement)
    room = setReady(room, 't-guest', true, army, 4, [[0, 0], [0, 0], [1, 1], [2, 2]]) // repeated cell: dropped
    expect(room.seats.map(s => s?.placement)).toEqual([placement, null])
    expect(canStart(room)).toBe(true)
    expect(publicRoom(room).seats[0]?.placement).toBeNull()
    expect(publicRoom(startMatch(room)).seats[0]?.placement).toEqual(placement)
    expect(setMap(room, 'map_2').seats[0]?.placement).toBeNull()
  })

  it('unchecks both players when the map changes', () => {
    const room = setMap(readyRoom(), 'map_2')
    expect(room.seats.map(s => s?.ready)).toEqual([false, false])
  })

  it('lists open seats', () => {
    expect(listingOf(createRoom('ABCDE', owner, 'map_1', false), 1)).toMatchObject({ seatOpen: true, owner: 'Jean' })
    expect(listingOf(lobbyWithGuest(), 1).seatOpen).toBe(false)
  })
})

describe('rematch', () => {
  it('waits for both players, then swaps colors', () => {
    let room = endMatch(startMatch(readyRoom()))
    room = requestRematch(room, 't-owner')
    expect(room.phase).toBe('over')
    room = requestRematch(room, 't-guest')
    expect(room.phase).toBe('lobby')
    expect(room.matchNo).toBe(1)
    expect(seatOfToken(room, 't-owner')).toBe(1)
    expect(seatOfToken(room, 't-guest')).toBe(0)
    expect(room.seats.map(s => s?.ready)).toEqual([false, false])
  })
})

describe('LocalTransport', () => {
  it('connects peers and delivers messages, to all or to one', async () => {
    const a = new LocalTransport<string>('test-room')
    const b = new LocalTransport<string>('test-room')
    const c = new LocalTransport<string>('test-room')
    const got: Record<string, string[]> = { b: [], c: [] }
    b.onMessage(m => got.b.push(m))
    c.onMessage(m => got.c.push(m))
    await new Promise(r => setTimeout(r, 30))

    a.send('hi all')
    a.send('only b', b.selfId)
    await new Promise(r => setTimeout(r, 30))
    expect(got.b).toEqual(['hi all', 'only b'])
    expect(got.c).toEqual(['hi all'])

    const left: string[] = []
    a.onPeerLeave(id => left.push(id))
    c.close()
    await new Promise(r => setTimeout(r, 30))
    expect(left).toEqual([c.selfId])
    a.close()
    b.close()
  })

  it('never connects two passive peers', async () => {
    const viewerA = new LocalTransport<string>('test-hall', { passive: true })
    const viewerB = new LocalTransport<string>('test-hall', { passive: true })
    const host = new LocalTransport<string>('test-hall')
    const joinedA: string[] = []
    viewerA.onPeerJoin(id => joinedA.push(id))
    await new Promise(r => setTimeout(r, 30))
    expect(joinedA).toEqual([host.selfId])
    expect(joinedA).not.toContain(viewerB.selfId)
    viewerA.close()
    viewerB.close()
    host.close()
  })
})
