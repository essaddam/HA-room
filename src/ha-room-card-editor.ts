import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { HaRoomCardConfig } from './types.js';
import { CARD_EDITOR_NAME } from './const.js';
import { loadHaComponents, areComponentsLoaded } from './utils/loader.js';

interface EntityListDef {
  name: keyof HaRoomCardConfig;
  label: string;
  helper: string;
  domain: string | string[];
}

const ENTITY_LISTS: EntityListDef[] = [
  {
    name: 'power_list',
    label: 'Capteurs de puissance',
    helper: 'Entités à additionner pour afficher la consommation totale (W).',
    domain: ['sensor'],
  },
  {
    name: 'light_list',
    label: 'Lumières',
    helper: 'Lumières de la pièce. Le badge affiche combien sont allumées.',
    domain: ['light'],
  },
  {
    name: 'presence_list',
    label: 'Capteurs de présence',
    helper: 'Détecteurs de mouvement/présence de la pièce.',
    domain: ['binary_sensor', 'device_tracker'],
  },
  {
    name: 'open_list',
    label: 'Ouvrants',
    helper: 'Portes, fenêtres ou tout capteur ouvert/fermé de la pièce.',
    domain: ['binary_sensor'],
  },
];

const NAVIGATION_HASHES = [
  { name: 'lights_hash', label: 'Vue Lumières', helper: "Hash ou chemin de la vue regroupant les lumières (ex. #lights-salon)." },
  { name: 'plugs_hash', label: 'Vue Prises', helper: "Hash ou chemin de la vue regroupant les prises (ex. #plugs-salon)." },
  { name: 'covers_hash', label: 'Vue Volets', helper: "Hash ou chemin de la vue regroupant les volets (ex. #covers-salon)." },
  { name: 'presence_hash', label: 'Vue Présence', helper: "Hash ou chemin de la vue regroupant les capteurs de présence." },
  { name: 'open_hash', label: 'Vue Ouvrants', helper: "Hash ou chemin de la vue regroupant les ouvrants." },
  { name: 'audio_hash', label: 'Vue Audio', helper: "Hash ou chemin de la vue audio." },
  { name: 'video_hash', label: 'Vue Vidéo', helper: "Hash ou chemin de la vue vidéo." },
  { name: 'cameras_hash', label: 'Vue Caméras', helper: "Hash ou chemin de la vue caméras." },
];

