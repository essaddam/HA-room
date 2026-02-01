#!/usr/bin/env node

/**
 * Script de test pour valider le nouveau workflow de versionnement basé sur les tags
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Test du nouveau workflow de versionnement...\n');

// Test 1: Vérifier que le script peut extraire les versions
console.log('📋 Test 1: Extraction des versions des tags');
try {
  const output = execSync('node scripts/auto-version-from-tags.js', { encoding: 'utf8' });
  const lines = output.split('\n');
  
  const versionLine = lines.find(line => line.includes('📤 VERSION='));
  const tagLine = lines.find(line => line.includes('📤 TAG='));
  
  if (versionLine && tagLine) {
    const version = versionLine.split('=')[1];
    const tag = tagLine.split('=')[1];
    console.log(`✅ Version extraite: ${version}`);
    console.log(`✅ Tag extrait: ${tag}`);
  } else {
    throw new Error('Impossible d\'extraire version/tag');
  }
} catch (error) {
  console.error('❌ Test 1 échoué:', error.message);
  process.exit(1);
}

// Test 2: Vérifier la syntaxe du workflow
console.log('\n📋 Test 2: Validation du workflow GitHub Actions');
try {
  const workflowContent = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
  
  // Vérifier que le nouveau script est utilisé
  if (workflowContent.includes('auto-version-from-tags.js')) {
    console.log('✅ Nouveau script de versionnement référencé');
  } else {
    throw new Error('Le nouveau script n\'est pas référencé');
  }
  
  // Vérifier les outputs
  if (workflowContent.includes('outputs:') && workflowContent.includes('version:')) {
    console.log('✅ Outputs configurés correctement');
  } else {
    throw new Error('Outputs manquants');
  }
  
  // Vérifier la dépendance entre jobs
  if (workflowContent.includes('needs: [update-dist, version-bump]')) {
    console.log('✅ Dépendances entre jobs configurées');
  } else {
    throw new Error('Dépendances incorrectes');
  }
  
} catch (error) {
  console.error('❌ Test 2 échoué:', error.message);
  process.exit(1);
}

// Test 3: Simuler le comportement de GitHub Actions
console.log('\n📋 Test 3: Simulation GitHub Actions');
try {
  // Simuler la capture des outputs comme dans GitHub Actions
  const output = execSync('node scripts/auto-version-from-tags.js', { encoding: 'utf8' });
  const lines = output.split('\n');
  
  const versionLine = lines.find(line => line.includes('📤 VERSION='));
  const tagLine = lines.find(line => line.includes('📤 TAG='));
  
  if (versionLine && tagLine) {
    const version = versionLine.split('=')[1];
    const tag = tagLine.split('=')[1];
    
    // Simuler la syntaxe GitHub Actions
    console.log(`::set-output name=version::${version}`);
    console.log(`::set-output name=tag::${tag}`);
    console.log('✅ Simulation GitHub Actions réussie');
  }
} catch (error) {
  console.error('❌ Test 3 échoué:', error.message);
  process.exit(1);
}

// Test 4: Vérifier que les fichiers sont bien mis à jour
console.log('\n📋 Test 4: Vérification des fichiers mis à jour');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const constContent = fs.readFileSync('src/const.ts', 'utf8');
  
  console.log(`✅ package.json version: ${packageJson.version}`);
  
  if (constContent.includes(`CARD_VERSION = '${packageJson.version}'`)) {
    console.log('✅ src/const.ts version synchronisée');
  } else {
    throw new Error('Version non synchronisée dans src/const.ts');
  }
  
} catch (error) {
  console.error('❌ Test 4 échoué:', error.message);
  process.exit(1);
}

console.log('\n🎉 Tous les tests sont passés !');
console.log('\n📝 Résumé du nouveau workflow:');
console.log('1. Analyse des tags existants');
console.log('2. Détermination de la dernière version');
console.log('3. Incrémentation automatique (patch/minor/major)');
console.log('4. Mise à jour de tous les fichiers');
console.log('5. Création du tag Git');
console.log('6. Création de la release GitHub');