import { LitElement, nothing } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
export declare class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
    hass?: HomeAssistant;
    private _config?;
    connectedCallback(): void;
    setConfig(config: any): void;
    protected render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private _valueChanged;
    private _computeLabel;
    private _getSchema;
}
//# sourceMappingURL=ha-room-card-editor.d.ts.map