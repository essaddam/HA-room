import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { getFriendlyName, getIcon } from '../utils.js';
import { logger } from '../const.js';

export class CoversPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .covers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 12px;
      }

      .cover-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 18px 12px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        text-align: center;
      }

      .cover-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      }

      .cover-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
      }

      .cover-state {
        font-size: 12px;
        color: var(--secondary-text-color, #757575);
      }

      .cover-controls {
        display: flex;
        gap: 8px;
      }

      .cover-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        border: none;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        transition: background 0.15s ease;
      }

      .cover-btn:hover {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .covers-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<div class="empty-state">Aucun volet configuré</div>`;
    }

    return html`
      <div class="covers-grid">
        ${this.entities.map(entityId => this._renderCover(entityId))}
      </div>
    `;
  }

  private _renderCover(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const friendlyName = getFriendlyName(this.hass, entityId);
    const icon = getIcon(this.hass, entityId);
    const state = stateObj.state;

    return html`
      <div class="cover-item">
        <div class="cover-icon">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        <div class="cover-name">${friendlyName}</div>
        <div class="cover-state">${this._formatState(state)}</div>
        <div class="cover-controls">
          <button class="cover-btn" @click=${() => this._callCoverService(entityId, 'open_cover')}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <button class="cover-btn" @click=${() => this._callCoverService(entityId, 'stop_cover')}>
            <ha-icon icon="mdi:stop"></ha-icon>
          </button>
          <button class="cover-btn" @click=${() => this._callCoverService(entityId, 'close_cover')}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
        </div>
      </div>
    `;
  }

  private _formatState(state: string): string {
    const states: Record<string, string> = {
      open: 'Ouvert',
      closed: 'Fermé',
      opening: 'Ouverture...',
      closing: 'Fermeture...',
      stopped: 'Arrêté',
    };
    return states[state] || state;
  }

  private _callCoverService(entityId: string, service: string): void {
    logger.log('[Covers Popup] Calling cover service:', { entityId, service });
    try {
      this.hass.callService('cover', service, { entity_id: entityId });
    } catch (error) {
      logger.error('[Covers Popup] Error calling cover service:', { entityId, service, error });
    }
  }
}

if (!customElements.get('covers-popup')) {
  customElements.define('covers-popup', CoversPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'covers-popup': CoversPopup;
  }
}
