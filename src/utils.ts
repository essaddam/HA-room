import { HomeAssistant } from 'custom-card-helpers';
import { EntityState, ThresholdEntry, OPERATORS } from './types';

export function computeEntityState(hass: HomeAssistant, entityId: string): EntityState | null {
  const stateObj = hass.states[entityId];
  if (!stateObj) return null;

  return {
    entity_id: entityId,
    state: stateObj.state,
    attributes: stateObj.attributes || {},
    last_changed: stateObj.last_changed,
    last_updated: stateObj.last_updated,
  };
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
  const state = computeEntityState(hass, entityId);
  if (!state) return 0;
  
  const num = parseFloat(state.state);
  return isNaN(num) ? 0 : num;
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
  return entityIds.reduce((total, entityId) => {
    return total + getNumericState(hass, entityId);
  }, 0);
}

export function countEntitiesWithState(
  hass: HomeAssistant,
  entityIds: string[],
  targetState: string = 'on'
): number {
  return entityIds.filter(entityId => {
    const state = computeEntityState(hass, entityId);
    return state?.state === targetState;
  }).length;
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