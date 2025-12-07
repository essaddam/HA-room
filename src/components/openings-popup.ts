import { html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';

@customElement('openings-popup')
export class OpeningsPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      .openings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 16px;
      }

      .opening-item {
        background: var(--card-background-color, white);
        border: 2px solid var(--divider-color);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        transition: all 0.2s ease;
        position: relative;
      }

      .opening-item.open {
        background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        color: white;
        border-color: #f44336;
        animation: alertPulse 2s infinite;
      }

      .opening-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .opening-icon {
        font-size: 40px;
        margin-bottom: 12px;
        display: block;
      }

      .opening-item.open .opening-icon {
        color: white;
      }

      .opening-name {
        font-size: 14px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      .opening-status {
        font-size: 12px;
        opacity: 0.8;
      }

      .opening-time {
        font-size: 11px;
        opacity: 0.6;
        margin-top: 8px;
      }

      .alert-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #f44336;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        animation: alertPulse 2s infinite;
      }

      .summary-stats {
        display: flex;
        justify-content: space-around;
        margin-bottom: 20px;
        gap: 16px;
      }

      .stat-item {
        text-align: center;
        flex: 1;
        padding: 16px;
        background: var(--card-background-color, white);
        border-radius: 12px;
        border: 1px solid var(--divider-color);
      }

      .stat-value {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .stat-value.open {
        color: #f44336;
      }

      .stat-value.closed {
        color: #4caf50;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.8;
      }

      @keyframes alertPulse {
        0% { 
          transform: scale(1);
          opacity: 1;
        }
        50% { 
          transform: scale(1.1);
          opacity: 0.8;
        }
        100% { 
          transform: scale(1);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .openings-grid {
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
          }
          
        .summary-stats {
          flex-direction: column;
          gap: 12px;
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<p>Aucune ouverture configurée</p>`;
    }

    const openCount = this.entities.filter(entityId => 
      isEntityOn(this.hass, entityId)
    ).length;
    const closedCount = this.entities.length - openCount;

    return html`
      <!-- Summary Stats -->
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value open">${openCount}</div>
          <div class="stat-label">Ouvert${openCount > 1 ? 's' : ''}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value closed">${closedCount}</div>
          <div class="stat-label">Fermé${closedCount > 1 ? 's' : ''}</div>
        </div>
      </div>

      <!-- Openings Grid -->
      <div class="openings-grid">
        ${this.entities.map(entityId => this._renderOpening(entityId))}
      </div>
    `;
  }

  private _renderOpening(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const isOpen = isEntityOn(this.hass, entityId);
    const friendlyName = getFriendlyName(this.hass, entityId);
    const icon = getIcon(this.hass, entityId);
    const lastChanged = stateObj.last_changed;

    return html`
      <div class="opening-item ${isOpen ? 'open' : ''}">
        ${isOpen ? html`<div class="alert-badge">!</div>` : html``}
        <ha-icon class="opening-icon" icon=${icon}></ha-icon>
        <div class="opening-name">${friendlyName}</div>
        <div class="opening-status">
          ${isOpen ? 'Ouvert' : 'Fermé'}
        </div>
        ${lastChanged ? html`
          <div class="opening-time">
            Dernier changement: ${new Date(lastChanged).toLocaleTimeString()}
          </div>
        ` : html``}
      </div>
    `;
  }
}