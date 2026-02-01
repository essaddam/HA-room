import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { CARD_VERSION, CARD_NAME, CARD_ELEMENT_NAME, CARD_FULL_NAME, CARD_EDITOR_NAME, DEFAULT_CONFIG, logger } from './const.js';
import { HaRoomCardConfig, RoomCardData, ChangedProperties, CardAction, isNavigateAction, isMoreInfoAction, isCallServiceAction } from './types.js';
import {
  computeEntityState,
  getNumericState,
  calculateEntityTotals,
  countEntitiesWithState,
  formatTemperature,
  formatHumidity,
  formatPower,
  registerCustomCard,
} from './utils.js';
import { loadHaComponents } from './utils/loader.js';
import './ha-room-card-editor.js';


console.info(
  `%c ${CARD_NAME} %c ${CARD_VERSION}`,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

// Register the card for the UI card picker
registerCustomCard({
  type: `custom:${CARD_NAME}`,
  name: 'HA Room Card',
  description: 'Custom room card with modern design and interactive features',
});

logger.log(`[HA Room Card] Registering custom card with type: custom:${CARD_NAME}`);
logger.log(`[HA Room Card] CARD_NAME value: ${CARD_NAME}`);

@customElement(CARD_ELEMENT_NAME)
export class HaRoomCard extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config!: HaRoomCardConfig;
  @state() private roomData: RoomCardData = {};

  constructor() {
    super();
    logger.log(`[HA Room Card] Constructor called for element: ${CARD_NAME}`);

    // Ensure the element is properly connected
    this.updateComplete.then(() => {
      logger.log(`[HA Room Card] Element ${CARD_NAME} is now connected and ready`);
    });
  }

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
        margin-bottom: 12px;
      }

      .card-title {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 650;
        color: white;
        margin: 0;
        padding: 0;
      }

      .card-title ha-icon {
        margin-right: 8px;
        font-size: 24px;
      }

      .error {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        font-weight: 500;
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
    logger.log('[HA Room Card] Setting config:', config);

    if (!config) {
      logger.error('[HA Room Card] Invalid configuration provided');
      throw new Error('Invalid configuration');
    }

    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    logger.log('[HA Room Card] Final config:', this.config);

    // Trigger a re-render after config is set
    this.requestUpdate();
  }

  protected willUpdate(changedProperties: ChangedProperties): void {
    // Only update room data if hass or config has changed
    if (changedProperties.has('hass') || changedProperties.has('config')) {
      this._updateRoomData();
    }
  }

  private _updateRoomData(): void {
    logger.log('[HA Room Card] Updating room data for:', this.config?.name || 'Unknown room');

    if (!this.hass || !this.config) {
      logger.error('[HA Room Card] Missing hass or config');
      return;
    }

    const data: RoomCardData = {};

    // Temperature
    if (this.config.temp_entity) {
      logger.log('[HA Room Card] Getting temperature for:', this.config.temp_entity);
      try {
        data.temperature = getNumericState(this.hass, this.config.temp_entity);
        logger.log('[HA Room Card] Temperature:', data.temperature);
      } catch (error) {
        logger.error('[HA Room Card] Error getting temperature:', error);
      }
    }

    // Humidity
    if (this.config.hum_entity) {
      logger.log('[HA Room Card] Getting humidity for:', this.config.hum_entity);
      try {
        data.humidity = getNumericState(this.hass, this.config.hum_entity);
        logger.log('[HA Room Card] Humidity:', data.humidity);
      } catch (error) {
        logger.error('[HA Room Card] Error getting humidity:', error);
      }
    }

    // Power total
    if (this.config.power_list?.length) {
      logger.log('[HA Room Card] Calculating power for:', this.config.power_list);
      try {
        data.power_total = calculateEntityTotals(this.hass, this.config.power_list);
        logger.log('[HA Room Card] Power total:', data.power_total);
      } catch (error) {
        logger.error('[HA Room Card] Error calculating power:', error);
      }
    }

    // Presence count
    if (this.config.presence_list?.length) {
      logger.log('[HA Room Card] Counting presence for:', this.config.presence_list);
      try {
        data.presence_count = countEntitiesWithState(this.hass, this.config.presence_list, 'on');
        logger.log('[HA Room Card] Presence count:', data.presence_count);
      } catch (error) {
        logger.error('[HA Room Card] Error counting presence:', error);
      }
    }

    // Open count
    if (this.config.open_list?.length) {
      logger.log('[HA Room Card] Counting open entities for:', this.config.open_list);
      try {
        data.open_count = countEntitiesWithState(this.hass, this.config.open_list, 'on');
        logger.log('[HA Room Card] Open count:', data.open_count);
      } catch (error) {
        logger.error('[HA Room Card] Error counting open entities:', error);
      }
    }

    // Light counts
    if (this.config.light_list?.length) {
      logger.log('[HA Room Card] Counting lights for:', this.config.light_list);
      try {
        data.light_count = this.config.light_list.length;
        data.light_on_count = countEntitiesWithState(this.hass, this.config.light_list, 'on');
        logger.log('[HA Room Card] Light counts:', { total: data.light_count, on: data.light_on_count });
      } catch (error) {
        logger.error('[HA Room Card] Error counting lights:', error);
      }
    }

    logger.log('[HA Room Card] Final room data:', data);
    this.roomData = data;
  }

  private _isValidNavigationPath(path: string): boolean {
    // Allow hash-based navigation (most common in HA), absolute paths, or external URLs
    return /^#[a-zA-Z0-9_-]+$/.test(path) ||
           /^\/[a-zA-Z0-9_/-]+$/.test(path) ||
           /^https:\/\/[a-zA-Z0-9][-a-zA-Z0-9]*\.[-a-zA-Z0-9.]+/.test(path);
  }

  private _executeAction(action: CardAction | undefined, context: string): void {
    if (!action || !this.hass) {
      logger.error(`[HA Room Card] Missing action or hass in ${context}:`, { action: !!action, hass: !!this.hass });
      return;
    }

    logger.log(`[HA Room Card] ${context} executing action:`, action);

    // Handle navigation
    if (isNavigateAction(action)) {
      if (!this._isValidNavigationPath(action.navigation_path)) {
        logger.error(`[HA Room Card] Invalid navigation path:`, action.navigation_path);
        return;
      }
      logger.log(`[HA Room Card] ${context} navigating to:`, action.navigation_path);
      try {
        window.location.href = action.navigation_path;
      } catch (error) {
        logger.error(`[HA Room Card] ${context} navigation error:`, error);
      }
      return;
    }

    // Handle more-info
    if (isMoreInfoAction(action)) {
      logger.log(`[HA Room Card] ${context} showing more info for entity:`, action.entity);
      try {
        const event = new CustomEvent('hass-more-info', {
          bubbles: true,
          composed: true,
          detail: { entityId: action.entity },
        });
        this.dispatchEvent(event);
      } catch (error) {
        logger.error(`[HA Room Card] ${context} more info event error:`, error);
      }
      return;
    }

    // Handle service calls
    if (isCallServiceAction(action)) {
      logger.log(`[HA Room Card] ${context} calling service:`, action.service, 'with data:', action.service_data);
      try {
        const [domain, service] = action.service.split('.');
        logger.log(`[HA Room Card] ${context} parsed service call:`, { domain, service });

        if (!domain || !service) {
          logger.error(`[HA Room Card] ${context} invalid service format:`, action.service);
          return;
        }

        this.hass.callService(domain, service, action.service_data || {});
        logger.log(`[HA Room Card] ${context} service call initiated successfully`);
      } catch (error) {
        logger.error(`[HA Room Card] ${context} service call error:`, error);
      }
    } else {
      logger.warn(`[HA Room Card] ${context} unknown action type or missing service:`, action);
    }
  }

  private _handleCardAction(): void {
    logger.log('[HA Room Card] Handling card action...');

    if (!this.config.tap_action || !this.hass) {
      logger.error('[HA Room Card] Missing tap_action or hass:', {
        tap_action: !!this.config.tap_action,
        hass: !!this.hass
      });
      return;
    }

    this._executeAction(this.config.tap_action, 'card');
  }

  private _renderChip(icon: string, color: string, content: string, action?: CardAction, entity?: string): TemplateResult {
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

  private _handleChipAction(action: CardAction | undefined, entity?: string): void {
    // Pass entity as action.entity if provided for more-info actions
    if (entity && action) {
      const actionWithEntity: CardAction = { ...action, entity } as CardAction;
      this._executeAction(actionWithEntity, 'chip');
    } else {
      this._executeAction(action, 'chip');
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
    action: CardAction,
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

  private _handleButtonAction(action: CardAction): void {
    this._executeAction(action, 'button');
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
    logger.log('[HA Room Card] Render called - config:', !!this.config, 'hass:', !!this.hass);

    if (!this.config) {
      logger.error('[HA Room Card] Missing config in render');
      return html`<ha-card><div class="error">Configuration manquante</div></ha-card>`;
    }

    if (!this.hass) {
      logger.error('[HA Room Card] Missing hass in render');
      return html`<ha-card><div class="error">Home Assistant non disponible</div></ha-card>`;
    }

    // Support for Home Assistant 2025.12 theme variables
    // Get the current theme or fall back to default theme properties
    const currentTheme = this.hass.themes?.themes?.[this.hass.themes.default_theme];
    const primaryColor = currentTheme?.['primary-color'] ?? '#03a9f4';
    const textColor = currentTheme?.['text-primary-color'] ?? '#ffffff';

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
        : nothing
      }

        <!-- Header -->
        <div class="card-header">
          <h1 class="card-title">
            <ha-icon icon=${this.config.icon || 'mdi:home'}></ha-icon>
            ${this.config.name || 'Pièce'}
          </h1>
        </div>

        <!-- Chips Row -->
        <div class="chips-container">
          ${this._renderTemperatureChip()}
          ${this._renderHumidityChip()}
          ${this.config.extra_chips?.map(chip => {
        const sanitizedContent = chip.content?.replace(/[<>"']/g, '') ?? '';
        const sanitizedIcon = chip.icon?.replace(/[<>"']/g, '') ?? 'mdi:help-circle';
        const sanitizedColor = chip.icon_color?.replace(/[<>"']/g, '') ?? 'white';
        return this._renderChip(sanitizedIcon, sanitizedColor, sanitizedContent, chip.tap_action);
      })}
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

  public static getConfigElement(): LovelaceCardEditor {
    return document.createElement(CARD_EDITOR_NAME) as LovelaceCardEditor;
  }

  static getStubConfig() {
    return {
      type: CARD_FULL_NAME,
      name: 'Salon',
      icon: 'mdi:home',
      icon_color: '#ffffff',
      bg_start: '#667eea',
      bg_end: '#764ba2',
      power_list: [],
      light_list: [],
      presence_list: [],
      open_list: [],
    };
  }

  // Grid options for Sections view (Home Assistant 2025.12+)
  public getGridOptions() {
    return {
      rows: 4,
      columns: 6,
      min_rows: 3,
      max_rows: 5,
      min_columns: 4,
      max_columns: 6,
    };
  }

  // Enhanced card size for better masonry layout
  public getCardSize(): number {
    return 4; // 200px height (4 * 50px)
  }
}

// Explicit element registration with error handling
try {
  if (!customElements.get(CARD_ELEMENT_NAME)) {
    customElements.define(CARD_ELEMENT_NAME, HaRoomCard);
    console.info(`[HA Room Card] Element "${CARD_ELEMENT_NAME}" registered successfully`);
  } else {
    console.warn(`[HA Room Card] Element "${CARD_ELEMENT_NAME}" was already registered`);
  }
} catch (error) {
  console.error(`[HA Room Card] Failed to register element:`, error);
}

// Pre-load HA components for the editor
void loadHaComponents();
