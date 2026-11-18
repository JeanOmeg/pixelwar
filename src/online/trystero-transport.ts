import { joinRoom, selfId, type JsonValue, type Room } from 'trystero'
import { APP_ID } from './protocol'
import { Emitter, type Transport, type TransportOptions } from './transport'

/**
 * Real online play: Trystero finds the other browsers through public Nostr
 * relays (only to introduce them) and then every message goes straight from
 * one browser to the other over WebRTC. No server of ours, nothing stored.
 */
export class TrysteroTransport<M> implements Transport<M> {
  readonly selfId = selfId
  private room: Room
  private sendRaw: (data: JsonValue, options?: { target?: string | string[] | null }) => Promise<void>
  private messages = new Emitter<[M, string]>()
  private joins = new Emitter<[string]>()
  private leaves = new Emitter<[string]>()
  private closed = false

  constructor(roomId: string, options: TransportOptions = {}) {
    // public relays come and go (rate limits, downtime): Trystero uses several, no need to warn about each
    this.room = joinRoom({ appId: APP_ID, passive: options.passive, relayConfig: { warnOnRelayFailure: false } }, roomId)
    const action = this.room.makeAction<JsonValue>('m')
    this.sendRaw = action.send
    action.onMessage = (data, context) => {
      if (!this.closed) this.messages.emit(data as unknown as M, context.peerId)
    }
    this.room.onPeerJoin = peerId => { if (!this.closed) this.joins.emit(peerId) }
    this.room.onPeerLeave = peerId => { if (!this.closed) this.leaves.emit(peerId) }
  }

  send(msg: M, to?: string | string[]) {
    if (this.closed) return
    this.sendRaw(msg as unknown as JsonValue, to === undefined ? undefined : { target: to }).catch(() => {
      // the peer left while sending: onPeerLeave tells the game
    })
  }

  onMessage(handler: (msg: M, from: string) => void) { this.messages.on(handler) }
  onPeerJoin(handler: (peerId: string) => void) { this.joins.on(handler) }
  onPeerLeave(handler: (peerId: string) => void) { this.leaves.on(handler) }

  close() {
    if (this.closed) return
    this.closed = true
    this.messages.clear()
    this.joins.clear()
    this.leaves.clear()
    void this.room.leave()
  }
}
