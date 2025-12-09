import { HomeAssistant } from 'custom-card-helpers';
import { EntityState, ThresholdEntry, OPERATORS } from './types';

export function computeEntityState(hass: HomeAssistant, entityId: string): EntityState | null {
  console.log('[Utils] Computing entity state for:', entityId);

  if (!hass) {
    console.error('[Utils] Home Assistant instance is null/undefined');
    return null;
  }

  if (!hass.states) {
    console.error('[Utils] Home Assistant states object is null/undefined');
    return null;
  }

  const stateObj = hass.states[entityId];
  if (!stateObj) {
    console.warn('[Utils] Entity not found in states:', entityId);
    console.log('[Utils] Available entities:', Object.keys(hass.states).slice(0, 10), '... (showing first 10)');
    return null;
  }

  const result = {
    entity_id: entityId,
    state: stateObj.state,
    attributes: stateObj.attributes || {},
    last_changed: stateObj.last_changed,
    last_updated: stateObj.last_updated,
  };

  console.log('[Utils] Entity state computed:', result);
  return result;
}

export function isEntityOn(hass: HomeAssistant, entityId: string): boolean {
  const state = computeEntityState(hass, entityId);
  if (!state) return false;

  return state.state === 'on' || state.state === 'true' || state.state === 'home';
}

export function getEntityAttributeValue(hass: HomeAssistant, entityId: string, attribute: string): any {
  const state = computeEntityState(hass, entityId);
  return state?.attributes[attribute];
}

export function getNumericState(hass: HomeAssistant, entityId: string): number {
  console.log('[Utils] Getting numeric state for entity:', entityId);

  const state = computeEntityState(hass, entityId);
  if (!state) {
    console.warn('[Utils] No state found for entity, returning 0:', entityId);
    return 0;
  }

  console.log('[Utils] Raw state value:', state.state);
  const num = parseFloat(state.state);

  if (isNaN(num)) {
    console.warn('[Utils] State value is not a number, returning 0:', { entityId, stateValue: state.state });
    return 0;
  }

  console.log('[Utils] Numeric state computed:', { entityId, numericValue: num });
  return num;
}

export function evaluateThreshold(
  hass: HomeAssistant,
  threshold: ThresholdEntry,
  sensorValue?: number
): boolean {
  let value: number;

  if (typeof threshold.value === 'string') {
    // Dynamic threshold from entity
    value = getNumericState(hass, threshold.value);
  } else {
    // Static threshold value
    value = threshold.value || 0;
  }

  const compareValue = sensorValue !== undefined ? sensorValue : value;
  const operator = threshold.operator || OPERATORS.GT;

  switch (operator) {
    case OPERATORS.GT:
      return compareValue > value;
    case OPERATORS.GTE:
      return compareValue >= value;
    case OPERATORS.LT:
      return compareValue < value;
    case OPERATORS.LTE:
      return compareValue <= value;
    case OPERATORS.EQ:
      return compareValue === value;
    default:
      return false;
  }
}

export function calculateEntityTotals(hass: HomeAssistant, entityIds: string[]): number {
  console.log('[Utils] Calculating totals for entities:', entityIds);

  if (!Array.isArray(entityIds)) {
    console.error('[Utils] entityIds is not an array:', entityIds);
    return 0;
  }

  const total = entityIds.reduce((runningTotal, entityId) => {
    console.log('[Utils] Processing entity for total:', entityId);
    const entityValue = getNumericState(hass, entityId);
    const newTotal = runningTotal + entityValue;
    console.log('[Utils] Entity contribution:', { entityId, value: entityValue, runningTotal, newTotal });
    return newTotal;
  }, 0);

  console.log('[Utils] Final calculated total:', { entityIds, total });
  return total;
}

export function countEntitiesWithState(
  hass: HomeAssistant,
  entityIds: string[],
  targetState: string = 'on'
): number {
  console.log('[Utils] Counting entities with state:', { entityIds, targetState });

  if (!Array.isArray(entityIds)) {
    console.error('[Utils] entityIds is not an array:', entityIds);
    return 0;
  }

  const matchingEntities = entityIds.filter(entityId => {
    console.log('[Utils] Checking entity state:', entityId);
    const state = computeEntityState(hass, entityId);
    const matches = state?.state === targetState;
    console.log('[Utils] Entity state check result:', { entityId, state: state?.state, targetState, matches });
    return matches;
  });

  const count = matchingEntities.length;
  console.log('[Utils] Final count result:', { entityIds, targetState, matchingEntities, count });
  return count;
}

export function getFriendlyName(hass: HomeAssistant, entityId: string): string {
  const state = computeEntityState(hass, entityId);
  return state?.attributes?.friendly_name || entityId.replace(/^[^.]+\./, '');
}

export function getUnitOfMeasurement(hass: HomeAssistant, entityId: string): string {
  const state = computeEntityState(hass, entityId);
  return state?.attributes?.unit_of_measurement || '';
}

export function getDeviceClass(hass: HomeAssistant, entityId: string): string {
  const state = computeEntityState(hass, entityId);
  return state?.attributes?.device_class || '';
}

export function getIcon(hass: HomeAssistant, entityId: string): string {
  const state = computeEntityState(hass, entityId);
  return state?.attributes?.icon || 'mdi:help-circle';
}

export function formatTemperature(value: number): string {
  return `${Math.round(value)}°C`;
}

export function formatHumidity(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatPower(value: number): string {
  return `${Math.round(value)} W`;
}

export function getDomain(entityId: string): string {
  return entityId.split('.')[0];
}

export function isValidEntityId(entityId: string): boolean {
  return /^[a-z0-9_]+\.[a-z0-9_]+$/.test(entityId);
}