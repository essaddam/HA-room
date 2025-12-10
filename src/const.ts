export const CARD_VERSION = '1.46.25';

export const CARD_NAME = 'ha-room-card';

// Configuration constants
export const DEFAULT_CONFIG = {
  name: '',
  icon: 'mdi:home',
  icon_color: 'blue',
  bg_start: '#1e3a5f',
  bg_end: '#2d5a87',
  temp_entity: '',
  hum_entity: '',
  extra_chips: [],
  power_list: [],
  light_list: [],
  presence_list: [],
  open_list: [],
  lights_hash: '#lights',
  plugs_hash: '#plugs',
  covers_hash: '#covers',
  presence_hash: '#presence',
  open_hash: '#open',
  audio_hash: '#audio',
  video_hash: '#video',
  cameras_hash: '#cameras',
  audio_cover_entity: '',
  video_cover_entity: '',
  covers_label: 'Volets',
};

// Feature flags
export const FEATURES = {
  HIDE_CLIMATE_LABEL: 'hide_climate_label',
  HIDE_AREA_STATS: 'hide_area_stats',
  HIDE_ROOM_ICON: 'hide_room_icon',
  HIDE_SENSOR_ICONS: 'hide_sensor_icons',
  HIDE_SENSOR_LABELS: 'hide_sensor_labels',
  EXCLUDE_DEFAULT_ENTITIES: 'exclude_default_entities',
  SKIP_CLIMATE_STYLES: 'skip_climate_styles',
  SKIP_ENTITY_STYLES: 'skip_entity_styles',
  MULTI_LIGHT_BACKGROUND: 'multi_light_background',
  IGNORE_ENTITY: 'ignore_entity',
  STICKY_ENTITIES: 'sticky_entities',
  SLIDER: 'slider',
  FULL_CARD_ACTIONS: 'full_card_actions',
};

// Default sensor classes
export const DEFAULT_SENSOR_CLASSES = ['temperature', 'humidity', 'illuminance'];

// Color mappings
export const DEFAULT_COLORS = {
  temperature: 'orange',
  humidity: 'blue',
  power: 'yellow',
  presence: 'teal',
  open: 'red',
  light: 'amber',
  plug: 'purple',
  cover: 'cyan',
  audio: 'green',
  video: 'blue',
  camera: 'red',
};

// Comparison operators
export const OPERATORS = {
  GT: 'gt',
  GTE: 'gte',
  LT: 'lt',
  LTE: 'lte',
  EQ: 'eq',
};