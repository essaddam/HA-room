import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
interface PopupConfig {
    icon?: string;
    title?: string;
}
export declare class PopupBase extends LitElement {
    hass: HomeAssistant;
    config: PopupConfig;
    protected willUpdate(): void;
    static get styles(): import("lit").CSSResult;
    protected render(): TemplateResult;
    protected renderBody(): TemplateResult;
    private _closePopup;
    open(): void;
    close(): void;
}
export {};
//# sourceMappingURL=popup-base.d.ts.map