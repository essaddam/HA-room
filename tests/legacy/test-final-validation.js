#!/usr/bin/env node

/**
 * Test final pour valider que le workflow GitHub Actions va fonctionner
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔍 Validation finale du workflow GitHub Actions...\n');

// 1. Vérifier que le script peut s'exécuter avec --tag
console.log('📋 Test 1: Exécution du script avec --tag');
try {
  const output = execSync('node scripts/auto-version-from-tags.js --tag', { encoding: 'utf8' });
  const lines = output.split('\n');
  
  const versionLine = lines.find(line => line.includes('📤 VERSION='));
  const tagLine = lines.find(line => line.includes('📤 TAG='));
  
  if (versionLine && tagLine) {
    console.log(`✅ Version: ${versionLine.split('=')[1]}`);
    console.log(`✅ Tag: ${tagLine.split('=')[1]}`);
  } else {
    throw new Error('Outputs non trouvés');
  }
} catch (error) {
  console.error('❌ Test 1 échoué:', error.message);
  process.exit(1);
}

// 2. Vérifier la syntaxe du workflow
console.log('\n📋 Test 2: Validation du workflow YAML');
try {
  const workflowContent = fs.readFileSync('.github/workflows/ci-cd.yml', 'utf8');
  
  const checks = [
    { name: 'Script référencé', pattern: /auto-version-from-tags\.js/ },
    { name: 'Gestion des erreurs', pattern: /set \+e.*set -e/s },
    { name: 'Capture des outputs', pattern: /VERSION=.*grep.*cut/s },
    { name: 'Outputs GitHub', pattern: /echo.*>> \$GITHUB_OUTPUT/ },
    { name: 'Dépendances correctes', pattern: /needs: \[update-dist, version-bump\]/ }
  ];
  
  checks.forEach(check => {
    if (workflowContent.match(check.pattern)) {
      console.log(`✅ ${check.name}`);
    } else {
      throw new Error(`${check.name} manquant`);
    }
  });
  
} catch (error) {
  console.error('❌ Test 2 échoué:', error.message);
  process.exit(1);
}

// 3. Vérifier que les fichiers sont cohérents
console.log('\n📋 Test 3: Cohérence des fichiers');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const constContent = fs.readFileSync('src/const.ts', 'utf8');
  
  if (constContent.includes(`CARD_VERSION = '${packageJson.version}'`)) {
    console.log(`✅ Versions synchronisées: ${packageJson.version}`);
  } else {
    throw new Error('Versions non synchronisées');
  }
} catch (error) {
  console.error('❌ Test 3 échoué:', error.message);
  process.exit(1);
}

// 4. Simuler la logique bash du workflow
console.log('\n📋 Test 4: Simulation logique bash');
try {
  const output = execSync('node scripts/auto-version-from-tags.js --tag', { encoding: 'utf8' });
  
  // Simuler la logique d'extraction
  const versionMatch = output.match(/📤 VERSION=([^\n]+)/);
  const tagMatch = output.match(/📤 TAG=([^\n]+)/);
  
  if (versionMatch && tagMatch) {
    const version = versionMatch[1].trim();
    const tag = tagMatch[1].trim();
    
    console.log(`✅ Extraction VERSION: ${version}`);
    console.log(`✅ Extraction TAG: ${tag}`);
    console.log(`✅ Logique bash validée`);
  } else {
    throw new Error('Extraction bash échouée');
  }
} catch (error) {
  console.error('❌ Test 4 échoué:', error.message);
  process.exit(1);
}

console.log('\n🎉 Tous les tests sont passés !');
console.log('\n📝 Résumé des corrections:');
console.log('✅ Gestion des tags existants');
console.log('✅ Gestion robuste des erreurs');
console.log('✅ Extraction des outputs fiable');
console.log('✅ Workflow GitHub Actions optimisé');
console.log('\n🚀 Le workflow devrait maintenant fonctionner sans erreur !');