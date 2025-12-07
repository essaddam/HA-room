import { LitElement, TemplateResult } from 'lit';
export declare class PopupBase extends LitElement {
    hass: any;
    config: any;
    private isDarkMode;
    private primaryColor;
    protected willUpdate(): void;
    static get styles(): import("lit").CSSResult;
    protected render(): TemplateResult;
    protected renderBody(): TemplateResult;
    private _closePopup;
    open(): void;
    close(): void;
}
//# sourceMappingURL=popup-base.d.ts.map