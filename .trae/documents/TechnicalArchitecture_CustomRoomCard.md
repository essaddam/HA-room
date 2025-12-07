## 1.Architecture design

```mermaid
  graph TD
    A[Home Assistant Frontend] --> B[Custom Room Card Component]
    B --> C[Home Assistant API]
    C --> D[HA Backend Services]
    
    B --> E[State Manager]
    B --> F[Event Handler]
    B --> G[Popup Manager]
    
    E --> H[Entity States Cache]
    F --> I[User Interactions]
    G --> J[Modal/Popup Components]

    subgraph "Frontend Layer"
        A
        B
        E
        F
        G
        H
        I
        J
    end

    subgraph "Backend Layer (Home Assistant)"
        C
        D
    end
```

## 2.Technology Description
- Frontend: Custom Lovelace Card (JavaScript/TypeScript + Lit Element)
- Backend: Home Assistant Core (Python)
- Communication: WebSocket API de Home Assistant
- Styling: CSS3 avec variables CSS pour thématisation
- Icons: Material Design Icons via HA

## 3.Route definitions
| Route | Purpose |
|-------|---------|
| /hacsfiles/ha-room-card/ha-room-card.js | Fichier principal de la custom card |
| /local/ha-room-card/ | Configuration locale des assets |
| /api/states | Récupération des états des entités |
| /api/services | Appel des services HA pour les contrôles |

## 4.API definitions

### 4.1 Core API Home Assistant

**Récupération des états d'entités**
```
GET /api/states
```

Response:
| Param Name| Param Type  | Description |
|-----------|-------------|-------------|
| entity_id | string      | Identifiant unique de l'entité |
| state     | string      | État actuel de l'entité |
| attributes| object      | Attributs supplémentaires (unité, icône, etc.) |
| last_changed| string    | Timestamp du dernier changement |

**Appel de services**
```
POST /api/services/<domain>/<service>
```

Request:
| Param Name| Param Type  | isRequired  | Description |
|-----------|-------------|-------------|-------------|
| entity_id | string      | true        | Entité cible du service |
| service_data| object    | false       | Paramètres additionnels |

Example
```json
{
  "entity_id": "light.salon",
  "rgb_color": [255, 0, 0],
  "brightness": 255
}
```

### 4.2 WebSocket Events

**Subscription aux changements d'état**
```
{
  "type": "subscribe_states",
  "entity_ids": ["sensor.temperature_salon", "light.salon"]
}
```

**Event de changement d'état**
```
{
  "type": "state_changed",
  "data": {
    "entity_id": "light.salon",
    "new_state": {...},
    "old_state": {...}
  }
}
```

## 5.Server architecture diagram

```mermaid
  graph TD
    A[Custom Card Component] --> B[HA Connection Manager]
    B --> C[WebSocket Client]
    C --> D[HA WebSocket Server]
    D --> E[State Registry]
    D --> F[Service Registry]
    
    subgraph "Custom Card"
        A
        B
        C
    end
    
    subgraph "Home Assistant Core"
        D
        E
        F
    end
```

## 6.Data model

### 6.1 Data model definition

```mermaid
erDiagram
    ROOM_CARD ||--o{ SENSOR_ENTITY : monitors
    ROOM_CARD ||--o{ LIGHT_ENTITY : controls
    ROOM_CARD ||--o{ SWITCH_ENTITY : controls
    ROOM_CARD ||--o{ COVER_ENTITY : controls
    ROOM_CARD ||--o{ MEDIA_ENTITY : controls
    ROOM_CARD ||--o{ CAMERA_ENTITY : displays
    
    ROOM_CARD {
        string room_name
        string card_id
        object config
        array entity_groups
    }
    
    SENSOR_ENTITY {
        string entity_id
        string state
        string unit_of_measurement
        string device_class
        object attributes
    }
    
    LIGHT_ENTITY {
        string entity_id
        string state
        number brightness
        array rgb_color
        boolean is_on
    }
    
    SWITCH_ENTITY {
        string entity_id
        string state
        boolean is_on
        number power_consumption
    }
    
    COVER_ENTITY {
        string entity_id
        string state
        number current_position
        string tilt_position
    }
    
    MEDIA_ENTITY {
        string entity_id
        string state
        string media_title
        string media_artist
        string media_content_type
        number volume_level
        boolean is_muted
    }
    
    CAMERA_ENTITY {
        string entity_id
        string state
        string entity_picture
        string access_token
    }
```

### 6.2 Data Definition Language

**Configuration de la card (dans configuration.yaml)**
```yaml
ha-room-card:
  type: custom:ha-room-card
  room_name: "Salon"
  entities:
    temperature:
      entity_id: sensor.temperature_salon
      icon: mdi:thermometer
      unit: "°C"
    humidity:
      entity_id: sensor.humidity_salon
      icon: mdi:water-percent
      unit: "%"
    power:
      entity_id: sensor.power_consumption_salon
      icon: mdi:flash
      unit: "W"
    presence:
      entity_id: binary_sensor.presence_salon
      icon: mdi:motion-sensor
    lights:
      - entity_id: light.salon_principal
        name: "Plafonnier"
      - entity_id: light.salon_ampoule
        name: "Lampe d'appoint"
    switches:
      - entity_id: switch.prise_salon_tv
        name: "TV"
      - entity_id: switch.prise_salon_console
        name: "Console"
    covers:
      - entity_id: cover.volet_salon
        name: "Volet"
    media:
      - entity_id: media_player.salon_speaker
        name: "Enceinte"
        type: "audio"
      - entity_id: media_player.salon_tv
        name: "TV"
        type: "video"
    cameras:
      - entity_id: camera.salon
        name: "Caméra Salon"
  design:
    primary_color: "#667eea"
    secondary_color: "#764ba2"
    card_style: "gradient"
    show_labels: true
    compact_mode: false
```

**Variables CSS pour thématisation**
```css
:root {
  --ha-room-primary-color: #667eea;
  --ha-room-secondary-color: #764ba2;
  --ha-room-background: linear-gradient(135deg, var(--ha-room-primary-color), var(--ha-room-secondary-color));
  --ha-room-card-border-radius: 16px;
  --ha-room-chip-border-radius: 20px;
  --ha-room-button-size: 48px;
  --ha-room-spacing: 12px;
}
```