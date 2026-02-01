import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { HaRoomCardConfig, ChangedProperties } from './types.js';
export declare class HaRoomCard extends LitElement {
    hass: HomeAssistant;
    config: HaRoomCardConfig;
    private roomData;
    constructor();
    static get styles(): import("lit").CSSResult;
    setConfig(config: HaRoomCardConfig): void;
    protected willUpdate(changedProperties: ChangedProperties): void;
    private _updateRoomData;
    private _isValidNavigationPath;
    private _executeAction;
    private _handleCardAction;
    private _renderChip;
    private _handleChipAction;
    private _renderTemperatureChip;
    private _renderHumidityChip;
    private _renderPowerChip;
    private _renderPresenceChip;
    private _renderOpenChip;
    private _renderControlButton;
    private _handleButtonAction;
    private _renderLightsButton;
    private _renderPlugsButton;
    private _renderCoversButton;
    private _renderAudioButton;
    private _renderVideoButton;
    private _renderCamerasButton;
    protected render(): TemplateResult;
    static getConfigElement(): Promise<LovelaceCardEditor>;
    static getStubConfig(): {
        type: string;
        name: string;
        icon: string;
        icon_color: string;
        bg_start: string;
        bg_end: string;
        power_list: never[];
        light_list: never[];
        presence_list: never[];
        open_list: never[];
    };
    getGridOptions(): {
        rows: number;
        columns: number;
        min_rows: number;
        max_rows: number;
        min_columns: number;
        max_columns: number;
    };
    getCardSize(): number;
}
//# sourceMappingURL=ha-room-card.d.ts.map