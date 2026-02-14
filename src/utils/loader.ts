// Load Home Assistant UI components needed for the card editor
// Uses the proven pattern from mushroom-cards: trigger HA's lazy-loading
// by calling getConfigElement() on built-in cards.
// Compatible with Home Assistant 2024.x, 2025.x and 2026.x

/**
 * Load Home Assistant form components by triggering built-in card editors.
 * This forces HA to lazy-load ha-form, ha-entity-picker, and all selectors.
 */
export const loadHaComponents = (): void => {
  // Trigger ha-form and selector components via tile card editor
  if (!customElements.get('ha-form') || !customElements.get('hui-card-features-editor')) {
    (customElements.get('hui-tile-card') as any)?.getConfigElement();
  }

  // Trigger ha-entity-picker via entities card editor
  if (!customElements.get('ha-entity-picker')) {
    (customElements.get('hui-entities-card') as any)?.getConfigElement();
  }

  // Trigger ha-card-conditions-editor via conditional card
  if (!customElements.get('ha-card-conditions-editor')) {
    (customElements.get('hui-conditional-card') as any)?.getConfigElement();
  }
};

/**
 * Check if HA form components are available
 */
export const areComponentsLoaded = (): boolean => {
  return !!customElements.get('ha-form');
};
