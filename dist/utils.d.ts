import { HomeAssistant } from 'custom-card-helpers';
import { EntityState, ThresholdEntry } from './types';
export declare function computeEntityState(hass: HomeAssistant, entityId: string): EntityState | null;
export declare function isEntityOn(hass: HomeAssistant, entityId: string): boolean;
export declare function getEntityAttributeValue(hass: HomeAssistant, entityId: string, attribute: string): any;
export declare function getNumericState(hass: HomeAssistant, entityId: string): number;
export declare function evaluateThreshold(hass: HomeAssistant, threshold: ThresholdEntry, sensorValue?: number): boolean;
export declare function calculateEntityTotals(hass: HomeAssistant, entityIds: string[]): number;
export declare function countEntitiesWithState(hass: HomeAssistant, entityIds: string[], targetState?: string): number;
export declare function getFriendlyName(hass: HomeAssistant, entityId: string): string;
export declare function getUnitOfMeasurement(hass: HomeAssistant, entityId: string): string;
export declare function getDeviceClass(hass: HomeAssistant, entityId: string): string;
export declare function getIcon(hass: HomeAssistant, entityId: string): string;
export declare function formatTemperature(value: number): string;
export declare function formatHumidity(value: number): string;
export declare function formatPower(value: number): string;
export declare function getDomain(entityId: string): string;
export declare function isValidEntityId(entityId: string): boolean;
interface RegisterCardParams {
    type: string;
    name: string;
    description: string;
}
export declare function registerCustomCard(params: RegisterCardParams): void;
export {};
//# sourceMappingURL=utils.d.ts.map