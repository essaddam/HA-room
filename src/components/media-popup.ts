import { html, css, TemplateResult, nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { PopupBase } from './popup-base.js';
import { logger } from '../const.js';

export class MediaPopup extends PopupBase {
  @property({ attribute: false }) public entityId!: string;

  static get styles() {
    return css`
      ${super.styles}

      .media-player {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 8px;
      }

      .media-cover {
        width: 180px;
        height: 180px;
        border-radius: 16px;
        object-fit: cover;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        background: var(--secondary-background-color, rgba(0,0,0,0.04));
      }

      .media-cover-empty {
        width: 180px;
        height: 180px;
        border-radius: 16px;
        background: var(--secondary-background-color, rgba(0,0,0,0.06));
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 64px;
        color: var(--secondary-text-color, #757575);
      }

      .media-info {
        text-align: center;
        max-width: 100%;
      }

      .media-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--primary-text-color, #212121);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .media-subtitle {
        font-size: 14px;
        color: var(--secondary-text-color, #757575);
      }

      .media-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .media-btn {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color, rgba(0,0,0,0.06));
        color: var(--primary-text-color, #212121);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        transition: background 0.15s ease, transform 0.1s ease;
      }

      .media-btn:hover {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .media-btn:active {
        transform: scale(0.95);
      }

      .media-btn.play {
        width: 64px;
        height: 64px;
        font-size: 32px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .media-btn.play:hover {
        background: var(--primary-color, #03a9f4);
        opacity: 0.9;
      }

      .volume-control {
        width: 100%;
        max-width: 280px;
        display: flex;
        align-items: center;
        gap: 12px;
        margin-top: 8px;
      }

      .volume-slider {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color, rgba(0,0,0,0.1));
        outline: none;
        -webkit-appearance: none;
      }

      .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }

      .volume-slider::-moz-range-thumb {
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
    `;
  }

  protected renderBody(): TemplateResult {
    if (!this.entityId) {
      return html`<div class="empty-state">Aucun lecteur configuré</div>`;
    }

    const stateObj = this.hass.states[this.entityId];
    if (!stateObj) return html`<div class="empty-state">Entité non trouvée</div>`;

    const isPlaying = stateObj.state === 'playing';
    const isPaused = stateObj.state === 'paused';
    const isOn = stateObj.state === 'on' || isPlaying || isPaused;
    const mediaTitle = stateObj.attributes?.media_title || 'Média';
    const mediaArtist = stateObj.attributes?.media_artist || '';
    const cover = stateObj.attributes?.entity_picture;
    const volume = (stateObj.attributes?.volume_level || 0) * 100;

    return html`
      <div class="media-player">
        ${cover
          ? html`<img class="media-cover" src="${cover}" alt="${mediaTitle}">`
          : html`<div class="media-cover-empty"><ha-icon icon="mdi:play-circle"></ha-icon></div>`
        }
        <div class="media-info">
          <div class="media-title">${mediaTitle}</div>
          ${mediaArtist ? html`<div class="media-subtitle">${mediaArtist}</div>` : nothing}
        </div>
        <div class="media-controls">
          <button class="media-btn" @click=${() => this._mediaService('media_previous_track')}>
            <ha-icon icon="mdi:skip-previous"></ha-icon>
          </button>
          <button class="media-btn play" @click=${() => this._mediaService(isPlaying ? 'media_pause' : 'media_play')}>
            <ha-icon icon=${isPlaying ? 'mdi:pause' : 'mdi:play'}></ha-icon>
          </button>
          <button class="media-btn" @click=${() => this._mediaService('media_next_track')}>
            <ha-icon icon="mdi:skip-next"></ha-icon>
          </button>
        </div>
        <div class="volume-control">
          <ha-icon icon="mdi:volume-medium"></ha-icon>
          <input
            type="range"
            class="volume-slider"
            min="0"
            max="100"
            .value=${String(Math.round(volume))}
            @input=${(e: Event) => this._setVolume((e.target as HTMLInputElement).value)}
          >
        </div>
        ${!isOn ? html`<button class="media-btn" @click=${() => this._mediaService('turn_on')}><ha-icon icon="mdi:power"></ha-icon></button>` : nothing}
      </div>
    `;
  }

  private _mediaService(service: string): void {
    logger.log('[Media Popup] Calling media service:', { entityId: this.entityId, service });
    try {
      this.hass.callService('media_player', service, { entity_id: this.entityId });
    } catch (error) {
      logger.error('[Media Popup] Error calling media service:', { entityId: this.entityId, service, error });
    }
  }

  private _setVolume(volume: string): void {
    const volumeLevel = parseInt(volume) / 100;
    logger.log('[Media Popup] Setting volume:', { entityId: this.entityId, volumeLevel });
    try {
      this.hass.callService('media_player', 'volume_set', {
        entity_id: this.entityId,
        volume_level: volumeLevel
      });
    } catch (error) {
      logger.error('[Media Popup] Error setting volume:', { entityId: this.entityId, volumeLevel, error });
    }
  }
}

if (!customElements.get('media-popup')) {
  customElements.define('media-popup', MediaPopup);
}

declare global {
  interface HTMLElementTagNameMap {
    'media-popup': MediaPopup;
  }
}
