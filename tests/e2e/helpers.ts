import { Page } from '@playwright/test';

// Note: Type declarations are already defined in setup.ts, no need to redeclare here

// Helper functions for HA Room Card testing

/**
 * Wait for Home Assistant to be fully loaded
 */
export async function waitForHomeAssistant(page: Page, timeout = 30000): Promise<void> {
  await page.waitForSelector('home-assistant', { timeout });
  
  // Wait for HA to initialize
  await page.waitForFunction(() => {
    return window.hass && window.hass.states && Object.keys(window.hass.states).length > 0;
  }, { timeout });
}

/**
 * Navigate to a specific Lovelace dashboard
 */
export async function navigateToDashboard(page: Page, dashboardPath = '/lovelace-test'): Promise<void> {
  await page.goto(`http://localhost:8123${dashboardPath}`);
  await waitForHomeAssistant(page);
}

/**
 * Get the current state of an entity from Home Assistant
 */
export async function getEntityState(page: Page, entityId: string): Promise<any> {
  return await page.evaluate((id) => {
    if (!window.hass || !window.hass.states[id]) {
      return null;
    }
    return window.hass.states[id];
  }, entityId);
}

/**
 * Wait for an entity state to change
 */
export async function waitForEntityStateChange(
  page: Page, 
  entityId: string, 
  timeout = 10000
): Promise<any> {
  const initialState = await getEntityState(page, entityId);
  
  return await page.waitForFunction(
    ({ id, initialState }) => {
      if (!window.hass || !window.hass.states[id]) return false;
      const currentState = window.hass.states[id];
      return currentState.state !== initialState.state;
    },
    { id: entityId, initialState },
    { timeout }
  );
}

/**
 * Call a Home Assistant service
 */
export async function callService(
  page: Page, 
  domain: string, 
  service: string, 
  serviceData: any = {}
): Promise<any> {
  return await page.evaluate(({ domain, service, serviceData }) => {
    if (!window.hass) throw new Error('Home Assistant not available');
    return window.hass.callService(domain, service, serviceData);
  }, { domain, service, serviceData });
}

/**
 * Toggle a light entity
 */
export async function toggleLight(page: Page, entityId: string): Promise<void> {
  await callService(page, 'light', 'toggle', { entity_id: entityId });
}

/**
 * Turn on a light entity
 */
export async function turnOnLight(page: Page, entityId: string): Promise<void> {
  await callService(page, 'light', 'turn_on', { entity_id: entityId });
}

/**
 * Turn off a light entity
 */
export async function turnOffLight(page: Page, entityId: string): Promise<void> {
  await callService(page, 'light', 'turn_off', { entity_id: entityId });
}

/**
 * Toggle a switch entity
 */
export async function toggleSwitch(page: Page, entityId: string): Promise<void> {
  await callService(page, 'switch', 'toggle', { entity_id: entityId });
}

/**
 * Get all HA Room Card elements on the page
 */
export async function getHARoomCards(page: Page) {
  return await page.locator('ha-room-card').all();
}

/**
 * Find a specific HA Room Card by its title or entity
 */
export async function findHARoomCard(page: Page, titleOrEntity: string) {
  const cards = await getHARoomCards(page);
  
  for (const card of cards) {
    // Check title
    const titleElement = await card.locator('.room-title').first();
    if (await titleElement.isVisible()) {
      const title = await titleElement.textContent();
      if (title && title.includes(titleOrEntity)) {
        return card;
      }
    }
    
    // Check if card contains the entity
    const entityElement = await card.locator(`[data-entity-id="${titleOrEntity}"]`).first();
    if (await entityElement.isVisible()) {
      return card;
    }
  }
  
  return null;
}

/**
 * Get all light entities within a card
 */
export async function getCardLights(page: Page, card: any) {
  return await card.locator('.light-entity').all();
}

/**
 * Get all sensor entities within a card
 */
export async function getCardSensors(page: Page, card: any) {
  return await card.locator('.sensor-entity').all();
}

/**
 * Get all binary sensor entities within a card
 */
export async function getCardBinarySensors(page: Page, card: any) {
  return await card.locator('.binary-sensor-entity').all();
}

