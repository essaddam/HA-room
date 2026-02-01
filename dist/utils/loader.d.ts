/**
 * Load Home Assistant components using multiple strategies
 */
export declare const loadHaComponents: () => Promise<boolean>;
/**
 * Check if HA components are available
 */
export declare const areComponentsLoaded: () => boolean;
/**
 * Force reload of components (for recovery)
 */
export declare const reloadComponents: () => Promise<boolean>;
//# sourceMappingURL=loader.d.ts.map