/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import * as ex from 'excalibur'
import { Resources } from '../resources'
import { theme } from './theme'
import { MapListItem, RANDOM_MAP_ID } from './map-select'
import './map-select'
import { ArmyChoice, ArmyClassOption } from './army-select'
import './army-select'
import './online-screen'
import { activeSession, savedSession } from '../online/session'
import { readableBoost } from '../device'
import { pageStyles, renderCredits } from './start-screen-pages'
import { GAME_MODES, GameMode, MatchSettings, findGameMode } from '../game-modes'
import { MAPS, MapDefinition, defaultArmy, findMap, getMapInfo, randomMap, sceneNameOf, teamSpawns } from '../maps'
import { mapPreview, unitPortrait } from '../ui-sprites'
import { TUTORIAL_MAP_ID, isTutorialDone, tutorialSettings } from '../tutorial/tutorial-mode'
import { buildCpuArmy } from '../army-ai'
import { DIFFICULTIES, DIFFICULTY_IDS, Difficulty, findDifficulty } from '../ai/weights'
import { ARMY_BUDGET, CLASS_INFO, UNIT_CLASSES, className, unitTypeOf } from '../unit-classes'
import { saveArmy, savePlacement, savedArmy, savedPlacement } from './army-prefs'
import { Placement, defaultPlacement, deployCells } from '../deploy'
import type { UnitClass } from '../path-finding/terrain-rules'
import type { UnitType } from '../config'
import { onLanguageChange, t } from '../i18n'
import './settings-controls'
import { DailyView, recordsStyles, renderDaily, renderRecords } from './records-page'
import { type DailyChallenge, dailyChallenge, dailySettings, todayKey } from '../daily'

type Screen = 'title' | 'mode' | 'map' | 'army' | 'online' | 'credits' | 'daily' | 'records' | 'options'

const PREF_MODE = 'pixelfantasywar.mode'
const PREF_DIFFICULTY = 'pixelfantasywar.difficulty'
const PREF_MAP = 'pixelfantasywar.map'
/** Text size in the menus relative to the base sizes in the components */
const MENU_TEXT_SCALE = 1.3
/** Extra text size allowed on small screens (the layout itself doesn't grow) */
const MENU_MAX_TEXT_BOOST = 1.4
/** The title screen uses at most this share of the window height */
const TITLE_FIT = 0.94

