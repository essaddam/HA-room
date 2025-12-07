import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { isEntityOn, getFriendlyName, getIcon } from '../utils.js';

@customElement('lights-popup')
export class LightsPopup extends PopupBase {
  @property({ attribute: false }) public lights!: string[];

  static get styles() {
    return css`
      .lights-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }

      .light-item {
        background: var(--card-background-color, white);
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .light-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .light-item.on {
        background: linear-gradient(135deg, #ffeb3b 0%, #ffc107 100%);
        color: var(--text-primary-color);
      }

      .light-icon {
        font-size: 32px;
        margin-bottom: 8px;
        display: block;
      }

      .light-name {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
      }

      .light-state {
        font-size: 12px;
        opacity: 0.8;
      }

      .brightness-control {
        margin-top: 12px;
      }

      .brightness-slider {
        width: 100%;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
        outline: none;
        -webkit-appearance: none;
      }

      .brightness-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
      }

      .brightness-slider::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color);
        cursor: pointer;
        border: none;
      }

      @media (max-width: 768px) {
        .lights-grid {
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 12px;
          }
        }
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.lights?.length) {
      return html`<p>Aucune lumière configurée</p>`;
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
        <ha-icon class="light-icon" icon=${icon}></ha-icon>
        <div class="light-name">${friendlyName}</div>
        <div class="light-state">${isOn ? 'Allumé' : 'Éteint'}</div>
        ${isOn ? html`
          <div class="brightness-control">
            <input 
              type="range" 
              class="brightness-slider"
              min="0" 
              max="255" 
              value=${brightness}
              @input=${(e: Event) => this._setBrightness(entityId, (e.target as HTMLInputElement).value)}
              @click=${(e: Event) => e.stopPropagation()}
            >
          </div>
        ` : html``}
      </div>
    `;
  }

  private _toggleLight(entityId: string): void {
    const isOn = isEntityOn(this.hass, entityId);
    this.hass.callService('light', isOn ? 'turn_off' : 'turn_on', {
      entity_id: entityId
    });
  }

  private _setBrightness(entityId: string, brightness: string): void {
    this.hass.callService('light', 'turn_on', {
      entity_id: entityId,
      brightness: parseInt(brightness)
    });
  }
}