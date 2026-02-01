# Entity Patterns and Lifecycle

Advanced patterns for Home Assistant entity development.

## Entity Lifecycle

### Initialization Flow

1. `__init__()` - Entity created
2. `entity_id` assigned by EntityPlatform
3. `async_added_to_hass()` - Entity added to Home Assistant
4. `async_update()` called (if polling)
5. State written to state machine

### Cleanup Flow

1. `async_will_remove_from_hass()` - Entity being removed
2. Entity unregistered from state machine

## State Management Patterns

### Polling Entity

```python
class PollingSensor(SensorEntity):
    """Sensor that polls for updates."""

    _attr_should_poll = True  # Default

    async def async_update(self) -> None:
        """Fetch new state data."""
        self._attr_native_value = await self.device.get_value()
```

### Push-Based Entity

```python
class PushSensor(SensorEntity):
    """Sensor that receives push updates."""

    _attr_should_poll = False

    async def async_added_to_hass(self) -> None:
        """Subscribe to updates."""
        await super().async_added_to_hass()
        self.async_on_remove(
            self.device.subscribe(self._handle_update)
        )

    def _handle_update(self, data: dict) -> None:
        """Handle pushed update."""
        self._attr_native_value = data["value"]
        self.schedule_update_ha_state()
```

### Coordinator-Based Entity

```python
from homeassistant.helpers.update_coordinator import CoordinatorEntity

class CoordinatorSensor(CoordinatorEntity, SensorEntity):
    """Sensor using DataUpdateCoordinator."""

    def __init__(self, coordinator, device_id: str) -> None:
        super().__init__(coordinator)
        self.device_id = device_id

    @property
    def available(self) -> bool:
        """Return if entity is available."""
        return (
            super().available
            and self.coordinator.data is not None
            and self.device_id in self.coordinator.data
        )

    @property
    def native_value(self):
        """Return value from coordinator data."""
        return self.coordinator.data.get(self.device_id, {}).get("value")
```

## Device Registry Patterns

### Single Device, Multiple Entities

```python
class DeviceBase:
    """Base class for entities of the same device."""

    def __init__(self, device) -> None:
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, device.id)},
            name=device.name,
            manufacturer=device.manufacturer,
            model=device.model,
            sw_version=device.firmware_version,
        )

class DeviceSensor(DeviceBase, SensorEntity):
    """Temperature sensor."""
    _attr_translation_key = "temperature"

class DeviceSwitch(DeviceBase, SwitchEntity):
    """Power switch."""
    _attr_translation_key = "power"
```

### Hub with Child Devices

```python
# Hub entity
class HubEntity(SwitchEntity):
    """Main hub entity."""

    def __init__(self, hub) -> None:
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, hub.id)},
            name=hub.name,
            manufacturer="Brand",
            model="Hub Model",
        )

# Child device entity
class ChildEntity(SensorEntity):
    """Child device sensor."""

    def __init__(self, hub, child_device) -> None:
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, child_device.id)},
            name=child_device.name,
            via_device=(DOMAIN, hub.id),  # Links to hub
        )
```

### Service Device (No Physical Device)

```python
class ServiceEntity(SensorEntity):
    """Entity without physical device."""

    _attr_has_entity_name = True
    _attr_translation_key = "service_status"

    @property
    def device_info(self) -> DeviceInfo | None:
        """Return device info - None for service entities."""
        return None  # Or create a service device:
        # return DeviceInfo(
        #     identifiers={(DOMAIN, "service")},
        #     name="My Service",
        #     entry_type=DeviceEntryType.SERVICE,
        # )
```

## Entity Registry Patterns

### Disabled by Default

```python
class DiagnosticSensor(SensorEntity):
    """Diagnostic sensor disabled by default."""

    _attr_entity_registry_enabled_default = False
    _attr_entity_category = EntityCategory.DIAGNOSTIC
```

### Hidden by Default

```python
class InternalEntity(SensorEntity):
    """Entity hidden from UI by default."""

    _attr_entity_registry_visible_default = False
```

## State Restoration

```python
from homeassistant.helpers.restore_state import RestoreEntity

class RestoredSwitch(SwitchEntity, RestoreEntity):
    """Switch that restores previous state."""

    async def async_added_to_hass(self) -> None:
        """Restore previous state."""
        await super().async_added_to_hass()

        if (last_state := await self.async_get_last_state()) is not None:
            self._attr_is_on = last_state.state == STATE_ON
        else:
            self._attr_is_on = False
```

## Extra State Attributes

### Basic Attributes

