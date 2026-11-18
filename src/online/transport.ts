/**
 * The only thing the online code knows about the network: peers in a room
 * that exchange JSON messages. Trystero (WebRTC, trystero-transport.ts) in
 * real play; LocalTransport (BroadcastChannel) between tabs of one browser,
 * for development and tests.
 */
export interface Transport<M> {
  readonly selfId: string
  /** To everybody in the room, or only to `to` */
  send(msg: M, to?: string | string[]): void
  onMessage(handler: (msg: M, from: string) => void): void
  onPeerJoin(handler: (peerId: string) => void): void
  onPeerLeave(handler: (peerId: string) => void): void
  close(): void
}

export interface TransportOptions {
  /**
   * Passive peers only connect to active ones, never to each other (the room
   * list: people browsing it only talk to the rooms, not to every other browser).
   */
  passive?: boolean
}

/** Small typed event list */
export class Emitter<A extends unknown[]> {
  private handlers: ((...args: A) => void)[] = []
  on(handler: (...args: A) => void): () => void {
    this.handlers.push(handler)
    return () => { this.handlers = this.handlers.filter(h => h !== handler) }
  }
  emit(...args: A) {
    for (const handler of [...this.handlers]) handler(...args)
  }
  clear() {
    this.handlers = []
  }
}

type LocalFrame<M> =
  | { k: 'join', from: string, passive: boolean }
  | { k: 'here', from: string, to: string, passive: boolean }
  | { k: 'leave', from: string }
  | { k: 'msg', from: string, to: string[] | null, data: M }

let localIds = 0

/** Tabs of the same browser (and instances in the same test process) as peers */
export class LocalTransport<M> implements Transport<M> {
  readonly selfId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${localIds++}`
  private channel: BroadcastChannel
  private peers = new Set<string>()
  private messages = new Emitter<[M, string]>()
  private joins = new Emitter<[string]>()
  private leaves = new Emitter<[string]>()
  private closed = false
  private readonly passive: boolean
  private onPageHide = () => this.close()

  constructor(roomId: string, options: TransportOptions = {}) {
    this.passive = !!options.passive
    this.channel = new BroadcastChannel(`pfw:${roomId}`)
    this.channel.onmessage = event => this.receive(event.data as LocalFrame<M>)
    this.post({ k: 'join', from: this.selfId, passive: this.passive })
    if (typeof window !== 'undefined') window.addEventListener('pagehide', this.onPageHide)
  }

  private post(frame: LocalFrame<M>) {
    if (!this.closed) this.channel.postMessage(frame)
  }

  private addPeer(id: string) {
    if (this.peers.has(id)) return
    this.peers.add(id)
    this.joins.emit(id)
  }

  private receive(frame: LocalFrame<M>) {
    if (this.closed || frame.from === this.selfId) return
    switch (frame.k) {
    case 'join':
      if (frame.passive && this.passive) return
      this.post({ k: 'here', from: this.selfId, to: frame.from, passive: this.passive })
      this.addPeer(frame.from)
      break
    case 'here':
      if (frame.to !== this.selfId || (frame.passive && this.passive)) return
      this.addPeer(frame.from)
      break
    case 'leave':
      if (this.peers.delete(frame.from)) this.leaves.emit(frame.from)
      break
    case 'msg':
      if (!this.peers.has(frame.from)) return
      if (frame.to && !frame.to.includes(this.selfId)) return
      this.messages.emit(frame.data, frame.from)
      break
    }
  }

  send(msg: M, to?: string | string[]) {
    const targets = to === undefined ? null : Array.isArray(to) ? to : [to]
    this.post({ k: 'msg', from: this.selfId, to: targets, data: msg })
  }

  onMessage(handler: (msg: M, from: string) => void) { this.messages.on(handler) }
  onPeerJoin(handler: (peerId: string) => void) { this.joins.on(handler) }
  onPeerLeave(handler: (peerId: string) => void) { this.leaves.on(handler) }

  close() {
    if (this.closed) return
    this.post({ k: 'leave', from: this.selfId })
    this.closed = true
    this.channel.close()
    this.messages.clear()
    this.joins.clear()
    this.leaves.clear()
    if (typeof window !== 'undefined') window.removeEventListener('pagehide', this.onPageHide)
  }
}

/**
 * Development: `localStorage['pixelfantasywar.localnet'] = '1'` (or `?localnet`
 * in the URL) makes online rooms talk between tabs of this browser only.
 */
export function usesLocalNetwork(): boolean {
  try {
    return localStorage.getItem('pixelfantasywar.localnet') === '1' || new URLSearchParams(location.search).has('localnet')
  } catch {
    return false
  }
}

export async function openTransport<M>(roomId: string, options: TransportOptions = {}): Promise<Transport<M>> {
  if (usesLocalNetwork()) return new LocalTransport<M>(roomId, options)
  // loaded on demand: the game only pulls WebRTC code in when someone goes online
  const { TrysteroTransport } = await import('./trystero-transport')
  return new TrysteroTransport<M>(roomId, options)
}
