#!/usr/bin/env node

/**
 * Script de création de release GitHub via API
 */

import { execSync } from 'child_process';
import fs from 'fs';
import https from 'https';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const tag = `v${version}`;

// Lire les notes de release
const releaseNotes = fs.readFileSync('release-notes.md', 'utf8');

console.log(`🚀 Création de la release GitHub ${tag} via API...`);

// Créer la release via l'API GitHub
const releaseData = {
  tag_name: tag,
  name: `HA Room Card ${tag}`,
  body: releaseNotes,
  draft: false,
  prerelease: false
};

const postData = JSON.stringify(releaseData);

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/repos/essaddam/HA-room/releases',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'User-Agent': 'HA-Room-Card-Release-Script'
  }
};

console.log('⚠️ Ce script nécessite un token GitHub personnel.');
console.log('📝 Pour créer la release manuellement:');
console.log(`1. Allez sur: https://github.com/essaddam/HA-room/releases/new`);
console.log(`2. Sélectionnez le tag: ${tag}`);
console.log(`3. Titre: HA Room Card ${tag}`);
console.log(`4. Copiez le contenu de release-notes.md`);
console.log(`5. Publiez la release`);

console.log('\n📋 Notes de release prêtes dans release-notes.md');
console.log('🔗 Lien direct: https://github.com/essaddam/HA-room/releases/new');