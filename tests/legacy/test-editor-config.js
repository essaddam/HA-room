#!/usr/bin/env node

// Test complet pour valider la configuration de l'éditeur HA Room Card
console.log('🧪 Test complet de l\'éditeur HA Room Card...\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test 1: Vérification du schemaURL
console.log('📋 Test 1: Configuration du schemaURL');
const sourceFile = path.join(__dirname, 'src', 'ha-room-card.ts');
const sourceContent = fs.readFileSync(sourceFile, 'utf8');

const schemaURLMatch = sourceContent.match(/schemaURL:\s*['"`]([^'"`]+)['"`]/);
if (schemaURLMatch) {
  const schemaURL = schemaURLMatch[1];
  console.log(`✅ schemaURL trouvé: ${schemaURL}`);
  
  if (schemaURL.endsWith('.json')) {
    console.log('✅ schemaURL pointe vers un fichier JSON');
  } else {
    console.log('❌ schemaURL devrait pointer vers un fichier JSON');
  }
} else {
  console.log('❌ schemaURL non trouvé');
}

// Test 2: Vérification du fichier de schéma
console.log('\n📋 Test 2: Fichier de schéma JSON');
const schemaFile = path.join(__dirname, 'ha-room-card-schema.json');
if (fs.existsSync(schemaFile)) {
  console.log('✅ Fichier de schéma existe');
  
  try {
    const schemaContent = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
    console.log('✅ Schéma JSON valide');
    
    // Vérification des propriétés requises
    if (schemaContent.properties && schemaContent.properties.name) {
      console.log('✅ Propriété "name" présente dans le schéma');
    } else {
      console.log('❌ Propriété "name" manquante');
    }
    
    if (schemaContent.properties && schemaContent.properties.type) {
      console.log('✅ Propriété "type" présente dans le schéma');
    } else {
      console.log('❌ Propriété "type" manquante');
    }
  } catch (error) {
    console.log('❌ Schéma JSON invalide:', error.message);
  }
} else {
  console.log('❌ Fichier de schéma non trouvé');
}

// Test 3: Vérification de l'éditeur
console.log('\n📋 Test 3: Configuration de l\'éditeur');
const editorFile = path.join(__dirname, 'src', 'ha-room-card-editor.ts');
if (fs.existsSync(editorFile)) {
  console.log('✅ Fichier éditeur trouvé');
  
  const editorContent = fs.readFileSync(editorFile, 'utf8');
  
  if (editorContent.includes('getConfigForm()')) {
    console.log('✅ Méthode getConfigForm() présente');
  } else {
    console.log('❌ Méthode getConfigForm() manquante');
  }
  
  if (editorContent.includes('getStubConfig()')) {
    console.log('✅ Méthode getStubConfig() présente');
  } else {
    console.log('❌ Méthode getStubConfig() manquante');
  }
  
  if (editorContent.includes('assertConfig')) {
    console.log('✅ Fonction assertConfig présente');
  } else {
    console.log('❌ Fonction assertConfig manquante');
  }
} else {
  console.log('❌ Fichier éditeur non trouvé');
}

// Test 4: Vérification de la distribution
console.log('\n📋 Test 4: Fichiers de distribution');
const distDir = path.join(__dirname, 'dist');
const distFiles = [
  'ha-room-card.js',
  'ha-room-card-schema.json',
  'ha-room-card.d.ts'
];

distFiles.forEach(file => {
  const filePath = path.join(distDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} présent dans dist/`);
  } else {
    console.log(`❌ ${file} manquant dans dist/`);
  }
});

console.log('\n🎯 Tests terminés!');

// Résumé
console.log('\n📝 Résumé:');
console.log('Le problème de loading dans la fenêtre d\'ajout était causé par un schemaURL incorrect.');
console.log('Le schemaURL pointait vers le fichier JS au lieu du fichier JSON du schéma.');
console.log('Cette correction devrait résoudre le problème de loading dans l\'éditeur Home Assistant.');