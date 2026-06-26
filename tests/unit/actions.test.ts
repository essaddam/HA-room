import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Card Actions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function createCardWithHass() {
    const { HaRoomCard } = await import('../../src/ha-room-card.js');
    if (!customElements.get('ha-room-card')) {
      customElements.define('ha-room-card', HaRoomCard);
    }
    const card = document.createElement('ha-room-card') as any;
    card.hass = {
      states: {},
      callService: vi.fn(),
      themes: { default_theme: 'default', themes: {} }
    };
    card.config = { type: 'custom:ha-room-card', name: 'Test' };
    return card;
  }

  it('should use navigate helper for navigation actions', async () => {
    const navigateMock = vi.fn();
    vi.doMock('custom-card-helpers', async () => {
      const actual = await vi.importActual<typeof import('custom-card-helpers')>('custom-card-helpers');
      return { ...actual, navigate: navigateMock };
    });

    const { HaRoomCard } = await import('../../src/ha-room-card.js');
    if (!customElements.get('ha-room-card')) {
      customElements.define('ha-room-card', HaRoomCard);
    }
    const card = document.createElement('ha-room-card') as any;
    card.hass = { states: {}, themes: { default_theme: 'default', themes: {} } };
    card.config = { type: 'custom:ha-room-card', name: 'Test' };

    card._executeAction({ action: 'navigate', navigation_path: '#lights' }, 'test');

    expect(navigateMock).toHaveBeenCalledWith(card, '#lights');
  });

  it('should handle legacy call-service actions', async () => {
    const card = await createCardWithHass();
    card._executeAction({ action: 'call-service', service: 'light.turn_on', service_data: { entity_id: 'light.test' } }, 'test');
    expect(card.hass.callService).toHaveBeenCalledWith('light', 'turn_on', { entity_id: 'light.test' });
  });

  it('should handle perform-action actions (HA 2025.12+)', async () => {
    const card = await createCardWithHass();
    card._executeAction({
      action: 'perform-action',
      perform_action: 'light.turn_on',
      data: { brightness_pct: 50 },
      target: { entity_id: 'light.test' }
    }, 'test');
    expect(card.hass.callService).toHaveBeenCalledWith('light', 'turn_on', { brightness_pct: 50 }, { entity_id: 'light.test' });
  });

  it('should prefer card_tap_action over legacy tap_action', async () => {
    const card = await createCardWithHass();
    card.config = {
      type: 'custom:ha-room-card',
      name: 'Test',
      card_tap_action: { action: 'navigate', navigation_path: '/new' },
      tap_action: { action: 'navigate', navigation_path: '/legacy' },
    };

    const action = card._getCardAction();
    expect(action).toEqual({ action: 'navigate', navigation_path: '/new' });
  });

  it('should fall back to legacy tap_action when card_tap_action is absent', async () => {
    const card = await createCardWithHass();
    card.config = {
      type: 'custom:ha-room-card',
      name: 'Test',
      tap_action: { action: 'navigate', navigation_path: '/legacy' },
    };

    const action = card._getCardAction();
    expect(action).toEqual({ action: 'navigate', navigation_path: '/legacy' });
  });
});
