#!/usr/bin/env node

// Test script pour vérifier la configuration du schemaURL
console.log('🔍 Test de configuration du schemaURL...\n');

// Lecture du fichier source
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, 'src', 'ha-room-card.ts');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

console.log('📁 Vérification du fichier source:', sourceFile);

// Recherche de la configuration cardConfig
const cardConfigMatch = sourceContent.match(/const cardConfig = \{[\s\S]*?\};/);
if (cardConfigMatch) {
  console.log('✅ Configuration cardConfig trouvée:');
  console.log(cardConfigMatch[0]);

  // Vérification du schemaURL
  if (cardConfigMatch[0].includes('ha-room-card-schema.json')) {
    console.log('✅ schemaURL pointe correctement vers le fichier JSON');
  } else if (cardConfigMatch[0].includes('ha-room-card.js')) {
    console.log('❌ schemaURL pointe vers le fichier JS au lieu du JSON');
  } else {
    console.log('⚠️  schemaURL non trouvé ou format inattendu');
  }
} else {
  console.log('❌ Configuration cardConfig non trouvée');
}

// Vérification que le fichier schema existe
const schemaFile = path.join(__dirname, 'ha-room-card-schema.json');
if (fs.existsSync(schemaFile)) {
  console.log('✅ Fichier de schéma JSON trouvé:', schemaFile);
} else {
  console.log('❌ Fichier de schéma JSON non trouvé:', schemaFile);
}

// Vérification que le schema est copié dans dist
const distSchemaFile = path.join(__dirname, 'dist', 'ha-room-card-schema.json');
if (fs.existsSync(distSchemaFile)) {
  console.log('✅ Fichier de schéma JSON copié dans dist/');
} else {
  console.log('❌ Fichier de schéma JSON manquant dans dist/');
}

console.log('\n🎯 Test terminé!');