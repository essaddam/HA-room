import { LitElement, html, css, TemplateResult, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant, LovelaceCardEditor, navigate } from 'custom-card-helpers';
import { CARD_VERSION, CARD_NAME, CARD_ELEMENT_NAME, CARD_FULL_NAME, CARD_EDITOR_NAME, DEFAULT_CONFIG, logger } from './const.js';
import { HaRoomCardConfig, RoomCardData, ChangedProperties, CardAction, isNavigateAction, isMoreInfoAction, isCallServiceAction, isPerformAction } from './types.js';
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
import { LightsPopup } from './components/lights-popup.js';


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
        border-radius: 16px;
        padding: 16px;
        position: relative;
        overflow: hidden;
        transition: box-shadow 0.2s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      ha-card:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.16);
      }

      .card-header {
        background: transparent;
        margin-bottom: 12px;
      }

      .card-title {
        display: flex;
        align-items: center;
        font-size: 20px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: white;
        margin: 0;
        padding: 0;
      }

      .card-title ha-icon {
        margin-right: 10px;
        font-size: 24px;
        color: var(--icon-color, white);
      }

      .error {
        color: #ff6b6b;
        background: rgba(255, 107, 107, 0.1);
        border: 1px solid rgba(255, 107, 107, 0.3);
        border-radius: 12px;
        padding: 12px;
        text-align: center;
        font-weight: 500;
      }

      .chips-container {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 12px;
      }

      .chip {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;
        background: rgba(255, 255, 255, 0.14);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .chip:hover {
        background: rgba(255, 255, 255, 0.24);
      }

      .chip:focus,
      .control-button:focus {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      @media (prefers-reduced-motion: reduce) {
        .chip,
        .control-button,
        ha-card {
          transition: none;
        }
      }

      .chip-icon {
        margin-right: 4px;
        font-size: 12px;
      }

      .button-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 10px;
      }

      .button-grid:last-child {
        margin-bottom: 0;
      }

      .button-grid:empty {
        display: none;
      }

      .control-button {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 10px 6px;
        text-align: center;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.15s ease;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 76px;
      }

      .control-button:hover {
        background: rgba(255, 255, 255, 0.18);
        transform: translateY(-1px);
      }

      .control-button:active {
        transform: translateY(0);
      }

      .control-button.primary {
        background: rgba(255, 193, 7, 0.14);
        border-color: rgba(255, 193, 7, 0.2);
      }

      .control-button.primary:hover {
        background: rgba(255, 193, 7, 0.22);
      }

      .control-button.secondary {
        background: rgba(156, 39, 176, 0.14);
        border-color: rgba(156, 39, 176, 0.2);
      }

      .control-button.secondary:hover {
        background: rgba(156, 39, 176, 0.22);
      }

      .control-button.tertiary {
        background: rgba(0, 188, 212, 0.14);
        border-color: rgba(0, 188, 212, 0.2);
      }

      .control-button.tertiary:hover {
        background: rgba(0, 188, 212, 0.22);
      }

      .button-icon {
        font-size: 22px;
        margin-bottom: 6px;
        display: block;
        color: white;
      }

      .button-title {
        font-size: 11px;
        font-weight: 600;
        color: white;
        margin-bottom: 2px;
        letter-spacing: 0;
        white-space: normal;
        word-break: normal;
        overflow-wrap: break-word;
        line-height: 1.2;
      }

      .button-subtitle {
        font-size: 10px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.8);
      }

      .media-cover {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
        margin-bottom: 6px;
      }

      .card-action-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        cursor: pointer;
        z-index: 0;
      }

      .card-content {
        position: relative;
        z-index: 1;
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
          padding: 14px;
        }

        .card-title {
          font-size: 18px;
        }
      }

      @media (max-width: 480px) {
        .button-grid {
          grid-template-columns: 1fr;
        }

        .chips-container {
          gap: 5px;
        }

        .chip {
          font-size: 10px;
          padding: 3px 7px;
        }

        .button-title {
          font-size: 12px;
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

    // Warn users that the generic tap_action is handled by HA and may conflict with inner buttons.
    if (this.config.tap_action && !this.config.card_tap_action) {
      logger.warn('[HA Room Card] Using deprecated "tap_action". Prefer "card_tap_action" to avoid conflicts with chips/buttons.');
    }

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

  public static isValidNavigationPath(path: string): boolean {
    // Allow hash-based navigation (most common in HA), absolute paths, or external URLs
    return /^#[a-zA-Z0-9_-]+$/.test(path) ||
           /^\/[a-zA-Z0-9_/-]+$/.test(path) ||
           /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*(?::\d+)?/.test(path);
  }

  private _executeAction(action: CardAction | undefined, context: string): void {
    if (!action || !this.hass) {
      logger.error(`[HA Room Card] Missing action or hass in ${context}:`, { action: !!action, hass: !!this.hass });
      return;
    }

    logger.log(`[HA Room Card] ${context} executing action:`, action);

    // Handle navigation
    if (isNavigateAction(action)) {
      if (!HaRoomCard.isValidNavigationPath(action.navigation_path)) {
        logger.error(`[HA Room Card] Invalid navigation path:`, action.navigation_path);
        return;
      }
      logger.log(`[HA Room Card] ${context} navigating to:`, action.navigation_path);
      try {
        navigate(this, action.navigation_path);
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

    // Handle service calls (legacy call-service)
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
      return;
    }

    // Handle perform-action (Home Assistant 2025.12+)
    if (isPerformAction(action)) {
      logger.log(`[HA Room Card] ${context} performing action:`, action.perform_action, 'with data:', action.data);
      try {
        const [domain, service] = action.perform_action.split('.');
        logger.log(`[HA Room Card] ${context} parsed perform action:`, { domain, service });

        if (!domain || !service) {
          logger.error(`[HA Room Card] ${context} invalid perform_action format:`, action.perform_action);
          return;
        }

        this.hass.callService(domain, service, action.data || {}, action.target);
        logger.log(`[HA Room Card] ${context} perform action initiated successfully`);
      } catch (error) {
        logger.error(`[HA Room Card] ${context} perform action error:`, error);
      }
      return;
    }

    logger.warn(`[HA Room Card] ${context} unknown action type or missing service:`, action);
  }

  private _getCardAction(): CardAction | undefined {
    return this.config.card_tap_action ?? this.config.tap_action;
  }

  private _handleCardAction(): void {
    logger.log('[HA Room Card] Handling card action...');

    const action = this._getCardAction();

    if (!action || !this.hass) {
      logger.error('[HA Room Card] Missing card action or hass:', {
        card_tap_action: !!this.config.card_tap_action,
        tap_action: !!this.config.tap_action,
        hass: !!this.hass
      });
      return;
    }

    this._executeAction(action, 'card');
  }

  private _renderChip(icon: string, color: string, content: string, action?: CardAction, entity?: string): TemplateResult {
    return html`
      <div 
        class="chip" 
        style="--chip-color: ${color}"
        @click=${(ev: Event) => {
          ev.stopImmediatePropagation();
          ev.stopPropagation();
          ev.preventDefault();
          this._handleChipAction(action, entity);
        }}
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
        @click=${(ev: Event) => {
          ev.stopImmediatePropagation();
          ev.stopPropagation();
          ev.preventDefault();
          this._handleButtonAction(action);
        }}
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

    return html`
      <div
        class="control-button primary"
        @click=${(ev: Event) => {
          ev.stopImmediatePropagation();
          ev.stopPropagation();
          ev.preventDefault();
          this._openLightsPopup();
        }}
      >
        <ha-icon class="button-icon" icon="mdi:lightbulb-group"></ha-icon>
        <div class="button-title">Lumières</div>
        <div class="button-subtitle">${subtitle}</div>
      </div>
    `;
  }

  private _openLightsPopup(): void {
    if (!this.hass || !this.config.light_list?.length) {
      logger.warn('[HA Room Card] Cannot open lights popup: missing hass or light_list');
      return;
    }

    const popup = new LightsPopup();
    popup.hass = this.hass;
    popup.lights = this.config.light_list;
    popup.config = { title: 'Lumières', icon: 'mdi:lightbulb-group' };
    popup.open();
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
      'Contrôler',
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

  private _hasFeature(feature: string): boolean {
    return this.config.features?.includes(feature) ?? false;
  }

  private _shouldHideEmptySections(): boolean {
    return this._hasFeature('hide_empty_sections');
  }

  private _hasVisibleChips(): boolean {
    if (this._hasFeature('hide_chips')) return false;
    return !!(
      this.config.temp_entity ||
      this.config.hum_entity ||
      this.config.power_list?.length ||
      this.config.presence_list?.length ||
      this.config.open_list?.length ||
      this.config.extra_chips?.length
    );
  }

  private _shouldRenderLightsButton(): boolean {
    if (this._hasFeature('hide_lights_button')) return false;
    if (!this._shouldHideEmptySections()) return true;
    return !!this.config.light_list?.length;
  }

  private _shouldRenderPlugsButton(): boolean {
    if (this._hasFeature('hide_plugs_button')) return false;
    if (!this._shouldHideEmptySections()) return true;
    return !!this.config.power_list?.length;
  }

  private _shouldRenderCoversButton(): boolean {
    return !this._hasFeature('hide_covers_button');
  }

  private _shouldRenderAudioButton(): boolean {
    if (this._hasFeature('hide_audio_button')) return false;
    if (!this._shouldHideEmptySections()) return true;
    return !!this.config.audio_cover_entity;
  }

  private _shouldRenderVideoButton(): boolean {
    if (this._hasFeature('hide_video_button')) return false;
    if (!this._shouldHideEmptySections()) return true;
    return !!this.config.video_cover_entity;
  }

  private _shouldRenderCamerasButton(): boolean {
    return !this._hasFeature('hide_cameras_button');
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

    const hasCardAction = !!(this.config.card_tap_action || this.config.tap_action);
    const firstRowCount = [this._shouldRenderLightsButton(), this._shouldRenderPlugsButton(), this._shouldRenderCoversButton()].filter(Boolean).length;
    const secondRowCount = [this._shouldRenderAudioButton(), this._shouldRenderVideoButton(), this._shouldRenderCamerasButton()].filter(Boolean).length;

    return html`
      <ha-card
        style="--bg-start: ${this.config.bg_start}; --bg-end: ${this.config.bg_end}; --primary-color: ${primaryColor}; --text-color: ${textColor}; --icon-color: ${this.config.icon_color || 'white'}"
        tabindex="0"
        .label=${`HA Room Card: ${this.config.name || 'Room'}`}
        role="button"
        aria-label=${`Room card for ${this.config.name || 'Room'}`}
      >
        <!-- Click overlay that covers the whole card background.
             Content is stacked above it (z-index:1) so chips/buttons never hit it. -->
        ${hasCardAction
          ? html`<div class="card-action-overlay" @click=${(ev: Event) => { ev.stopPropagation(); this._handleCardAction(); }}></div>`
          : nothing}

        <!-- Legacy full-card overlay kept for users that explicitly opt-in -->
        ${this.config.features?.includes('full_card_actions')
          ? html`<div class="full-card-overlay" @click=${(ev: Event) => { ev.stopPropagation(); this._handleCardAction(); }}></div>`
          : nothing}

        <div class="card-content">
          <!-- Header -->
          <div class="card-header">
            <h1 class="card-title">
              <ha-icon icon=${this.config.icon || 'mdi:home'}></ha-icon>
              ${this.config.name || 'Pièce'}
            </h1>
          </div>

          <!-- Chips Row -->
          ${this._hasVisibleChips()
            ? html`<div class="chips-container">
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
              </div>`
            : nothing}

          <!-- First Button Row: Lights / Plugs / Covers -->
          ${firstRowCount > 0
            ? html`<div class="button-grid" style="grid-template-columns: repeat(${firstRowCount}, minmax(0, 1fr));">
                ${this._shouldRenderLightsButton() ? this._renderLightsButton() : nothing}
                ${this._shouldRenderPlugsButton() ? this._renderPlugsButton() : nothing}
                ${this._shouldRenderCoversButton() ? this._renderCoversButton() : nothing}
              </div>`
            : nothing}

          <!-- Second Button Row: Audio / Video / Cameras -->
          ${secondRowCount > 0
            ? html`<div class="button-grid" style="grid-template-columns: repeat(${secondRowCount}, minmax(0, 1fr));">
                ${this._shouldRenderAudioButton() ? this._renderAudioButton() : nothing}
                ${this._shouldRenderVideoButton() ? this._renderVideoButton() : nothing}
                ${this._shouldRenderCamerasButton() ? this._renderCamerasButton() : nothing}
              </div>`
            : nothing}
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

// Element registration - guard against double registration in scoped registry
(function() {
  const name = CARD_ELEMENT_NAME;
  if (customElements.get(name)) {
    // Already registered in this scope, skip silently
    return;
  }
  try {
    customElements.define(name, HaRoomCard);
  } catch (e) {
    // Silently ignore registration errors in scoped registry contexts
  }
})();

// Pre-load HA components for the editor
void loadHaComponents();
