/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { LitElement, css, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import * as ex from 'excalibur'
import { Resources } from '../resources'
import { theme } from './theme'
import { MapListItem, RANDOM_MAP_ID } from './map-select'
import './map-select'
import { ArmyClassOption } from './army-select'
import './army-select'
import { enterFullscreen, isTouchDevice, readableBoost } from '../device'
import { pageStyles, renderCredits, renderHowToPlay, renderUnits } from './start-screen-pages'
import { GAME_MODES, GameMode, MatchSettings, findGameMode } from '../game-modes'
import { MAPS, MapDefinition, defaultArmy, findMap, getMapInfo, randomMap, sceneNameOf, teamSpawns } from '../maps'
import { mapPreview, unitPortrait } from '../ui-sprites'
import { ARMY_BUDGET, CLASS_INFO, UNIT_CLASSES, armyCost, classStats, classTraits, unitTypeOf } from '../unit-classes'
import type { UnitClass } from '../path-finding/terrain-rules'
import type { UnitType } from '../config'

type Screen = 'title' | 'mode' | 'map' | 'army' | 'howto' | 'units' | 'credits'

const PREF_MODE = 'pixelfantasywar.mode'
const PREF_MAP = 'pixelfantasywar.map'
const prefArmy = (mapId: string, team: number) => `pixelfantasywar.army.${mapId}.${team}`
/** Text size in the menus relative to the base sizes in the components */
const MENU_TEXT_SCALE = 1.3
/** Extra text size allowed on small screens (the layout itself doesn't grow) */
const MENU_MAX_TEXT_BOOST = 1.4

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
  static styles = [theme, pageStyles, css`
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

    .menu { display: flex; flex-direction: column; gap: calc(12 * var(--u)); padding: calc(18 * var(--u)); width: calc(440 * var(--u)); }
    .menu .btn { font-size: calc(32 * var(--t)); padding: calc(12 * var(--u)) calc(18 * var(--u)); --team: #2a2d3a; }
    .menu .btn.primary { --team: var(--blue); font-size: calc(40 * var(--t)); }

    /* Mode */
    .mode-screen { display: flex; flex-direction: column; align-items: center; gap: calc(28 * var(--u)); }
    .heading { margin: 0; font-weight: normal; font-size: calc(56 * var(--t)); text-shadow: calc(5 * var(--u)) calc(5 * var(--u)) 0 #000; }
    .modes { display: grid; grid-template-columns: repeat(3, calc(430 * var(--u))); gap: calc(24 * var(--u)); }
    .mode {
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

    .fade { position: absolute; inset: 0; background: #000; opacity: 0; pointer-events: none; transition: opacity 600ms steps(6); }
    .fade.visible { opacity: 1; pointer-events: auto; }
  `]

  @property({ attribute: false })
    engine!: ex.Engine

  @state()
  private screen: Screen = 'title'

  @state()
  private mode: GameMode = findGameMode(readPref(PREF_MODE))?.id ?? 'p1vscpu'

  @state()
  private leaving = false

  /** map picked in the selector (random already resolved) */
  @state()
  private chosenMap: MapDefinition | null = null

  /** team building its army on the army screen */
  @state()
  private armyTeam = 0

  private armies: (UnitClass[] | null)[] = [null, null]

  private mapItems: MapListItem[] | null = null

  private onResize = () => this.updateScale()
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && this.screen !== 'title' && this.screen !== 'map') this.go('title')
  }

  override connectedCallback(): void {
    super.connectedCallback()
    this.updateScale()
    window.addEventListener('resize', this.onResize)
    window.addEventListener('keydown', this.onKeyDown)
    Resources.TitleMusic.loop = true
    Resources.TitleMusic.play()
  }

  override disconnectedCallback(): void {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('keydown', this.onKeyDown)
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

  private chooseMode(mode: GameMode) {
    this.mode = mode
    writePref(PREF_MODE, mode)
    this.go('map')
  }

  private buildMapItems(): MapListItem[] {
    if (!this.mapItems) {
      this.mapItems = MAPS.map(map => {
        const info = getMapInfo(map)
        const roster = [0, 1].map(team => info.spawns
          .filter(spawn => spawn.team === team)
          .map(spawn => unitPortrait(spawn.unitType, team === 1)))
        return {
          id: map.id,
          name: map.name,
          description: map.description,
          width: info.width,
          height: info.height,
          unitsPerTeam: info.unitsPerTeam,
          rounds: Math.floor(map.maxTurns / 2),
          preview: mapPreview(map),
          roster
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
    if (this.mode === 'cpuvscpu') {
      this.launch()
      return
    }
    this.armyTeam = 0
    this.go('army')
  }

  private confirmArmy(army: UnitClass[]) {
    const map = this.chosenMap
    if (!map) return
    this.armies[this.armyTeam] = army
    writePref(prefArmy(map.id, this.armyTeam), army.join(','))
    if (this.mode === 'p1vsp2' && this.armyTeam === 0) {
      this.armyTeam = 1
      Resources.SelectSound.play()
      return
    }
    this.launch()
  }

  private armyBack() {
    if (this.armyTeam === 1) this.armyTeam = 0
    else this.go('map')
  }

  private async launch() {
    const map = this.chosenMap
    if (!map || this.leaving) return
    Resources.SelectSound.play()
    // still inside the tap/click that started the match: phones go fullscreen
    // and turn to landscape (the browser only allows it during a user gesture)
    if (isTouchDevice()) void enterFullscreen()
    this.leaving = true
    await new Promise(resolve => window.setTimeout(resolve, 650))
    const settings: MatchSettings = { mode: this.mode, armies: this.armies }
    this.engine.goToScene(sceneNameOf(map), { sceneActivationData: settings })
    this.remove()
  }

  /** Last army used on this map, if it is still valid */
  private savedArmy(map: MapDefinition, team: number, slots: number): UnitClass[] | null {
    const saved = readPref(prefArmy(map.id, team))?.split(',') as UnitClass[] | undefined
    if (!saved || saved.length !== slots || saved.some(c => !UNIT_CLASSES.includes(c))) return null
    return armyCost(saved) <= ARMY_BUDGET ? saved : null
  }

  private renderArmy() {
    const map = this.chosenMap
    if (!map) return html``
    const team = this.armyTeam
    const info = getMapInfo(map)
    const slots = teamSpawns(info, team).map(s => ({ x: s.x, y: s.y }))
    const classic = defaultArmy(info, team)
    const options: ArmyClassOption[] = UNIT_CLASSES.map(unitClass => {
      const stats = classStats(unitClass)
      return {
        unitClass,
        role: CLASS_INFO[unitClass].role,
        cost: CLASS_INFO[unitClass].cost,
        hp: stats.health,
        attack: stats.attack,
        defense: stats.defense,
        range: stats.range,
        movement: stats.movement,
        traits: classTraits(unitClass),
        portrait: unitPortrait(unitTypeOf(unitClass, team), team === 1)
      }
    })
    const player = this.mode === 'p1vsp2' ? `Player ${team + 1}` : 'You'
    return html`
      <army-select
        class="screen"
        .team=${team}
        .playerLabel=${`${player} (${team === 0 ? 'Blue' : 'Red'})`}
        .mapName=${map.name}
        .preview=${mapPreview(map, false)}
        .mapWidth=${info.width}
        .mapHeight=${info.height}
        .slots=${slots}
        .classes=${options}
        .defaultArmy=${classic}
        .initialArmy=${this.savedArmy(map, team, slots.length) ?? classic}
        .budget=${ARMY_BUDGET}
        @pick=${() => Resources.SelectSound.play()}
        @confirm=${(event: CustomEvent<UnitClass[]>) => this.confirmArmy(event.detail)}
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
          <span class="tagline">Turn-based tactics in the browser</span>
        </div>
        <div class="armies">
          ${blue.map((src, i) => html`<img src=${src} alt="" style="animation-delay: ${i * 120}ms" />`)}
          <span class="vs">VS</span>
          ${red.map((src, i) => html`<img src=${src} alt="" style="animation-delay: ${(i + 5) * 120}ms" />`)}
        </div>
        <nav class="panel menu">
          <button class="btn btn-solid primary" @click=${() => this.go('mode')}>Play</button>
          <button class="btn btn-solid" @click=${() => this.go('howto')}>How to play</button>
          <button class="btn btn-solid" @click=${() => this.go('units')}>Units</button>
          <button class="btn btn-solid" @click=${() => this.go('credits')}>Credits</button>
        </nav>
      </div>
    `
  }

  private renderModes() {
    const portraits: Record<GameMode, [UnitType, UnitType]> = {
      p1vscpu: ['FighterA', 'BarbarianB'],
      p1vsp2: ['ThiefA', 'ThiefB'],
      cpuvscpu: ['MageA', 'ArcherB']
    }
    return html`
      <div class="screen mode-screen">
        <h2 class="heading">Choose mode</h2>
        <div class="modes">
          ${GAME_MODES.map(mode => {
            const [blue, red] = portraits[mode.id]
            return html`
              <button class="panel mode ${mode.id === this.mode ? 'last' : ''}" @click=${() => this.chooseMode(mode.id)}>
                <div class="sides">
                  <div class="side blue"><img src=${unitPortrait(blue)} alt="" /><span>${mode.sides[0]}</span></div>
                  <span class="vs">VS</span>
                  <div class="side red"><img src=${unitPortrait(red, true)} alt="" /><span>${mode.sides[1]}</span></div>
                </div>
                <h3>${mode.title}</h3>
                <p>${mode.description}</p>
              </button>
            `
          })}
        </div>
        <div class="bottom">
          <button class="btn btn-solid" @click=${() => this.go('title')}>Back</button>
          <small class="keys-only">Esc back</small>
        </div>
      </div>
    `
  }

  private renderPage(title: string, body: unknown) {
    return html`
      <div class="screen panel page">
        <div class="panel-title">${title}</div>
        <div class="page-body">${body}</div>
        <div class="page-footer"><button class="btn btn-solid" @click=${() => this.go('title')}>Back</button></div>
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
    case 'howto': return this.renderPage('How to play', renderHowToPlay())
    case 'units': return this.renderPage('Units', renderUnits())
    case 'credits': return this.renderPage('Credits', renderCredits())
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
