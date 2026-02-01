#!/usr/bin/env node
/**
 * Déploiement via API Home Assistant (Supervisor ou File Upload)
 */

import fs from 'fs';
import path from 'path';

const CONFIG = JSON.parse(fs.readFileSync('./ha-config.json', 'utf8'));
const FILE_TO_DEPLOY = process.argv[2] || 'dist/ha-room-card.js';

async function uploadViaSupervisor() {
  console.log('🚀 Tentative de déploiement via Supervisor API...\n');

  const fileContent = fs.readFileSync(FILE_TO_DEPLOY, 'utf8');
  const fileName = path.basename(FILE_TO_DEPLOY);

  // Essayer l'API Supervisor (pour HA OS/Supervised)
  try {
    const response = await fetch('http://supervisor/core/api/ingress', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CONFIG.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        path: `/config/www/${fileName}`,
        content: fileContent
      })
    });

    if (response.ok) {
      console.log('✅ Fichier déployé avec succès!');
      return true;
    }
  } catch (error) {
    console.log('⚠️  Supervisor API non disponible');
  }

  return false;
}

async function createDeployScript() {
  console.log('📋 Création d\'un script de déploiement...\n');

  const script = `#!/bin/bash
# Script de déploiement pour Home Assistant
# À exécuter sur le serveur HA

SOURCE_URL="${CONFIG.server}/local/ha-room-card.js"
DEST_PATH="/config/www/ha-room-card.js"

echo "Téléchargement de la carte..."
curl -s -H "Authorization: Bearer ${CONFIG.token}" \\
  "${CONFIG.server}/api/" > /dev/null

echo "Copie du fichier..."
cp "${FILE_TO_DEPLOY}" "$DEST_PATH"

echo "Redémarrage du frontend..."
# Recharger via API
`;

  fs.writeFileSync('deploy-on-ha.sh', script);
  console.log('✅ Script créé: deploy-on-ha.sh');
  console.log('Copie ce fichier sur ton serveur HA et exécute-le.');
}

async function main() {
  console.log('🚀 Déploiement HA Room Card\n');
  console.log(`Serveur: ${CONFIG.server}`);
  console.log(`Fichier: ${FILE_TO_DEPLOY}\n`);

  // Vérifier le fichier
  if (!fs.existsSync(FILE_TO_DEPLOY)) {
    console.error('❌ Fichier non trouvé. Lance d\'abord: npm run build');
    process.exit(1);
  }

  // Essayer Supervisor
  const deployed = await uploadViaSupervisor();

  if (!deployed) {
    console.log('\n📋 Instructions manuelles:');
    console.log('');
    console.log('1. Ouvre Studio Code Server dans HA');
    console.log('2. Upload ce fichier:');
    console.log(`   ${path.resolve(FILE_TO_DEPLOY)}`);
    console.log('3. Vers: /config/www/ha-room-card.js');
    console.log('');
    console.log('Ou utilise Samba/SSH:');
    console.log(`   scp ${FILE_TO_DEPLOY} root@192.168.177.19:/config/www/`);
  }
}

main().catch(console.error);
