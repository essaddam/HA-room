---
name: home-assistant-dev
description: Expert guidance for interacting with Home Assistant via REST API, WebSocket API, and hass-cli. Use when managing Home Assistant instances, automating tasks, creating integrations, handling API authentication, or developing custom components.
---

# Home Assistant Development & Automation

Complete guide for interacting with Home Assistant: REST API, WebSocket API, authentication management, and custom integration development.

## Quick Start

### Authentication Setup

Generate a Long-Lived Access Token:
1. Go to your HA profile: `http://IP:8123/profile`
2. Scroll to "Long-Lived Access Tokens"
3. Create token (copy immediately - shown only once)

Configure environment:
```bash
export HASS_SERVER=https://homeassistant.local:8123
export HASS_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

Test connection:
```bash
curl -H "Authorization: Bearer $HASS_TOKEN" \
  -H "Content-Type: application/json" \
  $HASS_SERVER/api/
```

## API Key Management System

### Secure Storage Options

**Option 1: Environment Variables (Recommended for CLI)**
```bash
# ~/.bashrc or ~/.zshrc
export HASS_SERVER="https://homeassistant.local:8123"
export HASS_TOKEN="your-long-lived-token"
export HASS_WS_URL="wss://homeassistant.local:8123/api/websocket"
```

**Option 2: Secrets File (For Python scripts)**
```python
# config.py
import os
from pathlib import Path

HASS_CONFIG = {
    'server': os.getenv('HASS_SERVER', 'http://localhost:8123'),
    'token': os.getenv('HASS_TOKEN'),
    'ws_url': os.getenv('HASS_WS_URL', 'ws://localhost:8123/api/websocket'),
}

# Or load from secure file
def load_token_from_file(filepath: str = '~/.hass_token') -> str:
    """Load token from file with restricted permissions."""
    path = Path(filepath).expanduser()
    if path.stat().st_mode & 0o077:
        raise PermissionError("Token file has too open permissions")
    return path.read_text().strip()
```

**Option 3: Home Assistant secrets.yaml (For HA configurations)**
```yaml
# secrets.yaml
api_token: "your-token-here"

# configuration.yaml
rest:
  - resource: http://example.com/api
    headers:
      Authorization: !secret api_token
```

**Option 4: Keyring/Keychain (Most secure for desktop)**
```python
import keyring

# Store token
keyring.set_password("homeassistant", "api_token", "your-token")

# Retrieve token
token = keyring.get_password("homeassistant", "api_token")
```

### Token Rotation Policy

1. **Generate new token** via HA profile
2. **Update storage** (env var, keyring, or file)
3. **Test new token** before revoking old
4. **Revoke old token** via HA profile
5. **Document rotation** in your system

## REST API

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | API status |
| GET | `/api/config` | Configuration |
| GET | `/api/states` | All entity states |
| GET | `/api/states/<entity_id>` | Specific entity |
| POST | `/api/states/<entity_id>` | Update state |
| POST | `/api/services/<domain>/<service>` | Call service |
| GET | `/api/services` | Available services |
| GET | `/api/history/period/<timestamp>` | State history |
| POST | `/api/template` | Render template |
| POST | `/api/config/core/check_config` | Validate config |

### Python REST Client

```python
import requests
from typing import Optional, Dict, Any

