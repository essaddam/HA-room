// Load Home Assistant UI components needed for the card editor
// Compatible with Home Assistant 2024.x and 2025.x
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
      // @ts-ignore - Dynamic import of HA internals
      const module = await import("../../panels/lovelace/ha-panel-lovelace.js").catch(() => null);
      if (module) {
        await waitForElement("ha-form", 2000);
      }
    } catch {
      // Fallback: try alternative loading methods
    }
  }

  // Load entity picker if needed
  if (!customElements.get("ha-entity-picker")) {
    try {
      // @ts-ignore - Dynamic import
      await import("../../components/entity/ha-entity-picker.js").catch(() => null);
      await waitForElement("ha-entity-picker", 2000);
    } catch {
      // Component may already be loaded or unavailable
    }
  }

  // Load card conditions editor if needed
  if (!customElements.get("ha-card-conditions-editor")) {
    try {
      // @ts-ignore - Dynamic import
      await import("../../panels/lovelace/editor/conditions/ha-card-conditions-editor.js").catch(() => null);
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
        await (tileCard as any).getConfigElement?.();
      } catch {
        // Ignore errors from legacy loading
      }
    }
  }
};
