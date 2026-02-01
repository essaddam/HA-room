import {
  ActionConfig,
  LovelaceCard,
  NavigateActionConfig,
  MoreInfoActionConfig,
  CallServiceActionConfig,
} from 'custom-card-helpers';
import type { PropertyValues } from 'lit';

// Re-export PropertyValues as ChangedProperties for semantic clarity
export type ChangedProperties = PropertyValues<unknown>;

// Action type used within the card - union of all possible action types
export type CardAction =
  | NavigateActionConfig
  | MoreInfoActionConfig
  | CallServiceActionConfig
  | { action: 'none' }
  | { action: string }; // Fallback for custom/unknown actions

// Type guard functions for narrowing CardAction types
export function isNavigateAction(action: CardAction): action is NavigateActionConfig {
  return action.action === 'navigate' && 'navigation_path' in action;
}

export function isMoreInfoAction(action: CardAction): action is MoreInfoActionConfig {
  return action.action === 'more-info' && 'entity' in action;
}

export function isCallServiceAction(action: CardAction): action is CallServiceActionConfig {
  return action.action === 'call-service' && 'service' in action;
}

export interface HaRoomCardConfig extends LovelaceCard {
  // Basic configuration
  name?: string;
  icon?: string;
  icon_color?: string;
  bg_start?: string;
  bg_end?: string;

  // Entity configurations
  temp_entity?: string;
  hum_entity?: string;
  extra_chips?: EntityChipConfig[];
  power_list?: string[];
  light_list?: string[];
  presence_list?: string[];
  open_list?: string[];

  // Navigation hashes
  lights_hash?: string;
  plugs_hash?: string;
  covers_hash?: string;
  presence_hash?: string;
  open_hash?: string;
  audio_hash?: string;
  video_hash?: string;
  cameras_hash?: string;

  // Media entities
  audio_cover_entity?: string;
  video_cover_entity?: string;
  covers_label?: string;

  // Advanced configuration
  entities?: EntityConfig[];
  sensors?: string[];
  features?: string[];
  sensor_layout?: 'default' | 'stacked' | 'bottom';
  sensor_classes?: string[];
  thresholds?: ThresholdConfig;
  occupancy?: OccupancyConfig;
  background?: BackgroundConfig;
  styles?: CustomStylesConfig;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

// Navigation path type for validation
export type NavigationPath = `#${string}` | `/${string}` | `https://${string}` | `http://${string}`;

export interface EntityChipConfig {
  icon: string;
  icon_color: string;
  content: string;
  tap_action?: ActionConfig;
}

export interface EntityConfig {
  entity_id: string;
  on_color?: string;
  off_color?: string;
  icon_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  thresholds?: EntityThresholdConfig[];
}

export interface ThresholdConfig {
  temperature?: ThresholdEntry[];
  humidity?: ThresholdEntry[];
  mold?: number;
}

export interface ThresholdEntry {
  value?: number | string;
  entity_id?: string;
  operator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
}

export interface EntityThresholdConfig {
  threshold: number;
  icon_color?: string;
  operator?: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
}

export interface OccupancyConfig {
  entities?: string[];
  icon_color?: string;
  border_color?: string;
  animate?: boolean;
}

export interface BackgroundConfig {
  src?: string;
  opacity?: number;
  icon_only?: boolean;
}

export interface CustomStylesConfig {
  card?: string;
  header?: string;
  content?: string;
  entities?: string;
  sensors?: string;
}

export interface RoomCardData {
  temperature?: number;
  humidity?: number;
  power_total?: number;
  presence_count?: number;
  open_count?: number;
  light_count?: number;
  light_on_count?: number;
}

export interface EntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

// Comparison operators
export const OPERATORS = {
  GT: 'gt',
  GTE: 'gte',
  LT: 'lt',
  LTE: 'lte',
  EQ: 'eq',
};