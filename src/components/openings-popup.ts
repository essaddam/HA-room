import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';

export class OpeningsPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .openings-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }

      .stat-item {
        text-align: center;
        padding: 16px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
      }

      .stat-value {
        font-size: 26px;
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
        color: var(--secondary-text-color, #757575);
      }

      .openings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 12px;
      }

      .opening-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 18px 12px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        text-align: center;
        position: relative;
        transition: background 0.15s ease;
      }

      .opening-item.open {
        background: rgba(244, 67, 54, 0.1);
        border-color: rgba(244, 67, 54, 0.25);
      }

      .opening-icon {
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

      .opening-item.open .opening-icon {
        background: #f44336;
        color: white;
      }

      .opening-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }

      .opening-status {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
      }

      .opening-time {
        font-size: 11px;
        color: var(--secondary-text-color, #757575);
        margin-top: 2px;
      }

      .alert-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: #f44336;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .openings-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<div class="empty-state">Aucun ouvrant configuré</div>`;
    }

    const openCount = this.entities.filter(entityId =>
      isEntityOn(this.hass, entityId)
    ).length;
    const closedCount = this.entities.length - openCount;

    return html`
      <div class="openings-summary">
        <div class="stat-item">
          <div class="stat-value open">${openCount}</div>
          <div class="stat-label">Ouvert${openCount > 1 ? 's' : ''}</div>
        </div>
        <div class="stat-item">
          <div class="stat-value closed">${closedCount}</div>
          <div class="stat-label">Fermé${closedCount > 1 ? 's' : ''}</div>
        </div>
      </div>

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
        <div class="opening-icon">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        <div class="opening-name">${friendlyName}</div>
        <div class="opening-status">
          ${isOpen ? 'Ouvert' : 'Fermé'}
        </div>
        ${lastChanged ? html`
          <div class="opening-time">
            ${new Date(lastChanged).toLocaleTimeString()}
          </div>
        ` : html``}
      </div>
    `;
  }
}

if (!customElements.get('openings-popup')) {
  customElements.define('openings-popup', OpeningsPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'openings-popup': OpeningsPopup;
  }
}
