#!/usr/bin/env node
/**
 * Vérification du déploiement HACS
 * Vérifie si la carte est accessible dans Home Assistant
 */

import fs from 'fs';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

async function main() {
  console.log(`${GREEN}🔍 Vérification HACS - HA Room Card${NC}\n`);

  // Charger la config
  let config;
  try {
    config = JSON.parse(fs.readFileSync('./ha-config.json', 'utf8'));
  } catch (error) {
    console.error(`${RED}❌ Fichier ha-config.json non trouvé${NC}`);
    console.log('Crée-le avec: node test-ha-full.js');
    process.exit(1);
  }

  console.log(`Serveur: ${config.server}`);
  console.log('');

  // Vérifier si le fichier est accessible
  console.log(`${YELLOW}📡 Vérification de l'accessibilité...${NC}`);

  try {
    const response = await fetch(`${config.server}/hacsfiles/ha-room-card/ha-room-card.js`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${config.token}`
      }
    });

    if (response.ok) {
      const size = response.headers.get('content-length');
      console.log(`${GREEN}✅ Carte installée via HACS (${Math.round(size / 1024)} KB)${NC}`);
    } else if (response.status === 404) {
      console.log(`${RED}❌ Carte non trouvée dans HACS${NC}`);
      console.log('');
      console.log('Vérifie dans Home Assistant:');
      console.log('1. HACS > Frontend');
      console.log('2. Cherche "HA Room Card"');
      console.log('3. Clique sur "Download" si pas encore installé');
    } else {
      console.log(`${RED}❌ Erreur HTTP ${response.status}${NC}`);
    }
  } catch (error) {
    console.log(`${RED}❌ Erreur de connexion: ${error.message}${NC}`);
    console.log('Vérifie que le serveur est accessible');
  }

  // Vérifier la version dans HACS
  console.log('\n' + `${YELLOW}📋 Informations:${NC}`);
  const hacsInfo = JSON.parse(fs.readFileSync('./hacs.json', 'utf8'));
  console.log(`  Version locale: ${hacsInfo.version}`);
  console.log(`  Type: ${hacsInfo.card_type}`);
  console.log(`  HA minimum: ${hacsInfo.homeassistant}`);

  console.log('\n' + `${GREEN}💡 Pour forcer la mise à jour dans HACS:${NC}`);
  console.log('  1. HACS > Frontend > HA Room Card');
  console.log('  2. Menu (3 points) > Update information');
  console.log('  3. Redémarre HA si une mise à jour est disponible');
}

main().catch(console.error);
