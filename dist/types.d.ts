import { ActionConfig, LovelaceCard } from 'custom-card-helpers';
export interface HaRoomCardConfig extends LovelaceCard {
    name?: string;
    icon?: string;
    icon_color?: string;
    bg_start?: string;
    bg_end?: string;
    temp_entity?: string;
    hum_entity?: string;
    extra_chips?: EntityChipConfig[];
    power_list?: string[];
    light_list?: string[];
    presence_list?: string[];
    open_list?: string[];
    lights_hash?: string;
    plugs_hash?: string;
    covers_hash?: string;
    presence_hash?: string;
    open_hash?: string;
    audio_hash?: string;
    video_hash?: string;
    cameras_hash?: string;
    audio_cover_entity?: string;
    video_cover_entity?: string;
    covers_label?: string;
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
export interface EntityChipConfig {
    type: 'template';
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
export declare const OPERATORS: {
    GT: string;
    GTE: string;
    LT: string;
    LTE: string;
    EQ: string;
};
//# sourceMappingURL=types.d.ts.map