# Home Assistant WebSocket API Complete Reference

Official documentation: https://developers.home-assistant.io/docs/api/websocket

The WebSocket API provides a bi-directional, real-time connection to Home Assistant. It's the preferred API for new integrations over REST API.

## Connection Flow

```
Client → Connect to /api/websocket
       ← {"type": "auth_required", "ha_version": "2025.1.0"}
       → {"type": "auth", "access_token": "..."}
       ← {"type": "auth_ok"} / {"type": "auth_invalid", "message": "..."}
       → Commands with {"id": 1, "type": "..."}
       ← Responses with {"id": 1, "type": "result", ...}
```

## Message Format

All messages are JSON with required fields:
- `type` - Message type (always required)
- `id` - Command ID (required after authentication for commands)

## Authentication

### Request
```json
{
  "type": "auth",
  "access_token": "YOUR_LONG_LIVED_ACCESS_TOKEN"
}
```

### Success Response
```json
{
  "type": "auth_ok",
  "ha_version": "2025.1.0"
}
```

### Failure Response
```json
{
  "type": "auth_invalid",
  "message": "Invalid access token"
}
```

## Core Commands

### get_states
Get all entity states.

**Request:**
```json
{
  "id": 1,
  "type": "get_states"
}
```

**Response:**
```json
{
  "id": 1,
  "type": "result",
  "success": true,
  "result": [
    {
      "entity_id": "light.living_room",
      "state": "on",
      "attributes": {...},
      "last_changed": "2025-01-01T00:00:00.000000+00:00",
      "last_updated": "2025-01-01T00:00:00.000000+00:00",
      "context": {...}
    }
  ]
}
```

### get_config
Get Home Assistant configuration.

**Request:**
```json
{
  "id": 2,
  "type": "get_config"
}
```

### get_services
Get all available services.

**Request:**
```json
{
  "id": 3,
  "type": "get_services"
}
```

### get_panels
Get all registered panels.

**Request:**
```json
{
  "id": 4,
  "type": "get_panels"
}
```

### call_service
Call a service.

**Request:**
```json
{
  "id": 5,
  "type": "call_service",
  "domain": "light",
  "service": "turn_on",
  "service_data": {
    "entity_id": "light.living_room",
    "brightness": 255
  },
  "target": {
    "entity_id": "light.living_room"
  },
  "return_response": true
}
```

**Response:**
```json
{
  "id": 5,
  "type": "result",
  "success": true,
  "result": {
    "changed_states": [...],
    "service_response": {...}
  }
}
```

### subscribe_events
Subscribe to events.

**Request:**
```json
{
  "id": 6,
  "type": "subscribe_events",
  "event_type": "state_changed"
}
```

**Response:**
```json
{
  "id": 6,
  "type": "result",
  "success": true
}
```

**Event Messages:**
```json
{
  "id": 6,
  "type": "event",
  "event": {
    "event_type": "state_changed",
    "data": {
      "entity_id": "sensor.temperature",
      "old_state": {...},
      "new_state": {...}
    },
    "time_fired": "2025-01-01T00:00:00.000000+00:00",
    "origin": "LOCAL",
    "context": {...}
  }
}
```

### unsubscribe_events
Unsubscribe from events.

**Request:**
```json
{
  "id": 7,
  "type": "unsubscribe_events",
  "subscription": 6
}
```

### subscribe_trigger
Subscribe to a template trigger.

**Request:**
```json
{
  "id": 8,
  "type": "subscribe_trigger",
  "trigger": {
    "platform": "state",
    "entity_id": "sensor.temperature",
    "above": 25
  }
}
```

### fire_event
Fire an event.

**Request:**
```json
{
  "id": 9,
  "type": "fire_event",
  "event_type": "custom_event",
  "event_data": {
    "key": "value"
  }
}
```

### render_template
Render a template.

**Request:**
```json
{
  "id": 10,
  "type": "render_template",
  "template": "{{ states('sensor.temperature') }}°C",
  "variables": {
    "custom_var": "value"
  }
}
```

**Response:**
```json
{
  "id": 10,
  "type": "result",
  "success": true,
  "result": "22.5°C"
}
```

### validate_config
Validate configuration.

**Request:**
```json
{
  "id": 11,
  "type": "validate_config",
  "trigger": {...},
  "condition": {...},
  "action": {...}
}
```

### ping / pong
Keep connection alive.

**Request:**
```json
{
  "id": 12,
  "type": "ping"
}
```

**Response:**
```json
{
  "id": 12,
  "type": "pong"
}
```

## Entity Registry Commands

### config/entity_registry/get
Get entity registry entry.

**Request:**
```json
{
  "id": 13,
  "type": "config/entity_registry/get",
  "entity_id": "light.living_room"
}
```

### config/entity_registry/update
Update entity registry.

