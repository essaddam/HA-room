# Config Flow Advanced Patterns

Advanced patterns for Home Assistant config flow implementation.

## Discovery Support

### Zeroconf Discovery

```python
from homeassistant import config_entries
from homeassistant.components.zeroconf import ZeroconfServiceInfo

class MyConfigFlow(config_entries.ConfigFlow, domain="my_integration"):
    async def async_step_zeroconf(self, discovery_info: ZeroconfServiceInfo) -> FlowResult:
        """Handle zeroconf discovery."""
        host = discovery_info.host
        await self.async_set_unique_id(discovery_info.properties["id"])
        self._abort_if_unique_id_configured()

        self.context["title_placeholders"] = {"name": discovery_info.name}
        return await self.async_step_confirm()

    async def async_step_confirm(self, user_input=None):
        """Confirm discovery."""
        if user_input is not None:
            return self.async_create_entry(title=self.context["title_placeholders"]["name"], data=user_input)

        return self.async_show_form(step_id="confirm")
```

### SSDP Discovery

```python
from homeassistant.components.ssdp import SsdpServiceInfo

async def async_step_ssdp(self, discovery_info: SsdpServiceInfo) -> FlowResult:
    """Handle SSDP discovery."""
    serial = discovery_info.ssdp_headers.get("X-Serial-Number")
    await self.async_set_unique_id(serial)
    self._abort_if_unique_id_configured()
    # ...
```

### DHCP Discovery

```python
from homeassistant.components.dhcp import DhcpServiceInfo

async def async_step_dhcp(self, discovery_info: DhcpServiceInfo) -> FlowResult:
    """Handle DHCP discovery."""
    await self.async_set_unique_id(discovery_info.macaddress)
    self._abort_if_unique_id_configured()
    # ...
```

### Bluetooth Discovery

```python
from homeassistant.components.bluetooth import BluetoothServiceInfo

async def async_step_bluetooth(self, discovery_info: BluetoothServiceInfo) -> FlowResult:
    """Handle Bluetooth discovery."""
    await self.async_set_unique_id(discovery_info.address)
    self._abort_if_unique_id_configured()
    # ...
```

## Reauthentication

```python
from homeassistant.exceptions import ConfigEntryAuthFailed

class MyConfigFlow(config_entries.ConfigFlow, domain="my_integration"):
    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> FlowResult:
        """Handle re-authentication."""
        self.entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input=None):
        """Confirm reauth."""
        if user_input is not None:
            # Validate credentials
            try:
                await validate_auth(user_input[CONF_PASSWORD])
            except InvalidAuth:
                return self.async_show_form(
                    step_id="reauth_confirm",
                    errors={"base": "invalid_auth"}
                )

            # Update existing entry
            return self.async_update_reload_and_abort(
                self.entry,
                data={**self.entry.data, **user_input}
            )

        return self.async_show_form(step_id="reauth_confirm")
```

## Reconfiguration

```python
async def async_step_reconfigure(self, user_input=None):
    """Allow reconfiguration of existing entry."""
    entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])

    if user_input is not None:
        # Validate and update
        return self.async_update_reload_and_abort(
            entry,
            data={**entry.data, **user_input}
        )

    return self.async_show_form(
        step_id="reconfigure",
        data_schema=vol.Schema({
            vol.Required(CONF_HOST, default=entry.data[CONF_HOST]): str,
        })
    )
```

## Options Flow

Create `options_flow.py`:

```python
from homeassistant.core import callback
from homeassistant.config_entries import ConfigEntry, OptionsFlow

class MyOptionsFlow(OptionsFlow):
    """Options flow handler."""

    def __init__(self, config_entry: ConfigEntry) -> None:
        """Initialize options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Optional(
                    "scan_interval",
                    default=self.config_entry.options.get("scan_interval", 30)
                ): int,
            })
        )

# In config_flow.py, add:
@staticmethod
@callback
def async_get_options_flow(config_entry: ConfigEntry) -> MyOptionsFlow:
    """Get options flow."""
    return MyOptionsFlow(config_entry)
```

## Schema Config Flow Handler

For simple flows, use the helper:

```python
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaConfigFlowHandler,
    SchemaFlowFormStep,
    SchemaFlowMenuStep,
)

CONFIG_SCHEMA = vol.Schema({
    vol.Required(CONF_HOST): str,
    vol.Required(CONF_API_KEY): str,
})

OPTIONS_SCHEMA = vol.Schema({
    vol.Optional("scan_interval", default=30): int,
})

CONFIG_FLOW = {
    "user": SchemaFlowFormStep(CONFIG_SCHEMA),
}

OPTIONS_FLOW = {
    "init": SchemaFlowFormStep(OPTIONS_SCHEMA),
}

class MyConfigFlow(SchemaConfigFlowHandler, domain="my_integration"):
    """Config flow."""
    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW
```

