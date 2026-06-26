import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { getFriendlyName } from '../utils.js';

export class CamerasPopup extends PopupBase {
  @property({ attribute: false }) public entities!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .cameras-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 16px;
      }

      .camera-item {
        border-radius: 16px;
        overflow: hidden;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
      }

      .camera-feed {
        width: 100%;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background: #000;
        display: block;
      }

      .camera-feed-placeholder {
        width: 100%;
        aspect-ratio: 16 / 9;
        background: var(--secondary-background-color, rgba(0,0,0,0.06));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 48px;
        color: var(--secondary-text-color, #757575);
      }

      .camera-name {
        padding: 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
        text-align: center;
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .cameras-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entities?.length) {
      return html`<div class="empty-state">Aucune caméra configurée</div>`;
    }

    return html`
      <div class="cameras-grid">
        ${this.entities.map(entityId => this._renderCamera(entityId))}
      </div>
    `;
  }

  private _renderCamera(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const friendlyName = getFriendlyName(this.hass, entityId);
    const stillUrl = stateObj.attributes?.entity_picture;

    return html`
      <div class="camera-item" @click=${() => this._openMoreInfo(entityId)}>
        ${stillUrl
          ? html`<img class="camera-feed" src="${stillUrl}" alt="${friendlyName}">`
          : html`<div class="camera-feed-placeholder"><ha-icon icon="mdi:cctv"></ha-icon></div>`
        }
        <div class="camera-name">${friendlyName}</div>
      </div>
    `;
  }

  private _openMoreInfo(entityId: string): void {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId }
    }));
  }
}

if (!customElements.get('cameras-popup')) {
  customElements.define('cameras-popup', CamerasPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'cameras-popup': CamerasPopup;
  }
}
