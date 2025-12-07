#!/usr/bin/env node

/**
 * Script de versionnement automatique pour HA Room Card
 * Analyse le message de commit et incrémente la version selon conventional commits
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Lire la version actuelle
const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
let currentVersion = packageJson.version;

console.log(`📦 Version actuelle : ${currentVersion}`);

// Récupérer le message de commit en cours (staged)
try {
  // Essayer de récupérer le message de commit en cours
  let commitMessage = '';
  try {
    commitMessage = execSync('git log -1 --pretty=%B --staged', { encoding: 'utf8' }).trim();
  } catch (e) {
    // Si pas de staged, essayer le dernier commit
    commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
  }
  
  console.log(`📝 Commit analysé : ${commitMessage.substring(0, 50)}...`);
  
  // Analyser le type de commit (conventional commits)
  let newVersion = currentVersion;
  let versionType = null;
  
  if (commitMessage.startsWith('feat:') || commitMessage.startsWith('feature:')) {
    versionType = 'minor';
    newVersion = incrementVersion(currentVersion, 'minor');
  } else if (commitMessage.startsWith('fix:') || commitMessage.startsWith('fix:')) {
    versionType = 'patch';
    newVersion = incrementVersion(currentVersion, 'patch');
  } else if (commitMessage.startsWith('BREAKING CHANGE:') || commitMessage.includes('!:')) {
    versionType = 'major';
    newVersion = incrementVersion(currentVersion, 'major');
  } else if (commitMessage.startsWith('chore:') || commitMessage.startsWith('docs:') || commitMessage.startsWith('style:')) {
    versionType = 'patch';
    newVersion = incrementVersion(currentVersion, 'patch');
  }
  
  // Vérifier si la version a changé
  if (newVersion !== currentVersion) {
    console.log(`🚀 Incrémentation de version : ${currentVersion} → ${newVersion} (${versionType})`);
    
    // Mettre à jour package.json
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    // Mettre à jour les autres fichiers si nécessaire
    updateVersionInFiles(newVersion);
    
    // Commiter les changements de version
    try {
      execSync(`git add package.json`, { stdio: 'inherit' });
      execSync(`git commit -m "🔖 Bump version to ${newVersion} [skip ci]"`, { stdio: 'inherit' });
      console.log(`✅ Version ${newVersion} commitée automatiquement`);
    } catch (error) {
      console.log('ℹ️  Pas de changements de version à commiter');
    }
    
    // Créer un tag si demandé
    if (process.argv.includes('--tag')) {
      try {
        execSync(`git tag -a v${newVersion} -m "Release version ${newVersion}"`, { stdio: 'inherit' });
        console.log(`🏷️  Tag v${newVersion} créé`);
      } catch (error) {
        console.log(`⚠️  Impossible de créer le tag : ${error.message}`);
      }
    }
    
  } else {
    console.log('✅ Aucune incrémentation de version nécessaire');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse du commit :', error.message);
  process.exit(1);
}

function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return version;
  }
}

function updateVersionInFiles(newVersion) {
  // Mettre à jour les fichiers qui contiennent la version
  const filesToUpdate = [
    'src/const.ts',
    'README.md',
    'CHANGELOG.md'
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