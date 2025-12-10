#!/usr/bin/env node

/**
 * Script de versionnement automatique basé sur les tags Git
 * Analyse les tags existants, trouve la dernière version et l'incrémente
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🏷️  Analyse des tags pour versionnement automatique...\n');

// Fonction pour extraire le numéro de version d'un tag
function extractVersionFromTag(tag) {
  const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  if (match) {
    return {
      major: parseInt(match[1]),
      minor: parseInt(match[2]),
      patch: parseInt(match[3]),
      string: `${match[1]}.${match[2]}.${match[3]}`
    };
  }
  return null;
}

// Fonction pour comparer deux versions
function compareVersions(v1, v2) {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  return v1.patch - v2.patch;
}

// Fonction pour incrémenter une version
function incrementVersion(version, type = 'patch') {
  switch (type) {
    case 'major':
      return `${version.major + 1}.0.0`;
    case 'minor':
      return `${version.major}.${version.minor + 1}.0`;
    case 'patch':
    default:
      return `${version.major}.${version.minor}.${version.patch + 1}`;
  }
}

try {
  // Récupérer tous les tags triés par version (du plus récent au plus ancien)
  const tagsOutput = execSync('git tag --sort=-version:refname', { encoding: 'utf8' }).trim();
  const tags = tagsOutput.split('\n').filter(tag => tag.trim());
  
  console.log(`📋 ${tags.length} tags trouvés`);

  // Trouver la dernière version valide
  let latestVersion = null;
  let latestTag = null;

  for (const tag of tags) {
    const version = extractVersionFromTag(tag);
    if (version) {
      latestVersion = version;
      latestTag = tag;
      break;
    }
  }

  if (!latestVersion) {
    console.log('⚠️  Aucun tag de version trouvé, utilisation de la version par défaut');
    latestVersion = { major: 1, minor: 0, patch: 0, string: '1.0.0' };
  } else {
    console.log(`🎯 Dernière version trouvée: ${latestVersion.string} (tag: ${latestTag})`);
  }

  // Lire la version actuelle dans package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  
  console.log(`📦 Version actuelle dans package.json: ${currentVersion}`);

  // Comparer les versions
  const currentParsed = extractVersionFromTag(`v${currentVersion}`);
  
  let newVersion;
  let versionType = 'patch'; // par défaut

  // Déterminer le type d'incrémentation basé sur le message de commit
  let commitMessage = '';
  try {
    commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    console.log(`📝 Dernier commit: ${commitMessage.substring(0, 50)}...`);
    
    if (commitMessage.startsWith('feat:') || commitMessage.startsWith('feature:')) {
      versionType = 'minor';
    } else if (commitMessage.startsWith('BREAKING CHANGE:') || commitMessage.includes('!:')) {
      versionType = 'major';
    }
  } catch (e) {
    console.log('ℹ️  Impossible de lire le message de commit');
  }

  // Calculer la nouvelle version
  if (currentParsed && compareVersions(currentParsed, latestVersion) > 0) {
    // La version dans package.json est plus récente que le dernier tag
    console.log('📈 La version dans package.json est plus récente que les tags');
    newVersion = incrementVersion(currentParsed, versionType);
  } else {
    // Utiliser la dernière version des tags et l'incrémenter
    console.log('📈 Utilisation de la dernière version des tags');
    newVersion = incrementVersion(latestVersion, versionType);
  }

  console.log(`🚀 Nouvelle version: ${newVersion} (${versionType})`);

  // Mettre à jour package.json
  packageJson.version = newVersion;
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json mis à jour');

  // Mettre à jour les autres fichiers
  updateVersionInFiles(newVersion);

  // Créer le tag si demandé
  if (process.argv.includes('--tag')) {
    const tag = `v${newVersion}`;
    execSync(`git tag -a ${tag} -m "Release version ${tag}"`, { stdio: 'inherit' });
    console.log(`🏷️  Tag ${tag} créé`);
  }

  // Afficher la nouvelle version pour GitHub Actions
  console.log(`\n📤 VERSION=${newVersion}`);
  console.log(`📤 TAG=v${newVersion}`);

} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}

function updateVersionInFiles(newVersion) {
  const filesToUpdate = [
    'src/const.ts',
    'README.md',
    'CHANGELOG.md',
    'hacs.json',
    'hacs-repository-info.json'
  ];

  filesToUpdate.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');

        // Remplacer les versions dans différents formats
        content = content.replace(
          /CARD_VERSION = ['"`]([^'"`]+)['"`]/g,
          `CARD_VERSION = '${newVersion}'`
        );

        content = content.replace(
          /version: ['"`]([^'"`]+)['"`]/g,
          `version: "${newVersion}"`
        );

        // Pour les fichiers JSON
        if (file.endsWith('.json')) {
          try {
            const jsonData = JSON.parse(content);
            if (jsonData.version !== undefined) {
              jsonData.version = newVersion;
              content = JSON.stringify(jsonData, null, 2);
            }
          } catch (e) {
            // Ignorer les erreurs de parsing JSON
          }
        }

        content = content.replace(
          /## \[v?(\d+\.\d+\.\d+)\]/g,
          `## [v${newVersion}]`
        );

        fs.writeFileSync(file, content);
        console.log(`📄 ${file} mis à jour`);
      }
    } catch (error) {
      console.log(`⚠️  Impossible de mettre à jour ${file} : ${error.message}`);
    }
  });
}