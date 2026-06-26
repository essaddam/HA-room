import { html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';
import { logger } from '../const.js';

export class LightsPopup extends PopupBase {
  @property({ attribute: false }) public lights!: string[];

  static get styles() {
    return css`
      ${super.styles}

      .lights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
      }

      .light-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 18px 12px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
        border: 1px solid var(--divider-color, rgba(0,0,0,0.06));
        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        text-align: center;
      }

      .light-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      }

      .light-item.on {
        background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
        border-color: rgba(255, 193, 7, 0.35);
        box-shadow: 0 4px 12px rgba(255, 193, 7, 0.18);
      }

      .light-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
        transition: background 0.2s ease, color 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }

      .light-item.on .light-icon {
        background: #ffc107;
        color: #3e2723;
      }

      .light-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .light-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color, #212121);
      }

      .light-state {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color, #757575);
      }

      .brightness-control {
        width: 100%;
        margin-top: 4px;
      }

      .brightness-slider {
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color, rgba(0,0,0,0.1));
        outline: none;
        -webkit-appearance: none;
      }

      .brightness-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .brightness-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        cursor: pointer;
        border: none;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .empty-state {
        text-align: center;
        padding: 32px 16px;
        color: var(--secondary-text-color, #757575);
        font-size: 14px;
      }

      @media (max-width: 600px) {
        .lights-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.lights?.length) {
      return html`<div class="empty-state">Aucune lumière configurée</div>`;
    }

    return html`
      <div class="lights-grid">
        ${this.lights.map(lightId => this._renderLight(lightId))}
      </div>
    `;
  }

  private _renderLight(entityId: string): TemplateResult {
    const stateObj = this.hass.states[entityId];
    if (!stateObj) return html``;

    const isOn = isEntityOn(this.hass, entityId);
    const friendlyName = getFriendlyName(this.hass, entityId);
    const icon = getIcon(this.hass, entityId);
    const brightness = stateObj.attributes?.brightness || 0;

    return html`
      <div
        class="light-item ${isOn ? 'on' : ''}"
        @click=${() => this._toggleLight(entityId)}
      >
        <div class="light-icon">
          <ha-icon icon=${icon}></ha-icon>
        </div>
        <div class="light-info">
          <div class="light-name">${friendlyName}</div>
          <div class="light-state">${isOn ? 'Allumé' : 'Éteint'}</div>
        </div>
        ${isOn ? html`
          <div class="brightness-control">
            <input
              type="range"
              class="brightness-slider"
              min="0"
              max="255"
              .value=${String(brightness)}
              @input=${(e: Event) => this._setBrightness(entityId, (e.target as HTMLInputElement).value)}
              @click=${(e: Event) => e.stopPropagation()}
            >
          </div>
        ` : html``}
      </div>
    `;
  }

  private _toggleLight(entityId: string): void {
    logger.log('[Lights Popup] Toggling light:', entityId);

    if (!this.hass) {
      logger.error('[Lights Popup] Home Assistant instance not available');
      return;
    }

    try {
      const isOn = isEntityOn(this.hass, entityId);
      const service = isOn ? 'turn_off' : 'turn_on';
      this.hass.callService('light', service, { entity_id: entityId });
      logger.log('[Lights Popup] Service call initiated successfully');
    } catch (error) {
      logger.error('[Lights Popup] Error toggling light:', { entityId, error });
    }
  }

  private _setBrightness(entityId: string, brightness: string): void {
    logger.log('[Lights Popup] Setting brightness:', { entityId, brightness });

    if (!this.hass) {
      logger.error('[Lights Popup] Home Assistant instance not available');
      return;
    }

    try {
      const brightnessValue = parseInt(brightness);
      if (isNaN(brightnessValue)) {
        logger.error('[Lights Popup] Invalid brightness value:', brightness);
        return;
      }

      this.hass.callService('light', 'turn_on', {
        entity_id: entityId,
        brightness: brightnessValue
      });
      logger.log('[Lights Popup] Brightness service call initiated successfully');
    } catch (error) {
      logger.error('[Lights Popup] Error setting brightness:', { entityId, brightness, error });
    }
  }
}

if (!customElements.get('lights-popup')) {
  customElements.define('lights-popup', LightsPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'lights-popup': LightsPopup;
  }
}
