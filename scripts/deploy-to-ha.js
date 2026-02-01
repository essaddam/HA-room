#!/usr/bin/env node
/**
 * Script de déploiement automatique sur Home Assistant
 * Usage: node scripts/deploy-to-ha.js [file] [options]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG_FILE = path.join(process.cwd(), 'ha-config.json');
const DEFAULT_FILE = 'dist/ha-room-card.js';
const WWW_PATHS = [
  '/config/www',
  '/homeassistant/www',
  '/usr/share/hassio/homeassistant/www'
];

// Couleurs
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch (error) {
    console.error(`${RED}❌ Configuration non trouvée: ${CONFIG_FILE}${NC}`);
    console.log('Crée d\'abord la config avec: node test-ha-full.js');
    process.exit(1);
  }
}

function checkFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`${RED}❌ Fichier non trouvé: ${filePath}${NC}`);
    console.log('Lance d\'abord: npm run build');
    process.exit(1);
  }
  return fs.statSync(filePath);
}

async function deployViaSSH(config, localFile, sshUser = 'root') {
  const server = config.server.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  const fileName = path.basename(localFile);

  console.log(`${YELLOW}📤 Déploiement via SSH vers ${server}...${NC}`);

  // Tester la connexion SSH
  try {
    execSync(`ssh -o ConnectTimeout=5 ${sshUser}@${server} "echo 'OK'"`, { stdio: 'pipe' });
  } catch (error) {
    console.error(`${RED}❌ Connexion SSH échouée${NC}`);
    console.log('Vérifie que:');
    console.log('  - SSH est activé sur HA (Addon SSH & Web Terminal)');
    console.log('  - Ta clé SSH est configurée');
    console.log(`  - L'utilisateur ${sshUser} existe`);
    return false;
  }

  // Trouver le bon chemin distant
  let remotePath = null;
  for (const wwwPath of WWW_PATHS) {
    try {
      execSync(`ssh ${sshUser}@${server} "test -d ${wwwPath}"`, { stdio: 'pipe' });
      remotePath = `${wwwPath}/${fileName}`;
      break;
    } catch (error) {
      continue;
    }
  }

  if (!remotePath) {
    console.error(`${RED}❌ Dossier www non trouvé${NC}`);
    console.log('Chemins testés:', WWW_PATHS.join(', '));
    return false;
  }

  // Copier le fichier
  try {
    execSync(`scp "${localFile}" "${sshUser}@${server}:${remotePath}"`, { stdio: 'inherit' });
    console.log(`${GREEN}✅ Fichier déployé: ${remotePath}${NC}`);
    return true;
  } catch (error) {
    console.error(`${RED}❌ Échec du déploiement${NC}`);
    return false;
  }
}

async function deployViaSamba(config, localFile) {
  const server = config.server.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  const fileName = path.basename(localFile);

  console.log(`${YELLOW}📤 Déploiement via Samba...${NC}`);
  console.log('Monte d\'abord le partage Samba:');
  console.log(`  \\${server}\config`);
  console.log('');
  console.log('Puis copie manuellement:');
  console.log(`  ${localFile} -> config/www/${fileName}`);

  return false;
}

async function deployViaHACS(config, localFile) {
  console.log(`${YELLOW}📤 Déploiement via HACS...${NC}`);
  console.log('Pour HACS, utilise:');
  console.log('1. HACS > Menu (3 points) > Custom repositories');
  console.log('2. Ajoute: https://github.com/essaddam/HA-room');
  console.log('3. Catégorie: Dashboard');
  console.log('4. Installe et redémarre HA');
  return false;
}

async function verifyDeployment(config, fileName) {
  console.log(`${YELLOW}🔍 Vérification du déploiement...${NC}`);

  const token = config.token;
  const server = config.server;

  try {
    const response = await fetch(`${server}/local/${fileName}`, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const size = response.headers.get('content-length');
      console.log(`${GREEN}✅ Fichier accessible (${Math.round(size / 1024)} KB)${NC}`);
      return true;
    } else {
      console.log(`${RED}❌ Fichier non accessible (HTTP ${response.status})${NC}`);
      return false;
    }
  } catch (error) {
    console.log(`${RED}❌ Erreur: ${error.message}${NC}`);
    return false;
  }
}

async function reloadFrontend(config) {
  console.log(`${YELLOW}🔄 Rechargement du frontend...${NC}`);

  const token = config.token;
  const server = config.server;

  try {
    const response = await fetch(`${server}/api/services/frontend/reload_themes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log(`${GREEN}✅ Frontend rechargé${NC}`);
    }
  } catch (error) {
    console.log(`${YELLOW}⚠️  Impossible de recharger automatiquement${NC}`);
    console.log('   Redémarre manuellement ou fais Ctrl+Shift+R dans le navigateur');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fileToDeploy = args[0] || DEFAULT_FILE;
  const method = args.includes('--ssh') ? 'ssh' :
                 args.includes('--samba') ? 'samba' :
                 args.includes('--hacs') ? 'hacs' : 'auto';

  console.log(`${GREEN}🚀 Déploiement HA Room Card${NC}`);
  console.log('');

  // Charger config
  const config = loadConfig();
  console.log(`📍 Serveur: ${config.server}`);
  console.log(`📦 Fichier: ${fileToDeploy}`);
  console.log('');

  // Vérifier fichier
  const stats = checkFile(fileToDeploy);
  console.log(`${GREEN}✅ Fichier trouvé (${Math.round(stats.size / 1024)} KB)${NC}`);
  console.log('');

  // Déployer
  let deployed = false;

  if (method === 'auto' || method === 'ssh') {
    deployed = await deployViaSSH(config, fileToDeploy);
  }

  if (!deployed && (method === 'auto' || method === 'samba')) {
    deployed = await deployViaSamba(config, fileToDeploy);
  }

  if (!deployed && method === 'hacs') {
    await deployViaHACS(config, fileToDeploy);
  }

  if (!deployed) {
    console.log('');
    console.log(`${YELLOW}📋 Instructions manuelles:${NC}`);
    console.log('');
    console.log('1. Copie le fichier vers ton serveur HA:');
    console.log(`   ${fileToDeploy}`);
    console.log('   → /config/www/ha-room-card.js');
    console.log('');
    console.log('2. Redémarre Home Assistant ou recharge le frontend');
    console.log('   (Ctrl+Shift+R dans le navigateur)');
    console.log('');
    console.log('3. Ajoute la carte à ton dashboard:');
    console.log('   type: custom:ha-room-card');
    process.exit(1);
  }

  // Vérifier
  console.log('');
  await verifyDeployment(config, path.basename(fileToDeploy));

  // Recharger
  console.log('');
  await reloadFrontend(config);

  console.log('');
  console.log(`${GREEN}✅ Déploiement terminé!${NC}`);
}

main().catch(error => {
  console.error(`${RED}❌ Erreur: ${error.message}${NC}`);
  process.exit(1);
});