**Request:**
```json
{
  "id": 14,
  "type": "config/entity_registry/update",
  "entity_id": "light.living_room",
  "name": "Living Room Light",
  "icon": "mdi:lightbulb",
  "disabled_by": null,
  "hidden_by": null,
  "area_id": "living_room"
}
```

### config/entity_registry/remove
Remove from entity registry.

**Request:**
```json
{
  "id": 15,
  "type": "config/entity_registry/remove",
  "entity_id": "light.living_room"
}
```

## Device Registry Commands

### config/device_registry/get
Get device registry entries.

**Request:**
```json
{
  "id": 16,
  "type": "config/device_registry/get"
}
```

### config/device_registry/update
Update device registry.

**Request:**
```json
{
  "id": 17,
  "type": "config/device_registry/update",
  "device_id": "abc123",
  "name_by_user": "My Device",
  "area_id": "kitchen",
  "disabled_by": null
}
```

## Area Registry Commands

### config/area_registry/create
Create area.

**Request:**
```json
{
  "id": 18,
  "type": "config/area_registry/create",
  "name": "Kitchen",
  "picture": "/api/image/serve/kitchen.jpg"
}
```

### config/area_registry/update
Update area.

**Request:**
```json
{
  "id": 19,
  "type": "config/area_registry/update",
  "area_id": "kitchen",
  "name": "Main Kitchen"
}
```

### config/area_registry/delete
Delete area.

**Request:**
```json
{
  "id": 20,
  "type": "config/area_registry/delete",
  "area_id": "kitchen"
}
```

## Python Implementation

### Basic Client

```python
import json
import asyncio
import websockets
from typing import Callable, Dict, Any, Optional

class HomeAssistantWSClient:
    """WebSocket client for Home Assistant."""

    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.ws = None
        self.message_id = 1
        self.pending = {}
        self.subscriptions = {}
        self.event_handlers = {}
        self._running = False

    async def connect(self):
        """Connect and authenticate."""
        self.ws = await websockets.connect(self.url)

        # Wait for auth_required
        msg = json.loads(await self.ws.recv())
        if msg['type'] != 'auth_required':
            raise ConnectionError(f"Unexpected: {msg}")

        # Send auth
        await self.ws.send(json.dumps({
            'type': 'auth',
            'access_token': self.token
        }))

        # Wait for auth_ok
        msg = json.loads(await self.ws.recv())
        if msg['type'] != 'auth_ok':
            raise ConnectionError(f"Auth failed: {msg}")

        self._running = True
        asyncio.create_task(self._message_loop())

    async def _message_loop(self):
        """Handle incoming messages."""
        try:
            async for message in self.ws:
                if not self._running:
                    break

                msg = json.loads(message)
                await self._handle_message(msg)
        except websockets.exceptions.ConnectionClosed:
            self._running = False

    async def _handle_message(self, msg: dict):
        """Process a message."""
        msg_type = msg.get('type')
        msg_id = msg.get('id')

        # Handle events
        if msg_type == 'event' and msg_id in self.subscriptions:
            handler = self.subscriptions[msg_id]
            if asyncio.iscoroutinefunction(handler):
                asyncio.create_task(handler(msg['event']))
            else:
                handler(msg['event'])
            return

        # Handle command responses
        if msg_id and msg_id in self.pending:
            future = self.pending.pop(msg_id)
            if not future.done():
                future.set_result(msg)
            return

    async def send_command(self, cmd_type: str, **kwargs) -> dict:
        """Send a command and wait for response."""
        msg_id = self.message_id
        self.message_id += 1

        future = asyncio.Future()
        self.pending[msg_id] = future

        await self.ws.send(json.dumps({
            'id': msg_id,
            'type': cmd_type,
            **kwargs
        }))

        return await asyncio.wait_for(future, timeout=10)

    async def get_states(self) -> list:
        """Get all entity states."""
        resp = await self.send_command('get_states')
        if resp.get('success'):
            return resp['result']
        raise Exception(resp.get('error', 'Unknown error'))

    async def get_config(self) -> dict:
        """Get configuration."""
        resp = await self.send_command('get_config')
        if resp.get('success'):
            return resp['result']
        raise Exception(resp.get('error', 'Unknown error'))

    async def call_service(
        self,
        domain: str,
        service: str,
        service_data: Optional[dict] = None,
        target: Optional[dict] = None,
        return_response: bool = False
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
        if return_response:
            params['return_response'] = True

        resp = await self.send_command('call_service', **params)
        if resp.get('success'):
            return resp.get('result', {})
        raise Exception(resp.get('error', 'Unknown error'))

    async def subscribe_events(
        self,
        event_type: str,
        handler: Callable
    ) -> int:
        """Subscribe to events."""
        resp = await self.send_command(
            'subscribe_events',
            event_type=event_type
        )
        if resp.get('success'):
            sub_id = resp['id']
            self.subscriptions[sub_id] = handler
            return sub_id
        raise Exception(resp.get('error', 'Unknown error'))

    async def unsubscribe_events(self, subscription: int):
        """Unsubscribe from events."""
        resp = await self.send_command(
            'unsubscribe_events',
            subscription=subscription
        )
        if subscription in self.subscriptions:
            del self.subscriptions[subscription]
        return resp.get('success', False)

    async def render_template(
        self,
        template: str,
        variables: Optional[dict] = None
    ) -> str:
        """Render a template."""
        params = {'template': template}
        if variables:
            params['variables'] = variables

        resp = await self.send_command('render_template', **params)
        if resp.get('success'):
            return resp['result']
        raise Exception(resp.get('error', 'Unknown error'))

    async def ping(self) -> bool:
        """Send ping."""
        resp = await self.send_command('ping')
        return resp.get('type') == 'pong'

    async def close(self):
        """Close connection."""
        self._running = False
        if self.ws:
            await self.ws.close()

# Usage
async def main():
    client = HomeAssistantWSClient(
        'ws://homeassistant.local:8123/api/websocket',
        'your-token'
    )
    await client.connect()

    # Get states
    states = await client.get_states()
    print(f"Got {len(states)} entities")

    # Subscribe to state changes
    async def on_state_change(event):
        print(f"State changed: {event['data']['entity_id']}")

    sub_id = await client.subscribe_events('state_changed', on_state_change)

    # Keep running
    await asyncio.sleep(60)

    # Cleanup
    await client.unsubscribe_events(sub_id)
    await client.close()

# asyncio.run(main())
```

