#!/usr/bin/env node

/**
 * Instructions pour déclencher la release v1.46.5 avec le workflow corrigé
 */

console.log('🚀 Déclenchement de la release v1.46.5\n');

console.log('📋 État actuel:');
console.log('✅ Version 1.46.5 dans package.json');
console.log('✅ Build effectué');
console.log('✅ Workflow corrigé pour la génération du changelog');
console.log('✅ Commit poussé sur main');
console.log('✅ Tag v1.46.5 créé\n');

console.log('🔧 Problème identifié:');
console.log('• Le workflow auto-release ne se déclenche pas automatiquement sur les tags');
console.log('• La génération du changelog a été corrigée');
console.log('• Il faut utiliser workflow_dispatch pour déclencher manuellement\n');

console.log('🚀 Instructions pour créer la release v1.46.5:');
console.log('1. Allez sur: https://github.com/essaddam/HA-room/actions/workflows/auto-release.yml');
console.log('2. Cliquez sur "Run workflow" (bouton à droite)');
console.log('3. Dans le champ "Version", entrez: 1.46.5');
console.log('4. Cliquez sur le bouton vert "Run workflow"\n');

console.log('📝 Ce que le workflow va faire:');
console.log('✅ Générer un changelog amélioré');
console.log('✅ Créer la release GitHub v1.46.5');
console.log('✅ Attacher les fichiers de build');
console.log('✅ Mettre à jour les infos HACS\n');

console.log('🔗 Liens utiles:');
console.log('• Workflow: https://github.com/essaddam/HA-room/actions/workflows/auto-release.yml');
console.log('• Actions: https://github.com/essaddam/HA-room/actions');
console.log('• Releases: https://github.com/essaddam/HA-room/releases\n');

console.log('🎯 Une fois le workflow terminé, la release v1.46.5 sera disponible et deviendra "Latest"!');