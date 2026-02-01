#!/usr/bin/env node

/**
 * Instructions pour déclencher manuellement la GitHub Action
 */

console.log('🚀 Instructions pour déclencher la release automatique:\n');

console.log('1. Allez sur la page des Actions GitHub:');
console.log('   https://github.com/essaddam/HA-room/actions\n');

console.log('2. Dans le menu de gauche, cliquez sur "🏷️ Auto Release"\n');

console.log('3. Cliquez sur le bouton "Run workflow" à droite\n');

console.log('4. Dans la fenêtre qui s\'ouvre:');
console.log('   - Version: laissez "1.46.1" (ou entrez la version souhaitée)');
console.log('   - Cliquez sur le bouton vert "Run workflow"\n');

console.log('5. Attendez que le workflow se termine...');
console.log('   - La release sera automatiquement créée');
console.log('   - Les fichiers seront attachés');
console.log('   - Le tag sera mis à jour\n');

console.log('🔗 Lien direct vers le workflow:');
console.log('   https://github.com/essaddam/HA-room/actions/workflows/auto-release.yml\n');

console.log('📋 Le workflow va:');
console.log('   ✅ Builder le projet');
console.log('   ✅ Générer un changelog automatique');
console.log('   ✅ Créer la release GitHub');
console.log('   ✅ Attacher les fichiers de build');
console.log('   ✅ Mettre à jour les infos HACS\n');

console.log('🎯 Une fois terminé, votre release sera disponible sur:');
console.log('   https://github.com/essaddam/HA-room/releases');