### Async Context Manager

```python
class HAContextManager:
    """Context manager for Home Assistant WebSocket."""

    def __init__(self, url: str, token: str):
        self.url = url
        self.token = token
        self.client = None

    async def __aenter__(self):
        self.client = HomeAssistantWSClient(self.url, self.token)
        await self.client.connect()
        return self.client

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.close()

# Usage
async with HAContextManager(url, token) as ha:
    states = await ha.get_states()
```

## JavaScript Implementation

```javascript
class HomeAssistantWS {
    constructor(url, token) {
        this.url = url;
        this.token = token;
        this.messageId = 1;
        this.pending = new Map();
        this.subscriptions = new Map();
    }

    async connect() {
        this.ws = new WebSocket(this.url);

        return new Promise((resolve, reject) => {
            this.ws.onopen = () => {
                console.log('WebSocket connected');
            };

            this.ws.onmessage = (event) => {
                const msg = JSON.parse(event.data);
                this.handleMessage(msg);

                if (msg.type === 'auth_required') {
                    this.send({ type: 'auth', access_token: this.token });
                } else if (msg.type === 'auth_ok') {
                    resolve();
                } else if (msg.type === 'auth_invalid') {
                    reject(new Error(msg.message));
                }
            };

            this.ws.onerror = (error) => reject(error);
        });
    }

    handleMessage(msg) {
        const id = msg.id;

        if (msg.type === 'event' && this.subscriptions.has(id)) {
            this.subscriptions.get(id)(msg.event);
            return;
        }

        if (id && this.pending.has(id)) {
            const { resolve, reject } = this.pending.get(id);
            this.pending.delete(id);

            if (msg.success) {
                resolve(msg.result);
            } else {
                reject(new Error(msg.error?.message || 'Unknown error'));
            }
        }
    }

    send(data) {
        this.ws.send(JSON.stringify(data));
    }

    async sendCommand(type, data = {}) {
        const id = this.messageId++;

        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.send({ id, type, ...data });

            setTimeout(() => {
                if (this.pending.has(id)) {
                    this.pending.delete(id);
                    reject(new Error('Timeout'));
                }
            }, 10000);
        });
    }

    async getStates() {
        return this.sendCommand('get_states');
    }

    async callService(domain, service, serviceData = {}) {
        return this.sendCommand('call_service', {
            domain,
            service,
            service_data: serviceData
        });
    }

    subscribeEvents(eventType, callback) {
        const id = this.messageId;
        this.subscriptions.set(id, callback);
        this.sendCommand('subscribe_events', { event_type: eventType });
        return id;
    }

    close() {
        this.ws.close();
    }
}

// Usage
const ha = new HomeAssistantWS(
    'ws://homeassistant.local:8123/api/websocket',
    'your-token'
);

await ha.connect();
const states = await ha.getStates();
console.log(`Got ${states.length} entities`);
```

## Best Practices

1. **Use WebSocket over REST** for real-time applications
2. **Subscribe to events** instead of polling
3. **Handle reconnection** automatically
4. **Use unique IDs** for each command
5. **Set timeouts** for command responses
6. **Ping regularly** to keep connection alive
7. **Unsubscribe** when no longer needed
8. **Handle auth_invalid** by prompting for new token
