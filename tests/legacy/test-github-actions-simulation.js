#!/usr/bin/env node

/**
 * Test pour simuler exactement le comportement du workflow GitHub Actions
 */

import { execSync } from 'child_process';

console.log('🧪 Simulation du workflow GitHub Actions...\n');

try {
  // Simuler exactement le script du workflow
  const script = `
set +e  # Ne pas échouer sur les erreurs
OUTPUT=$(node scripts/auto-version-from-tags.js --tag 2>&1)
EXIT_CODE=$?
set -e  # Réactiver l'échec sur erreur

echo "$OUTPUT"

# Vérifier si le script a réussi malgré le code de sortie
if [[ $EXIT_CODE -eq 0 ]] || echo "$OUTPUT" | grep -q "📤 VERSION="; then
  # Extraire la version et le tag des sorties
  VERSION=$(echo "$OUTPUT" | grep "📤 VERSION=" | cut -d'=' -f2)
  TAG=$(echo "$OUTPUT" | grep "📤 TAG=" | cut -d'=' -f2)
  
  if [[ -n "$VERSION" && -n "$TAG" ]]; then
    echo "version=$VERSION" >> $GITHUB_OUTPUT
    echo "tag=$TAG" >> $GITHUB_OUTPUT
    echo "✅ Version calculée: $VERSION"
    echo "✅ Tag: $TAG"
  else
    echo "❌ Impossible d'extraire version/tag"
    exit 1
  fi
else
  echo "❌ Le script a échoué avec le code $EXIT_CODE"
  echo "$OUTPUT"
  exit $EXIT_CODE
fi
  `;

  // Créer un fichier temporaire pour GITHUB_OUTPUT
  process.env.GITHUB_OUTPUT = '/tmp/github_output';
  
  // Exécuter le script
  const output = execSync(script, { 
    encoding: 'utf8',
    shell: '/bin/bash',
    env: { ...process.env, GITHUB_OUTPUT: '/tmp/github_output' }
  });
  
  console.log(output);
  
  // Lire le fichier GITHUB_OUTPUT
  try {
    const fs = require('fs');
    if (fs.existsSync('/tmp/github_output')) {
      const githubOutput = fs.readFileSync('/tmp/github_output', 'utf8');
      console.log('📋 GITHUB_OUTPUT contents:');
      console.log(githubOutput);
      
      // Parser les outputs
      const lines = githubOutput.split('\n');
      const versionLine = lines.find(line => line.startsWith('version='));
      const tagLine = lines.find(line => line.startsWith('tag='));
      
      if (versionLine && tagLine) {
        console.log(`\n✅ Version extraite: ${versionLine.split('=')[1]}`);
        console.log(`✅ Tag extrait: ${tagLine.split('=')[1]}`);
        console.log('\n🎉 Simulation GitHub Actions réussie !');
      } else {
        console.log('\n❌ Outputs non trouvés dans GITHUB_OUTPUT');
      }
    }
  } catch (error) {
    console.log('\n⚠️  Impossible de lire GITHUB_OUTPUT:', error.message);
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la simulation:', error.message);
  process.exit(1);
}