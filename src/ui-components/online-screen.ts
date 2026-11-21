/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { LitElement, css, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { theme } from './theme'
import { MapListItem, RANDOM_MAP_ID } from './map-select'
import './map-select'
import { ArmyChoice, ArmyClassOption } from './army-select'
import './army-select'
import { saveArmy, savePlacement, savedArmy, savedPlacement } from './army-prefs'
import { defaultPlacement, deployCells } from '../deploy'
import { Resources } from '../resources'
import { MAPS, defaultArmy, findMap, getMapInfo, randomMap, teamSpawns, type MapDefinition } from '../maps'
import { mapPreview, unitPortrait } from '../ui-sprites'
import { buildCpuArmy } from '../army-ai'
import { ARMY_BUDGET, CLASS_INFO, UNIT_CLASSES, unitTypeOf } from '../unit-classes'
import { RoomDirectory } from '../online/directory'
import { OnlineSession, activeSession, forgetSavedSession, savedSession } from '../online/session'
import { MAX_SPECTATORS, NAME_MAX_LENGTH, cleanName, normalizeRoomCode, type JoinIntent, type Member, type RoomListing, type Seat, type SeatState } from '../online/protocol'
import { t } from '../i18n'

const PREF_NAME = 'pixelfantasywar.name'
const PREF_ONLINE_MAP = 'pixelfantasywar.onlineMap'

type View = 'browse' | 'connecting' | 'lobby' | 'map' | 'army'

function readPref(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function writePref(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable: ignore */ }
}

function rejectText(reason: string | null | undefined): string {
  const text = t().online
  switch (reason) {
  case 'full': return text.rejectFull
  case 'version': return text.rejectVersion
  case 'kicked': return text.rejectKicked
  case 'closed': return text.rejectClosed
  default: return text.connectionClosed
  }
}

/** Rooms answer within a few seconds of joining the hall; after that an empty list really is empty */
const SEARCH_MS = 8000


/**
 * Online menus: name, the Wi-Fi tip, open rooms, create / join with a code,
 * then the room's lobby (seats, spectators, map, armies, Ready). Fires
 * `launch` (detail: the map) when the room's match starts, and `back`.
 * The connection lives in the active OnlineSession, which outlasts this screen.
 */
@customElement('online-screen')
export class OnlineScreen extends LitElement {
  static styles = [theme, css`
    :host { display: block; width: calc(1640 * var(--u)); max-width: 97vw; }
    h2 { margin: 0 0 calc(14 * var(--u)); font-weight: normal; font-size: calc(48 * var(--t)); text-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000; }
    h3 { margin: 0; font-weight: normal; font-size: calc(24 * var(--t)); }
    .row { display: flex; gap: calc(14 * var(--u)); align-items: center; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: calc(640 * var(--u)) 1fr; gap: calc(20 * var(--u)); }
    .box { display: flex; flex-direction: column; gap: calc(14 * var(--u)); padding: calc(18 * var(--u)); }
    .btn { --team: #2a2d3a; font-size: calc(22 * var(--t)); padding: calc(9 * var(--u)) calc(20 * var(--u)); justify-content: center; }
    .btn.primary { --team: var(--blue); }
    .btn.danger { --team: var(--red); }
    .btn.small { font-size: calc(16 * var(--t)); padding: calc(5 * var(--u)) calc(12 * var(--u)); }
    .btn[disabled] { opacity: 0.45; cursor: default; }
    input {
      font: inherit;
      font-size: calc(24 * var(--t));
      color: var(--ink);
      background: #000;
      border: calc(3 * var(--u)) solid var(--edge);
      padding: calc(8 * var(--u)) calc(12 * var(--u));
      outline: none;
      min-width: 0;
      user-select: text;
    }
    input:focus { border-color: var(--gold); }
    input.code { width: calc(180 * var(--u)); text-transform: uppercase; letter-spacing: calc(4 * var(--u)); text-align: center; }
    input.name { flex: 1; }
    label { font-size: calc(16 * var(--t)); color: var(--muted); }
    .tip { padding: calc(12 * var(--u)) calc(16 * var(--u)); border-left: calc(6 * var(--u)) solid var(--gold); background: rgba(255, 210, 63, 0.08); font-size: calc(16 * var(--t)); line-height: 1.4; }
    .tip b { font-weight: normal; color: var(--gold); }
    .error { color: var(--red); font-size: calc(18 * var(--t)); line-height: 1.35; }
    .note { color: var(--gold); font-size: calc(18 * var(--t)); }
    .muted { font-size: calc(16 * var(--t)); }

    .lock { display: flex; align-items: center; gap: calc(10 * var(--u)); cursor: pointer; font-size: calc(18 * var(--t)); }
    .lock .switch { width: calc(44 * var(--u)); height: calc(24 * var(--u)); border: calc(3 * var(--u)) solid var(--edge); background: #000; position: relative; }
    .lock .switch i { position: absolute; top: calc(2 * var(--u)); left: calc(2 * var(--u)); width: calc(14 * var(--u)); height: calc(14 * var(--u)); background: var(--muted); }
    .lock.on .switch i { left: auto; right: calc(2 * var(--u)); background: var(--gold); }

    .rooms { display: flex; flex-direction: column; gap: calc(8 * var(--u)); max-height: calc(560 * var(--u)); overflow-y: auto; }
    .room { display: grid; grid-template-columns: calc(110 * var(--u)) 1fr auto; gap: calc(14 * var(--u)); align-items: center; padding: calc(8 * var(--u)); background: rgba(255, 255, 255, 0.04); }
    .room img { width: 100%; image-rendering: pixelated; }
    .room .who { font-size: calc(20 * var(--t)); }
    .room .what { font-size: calc(15 * var(--t)); color: var(--muted); }
    .list-head { display: flex; align-items: center; justify-content: space-between; gap: calc(14 * var(--u)); }
    .empty { font-size: calc(18 * var(--t)); color: var(--muted); padding: calc(24 * var(--u)) 0; text-align: center; }

    .code-big { font-size: calc(44 * var(--t)); letter-spacing: calc(8 * var(--u)); color: var(--gold); text-shadow: calc(3 * var(--u)) calc(3 * var(--u)) 0 #000; }
    .map-card { display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
    .map-card img { width: 100%; image-rendering: pixelated; border: calc(3 * var(--u)) solid var(--edge); }
    .seats { display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
    .seat { display: flex; align-items: center; gap: calc(12 * var(--u)); padding: calc(10 * var(--u)) calc(14 * var(--u)); border-left: calc(8 * var(--u)) solid var(--team); background: rgba(255, 255, 255, 0.04); }
    .seat .who { flex: 1; font-size: calc(24 * var(--t)); }
    .seat .who small { font-size: calc(15 * var(--t)); color: var(--muted); margin-left: calc(8 * var(--u)); }
    .status { font-size: calc(17 * var(--t)); color: var(--muted); }
    .status.ready { color: var(--hp); }
    .status.away { color: var(--red); }
    .spectator { display: flex; align-items: center; gap: calc(10 * var(--u)); font-size: calc(18 * var(--t)); }
    .spectator span { flex: 1; }
    .bottom { display: flex; gap: calc(14 * var(--u)); justify-content: flex-end; margin-top: calc(18 * var(--u)); align-items: center; }
    .bottom .grow { flex: 1; }
    .center { display: flex; flex-direction: column; align-items: center; gap: calc(18 * var(--u)); padding: calc(40 * var(--u)); text-align: center; }
    .dots::after { content: '...'; animation: dots 1200ms steps(4) infinite; display: inline-block; width: 1.5em; text-align: left; overflow: hidden; vertical-align: bottom; }
    @keyframes dots { from { width: 0; } }
  `]

  /** Built by the start screen (previews are drawn once) */
  @property({ attribute: false })
    maps: MapListItem[] = []

  /** After a reload: go straight back into the saved room */
  @property({ type: Boolean })
    autoResume = false

  @state() private view: View = 'browse'
  @state() private name = readPref(PREF_NAME) ?? ''
  @state() private codeInput = ''
  @state() private locked = false
  @state() private error = ''
  @state() private rooms: RoomListing[] = []
  /** Just joined the room list: still waiting for the rooms to answer */
  @state() private searching = false
  @state() private copied = false
  /** Redraw when the session changes */
  @state() private revision = 0

  private session: OnlineSession | null = null
  private directory: RoomDirectory | null = null
  /** Bumped on every open/close of the room list: a late open of an old one is dropped */
  private directoryGen = 0
  private stopSession: (() => void) | null = null
  /** Match number already launched (so the same match doesn't start twice) */
  private launched = -1
  /** Last join attempt, for "Try again" */
  private lastJoin: { code: string, intent: JoinIntent } | null = null
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || this.view === 'map' || this.view === 'army') return
    if (event.target instanceof HTMLInputElement) return
    if (this.view === 'browse') this.back()
  }

  override connectedCallback() {
    super.connectedCallback()
    window.addEventListener('keydown', this.onKeyDown)
    // coming back from a match: straight into the room
    const session = activeSession()
    if (session && session.status === 'joined') {
      this.watch(session)
      this.launched = session.room?.phase === 'lobby' ? -1 : session.room?.matchNo ?? -1
      this.view = 'lobby'
    } else if (this.autoResume && savedSession()) {
      void this.resume()
    } else {
      this.openDirectory()
    }
  }

  override disconnectedCallback() {
    window.removeEventListener('keydown', this.onKeyDown)
    this.closeDirectory()
    this.stopSession?.()
    this.stopSession = null
    super.disconnectedCallback()
  }

  // --- room list ---

  private openDirectory() {
    if (this.directory) return
    const gen = ++this.directoryGen
    this.searching = true
    void RoomDirectory.open().then(directory => {
      if (gen !== this.directoryGen || !this.isConnected || this.view !== 'browse') {
        directory.close()
        return
      }
      this.directory = directory
      directory.changed.on(rooms => {
        this.rooms = rooms
        if (rooms.length > 0) this.searching = false
      })
      this.rooms = directory.list()
      window.setTimeout(() => { if (gen === this.directoryGen) this.searching = false }, SEARCH_MS)
    })
  }

  private closeDirectory() {
    this.directoryGen++
    this.directory?.close()
    this.directory = null
    this.rooms = []
    this.searching = false
  }

  /**
   * Joins the room list again: open rooms announce themselves when someone
   * arrives, so a fresh join gets them all right away (between arrivals they
   * only repeat about once a minute).
   */
  private refreshRooms() {
    Resources.SelectSound.play()
    this.closeDirectory()
    this.openDirectory()
  }

  // --- session ---

  private validName(): string | null {
    const name = cleanName(this.name)
    if (!name) {
      this.error = t().online.typeName
      this.shadowRoot?.querySelector<HTMLInputElement>('input.name')?.focus()
      return null
    }
    writePref(PREF_NAME, name)
    this.name = name
    return name
  }

  private watch(session: OnlineSession) {
    this.stopSession?.()
    this.session = session
    this.stopSession = session.changed.on(() => this.sessionChanged())
  }

  private sessionChanged() {
    const session = this.session
    if (!session) return
    this.revision++
    if (session.status === 'joined' && this.view === 'connecting') this.view = 'lobby'
    if (session.status === 'rejected' || session.status === 'closed') {
      this.error = rejectText(session.rejectReason)
      this.dropSession()
      return
    }
    const room = session.room
    // the room moved on while the army or map screen was open
    if ((this.view === 'army' || this.view === 'map') && room && room.phase !== 'lobby') this.view = 'lobby'
    if (room && room.phase === 'match' && this.launched !== room.matchNo && session.feed) {
      this.launched = room.matchNo
      const map = findMap(room.mapId)
      if (map) this.dispatchEvent(new CustomEvent<MapDefinition>('launch', { detail: map }))
    }
  }

  private dropSession() {
    this.stopSession?.()
    this.stopSession = null
    this.session?.close()
    this.session = null
    this.view = 'browse'
    this.openDirectory()
  }

  private async create() {
    const name = this.validName()
    if (!name) return
    Resources.SelectSound.play()
    this.error = ''
    this.closeDirectory()
    this.view = 'connecting'
    const mapId = findMap(readPref(PREF_ONLINE_MAP))?.id ?? MAPS[0].id
    this.watch(await OnlineSession.create(name, mapId, this.locked))
    this.view = 'lobby'
  }

  private async join(code: string, intent: JoinIntent) {
    const name = this.validName()
    if (!name) return
    Resources.SelectSound.play()
    this.error = ''
    this.lastJoin = { code, intent }
    this.closeDirectory()
    this.view = 'connecting'
    this.watch(await OnlineSession.join(code, name, intent))
    this.sessionChanged()
  }

  private joinWithCode(intent: JoinIntent) {
    const code = normalizeRoomCode(this.codeInput)
    if (!code) {
      this.error = t().online.badCode
      return
    }
    void this.join(code, intent)
  }

  private async resume() {
    const saved = savedSession()
    if (!saved) return
    Resources.SelectSound.play()
    this.error = ''
    this.closeDirectory()
    this.view = 'connecting'
    this.lastJoin = { code: saved.code, intent: saved.intent }
    this.watch(await OnlineSession.resume(saved))
    this.sessionChanged()
  }

  private cancelConnecting() {
    Resources.SelectSound.play()
    this.error = ''
    forgetSavedSession()
    this.dropSession()
  }

  private leaveRoom() {
    Resources.SelectSound.play()
    this.stopSession?.()
    this.stopSession = null
    this.session?.leave()
    this.session = null
    this.error = ''
    this.view = 'browse'
    this.openDirectory()
  }

  private back() {
    this.closeDirectory()
    this.dispatchEvent(new Event('back'))
  }

  private async copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      this.copied = true
      window.setTimeout(() => { this.copied = false }, 1500)
    } catch { /* clipboard not allowed: the code is on screen anyway */ }
  }

  // --- lobby actions ---

  private chooseMap(id: string) {
    const map = id === RANDOM_MAP_ID ? randomMap() : findMap(id)
    if (map) {
      writePref(PREF_ONLINE_MAP, map.id)
      this.session?.setMap(map.id)
    }
    this.view = 'lobby'
  }

  private confirmArmy({ army, placement }: ArmyChoice) {
    const session = this.session
    const room = session?.room
    const seat = session?.seat
    if (!session || !room || seat === null || seat === undefined) return
    saveArmy(room.mapId, seat, army)
    savePlacement(room.mapId, seat, placement)
    session.setReady(true, army, army.length, placement)
    Resources.SelectSound.play()
    this.view = 'lobby'
  }

  private unready() {
    Resources.SelectSound.play()
    this.session?.setReady(false, null, 0)
    this.view = 'army'
  }

  // --- rendering ---

  private renderBrowse() {
    const saved = savedSession()
    return html`
      <h2>${t().online.heading}</h2>
      <div class="grid">
        <div class="panel box">
          <label>${t().online.yourName}</label>
          <div class="row">
            <input class="name" maxlength=${NAME_MAX_LENGTH} .value=${this.name} placeholder=${t().online.namePlaceholder}
              @input=${(e: Event) => { this.name = (e.target as HTMLInputElement).value; this.error = '' }} />
          </div>
          <div class="tip"><b>${t().online.wifiTipTitle}</b> ${t().online.wifiTip}</div>
          ${saved ? html`
            <div class="row">
              <span class="note">${t().online.youWereIn(saved.code)}</span>
              <button class="btn btn-solid primary small" @click=${() => void this.resume()}>${t().online.rejoin}</button>
            </div>
          ` : nothing}
          <h3>${t().online.createRoom}</h3>
          <div class="row">
            <div class="lock ${this.locked ? 'on' : ''}" role="switch" aria-checked=${String(this.locked)} tabindex="0"
              @click=${() => { this.locked = !this.locked }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.locked = !this.locked } }}>
              <span class="switch"><i></i></span>${this.locked ? t().online.locked : t().online.open}
            </div>
          </div>
          <button class="btn btn-solid primary" @click=${() => void this.create()}>${t().online.createButton}</button>
          <h3>${t().online.joinWithCode}</h3>
          <div class="row">
            <input class="code" maxlength="7" .value=${this.codeInput} placeholder=${t().online.codePlaceholder}
              @input=${(e: Event) => { this.codeInput = (e.target as HTMLInputElement).value; this.error = '' }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.joinWithCode('play') }} />
            <button class="btn btn-solid primary" @click=${() => this.joinWithCode('play')}>${t().online.play}</button>
            <button class="btn btn-solid" @click=${() => this.joinWithCode('watch')}>${t().online.watch}</button>
          </div>
          ${this.error ? html`<div class="error">${this.error}</div>` : nothing}
        </div>
        <div class="panel box">
          <div class="list-head">
            <h3>${t().online.openRooms}</h3>
            <button class="btn btn-solid small" ?disabled=${this.searching} @click=${() => this.refreshRooms()}>${t().online.refresh}</button>
          </div>
          <div class="rooms">
            ${this.rooms.length === 0
              ? html`<div class="empty ${this.searching ? 'dots' : ''}">${this.searching ? t().online.looking : t().online.noRooms}</div>`
              : this.rooms.map(room => this.renderListing(room))}
          </div>
        </div>
      </div>
      <div class="bottom">
        <button class="btn btn-solid" @click=${() => this.back()}>${t().common.back}</button>
      </div>
    `
  }

  private renderListing(room: RoomListing) {
    const map = findMap(room.mapId)
    const item = this.maps.find(m => m.id === room.mapId)
    const status = room.phase === 'lobby' ? (room.seatOpen ? t().online.waitingOpponent : t().online.gettingReady) : room.phase === 'match' ? t().online.inMatch(room.round) : t().online.matchOver
    return html`
      <div class="room">
        ${item ? html`<img src=${item.preview} alt="" />` : html`<span></span>`}
        <div>
          <div class="who">${t().online.ownersRoom(room.owner)}</div>
          <div class="what">${map?.name ?? room.mapId} · ${status}${room.spectators > 0 ? ` · ${t().online.watchingCount(room.spectators)}` : ''}</div>
        </div>
        <div class="row">
          ${room.seatOpen ? html`<button class="btn btn-solid primary small" @click=${() => void this.join(room.code, 'play')}>${t().online.play}</button>` : nothing}
          <button class="btn btn-solid small" ?disabled=${room.spectators >= MAX_SPECTATORS} @click=${() => void this.join(room.code, 'watch')}>${t().online.watch}</button>
        </div>
      </div>
    `
  }

  private renderConnecting() {
    const session = this.session
    const failed = session?.status === 'failed'
    return html`
      <div class="panel center">
        ${failed ? html`
          <h3>${t().online.couldntConnect(session?.code ?? '')}</h3>
          <div class="error">${t().online.mayBeClosed}</div>
          <div class="tip"><b>${t().online.wifiTipTitle}</b> ${t().online.wifiTip}</div>
          <div class="row">
            ${this.lastJoin ? html`<button class="btn btn-solid primary" @click=${() => { const j = this.lastJoin!; this.dropSession(); void this.join(j.code, j.intent) }}>${t().online.tryAgain}</button>` : nothing}
            <button class="btn btn-solid" @click=${() => this.cancelConnecting()}>${t().common.back}</button>
          </div>
        ` : html`
          <h3 class="dots">${t().online.connecting(session?.code ?? '')}</h3>
          <div class="muted">${t().online.fewSeconds}</div>
          <button class="btn btn-solid" @click=${() => this.cancelConnecting()}>${t().common.cancel}</button>
        `}
      </div>
    `
  }

  private seatStatus(seat: SeatState) {
    const room = this.session?.room
    if (!seat.connected) return html`<span class="status away">${t().online.disconnected}</span>`
    if (room?.phase === 'over') return html`<span class="status">${seat.wantsRematch ? t().online.wantsRematch : t().online.matchOver}</span>`
    if (room?.phase === 'match') return html`<span class="status">${t().online.playing}</span>`
    return seat.ready ? html`<span class="status ready">${t().online.ready}</span>` : html`<span class="status">${t().online.choosingArmy}</span>`
  }

  private renderSeat(seatNo: Seat) {
    const session = this.session!
    const room = session.room!
    const seat = room.seats[seatNo]
    const team = seatNo === 0 ? 'blue' : 'red'
    const label = seatNo === 0 ? t().common.blue : t().common.red
    if (!seat) {
      return html`<div class="seat team-${team}"><span class="who muted">${t().online.waitingForOpponent(label)}<span class="dots"></span></span></div>`
    }
    const you = seat.token === session.token
    const owner = seat.token === room.ownerToken
    return html`
      <div class="seat team-${team}">
        <span class="who">${seat.name}<small>${label}${you ? t().online.youTag : ''}${owner ? t().online.ownerTag : ''}</small></span>
        ${this.seatStatus(seat)}
        ${session.ownsRoom && !you && room.phase === 'lobby' ? html`<button class="btn btn-solid danger small" @click=${() => session.kick(seat.token)}>${t().online.kick}</button>` : nothing}
      </div>
    `
  }

  private renderSpectator(member: Member) {
    const session = this.session!
    const room = session.room!
    return html`
      <div class="spectator">
        <span>${member.name}${member.token === session.token ? t().online.youSuffix : ''}</span>
        ${session.ownsRoom && room.phase === 'lobby' ? html`<button class="btn btn-solid danger small" @click=${() => session.kick(member.token)}>${t().online.kick}</button>` : nothing}
      </div>
    `
  }

  private renderLobby() {
    const session = this.session
    const room = session?.room
    if (!session || !room) return this.renderConnecting()
    const item = this.maps.find(m => m.id === room.mapId)
    const seat = session.seat
    const mine = seat === null ? null : room.seats[seat]
    const ownerAway = !room.seats.some(s => s?.token === room.ownerToken && s.connected)
    return html`
      <h2>${room.locked ? t().online.lockedRoom : t().online.openRoom}</h2>
      <div class="grid">
        <div class="panel box map-card">
          <div class="row">
            <span class="muted">${t().online.roomCode}</span>
            <span class="code-big">${room.code}</span>
            <button class="btn btn-solid small" @click=${() => void this.copyCode(room.code)}>${this.copied ? t().online.copied : t().online.copy}</button>
          </div>
          ${session.ownsRoom && room.phase === 'lobby' ? html`
            <div class="lock ${room.locked ? 'on' : ''}" role="switch" aria-checked=${String(room.locked)} tabindex="0"
              @click=${() => session.setLocked(!room.locked)}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); session.setLocked(!room.locked) } }}>
              <span class="switch"><i></i></span>${room.locked ? t().online.locked : t().online.open}
            </div>
          ` : html`<div class="muted">${room.locked ? t().online.lockedInfo : t().online.openInfo}</div>`}
          ${item ? html`<img src=${item.preview} alt="" />` : nothing}
          <div class="row">
            <h3>${item?.name ?? room.mapId}</h3>
            ${session.ownsRoom && room.phase === 'lobby' ? html`<button class="btn btn-solid small" @click=${() => { Resources.SelectSound.play(); this.view = 'map' }}>${t().online.changeMap}</button>` : nothing}
          </div>
          ${item ? html`<div class="muted">${t().online.mapUnits(item.width, item.height, item.unitsPerTeam.join(' vs '))}</div>` : nothing}
        </div>
        <div class="panel box">
          <h3>${t().online.players}</h3>
          <div class="seats">${this.renderSeat(0)}${this.renderSeat(1)}</div>
          <h3>${t().online.watchingTitle(room.spectators.length, MAX_SPECTATORS)}</h3>
          ${room.spectators.length === 0 ? html`<div class="muted">${t().online.nobody}</div>` : room.spectators.map(m => this.renderSpectator(m))}
          ${session.notice ? html`<div class="note">${session.notice}</div>` : nothing}
          ${ownerAway ? html`<div class="error">${t().online.ownerAway}</div>` : nothing}
          ${room.phase === 'over' ? html`<div class="note">${t().online.waitingRematch}</div>` : nothing}
          ${room.phase === 'lobby' && mine?.ready && !room.seats.every(s => s?.ready) ? html`<div class="note dots">${t().online.waitingOther}</div>` : nothing}
        </div>
      </div>
      <div class="bottom">
        <button class="btn btn-solid" @click=${() => this.leaveRoom()}>${t().online.leaveRoom}</button>
        <span class="grow"></span>
        ${room.phase === 'over' && mine && !mine.wantsRematch ? html`<button class="btn btn-solid primary" @click=${() => session.requestRematch()}>${t().online.rematch}</button>` : nothing}
        ${room.phase === 'lobby' && mine ? (mine.ready
          ? html`<button class="btn btn-solid" @click=${() => this.unready()}>${t().online.changeArmy}</button>`
          : html`<button class="btn btn-solid primary" @click=${() => { Resources.SelectSound.play(); this.view = 'army' }}>${t().online.chooseArmy}</button>`) : nothing}
      </div>
    `
  }

  private renderMapSelect() {
    return html`
      <map-select
        .maps=${this.maps}
        .initial=${this.session?.room?.mapId ?? RANDOM_MAP_ID}
        .modeLabel=${t().gameModes.online.title}
        @select=${() => Resources.SelectSound.play()}
        @start=${(event: CustomEvent<string>) => this.chooseMap(event.detail)}
        @back=${() => { this.view = 'lobby' }}
      ></map-select>
    `
  }

  private renderArmy() {
    const session = this.session
    const room = session?.room
    const seat = session?.seat
    const map = room && findMap(room.mapId)
    if (!session || !room || !map || seat === null || seat === undefined) return this.renderLobby()
    const info = getMapInfo(map)
    const slots = teamSpawns(info, seat).map(s => ({ x: s.x, y: s.y }))
    const classic = defaultArmy(info, seat)
    const options: ArmyClassOption[] = UNIT_CLASSES.map(unitClass => ({
      unitClass,
      name: CLASS_INFO[unitClass].name,
      role: CLASS_INFO[unitClass].role,
      cost: CLASS_INFO[unitClass].cost,
      portrait: unitPortrait(unitTypeOf(unitClass, seat), seat === 1)
    }))
    return html`
      <army-select
        .team=${seat}
        .playerLabel=${t().army.playerLabel(session.name, seat === 0 ? t().common.blue : t().common.red)}
        .mapName=${map.name}
        .preview=${mapPreview(map, false)}
        .mapWidth=${info.width}
        .mapHeight=${info.height}
        .slots=${slots}
        .zone=${deployCells(info, seat)}
        .initialPlacement=${(savedPlacement(map.id, seat, info) ?? defaultPlacement(info, seat)).map(([x, y]) => ({ x, y }))}
        .classes=${options}
        .defaultArmy=${classic}
        .initialArmy=${savedArmy(map.id, seat, slots.length) ?? classic}
        .randomize=${() => buildCpuArmy(classic, ARMY_BUDGET)}
        .budget=${ARMY_BUDGET}
        @pick=${() => Resources.SelectSound.play()}
        @confirm=${(event: CustomEvent<ArmyChoice>) => this.confirmArmy(event.detail)}
        @back=${() => { this.view = 'lobby' }}
      ></army-select>
    `
  }

  override render() {
    void this.revision
    switch (this.view) {
    case 'browse': return this.renderBrowse()
    case 'connecting': return this.renderConnecting()
    case 'lobby': return this.renderLobby()
    case 'map': return this.renderMapSelect()
    case 'army': return this.renderArmy()
    }
  }
}
