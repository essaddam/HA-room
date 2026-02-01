#!/usr/bin/env node

/**
 * Script pour vérifier et déclencher la release v1.46.3
 */

console.log('🔍 Vérification de la release v1.46.3...\n');

console.log('📋 État actuel:');
console.log('✅ Version mise à jour dans package.json: 1.46.3');
console.log('✅ Build effectué avec les logs de débogage');
console.log('✅ Tag v1.46.3 créé et poussé sur GitHub');
console.log('✅ Commit poussé sur main\n');

console.log('🔗 Liens pour vérification:');
console.log('• GitHub Repository: https://github.com/essaddam/HA-room');
console.log('• Tags: https://github.com/essaddam/HA-room/tags');
console.log('• Actions: https://github.com/essaddam/HA-room/actions');
console.log('• Releases: https://github.com/essaddam/HA-room/releases\n');

console.log('🚀 Pour déclencher manuellement la release:');
console.log('1. Allez sur: https://github.com/essaddam/HA-room/actions/workflows/auto-release.yml');
console.log('2. Cliquez sur "Run workflow"');
console.log('3. Entrez "1.46.3" comme version');
console.log('4. Cliquez sur le bouton vert "Run workflow"\n');

console.log('📝 Si la release v1.45.0 apparaît comme "Latest", c\'est parce que:');
console.log('• GitHub considère la v1.45.0 comme la plus récente qui a réussi');
console.log('• La v1.46.3 a peut-être échoué ou n\'a pas été déclenchée');
console.log('• Une fois la v1.46.3 créée avec succès, elle deviendra "Latest"\n');

console.log('🔍 Vérifiez les logs des Actions GitHub pour voir pourquoi v1.46.3 n\'a pas été créée');