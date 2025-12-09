/**
 * Test file to validate the HA Room Card Editor functionality
 * This file can be used in a browser console to test the editor
 */

import { HaRoomCardEditor } from './ha-room-card-editor.js';
import { HaRoomCardConfig } from './types.js';

// Extend Window interface for custom cards
declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
      documentationURL: string;
      schemaURL: string;
    }>;
    testHARoomCardEditor?: () => boolean;
    testHACSCompatibility?: () => boolean;
  }
}

// Test the editor configuration
function testEditorConfiguration(): boolean {
  console.log('🧪 Testing HA Room Card Editor Configuration...');

  // Test 1: Check if getConfigForm returns proper structure
  try {
    const configForm = HaRoomCardEditor.getConfigForm();

    if (!configForm.schema || !Array.isArray(configForm.schema)) {
      throw new Error('getConfigForm should return an object with a schema array');
    }

    if (typeof configForm.assertConfig !== 'function') {
      throw new Error('getConfigForm should return an assertConfig function');
    }

    if (typeof configForm.computeLabel !== 'function') {
      throw new Error('getConfigForm should return a computeLabel function');
    }

    console.log('✅ Test 1 Passed: getConfigForm structure is valid');

    // Test 2: Check schema structure
    const basicFields = ['name', 'icon', 'icon_color'];
    const hasBasicFields = basicFields.every(field =>
      configForm.schema.some(item => item.name === field)
    );

    if (!hasBasicFields) {
      throw new Error('Schema missing basic required fields');
    }

    console.log('✅ Test 2 Passed: Schema contains all basic fields');

    // Test 3: Check expandable sections
    const expandableSections = configForm.schema.filter(item => item.type === 'expandable');
    const expectedSections = ['Apparence', 'Capteurs', 'Listes d\'entités', 'Navigation', 'Média', 'Personnalisation', 'Actions'];

    if (expandableSections.length !== expectedSections.length) {
      throw new Error(`Expected ${expectedSections.length} expandable sections, got ${expandableSections.length}`);
    }

    console.log('✅ Test 3 Passed: All expandable sections are present');

    // Test 4: Test assertConfig function with proper typing
    try {
      const testConfig: Partial<HaRoomCardConfig> = {
        name: 'Test Room',
        icon: 'mdi:home',
        icon_color: '#ffffff'
      };
      configForm.assertConfig(testConfig as HaRoomCardConfig);
      console.log('✅ Test 4 Passed: assertConfig accepts valid configuration');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`assertConfig should accept valid config: ${errorMessage}`);
    }

    // Test 5: Test assertConfig with invalid config
    try {
      configForm.assertConfig({} as HaRoomCardConfig);
      throw new Error('assertConfig should reject empty configuration');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Le nom de la pièce est requis')) {
        console.log('✅ Test 5 Passed: assertConfig correctly rejects invalid configuration');
      } else {
        throw new Error(`assertConfig should reject empty config with specific message: ${errorMessage}`);
      }
    }

    // Test 6: Test computeLabel function
    const labelTest = configForm.computeLabel({ name: 'temp_entity' });
    if (labelTest !== 'Capteur de température') {
      throw new Error(`computeLabel should return 'Capteur de température' for temp_entity, got '${labelTest}'`);
    }

    console.log('✅ Test 6 Passed: computeLabel returns correct labels');

    // Test 7: Test getStubConfig
    const stubConfig = HaRoomCardEditor.getStubConfig();
    if (!stubConfig.name || !stubConfig.type || !stubConfig.icon) {
      throw new Error('getStubConfig should return a complete configuration object');
    }

    if (stubConfig.type !== 'ha-room-card') {
      throw new Error(`getStubConfig should return type 'ha-room-card', got '${stubConfig.type}'`);
    }

    console.log('✅ Test 7 Passed: getStubConfig returns valid stub configuration');

    console.log('🎉 All tests passed! The editor configuration is working correctly.');
    return true;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Test failed:', errorMessage);
    return false;
  }
}

// Test HACS compatibility
function testHACSCompatibility(): boolean {
  console.log('🧪 Testing HACS Compatibility...');

  // Check if the card is properly registered for HACS
  if (!window.customCards || !Array.isArray(window.customCards)) {
    console.error('❌ window.customCards is not properly initialized');
    return false;
  }

  const haRoomCard = window.customCards.find((card: any) => card.type === 'ha-room-card');
  if (!haRoomCard) {
    console.error('❌ HA Room Card is not registered in window.customCards');
    return false;
  }

  if (!haRoomCard.schemaURL || !haRoomCard.schemaURL.includes('/local/community/ha-room-card/')) {
    console.error('❌ schemaURL is not correctly configured for HACS');
    return false;
  }

  console.log('✅ HACS compatibility test passed');
  return true;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testHARoomCardEditor = testEditorConfiguration;
  window.testHACSCompatibility = testHACSCompatibility;
  console.log('🔧 HA Room Card Editor tests loaded. Use testHARoomCardEditor() and testHACSCompatibility() in console.');
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testEditorConfiguration,
    testHACSCompatibility
  };
}