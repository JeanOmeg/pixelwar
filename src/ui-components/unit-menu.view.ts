/* eslint-disable indent */
import { html, nothing } from 'lit'
import { styleMap } from 'lit/directives/style-map.js'
import { classMap } from 'lit/directives/class-map.js'
import type { UnitMenu } from './unit-menu'

export function renderUnitMenu(self: UnitMenu) {
  const dismissOverlayHtml = self._show
    ? html`<div class="overlay" @click=${self.hide}></div>`
    : nothing

  return html`
    ${dismissOverlayHtml}
    <div
      class=${classMap({ menu: true, show: self._show })}
      style=${styleMap({ left: `${self.left}px`, top: `${self.top}px` })}
    >
      <div class="title-bar" style="background-color: #${self.unit?.unitConfig.primary_color}">
        ${self.unit?.name.replace(/[AB]$/, '')}
      </div>

      <div class="options">
        <div class="sheet" style="background-color: #${self.unit?.unitConfig.secondary_color}">
          <div class="tooltip">
            <span class="memory--heart"></span>${self.unit?.health}
            <span class="tooltiptext" style="${self.tooltipDirection(62 * self.pixelConversion)}">
              Health Points are used to know how much damage the unit can take before being eliminated
            </span>
          </div>
          <div class="tooltip">
            <span class="memory--sword"></span>${self.unit?.unitConfig.attack}
            <span class="tooltiptext" style="${self.tooltipDirection(62 * self.pixelConversion)}">
              Attack Points are used in attack and damage tests
            </span>
          </div>
          <div class="tooltip">
            <span class="vaadin--shield"></span>${self.unit?.unitConfig.defense}
            <span class="tooltiptext" style="${self.tooltipDirection(62 * self.pixelConversion)}">
              Defense Points are used in defense tests and damage absorption
            </span>
          </div>
          <div class="tooltip">
            <span class="memory--bow-arrow"></span>${self.unit?.unitConfig.range}
            <span class="tooltiptext" style="${self.tooltipDirection(62 * self.pixelConversion)}">
              Range Points are used to know how many cells the unit's attack reaches
            </span>
          </div>
          <div class="tooltip">
            <span class="mdi--shoe-print"></span>${self.unit?.unitConfig.movement}
            <span class="tooltiptext" style="${self.tooltipDirection(62 * self.pixelConversion)}">
              Move Points are used to know how many cells the unit can move
            </span>
          </div>
        </div>

        <button
          ?disabled=${!self.unit?.canMove()}
          style=${styleMap({
            color: self.unit?.canMove() ? 'black' : '#D3D3D3',
            cursor: self.unit?.canMove() ? 'pointer' : 'default',
          })}
          @click=${self.sendEvent('move')}
        >
          <div>Move</div>
          <div class="tooltip">{?}
            <span class="tooltiptext" style="${self.tooltipDirection()}">Move the selected unit</span>
          </div>
        </button>

        <button
          ?disabled=${!self.unit?.canAttack()}
          style=${styleMap({
            color: self.unit?.canAttack() ? 'black' : '#D3D3D3',
            cursor: self.unit?.canAttack() ? 'pointer' : 'default',
          })}
          @click=${self.sendEvent('attack')}
        >
          <div>Attack</div>
          <div class="tooltip">{?}
            <span class="tooltiptext" style="${self.tooltipDirection()}">Attack the selected enemy unit</span>
          </div>
        </button>

        <div style=${styleMap({ backgroundColor: 'black', height: 'calc(1px * var(--pixel-conversion))' })}></div>

        <button @click=${self.sendEvent('pass')}>
          <div>Done</div>
          <div class="tooltip">{?}
            <span class="tooltiptext" style="${self.tooltipDirection()}">Pass unit turn</span>
          </div>
        </button>

        <button
          @click=${self.sendEvent('passTurn')}
          style="color: #${self.unit?.unitConfig.primary_color}"
        >
          <div>Pass Turn</div>
          <div class="tooltip">{?}
            <span class="tooltiptext" style="${self.tooltipDirection()}">Pass player turn</span>
          </div>
        </button>
      </div>
    </div>
  `
}
