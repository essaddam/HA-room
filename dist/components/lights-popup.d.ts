import { TemplateResult } from 'lit';
import { PopupBase } from './popup-base.js';
export declare class LightsPopup extends PopupBase {
    lights: string[];
    static get styles(): import("lit").CSSResult;
    protected renderBody(): TemplateResult;
    private _renderLight;
    private _toggleLight;
    private _setBrightness;
}
//# sourceMappingURL=lights-popup.d.ts.map