## Multi-Step Flows

```python
class MyConfigFlow(config_entries.ConfigFlow, domain="my_integration"):
    VERSION = 1

    async def async_step_user(self, user_input=None):
        """Handle initial step."""
        if user_input is not None:
            self.host = user_input[CONF_HOST]
            return await self.async_step_auth()

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema({vol.Required(CONF_HOST): str})
        )

    async def async_step_auth(self, user_input=None):
        """Handle authentication step."""
        if user_input is not None:
            try:
                await validate_auth(self.host, user_input[CONF_PASSWORD])
            except InvalidAuth:
                return self.async_show_form(
                    step_id="auth",
                    errors={"base": "invalid_auth"}
                )

            return self.async_create_entry(
                title=self.host,
                data={CONF_HOST: self.host, CONF_PASSWORD: user_input[CONF_PASSWORD]}
            )

        return self.async_show_form(
            step_id="auth",
            data_schema=vol.Schema({vol.Required(CONF_PASSWORD): str})
        )
```

## Abort Reasons

Common abort patterns:

```python
# Already configured
await self.async_set_unique_id(device_id)
self._abort_if_unique_id_configured()

# Manual abort
return self.async_abort(reason="already_configured")
return self.async_abort(reason="cannot_connect")
return self.async_abort(reason="unknown")
```

## Error Handling

```python
from homeassistant.exceptions import HomeAssistantError

async def validate_input(hass: HomeAssistant, data: dict) -> dict:
    """Validate user input."""
    try:
        device = await Device.connect(data[CONF_HOST], data[CONF_PASSWORD])
    except InvalidAuth as err:
        raise InvalidAuth from err
    except CannotConnect as err:
        raise CannotConnect from err
    except Exception as err:
        raise UnknownError from err

    return {"title": device.name}

class InvalidAuth(HomeAssistantError):
    """Invalid authentication."""

class CannotConnect(HomeAssistantError):
    """Cannot connect to device."""
```

## Progress Flows

For long-running setup:

```python
async def async_step_user(self, user_input=None):
    """Handle initial step."""
    if user_input is not None:
        self._async_register_progress(
            self.hass.async_create_task(self._async_setup_device())
        )
        return self.async_show_progress(
            step_id="wait_for_device",
            progress_action="setup_device",
        )

    return self.async_show_form(step_id="user")

async def async_step_wait_for_device(self, user_input=None):
    """Wait for device setup."""
    if self._async_progress_done("setup_device"):
        return self.async_show_progress_done(next_step_id="finish")

    return self.async_show_progress(
        step_id="wait_for_device",
        progress_action="setup_device",
    )

async def async_step_finish(self, user_input=None):
    """Finish setup."""
    return self.async_create_entry(title="Device", data={})
```

## External Authentication (OAuth)

```python
async def async_step_oauth(self, user_input=None):
    """Handle OAuth."""
    if user_input is not None:
        return self.async_external_step(step_id="oauth_callback", url=AUTH_URL)

    return self.async_show_form(step_id="oauth")

async def async_step_oauth_callback(self, user_input=None):
    """Handle OAuth callback."""
    if user_input.get("code"):
        token = await exchange_code(user_input["code"])
        return self.async_create_entry(title="OAuth", data={"token": token})

    return self.async_abort(reason="oauth_error")
```

## Strings.json Structure

```json
{
  "config": {
    "abort": {
      "already_configured": "Device is already configured",
      "cannot_connect": "Failed to connect",
      "invalid_auth": "Invalid authentication",
      "unknown": "Unexpected error"
    },
    "error": {
      "cannot_connect": "Failed to connect",
      "invalid_auth": "Invalid authentication",
      "unknown": "Unexpected error"
    },
    "step": {
      "user": {
        "title": "Connect to device",
        "description": "Enter your device details",
        "data": {
          "host": "Host",
          "password": "Password"
        }
      },
      "auth": {
        "title": "Authentication",
        "data": {
          "password": "Password"
        }
      },
      "confirm": {
        "title": "Discovery",
        "description": "Do you want to set up {name}?"
      }
    }
  },
  "options": {
    "step": {
      "init": {
        "title": "Options",
        "data": {
          "scan_interval": "Scan interval (seconds)"
        }
      }
    }
  }
}
```
