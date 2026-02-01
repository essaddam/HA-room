# Home Assistant Entity Platforms Reference

Complete reference for all Home Assistant entity platforms.

## Sensor

Device classes: `apparent_power`, `aqi`, `atmospheric_pressure`, `battery`, `carbon_dioxide`, `carbon_monoxide`, `current`, `data_rate`, `data_size`, `date`, `distance`, `duration`, `energy`, `energy_storage`, `enum`, `frequency`, `gas`, `humidity`, `illuminance`, `irradiance`, `moisture`, `monetary`, `nitrogen_dioxide`, `nitrogen_monoxide`, `nitrous_oxide`, `ozone`, `ph`, `pm1`, `pm10`, `pm25`, `power`, `power_factor`, `precipitation`, `precipitation_intensity`, `pressure`, `reactive_power`, `signal_strength`, `sound_pressure`, `speed`, `sulphur_dioxide`, `temperature`, `timestamp`, `volatile_organic_compounds`, `volatile_organic_compounds_parts`, `voltage`, `volume`, `volume_flow_rate`, `volume_storage`, `water`, `weight`, `wind_speed`

```python
from homeassistant.components.sensor import SensorEntity, SensorDeviceClass, SensorStateClass
from homeassistant.const import UnitOfTemperature, UnitOfPower

class MySensor(SensorEntity):
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1
```

## Binary Sensor

Device classes: `battery`, `battery_charging`, `carbon_monoxide`, `cold`, `connectivity`, `door`, `garage_door`, `gas`, `heat`, `light`, `lock`, `moisture`, `motion`, `moving`, `occupancy`, `opening`, `plug`, `power`, `presence`, `problem`, `running`, `safety`, `smoke`, `sound`, `tamper`, `update`, `vibration`, `window`

```python
from homeassistant.components.binary_sensor import BinarySensorEntity, BinarySensorDeviceClass

class MyBinarySensor(BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.MOTION
```

## Climate

```python
from homeassistant.components.climate import ClimateEntity, ClimateEntityFeature, HVACMode
from homeassistant.const import UnitOfTemperature, ATTR_TEMPERATURE

class MyClimate(ClimateEntity):
    _attr_hvac_modes = [HVACMode.OFF, HVACMode.HEAT, HVACMode.COOL, HVACMode.AUTO]
    _attr_fan_modes = ["auto", "low", "medium", "high"]
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_target_temperature_step = 0.5
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE |
        ClimateEntityFeature.FAN_MODE |
        ClimateEntityFeature.PRESET_MODE
    )

    async def async_set_temperature(self, **kwargs) -> None:
        temperature = kwargs.get(ATTR_TEMPERATURE)
        await self.device.set_temp(temperature)

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        await self.device.set_mode(hvac_mode)
```

## Light

```python
from homeassistant.components.light import (
    LightEntity, ColorMode, LightEntityFeature,
    ATTR_BRIGHTNESS, ATTR_COLOR_TEMP_KELVIN, ATTR_RGB_COLOR
)

class MyLight(LightEntity):
    _attr_color_mode = ColorMode.COLOR_TEMP
    _attr_supported_color_modes = {ColorMode.COLOR_TEMP, ColorMode.RGB}
    _attr_min_color_temp_kelvin = 2700
    _attr_max_color_temp_kelvin = 6500

    async def async_turn_on(self, **kwargs):
        if ATTR_BRIGHTNESS in kwargs:
            await self.device.set_brightness(kwargs[ATTR_BRIGHTNESS])
        if ATTR_COLOR_TEMP_KELVIN in kwargs:
            await self.device.set_color_temp(kwargs[ATTR_COLOR_TEMP_KELVIN])
```

## Switch

```python
from homeassistant.components.switch import SwitchEntity, SwitchDeviceClass

class MySwitch(SwitchEntity):
    _attr_device_class = SwitchDeviceClass.OUTLET

    async def async_turn_on(self, **kwargs):
        await self.device.turn_on()

    async def async_turn_off(self, **kwargs):
        await self.device.turn_off()
```

## Cover

```python
from homeassistant.components.cover import CoverEntity, CoverDeviceClass, CoverEntityFeature

class MyCover(CoverEntity):
    _attr_device_class = CoverDeviceClass.GARAGE
    _attr_supported_features = (
        CoverEntityFeature.OPEN |
        CoverEntityFeature.CLOSE |
        CoverEntityFeature.STOP |
        CoverEntityFeature.SET_POSITION
    )

    async def async_open_cover(self, **kwargs):
        await self.device.open()

    async def async_close_cover(self, **kwargs):
        await self.device.close()

    async def async_set_cover_position(self, position: int):
        await self.device.set_position(position)
```

## Fan

