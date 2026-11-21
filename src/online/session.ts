import { t } from '../i18n'
import type { UnitClass } from '../unit-types'
import type { Placement } from '../deploy'
import { RoomAnnouncer } from './directory'
import { ActionFeed } from './feed'
import {
  CONNECT_TIMEOUT_SECONDS, EMOTES, EMOTE_COOLDOWN_MS, PROTOCOL_VERSION, RECONNECT_SECONDS, cleanName, newRoomCode, newToken,
  type Emote, type GameAction, type JoinIntent, type Member, type NetMessage, type RejectReason, type RoomState, type Seat
} from './protocol'
import {
  authorityToken, canStart, createRoom, endMatch, joinRoomState, kick, listingOf, memberGone, members, publicRoom,
  requestRematch, seatOfPeer, seatOfToken, setLocked, setMap, setReady, startMatch
} from './room'
import { Emitter, openTransport, type Transport } from './transport'

/**
 * One online room as seen from this browser: the connection, the room state
 * (lobby, seats, spectators) and, during a match, the action history. Lives
 * outside the scenes (menus and match share it) as the active session.
 */

export type SessionStatus = 'connecting' | 'joined' | 'failed' | 'rejected' | 'closed'

/** Saved in sessionStorage so a reload goes back into the same room */
interface SavedSession {
  code: string
  name: string
  token: string
  intent: JoinIntent
  owner: boolean
  at: number
}
const SAVED_KEY = 'pixelfantasywar.online'

function readSaved(): SavedSession | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(SAVED_KEY) ?? 'null') as SavedSession | null
    // too old: the seat is lost anyway
    if (!saved || Date.now() - saved.at > RECONNECT_SECONDS * 1000) return null
    return saved
  } catch {
    return null
  }
}

function writeSaved(saved: SavedSession | null) {
  try {
    if (saved) sessionStorage.setItem(SAVED_KEY, JSON.stringify(saved))
    else sessionStorage.removeItem(SAVED_KEY)
  } catch { /* storage unavailable: no reconnection after a reload */ }
}

let active: OnlineSession | null = null

export function activeSession(): OnlineSession | null {
  return active
}

/** A room this browser was in before a reload (offered on the Online screen) */
export function savedSession(): SavedSession | null {
  return readSaved()
}

export function forgetSavedSession() {
  writeSaved(null)
}

export interface MatchEndInfo {
  /** null = draw */
  winner: Seat | null
  reason: 'forfeit' | 'timeout' | 'abandoned'
}

export class OnlineSession {
  status: SessionStatus = 'connecting'
  rejectReason: RejectReason | null = null
  /** `leave()` was called: nothing may save this room for a reconnection again */
  private left = false
  room: RoomState | null = null
  /** Shown once on the lobby (e.g. both seats were taken: watching instead) */
  notice: string | null = null
  /** History of the current match */
  feed: ActionFeed | null = null
  /** Round the match is in (for the room list) */
  round = 1

  /** Anything about the room changed (redraw the lobby) */
  readonly changed = new Emitter<[]>()
  readonly emotes = new Emitter<[Seat, Emote]>()
  /** A player claims the win (opponent left or stopped responding) */
  readonly matchEnded = new Emitter<[MatchEndInfo]>()
  /** The board summary after `index` actions, from the player who ended that turn */
  readonly turnHash = new Emitter<[number, string]>()

  private transport: Transport<NetMessage> | null = null
  private announcer = new RoomAnnouncer()
  private connectTimer: ReturnType<typeof setTimeout> | null = null
  private lastEmote = 0
  private historyAsked = false

  private constructor(readonly code: string, readonly name: string, readonly token: string, private intent: JoinIntent, readonly isOwner: boolean) {}

  // --- opening ---

  /** New room: this browser is the owner and plays Blue */
  static async create(name: string, mapId: string, locked: boolean): Promise<OnlineSession> {
    const session = new OnlineSession(newRoomCode(), name, newToken(), 'play', true)
    await session.open()
    session.room = createRoom(session.code, { peerId: session.selfId, name, token: session.token }, mapId, locked)
    session.status = 'joined'
    session.stopConnectTimer()
    session.save()
    session.roomChanged()
    return session
  }

