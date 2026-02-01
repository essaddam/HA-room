import { LitElement, nothing } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
export declare class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
    hass?: HomeAssistant;
    private _config?;
    private _componentsLoaded;
    static get styles(): import("lit").CSSResult;
    connectedCallback(): void;
    private _loadComponents;
    setConfig(config: any): void;
    protected render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private _renderHaForm;
    private _renderFallbackEditor;
    private _handleJsonChange;
    private _valueChanged;
    private _computeLabel;
    private _getSchema;
}
//# sourceMappingURL=ha-room-card-editor.d.ts.map