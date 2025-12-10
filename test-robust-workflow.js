#!/usr/bin/env node

/**
 * Test complet pour valider le workflow GitHub Actions robuste
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧪 Test complet du workflow GitHub Actions robuste...\n');

// Test 1: Configuration Git automatique
console.log('📋 Test 1: Configuration Git automatique');
try {
  // Simuler un environnement sans configuration Git
  execSync('git config --global --unset user.name', { stdio: 'pipe' });
  execSync('git config --global --unset user.email', { stdio: 'pipe' });
  
  const output = execSync('node scripts/auto-version-from-tags.js --tag', { encoding: 'utf8' });
  
  if (output.includes('🔧 Configuration Git: user.name et user.email')) {
    console.log('✅ Configuration Git automatique fonctionnelle');
  } else {
    console.log('ℹ️  Configuration Git déjà présente');
  }
  
  if (output.includes('📤 VERSION=') && output.includes('📤 TAG=')) {
    console.log('✅ Outputs générés correctement');
  } else {
    throw new Error('Outputs manquants');
  }
} catch (error) {
  console.error('❌ Test 1 échoué:', error.message);
  process.exit(1);
}

// Test 2: Mise à jour complète des fichiers
console.log('\n📋 Test 2: Mise à jour complète des fichiers');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const constContent = fs.readFileSync('src/const.ts', 'utf8');
  const hacsJson = JSON.parse(fs.readFileSync('hacs.json', 'utf8'));
  const changelogContent = fs.readFileSync('CHANGELOG.md', 'utf8');
  
  const version = packageJson.version;
  
  console.log(`✅ package.json: ${version}`);
  
  if (constContent.includes(`CARD_VERSION = '${version}'`)) {
    console.log('✅ src/const.ts: version synchronisée');
  } else {
    throw new Error('src/const.ts non synchronisé');
  }
  
  if (hacsJson.version === version) {
    console.log('✅ hacs.json: version synchronisée');
  } else {
    throw new Error('hacs.json non synchronisé');
  }
  
  if (changelogContent.includes(`## [v${version}]`)) {
    console.log('✅ CHANGELOG.md: version synchronisée');
  } else {
    throw new Error('CHANGELOG.md non synchronisé');
  }
  
  // Vérifier les fichiers dist
  if (fs.existsSync('dist/ha-room-card-schema.json')) {
    const distSchema = JSON.parse(fs.readFileSync('dist/ha-room-card-schema.json', 'utf8'));
    if (distSchema.version === version) {
      console.log('✅ dist/ha-room-card-schema.json: version synchronisée');
    } else {
      console.log('⚠️  dist/ha-room-card-schema.json: version non synchronisée');
    }
  }
  
} catch (error) {
  console.error('❌ Test 2 échoué:', error.message);
  process.exit(1);
}

// Test 3: Simulation workflow GitHub Actions
console.log('\n📋 Test 3: Simulation workflow GitHub Actions');
try {
  const script = `
git config --global user.name "GitHub Action"
git config --global user.email "action@github.com"

set +e
OUTPUT=$(node scripts/auto-version-from-tags.js --tag 2>&1)
EXIT_CODE=$?
set -e

echo "$OUTPUT"

if [[ $EXIT_CODE -eq 0 ]] || echo "$OUTPUT" | grep -q "📤 VERSION="; then
  VERSION=$(echo "$OUTPUT" | grep "📤 VERSION=" | cut -d'=' -f2 | tr -d ' ')
  TAG=$(echo "$OUTPUT" | grep "📤 TAG=" | cut -d'=' -f2 | tr -d ' ')
  
  if [[ -n "$VERSION" && -n "$TAG" ]]; then
    echo "version=$VERSION" >> /tmp/test_output
    echo "tag=$TAG" >> /tmp/test_output
    echo "✅ Simulation réussie"
  else
    echo "❌ Extraction échouée"
    exit 1
  fi
else
  echo "❌ Script échoué"
  exit 1
fi
  `;

  const output = execSync(script, { 
    encoding: 'utf8',
    shell: '/bin/bash'
  });
  
  console.log(output);
  
  if (fs.existsSync('/tmp/test_output')) {
    const testOutput = fs.readFileSync('/tmp/test_output', 'utf8');
    if (testOutput.includes('version=') && testOutput.includes('tag=')) {
      console.log('✅ Simulation GitHub Actions réussie');
    } else {
      throw new Error('Simulation échouée');
    }
    fs.unlinkSync('/tmp/test_output');
  }
  
} catch (error) {
  console.error('❌ Test 3 échoué:', error.message);
  process.exit(1);
}

// Test 4: Validation du workflow YAML
console.log('\n📋 Test 4: Validation workflow YAML');
try {
  const workflowContent = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
  
  const checks = [
    { name: 'Configuration Git explicite', pattern: /git config --global user.name/ },
    { name: 'Gestion erreurs robuste', pattern: /set \+e.*set -e/s },
    { name: 'Nettoyage outputs', pattern: /tr -d ' '/ },
    { name: 'Debug outputs', pattern: /echo "VERSION: '\$VERSION'"/ },
    { name: 'Push intelligent', pattern: /git status --porcelain/ },
    { name: 'Follow tags', pattern: /--follow-tags/ }
  ];
  
  checks.forEach(check => {
    if (workflowContent.match(check.pattern)) {
      console.log(`✅ ${check.name}`);
    } else {
      throw new Error(`${check.name} manquant`);
    }
  });
  
} catch (error) {
  console.error('❌ Test 4 échoué:', error.message);
  process.exit(1);
}

console.log('\n🎉 Tous les tests sont passés !');
console.log('\n📝 Améliorations apportées:');
console.log('✅ Configuration Git automatique pour les runners');
console.log('✅ Mise à jour complète de tous les fichiers');
console.log('✅ Gestion robuste des erreurs');
console.log('✅ Extraction des outputs fiable');
console.log('✅ Push intelligent avec suivi des tags');
console.log('✅ Debug amélioré pour le dépannage');
console.log('\n🚀 Le workflow GitHub Actions est maintenant robuste !');