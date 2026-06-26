// Load Home Assistant UI components needed for the card editor
// Compatible with Home Assistant 2024.x and 2025.x/2026.x

// Track loading state
let componentsLoaded = false;
let componentsLoading = false;

/**
 * Wait for a custom element to be defined with timeout
 */
const waitForElement = async (name: string, timeout = 8000): Promise<boolean> => {
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
    // Strategy 1: Wait for HA to load ha-form naturally (most common in 2025.x)
    if (!customElements.get('ha-form')) {
      await waitForElement('ha-form', 3000);
    }

    // Strategy 2: Load entity picker components if needed
    if (!customElements.get('ha-entity-picker')) {
      try {
        const basePath = window.location.pathname.replace(/\/$/, '');
        const pickerPath = `${basePath}/frontend_latest/components/entity/ha-entity-picker.js`;
        await loadScript(pickerPath);
        await waitForElement('ha-entity-picker', 3000);
      } catch (e) {
        console.log('[HA Room Card] Entity picker load failed:', e);
      }
    }

    // Strategy 3: Try loading the selector components used by ha-form
    if (!customElements.get('ha-form')) {
      try {
        const basePath = window.location.pathname.replace(/\/$/, '');
        const formPath = `${basePath}/frontend_latest/components/ha-form/ha-form.js`;
        await loadScript(formPath);
        await waitForElement('ha-form', 5000);
      } catch (e) {
        console.log('[HA Room Card] ha-form load failed:', e);
      }
    }

    // Strategy 4: Use tile card config element as trigger (works in most HA versions)
    if (!customElements.get('ha-form')) {
      try {
        const tileCard = customElements.get('hui-tile-card');
        if (tileCard && 'getConfigElement' in tileCard) {
          const configElement = await (tileCard as unknown as { getConfigElement: () => Promise<HTMLElement> }).getConfigElement();
          if (configElement) {
            await new Promise(r => setTimeout(r, 500));
          }
        }
      } catch (e) {
        console.log('[HA Room Card] Tile card trigger failed:', e);
      }
    }

    // Final check
    const hasForm = !!customElements.get('ha-form');
    const hasEntityPicker = !!customElements.get('ha-entity-picker');
    componentsLoaded = hasForm;

    if (componentsLoaded) {
      console.log('[HA Room Card] HA components loaded successfully');
    } else {
      console.warn('[HA Room Card] Some components failed to load. Editor may have limited functionality.');
      // Do NOT mark as loaded if ha-form is missing, so the editor can retry
      componentsLoaded = hasForm || hasEntityPicker;
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
