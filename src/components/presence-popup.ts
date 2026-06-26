import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';

export class PresencePopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .presence-summary {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 18px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        margin-bottom: 16px;
      }

      .presence-summary.detected {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.25);
      }

      .presence-summary-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: #4caf50;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        flex-shrink: 0;
      }

      .presence-summary.detected .presence-summary-icon {
        animation: pulse 2s infinite;
      }

      .presence-summary-info {
        flex: 1;
      }

      .presence-summary-count {
        font-size: 22px;
        font-weight: 700;
        color: var(--primary-text-color, #212121);
      }

      .presence-summary-label {
        font-size: 13px;
        color: var(--secondary-text-color, #757575);
      }

      .presence-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .presence-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 18px 12px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        text-align: center;
        transition: background 0.15s ease;
      }

      .presence-item.detected {
        background: rgba(76, 175, 80, 0.1);
        border-color: rgba(76, 175, 80, 0.25);
      }

      .presence-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--card-background-color, #ffffff);
        color: var(--secondary-text-color, #757575);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      .presence-item.detected .presence-icon {
        background: #4caf50;
        color: white;
      }

      .presence-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }

      .presence-status {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
      }

      .presence-time {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        margin-top: 2px;
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }

      @media (max-width: 600px) {
        .presence-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<div class="empty-state">Aucun capteur de présence configuré</div>`;
    }

    const detectedCount = this.entities.filter(entityId =>
      isEntityOn(this.hass, entityId)
    ).length;

    return html`
      <div class="presence-summary ${detectedCount > 0 ? 'detected' : ''}">
        <div class="presence-summary-icon">
          <ha-icon icon="mdi:motion-sensor"></ha-icon>
        </div>
        <div class="presence-summary-info">
          <div class="presence-summary-count">${detectedCount} / ${this.entities.length}</div>
          <div class="presence-summary-label">Présence${detectedCount > 1 ? 's' : ''} détectée${detectedCount > 1 ? 's' : ''}</div>
        </div>
      </div>

      <div class="presence-grid">
        ${this.entities.map(entityId => this._renderPresenceSensor(entityId))}
      </div>
    `;
  }

  private _renderPresenceSensor(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const isDetected = isEntityOn(this.hass, entityId);
    const friendlyName = getFriendlyName(this.hass, entityId);
    const icon = getIcon(this.hass, entityId);
    const lastChanged = stateObj.last_changed;

    return html`
      <div class="presence-item ${isDetected ? 'detected' : ''}">
        <div class="presence-icon">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        <div class="presence-name">${friendlyName}</div>
        <div class="presence-status">
          ${isDetected ? 'Présence détectée' : 'Aucune présence'}
        </div>
        ${lastChanged ? html`
          <div class="presence-time">
            ${new Date(lastChanged).toLocaleTimeString()}
          </div>
        ` : html``}
      </div>
    `;
  }
}

if (!customElements.get('presence-popup')) {
  customElements.define('presence-popup', PresencePopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'presence-popup': PresencePopup;
  }
}
