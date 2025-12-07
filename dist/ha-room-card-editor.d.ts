import { HaRoomCardConfig } from './types.js';
/**
 * Configuration form editor for HA Room Card
 * Provides visual editor interface for Home Assistant dashboard
 */
export declare class HaRoomCardEditor {
    /**
     * Get the form schema for the visual editor
     */
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
        assertConfig: (config: HaRoomCardConfig) => void;
        computeLabel: (schema: {
            name: string;
        }) => string;
    };
    /**
     * Get default configuration for new card instances
     */
    static getStubConfig(): {
        type: string;
        name: string;
        icon: string;
        icon_color: string;
        bg_start: string;
        bg_end: string;
        temp_entity: string;
        hum_entity: string;
        power_list: string[];
        light_list: string[];
        presence_list: string[];
        open_list: string[];
    };
}
//# sourceMappingURL=ha-room-card-editor.d.ts.map