  static async join(code: string, name: string, intent: JoinIntent, token = newToken(), owner = false): Promise<OnlineSession> {
    const session = new OnlineSession(code, name, token, intent, owner)
    await session.open()
    return session
  }

  /** Back into the room this browser was in before a reload */
  static async resume(saved: SavedSession): Promise<OnlineSession> {
    return OnlineSession.join(saved.code, saved.name, saved.intent, saved.token, saved.owner)
  }

  private async open() {
    active?.close()
    active = this
    this.transport = await openTransport<NetMessage>(`room-${this.code}`)
    this.transport.onMessage((msg, from) => this.receive(msg, from))
    this.transport.onPeerJoin(peerId => this.peerJoined(peerId))
    this.transport.onPeerLeave(peerId => this.peerLeft(peerId))
    this.connectTimer = setTimeout(() => {
      if (this.status !== 'connecting') return
      this.status = 'failed'
      this.changed.emit()
    }, CONNECT_TIMEOUT_SECONDS * 1000)
  }

  private stopConnectTimer() {
    if (this.connectTimer) clearTimeout(this.connectTimer)
    this.connectTimer = null
  }

  get selfId(): string {
    return this.transport?.selfId ?? ''
  }

  // --- who is who ---

  /** This browser's seat, or null when watching */
  get seat(): Seat | null {
    return this.room ? seatOfToken(this.room, this.token) : null
  }

  get isSpectator(): boolean {
    return this.status === 'joined' && this.seat === null
  }

  /** Room owner (chooses the map, locks, kicks) */
  get ownsRoom(): boolean {
    return !!this.room && this.room.ownerToken === this.token
  }

  private get isAuthority(): boolean {
    return !!this.room && authorityToken(this.room) === this.token
  }

  memberName(seat: Seat): string {
    return this.room?.seats[seat]?.name ?? (seat === 0 ? t().common.blue : t().common.red)
  }

  // --- local actions ---

  setReady(ready: boolean, army: UnitClass[] | null, slots: number, placement: Placement | null = null) {
    if (this.isAuthority) this.apply(room => setReady(room, this.token, ready, army, slots, placement))
    else this.toAuthority({ t: 'ready', ready, army, placement })
  }

  setMap(mapId: string) {
    if (this.ownsRoom) this.apply(room => setMap(room, mapId))
  }

  setLocked(locked: boolean) {
    if (this.ownsRoom) this.apply(room => setLocked(room, locked))
  }

  kick(token: string) {
    if (!this.ownsRoom || !this.room) return
    const target = members(this.room).find(m => m.token === token)
    if (target) this.transport?.send({ t: 'reject', reason: 'kicked' }, target.peerId)
    this.apply(room => kick(room, token))
  }

  requestRematch() {
    if (this.isAuthority) this.apply(room => requestRematch(room, this.token))
    else this.toAuthority({ t: 'rematch' })
  }

  /** The match on this board is over (the authority tells everybody) */
  matchOver() {
    if (this.isAuthority) this.apply(room => endMatch(room))
  }

  /** This player wins because the opponent left or stopped responding */
  claimWin(reason: MatchEndInfo['reason']) {
    const seat = this.seat
    if (seat === null) return
    this.matchEnded.emit({ winner: seat, reason })
    this.broadcast({ t: 'leave' })
  }

  sendEmote(emote: Emote): boolean {
    const seat = this.seat
    if (seat === null || !EMOTES.includes(emote) || Date.now() - this.lastEmote < EMOTE_COOLDOWN_MS) return false
    this.lastEmote = Date.now()
    this.broadcast({ t: 'emote', emote })
    this.emotes.emit(seat, emote)
    return true
  }

  sendTurnHash(index: number, hash: string) {
    if (this.room && this.seat !== null) this.broadcast({ t: 'turn-hash', matchNo: this.room.matchNo, index, hash })
  }

  /** Leaves the room for good: in the lobby the seat frees, in a match it's a forfeit */
  leave() {
    // the room update that answers our `leave` arrives before the connection
    // closes and still lists our seat (as disconnected): it must not save the
    // session again, or the menu would reconnect us to the match we left
    this.left = true
    if (this.ownsRoom && this.room?.phase === 'lobby') this.broadcast({ t: 'close' })
    else this.broadcast({ t: 'leave' })
    writeSaved(null)
    // give the message a moment to go out before closing the connection
    setTimeout(() => this.close(), 300)
  }

