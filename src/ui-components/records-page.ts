/* eslint-disable indent -- nested lit templates read better with their own indentation */
import { css, html, nothing } from 'lit'
import { iconStyles } from './icons'
import { MAPS } from '../maps'
import { UNIT_CLASSES, className, unitTypeOf } from '../unit-classes'
import { unitPortrait } from '../ui-sprites'
import { DIFFICULTIES } from '../ai/weights'
import { language, t } from '../i18n'
import { RECORD_BUCKETS, type DailyResult, type RecordBucket, type Records, type Tally, dailyStreak, loadRecords } from '../records'
import { ACHIEVEMENT_IDS, type AchievementContext, achievementProgress, achievementText, loadUnlocked } from '../achievements'
import type { UnitClass } from '../unit-types'

/** Records screen (stats + achievements) and the daily challenge screen of the start menu */

export const recordsStyles = [iconStyles, css`
  .records { display: grid; grid-template-columns: 1.15fr 1fr; gap: calc(20 * var(--u)); align-items: start; }
  .records section { background: rgba(255, 255, 255, 0.05); padding: calc(14 * var(--u)) calc(18 * var(--u)); display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
  .records h3 { margin: 0; font-weight: normal; font-size: calc(24 * var(--t)); color: var(--gold); display: flex; justify-content: space-between; align-items: baseline; gap: calc(12 * var(--u)); }
  .records h3 small { font-size: calc(15 * var(--t)); color: var(--muted); }
  .records .column { display: flex; flex-direction: column; gap: calc(16 * var(--u)); }
  .records .hint { font-size: calc(14 * var(--t)); color: var(--muted); }
  .records .empty { grid-column: 1 / -1; font-size: calc(18 * var(--t)); color: var(--muted); text-align: center; }

  .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: calc(8 * var(--u)); }
  .summary div { background: rgba(0, 0, 0, 0.3); padding: calc(8 * var(--u)) calc(10 * var(--u)); display: flex; flex-direction: column; gap: calc(2 * var(--u)); }
  .summary b { font-weight: normal; font-size: calc(26 * var(--t)); }
  .summary span { font-size: calc(14 * var(--t)); color: var(--muted); }

  .records table { border-collapse: collapse; width: 100%; font-size: calc(16 * var(--t)); }
  .records th { font-weight: normal; color: var(--muted); font-size: calc(14 * var(--t)); text-align: right; padding: calc(2 * var(--u)) calc(8 * var(--u)); }
  .records td { text-align: right; padding: calc(4 * var(--u)) calc(8 * var(--u)); }
  .records th:first-child, .records td:first-child { text-align: left; }
  .records tbody tr { border-top: calc(2 * var(--u)) solid rgba(255, 255, 255, 0.08); }
  .records tr.unplayed td { color: var(--muted); }
  .records td.won { color: #8fe36b; }

  .classes { display: grid; grid-template-columns: repeat(2, 1fr); gap: calc(6 * var(--u)) calc(14 * var(--u)); }
  .class { display: flex; align-items: center; gap: calc(8 * var(--u)); font-size: calc(16 * var(--t)); }
  .class img { width: calc(40 * var(--u)); height: calc(40 * var(--u)); image-rendering: pixelated; background: rgba(0, 0, 0, 0.35); }
  .class .name { flex: 1; }
  .class .score { color: var(--muted); }
  .class .score b { font-weight: normal; color: #8fe36b; }

  .achievement-list { display: flex; flex-direction: column; gap: calc(8 * var(--u)); }
  .badge { display: flex; align-items: center; gap: calc(12 * var(--u)); padding: calc(8 * var(--u)) calc(12 * var(--u)); background: rgba(0, 0, 0, 0.3); border: calc(3 * var(--u)) solid #2a2d3a; }
  .badge.on { border-color: var(--gold); }
  .badge .icon { width: calc(30 * var(--u)); height: calc(30 * var(--u)); color: #3a3e52; }
  .badge.on .icon { color: var(--gold); }
  .badge .text { flex: 1; display: flex; flex-direction: column; gap: calc(2 * var(--u)); }
  .badge .name { font-size: calc(18 * var(--t)); }
  .badge:not(.on) .name { color: var(--muted); }
  .badge .detail { font-size: calc(14 * var(--t)); color: var(--muted); }
  .badge .side { font-size: calc(14 * var(--t)); color: var(--muted); text-align: right; white-space: nowrap; }
  .badge.on .side { color: var(--gold); }
  .bar { width: calc(90 * var(--u)); height: calc(8 * var(--u)); background: #14161f; border: calc(2 * var(--u)) solid #2a2d3a; margin-top: calc(4 * var(--u)); }
  .bar i { display: block; height: 100%; background: var(--gold); }

  .daily { display: grid; grid-template-columns: 1.2fr 1fr; gap: calc(24 * var(--u)); align-items: start; }
  .daily .map { display: flex; flex-direction: column; gap: calc(10 * var(--u)); }
  .daily .map img { width: 100%; image-rendering: pixelated; border: calc(3 * var(--u)) solid var(--edge); box-sizing: border-box; }
  .daily .map h3 { margin: 0; font-weight: normal; font-size: calc(32 * var(--t)); }
  .daily .map p { margin: 0; font-size: calc(16 * var(--t)); color: var(--muted); line-height: 1.35; }
  .daily .info { display: flex; flex-direction: column; gap: calc(16 * var(--u)); }
  .daily .date { font-size: calc(26 * var(--t)); color: var(--gold); }
  .daily .intro { font-size: calc(16 * var(--t)); line-height: 1.4; }
  .daily .label { font-size: calc(16 * var(--t)); color: var(--muted); margin-bottom: calc(6 * var(--u)); }
  .daily .army { display: flex; flex-wrap: wrap; gap: calc(6 * var(--u)); }
  .daily .army img { width: calc(56 * var(--u)); height: calc(56 * var(--u)); image-rendering: pixelated; background: rgba(0, 0, 0, 0.35); border-bottom: calc(3 * var(--u)) solid var(--team); }
  .daily .result { background: rgba(255, 255, 255, 0.05); padding: calc(10 * var(--u)) calc(14 * var(--u)); font-size: calc(18 * var(--t)); display: flex; flex-direction: column; gap: calc(4 * var(--u)); }
  .daily .result .won { color: #8fe36b; }
  .daily .result .streak { color: var(--gold); }
  .daily .small { font-size: calc(14 * var(--t)); color: var(--muted); }
  .page-footer .btn.primary { --team: var(--blue); }
  .page-footer { gap: calc(14 * var(--u)); }
`]

