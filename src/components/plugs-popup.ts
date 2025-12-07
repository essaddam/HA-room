import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { calculateEntityTotals, getFriendlyName, getIcon, isEntityOn, getNumericState, formatPower } from '../utils.js';

@customElement('plugs-popup')
export class PlugsPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];
  @property({ attribute: false }) public powerList!: string[];

  static get styles() {
    return css`
      .total-power {
        background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
        color: var(--text-primary-color);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 20px;
      }

      .total-power-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .total-power-label {
        font-size: 14px;
        opacity: 0.9;
      }

      .entities-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .entity-item {
        display: flex;
        align-items: center;
        padding: 16px;
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .entity-item:hover {
        transform: translateX(4px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .entity-item.on {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.3);
      }

      .entity-icon {
        font-size: 24px;
        margin-right: 16px;
        color: var(--primary-color);
      }

      .entity-info {
        flex: 1;
      }

      .entity-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .entity-state {
        font-size: 12px;
        opacity: 0.7;
      }

      .entity-power {
        font-size: 16px;
        font-weight: 600;
        color: var(--primary-color);
      }

      .toggle-button {
        background: var(--primary-color);
        border: none;
        border-radius: 20px;
        width: 40px;
        height: 24px;
        position: relative;
        cursor: pointer;
        transition: background 0.2s ease;
      }

      .toggle-button.on {
        background: #4caf50;
      }

      .toggle-button::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s ease;
      }

      .toggle-button.on::after {
        transform: translateX(16px);
      }
    `;
  }

  protected renderBody(): TemplateResult {
    const totalPower = this.powerList?.length ? 
      calculateEntityTotals(this.hass, this.powerList) : 0;

    return html`
      <!-- Total Power Display -->
      <div class="total-power">
        <div class="total-power-value">${formatPower(totalPower)}</div>
        <div class="total-power-label">Total pièce</div>
      </div>

      <!-- Entities List -->
      <div class="entities-list">
        ${this.entities?.map(entityId => this._renderEntity(entityId))}
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
        <ha-icon class="entity-icon" icon=${icon}></ha-icon>
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
    const domain = entityId.split('.')[0];
    const isOn = isEntityOn(this.hass, entityId);
    
    this.hass.callService(domain, isOn ? 'turn_off' : 'turn_on', {
      entity_id: entityId
    });
  }
}