```python
class DetailedSensor(SensorEntity):
    """Sensor with extra attributes."""

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return additional state attributes."""
        return {
            "raw_value": self._raw_value,
            "last_updated": self._last_updated.isoformat(),
        }
```

### Excluding from History

```python
class VolatileSensor(SensorEntity):
    """Sensor with volatile attributes."""

    _unrecorded_attributes = frozenset({"raw_packet", "debug_info", "timestamp"})

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {
            "raw_packet": self._packet,  # Won't be recorded
            "stable_value": self._value,  # Will be recorded
        }
```

## Icon and Translation Patterns

### Icon Translation (Preferred)

```json
// strings.json
{
  "entity": {
    "sensor": {
      "battery_level": {
        "name": "Battery level",
        "state": {
          "low": "Low",
          "normal": "Normal",
          "high": "High"
        },
        "state_attributes": {
          "voltage": {
            "name": "Voltage"
          }
        }
      }
    }
  }
}
```

```json
// icons.json
{
  "entity": {
    "sensor": {
      "battery_level": {
        "state": {
          "low": "mdi:battery-alert",
          "normal": "mdi:battery",
          "high": "mdi:battery-high"
        }
      }
    }
  }
}
```

### Dynamic Icon Property

```python
class DynamicIconSensor(SensorEntity):
    """Sensor with dynamic icon."""

    @property
    def icon(self) -> str | None:
        """Return dynamic icon based on state."""
        if self.native_value > 100:
            return "mdi:alert"
        return "mdi:check"
```

## Event Handling

### Listening to Events

```python
class EventDrivenEntity(BinarySensorEntity):
    """Entity driven by Home Assistant events."""

    async def async_added_to_hass(self) -> None:
        """Register event listeners."""
        await super().async_added_to_hass()

        self.async_on_remove(
            self.hass.bus.async_listen(
                "my_custom_event",
                self._handle_event
            )
        )

    def _handle_event(self, event: Event) -> None:
        """Handle the event."""
        if event.data.get("device_id") == self._device_id:
            self._attr_is_on = event.data.get("state")
            self.schedule_update_ha_state()
```

### Listening to State Changes

```python
class StateDependentEntity(SensorEntity):
    """Entity that depends on another entity's state."""

    async def async_added_to_hass(self) -> None:
        """Register state change listener."""
        await super().async_added_to_hass()

        self.async_on_remove(
            async_track_state_change_event(
                self.hass,
                ["sensor.source_entity"],
                self._handle_state_change
            )
        )

    def _handle_state_change(self, event: Event) -> None:
        """Handle state change."""
        new_state = event.data.get("new_state")
        if new_state:
            self._attr_native_value = self._calculate_value(new_state.state)
            self.schedule_update_ha_state()
```

## Platform Setup Patterns

### Single Platform

```python
# __init__.py
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.config_entries.async_forward_entry_setups(entry, ["sensor"])
    return True

# sensor.py
async def async_setup_entry(hass, config_entry, async_add_entities):
    """Set up sensors."""
    device = hass.data[DOMAIN][config_entry.entry_id]
    async_add_entities([MySensor(device)])
```

### Multiple Platforms

```python
# __init__.py
PLATFORMS = [Platform.SENSOR, Platform.SWITCH, Platform.CLIMATE]

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True

async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
```

### Dynamic Platform Setup

```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up with dynamic platform detection."""
    device = await discover_device(entry.data)

    platforms = [Platform.SENSOR, Platform.SWITCH]

    if device.supports_climate:
        platforms.append(Platform.CLIMATE)
    if device.has_camera:
        platforms.append(Platform.CAMERA)

    await hass.config_entries.async_forward_entry_setups(entry, platforms)
    return True
```

## Error Handling

### Available Property

```python
class RobustEntity(SensorEntity):
    """Entity with proper availability handling."""

    def __init__(self) -> None:
        self._attr_available = True

    async def async_update(self) -> None:
        """Update with error handling."""
        try:
            self._attr_native_value = await self.device.get_value()
            self._attr_available = True
        except DeviceConnectionError:
            self._attr_available = False
        except Exception as err:
            self._attr_available = False
            _LOGGER.error("Unexpected error: %s", err)
```

### Exception Translation

```python
from homeassistant.exceptions import HomeAssistantError

class SafeEntity(LightEntity):
    """Entity with safe operation handling."""

    async def async_turn_on(self, **kwargs) -> None:
        """Turn on with error translation."""
        try:
            await self.device.turn_on()
        except DeviceTimeout:
            raise HomeAssistantError("Device did not respond in time")
        except DeviceError as err:
            raise HomeAssistantError(f"Device error: {err}")
```
