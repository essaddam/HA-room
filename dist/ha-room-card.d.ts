import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
import { HaRoomCardConfig } from './types.js';
export declare class HaRoomCard extends LitElement {
    hass: HomeAssistant;
    config: HaRoomCardConfig;
    private roomData;
    static get styles(): import("lit").CSSResult;
    setConfig(config: HaRoomCardConfig): void;
    protected shouldUpdate(): boolean;
    protected willUpdate(): void;
    private _updateRoomData;
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
    static getConfigForm(): {
        schema: ({
            name: string;
            selector: {
                text: {};
                icon?: undefined;
            };
            type?: undefined;
            label?: undefined;
            icon?: undefined;
            schema?: undefined;
        } | {
            name: string;
            selector: {
                icon: {};
                text?: undefined;
            };
            type?: undefined;
            label?: undefined;
            icon?: undefined;
            schema?: undefined;
        } | {
            type: string;
            label: string;
            icon: string;
            schema: {
                name: string;
                selector: {
                    color: {};
                };
            }[];
            name?: undefined;
            selector?: undefined;
        } | {
            type: string;
            label: string;
            icon: string;
            schema: {
                name: string;
                selector: {
                    entity: {
                        domain: string[];
                    };
                };
            }[];
            name?: undefined;
            selector?: undefined;
        } | {
            type: string;
            label: string;
            icon: string;
            schema: {
                name: string;
                selector: {
                    entity: {
                        domain: string[];
                        multiple: boolean;
                    };
                };
            }[];
            name?: undefined;
            selector?: undefined;
        } | {
            type: string;
            label: string;
            icon: string;
            schema: ({
                name: string;
                selector: {
                    text: {};
                    select?: undefined;
                };
            } | {
                name: string;
                selector: {
                    select: {
                        options: {
                            value: string;
                            label: string;
                        }[];
                        multiple: boolean;
                    };
                    text?: undefined;
                };
            })[];
            name?: undefined;
            selector?: undefined;
        } | {
            type: string;
            label: string;
            icon: string;
            schema: {
                name: string;
                selector: {
                    action: {};
                };
            }[];
            name?: undefined;
            selector?: undefined;
        })[];
    };
    static getStubConfig(): object;
    getGridOptions(): {
        rows: number;
        columns: number;
        min_rows: number;
        max_rows: number;
    };
    getCardSize(): number;
}
//# sourceMappingURL=ha-room-card.d.ts.map