```python
from homeassistant.components.fan import FanEntity, FanEntityFeature

class MyFan(FanEntity):
    _attr_preset_modes = ["auto", "sleep", "boost"]
    _attr_supported_features = (
        FanEntityFeature.SET_SPEED |
        FanEntityFeature.PRESET_MODE |
        FanEntityFeature.OSCILLATE |
        FanEntityFeature.DIRECTION
    )

    async def async_set_percentage(self, percentage: int) -> None:
        await self.device.set_speed(percentage)
```

## Media Player

```python
from homeassistant.components.media_player import MediaPlayerEntity, MediaPlayerEntityFeature
from homeassistant.components.media_player.const import MediaPlayerState, MediaType

class MyMediaPlayer(MediaPlayerEntity):
    _attr_supported_features = (
        MediaPlayerEntityFeature.PLAY |
        MediaPlayerEntityFeature.PAUSE |
        MediaPlayerEntityFeature.STOP |
        MediaPlayerEntityFeature.VOLUME_SET |
        MediaPlayerEntityFeature.VOLUME_MUTE
    )

    async def async_media_play(self):
        await self.device.play()

    async def async_media_pause(self):
        await self.device.pause()

    async def async_set_volume_level(self, volume: float):
        await self.device.set_volume(int(volume * 100))
```

## Lock

```python
from homeassistant.components.lock import LockEntity, LockEntityFeature

class MyLock(LockEntity):
    _attr_supported_features = LockEntityFeature.OPEN

    async def async_lock(self, **kwargs):
        await self.device.lock()

    async def async_unlock(self, **kwargs):
        await self.device.unlock()

    async def async_open(self, **kwargs):
        await self.device.open()
```

## Camera

```python
from homeassistant.components.camera import Camera

class MyCamera(Camera):
    async def async_camera_image(self, width: int | None = None, height: int | None = None) -> bytes | None:
        return await self.device.get_snapshot()
```

## Button

```python
from homeassistant.components.button import ButtonEntity

class MyButton(ButtonEntity):
    async def async_press(self) -> None:
        await self.device.trigger()
```

## Number

```python
from homeassistant.components.number import NumberEntity, NumberDeviceClass, NumberMode

class MyNumber(NumberEntity):
    _attr_device_class = NumberDeviceClass.TEMPERATURE
    _attr_mode = NumberMode.SLIDER  # or NumberMode.BOX
    _attr_native_min_value = 0
    _attr_native_max_value = 100
    _attr_native_step = 1

    async def async_set_native_value(self, value: float) -> None:
        await self.device.set_value(value)
```

## Select

```python
from homeassistant.components.select import SelectEntity

class MySelect(SelectEntity):
    _attr_options = ["option1", "option2", "option3"]

    async def async_select_option(self, option: str) -> None:
        await self.device.set_mode(option)
```

## Text

```python
from homeassistant.components.text import TextEntity, TextMode

class MyText(TextEntity):
    _attr_mode = TextMode.TEXT  # or TextMode.PASSWORD
    _attr_native_min = 0
    _attr_native_max = 255

    async def async_set_value(self, value: str) -> None:
        await self.device.set_text(value)
```

## Time / Date / DateTime

```python
from homeassistant.components.time import TimeEntity
from homeassistant.components.date import DateEntity
from homeassistant.components.datetime import DateTimeEntity

class MyTime(TimeEntity):
    async def async_set_value(self, value: time) -> None:
        await self.device.set_time(value)
```

## Vacuum

```python
from homeassistant.components.vacuum import VacuumEntity, VacuumEntityFeature

class MyVacuum(VacuumEntity):
    _attr_supported_features = (
        VacuumEntityFeature.START |
        VacuumEntityFeature.STOP |
        VacuumEntityFeature.RETURN_HOME |
        VacuumEntityFeature.FAN_SPEED
    )
    _attr_fan_speed_list = ["quiet", "normal", "max"]
```

## Weather

```python
from homeassistant.components.weather import WeatherEntity

class MyWeather(WeatherEntity):
    _attr_native_temperature_unit = UnitOfTemperature.CELSIUS

    @property
    def condition(self) -> str:
        return self.coordinator.data["condition"]  # sunny, cloudy, rainy, etc.
```

## Alarm Control Panel

```python
from homeassistant.components.alarm_control_panel import AlarmControlPanelEntity, AlarmControlPanelEntityFeature
from homeassistant.components.alarm_control_panel.const import AlarmControlPanelState

class MyAlarm(AlarmControlPanelEntity):
    _attr_supported_features = (
        AlarmControlPanelEntityFeature.ARM_HOME |
        AlarmControlPanelEntityFeature.ARM_AWAY |
        AlarmControlPanelEntityFeature.ARM_NIGHT
    )
    _attr_code_arm_required = False
```

## Device Tracker

```python
from homeassistant.components.device_tracker import TrackerEntity

class MyDeviceTracker(TrackerEntity):
    @property
    def latitude(self) -> float:
        return self.device.lat

    @property
    def longitude(self) -> float:
        return self.device.lon
```