function readPref(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function writePref(key: string, value: string) {
  try { localStorage.setItem(key, value) } catch { /* storage unavailable: ignore */ }
}

/**
 * Start screen: title menu → game mode → map → match. Also How to play,
 * Units and Credits. Mounted by main.ts and by TurnManager after a match.
 */
@customElement('start-screen-ui')
export class StartScreenUi extends LitElement {
  static styles = [theme, pageStyles, recordsStyles, css`
    :host {
      position: fixed;
      inset: 0;
      z-index: 999;
      display: block;
      overflow: hidden;
    }
    .wrapper {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background:
        radial-gradient(ellipse at 50% 35%, rgba(61, 123, 255, 0.18), transparent 60%),
        repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.025) 0 calc(2 * var(--u)), transparent calc(2 * var(--u)) calc(64 * var(--u))),
        repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.025) 0 calc(2 * var(--u)), transparent calc(2 * var(--u)) calc(64 * var(--u))),
        #0b0d16;
    }
    .screen { animation: enter 260ms steps(4) both; }
    @keyframes enter { from { opacity: 0; transform: translateY(calc(16 * var(--u))); } }

    /* Title */
    .title-screen { display: flex; flex-direction: column; align-items: center; gap: calc(34 * var(--u)); }
    .logo { display: flex; flex-direction: column; align-items: center; line-height: 0.9; text-shadow: calc(6 * var(--u)) calc(6 * var(--u)) 0 #000; }
    .logo .top { font-size: calc(76 * var(--t)); letter-spacing: calc(4 * var(--u)); }
    .logo .war { font-size: calc(200 * var(--t)); letter-spacing: calc(12 * var(--u)); }
    .logo .war .b { color: var(--blue); }
    .logo .war .r { color: var(--red); }
    .tagline { font-size: calc(20 * var(--t)); color: var(--muted); text-shadow: none; margin-top: calc(10 * var(--u)); letter-spacing: calc(2 * var(--u)); }

    .armies { display: flex; align-items: flex-end; gap: calc(4 * var(--u)); }
    .armies img { width: calc(76 * var(--u)); height: calc(76 * var(--u)); image-rendering: pixelated; animation: bob 900ms steps(2) infinite; }
    .armies .vs { font-size: calc(40 * var(--t)); color: var(--gold); margin: 0 calc(24 * var(--u)) calc(16 * var(--u)); text-shadow: calc(4 * var(--u)) calc(4 * var(--u)) 0 #000; }
    @keyframes bob { 50% { transform: translateY(calc(-4 * var(--u))); } }

    .menu { display: flex; flex-direction: column; gap: calc(12 * var(--u)); padding: calc(18 * var(--u)); width: calc(600 * var(--u)); }
    .menu .btn { font-size: calc(32 * var(--t)); padding: calc(12 * var(--u)) calc(18 * var(--u)); --team: #2a2d3a; }
    .menu .btn.primary { --team: var(--blue); font-size: calc(40 * var(--t)); }
    .menu .btn { text-align: center; white-space: nowrap; }

    /* Mode */
    .mode-screen { display: flex; flex-direction: column; align-items: center; gap: calc(28 * var(--u)); }
    .heading { margin: 0; font-weight: normal; font-size: calc(56 * var(--t)); text-shadow: calc(5 * var(--u)) calc(5 * var(--u)) 0 #000; }
    .modes { display: grid; grid-template-columns: repeat(5, calc(336 * var(--u))); gap: calc(20 * var(--u)); }
    .mode {
      position: relative;
      appearance: none;
      font: inherit;
      color: inherit;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: calc(16 * var(--u));
      padding: calc(26 * var(--u)) calc(22 * var(--u));
      cursor: pointer;
      text-align: center;
      transition: transform 120ms steps(2);
    }
    .mode:hover, .mode:focus-visible { transform: translateY(calc(-6 * var(--u))); border-color: var(--gold); }
    .mode.last { border-color: var(--gold); }
    .mode .badge {
      position: absolute;
      top: calc(-16 * var(--u));
      left: 50%;
      transform: translateX(-50%);
      padding: calc(4 * var(--u)) calc(12 * var(--u));
      font-size: calc(16 * var(--t));
      white-space: nowrap;
      background: var(--gold);
      color: #14172a;
      box-shadow: calc(3 * var(--u)) calc(3 * var(--u)) 0 #000;
    }
    .sides { display: flex; align-items: center; gap: calc(14 * var(--u)); }
    .side { display: flex; flex-direction: column; align-items: center; gap: calc(6 * var(--u)); font-size: calc(18 * var(--t)); }
    .side img { width: calc(96 * var(--u)); height: calc(96 * var(--u)); image-rendering: pixelated; background: rgba(255, 255, 255, 0.05); }
    .side.blue span { color: var(--blue); }
    .side.red span { color: var(--red); }
    .sides .vs { font-size: calc(26 * var(--t)); color: var(--gold); }
    .mode h3 { margin: 0; font-weight: normal; font-size: calc(32 * var(--t)); }
    .mode p { margin: 0; font-size: calc(17 * var(--t)); line-height: 1.35; color: var(--muted); }
    .bottom { display: flex; gap: calc(14 * var(--u)); align-items: center; }
    .bottom .btn { --team: #2a2d3a; font-size: calc(24 * var(--t)); padding: calc(10 * var(--u)) calc(26 * var(--u)); }
    .bottom small { font-size: calc(14 * var(--t)); color: var(--muted); }
    .difficulty { display: flex; align-items: center; gap: calc(10 * var(--u)); font-size: calc(18 * var(--t)); }
    .difficulty .label { color: var(--muted); margin-right: calc(6 * var(--u)); }
    .difficulty .btn { --team: #2a2d3a; font-size: calc(20 * var(--t)); padding: calc(8 * var(--u)) calc(20 * var(--u)); }
    .difficulty .btn.on { --team: var(--blue); }

    .options-page { width: calc(760 * var(--u)); }

    .fade { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; transition: opacity 600ms steps(6); }
    .fade.visible { opacity: 1; pointer-events: auto; }
  `]

  @property({ attribute: false })
    engine!: ex.Engine

  /** Back from an online match, or reloaded while in a room: the Online screen */
  @state()
  private screen: Screen = activeSession()?.status === 'joined' || savedSession() ? 'online' : 'title'

  /** Reloaded while in a room: reconnect right away */
  private autoResume = !activeSession() && !!savedSession()

  @state()
  private mode: GameMode = findGameMode(readPref(PREF_MODE))?.id ?? 'p1vscpu'

  /** How well the CPU plays (Player vs CPU and CPU vs CPU) */
  @state()
  private difficulty: Difficulty = findDifficulty(readPref(PREF_DIFFICULTY)) ?? 'normal'

  @state()
  private leaving = false

  /** map picked in the selector (random already resolved) */
  @state()
  private chosenMap: MapDefinition | null = null

  /** team building its army on the army screen */
  @state()
  private armyTeam = 0
  /** random starting armies offered for the CPU teams (index = team) */
  private cpuSuggestions: UnitClass[][] = []

  private armies: (UnitClass[] | null)[] = [null, null]
  private placements: (Placement | null)[] = [null, null]

  private mapItems: MapListItem[] | null = null

  private onResize = () => {
    this.updateScale()
    requestAnimationFrame(() => this.fitTitle())
  }

  override updated() {
    this.fitTitle()
  }

  /**
   * Phones: the text is enlarged to stay readable (readableBoost), and the
   * title screen (logo, armies, 5 buttons) then grew taller than a phone
   * held sideways, cutting off Credits. When it doesn't fit, shrink just
   * that screen to the height available (with a small margin).
   */
  private fitTitle() {
    const el = this.renderRoot.querySelector<HTMLElement>('.title-screen')
    if (!el) return
    el.style.zoom = ''
    const height = el.getBoundingClientRect().height
    const room = window.innerHeight * TITLE_FIT
    if (height > room) el.style.zoom = (room / height).toFixed(3)
  }
  private onKeyDown = (event: KeyboardEvent) => {
    // the map, army and online screens handle Esc themselves
    if (event.key === 'Escape' && !['title', 'map', 'army', 'online'].includes(this.screen)) this.go('title')
  }

  private stopLanguage: (() => void) | null = null

  override connectedCallback(): void {
    super.connectedCallback()
    // names and descriptions of the cached map list are read when it is built
    this.stopLanguage = onLanguageChange(() => { this.mapItems = null; this.requestUpdate() })
    this.updateScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onKeyDown)
    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  override disconnectedCallback(): void {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onKeyDown)
    this.stopLanguage?.()
    Resources.TitleMusic.stop()
    super.disconnectedCallback()
  }

  /**
   * Same unit system as the in-game UI: 1 --u = 1 px at 1920x1080. The menus
   * keep their layout size (they already fill the screen) and only enlarge text,
   * a bit more on phones so it stays readable.
   */
  private updateScale() {
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
    const boost = Math.min(MENU_MAX_TEXT_BOOST, readableBoost(scale * MENU_TEXT_SCALE))
    this.style.setProperty('--s', scale.toFixed(4))
    this.style.setProperty('--text-scale', (MENU_TEXT_SCALE * boost).toFixed(4))
  }

  private go(screen: Screen) {
    Resources.SelectSound.play()
    this.screen = screen
  }

  private chooseDifficulty(difficulty: Difficulty) {
    Resources.SelectSound.play()
    this.difficulty = difficulty
    writePref(PREF_DIFFICULTY, difficulty)
  }

  private chooseMode(mode: GameMode) {
    // the tutorial has no map or army to choose, and isn't remembered as the last mode
    if (mode === 'tutorial') {
      void this.launchTutorial()
      return
    }
    this.mode = mode
    writePref(PREF_MODE, mode)
    this.go(mode === 'online' ? 'online' : 'map')
  }

  /** Learn to play: straight into the guided match on Twin Keeps */
  private async launchTutorial() {
    const map = findMap(TUTORIAL_MAP_ID)
    if (!map || this.leaving) return
    Resources.SelectSound.play()
    this.leaving = true
    await new Promise(resolve => window.setTimeout(resolve, 650))
    this.engine.goToScene(sceneNameOf(map), { sceneActivationData: tutorialSettings() })
    this.remove()
  }

  /** The online room's match starts: armies and seats come from the room */
  private async launchOnline(map: MapDefinition) {
    const room = activeSession()?.room
    if (!room || this.leaving) return
    this.leaving = true
    await new Promise(resolve => window.setTimeout(resolve, 400))
    const settings: MatchSettings = { mode: 'online', armies: room.seats.map(s => s?.army ?? null), placements: room.seats.map(s => s?.placement ?? null) }
    this.engine.goToScene(sceneNameOf(map), { sceneActivationData: settings })
    this.remove()
  }

  private buildMapItems(): MapListItem[] {
    if (!this.mapItems) {
      this.mapItems = MAPS.map(map => {
        const info = getMapInfo(map)
        return {
          id: map.id,
          name: map.name,
          description: map.description,
          width: info.width,
          height: info.height,
          unitsPerTeam: info.unitsPerTeam,
          rounds: Math.floor(map.maxTurns / 2),
          preview: mapPreview(map)
        }
      })
    }
    return this.mapItems
  }

  /** Map picked: humans build their armies first, CPU-only matches start right away */
  private chooseMap(mapId: string) {
    if (this.leaving) return
    writePref(PREF_MAP, mapId)
    this.chosenMap = mapId === RANDOM_MAP_ID ? randomMap() : (findMap(mapId) ?? randomMap())
    this.armies = [null, null]
    this.placements = [null, null]
    // the CPU's starting suggestion is drawn once per map (the player can change it)
    const info = getMapInfo(this.chosenMap)
    this.cpuSuggestions = [0, 1].map(team => this.randomArmy(info, team))
    this.armyTeam = 0
    this.go('army')
  }

  /** Every team (human or CPU) goes through the army builder, in order */
  private confirmArmy({ army, placement }: ArmyChoice) {
    const map = this.chosenMap
    if (!map) return
    this.armies[this.armyTeam] = army
    this.placements[this.armyTeam] = placement
    saveArmy(map.id, this.armyTeam, army)
    savePlacement(map.id, this.armyTeam, placement)
    if (this.armyTeam === 0) {
      this.armyTeam = 1
      Resources.SelectSound.play()
      return
    }
    this.launch()
  }

  private isCpuTeam(team: number) {
    return this.mode === 'cpuvscpu' || (this.mode === 'p1vscpu' && team === 1)
  }

  private randomArmy(info: ReturnType<typeof getMapInfo>, team: number) {
    return buildCpuArmy(defaultArmy(info, team), ARMY_BUDGET)
  }

  private armyBack() {
    if (this.armyTeam === 1) this.armyTeam = 0
    else this.go('map')
  }

  private async launch() {
    const map = this.chosenMap
    if (!map || this.leaving) return
    Resources.SelectSound.play()
    this.leaving = true
    await new Promise(resolve => window.setTimeout(resolve, 650))
    const settings: MatchSettings = { mode: this.mode, armies: this.armies, placements: this.placements, difficulty: this.difficulty }
    this.engine.goToScene(sceneNameOf(map), { sceneActivationData: settings })
    this.remove()
  }

  private renderArmy() {
    const map = this.chosenMap
    if (!map) return html``
    const team = this.armyTeam
    const info = getMapInfo(map)
    const slots = teamSpawns(info, team).map(s => ({ x: s.x, y: s.y }))
    const classic = defaultArmy(info, team)
    const options: ArmyClassOption[] = UNIT_CLASSES.map(unitClass => ({
      unitClass,
      name: className(unitClass),
      role: CLASS_INFO[unitClass].role,
      cost: CLASS_INFO[unitClass].cost,
      portrait: unitPortrait(unitTypeOf(unitClass, team), team === 1)
    }))
    const cpu = this.isCpuTeam(team)
    const player = cpu ? t().common.cpu : this.mode === 'p1vsp2' ? t().army.playerN(team + 1) : t().common.you
    const suggestion = this.cpuSuggestions[team] ?? classic
    return html`
      <army-select
        class="screen"
        .team=${team}
        .playerLabel=${t().army.playerLabel(player, team === 0 ? t().common.blue : t().common.red)}
        .mapName=${map.name}
        .preview=${mapPreview(map, false)}
        .mapWidth=${info.width}
        .mapHeight=${info.height}
        .slots=${slots}
        .zone=${deployCells(info, team)}
        .initialPlacement=${(savedPlacement(map.id, team, info) ?? defaultPlacement(info, team)).map(([x, y]) => ({ x, y }))}
        .classes=${options}
        .defaultArmy=${classic}
        .initialArmy=${savedArmy(map.id, team, slots.length) ?? (cpu ? suggestion : classic)}
        .randomize=${() => this.randomArmy(info, team)}
        .budget=${ARMY_BUDGET}
        @pick=${() => Resources.SelectSound.play()}
        @confirm=${(event: CustomEvent<ArmyChoice>) => this.confirmArmy(event.detail)}
        @back=${() => this.armyBack()}
      ></army-select>
    `
  }

  private renderTitle() {
    const blue = (['Paladin', 'Archer', 'Mage', 'Warrior', 'Thief'] as UnitClass[]).map(c => unitPortrait(unitTypeOf(c, 0)))
    const red = (['Berserker', 'Necromancer', 'Assassin', 'Ranger', 'Halberdier'] as UnitClass[]).map(c => unitPortrait(unitTypeOf(c, 1), true))
    return html`
      <div class="screen title-screen">
        <div class="logo">
          <span class="top">Pixel Fantasy</span>
          <span class="war"><span class="b">W</span>A<span class="r">R</span></span>
          <span class="tagline">${t().title.tagline}</span>
        </div>
        <div class="armies">
          ${blue.map((src, i) => html`<img src=${src} alt="" style="animation-delay: ${i * 120}ms" />`)}
          <span class="vs">${t().common.vs}</span>
          ${red.map((src, i) => html`<img src=${src} alt="" style="animation-delay: ${(i + 5) * 120}ms" />`)}
        </div>
        <nav class="panel menu">
          <button class="btn btn-solid primary" @click=${() => this.go('mode')}>${t().title.play}</button>
          <button class="btn btn-solid" @click=${() => this.go('daily')}>${t().title.dailyChallenge}</button>
          <button class="btn btn-solid" @click=${() => this.go('records')}>${t().title.records}</button>
          <button class="btn btn-solid" @click=${() => this.go('options')}>${t().title.options}</button>
          <button class="btn btn-solid" @click=${() => this.go('credits')}>${t().title.credits}</button>
        </nav>
      </div>
    `
  }

  private renderModes() {
    const portraits: Record<GameMode, [UnitType, UnitType]> = {
      tutorial: ['WarriorA', 'ThiefB'],
      p1vscpu: ['FighterA', 'BarbarianB'],
      p1vsp2: ['ThiefA', 'ThiefB'],
      cpuvscpu: ['MageA', 'ArcherB'],
      online: ['RangerA', 'AssassinB'],
      daily: ['PaladinA', 'BerserkerB']
    }
    const tutorialDone = isTutorialDone()
    return html`
      <div class="screen mode-screen">
        <h2 class="heading">${t().modes.heading}</h2>
        <div class="modes">
          ${GAME_MODES.map(mode => {
            const [blue, red] = portraits[mode.id]
            return html`
              <button class="panel mode ${mode.id === this.mode ? 'last' : ''}" @click=${() => this.chooseMode(mode.id)}>
                ${mode.id === 'tutorial' && !tutorialDone ? html`<span class="badge">${t().modes.newHere}</span>` : ''}
                <div class="sides">
                  <div class="side blue"><img src=${unitPortrait(blue)} alt="" /><span>${mode.sides[0]}</span></div>
                  <span class="vs">${t().common.vs}</span>
                  <div class="side red"><img src=${unitPortrait(red, true)} alt="" /><span>${mode.sides[1]}</span></div>
                </div>
                <h3>${mode.title}</h3>
                <p>${mode.description}</p>
              </button>
            `
          })}
        </div>
        <div class="difficulty">
          <span class="label">${t().modes.cpuDifficulty}</span>
          ${DIFFICULTY_IDS.map(id => html`
            <button class="btn btn-solid ${id === this.difficulty ? 'on' : ''}" @click=${() => this.chooseDifficulty(id)}>${DIFFICULTIES[id].label}</button>
          `)}
        </div>
        <div class="bottom">
          <button class="btn btn-solid" @click=${() => this.go('title')}>${t().common.back}</button>
          <small class="keys-only">${t().modes.escBack}</small>
        </div>
      </div>
    `
  }

  /** split: the body doesn't scroll, its columns scroll on their own (Records) */
  private renderPage(title: string, body: unknown, split = false, extraClass = '') {
    return html`
      <div class="screen panel page ${split ? 'split-page' : ''} ${extraClass}">
        <div class="panel-title">${title}</div>
        <div class="page-body ${split ? 'split' : ''}">${body}</div>
        <div class="page-footer"><button class="btn btn-solid" @click=${() => this.go('title')}>${t().common.back}</button></div>
      </div>
    `
  }

  /** Today's challenge, drawn once per date (it doesn't change while the menu is open) */
  private daily: DailyChallenge | null = null

  private todayChallenge(): DailyChallenge {
    const today = todayKey()
    if (this.daily?.date !== today) {
      this.daily = dailyChallenge(today, MAPS.map(map => {
        const info = getMapInfo(map)
        return { id: map.id, classic: [defaultArmy(info, 0), defaultArmy(info, 1)] }
      }))
    }
    return this.daily
  }

  /** Daily challenge: straight into the match, nothing to choose */
  private async launchDaily() {
    const challenge = this.todayChallenge()
    const map = findMap(challenge.mapId)
    if (!map || this.leaving) return
    Resources.SelectSound.play()
    this.leaving = true
    await new Promise(resolve => window.setTimeout(resolve, 650))
    this.engine.goToScene(sceneNameOf(map), { sceneActivationData: dailySettings(challenge) })
    this.remove()
  }

  private renderDailyPage() {
    const challenge = this.todayChallenge()
    const map = findMap(challenge.mapId)
    if (!map) return html``
    const view: DailyView = {
      date: challenge.date,
      mapName: map.name,
      mapDescription: map.description,
      preview: mapPreview(map, false),
      difficulty: DIFFICULTIES[challenge.difficulty].label,
      armies: challenge.armies
    }
    return html`
      <div class="screen panel page daily-page">
        <div class="panel-title">${t().title.dailyChallenge}</div>
        <div class="page-body">${renderDaily(view)}</div>
        <div class="page-footer">
          <button class="btn btn-solid" @click=${() => this.go('title')}>${t().common.back}</button>
          <button class="btn btn-solid primary" @click=${() => void this.launchDaily()}>${t().daily.start}</button>
        </div>
      </div>
    `
  }

  private renderScreen() {
    switch (this.screen) {
    case 'title': return this.renderTitle()
    case 'mode': return this.renderModes()
    case 'map': return html`
      <map-select
        class="screen"
        .maps=${this.buildMapItems()}
        .initial=${readPref(PREF_MAP) ?? RANDOM_MAP_ID}
        .modeLabel=${findGameMode(this.mode)?.title ?? ''}
        @select=${() => Resources.SelectSound.play()}
        @start=${(event: CustomEvent<string>) => this.chooseMap(event.detail)}
        @back=${() => this.go('mode')}
      ></map-select>
    `
    case 'army': return this.renderArmy()
    case 'online': return html`
      <online-screen
        class="screen"
        .maps=${this.buildMapItems()}
        .autoResume=${this.autoResume}
        @launch=${(event: CustomEvent<MapDefinition>) => void this.launchOnline(event.detail)}
        @back=${() => this.go('mode')}
      ></online-screen>
    `
    case 'options': return this.renderPage(t().title.options, html`<settings-controls languages></settings-controls>`, false, 'options-page')
    case 'credits': return this.renderPage(t().title.credits, renderCredits())
    case 'records': return this.renderPage(t().title.records, renderRecords(todayKey()), true)
    case 'daily': return this.renderDailyPage()
    }
  }

  override render() {
    return html`
      <div class="wrapper">
        ${this.renderScreen()}
        <div class="fade ${this.leaving ? 'visible' : ''}"></div>
      </div>
    `
  }
}
