import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { HaRoomCardConfig } from './types.js';
import { CARD_EDITOR_NAME } from './const.js';
import { loadHaComponents } from './utils/loader.js';

@customElement(CARD_EDITOR_NAME)
export class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: HaRoomCardConfig;

  connectedCallback() {
    super.connectedCallback();
    void loadHaComponents();
  }

  public setConfig(config: any): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

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