/**
 * Click on an entity within a card
 */
export async function clickCardEntity(page: Page, card: any, entityType: string, index = 0): Promise<void> {
  const entities = await card.locator(`.${entityType}-entity`).all();
  if (entities.length > index) {
    await entities[index].click();
  } else {
    throw new Error(`No ${entityType} entity found at index ${index}`);
  }
}

/**
 * Check if a popup is open
 */
export async function isPopupOpen(page: Page): Promise<boolean> {
  const popup = await page.locator('.ha-room-popup, .room-popup').first();
  return await popup.isVisible();
}

/**
 * Wait for popup to open
 */
export async function waitForPopup(page: Page, timeout = 5000): Promise<any> {
  return await page.waitForSelector('.ha-room-popup, .room-popup', { timeout });
}

/**
 * Close any open popup
 */
export async function closePopup(page: Page): Promise<void> {
  const popup = await page.locator('.ha-room-popup, .room-popup').first();
  if (await popup.isVisible()) {
    const closeButton = await popup.locator('.close-button, .dismiss-button').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try clicking outside the popup
      await page.click('body', { position: { x: 10, y: 10 } });
    }
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Get the current theme information
 */
export async function getCurrentTheme(page: Page): Promise<string> {
  return await page.evaluate(() => {
    return (window.hass as any)?.themes?.selectedTheme || 'default';
  });
}

/**
 * Check if the page is in dark mode
 */
export async function isDarkMode(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.body.classList.contains('dark-mode') || 
           document.documentElement.getAttribute('data-theme') === 'dark';
  });
}

/**
 * Wait for card to update after state change
 */
export async function waitForCardUpdate(page: Page, card: any, timeout = 5000): Promise<void> {
  await page.waitForFunction((cardElement) => {
    // Check if card has finished updating
    return cardElement && !cardElement.classList.contains('updating');
  }, await card.elementHandle(), { timeout });
}

/**
 * Get card configuration
 */
export async function getCardConfig(page: Page, card: any): Promise<any> {
  return await card.evaluate((element: any) => {
    return element.config || {};
  });
}

/**
 * Mock Home Assistant states for testing
 */
export async function mockHAStates(page: Page, mockStates: Record<string, any>): Promise<void> {
  await page.evaluate((states) => {
    if (!window.hass) {
      (window as any).hass = {
        states: {},
        callService: () => Promise.resolve()
      };
    }
    
    // Merge mock states with existing ones
    if ((window as any).hass.states) {
      Object.assign((window as any).hass.states, states);
    }
  }, mockStates);
}

/**
 * Create test entities for development
 */
export const TEST_ENTITIES = {
  light: {
    'light.salon_light': {
      entity_id: 'light.salon_light',
      state: 'off',
      attributes: {
        friendly_name: 'Salon Light',
        supported_features: 33,
        brightness: 255,
        rgb_color: [255, 255, 255]
      }
    },
    'light.chambre_light': {
      entity_id: 'light.chambre_light',
      state: 'on',
      attributes: {
        friendly_name: 'Chambre Light',
        supported_features: 33,
        brightness: 128,
        rgb_color: [255, 200, 100]
      }
    }
  },
  sensor: {
    'sensor.temperature_salon': {
      entity_id: 'sensor.temperature_salon',
      state: '22.5',
      attributes: {
        friendly_name: 'Temperature Salon',
        unit_of_measurement: '°C',
        device_class: 'temperature'
      }
    },
    'sensor.humidite_salon': {
      entity_id: 'sensor.humidite_salon',
      state: '45',
      attributes: {
        friendly_name: 'Humidité Salon',
        unit_of_measurement: '%',
        device_class: 'humidity'
      }
    }
  },
  binary_sensor: {
    'binary_sensor.porte_salon': {
      entity_id: 'binary_sensor.porte_salon',
      state: 'off',
      attributes: {
        friendly_name: 'Porte Salon',
        device_class: 'door'
      }
    },
    'binary_sensor.fenetre_chambre': {
      entity_id: 'binary_sensor.fenetre_chambre',
      state: 'on',
      attributes: {
        friendly_name: 'Fenêtre Chambre',
        device_class: 'window'
      }
    }
  }
};