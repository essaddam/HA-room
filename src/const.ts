export const CARD_VERSION = '1.47.12';

export const CARD_NAME = 'ha-room-card';
// Use valid custom element name (no colon) for browser registration
// The 'custom:' prefix is only for YAML config, not DOM element names
export const CARD_ELEMENT_NAME = 'ha-room-card';
export const CARD_FULL_NAME = 'custom:ha-room-card'; // For YAML config type
export const CARD_EDITOR_NAME = 'ha-room-card-editor';

// Debug mode - enabled only in development
export const DEBUG = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

// Conditional logger
export const logger = {
  log: (...args: unknown[]) => DEBUG && console.log(...args),
  warn: (...args: unknown[]) => DEBUG && console.warn(...args),
  error: (...args: unknown[]) => console.error(...args), // Always log errors
  info: (...args: unknown[]) => DEBUG && console.info(...args),
};


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