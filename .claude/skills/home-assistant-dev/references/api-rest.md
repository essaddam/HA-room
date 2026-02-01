# Home Assistant REST API Complete Reference

Official documentation: https://developers.home-assistant.io/docs/api/rest

## Authentication

All requests require the header:
```
Authorization: Bearer YOUR_LONG_LIVED_ACCESS_TOKEN
Content-Type: application/json
```

Generate tokens at: `http://IP_ADDRESS:8123/profile`

## Base URL

```
http://IP_ADDRESS:8123/api/
```

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized (invalid token) |
| 404 | Not Found |
| 405 | Method Not Allowed |

## Endpoints Reference

### Status & Info

#### GET /api/
Returns API status.

**Response:**
```json
{
  "message": "API running."
}
```

#### GET /api/config
Returns current configuration.

**Response:**
```json
{
  "components": ["sensor", "switch", ...],
  "config_dir": "/config",
  "elevation": 0,
  "latitude": 0.0,
  "longitude": 0.0,
  "location_name": "Home",
  "time_zone": "UTC",
  "unit_system": {
    "length": "km",
    "mass": "g",
    "temperature": "°C",
    "volume": "L"
  },
  "version": "2025.1.0"
}
```

#### GET /api/components
List loaded components.

**Response:**
```json
["sensor", "switch", "light", "automation", ...]
```

### States

#### GET /api/states
Get all entity states.

**Response:**
```json
[
  {
    "attributes": {
      "friendly_name": "Living Room",
      "brightness": 255
    },
    "context": {
      "id": "...",
      "parent_id": null,
      "user_id": null
    },
    "entity_id": "light.living_room",
    "last_changed": "2025-01-01T00:00:00.000000+00:00",
    "last_updated": "2025-01-01T00:00:00.000000+00:00",
    "state": "on"
  }
]
```

#### GET /api/states/{entity_id}
Get specific entity state.

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://homeassistant.local:8123/api/states/sensor.temperature
```

#### POST /api/states/{entity_id}
Update or create entity state.

**Request:**
```json
{
  "state": "25",
  "attributes": {
    "unit_of_measurement": "°C",
    "friendly_name": "Temperature"
  }
}
```

**Note:** This does not interact with the actual device. Use for sensors you push data to.

#### DELETE /api/states/{entity_id}
Delete entity state.

### Services

#### GET /api/services
List all available services.

**Response:**
```json
[
  {
    "domain": "light",
    "services": {
      "turn_on": {
        "description": "Turn on lights",
        "fields": {
          "entity_id": {
            "description": "Entity to turn on",
            "example": "light.living_room"
          },
          "brightness": {
            "description": "Brightness (0-255)",
            "example": 255
          }
        }
      }
    }
  }
]
```

#### POST /api/services/{domain}/{service}
Call a service.

**Parameters:**
- `?return_response` - Include service response data

**Request:**
```json
{
  "entity_id": "light.living_room",
  "brightness": 255,
  "color_name": "red"
}
```

**Response (with return_response):**
```json
{
  "changed_states": [...],
  "service_response": {...}
}
```

### Events

#### GET /api/events
List event types with listener counts.

**Response:**
```json
[
  {
    "event": "state_changed",
    "listener_count": 5
  }
]
```

#### POST /api/events/{event_type}
Fire an event.

**Request:**
```json
{
  "custom_field": "value"
}
```

### History

#### GET /api/history/period/{timestamp}
Get state history.

**Parameters:**
- `filter_entity_id` - Comma-separated entity IDs
- `end_time` - End timestamp (ISO format)
- `minimal_response` - Only return last_changed for states other than first/last
- `no_attributes` - Skip attributes
- `significant_changes_only` - Only significant changes

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://homeassistant.local:8123/api/history/period/2025-01-01T00:00:00?filter_entity_id=sensor.temperature"
```

### Logbook

#### GET /api/logbook/{timestamp}
Get logbook entries.

**Parameters:**
- `entity` - Filter by entity
- `end_time` - End timestamp

