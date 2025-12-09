import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';
import { CARD_VERSION, CARD_NAME, DEFAULT_CONFIG } from './const.js';
import { HaRoomCardConfig, RoomCardData } from './types.js';
import {
  computeEntityState,
  getNumericState,
  calculateEntityTotals,
  countEntitiesWithState,
  formatTemperature,
  formatHumidity,
  formatPower,
} from './utils.js';
import { HaRoomCardEditor } from './ha-room-card-editor.js';

console.info(
  `%c ${CARD_NAME} %c ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// Test modification for GitHub Actions workflow
console.log('🚀 GitHub Actions workflow test - modification effectuée');

// Register the card for the UI card picker
console.log('[HA Room Card] Registering custom card...');
(window as any).customCards = (window as any).customCards || [];
const cardConfig = {
  type: `custom:${CARD_NAME}`,
  name: 'HA Room Card',
  description: 'Custom room card with modern design and interactive features',
  preview: true,
  documentationURL: 'https://github.com/yourusername/ha-room-card#readme',
  schemaURL: '/hacsfiles/ha-room-card/ha-room-card.js',
};
console.log('[HA Room Card] Card config:', cardConfig);
(window as any).customCards.push(cardConfig);
console.log('[HA Room Card] Custom card registered successfully!');

@customElement(CARD_NAME)
export class HaRoomCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: HaRoomCardConfig;
  @state() private roomData: RoomCardData = {};

  static get styles() {
    return css`
      :host {
        display: block;
      }

      ha-card {
        background: linear-gradient(135deg, var(--bg-start) 0%, var(--bg-end) 100%);
        border-radius: 20px;
        padding: 16px;
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .card-header {
        background: transparent;
        --card-primary-font-size: 20px;
        --card-primary-font-weight: 650;
        margin-bottom: 12px;
      }

      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        padding: 6px 12px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .chip:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-1px);
      }

      /* Home Assistant 2025.12 enhanced animations */
      .chip {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .control-button {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Enhanced focus styles for accessibility */
      .chip:focus,
      .control-button:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .chip,
        .control-button {
          transition: none;
        }
      }

      .chip-icon {
        margin-right: 6px;
        font-size: 14px;
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }

      .button-grid:last-child {
        margin-bottom: 0;
      }

      .control-button {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
      }

      .control-button:hover {
        background: rgba(255, 255, 255, 0.25);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .control-button.primary {
        background: rgba(255, 193, 7, 0.15);
        border-color: rgba(255, 193, 7, 0.3);
      }

      .control-button.primary:hover {
        background: rgba(255, 193, 7, 0.25);
      }

      .control-button.secondary {
        background: rgba(156, 39, 176, 0.15);
        border-color: rgba(156, 39, 176, 0.3);
      }

      .control-button.secondary:hover {
        background: rgba(156, 39, 176, 0.25);
      }

      .control-button.tertiary {
        background: rgba(0, 188, 212, 0.15);
        border-color: rgba(0, 188, 212, 0.3);
      }

      .control-button.tertiary:hover {
        background: rgba(0, 188, 212, 0.25);
      }

      .button-icon {
        font-size: 24px;
        margin-bottom: 8px;
        display: block;
      }

      .button-title {
        font-size: 14px;
        font-weight: 600;
        color: white;
        margin-bottom: 4px;
      }

      .button-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
      }

      .media-cover {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
        margin-bottom: 8px;
      }

      .full-card-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
        z-index: 10;
      }

      @media (max-width: 768px) {
        .button-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        
        ha-card {
          padding: 12px;
        }
      }

      @media (max-width: 480px) {
        .button-grid {
          grid-template-columns: 1fr;
        }
        
        .chips-container {
          gap: 6px;
        }
        
        .chip {
          font-size: 11px;
          padding: 4px 8px;
        }
      }
    `;
  }

  public setConfig(config: HaRoomCardConfig): void {
    console.log('[HA Room Card] Setting config:', config);
    if (!config) {
      console.error('[HA Room Card] Invalid configuration provided');
      throw new Error('Invalid configuration');
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    console.log('[HA Room Card] Final config:', this.config);
  }

  protected shouldUpdate(): boolean {
    return true;
  }

  protected willUpdate(): void {
    this._updateRoomData();
  }

  private _updateRoomData(): void {
    console.log('[HA Room Card] Updating room data...');

    if (!this.hass || !this.config) {
      console.error('[HA Room Card] Missing hass or config:', { hass: !!this.hass, config: !!this.config });
      return;
    }

    const data: RoomCardData = {};
    console.log('[HA Room Card] Processing entities for room:', this.config.name);

    // Temperature
    if (this.config.temp_entity) {
      console.log('[HA Room Card] Getting temperature for entity:', this.config.temp_entity);
      try {
        data.temperature = getNumericState(this.hass, this.config.temp_entity);
        console.log('[HA Room Card] Temperature retrieved:', data.temperature);
      } catch (error) {
        console.error('[HA Room Card] Error getting temperature:', error);
      }
    }

    // Humidity
    if (this.config.hum_entity) {
      console.log('[HA Room Card] Getting humidity for entity:', this.config.hum_entity);
      try {
        data.humidity = getNumericState(this.hass, this.config.hum_entity);
        console.log('[HA Room Card] Humidity retrieved:', data.humidity);
      } catch (error) {
        console.error('[HA Room Card] Error getting humidity:', error);
      }
    }

    // Power total
    if (this.config.power_list?.length) {
      console.log('[HA Room Card] Calculating power total for entities:', this.config.power_list);
      try {
        data.power_total = calculateEntityTotals(this.hass, this.config.power_list);
        console.log('[HA Room Card] Power total calculated:', data.power_total);
      } catch (error) {
        console.error('[HA Room Card] Error calculating power total:', error);
      }
    }

    // Presence count
    if (this.config.presence_list?.length) {
      console.log('[HA Room Card] Counting presence for entities:', this.config.presence_list);
      try {
        data.presence_count = countEntitiesWithState(this.hass, this.config.presence_list, 'on');
        console.log('[HA Room Card] Presence count calculated:', data.presence_count);
      } catch (error) {
        console.error('[HA Room Card] Error counting presence:', error);
      }
    }

    // Open count
    if (this.config.open_list?.length) {
      console.log('[HA Room Card] Counting open entities:', this.config.open_list);
      try {
        data.open_count = countEntitiesWithState(this.hass, this.config.open_list, 'on');
        console.log('[HA Room Card] Open count calculated:', data.open_count);
      } catch (error) {
        console.error('[HA Room Card] Error counting open entities:', error);
      }
    }

    // Light counts
    if (this.config.light_list?.length) {
      console.log('[HA Room Card] Counting lights for entities:', this.config.light_list);
      try {
        data.light_count = this.config.light_list.length;
        data.light_on_count = countEntitiesWithState(this.hass, this.config.light_list, 'on');
        console.log('[HA Room Card] Light counts calculated:', {
          total: data.light_count,
          on: data.light_on_count
        });
      } catch (error) {
        console.error('[HA Room Card] Error counting lights:', error);
      }
    }

    console.log('[HA Room Card] Final room data:', data);
    this.roomData = data;
  }

  private _handleCardAction(): void {
    console.log('[HA Room Card] Handling card action...');

    if (!this.config.tap_action || !this.hass) {
      console.error('[HA Room Card] Missing tap_action or hass:', {
        tap_action: !!this.config.tap_action,
        hass: !!this.hass
      });
      return;
    }

    const action = this.config.tap_action;
    console.log('[HA Room Card] Action to handle:', action);

    // Handle navigation
    if (action.action === 'navigate' && action.navigation_path) {
      console.log('[HA Room Card] Navigating to:', action.navigation_path);
      try {
        window.location.href = action.navigation_path;
      } catch (error) {
        console.error('[HA Room Card] Navigation error:', error);
      }
      return;
    }

    // Handle more-info
    if (action.action === 'more-info' && action.entity) {
      console.log('[HA Room Card] Showing more info for entity:', action.entity);
      try {
        const event = new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId: action.entity },
        });
        this.dispatchEvent(event);
      } catch (error) {
        console.error('[HA Room Card] More info event error:', error);
      }
      return;
    }

    // Handle service calls
    if (action.action === 'call-service' && action.service) {
      console.log('[HA Room Card] Calling service:', action.service, 'with data:', action.service_data);
      try {
        const [domain, service] = action.service.split('.');
        console.log('[HA Room Card] Parsed service call:', { domain, service });

        if (!domain || !service) {
          console.error('[HA Room Card] Invalid service format:', action.service);
          return;
        }

        this.hass.callService(domain, service, action.service_data || {});
        console.log('[HA Room Card] Service call initiated successfully');
      } catch (error) {
        console.error('[HA Room Card] Service call error:', error);
      }
    } else {
      console.warn('[HA Room Card] Unknown action type or missing service:', action);
    }
  }

  private _renderChip(icon: string, color: string, content: string, action?: any, entity?: string): TemplateResult {
    return html`
      <div 
        class="chip" 
        style="--chip-color: ${color}"
        @click=${() => this._handleChipAction(action, entity)}
      >
        <ha-icon class="chip-icon" icon=${icon}></ha-icon>
        ${content}
      </div>
    `;
  }

  private _handleChipAction(action: any, entity?: string): void {
    console.log('[HA Room Card] Handling chip action:', { action, entity });

    if (!action || !this.hass) {
      console.error('[HA Room Card] Missing action or hass for chip:', { action: !!action, hass: !!this.hass });
      return;
    }

    // Handle navigation
    if (action.action === 'navigate' && action.navigation_path) {
      console.log('[HA Room Card] Chip navigating to:', action.navigation_path);
      try {
        window.location.href = action.navigation_path;
      } catch (error) {
        console.error('[HA Room Card] Chip navigation error:', error);
      }
      return;
    }

    // Handle more-info
    if (action.action === 'more-info' && entity) {
      console.log('[HA Room Card] Chip showing more info for entity:', entity);
      try {
        const event = new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId: entity },
        });
        this.dispatchEvent(event);
      } catch (error) {
        console.error('[HA Room Card] Chip more info event error:', error);
      }
      return;
    }

    // Handle service calls
    if (action.action === 'call-service' && action.service) {
      console.log('[HA Room Card] Chip calling service:', action.service, 'with data:', action.service_data);
      try {
        const [domain, service] = action.service.split('.');
        console.log('[HA Room Card] Chip parsed service call:', { domain, service });

        if (!domain || !service) {
          console.error('[HA Room Card] Chip invalid service format:', action.service);
          return;
        }

        this.hass.callService(domain, service, action.service_data || {});
        console.log('[HA Room Card] Chip service call initiated successfully');
      } catch (error) {
        console.error('[HA Room Card] Chip service call error:', error);
      }
    } else {
      console.warn('[HA Room Card] Chip unknown action type or missing service:', action);
    }
  }

  private _renderTemperatureChip(): TemplateResult | typeof nothing {
    if (!this.config.temp_entity) return nothing;

    const temp = this.roomData.temperature;
    const content = temp !== undefined ? formatTemperature(temp) : '—';

    return this._renderChip(
      'mdi:thermometer',
      'orange',
      content,
      { action: 'more-info' },
      this.config.temp_entity
    );
  }

  private _renderHumidityChip(): TemplateResult | typeof nothing {
    if (!this.config.hum_entity) return nothing;

    const humidity = this.roomData.humidity;
    const content = humidity !== undefined ? formatHumidity(humidity) : '—';

    return this._renderChip(
      'mdi:water-percent',
      'blue',
      content,
      { action: 'more-info' },
      this.config.hum_entity
    );
  }

  private _renderPowerChip(): TemplateResult | typeof nothing {
    if (!this.config.power_list?.length) return nothing;

    const power = this.roomData.power_total || 0;
    const content = formatPower(power);

    return this._renderChip(
      'mdi:flash',
      'yellow',
      content,
      { action: 'navigate', navigation_path: this.config.plugs_hash }
    );
  }

  private _renderPresenceChip(): TemplateResult | typeof nothing {
    if (!this.config.presence_list?.length) return nothing;

    const count = this.roomData.presence_count || 0;
    const content = `${count} présence${count > 1 ? 's' : ''}`;

    return this._renderChip(
      'mdi:motion-sensor',
      'teal',
      content,
      { action: 'navigate', navigation_path: this.config.presence_hash }
    );
  }

  private _renderOpenChip(): TemplateResult | typeof nothing {
    if (!this.config.open_list?.length) return nothing;

    const count = this.roomData.open_count || 0;
    const content = `${count} ouvert${count > 1 ? 's' : ''}`;

    return this._renderChip(
      'mdi:door-open',
      'red',
      content,
      { action: 'navigate', navigation_path: this.config.open_hash }
    );
  }

  private _renderControlButton(
    title: string,
    subtitle: string,
    icon: string,
    action: any,
    type: 'primary' | 'secondary' | 'tertiary' = 'primary',
    coverImage?: string
  ): TemplateResult {
    return html`
      <div 
        class="control-button ${type}"
        @click=${() => this._handleButtonAction(action)}
      >
        ${coverImage
        ? html`<img class="media-cover" src="${coverImage}" alt="${title}">`
        : html`<ha-icon class="button-icon" icon=${icon}></ha-icon>`
      }
        <div class="button-title">${title}</div>
        <div class="button-subtitle">${subtitle}</div>
      </div>
    `;
  }

  private _handleButtonAction(action: any): void {
    if (!action || !this.hass) return;

    // Handle navigation
    if (action.action === 'navigate' && action.navigation_path) {
      window.location.href = action.navigation_path;
      return;
    }

    // Handle more-info
    if (action.action === 'more-info' && action.entity) {
      const event = new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: action.entity },
      });
      this.dispatchEvent(event);
      return;
    }

    // Handle service calls
    if (action.action === 'call-service' && action.service) {
      const [domain, service] = action.service.split('.');
      this.hass.callService(domain, service, action.service_data || {});
    }
  }

  private _renderLightsButton(): TemplateResult {
    const onCount = this.roomData.light_on_count || 0;
    const totalCount = this.roomData.light_count || 0;
    const subtitle = `${onCount} / ${totalCount}`;

    return this._renderControlButton(
      'Lumières',
      subtitle,
      'mdi:lightbulb-group',
      { action: 'navigate', navigation_path: this.config.lights_hash },
      'primary'
    );
  }

  private _renderPlugsButton(): TemplateResult {
    const power = this.roomData.power_total || 0;
    const subtitle = formatPower(power);

    return this._renderControlButton(
      'Prises',
      subtitle,
      'mdi:power-socket-fr',
      { action: 'navigate', navigation_path: this.config.plugs_hash },
      'secondary'
    );
  }

  private _renderCoversButton(): TemplateResult {
    return this._renderControlButton(
      this.config.covers_label || 'Volets',
      'Ouvrir / Fermer',
      'mdi:blinds',
      { action: 'navigate', navigation_path: this.config.covers_hash },
      'tertiary'
    );
  }

  private _renderAudioButton(): TemplateResult {
    let subtitle = '—';
    let coverImage: string | undefined;

    if (this.config.audio_cover_entity) {
      const state = computeEntityState(this.hass, this.config.audio_cover_entity);
      if (state) {
        const mediaTitle = state.attributes?.media_title;
        const isPlaying = ['playing', 'paused'].includes(state.state);

        subtitle = isPlaying && mediaTitle ? mediaTitle : (isPlaying ? 'En cours' : 'Arrêt');
        coverImage = state.attributes?.entity_picture;
      }
    }

    return this._renderControlButton(
      'Audio',
      subtitle,
      'mdi:speaker',
      { action: 'navigate', navigation_path: this.config.audio_hash },
      'primary',
      coverImage
    );
  }

  private _renderVideoButton(): TemplateResult {
    let subtitle = '—';
    let coverImage: string | undefined;

    if (this.config.video_cover_entity) {
      const state = computeEntityState(this.hass, this.config.video_cover_entity);
      if (state) {
        const mediaTitle = state.attributes?.media_title;
        const isActive = ['playing', 'paused', 'on', 'idle'].includes(state.state);

        subtitle = isActive && mediaTitle ? mediaTitle : (isActive ? 'Actif' : 'Off');
        coverImage = state.attributes?.entity_picture;
      }
    }

    return this._renderControlButton(
      'Vidéo',
      subtitle,
      'mdi:television',
      { action: 'navigate', navigation_path: this.config.video_hash },
      'secondary',
      coverImage
    );
  }

  private _renderCamerasButton(): TemplateResult {
    return this._renderControlButton(
      'Caméras',
      'Live',
      'mdi:cctv',
      { action: 'navigate', navigation_path: this.config.cameras_hash },
      'tertiary'
    );
  }

  protected render(): TemplateResult {
    if (!this.config || !this.hass) {
      return html`<ha-card>Chargement...</ha-card>`;
    }

    // Support for Home Assistant 2025.12 theme variables
    const themes = this.hass.themes as any;
    const primaryColor = themes?.primaryColor || '#03a9f4';
    const textColor = themes?.textColor || '#ffffff';

    return html`
      <ha-card
        style="--bg-start: ${this.config.bg_start}; --bg-end: ${this.config.bg_end}; --primary-color: ${primaryColor}; --text-color: ${textColor}"
        @click=${this._handleCardAction}
        tabindex="0"
        .label=${`HA Room Card: ${this.config.name || 'Room'}`}
        role="button"
        aria-label=${`Room card for ${this.config.name || 'Room'}`}
      >
        <!-- Full card overlay for actions -->
        ${this.config.features?.includes('full_card_actions')
        ? html`<div class="full-card-overlay" @click=${() => this._handleCardAction()}></div>`
        : typeof nothing
      }

        <!-- Header -->
        <div class="card-header">
          <ha-card 
            header=${this.config.name || 'Pièce'}
            icon=${this.config.icon}
            icon_color=${this.config.icon_color}
          ></ha-card>
        </div>

        <!-- Chips Row -->
        <div class="chips-container">
          ${this._renderTemperatureChip()}
          ${this._renderHumidityChip()}
          ${this.config.extra_chips?.map(chip =>
        this._renderChip(chip.icon, chip.icon_color, chip.content, chip.tap_action)
      )}
          ${this._renderPowerChip()}
          ${this._renderPresenceChip()}
          ${this._renderOpenChip()}
        </div>

        <!-- First Button Row: Lights / Plugs / Covers -->
        <div class="button-grid">
          ${this._renderLightsButton()}
          ${this._renderPlugsButton()}
          ${this._renderCoversButton()}
        </div>

        <!-- Second Button Row: Audio / Video / Cameras -->
        <div class="button-grid">
          ${this._renderAudioButton()}
          ${this._renderVideoButton()}
          ${this._renderCamerasButton()}
        </div>
      </ha-card>
    `;
  }

  static getConfigForm() {
    return HaRoomCardEditor.getConfigForm();
  }

  static getStubConfig() {
    return HaRoomCardEditor.getStubConfig();
  }

  // Grid options for Sections view (Home Assistant 2025.12+)
  public getGridOptions() {
    return {
      rows: 4,
      columns: 6,
      min_rows: 3,
      max_rows: 5,
    };
  }

  // Enhanced card size for better masonry layout
  public getCardSize(): number {
    return 4; // 200px height (4 * 50px)
  }
}
