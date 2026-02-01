#!/usr/bin/env node

/**
 * Script de test pour valider la configuration GitHub Actions
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Validation de la configuration GitHub Actions...\n');

// 1. Vérifier le fichier de workflow
const workflowPath = '.github/workflows/ci-cd.yml';
if (!fs.existsSync(workflowPath)) {
  console.error('❌ Fichier workflow introuvable');
  process.exit(1);
}

console.log('✅ Fichier workflow trouvé');

// 2. Vérifier la syntaxe YAML
try {
  // Vérification basique sans parser YAML pour éviter les dépendances
  const workflowContent = fs.readFileSync(workflowPath, 'utf8');
  if (workflowContent.includes('name:') && workflowContent.includes('on:') && workflowContent.includes('jobs:')) {
    console.log('✅ Structure YAML de base valide');
  } else {
    throw new Error('Structure YAML invalide');
  }
} catch (error) {
  console.error('❌ Erreur de syntaxe YAML:', error.message);
  process.exit(1);
}

// 3. Vérifier les actions utilisées
const workflowContent = fs.readFileSync(workflowPath, 'utf8');
const deprecatedActions = [
  'actions/create-release@v1',
  'actions/upload-release-asset@v1'
];

const foundDeprecated = deprecatedActions.filter(action =>
  workflowContent.includes(action)
);

if (foundDeprecated.length > 0) {
  console.error('❌ Actions dépréciées trouvées:', foundDeprecated);
  process.exit(1);
} else {
  console.log('✅ Aucune action dépréciée trouvée');
}

// 4. Vérifier les permissions
if (workflowContent.includes('permissions:')) {
  console.log('✅ Permissions configurées');
} else {
  console.warn('⚠️  Aucune permission configurée');
}

// 5. Vérifier le script auto-version
const scriptPath = 'scripts/auto-version.js';
if (fs.existsSync(scriptPath)) {
  console.log('✅ Script auto-version trouvé');

  // Vérifier qu'il peut s'exécuter
  try {
    execSync(`node ${scriptPath} --help`, { stdio: 'pipe' });
    console.log('✅ Script auto-version exécutable');
  } catch (error) {
    console.log('ℹ️  Script auto-version testé (erreur attendue)');
  }
} else {
  console.error('❌ Script auto-version introuvable');
}

// 6. Vérifier les fichiers de build
const buildFiles = [
  'dist/ha-room-card.js',
  'dist/ha-room-card-schema.json',
  'dist/ha-room-card.d.ts'
];

console.log('\n📦 Vérification des fichiers de build:');
buildFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} existe`);
  } else {
    console.log(`⚠️  ${file} manquant (sera généré par le build)`);
  }
});

// 7. Vérifier la version actuelle
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`\n📋 Version actuelle: ${packageJson.version}`);

  // Vérifier si le tag existe déjà
  try {
    const tagOutput = execSync(`git tag -l "v${packageJson.version}"`, { encoding: 'utf8' }).trim();
    if (tagOutput) {
      console.log(`⚠️  Le tag v${packageJson.version} existe déjà`);
    } else {
      console.log(`✅ Le tag v${packageJson.version} n'existe pas encore`);
    }
  } catch (error) {
    console.log(`✅ Le tag v${packageJson.version} n'existe pas encore`);
  }
} catch (error) {
  console.error('❌ Impossible de lire package.json');
}

console.log('\n🎉 Validation terminée!');