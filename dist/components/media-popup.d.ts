import { TemplateResult } from 'lit';
import { PopupBase } from './popup-base.js';
export declare class MediaPopup extends PopupBase {
    entityId: string;
    static get styles(): import("lit").CSSResult;
    protected renderBody(): TemplateResult;
    private _mediaService;
    private _setVolume;
}
declare global {
    interface HTMLElementTagNameMap {
        'media-popup': MediaPopup;
    }
}
//# sourceMappingURL=media-popup.d.ts.map