  close() {
    if (this.status === 'closed' && !this.transport) return
    this.stopConnectTimer()
    this.status = 'closed'
    this.feed?.close()
    this.announcer.close()
    this.transport?.close()
    this.transport = null
    if (active === this) active = null
    this.changed.emit()
    this.changed.clear()
    this.emotes.clear()
    this.matchEnded.clear()
    this.turnHash.clear()
  }

  // --- network ---

  private broadcast(msg: NetMessage) {
    this.transport?.send(msg)
  }

  private toAuthority(msg: NetMessage) {
    const room = this.room
    const token = room && authorityToken(room)
    const peer = room && members(room).find(m => m.token === token)
    if (peer) this.transport?.send(msg, peer.peerId)
  }

  private hello(): NetMessage {
    return { t: 'hello', version: PROTOCOL_VERSION, name: this.name, token: this.token, intent: this.intent }
  }

  private peerJoined(peerId: string) {
    // say who we are to every new peer; the room's authority answers
    this.transport?.send(this.hello(), peerId)
    if (this.isAuthority && this.room) this.transport?.send({ t: 'room', room: this.viewFor(this.room, peerId) }, peerId)
  }

  private peerLeft(peerId: string) {
    if (!this.room) return
    if (!members(this.room).some(m => m.peerId === peerId)) return
    // everybody updates their copy; the (possibly new) authority sends it out
    this.room = memberGone(this.room, peerId)
    this.roomChanged()
  }

  private senderOf(peerId: string): Member | null {
    return this.room ? members(this.room).find(m => m.peerId === peerId) ?? null : null
  }

  private receive(msg: NetMessage, from: string) {
    if (!msg || typeof msg !== 'object') return
    switch (msg.t) {
    case 'hello': return this.onHello(msg, from)
    case 'room': return this.onRoom(msg.room, from)
    case 'reject':
      if (this.status === 'connecting' || msg.reason === 'kicked') {
        this.status = 'rejected'
        this.rejectReason = msg.reason
        writeSaved(null)
        this.stopConnectTimer()
        this.changed.emit()
      }
      return
    case 'close':
      if (this.room && this.senderOf(from)?.token === this.room.ownerToken) {
        this.status = 'closed'
        this.rejectReason = 'closed'
        writeSaved(null)
        this.changed.emit()
      }
      return
    }

    const sender = this.senderOf(from)
    if (!sender || !this.room) return
    const senderSeat = seatOfPeer(this.room, from)

    switch (msg.t) {
    case 'ready':
      if (this.isAuthority) this.apply(room => setReady(room, sender.token, !!msg.ready, msg.army, msg.army?.length ?? 0, msg.placement ?? null))
      break
    case 'rematch':
      if (this.isAuthority) this.apply(room => requestRematch(room, sender.token))
      break
    case 'leave':
      if (senderSeat !== null && (this.room.phase === 'match')) {
        // the opponent forfeits: the other player wins
        this.matchEnded.emit({ winner: (1 - senderSeat) as Seat, reason: 'forfeit' })
      }
      this.room = memberGone(this.room, from)
      this.roomChanged()
      break
    case 'action':
      if (senderSeat === null || msg.matchNo !== this.room.matchNo || !this.feed) break
      if (!this.feed.receive(msg.index, msg.action)) this.askHistory()
      break
    case 'history-request':
      if (this.feed && msg.matchNo === this.room.matchNo) {
        this.transport?.send({ t: 'history', matchNo: msg.matchNo, actions: this.feed.history }, from)
      }
      break
    case 'history':
      if (this.feed && msg.matchNo === this.room.matchNo && Array.isArray(msg.actions)) {
        this.feed.load(msg.actions as GameAction[])
        this.historyAsked = false
      }
      break
    case 'turn-hash':
      if (senderSeat !== null && msg.matchNo === this.room.matchNo) this.turnHash.emit(msg.index, msg.hash)
      break
    case 'emote':
      if (senderSeat !== null && EMOTES.includes(msg.emote)) this.emotes.emit(senderSeat, msg.emote)
      break
    }
  }

