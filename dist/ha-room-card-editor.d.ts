import { LitElement, nothing } from 'lit';
import { HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
export declare class HaRoomCardEditor extends LitElement implements LovelaceCardEditor {
    hass?: HomeAssistant;
    private _config?;
    private _componentsLoaded;
    private _pendingEntity;
    private _showAdvanced;
    static get styles(): import("lit").CSSResult;
    connectedCallback(): void;
    private _loadComponents;
    setConfig(config: any): void;
    protected render(): typeof nothing | import("lit-html").TemplateResult<1>;
    private _renderEditor;
    private _renderGeneralSection;
    private _renderSensorsSection;
    private _renderControlsSection;
    private _renderAppearanceSection;
    private _renderEntityListsSection;
    private _renderEntityListEditor;
    private _renderAdvancedToggle;
    private _renderAdvancedSections;
    private _renderNavigationSection;
    private _renderActionsSection;
    private _renderFeaturesSection;
    private _addEntityToList;
    private _removeEntityFromList;
    private _updateConfig;
    private _renderFallbackEditor;
    private _handleJsonChange;
    private _computeLabel;
    private _computeHelper;
}
//# sourceMappingURL=ha-room-card-editor.d.ts.map