export class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: HaRoomCardConfig;
  @state() private _componentsLoaded = false;
  @state() private _pendingEntity: Record<string, string> = {};
  @state() private _showAdvanced = false;

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 8px 0;
      }
      .editor-section {
        margin: 16px 0;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 12px;
        background: var(--card-background-color);
      }
      .section-header {
        font-weight: 600;
        font-size: 1rem;
        margin-bottom: 12px;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-subtitle {
        font-size: 0.85em;
        color: var(--secondary-text-color);
        margin-bottom: 12px;
      }
      .field-helper {
        font-size: 0.8em;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }
      .entity-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        margin: 8px 0;
      }
      .entity-row ha-entity-picker {
        flex: 1;
      }
      .entity-list {
        margin-top: 8px;
      }
      .entity-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        margin: 4px;
        background: var(--secondary-background-color);
        border-radius: 12px;
        font-size: 0.85em;
      }
      .entity-tag button {
        background: none;
        border: none;
        color: var(--error-color);
        cursor: pointer;
        font-size: 1.2em;
        line-height: 1;
      }
      .add-btn {
        padding: 8px 16px;
        background: var(--primary-color);
        color: var(--text-primary-color, white);
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font: inherit;
      }
      .add-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .toggle-advanced {
        margin: 16px 0;
      }
      .toggle-advanced button {
        width: 100%;
        padding: 10px;
        background: transparent;
        border: 1px dashed var(--divider-color);
        border-radius: 8px;
        color: var(--primary-text-color);
        cursor: pointer;
        font: inherit;
      }
      .error {
        color: var(--error-color, #db4437);
        background: var(--error-background, rgba(219, 68, 55, 0.1));
        border: 1px solid var(--error-color, #db4437);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: var(--secondary-text-color);
      }
      .manual-config textarea {
        width: 100%;
        min-height: 200px;
        font-family: monospace;
        font-size: 14px;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        resize: vertical;
      }
      .info {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        margin-top: 8px;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadComponents();
  }

  private async _loadComponents() {
    try {
      await loadHaComponents();
      this._componentsLoaded = areComponentsLoaded();
      if (!this._componentsLoaded) {
        setTimeout(async () => {
          await loadHaComponents();
          this._componentsLoaded = areComponentsLoaded();
        }, 2000);
      }
    } catch (e) {
      console.error('[HA Room Card] Failed to load components:', e);
    }
  }

  public setConfig(config: any): void {
    this._config = {
      power_list: [],
      light_list: [],
      presence_list: [],
      open_list: [],
      ...config,
    };
    this._showAdvanced = false;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    if (this._componentsLoaded && customElements.get('ha-form')) {
      return this._renderEditor();
    }

    return this._renderFallbackEditor();
  }

  private _renderEditor() {
    if (!this._config || !this.hass) return nothing;

    return html`
      ${this._renderGeneralSection()}
      ${this._renderSensorsSection()}
      ${this._renderControlsSection()}
      ${this._renderAppearanceSection()}
      ${this._renderEntityListsSection()}
      ${this._renderAdvancedToggle()}
      ${this._showAdvanced ? this._renderAdvancedSections() : nothing}
    `;
  }

  private _renderGeneralSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Général</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ name: this._config.name, icon: this._config.icon, icon_color: this._config.icon_color }}
          .schema=${[
            { name: 'name', selector: { text: {} } },
            { name: 'icon', selector: { icon: {} } },
            { name: 'icon_color', selector: { color: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderSensorsSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Capteurs</div>
        <div class="section-subtitle">Température, humidité et consommation affichés sous forme de badges.</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ temp_entity: this._config.temp_entity, hum_entity: this._config.hum_entity }}
          .schema=${[
            { name: 'temp_entity', selector: { entity: { domain: ['sensor', 'climate'] } } },
            { name: 'hum_entity', selector: { entity: { domain: ['sensor'] } } },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderControlsSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Contrôles</div>
        <div class="section-subtitle">Boutons de navigation vers les vues Volets, Audio et Vidéo.</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ covers_label: this._config.covers_label, audio_cover_entity: this._config.audio_cover_entity, video_cover_entity: this._config.video_cover_entity }}
          .schema=${[
            { name: 'covers_label', selector: { text: {} } },
            { name: 'audio_cover_entity', selector: { entity: { domain: ['media_player'] } } },
            { name: 'video_cover_entity', selector: { entity: { domain: ['media_player'] } } },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderAppearanceSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Apparence</div>
        <div class="section-subtitle">Dégradé de fond de la carte.</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ bg_start: this._config.bg_start, bg_end: this._config.bg_end }}
          .schema=${[
            { name: 'bg_start', selector: { color: {} } },
            { name: 'bg_end', selector: { color: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderEntityListsSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Listes d'entités</div>
        <div class="section-subtitle">Groupes d'entités utilisés pour les badges et les boutons.</div>
        ${ENTITY_LISTS.map((item) => this._renderEntityListEditor(item))}
      </div>
    `;
  }

  private _renderEntityListEditor(item: EntityListDef) {
    if (!this._config || !this.hass) return nothing;

    const list = (this._config[item.name] as string[] | undefined) || [];
    const pending = this._pendingEntity[item.name] || '';

    return html`
      <div style="margin: 12px 0;">
        <div style="font-weight: 500; margin-bottom: 4px;">${item.label}</div>
        <div class="field-helper">${item.helper}</div>
        <div class="entity-row">
          <ha-entity-picker
            .hass=${this.hass}
            .label=${`Ajouter ${item.label.toLowerCase()}`}
            .includeDomains=${Array.isArray(item.domain) ? item.domain : [item.domain]}
            .value=${pending}
            @value-changed=${(ev: CustomEvent) => {
              this._pendingEntity = { ...this._pendingEntity, [item.name]: ev.detail.value };
            }}
          ></ha-entity-picker>
          <button
            class="add-btn"
            ?disabled=${!pending}
            @click=${() => this._addEntityToList(item.name)}
          >
            Ajouter
          </button>
        </div>
        <div class="entity-list">
          ${list.length === 0
            ? html`<div class="info">Aucune entité sélectionnée</div>`
            : list.map(
                (entityId) => html`
                  <div class="entity-tag">
                    ${entityId}
                    <button
                      @click=${() => this._removeEntityFromList(item.name, entityId)}
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                `
              )}
        </div>
      </div>
    `;
  }

  private _renderAdvancedToggle() {
    return html`
      <div class="toggle-advanced">
        <button @click=${() => { this._showAdvanced = !this._showAdvanced; }}>
          ${this._showAdvanced ? 'Masquer les options avancées' : 'Afficher les options avancées'}
        </button>
      </div>
    `;
  }

  private _renderAdvancedSections() {
    if (!this._config || !this.hass) return nothing;

    return html`
      ${this._renderNavigationSection()}
      ${this._renderActionsSection()}
      ${this._renderFeaturesSection()}
    `;
  }

  private _renderNavigationSection() {
    if (!this._config || !this.hass) return nothing;

    const data: Record<string, string | undefined> = {};
    NAVIGATION_HASHES.forEach((h) => { data[h.name] = (this._config as any)[h.name]; });

    return html`
      <div class="editor-section">
        <div class="section-header">Navigation</div>
        <div class="section-subtitle">Hashes ou chemins des vues vers lesquelles les badges et boutons naviguent.</div>
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${NAVIGATION_HASHES.map((h) => ({ name: h.name, selector: { text: {} } }))}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderActionsSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Actions</div>
        <div class="section-subtitle">Actions exécutées au clic, double-clic ou maintien sur la carte.</div>
        <ha-form
          .hass=${this.hass}
          .data=${{
            card_tap_action: this._config.card_tap_action,
            tap_action: this._config.tap_action,
            hold_action: this._config.hold_action,
            double_tap_action: this._config.double_tap_action,
          }}
          .schema=${[
            { name: 'card_tap_action', selector: { action: {} } },
            { name: 'tap_action', selector: { action: {} } },
            { name: 'hold_action', selector: { action: {} } },
            { name: 'double_tap_action', selector: { action: {} } },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _renderFeaturesSection() {
    if (!this._config || !this.hass) return nothing;

    return html`
      <div class="editor-section">
        <div class="section-header">Options avancées</div>
        <ha-form
          .hass=${this.hass}
          .data=${{ features: this._config.features }}
          .schema=${[
            {
              name: 'features',
              selector: {
                select: {
                  options: [
                    { value: 'full_card_actions', label: 'Actions sur toute la carte' },
                    { value: 'enhanced_animations', label: 'Animations améliorées' },
                    { value: 'adaptive_themes', label: 'Thèmes adaptatifs' },
                    { value: 'hide_empty_sections', label: 'Masquer les sections vides' },
                    { value: 'hide_chips', label: 'Masquer les chips' },
                    { value: 'hide_lights_button', label: 'Masquer le bouton Lumières' },
                    { value: 'hide_plugs_button', label: 'Masquer le bouton Prises' },
                    { value: 'hide_covers_button', label: 'Masquer le bouton Volets' },
                    { value: 'hide_audio_button', label: 'Masquer le bouton Audio' },
                    { value: 'hide_video_button', label: 'Masquer le bouton Vidéo' },
                    { value: 'hide_cameras_button', label: 'Masquer le bouton Caméras' },
                  ],
                  multiple: true,
                }
              }
            },
          ]}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${(ev: CustomEvent) => this._updateConfig(ev.detail.value)}
        ></ha-form>
      </div>
    `;
  }

  private _addEntityToList(name: keyof HaRoomCardConfig) {
    const entityId = this._pendingEntity[name];
    if (!entityId || !this._config) return;

    const list = [...((this._config[name] as string[] | undefined) || [])];
    if (list.includes(entityId)) return;

    list.push(entityId);
    this._updateConfig({ [name]: list });
    this._pendingEntity = { ...this._pendingEntity, [name]: '' };
  }

  private _removeEntityFromList(name: keyof HaRoomCardConfig, entityId: string) {
    if (!this._config) return;

    const list = [...((this._config[name] as string[] | undefined) || [])];
    const index = list.indexOf(entityId);
    if (index === -1) return;

    list.splice(index, 1);
    this._updateConfig({ [name]: list });
  }

  private _updateConfig(changes: Partial<HaRoomCardConfig>) {
    if (!this._config) return;
    const newConfig = { ...this._config, ...changes };
    ENTITY_LISTS.forEach((item) => {
      const key = item.name as keyof HaRoomCardConfig;
      const val = newConfig[key];
      if (val === undefined) {
        (newConfig as any)[key] = [];
      } else if (!Array.isArray(val)) {
        (newConfig as any)[key] = [val];
      }
    });
    this._config = newConfig;
    fireEvent(this, 'config-changed', { config: newConfig });
  }

  private _renderFallbackEditor() {
    if (!this._config) return nothing;

    const configJson = JSON.stringify(this._config, null, 2);

    return html`
      <div class="error">
        <strong>Mode édition manuel</strong><br>
        L'éditeur visuel n'a pas pu être chargé. Modifie la configuration ci-dessous.
      </div>
      <textarea
        .value=${configJson}
        @change=${this._handleJsonChange}
      ></textarea>
    `;
  }

  private _handleJsonChange(ev: Event) {
    const target = ev.target as HTMLTextAreaElement;
    try {
      const config = JSON.parse(target.value);
      fireEvent(this, 'config-changed', { config });
    } catch (e) {
      // Don't fire event on invalid JSON
    }
  }

  private _computeLabel = (schema: any) => {
    const labels: Record<string, string> = {
      name: 'Nom de la pièce',
      icon: 'Icône',
      icon_color: 'Couleur de l\'icône',
      bg_start: 'Couleur de fond (début)',
      bg_end: 'Couleur de fond (fin)',
      temp_entity: 'Capteur de température',
      hum_entity: 'Capteur d\'humidité',
      covers_label: 'Label du bouton Volets',
      audio_cover_entity: 'Lecteur audio (pochette)',
      video_cover_entity: 'Lecteur vidéo (pochette)',
      lights_hash: 'Vue Lumières',
      plugs_hash: 'Vue Prises',
      covers_hash: 'Vue Volets',
      presence_hash: 'Vue Présence',
      open_hash: 'Vue Ouvrants',
      audio_hash: 'Vue Audio',
      video_hash: 'Vue Vidéo',
      cameras_hash: 'Vue Caméras',
      features: 'Options avancées',
      card_tap_action: 'Action au clic sur la carte',
      tap_action: 'Action au clic (déprécié)',
      hold_action: 'Action au maintien',
      double_tap_action: 'Action au double-clic',
    };
    return labels[schema.name] || schema.name;
  };

  private _computeHelper = (schema: any) => {
    const helpers: Record<string, string> = {
      name: 'Ex. Salon, Chambre, Cuisine',
      icon: 'Icône affichée à gauche du nom',
      icon_color: 'Couleur de l\'icône (laisse vide pour blanc)',
      bg_start: 'Couleur du début du dégradé',
      bg_end: 'Couleur de la fin du dégradé',
      temp_entity: 'Entité affichant la température de la pièce',
      hum_entity: 'Entité affichant l\'humidité de la pièce',
      covers_label: 'Texte du bouton Volets (par défaut : Volets)',
      audio_cover_entity: 'Lecteur media utilisé pour la pochette et le titre audio',
      video_cover_entity: 'Lecteur media utilisé pour la pochette et le titre vidéo',
      lights_hash: 'Hash de navigation pour le bouton/ badge Lumières',
      plugs_hash: 'Hash de navigation pour le badge Prises',
      covers_hash: 'Hash de navigation pour le bouton Volets',
      presence_hash: 'Hash de navigation pour le badge Présence',
      open_hash: 'Hash de navigation pour le badge Ouvrants',
      audio_hash: 'Hash de navigation pour le bouton Audio',
      video_hash: 'Hash de navigation pour le bouton Vidéo',
      cameras_hash: 'Hash de navigation pour le bouton Caméras',
      card_tap_action: 'Action quand on clique sur le fond de la carte',
      tap_action: 'Ancienne option, préfère "Action au clic sur la carte"',
      hold_action: 'Action quand on maintient le doigt/appui long sur la carte',
      double_tap_action: 'Action au double-clic sur la carte',
      features: 'Options de personnalisation et de masquage',
    };
    return helpers[schema.name] || '';
  };
}

(function() {
  const name = CARD_EDITOR_NAME;
  if (customElements.get(name)) {
    return;
  }
  try {
    customElements.define(name, HaRoomCardEditor);
  } catch (e) {
    // Silently ignore registration errors in scoped registry contexts
  }
})();