  private onHello(msg: Extract<NetMessage, { t: 'hello' }>, from: string) {
    if (!this.room || !this.isAuthority || typeof msg.token !== 'string') return
    const name = (typeof msg.name === 'string' && cleanName(msg.name)) || 'Player'
    const result = joinRoomState(this.room, { version: msg.version, name, token: msg.token, intent: msg.intent === 'watch' ? 'watch' : 'play' }, from)
    if ('reject' in result) {
      this.transport?.send({ t: 'reject', reason: result.reject }, from)
      return
    }
    this.room = result.room
    this.roomChanged()
  }

  private onRoom(room: RoomState, from: string) {
    if (this.left || !room || typeof room !== 'object' || room.code !== this.code) return
    // only a player's browser speaks for the room (spectators never do)
    const fromSeat = seatOfPeer(room, from) !== null || (this.room && seatOfPeer(this.room, from) !== null)
    if (!fromSeat) return
    const before = this.room
    this.room = room
    if (seatOfToken(room, this.token) === null && !room.spectators.some(s => s.token === this.token)) {
      // not in the room yet (the authority hasn't seen our hello): say it again
      this.transport?.send(this.hello(), from)
      this.changed.emit()
      return
    }
    if (this.status === 'connecting') {
      this.status = 'joined'
      this.stopConnectTimer()
      if (this.intent === 'play' && this.seat === null) this.notice = t().online.bothSeatsTaken
    }
    this.save()
    this.syncMatch(before)
    this.updateListing()
    this.changed.emit()
  }

  /** Applies a room rule (authority only) and sends the result to everybody */
  private apply(change: (room: RoomState) => RoomState) {
    if (!this.room) return
    const next = change(this.room)
    if (next === this.room) return
    this.room = next
    if (canStart(next) && this.isAuthority) this.room = startMatch(next)
    this.roomChanged()
  }

  private roomChanged() {
    const room = this.room
    if (!room) return
    if (this.isAuthority && this.transport) {
      // the armies stay with the authority until the match starts; each player gets their own back
      for (const member of members(room)) {
        if (member.token !== this.token) this.transport.send({ t: 'room', room: this.viewFor(room, member.peerId) }, member.peerId)
      }
    }
    this.syncMatch(null)
    this.updateListing()
    this.changed.emit()
  }

  private viewFor(room: RoomState, peerId: string): RoomState {
    const view = publicRoom(room)
    const seat = seatOfPeer(room, peerId)
    if (seat === null || room.phase !== 'lobby') return view
    const seats: RoomState['seats'] = [...view.seats]
    seats[seat] = room.seats[seat]
    return { ...view, seats }
  }

  /** A new match started (or this browser joined one): fresh history, or ask for it */
  private syncMatch(before: RoomState | null) {
    const room = this.room
    if (!room || room.phase === 'lobby') return
    const newMatch = !this.feed || (before && before.matchNo !== room.matchNo) || this.feedMatch !== room.matchNo
    if (!newMatch) return
    this.feed?.close()
    this.feed = new ActionFeed()
    this.feedMatch = room.matchNo
    this.round = 1
    this.feed.onLocal = (action, index) => this.broadcast({ t: 'action', matchNo: room.matchNo, index, action })
    // joining a match already going (spectator, reconnection): get what happened so far
    this.askHistory()
  }
  private feedMatch = -1

  private askHistory() {
    if (this.historyAsked || !this.room) return
    this.historyAsked = true
    this.broadcast({ t: 'history-request', matchNo: this.room.matchNo })
    // nobody answered (e.g. a brand new match): allow asking again later
    setTimeout(() => { this.historyAsked = false }, 3000)
  }

  /** Open rooms tell the room list about themselves (only the authority does) */
  updateListing() {
    const room = this.room
    if (!room || room.locked || !this.isAuthority || this.status !== 'joined') this.announcer.update(null)
    else this.announcer.update(listingOf(room, this.round))
  }

  private save() {
    if (this.left) return
    writeSaved({ code: this.code, name: this.name, token: this.token, intent: this.seat !== null ? 'play' : 'watch', owner: this.ownsRoom, at: Date.now() })
  }

  /** Keeps the saved session fresh during a long match */
  touch() {
    if (this.status === 'joined') this.save()
  }
}
