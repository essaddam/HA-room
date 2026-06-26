import { TemplateResult } from 'lit';
import { PopupBase } from './popup-base.js';
export declare class CoversPopup extends PopupBase {
    entities: string[];
    static get styles(): import("lit").CSSResult;
    protected renderBody(): TemplateResult;
    private _renderCover;
    private _formatState;
    private _callCoverService;
}
declare global {
    interface HTMLElementTagNameMap {
        'covers-popup': CoversPopup;
    }
}
//# sourceMappingURL=covers-popup.d.ts.map