### Error Log

#### GET /api/error_log
Get error log (plaintext).

### Template

#### POST /api/template
Render a template.

**Request:**
```json
{
  "template": "{{ states('sensor.temperature') }}°C"
}
```

**Response:**
```
"22.5°C"
```

### Configuration

#### POST /api/config/core/check_config
Validate configuration.yaml.

**Response:**
```json
{
  "errors": null,
  "warnings": ["..."],
  "result": "valid"
}
```

### Cameras

#### GET /api/camera_proxy/{entity_id}
Get camera image data.

**Parameters:**
- `token` - Access token for authenticated cameras

### Calendars

#### GET /api/calendars
List calendar entities.

#### GET /api/calendars/{entity_id}
Get calendar events in time range.

**Parameters:**
- `start` - Start time (ISO format)
- `end` - End time (ISO format)

### Intent

#### POST /api/intent/handle
Handle an intent (requires `intent:` in configuration.yaml).

**Request:**
```json
{
  "name": "HassTurnOn",
  "data": {
    "name": "Living Room"
  }
}
```

## Python Examples

### Full REST Client Class

```python
import requests
from typing import Optional, Dict, Any, List

class HomeAssistantAPI:
    """Complete Home Assistant REST API client."""

    def __init__(self, server: str, token: str, timeout: int = 10):
        self.server = server.rstrip('/')
        self.token = token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        })

    # Status & Config
    def api_status(self) -> dict:
        """Check API status."""
        resp = self.session.get(f'{self.server}/api/')
        resp.raise_for_status()
        return resp.json()

    def get_config(self) -> dict:
        """Get configuration."""
        resp = self.session.get(f'{self.server}/api/config')
        resp.raise_for_status()
        return resp.json()

    def get_components(self) -> list:
        """Get loaded components."""
        resp = self.session.get(f'{self.server}/api/components')
        resp.raise_for_status()
        return resp.json()

    # States
    def get_states(self) -> List[dict]:
        """Get all entity states."""
        resp = self.session.get(f'{self.server}/api/states')
        resp.raise_for_status()
        return resp.json()

    def get_state(self, entity_id: str) -> dict:
        """Get specific entity state."""
        resp = self.session.get(f'{self.server}/api/states/{entity_id}')
        resp.raise_for_status()
        return resp.json()

    def set_state(
        self,
        entity_id: str,
        state: str,
        attributes: Optional[Dict] = None
    ) -> dict:
        """Set entity state."""
        data = {'state': state}
        if attributes:
            data['attributes'] = attributes

        resp = self.session.post(
            f'{self.server}/api/states/{entity_id}',
            json=data
        )
        resp.raise_for_status()
        return resp.json()

    def delete_state(self, entity_id: str) -> None:
        """Delete entity state."""
        resp = self.session.delete(f'{self.server}/api/states/{entity_id}')
        resp.raise_for_status()

    # Services
    def get_services(self) -> List[dict]:
        """Get available services."""
        resp = self.session.get(f'{self.server}/api/services')
        resp.raise_for_status()
        return resp.json()

    def call_service(
        self,
        domain: str,
        service: str,
        service_data: Optional[Dict] = None,
        return_response: bool = False
    ) -> dict:
        """Call a service."""
        url = f'{self.server}/api/services/{domain}/{service}'
        if return_response:
            url += '?return_response'

        resp = self.session.post(url, json=service_data or {})
        resp.raise_for_status()
        return resp.json()

    # Events
    def get_events(self) -> List[dict]:
        """Get available events."""
        resp = self.session.get(f'{self.server}/api/events')
        resp.raise_for_status()
        return resp.json()

    def fire_event(self, event_type: str, event_data: Optional[Dict] = None) -> dict:
        """Fire an event."""
        resp = self.session.post(
            f'{self.server}/api/events/{event_type}',
            json=event_data or {}
        )
        resp.raise_for_status()
        return resp.json()

    # History
    def get_history(
        self,
        start_time: str,
        end_time: Optional[str] = None,
        entity_ids: Optional[List[str]] = None,
        minimal: bool = False,
        no_attributes: bool = False,
        significant_changes_only: bool = False
    ) -> List[List[dict]]:
        """Get state history."""
        params = {}
        if entity_ids:
            params['filter_entity_id'] = ','.join(entity_ids)
        if end_time:
            params['end_time'] = end_time
        if minimal:
            params['minimal_response'] = 'true'
        if no_attributes:
            params['no_attributes'] = 'true'
        if significant_changes_only:
            params['significant_changes_only'] = 'true'

        resp = self.session.get(
            f'{self.server}/api/history/period/{start_time}',
            params=params
        )
        resp.raise_for_status()
        return resp.json()

    # Logbook
    def get_logbook(
        self,
        start_time: str,
        end_time: Optional[str] = None,
        entity: Optional[str] = None
    ) -> List[dict]:
        """Get logbook entries."""
        params = {}
        if end_time:
            params['end_time'] = end_time
        if entity:
            params['entity'] = entity

        resp = self.session.get(
            f'{self.server}/api/logbook/{start_time}',
            params=params
        )
        resp.raise_for_status()
        return resp.json()

    def get_error_log(self) -> str:
        """Get error log."""
        resp = self.session.get(f'{self.server}/api/error_log')
        resp.raise_for_status()
        return resp.text

    # Template
    def render_template(self, template: str) -> str:
        """Render a template."""
        resp = self.session.post(
            f'{self.server}/api/template',
            json={'template': template}
        )
        resp.raise_for_status()
        return resp.text

    # Config
    def check_config(self) -> dict:
        """Validate configuration."""
        resp = self.session.post(
            f'{self.server}/api/config/core/check_config'
        )
        resp.raise_for_status()
        return resp.json()

    # Camera
    def get_camera_image(self, entity_id: str, token: Optional[str] = None) -> bytes:
        """Get camera image."""
        params = {'token': token} if token else {}
        resp = self.session.get(
            f'{self.server}/api/camera_proxy/{entity_id}',
            params=params
        )
        resp.raise_for_status()
        return resp.content

    # Calendars
    def get_calendars(self) -> List[dict]:
        """Get calendar entities."""
        resp = self.session.get(f'{self.server}/api/calendars')
        resp.raise_for_status()
        return resp.json()

    def get_calendar_events(
        self,
        entity_id: str,
        start: str,
        end: str
    ) -> List[dict]:
        """Get calendar events."""
        resp = self.session.get(
            f'{self.server}/api/calendars/{entity_id}',
            params={'start': start, 'end': end}
        )
        resp.raise_for_status()
        return resp.json()

    # Intent
    def handle_intent(self, name: str, data: Optional[Dict] = None) -> dict:
        """Handle an intent."""
        resp = self.session.post(
            f'{self.server}/api/intent/handle',
            json={'name': name, 'data': data or {}}
        )
        resp.raise_for_status()
        return resp.json()
```

## curl Examples

```bash
# Set token
TOKEN="your-long-lived-token"
SERVER="http://homeassistant.local:8123"

# Check API status
curl -H "Authorization: Bearer $TOKEN" $SERVER/api/

# Get all states
curl -H "Authorization: Bearer $TOKEN" $SERVER/api/states

# Get specific entity
curl -H "Authorization: Bearer $TOKEN" $SERVER/api/states/sensor.temperature

# Turn on light
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entity_id": "light.living_room", "brightness": 255}' \
  $SERVER/api/services/light/turn_on

# Set sensor state
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "22.5", "attributes": {"unit_of_measurement": "°C"}}' \
  $SERVER/api/states/sensor.custom_temperature

# Get history
curl -H "Authorization: Bearer $TOKEN" \
  "$SERVER/api/history/period/2025-01-01T00:00:00?filter_entity_id=sensor.temperature"

# Render template
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"template": "{{ states("sensor.temperature") }}"}' \
  $SERVER/api/template

# Check config
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  $SERVER/api/config/core/check_config
```
