#!/usr/bin/env node

/**
 * Script de création de release GitHub manuelle
 * Crée une release GitHub à partir du tag existant
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Lire la version actuelle
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

console.log(`🏷️ Création de la release GitHub v${version}...`);

try {
  // Récupérer les informations du tag
  const tag = `v${version}`;
  
  // Lire le changelog
  const changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  const changelogLines = changelog.split('\n');
  
  // Trouver la section pour la version actuelle
  const versionSection = changelogLines.findIndex(line => line.includes(`[${tag}]`));
  let releaseNotes = '';
  
  if (versionSection !== -1) {
    // Extraire les changements pour cette version
    let endIndex = changelogLines.findIndex((line, index) => 
      index > versionSection && line.startsWith('## [')
    );
    if (endIndex === -1) endIndex = changelogLines.length;
    
    releaseNotes = changelogLines.slice(versionSection, endIndex).join('\n');
  } else {
    releaseNotes = `## ${tag}\n\n### Bug Fixes\n- 🐛 Fixed schemaURL for Home Assistant editor\n- 🔧 Added debug logging for troubleshooting\n- 🚀 Improved build configuration`;
  }
  
  // Créer le contenu de la release
  const releaseContent = `# HA Room Card ${tag}

${releaseNotes}

## 📦 Installation

### HACS Installation
1. Go to HACS > Integrations
2. Click the 3 dots in the top right corner
3. Select "Custom repositories"
4. Add repository: \`essaddam/HA-room\`
5. Category: "Dashboard"
6. Click "Add"
7. Go to HACS > Integrations > "Dashboard" and click "Explore & Download Repositories"
8. Search for "HA Room Card" and install

### Manual Installation
1. Download the latest release from the [releases page](https://github.com/essaddam/HA-room/releases)
2. Copy the files to \`config/www/community/ha-room-card/\`
3. Add the resource to your \`configuration.yaml\`:
\`\`\`yaml
resources:
  - url: /local/community/ha-room-card/ha-room-card.js
    type: module
\`\`\`

## 🐛 Debug Information

This version includes enhanced logging for troubleshooting:
- Console logs for card registration
- Configuration validation logs
- Entity state update logs
- Editor form generation logs

Check your browser console for detailed information if you encounter issues.

---

🤖 Auto-generated release from commit: ${execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim()}`;

  // Écrire le contenu dans un fichier temporaire
  fs.writeFileSync('release-notes.md', releaseContent);
  
  console.log(`📝 Notes de release créées dans release-notes.md`);
  console.log(`🔗 Pour créer la release manuellement:`);
  console.log(`1. Allez sur: https://github.com/essaddam/HA-room/releases/new`);
  console.log(`2. Sélectionnez le tag: ${tag}`);
  console.log(`3. Copiez le contenu de release-notes.md`);
  console.log(`4. Publiez la release`);
  
  // Ouvrir la page de release dans le navigateur (si possible)
  console.log(`\n🌐 Ouverture de la page de release...`);
  
} catch (error) {
  console.error('❌ Erreur lors de la création de la release:', error.message);
  process.exit(1);
}