#!/usr/bin/env node

/**
 * Diagnostic script for HA Room Card integration
 * Run this script to check common issues with the custom card
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 HA Room Card Integration Diagnostic');
console.log('=====================================\n');

// Check if dist file exists
const distPath = path.join(__dirname, 'dist', 'ha-room-card.js');
if (fs.existsSync(distPath)) {
    const stats = fs.statSync(distPath);
    console.log('✅ dist/ha-room-card.js exists');
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Modified: ${stats.mtime}\n`);
} else {
    console.log('❌ dist/ha-room-card.js NOT found');
    console.log('   Run: npm run build\n');
}

// Check source file
const srcPath = path.join(__dirname, 'src', 'ha-room-card.ts');
if (fs.existsSync(srcPath)) {
    const source = fs.readFileSync(srcPath, 'utf8');
    
    // Check for custom element decorator
    if (source.includes('@customElement(\'ha-room-card\')')) {
        console.log('✅ @customElement decorator found in source');
    } else {
        console.log('❌ @customElement decorator NOT found');
    }
    
    // Check for class definition
    if (source.includes('class HaRoomCard')) {
        console.log('✅ HaRoomCard class found in source');
    } else {
        console.log('❌ HaRoomCard class NOT found');
    }
} else {
    console.log('❌ src/ha-room-card.ts NOT found');
}

// Check compiled file content
if (fs.existsSync(distPath)) {
    const compiled = fs.readFileSync(distPath, 'utf8');
    
    console.log('\n📦 Checking compiled file content:');
    
    // Check for export
    if (compiled.includes('export{') && compiled.includes('as HaRoomCard}')) {
        console.log('✅ HaRoomCard export found');
    } else {
        console.log('❌ HaRoomCard export NOT found');
    }
    
    // Check for customElements.define
    if (compiled.includes('customElements.define(')) {
        console.log('✅ customElements.define found');
    } else {
        console.log('❌ customElements.define NOT found');
    }
    
    // Check for 'ha-room-card' string
    if (compiled.includes('ha-room-card')) {
        console.log('✅ Element name "ha-room-card" found');
    } else {
        console.log('❌ Element name "ha-room-card" NOT found');
    }
}

// Check package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('\n📋 Package.json info:');
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Version: ${pkg.version}`);
    
    if (pkg.module) {
        console.log(`   Module: ${pkg.module}`);
    }
    
    if (pkg.main) {
        console.log(`   Main: ${pkg.main}`);
    }
}

console.log('\n🔧 Common fixes for "Custom element not found" error:');
console.log('1. Ensure dist/ha-room-card.js is loaded in Home Assistant');
console.log('2. Check browser console for JavaScript errors');
console.log('3. Verify the card is registered as "custom:ha-room-card"');
console.log('4. Try clearing browser cache and restarting Home Assistant');
console.log('5. Check if the file paths in configuration are correct');

console.log('\n📝 Test configuration:');
console.log('Add this to your Lovelace configuration:');
console.log(`
type: custom:ha-room-card
name: "Test Room"
`);

console.log('\n🌐 To test the custom element:');
console.log('Open test-custom-element.html in your browser');
console.log('Check the browser console for registration status');