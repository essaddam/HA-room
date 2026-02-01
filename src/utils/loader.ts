// Load Home Assistant UI components needed for the card editor
// Compatible with Home Assistant 2024.x and 2025.x

// Dynamic import helper - hidden from bundlers using Function constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dynamicImport = (path: string): Promise<any> => {
  // Using Function to hide import from bundlers (Rollup/Webpack)
  const importer = new Function('path', 'return import(path);');
  return importer(path).catch(() => null);
};

export const loadHaComponents = async () => {
  // Helper to wait for custom element to be defined
  const waitForElement = async (name: string, timeout = 5000): Promise<boolean> => {
    if (customElements.get(name)) return true;
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => resolve(false), timeout);
      customElements.whenDefined(name).then(() => {
        clearTimeout(timeoutId);
        resolve(true);
      });
    });
  };

  // Try to load from hui-masonry-view if available (HA 2024.11+)
  if (!customElements.get("ha-form")) {
    try {
      await dynamicImport("../../panels/lovelace/ha-panel-lovelace.js");
      await waitForElement("ha-form", 2000);
    } catch {
      // Fallback: try alternative loading methods
    }
  }

  // Load entity picker if needed
  if (!customElements.get("ha-entity-picker")) {
    try {
      await dynamicImport("../../components/entity/ha-entity-picker.js");
      await waitForElement("ha-entity-picker", 2000);
    } catch {
      // Component may already be loaded or unavailable
    }
  }

  // Load card conditions editor if needed
  if (!customElements.get("ha-card-conditions-editor")) {
    try {
      await dynamicImport("../../panels/lovelace/editor/conditions/ha-card-conditions-editor.js");
      await waitForElement("ha-card-conditions-editor", 2000);
    } catch {
      // Component may already be loaded or unavailable
    }
  }

  // Final fallback: use tile card as trigger (deprecated but still functional)
  if (!customElements.get("ha-form")) {
    const tileCard = customElements.get("hui-tile-card");
    if (tileCard) {
      try {
        await (tileCard as unknown as { getConfigElement?: () => Promise<void> }).getConfigElement?.();
      } catch {
        // Ignore errors from legacy loading
      }
    }
  }
};
