#!/usr/bin/env node
/**
 * Script de release HACS
 * Build + version bump + commit + tag + push
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const NC = '\x1b[0m';

const FILES_TO_UPDATE = [
  'src/const.ts',
  'hacs.json',
  'package.json'
];

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return pkg.version;
}

function bumpVersion(currentVersion, type = 'patch') {
  const parts = currentVersion.split('.').map(Number);

  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
  }

  return parts.join('.');
}

function updateVersionInFiles(newVersion) {
  console.log(`${YELLOW}📝 Mise à jour des fichiers...${NC}`);

  // package.json
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  pkg.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

  // hacs.json
  const hacs = JSON.parse(fs.readFileSync('hacs.json', 'utf8'));
  hacs.version = newVersion;
  fs.writeFileSync('hacs.json', JSON.stringify(hacs, null, 2) + '\n');

  // src/const.ts
  let constTs = fs.readFileSync('src/const.ts', 'utf8');
  constTs = constTs.replace(/CARD_VERSION = ['"][\d.]+['"]/, `CARD_VERSION = '${newVersion}'`);
  fs.writeFileSync('src/const.ts', constTs);

  console.log(`${GREEN}✅ Version mise à jour: ${newVersion}${NC}`);
}

function runBuild() {
  console.log(`${YELLOW}🔨 Build...${NC}`);
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(`${GREEN}✅ Build réussi${NC}`);
    return true;
  } catch (error) {
    console.error(`${RED}❌ Build échoué${NC}`);
    return false;
  }
}

function commitAndTag(version) {
  console.log(`${YELLOW}📦 Commit et tag...${NC}`);

  try {
    // Stage files
    execSync('git add package.json hacs.json src/const.ts dist/', { stdio: 'pipe' });

    // Commit
    execSync(`git commit -m "🔖 Release v${version}"`, { stdio: 'pipe' });

    // Tag
    execSync(`git tag -a "v${version}" -m "Release v${version}"`, { stdio: 'pipe' });

    console.log(`${GREEN}✅ Commit et tag créés${NC}`);
    return true;
  } catch (error) {
    console.error(`${RED}❌ Erreur git: ${error.message}${NC}`);
    return false;
  }
}

function pushToGitHub() {
  console.log(`${YELLOW}📤 Push vers GitHub...${NC}`);

  try {
    execSync('git push origin main --follow-tags', { stdio: 'inherit' });
    console.log(`${GREEN}✅ Push réussi${NC}`);
    return true;
  } catch (error) {
    console.error(`${RED}❌ Push échoué${NC}`);
    return false;
  }
}

async function createGitHubRelease(version) {
  console.log(`${YELLOW}🚀 Création de la release GitHub...${NC}`);

  try {
    // Vérifier si gh CLI est disponible
    execSync('which gh', { stdio: 'pipe' });

    // Créer la release
    execSync(
      `gh release create "v${version}" dist/ha-room-card.js hacs.json --title "v${version}" --notes "Release v${version}"`,
      { stdio: 'inherit' }
    );

    console.log(`${GREEN}✅ Release GitHub créée${NC}`);
    return true;
  } catch (error) {
    console.log(`${YELLOW}⚠️  Release GitHub manuelle requise${NC}`);
    console.log(`   Va sur: https://github.com/essaddam/HA-room/releases/new`);
    console.log(`   Tag: v${version}`);
    console.log(`   Titre: v${version}`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const bumpType = args[0] || 'patch';
  const skipBuild = args.includes('--no-build');
  const skipPush = args.includes('--no-push');

  console.log(`${GREEN}🚀 Release HACS - HA Room Card${NC}\n`);

  // Vérifier branche
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  if (branch !== 'main' && branch !== 'master') {
    console.error(`${RED}❌ Tu dois être sur la branche main ou master (actuel: ${branch})${NC}`);
    process.exit(1);
  }

  // Vérifier modifications non commitées
  try {
    execSync('git diff-index --quiet HEAD --');
  } catch (error) {
    console.error(`${RED}❌ Des modifications non commitées existent${NC}`);
    console.log('Commit ou stash d\'abord tes changements.');
    process.exit(1);
  }

  // Version actuelle et nouvelle
  const currentVersion = getCurrentVersion();
  const newVersion = bumpVersion(currentVersion, bumpType);

  console.log(`Version actuelle: ${currentVersion}`);
  console.log(`Nouvelle version: ${newVersion}\n`);

  // Build
  if (!skipBuild) {
    if (!runBuild()) process.exit(1);
  }

  // Mettre à jour les fichiers
  updateVersionInFiles(newVersion);

  // Rebuild avec nouvelle version
  if (!skipBuild) {
    if (!runBuild()) process.exit(1);
  }

  // Commit et tag
  if (!commitAndTag(newVersion)) process.exit(1);

  // Push
  if (!skipPush) {
    if (!pushToGitHub()) process.exit(1);

    // Créer release GitHub
    await createGitHubRelease(newVersion);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`${GREEN}✅ Release v${newVersion} terminée!${NC}`);
  console.log('='.repeat(50));
  console.log('\nProchaines étapes dans HACS:');
  console.log('1. Attends que HACS détecte la mise à jour (~1 heure)');
  console.log('2. Ou clique sur "Update information" dans HACS > HA Room Card');
  console.log('3. Clique sur "Update" pour installer la nouvelle version');
  console.log('4. Redémarre Home Assistant');
}

main().catch(error => {
  console.error(`${RED}❌ Erreur: ${error.message}${NC}`);
  process.exit(1);
});
