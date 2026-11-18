import { PROTOCOL_VERSION, type DirectoryMessage, type RoomListing } from './protocol'
import { Emitter, openTransport, type Transport } from './transport'

/**
 * The public list of open rooms, without a server: open rooms announce
 * themselves in a fixed shared room (the "hall"); the Online screen listens
 * there. People browsing join as passive peers, so they only connect to the
 * rooms, never to each other.
 */
const HALL = `hall-v${PROTOCOL_VERSION}`
export const ANNOUNCE_MS = 5000
/** A room that hasn't announced for this long leaves the list */
export const LISTING_TTL_MS = 15000

/** The Online screen's view of the hall */
export class RoomDirectory {
  readonly changed = new Emitter<[RoomListing[]]>()
  private listings = new Map<string, { listing: RoomListing, seen: number }>()
  private timer: ReturnType<typeof setInterval>

  private constructor(private transport: Transport<DirectoryMessage>) {
    transport.onMessage(msg => this.receive(msg))
    this.timer = setInterval(() => this.expire(), 1000)
  }

  static async open(): Promise<RoomDirectory> {
    return new RoomDirectory(await openTransport<DirectoryMessage>(HALL, { passive: true }))
  }

  private receive(msg: DirectoryMessage) {
    if (msg?.t === 'listing' && msg.version === PROTOCOL_VERSION && typeof msg.listing?.code === 'string') {
      this.listings.set(msg.listing.code, { listing: msg.listing, seen: Date.now() })
      this.emit()
    } else if (msg?.t === 'unlist' && this.listings.delete(msg.code)) {
      this.emit()
    }
  }

  private expire() {
    const now = Date.now()
    let removed = false
    for (const [code, entry] of this.listings) {
      if (now - entry.seen > LISTING_TTL_MS) removed = this.listings.delete(code) || removed
    }
    if (removed) this.emit()
  }

  private emit() {
    this.changed.emit(this.list())
  }

  /** Rooms with a free seat first, then the ones in a match */
  list(): RoomListing[] {
    return [...this.listings.values()].map(e => e.listing)
      .sort((a, b) => Number(b.seatOpen) - Number(a.seatOpen) || a.owner.localeCompare(b.owner))
  }

  close() {
    clearInterval(this.timer)
    this.changed.clear()
    this.transport.close()
  }
}

/** An open room telling the hall about itself; `update(null)` takes it off the list */
export class RoomAnnouncer {
  private listing: RoomListing | null = null
  private transport: Transport<DirectoryMessage> | null = null
  private opening: Promise<void> | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private closed = false

  update(listing: RoomListing | null) {
    const was = this.listing
    this.listing = listing
    if (listing) {
      void this.ensureOpen().then(() => this.announce())
    } else if (was && this.transport) {
      this.transport.send({ t: 'unlist', code: was.code })
    }
  }

  private ensureOpen(): Promise<void> {
    this.opening ??= openTransport<DirectoryMessage>(HALL).then(transport => {
      if (this.closed) {
        transport.close()
        return
      }
      this.transport = transport
      // somebody opened the Online screen: tell them right away
      transport.onPeerJoin(peerId => this.announce(peerId))
      this.timer = setInterval(() => this.announce(), ANNOUNCE_MS)
    })
    return this.opening
  }

  private announce(to?: string) {
    if (this.listing && this.transport) this.transport.send({ t: 'listing', version: PROTOCOL_VERSION, listing: this.listing }, to)
  }

  close() {
    if (this.closed) return
    this.update(null)
    this.closed = true
    if (this.timer) clearInterval(this.timer)
    this.transport?.close()
  }
}