/** "12/08/2026", "Dec 8, 2026": a date (YYYY-MM-DD) in the current language */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(language(), { year: 'numeric', month: 'short', day: 'numeric' })
}

const percent = (tally: Tally) => tally.played > 0 ? `${Math.round(tally.won / tally.played * 100)}%` : t().records.none

function tallyCells(tally: Tally | undefined) {
  if (!tally || tally.played === 0) return html`<td>0</td><td>${t().records.none}</td><td>${t().records.none}</td><td>${t().records.none}</td>`
  return html`<td>${tally.played}</td><td class="won">${tally.won}</td><td>${tally.lost}</td><td>${percent(tally)}</td>`
}

function tallyTable(rows: { label: string, tally: Tally | undefined }[]) {
  return html`
    <table>
      <thead><tr><th></th><th>${t().records.played}</th><th>${t().records.won}</th><th>${t().records.lost}</th><th>${t().records.winRate}</th></tr></thead>
      <tbody>
        ${rows.map(row => html`<tr class=${row.tally?.played ? '' : 'unplayed'}><td>${row.label}</td>${tallyCells(row.tally)}</tr>`)}
      </tbody>
    </table>
  `
}

const bucketLabel = (bucket: RecordBucket) => bucket === 'online' ? t().records.online : DIFFICULTIES[bucket].label

function renderClass(records: Records, unitClass: UnitClass) {
  const tally = records.byClass[unitClass]
  return html`
    <div class="class">
      <img src=${unitPortrait(unitTypeOf(unitClass, 0))} alt="">
      <span class="name">${className(unitClass)}</span>
      <span class="score"><b>${tally?.won ?? 0}</b> / ${tally?.played ?? 0}</span>
    </div>
  `
}