## Calendar

```python
from homeassistant.components.calendar import CalendarEntity, CalendarEvent

class MyCalendar(CalendarEntity):
    @property
    def event(self) -> CalendarEvent | None:
        return self._next_event

    async def async_get_events(self, start_date: datetime, end_date: datetime) -> list[CalendarEvent]:
        return await self.device.get_events(start_date, end_date)
```

## Notify

```python
from homeassistant.components.notify import NotifyEntity

class MyNotifier(NotifyEntity):
    async def async_send_message(self, message: str, title: str | None = None) -> None:
        await self.device.send_notification(title or "Home Assistant", message)
```

## Event

```python
from homeassistant.components.event import EventEntity, EventDeviceClass

class MyEvent(EventEntity):
    _attr_device_class = EventDeviceClass.BUTTON
    _attr_event_types = ["single_press", "double_press", "long_press"]
```

## Update

```python
from homeassistant.components.update import UpdateEntity, UpdateDeviceClass

class MyUpdate(UpdateEntity):
    _attr_device_class = UpdateDeviceClass.FIRMWARE
    _attr_title = "Device Firmware"

    async def async_install(self, version: str | None, backup: bool) -> None:
        await self.device.update_firmware(version)
```

## Lawn Mower

```python
from homeassistant.components.lawn_mower import LawnMowerEntity, LawnMowerActivity, LawnMowerEntityFeature

class MyLawnMower(LawnMowerEntity):
    _attr_supported_features = (
        LawnMowerEntityFeature.START_MOWING |
        LawnMowerEntityFeature.PAUSE |
        LawnMowerEntityFeature.DOCK
    )
```

## Humidifier

```python
from homeassistant.components.humidifier import HumidifierEntity, HumidifierEntityFeature, HumidifierDeviceClass

class MyHumidifier(HumidifierEntity):
    _attr_device_class = HumidifierDeviceClass.HUMIDIFIER
    _attr_supported_features = HumidifierEntityFeature.MODES
    _attr_available_modes = ["normal", "eco", "away"]
```

## Water Heater

```python
from homeassistant.components.water_heater import WaterHeaterEntity, WaterHeaterEntityFeature

class MyWaterHeater(WaterHeaterEntity):
    _attr_supported_features = (
        WaterHeaterEntityFeature.TARGET_TEMPERATURE |
        WaterHeaterEntityFeature.OPERATION_MODE |
        WaterHeaterEntityFeature.AWAY_MODE
    )
```

## Image

```python
from homeassistant.components.image import ImageEntity

class MyImage(ImageEntity):
    async def async_image(self) -> bytes | None:
        return await self.device.get_image()
```

## Tag (RFID/NFC)

```python
from homeassistant.components.tag import TagScannerEntity

class MyTagScanner(TagScannerEntity):
    @property
    def tag_id(self) -> str:
        return self._tag_id
```

## Scene

```python
from homeassistant.components.scene import Scene

class MyScene(Scene):
    async def async_activate(self, **kwargs) -> None:
        await self.device.activate_scene()
```

## Siren

```python
from homeassistant.components.siren import SirenEntity, SirenEntityFeature

class MySiren(SirenEntity):
    _attr_supported_features = (
        SirenEntityFeature.TURN_ON |
        SirenEntityFeature.TONES |
        SirenEntityFeature.VOLUME_SET |
        SirenEntityFeature.DURATION
    )
    _attr_available_tones = ["alarm", "fire", "intrusion"]
```

## Valve

```python
from homeassistant.components.valve import ValveEntity, ValveDeviceClass, ValveEntityFeature

class MyValve(ValveEntity):
    _attr_device_class = ValveDeviceClass.WATER
    _attr_supported_features = (
        ValveEntityFeature.OPEN |
        ValveEntityFeature.CLOSE |
        ValveEntityFeature.SET_POSITION
    )
```

## Remote

```python
from homeassistant.components.remote import RemoteEntity, RemoteEntityFeature

class MyRemote(RemoteEntity):
    _attr_supported_features = RemoteEntityFeature.ACTIVITY
    _attr_activity_list = ["Watch TV", "Listen to Music", "Play Game"]

    async def async_send_command(self, command: Iterable[str], **kwargs) -> None:
        for cmd in command:
            await self.device.send_ir(cmd)
```

## Geo Location

```python
from homeassistant.components.geo_location import GeolocationEvent

class MyGeoEvent(GeolocationEvent):
    @property
    def source(self) -> str:
        return "my_integration"
```

## Air Quality

```python
from homeassistant.components.air_quality import AirQualityEntity

class MyAirQuality(AirQualityEntity):
    @property
    def particulate_matter_2_5(self) -> int | None:
        return self.coordinator.data.get("pm25")
```
