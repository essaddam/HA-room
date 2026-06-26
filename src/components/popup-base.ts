import { LitElement, html, css, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { HomeAssistant } from 'custom-card-helpers';

export interface PopupConfig {
  icon?: string;
  title?: string;
}

export class PopupBase extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ attribute: false }) public config: PopupConfig = {};

  static get styles() {
    return css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        background: rgba(0, 0, 0, 0.65);
        animation: fadeIn 0.15s ease;
      }

      .popup-backdrop {
        position: absolute;
        inset: 0;
      }

      .popup-content {
        position: relative;
        background: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #212121);
        border-radius: 20px;
        width: 100%;
        max-width: 560px;
        max-height: calc(100vh - 32px);
        overflow: hidden;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.28);
        animation: slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
      }

      .popup-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 20px 12px;
        border-bottom: 1px solid var(--divider-color, rgba(0,0,0,0.08));
      }

      .popup-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        flex-shrink: 0;
      }

      .popup-title {
        flex: 1;
        font-size: 18px;
        font-weight: 700;
      }

      .close-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: var(--secondary-background-color, rgba(0,0,0,0.05));
        color: var(--primary-text-color, #212121);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }

      .close-button:hover {
        background: var(--secondary-background-color, rgba(0,0,0,0.1));
      }

      .popup-body {
        padding: 16px 20px 24px;
        overflow-y: auto;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px) scale(0.96);
          opacity: 0;
        }
        to {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
      }

      @media (max-width: 600px) {
        :host {
          padding: 0;
          align-items: flex-end;
        }

        .popup-content {
          max-width: 100%;
          max-height: 90vh;
          border-radius: 20px 20px 0 0;
          animation: slideUpMobile 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
      }

      @keyframes slideUpMobile {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `;
  }

  protected render(): TemplateResult {
    return html`
      <div class="popup-backdrop" @click=${this._closePopup}></div>
      <div class="popup-content" role="dialog" aria-modal="true">
        <div class="popup-header">
          <div class="popup-icon">
            <ha-icon icon=${this.config.icon || 'mdi:information'}></ha-icon>
          </div>
          <div class="popup-title">${this.config.title || 'Popup'}</div>
          <button class="close-button" @click=${this._closePopup} aria-label="Fermer">
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
    this.close();
  }

  public open(): void {
    document.body.appendChild(this);
  }

  public close(): void {
    this.dispatchEvent(new CustomEvent('popup-closed', { bubbles: true, composed: true }));
    this.remove();
  }
}

if (!customElements.get('popup-base')) {
  customElements.define('popup-base', PopupBase);
}

declare global {
  interface HTMLElementTagNameMap {
    'popup-base': PopupBase;
  }
}
