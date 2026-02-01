# hass-cli Complete Reference

GitHub: https://github.com/home-assistant-ecosystem/home-assistant-cli
Documentation: https://homeassistantapi.readthedocs.io/

hass-cli is a command-line interface for Home Assistant that uses the REST API.

## Installation

```bash
# pip
pip install homeassistant-cli

# Homebrew (macOS)
brew install homeassistant-cli

# Fedora/RHEL
sudo dnf install home-assistant-cli

# Docker
docker run homeassistant/home-assistant-cli
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HASS_SERVER` | Home Assistant URL | `http://localhost:8123` |
| `HASS_TOKEN` | Long-lived access token | None |
| `HASS_PASSWORD` | API password (legacy) | None |

### Example Setup

```bash
# Add to ~/.bashrc or ~/.zshrc
export HASS_SERVER="https://homeassistant.local:8123"
export HASS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Enable completion (bash)
source <(_HASS_CLI_COMPLETE=bash_source hass-cli)

# Enable completion (zsh)
source <(_HASS_CLI_COMPLETE=zsh_source hass-cli)

# Enable completion (fish)
eval (_HASS_CLI_COMPLETE=fish_source hass-cli)
```

### Command-Line Options

```bash
hass-cli --server https://ha.local:8123 --token TOKEN <command>
# or
hass-cli -s https://ha.local:8123 --token TOKEN <command>
```

## Commands

### Info & Configuration

```bash
# Get API status
hass-cli info

# Show configuration
hass-cli config

# Check configuration (validate YAML)
hass-cli config check

# Raw API call - GET
hass-cli raw get /api/states

# Raw API call - POST
hass-cli raw post /api/services/light/turn_on '{"entity_id": "light.living_room"}'
```

### Entity Management

```bash
# List all entities
hass-cli entity list

# List with filter
hass-cli entity list light.*
hass-cli entity list sensor.temperature*

# Get entity details
hass-cli entity get light.living_room

# Rename entity
hass-cli entity rename light.old_name light.new_name

# Delete entity (from registry)
hass-cli entity delete light.unused
```

### State Operations

```bash
# Get state
hass-cli state get sensor.temperature

# List all states
hass-cli state list

# Set state (for virtual sensors)
hass-cli state edit sensor.custom_value "42"

# Set state with attributes
hass-cli state edit sensor.custom_value "42" --attributes '{"unit_of_measurement": "°C"}'
```

### Service Calls

```bash
# List all services
hass-cli service list

# List services for domain
hass-cli service list light

# Call service
hass-cli service call light.turn_on
hass-cli service call light.turn_on --arguments entity_id=light.living_room
hass-cli service call light.turn_on --arguments entity_id=light.living_room,brightness=255

# Call with JSON
hass-cli service call light.turn_on --json '{"entity_id": "light.living_room", "color_name": "red"}'

# Climate control
hass-cli service call climate.set_temperature --arguments entity_id=climate.living,temperature=22

# Media player
hass-cli service call media_player.play_pause --arguments entity_id=media_player.living_room
```

### Event Operations

```bash
# List events
hass-cli event list

# Fire event
hass-cli event fire custom_event_name
hass-cli event fire custom_event --json '{"key": "value"}'
```

### Template Rendering

```bash
# Render template
hass-cli template "{{ states('sensor.temperature') }}°C"

# Render from file
hass-cli template --file my_template.j2

# Multi-line template
hass-cli template "{% for entity in states.light %}{{ entity.name }}: {{ entity.state }}
{% endfor %}"
```

### History

```bash
# Get history
hass-cli history sensor.temperature

# History for time range
hass-cli history sensor.temperature --start "2025-01-01 00:00:00" --end "2025-01-02 00:00:00"

# Minimal response
hass-cli history sensor.temperature --minimal

# No attributes
hass-cli history sensor.temperature --no-attributes
```

### Logbook

```bash
# Get logbook entries
hass-cli logbook

# Time range
hass-cli logbook --start "2025-01-01 00:00:00" --end "2025-01-02 00:00:00"

# Filter by entity
hass-cli logbook --entity light.living_room
```

### Area, Device & Entity Registry

```bash
# List areas
hass-cli area list

# Create area
hass-cli area create "Kitchen"

# Rename area
hass-cli area rename kitchen "Main Kitchen"

# Delete area
hass-cli area delete kitchen

# List devices
hass-cli device list

# List devices in area
hass-cli device list --area kitchen

# Get device info
hass-cli device get <device_id>

# List entities in device
hass-cli entity list --device <device_id>
```

### Discovery

```bash
# Discover integrations
hass-cli discovery list

# Get discovery info
hass-cli discovery info
```

## Output Formats

```bash
# JSON output (default)
hass-cli --output json entity list

# YAML output
hass-cli --output yaml entity list

# Table output
hass-cli --output table entity list

# CSV output
hass-cli --output csv entity list

# Custom columns
hass-cli --columns entity_id,state,attributes.friendly_name entity list
```

## Automation Workflow Examples

### Development Workflow

```bash
#!/bin/bash
# test_automation.sh

ENTITY="automation.test_light"

echo "1. Validating config..."
hass-cli config check

echo "2. Reloading automations..."
hass-cli service call automation.reload

echo "3. Triggering automation..."
hass-cli service call automation.trigger --arguments entity_id=$ENTITY

echo "4. Checking state..."
hass-cli state get $ENTITY

echo "5. Done!"
```

### Bulk Operations

```bash
# Turn off all lights
hass-cli entity list 'light.*' --columns entity_id | \
  xargs -I {} hass-cli service call light.turn_off --arguments entity_id={}

# Get all temperature sensors
hass-cli state list 'sensor.*temperature*' --output json | jq '.[].state'

# Export entity registry
hass-cli entity list --output json > entities_backup.json
```

### Debugging

```bash
# Monitor state changes in real-time
hass-cli event subscribe state_changed

# Check specific entity history
hass-cli history sensor.temperature --start "1 hour ago"

# Get last errors
hass-cli raw get /api/error_log | tail -20
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
hass-cli info

# Verbose output
hass-cli --debug info

# Ignore SSL errors (not recommended)
hass-cli --insecure info
```

### Authentication

```bash
# If token is invalid
# 1. Generate new token in HA profile
# 2. Update HASS_TOKEN environment variable
# 3. Test: hass-cli info
```

## Comparison: hass-cli vs ha CLI

| Feature | hass-cli | ha CLI |
|---------|----------|--------|
| Target | Home Assistant Core | Supervisor |
| Works with | All HA installations | HA OS/Supervised only |
| Auth | Long-lived tokens | Supervisor token |
| Install | pip/brew | Built-in to HA OS |

Use `hass-cli` for:
- Remote API access
- External scripts
- CI/CD pipelines
- Non-HA OS installations

Use `ha` CLI for:
- HA OS management
- Add-on control
- Backup operations
- System configuration

## Python Library

hass-cli uses the `homeassistant-api` Python library:

```python
from homeassistant_api import Client

with Client(
    'http://homeassistant.local:8123',
    'your-token'
) as client:
    # Get all entities
    states = client.get_states()

    # Get specific entity
    light = client.get_state('light.living_room')

    # Call service
    client.trigger_service('light', 'turn_on', entity_id='light.living_room')

    # Render template
    result = client.render_template('{{ states("sensor.temperature") }}')
    print(result)
```

Async usage:

```python
import asyncio
from homeassistant_api import Client

async def main():
    with Client(
        'http://homeassistant.local:8123',
        'your-token',
        use_async=True
    ) as client:
        states = await client.async_get_states()
        print(f"Got {len(states)} entities")

asyncio.run(main())
```
