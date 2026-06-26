import { TemplateResult } from 'lit';
import { PopupBase } from './popup-base.js';
export declare class PresencePopup extends PopupBase {
    entities: string[];
    static get styles(): import("lit").CSSResult;
    protected renderBody(): TemplateResult;
    private _renderPresenceSensor;
}
declare global {
    interface HTMLElementTagNameMap {
        'presence-popup': PresencePopup;
    }
}
//# sourceMappingURL=presence-popup.d.ts.map