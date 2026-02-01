import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { HaRoomCardConfig } from './types.js';
import { CARD_EDITOR_NAME } from './const.js';
import { loadHaComponents, areComponentsLoaded } from './utils/loader.js';

export class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: HaRoomCardConfig;
  @state() private _componentsLoaded = false;

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 16px 0;
      }
      .error {
        color: var(--error-color, #db4437);
        background: var(--error-background, rgba(219, 68, 55, 0.1));
        border: 1px solid var(--error-color, #db4437);
        border-radius: 8px;
        padding: 16px;
        margin: 8px 0;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        color: var(--secondary-text-color);
      }
      .manual-config {
        margin-top: 16px;
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
        font-size: 0.9em;
        margin-top: 8px;
        padding: 8px;
        background: var(--secondary-background-color);
        border-radius: 4px;
      }
      .section-title {
        font-weight: 500;
        margin: 16px 0 8px 0;
        color: var(--primary-text-color);
      }
      .entity-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 8px 0;
      }
      .entity-row input {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
      }
      .entity-row button {
        padding: 8px 16px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
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
        // Try again after a short delay
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
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    // If components are loaded, use the full form editor
    if (this._componentsLoaded && customElements.get('ha-form')) {
      return this._renderHaForm();
    }

    // Otherwise, use the fallback manual editor
    return this._renderFallbackEditor();
  }

  private _renderHaForm() {
    if (!this._config || !this.hass) return nothing;

    const schema = this._getSchema();
    const data = this._config;

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${schema}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _renderFallbackEditor() {
    if (!this._config) return nothing;

    const configJson = JSON.stringify(this._config, null, 2);

    return html`
      <div class="info">
        <strong>Mode édition manuel</strong><br>
        L'éditeur visuel n'a pas pu être chargé. Vous pouvez modifier la configuration manuellement ci-dessous.
      </div>

      <div class="manual-config">
        <div class="section-title">Configuration JSON</div>
        <textarea
          .value=${configJson}
          @change=${this._handleJsonChange}
        ></textarea>
      </div>

      <div class="info" style="margin-top: 16px;">
        <strong>Conseil :</strong> Utilisez les sélecteurs d'entités de Home Assistant pour trouver vos entités,
        puis copiez leurs IDs dans la configuration.
      </div>
    `;
  }

  private _handleJsonChange(ev: Event) {
    const target = ev.target as HTMLTextAreaElement;
    try {
      const config = JSON.parse(target.value);
      fireEvent(this, 'config-changed', { config });
    } catch (e) {
      // Don't fire event on invalid JSON - user can fix and try again
    }
  }

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, 'config-changed', { config: ev.detail.value });
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
      power_list: 'Liste des capteurs de puissance',
      light_list: 'Liste des lumières',
      presence_list: 'Liste des capteurs de présence',
      open_list: 'Liste des ouvrants',
      lights_hash: 'Hash navigation lumières',
      plugs_hash: 'Hash navigation prises',
      covers_hash: 'Hash navigation volets',
      presence_hash: 'Hash navigation présence',
      open_hash: 'Hash navigation ouvrants',
      audio_hash: 'Hash navigation audio',
      video_hash: 'Hash navigation vidéo',
      cameras_hash: 'Hash navigation caméras',
      audio_cover_entity: 'Entité audio pour pochette',
      video_cover_entity: 'Entité vidéo pour pochette',
      covers_label: 'Label pour les volets',
      features: 'Fonctionnalités avancées',
      tap_action: 'Action au clic',
      hold_action: 'Action au maintien',
      double_tap_action: 'Action au double-clic'
    };
    return labels[schema.name] || schema.name;
  };

  private _getSchema() {
    return [
      // Basic configuration
      {
        name: "name",
        selector: { text: {} },
      },
      {
        name: "icon",
        selector: { icon: {} },
      },
      {
        name: "icon_color",
        selector: { text: {} },
      },

      // Appearance section
      {
        type: "expandable",
        label: "Apparence",
        icon: "mdi:palette",
        schema: [
          {
            name: "bg_start",
            selector: { color: {} },
          },
          {
            name: "bg_end",
            selector: { color: {} },
          },
        ],
      },

      // Sensors section
      {
        type: "expandable",
        label: "Capteurs",
        icon: "mdi:gauge",
        schema: [
          {
            name: "temp_entity",
            selector: {
              entity: {
                domain: ["sensor", "climate"]
              }
            },
          },
          {
            name: "hum_entity",
            selector: {
              entity: {
                domain: ["sensor"]
              }
            },
          },
        ],
      },

      // Entity lists section
      {
        type: "expandable",
        label: "Listes d'entités",
        icon: "mdi:list",
        schema: [
          {
            name: "power_list",
            selector: {
              entity: {
                domain: ["sensor"],
                multiple: true
              }
            },
          },
          {
            name: "light_list",
            selector: {
              entity: {
                domain: ["light"],
                multiple: true
              }
            },
          },
          {
            name: "presence_list",
            selector: {
              entity: {
                domain: ["binary_sensor", "device_tracker"],
                multiple: true
              }
            },
          },
          {
            name: "open_list",
            selector: {
              entity: {
                domain: ["binary_sensor"],
                multiple: true
              }
            },
          },
        ],
      },

      // Navigation hashes section
      {
        type: "expandable",
        label: "Navigation",
        icon: "mdi:navigation",
        schema: [
          {
            name: "lights_hash",
            selector: { text: {} },
          },
          {
            name: "plugs_hash",
            selector: { text: {} },
          },
          {
            name: "covers_hash",
            selector: { text: {} },
          },
          {
            name: "presence_hash",
            selector: { text: {} },
          },
          {
            name: "open_hash",
            selector: { text: {} },
          },
          {
            name: "audio_hash",
            selector: { text: {} },
          },
          {
            name: "video_hash",
            selector: { text: {} },
          },
          {
            name: "cameras_hash",
            selector: { text: {} },
          },
        ],
      },

      // Media entities section
      {
        type: "expandable",
        label: "Média",
        icon: "mdi:play-circle",
        schema: [
          {
            name: "audio_cover_entity",
            selector: {
              entity: {
                domain: ["media_player"]
              }
            },
          },
          {
            name: "video_cover_entity",
            selector: {
              entity: {
                domain: ["media_player"]
              }
            },
          },
        ],
      },

      // Labels and customization section
      {
        type: "expandable",
        label: "Personnalisation",
        icon: "mdi:cog",
        schema: [
          {
            name: "covers_label",
            selector: { text: {} },
          },
          {
            name: "features",
            selector: {
              select: {
                options: [
                  { value: "full_card_actions", label: "Actions sur toute la carte" },
                  { value: "enhanced_animations", label: "Animations améliorées" },
                  { value: "adaptive_themes", label: "Thèmes adaptatifs" },
                ],
                multiple: true,
              }
            },
          },
        ],
      },

      // Actions section
      {
        type: "expandable",
        label: "Actions",
        icon: "mdi:gesture-tap",
        schema: [
          {
            name: "tap_action",
            selector: { action: {} },
          },
          {
            name: "hold_action",
            selector: { action: {} },
          },
          {
            name: "double_tap_action",
            selector: { action: {} },
          },
        ],
      },
    ];
  }
}

// Element registration - guard against double registration in scoped registry
(function() {
  const name = CARD_EDITOR_NAME;
  if (customElements.get(name)) {
    // Already registered in this scope, skip silently
    return;
  }
  try {
    customElements.define(name, HaRoomCardEditor);
  } catch (e) {
    // Silently ignore registration errors in scoped registry contexts
  }
})();