function renderAchievements(context: AchievementContext) {
  const unlocked = loadUnlocked()
  const count = ACHIEVEMENT_IDS.filter(id => unlocked[id]).length
  return html`
    <section>
      <h3>${t().records.achievements} <small>${t().records.unlocked(count, ACHIEVEMENT_IDS.length)}</small></h3>
      <div class="achievement-list">
        ${ACHIEVEMENT_IDS.map(id => {
          const { name, description } = achievementText(id)
          const date = unlocked[id]
          const progress = date ? null : achievementProgress(id, context)
          return html`
            <div class="badge ${date ? 'on' : ''}">
              <i class="icon i-star" aria-hidden="true"></i>
              <div class="text"><span class="name">${name}</span><span class="detail">${description}</span></div>
              <div class="side">
                ${date ? t().records.unlockedOn(formatDate(date)) : nothing}
                ${progress ? html`
                  <div>${t().records.progress(progress[0], progress[1])}</div>
                  <div class="bar"><i style="width: ${Math.round(progress[0] / progress[1] * 100)}%"></i></div>
                ` : nothing}
              </div>
            </div>
          `
        })}
      </div>
    </section>
  `
}

/** Records page: totals, per difficulty, per map, per class, and the achievements */
export function renderRecords(today: string) {
  const records = loadRecords()
  const total = records.total
  const context: AchievementContext = { match: null, records, today, mapCount: MAPS.length }
  const summary: [string, string | number][] = [
    [t().records.played, total.played],
    [t().records.won, total.won],
    [t().records.lost, total.lost],
    [t().records.drawn, total.drawn],
    [t().records.winRate, percent(total)],
    [t().records.kills, records.kills],
    [t().records.damage, records.damage],
    [t().records.fastestWin, records.fastestWin ? t().records.rounds(records.fastestWin) : t().records.none]
  ]
  return html`
    <div class="records">
      ${total.played === 0 ? html`<div class="empty">${t().records.empty}</div>` : nothing}
      <div class="column">
        <section><div class="summary">${summary.map(([label, value]) => html`<div><b>${value}</b><span>${label}</span></div>`)}</div></section>
        <section>
          <h3>${t().records.byDifficulty}</h3>
          ${tallyTable(RECORD_BUCKETS.map(bucket => ({ label: bucketLabel(bucket), tally: records.byBucket[bucket] })))}
        </section>
        <section>
          <h3>${t().records.byMap}</h3>
          ${tallyTable(MAPS.map(map => ({ label: map.name, tally: records.byMap[map.id] })))}
        </section>
        <section>
          <h3>${t().records.byClass} <small>${t().records.classHint}</small></h3>
          <div class="classes">${UNIT_CLASSES.map(unitClass => renderClass(records, unitClass))}</div>
        </section>
      </div>
      <div class="column">${renderAchievements(context)}</div>
    </div>
  `
}

/** Everything the daily challenge screen shows */
export interface DailyView {
  date: string
  mapName: string
  mapDescription: string
  preview: string
  difficulty: string
  armies: [UnitClass[], UnitClass[]]
}

function dailyResult(best: DailyResult | undefined) {
  if (!best) return html`<span>${t().daily.notPlayed}</span>`
  if (best.won) return html`<span class="won">${t().daily.bestWon(best.rounds, best.lost)}</span>`
  return html`<span>${t().daily.notWon}</span>`
}

export function renderDaily(view: DailyView) {
  const records = loadRecords()
  const streak = dailyStreak(records, view.date)
  const army = (classes: UnitClass[], team: number) => html`
    <div class="army team-${team === 0 ? 'blue' : 'red'}">
      ${classes.map(unitClass => html`<img src=${unitPortrait(unitTypeOf(unitClass, team), team === 1)} alt=${className(unitClass)} title=${className(unitClass)}>`)}
    </div>
  `
  return html`
    <div class="daily">
      <div class="map">
        <img src=${view.preview} alt="">
        <h3>${view.mapName}</h3>
        <p>${view.mapDescription}</p>
      </div>
      <div class="info">
        <div class="date">${t().daily.date(formatDate(view.date))}</div>
        <div class="intro">${t().daily.intro}</div>
        <div><div class="label">${t().daily.yourArmy}</div>${army(view.armies[0], 0)}</div>
        <div><div class="label">${t().daily.enemyArmy} · ${t().daily.cpu(view.difficulty)}</div>${army(view.armies[1], 1)}</div>
        <div class="result">
          <span class="small">${t().daily.todayBest}</span>
          ${dailyResult(records.daily[view.date])}
          ${streak > 0 ? html`<span class="streak">${t().daily.streak(streak)}</span>` : nothing}
        </div>
        <div class="small">${t().daily.newEveryDay}</div>
      </div>
    </div>
  `
}