class HomeAssistantREST:
    """Home Assistant REST API client."""

    def __init__(self, server: str, token: str, timeout: int = 10):
        self.server = server.rstrip('/')
        self.token = token
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
        })

    def get_states(self) -> list:
        """Get all entity states."""
        resp = self.session.get(
            f'{self.server}/api/states',
            timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.json()

    def get_state(self, entity_id: str) -> dict:
        """Get specific entity state."""
        resp = self.session.get(
            f'{self.server}/api/states/{entity_id}',
            timeout=self.timeout
        )
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

        resp = self.session.post(
            url,
            json=service_data or {},
            timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.json()

    def set_state(
        self,
        entity_id: str,
        state: str,
        attributes: Optional[Dict] = None
    ) -> dict:
        """Set entity state (for sensors)."""
        data = {'state': state}
        if attributes:
            data['attributes'] = attributes

        resp = self.session.post(
            f'{self.server}/api/states/{entity_id}',
            json=data,
            timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.json()

    def render_template(self, template: str) -> str:
        """Render a Jinja2 template."""
        resp = self.session.post(
            f'{self.server}/api/template',
            json={'template': template},
            timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.text

    def check_config(self) -> dict:
        """Validate configuration.yaml."""
        resp = self.session.post(
            f'{self.server}/api/config/core/check_config',
            timeout=self.timeout
        )
        resp.raise_for_status()
        return resp.json()
```

## WebSocket API

### Connection Flow

1. Connect to `/api/websocket`
2. Receive `auth_required` message
3. Send `auth` message with token
4. Receive `auth_ok`
5. Send commands with unique `id`

### Python WebSocket Client

```python
import json
import asyncio
import websockets
from typing import Callable, Dict, Any, Optional

class HomeAssistantWS:
    """Home Assistant WebSocket API client."""

    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.ws = None
        self.message_id = 1
        self.callbacks: Dict[int, Callable] = {}
        self.event_handlers: Dict[str, list] = {}

    async def connect(self):
        """Connect and authenticate."""
        self.ws = await websockets.connect(self.url)

        # Wait for auth_required
        msg = json.loads(await self.ws.recv())
        if msg['type'] != 'auth_required':
            raise ConnectionError("Expected auth_required")

        # Send auth
        await self.ws.send(json.dumps({
            'type': 'auth',
            'access_token': self.token
        }))

        # Wait for auth_ok
        msg = json.loads(await self.ws.recv())
        if msg['type'] != 'auth_ok':
            raise ConnectionError(f"Auth failed: {msg}")

        # Start message handler
        asyncio.create_task(self._message_loop())

    async def _message_loop(self):
        """Handle incoming messages."""
        async for message in self.ws:
            msg = json.loads(message)

            # Handle event subscriptions
            if msg.get('type') == 'event':
                event_type = msg['event']['event_type']
                for handler in self.event_handlers.get(event_type, []):
                    asyncio.create_task(handler(msg['event']))

            # Handle command responses
            elif 'id' in msg and msg['id'] in self.callbacks:
                callback = self.callbacks.pop(msg['id'])
                callback(msg)

    async def send_command(self, cmd_type: str, **kwargs) -> dict:
        """Send command and wait for response."""
        msg_id = self.message_id
        self.message_id += 1

        future = asyncio.Future()

        def callback(response):
            if not future.done():
                future.set_result(response)

        self.callbacks[msg_id] = callback

        await self.ws.send(json.dumps({
            'id': msg_id,
            'type': cmd_type,
            **kwargs
        }))

        return await asyncio.wait_for(future, timeout=10)

    async def get_states(self) -> list:
        """Get all entity states."""
        resp = await self.send_command('get_states')
        return resp.get('result', [])

    async def call_service(
        self,
        domain: str,
        service: str,
        service_data: Optional[Dict] = None,
        target: Optional[Dict] = None
    ) -> dict:
        """Call a service."""
        params = {
            'domain': domain,
            'service': service
        }
        if service_data:
            params['service_data'] = service_data
        if target:
            params['target'] = target

        return await self.send_command('call_service', **params)

    async def subscribe_events(
        self,
        event_type: str,
        handler: Callable
    ) -> int:
        """Subscribe to events."""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        self.event_handlers[event_type].append(handler)

        resp = await self.send_command(
            'subscribe_events',
            event_type=event_type
        )
        return resp['id']

    async def ping(self) -> bool:
        """Send ping to keep connection alive."""
        resp = await self.send_command('ping')
        return resp['type'] == 'pong'

    async def close(self):
        """Close connection."""
        if self.ws:
            await self.ws.close()

# Usage example
async def main():
    ha = HomeAssistantWS(
        'ws://homeassistant.local:8123/api/websocket',
        'your-token'
    )
    await ha.connect()

    # Get states
    states = await ha.get_states()
    print(f"Got {len(states)} entities")

    # Subscribe to state changes
    async def on_state_changed(event):
        print(f"State changed: {event}")

    await ha.subscribe_events('state_changed', on_state_changed)

    # Keep running
    await asyncio.sleep(60)
    await ha.close()

# asyncio.run(main())
```

## hass-cli

### Installation & Configuration

```bash
# Install
pip install homeassistant-cli
# or
brew install homeassistant-cli

# Configure
export HASS_SERVER=https://homeassistant.local:8123
export HASS_TOKEN=your-token

# Enable completion (bash)
source <(_HASS_CLI_COMPLETE=bash_source hass-cli)
```

### Common Commands

```bash
# Info
hass-cli info
hass-cli config

# Entities
hass-cli entity list
hass-cli entity get light.living_room
hass-cli state get sensor.temperature

# Services
hass-cli service list
hass-cli service call light.turn_on --arguments entity_id=light.living_room
hass-cli service call climate.set_temperature --arguments entity_id=climate.living,temp=22

# Raw API
hass-cli raw get /api/states
hass-cli raw post /api/states/sensor.test '{"state": "42"}'
```

## Automation Development Workflow

### 1. Configuration Validation

```python
# Always validate before applying changes
import requests

def validate_config(server: str, token: str) -> bool:
    """Validate Home Assistant configuration."""
    resp = requests.post(
        f'{server}/api/config/core/check_config',
        headers={'Authorization': f'Bearer {token}'}
    )
    result = resp.json()
    if result.get('errors'):
        print(f"Errors: {result['errors']}")
        return False
    if result.get('warnings'):
        print(f"Warnings: {result['warnings']}")
    return True
```

### 2. Reload vs Restart

**Can Reload (Fast):**
- Automations: `POST /api/services/automation/reload`
- Scripts: `POST /api/services/script/reload`
- Scenes: `POST /api/services/scene/reload`
- Templates: `POST /api/services/template/reload`
- Groups: `POST /api/services/group/reload`

**Requires Restart:**
- New integrations in configuration.yaml
- Core configuration changes
- MQTT platform changes

### 3. Testing Automations

```bash
# 1. Validate config
hass-cli raw post /api/config/core/check_config

# 2. Reload automations
hass-cli service call automation.reload

# 3. Trigger manually
hass-cli service call automation.trigger \
  --arguments entity_id=automation.my_automation

# 4. Check logs
ssh root@homeassistant.local "ha core logs | grep -i automation | tail -20"
```

## Integration Development

### Basic Integration Structure

```python
# custom_components/my_integration/__init__.py
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

DOMAIN = "my_integration"

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up from config entry."""
    hass.data.setdefault(DOMAIN, {})

    # Forward to platforms
    await hass.config_entries.async_forward_entry_setups(
        entry, ["sensor", "switch"]
    )
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""
    return await hass.config_entries.async_unload_platforms(
        entry, ["sensor", "switch"]
    )
```

### Config Flow

```python
# custom_components/my_integration/config_flow.py
from homeassistant import config_entries
from homeassistant.const import CONF_HOST, CONF_TOKEN
import voluptuous as vol

class ConfigFlow(config_entries.ConfigFlow, domain="my_integration"):
    """Config flow handler."""

    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle initial step."""
        if user_input is not None:
            # Validate credentials
            try:
                await validate_api(
                    user_input[CONF_HOST],
                    user_input[CONF_TOKEN]
                )
            except InvalidAuth:
                return self.async_show_form(
                    step_id="user",
                    errors={"base": "invalid_auth"}
                )

            await self.async_set_unique_id(user_input[CONF_HOST])
            self._abort_if_unique_id_configured()

            return self.async_create_entry(
                title=user_input[CONF_HOST],
                data=user_input
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({
                vol.Required(CONF_HOST): str,
                vol.Required(CONF_TOKEN): str,
            })
        )
```

## Best Practices

### Security

1. **Always use HTTPS** in production
2. **Never commit tokens** to version control
3. **Use separate tokens** for different integrations
4. **Rotate tokens** every 90 days
5. **Store tokens securely** (keyring, not plaintext)

### Performance

1. **Use WebSocket** for real-time updates (not polling)
2. **Batch service calls** when possible
3. **Subscribe to specific events** instead of all
4. **Use minimal_response** for history queries
5. **Cache states** locally to reduce API calls

### Error Handling

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session(token: str) -> requests.Session:
    """Create session with retry logic."""
    session = requests.Session()
    session.headers['Authorization'] = f'Bearer {token}'
    session.headers['Content-Type'] = 'application/json'

    # Retry on connection errors
    retry = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)

    return session
```

## Resources

- **[references/api-rest.md](references/api-rest.md)** - Complete REST API reference
- **[references/api-websocket.md](references/api-websocket.md)** - WebSocket API patterns
- **[references/platforms.md](references/platforms.md)** - All entity platforms
- **[references/config-flow.md](references/config-flow.md)** - Advanced config flow
- **[references/entity-patterns.md](references/entity-patterns.md)** - Entity development
- **[references/hass-cli.md](references/hass-cli.md)** - hass-cli complete guide
- **Official docs**: https://developers.home-assistant.io/
