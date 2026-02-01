#!/usr/bin/env node
/**
 * Test de la carte HA Room Card via API
 * Vérifie que la carte est accessible et fonctionne
 */

const HA_URL = 'http://192.168.177.19:8123';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJiZWEyYzc5NDg5YjI0NjJmYTA3NzFmN2Q4MjdlOWU0ZiIsImlhdCI6MTc2OTkzOTY4NCwiZXhwIjoyMDg1Mjk5Njg0fQ.jT8MpzlMvpYRcagGphcwlwXlIlpBSbuHLWYhv4lmrFc';

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function testCard() {
  console.log('🧪 Test de HA Room Card\n');

  // 1. Vérifier que le fichier est accessible
  console.log('1️⃣  Vérification du fichier...');
  try {
    const response = await fetch(`${HA_URL}/local/ha-room-card.js`, { method: 'HEAD' });
    if (response.ok) {
      const size = response.headers.get('content-length');
      console.log(`   ✅ Fichier accessible (${Math.round(size/1024)} KB)`);
    } else {
      console.log('   ❌ Fichier non accessible');
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // 2. Vérifier les entités disponibles pour une carte de test
  console.log('\n2️⃣  Entités disponibles pour la carte...');
  try {
    const response = await fetch(`${HA_URL}/api/states`, { headers });
    const states = await response.json();

    // Chercher des entités appropriées
    const tempSensor = states.find(e =>
      e.entity_id.includes('temp') &&
      !e.entity_id.includes('low') &&
      !e.entity_id.includes('high') &&
      e.state !== 'unavailable' &&
      !isNaN(parseFloat(e.state))
    );

    const humiditySensor = states.find(e =>
      e.entity_id.includes('humidity') &&
      e.state !== 'unavailable' &&
      !isNaN(parseFloat(e.state))
    );

    const lights = states.filter(e =>
      e.entity_id.startsWith('light.') &&
      e.state !== 'unavailable'
    );

    console.log('   📡 Capteurs trouvés:');
    if (tempSensor) {
      console.log(`      🌡️  Température: ${tempSensor.entity_id} = ${tempSensor.state}${tempSensor.attributes.unit_of_measurement || '°C'}`);
    }
    if (humiditySensor) {
      console.log(`      💧 Humidité: ${humiditySensor.entity_id} = ${humiditySensor.state}${humiditySensor.attributes.unit_of_measurement || '%'}`);
    }
    console.log(`      💡 Lumières: ${lights.length} disponibles`);

    // 3. Créer une configuration exemple
    console.log('\n3️⃣  Configuration exemple pour Lovelace:\n');
    const config = {
      type: 'custom:ha-room-card',
      name: 'Salon Test',
      icon: 'mdi:home',
      bg_start: '#667eea',
      bg_end: '#764ba2',
      temp_entity: tempSensor?.entity_id || '',
      hum_entity: humiditySensor?.entity_id || '',
      light_list: lights.slice(0, 3).map(l => l.entity_id),
      lights_hash: '#lights-salon',
      plugs_hash: '#plugs-salon',
      covers_hash: '#covers-salon'
    };

    console.log('```yaml');
    console.log('# Ajoute ceci à ton dashboard Lovelace');
    console.log('type: custom:ha-room-card');
    console.log(`name: ${config.name}`);
    console.log(`icon: ${config.icon}`);
    console.log(`bg_start: "${config.bg_start}"`);
    console.log(`bg_end: "${config.bg_end}"`);
    if (config.temp_entity) {
      console.log(`temp_entity: ${config.temp_entity}`);
    }
    if (config.hum_entity) {
      console.log(`hum_entity: ${config.hum_entity}`);
    }
    if (config.light_list.length > 0) {
      console.log('light_list:');
      config.light_list.forEach(l => console.log(`  - ${l}`));
    }
    console.log('```');

  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  // 4. Tester les services
  console.log('\n4️⃣  Test des services...');
  try {
    const response = await fetch(`${HA_URL}/api/services/light`, { headers });
    const services = await response.json();
    console.log(`   ✅ Services light disponibles: ${services.length}`);
    services.forEach(s => console.log(`      - ${s.domain}.${s.services}`));
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ Test terminé');
  console.log('\n💡 Pour installer la carte:');
  console.log('   1. Copie dist/ha-room-card.js vers');
  console.log('      /config/www/ha-room-card.js sur ton serveur HA');
  console.log('   2. Redémarre HA ou recharge le frontend (Ctrl+Shift+R)');
  console.log('   3. Ajoute la configuration YAML ci-dessus à ton dashboard');
}

testCard().catch(console.error);
