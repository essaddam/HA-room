import { TemplateResult } from 'lit';
import { PopupBase } from './popup-base.js';
export declare class CamerasPopup extends PopupBase {
    entities: string[];
    static get styles(): import("lit").CSSResult;
    protected renderBody(): TemplateResult;
    private _renderCamera;
    private _openMoreInfo;
}
declare global {
    interface HTMLElementTagNameMap {
        'cameras-popup': CamerasPopup;
    }
}
//# sourceMappingURL=cameras-popup.d.ts.map