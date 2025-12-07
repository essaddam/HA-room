import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';

@customElement('presence-popup')
export class PresencePopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      .presence-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }

      .presence-item {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        transition: all 0.2s ease;
      }

      .presence-item.detected {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        border-color: #4caf50;
      }

      .presence-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .presence-icon {
        font-size: 48px;
        margin-bottom: 12px;
        display: block;
      }

      .presence-item.detected .presence-icon {
        color: white;
        animation: pulse 2s infinite;
      }

      .presence-name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .presence-status {
        font-size: 14px;
        opacity: 0.8;
      }

      .presence-time {
        font-size: 12px;
        opacity: 0.6;
        margin-top: 8px;
      }

      .presence-count {
        background: var(--primary-color);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        text-align: center;
        margin-bottom: 20px;
      }

      .count-number {
        font-size: 24px;
        font-weight: 700;
      }

      .count-label {
        font-size: 14px;
        opacity: 0.9;
      }

      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }

      @media (max-width: 768px) {
        .presence-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<p>Aucun capteur de présence configuré</p>`;
    }

    const detectedCount = this.entities.filter(entityId => 
      isEntityOn(this.hass, entityId)
    ).length;

    return html`
      <!-- Presence Count -->
      <div class="presence-count">
        <div class="count-number">${detectedCount}</div>
        <div class="count-label">Présence${detectedCount > 1 ? 's' : ''} détectée${detectedCount > 1 ? 's' : ''}</div>
      </div>

      <!-- Presence Grid -->
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
        <ha-icon class="presence-icon" icon=${icon}></ha-icon>
        <div class="presence-name">${friendlyName}</div>
        <div class="presence-status">
          ${isDetected ? 'Présence détectée' : 'Aucune présence'}
        </div>
        ${lastChanged ? html`
          <div class="presence-time">
            Dernière détection: ${new Date(lastChanged).toLocaleTimeString()}
          </div>
        ` : html``}
      </div>
    `;
  }
}