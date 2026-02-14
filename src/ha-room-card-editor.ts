import { LitElement, html, css, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { HomeAssistant, fireEvent, LovelaceCardEditor } from 'custom-card-helpers';
import { HaRoomCardConfig } from './types.js';
import { CARD_EDITOR_NAME } from './const.js';
import { loadHaComponents } from './utils/loader.js';

// Schema for ha-form following the official HA frontend pattern
// Reference: home-assistant/frontend tile-card-editor.ts and mushroom-cards
const SCHEMA = [
  // Basic configuration - always visible
  {
    name: "name",
    selector: { text: {} },
  },
  {
    name: "",
    type: "grid" as const,
    schema: [
      {
        name: "icon",
        selector: { icon: {} },
      },
      {
        name: "icon_color",
        selector: { text: { type: "color" } },
      },
    ],
  },

  // Appearance section
  {
    name: "appearance",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:palette",
    schema: [
      {
        name: "",
        type: "grid" as const,
        schema: [
          {
            name: "bg_start",
            selector: { text: { type: "color" } },
          },
          {
            name: "bg_end",
            selector: { text: { type: "color" } },
          },
        ],
      },
    ],
  },

  // Sensors section
  {
    name: "sensors",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:gauge",
    schema: [
      {
        name: "temp_entity",
        selector: {
          entity: {
            filter: [
              { domain: "sensor", device_class: "temperature" },
              { domain: "climate" },
            ],
          },
        },
      },
      {
        name: "hum_entity",
        selector: {
          entity: {
            filter: { domain: "sensor", device_class: "humidity" },
          },
        },
      },
    ],
  },

  // Entity lists section
  {
    name: "entity_lists",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:format-list-bulleted",
    schema: [
      {
        name: "light_list",
        selector: {
          entity: {
            filter: { domain: "light" },
            multiple: true,
          },
        },
      },
      {
        name: "power_list",
        selector: {
          entity: {
            filter: { domain: "sensor", device_class: "power" },
            multiple: true,
          },
        },
      },
      {
        name: "presence_list",
        selector: {
          entity: {
            filter: [
              { domain: "binary_sensor", device_class: "motion" },
              { domain: "binary_sensor", device_class: "occupancy" },
              { domain: "binary_sensor", device_class: "presence" },
              { domain: "device_tracker" },
            ],
            multiple: true,
          },
        },
      },
      {
        name: "open_list",
        selector: {
          entity: {
            filter: [
              { domain: "binary_sensor", device_class: "door" },
              { domain: "binary_sensor", device_class: "window" },
              { domain: "binary_sensor", device_class: "opening" },
            ],
            multiple: true,
          },
        },
      },
    ],
  },

  // Navigation hashes section
  {
    name: "navigation",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:link-variant",
    schema: [
      {
        name: "",
        type: "grid" as const,
        schema: [
          {
            name: "lights_hash",
            selector: { text: {} },
          },
          {
            name: "plugs_hash",
            selector: { text: {} },
          },
        ],
      },
      {
        name: "",
        type: "grid" as const,
        schema: [
          {
            name: "covers_hash",
            selector: { text: {} },
          },
          {
            name: "presence_hash",
            selector: { text: {} },
          },
        ],
      },
      {
        name: "",
        type: "grid" as const,
        schema: [
          {
            name: "open_hash",
            selector: { text: {} },
          },
          {
            name: "audio_hash",
            selector: { text: {} },
          },
        ],
      },
      {
        name: "",
        type: "grid" as const,
        schema: [
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
    ],
  },

  // Media entities section
  {
    name: "media",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:play-circle",
    schema: [
      {
        name: "audio_cover_entity",
        selector: {
          entity: {
            filter: { domain: "media_player" },
          },
        },
      },
      {
        name: "video_cover_entity",
        selector: {
          entity: {
            filter: { domain: "media_player" },
          },
        },
      },
    ],
  },

  // Customization section
  {
    name: "customization",
    type: "expandable" as const,
    flatten: true,
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
            mode: "list",
          },
        },
      },
    ],
  },

  // Actions section
  {
    name: "interactions",
    type: "expandable" as const,
    flatten: true,
    icon: "mdi:gesture-tap",
    schema: [
      {
        name: "tap_action",
        selector: { "ui-action": {} },
      },
      {
        name: "hold_action",
        selector: { "ui-action": {} },
      },
      {
        name: "double_tap_action",
        selector: { "ui-action": {} },
      },
    ],
  },
];

// Labels for form fields and sections
const LABELS: Record<string, string> = {
  name: 'Nom de la pièce',
  icon: 'Icône',
  icon_color: 'Couleur de l\'icône',
  appearance: 'Apparence',
  bg_start: 'Couleur de fond (début)',
  bg_end: 'Couleur de fond (fin)',
  sensors: 'Capteurs',
  temp_entity: 'Capteur de température',
  hum_entity: 'Capteur d\'humidité',
  entity_lists: 'Listes d\'entités',
  power_list: 'Capteurs de puissance',
  light_list: 'Lumières',
  presence_list: 'Capteurs de présence',
  open_list: 'Ouvrants (portes/fenêtres)',
  navigation: 'Navigation (hashes)',
  lights_hash: 'Hash lumières',
  plugs_hash: 'Hash prises',
  covers_hash: 'Hash volets',
  presence_hash: 'Hash présence',
  open_hash: 'Hash ouvrants',
  audio_hash: 'Hash audio',
  video_hash: 'Hash vidéo',
  cameras_hash: 'Hash caméras',
  media: 'Média',
  audio_cover_entity: 'Lecteur audio (pochette)',
  video_cover_entity: 'Lecteur vidéo (pochette)',
  customization: 'Personnalisation',
  covers_label: 'Label volets',
  features: 'Fonctionnalités',
  interactions: 'Actions',
  tap_action: 'Action au clic',
  hold_action: 'Action au maintien',
  double_tap_action: 'Action au double-clic',
};

export class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: HaRoomCardConfig;

  static get styles() {
    return css`
      :host {
        display: block;
      }
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    loadHaComponents();
  }

  public setConfig(config: any): void {
    this._config = config;
  }

  protected render() {
    if (!this.hass || !this._config) {
      return nothing;
    }

    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }

  private _computeLabel = (schema: any): string => {
    // Try HA built-in localization first
    const haLabel = this.hass?.localize?.(
      `ui.panel.lovelace.editor.card.generic.${schema.name}`
    );
    if (haLabel) return haLabel;

    return LABELS[schema.name] || schema.name || '';
  };

  private _valueChanged(ev: CustomEvent): void {
    fireEvent(this, 'config-changed', { config: ev.detail.value });
  }
}

// Element registration
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
