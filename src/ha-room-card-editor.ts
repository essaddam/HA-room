import { HaRoomCardConfig } from './types.js';

/**
 * Configuration form editor for HA Room Card
 * Provides visual editor interface for Home Assistant dashboard
 */
export class HaRoomCardEditor {
  /**
   * Get the form schema for the visual editor
   */
  static getConfigForm() {
    console.log('[HA Room Card Editor] Getting config form...');
    // Validation function for the configuration
    const assertConfig = (config: HaRoomCardConfig) => {
      console.log('[HA Room Card Editor] Validating config:', config);

      if (!config.name || typeof config.name !== 'string') {
        console.error('[HA Room Card Editor] Name validation failed:', config.name);
        throw new Error('Le nom de la pièce est requis et doit être une chaîne de caractères');
      }
      if (config.icon && typeof config.icon !== 'string') {
        console.error('[HA Room Card Editor] Icon validation failed:', config.icon);
        throw new Error('L\'icône doit être une chaîne de caractères valide');
      }
      if (config.icon_color && !/^#[0-9a-fA-F]{6}$/.test(config.icon_color)) {
        console.error('[HA Room Card Editor] Icon color validation failed:', config.icon_color);
        throw new Error('La couleur de l\'icône doit être au format hexadécimal (#RRGGBB)');
      }
      if (config.bg_start && !/^#[0-9a-fA-F]{6}$/.test(config.bg_start)) {
        console.error('[HA Room Card Editor] BG start color validation failed:', config.bg_start);
        throw new Error('La couleur de fond de départ doit être au format hexadécimal (#RRGGBB)');
      }
      if (config.bg_end && !/^#[0-9a-fA-F]{6}$/.test(config.bg_end)) {
        console.error('[HA Room Card Editor] BG end color validation failed:', config.bg_end);
        throw new Error('La couleur de fin de fond doit être au format hexadécimal (#RRGGBB)');
      }

      console.log('[HA Room Card Editor] Config validation successful');
    };

    // Label localization function
    const computeLabel = (schema: { name: string }) => {
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

    const formSchema = {
      schema: [
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
      ],
      assertConfig,
      computeLabel,
    };

    console.log('[HA Room Card Editor] Form schema created:', formSchema);
    return formSchema;
  }

  /**
   * Get default configuration for new card instances
   */
  static getStubConfig() {
    console.log('[HA Room Card Editor] Getting stub config...');
    const stubConfig = {
      type: "custom:ha-room-card",
      name: 'Salon',
      icon: 'mdi:home',
      icon_color: '#ffffff',
      bg_start: '#667eea',
      bg_end: '#764ba2',
      temp_entity: 'sensor.temperature_salon',
      hum_entity: 'sensor.humidity_salon',
      power_list: ['sensor.tv_power', 'sensor.lamp_power'],
      light_list: ['light.living_room_main', 'light.living_roomAccent'],
      presence_list: ['binary_sensor.motion'],
      open_list: ['binary_sensor.door', 'binary_sensor.window'],
    };
    console.log('[HA Room Card Editor] Stub config created:', stubConfig);
    return stubConfig;
  }
}