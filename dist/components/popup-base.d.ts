import { LitElement, TemplateResult } from 'lit';
import { HomeAssistant } from 'custom-card-helpers';
export interface PopupConfig {
    icon?: string;
    title?: string;
}
export declare class PopupBase extends LitElement {
    hass: HomeAssistant;
    config: PopupConfig;
    static get styles(): import("lit").CSSResult;
    protected render(): TemplateResult;
    protected renderBody(): TemplateResult;
    private _closePopup;
    open(): void;
    close(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'popup-base': PopupBase;
    }
}
//# sourceMappingURL=popup-base.d.ts.map