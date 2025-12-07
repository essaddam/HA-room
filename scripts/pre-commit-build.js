#!/usr/bin/env node

/**
 * Script de build avant commit pour HA Room Card
 * Ce script vérifie si le build est nécessaire et le fait si besoin
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Vérification des changements avant commit...\n');

// Vérifier si des fichiers source ont changé
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const sourceFilesChanged = gitStatus
    .split('\n')
    .filter(line => 
      line.includes('src/') || 
      line.includes('package.json') || 
      line.includes('rollup.config.js') || 
      line.includes('tsconfig.json') ||
      line.includes('ha-room-card-schema.json')
    );

  if (sourceFilesChanged.length === 0) {
    console.log('✅ Aucun changement dans les fichiers source, build non nécessaire.');
    process.exit(0);
  }

  console.log('📦 Fichiers source modifiés :');
  sourceFilesChanged.forEach(file => {
    const status = file.substring(0, 2);
    const filename = file.substring(3);
    const icon = status.includes('M') ? '📝' : status.includes('A') ? '➕' : status.includes('D') ? '🗑️' : '❓';
    console.log(`   ${icon} ${filename}`);
  });

  console.log('\n🚀 Lancement du build...');
  
  // Lancer le build
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('\n✅ Build terminé avec succès !');
  console.log('📋 Fichiers générés dans dist/ :');
  
  const distFiles = fs.readdirSync('dist/');
  distFiles.forEach(file => {
    const stats = fs.statSync(path.join('dist', file));
    const size = (stats.size / 1024).toFixed(2);
    console.log(`   📄 ${file} (${size} KB)`);
  });

  console.log('\n🎯 Prêt pour le commit !');
  
} catch (error) {
  console.error('❌ Erreur lors du build :', error.message);
  process.exit(1);
}