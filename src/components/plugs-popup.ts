import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { calculateEntityTotals, getFriendlyName, getIcon, isEntityOn, getNumericState, formatPower } from '../utils.js';
import { logger } from '../const.js';

export class PlugsPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];
  @property({ attribute: false }) public power_list!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .total-power {
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        color: #5d4037;
        padding: 18px;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 16px;
        border: 1px solid rgba(255, 193, 7, 0.25);
      }

      .total-power-value {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .total-power-label {
        font-size: 13px;
        font-weight: 500;
        opacity: 0.8;
      }

      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .entity-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        border-radius: 14px;
        cursor: pointer;
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .entity-item:hover {
        background: var(--secondary-background-color, rgba(0,0,0,0.07));
        transform: translateX(2px);
      }

      .entity-item.on {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.25);
      }

      .entity-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      .entity-item.on .entity-icon {
        background: #4caf50;
        color: white;
      }

      .entity-info {
        flex: 1;
        min-width: 0;
      }

      .entity-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .entity-state {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
      }

      .entity-power {
        font-size: 14px;
        font-weight: 700;
        color: var(--primary-text-color, #212121);
        flex-shrink: 0;
      }

      .toggle-button {
        width: 44px;
        height: 26px;
        border-radius: 13px;
        background: var(--divider-color, #bdbdbd);
        border: none;
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
        flex-shrink: 0;
      }

      .toggle-button.on {
        background: #4caf50;
      }

      .toggle-button::after {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .toggle-button.on::after {
        transform: translateX(18px);
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<div class="empty-state">Aucune prise configurée</div>`;
    }

    const totalPower = this.power_list?.length ?
      calculateEntityTotals(this.hass, this.power_list) : 0;

    return html`
      <div class="total-power">
        <div class="total-power-value">${formatPower(totalPower)}</div>
        <div class="total-power-label">Total pièce</div>
      </div>

      <div class="entities-list">
        ${this.entities.map(entityId => this._renderEntity(entityId))}
      </div>
    `;
  }

  private _renderEntity(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const isOn = isEntityOn(this.hass, entityId);
    const friendlyName = getFriendlyName(this.hass, entityId);
    const icon = getIcon(this.hass, entityId);
    const power = getNumericState(this.hass, entityId);

    return html`
      <div
        class="entity-item ${isOn ? 'on' : ''}"
        @click=${() => this._toggleEntity(entityId)}
      >
        <div class="entity-icon">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        <div class="entity-info">
          <div class="entity-name">${friendlyName}</div>
          <div class="entity-state">${isOn ? 'Actif' : 'Inactif'}</div>
        </div>
        <div class="entity-power">${formatPower(power)}</div>
        <div class="toggle-button ${isOn ? 'on' : ''}"></div>
      </div>
    `;
  }

  private _toggleEntity(entityId: string): void {
    try {
      const domain = entityId.split('.')[0];
      const isOn = isEntityOn(this.hass, entityId);

      this.hass.callService(domain, isOn ? 'turn_off' : 'turn_on', {
        entity_id: entityId
      });
    } catch (error) {
      logger.error('[Plugs Popup] Error toggling entity:', entityId, error);
    }
  }
}

if (!customElements.get('plugs-popup')) {
  customElements.define('plugs-popup', PlugsPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'plugs-popup': PlugsPopup;
  }
}
