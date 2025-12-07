#!/usr/bin/env node

/**
 * Script de création de release HACS
 * Crée un tag, pousse les changements et déclenche une release GitHub
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Lire la version actuelle
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

console.log(`🏷️ Création de la release v${version}...`);

try {
  // Vérifier si le tag existe déjà
  const existingTags = execSync('git tag --list', { encoding: 'utf8' }).trim().split('\n');
  const tag = `v${version}`;
  
  if (existingTags.includes(tag)) {
    console.log(`⚠️ Le tag ${tag} existe déjà, suppression...`);
    execSync(`git tag -d ${tag}`, { encoding: 'utf8' });
    try {
      execSync(`git push origin :refs/tags/${tag}`, { encoding: 'utf8' });
    } catch (e) {
      // Le tag n'existe peut-être pas sur le distant
    }
  }
  
  // Créer le tag annoté
  console.log(`📝 Création du tag ${tag}...`);
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const changelogLines = changelog.split('\n');
  const latestChanges = changelogLines.slice(0, 20).join('\n'); // Prendre les 20 premières lignes
  
  const message = `Release v${version}

${latestChanges}

---
🤖 Release automatique générée depuis le commit: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}`;
  
  execSync(`git tag -a ${tag} -m "${message.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
  
  // Pousser le tag
  console.log(`📤 Push du tag ${tag}...`);
  execSync(`git push origin ${tag}`, { encoding: 'utf8' });
  
  console.log(`✅ Release v${version} créée avec succès !`);
  console.log(`🔗 Lien de la release: https://github.com/essaddam/HA-room/releases/tag/${tag}`);
  
} catch (error) {
  console.error('❌ Erreur lors de la création de la release:', error.message);
  process.exit(1);
}