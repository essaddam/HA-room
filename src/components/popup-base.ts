import { LitElement, html, css, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('popup-base')
export class PopupBase extends LitElement {
  @property({ attribute: false }) public hass!: any;
  @property({ attribute: false }) public config: any = {};

  // Support for Home Assistant 2025.12 theme integration
  protected willUpdate(): void {
    // Theme integration handled in parent component
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
      }

      .popup-content {
        background: var(--card-background-color, white);
        border-radius: 20px;
        max-width: 90vw;
        max-height: 90vh;
        width: 600px;
        max-width: 600px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      .popup-header {
        display: flex;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid var(--divider-color);
        background: var(--primary-color);
        color: white;
      }

      .popup-title {
        font-size: 18px;
        font-weight: 600;
        flex: 1;
      }

      .popup-icon {
        font-size: 24px;
        margin-right: 12px;
      }

      .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: background 0.2s ease;
      }

      .close-button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .popup-body {
        padding: 20px;
        max-height: calc(90vh - 80px);
        overflow-y: auto;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from { 
          transform: translateY(50px);
          opacity: 0;
        }
        to { 
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .popup-content {
          width: 95vw;
          max-width: 95vw;
          margin: 20px;
        }
        
        .popup-header {
          padding: 16px;
        }
        
        .popup-body {
          padding: 16px;
        }
      }
    `;
  }

  protected render(): TemplateResult {
    return html`
      <div class="popup-content">
        <div class="popup-header">
          <ha-icon class="popup-icon" icon=${this.config.icon || 'mdi:information'}></ha-icon>
          <div class="popup-title">${this.config.title || 'Popup'}</div>
          <button class="close-button" @click=${this._closePopup}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <div class="popup-body">
          ${this.renderBody()}
        </div>
      </div>
    `;
  }

  protected renderBody(): TemplateResult {
    return html`<p>Popup content goes here</p>`;
  }

  private _closePopup(): void {
    this.remove();
  }

  public open(): void {
    document.body.appendChild(this);
  }

  public close(): void {
    this.remove();
  }
}