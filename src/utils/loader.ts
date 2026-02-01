// Load Home Assistant UI components needed for the card editor
// Compatible with Home Assistant 2024.x and 2025.x/2026.x

// Track loading state
let componentsLoaded = false;
let componentsLoading = false;

/**
 * Wait for a custom element to be defined with timeout
 */
const waitForElement = async (name: string, timeout = 5000): Promise<boolean> => {
  if (customElements.get(name)) return true;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn(`[HA Room Card] Timeout waiting for ${name}`);
      resolve(false);
    }, timeout);

    customElements.whenDefined(name).then(() => {
      clearTimeout(timeoutId);
      resolve(true);
    }).catch(() => {
      clearTimeout(timeoutId);
      resolve(false);
    });
  });
};

/**
 * Load a script dynamically
 */
const loadScript = async (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn(`[HA Room Card] Failed to load: ${src}`);
      resolve(false);
    };
    document.head.appendChild(script);
  });
};

/**
 * Load Home Assistant components using multiple strategies
 */
export const loadHaComponents = async (): Promise<boolean> => {
  // Prevent concurrent loading
  if (componentsLoading) {
    // Wait for existing loading to complete
    let attempts = 0;
    while (componentsLoading && attempts < 50) {
      await new Promise(r => setTimeout(r, 100));
      attempts++;
    }
    return componentsLoaded;
  }

  if (componentsLoaded) return true;

  componentsLoading = true;
  console.log('[HA Room Card] Loading HA components...');

  try {
    // Strategy 1: Try loading from hui-masonry-view (HA 2024.11+)
    if (!customElements.get('ha-form')) {
      try {
        const basePath = window.location.pathname.replace(/\/$/, '');
        const panelPath = `${basePath}/frontend_latest/panels/lovelace/ha-panel-lovelace.js`;
        await loadScript(panelPath);
        await new Promise(r => setTimeout(r, 500));
        await waitForElement('ha-form', 3000);
      } catch (e) {
        console.log('[HA Room Card] Strategy 1 failed:', e);
      }
    }

    // Strategy 2: Load entity picker components
    if (!customElements.get('ha-entity-picker')) {
      try {
        const basePath = window.location.pathname.replace(/\/$/, '');
        const pickerPath = `${basePath}/frontend_latest/components/entity/ha-entity-picker.js`;
        await loadScript(pickerPath);
        await waitForElement('ha-entity-picker', 2000);
      } catch (e) {
        console.log('[HA Room Card] Strategy 2 failed:', e);
      }
    }

    // Strategy 3: Use tile card as trigger (works in most HA versions)
    if (!customElements.get('ha-form')) {
      try {
        const tileCard = customElements.get('hui-tile-card');
        if (tileCard && 'getConfigElement' in tileCard) {
          const configElement = await (tileCard as unknown as { getConfigElement: () => Promise<HTMLElement> }).getConfigElement();
          if (configElement) {
            await new Promise(r => setTimeout(r, 300));
          }
        }
      } catch (e) {
        console.log('[HA Room Card] Strategy 3 failed:', e);
      }
    }

    // Strategy 4: Trigger any card editor (forces HA to load editor components)
    if (!customElements.get('ha-form')) {
      try {
        const buttonCard = customElements.get('hui-button-card');
        if (buttonCard && 'getConfigElement' in buttonCard) {
          await (buttonCard as unknown as { getConfigElement: () => Promise<HTMLElement> }).getConfigElement();
          await new Promise(r => setTimeout(r, 300));
        }
      } catch (e) {
        console.log('[HA Room Card] Strategy 4 failed:', e);
      }
    }

    // Final check
    componentsLoaded = !!(customElements.get('ha-form') && customElements.get('ha-entity-picker'));

    if (componentsLoaded) {
      console.log('[HA Room Card] HA components loaded successfully');
    } else {
      console.warn('[HA Room Card] Some components failed to load. Editor may have limited functionality.');
      // Mark as loaded anyway to prevent infinite retries
      componentsLoaded = true;
    }

    return componentsLoaded;
  } finally {
    componentsLoading = false;
  }
};

/**
 * Check if HA components are available
 */
export const areComponentsLoaded = (): boolean => {
  return componentsLoaded && !!customElements.get('ha-form');
};

/**
 * Force reload of components (for recovery)
 */
export const reloadComponents = async (): Promise<boolean> => {
  componentsLoaded = false;
  componentsLoading = false;
  return loadHaComponents();
};
