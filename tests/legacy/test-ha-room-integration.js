import puppeteer from 'puppeteer';
import { TEST_CREDENTIALS } from './test-credentials.js';

async function testHARoomIntegration() {
    console.log('🚀 Test spécifique d\'intégration ha-room...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Connexion
        console.log('📍 Connexion à Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Connexion avec les identifiants de test
        await page.type('input[name="username"]', TEST_CREDENTIALS.username);
        await page.type('input[name="password"]', TEST_CREDENTIALS.password);
        
        const submitButton = await page.$('button');
        if (submitButton) {
            await submitButton.click();
        }
        
        console.log('⏳ Attente de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Étape 2: Vérifier HACS
        console.log('🎯 Vérification de HACS...');
        
        // Naviguer vers HACS
        await page.goto('http://homeassistant.local:8123/hacs', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'hacs-main.png', fullPage: true });
        
        // Chercher ha-room dans HACS
        const hacsContent = await page.evaluate(() => {
            return document.body.innerHTML;
        });
        
        if (hacsContent.includes('ha-room') || hacsContent.includes('HA Room Card')) {
            console.log('✅ ha-room trouvé dans HACS');
        } else {
            console.log('ℹ️ ha-room non trouvé dans la page principale HACS');
            
            // Chercher dans les intégrations front-end
            await page.goto('http://homeassistant.local:8123/hacs/frontend', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            await page.screenshot({ path: 'hacs-frontend.png', fullPage: true });
            
            const frontendContent = await page.evaluate(() => {
                return document.body.innerHTML;
            });
            
            if (frontendContent.includes('ha-room') || frontendContent.includes('HA Room')) {
                console.log('✅ ha-room trouvé dans les intégrations front-end HACS');
            } else {
                console.log('ℹ️ ha-room non trouvé dans HACS frontend');
            }
        }
        
        // Étape 3: Vérifier les ressources chargées
        console.log('🔍 Vérification des ressources JavaScript...');
        
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Vérifier les scripts chargés
        const scripts = await page.evaluate(() => {
            const scriptElements = Array.from(document.querySelectorAll('script[src]'));
            return scriptElements.map(script => script.src);
        });
        
        console.log('📜 Scripts chargés:');
        scripts.forEach(script => {
            if (script.includes('ha-room') || script.includes('hacsfiles')) {
                console.log(`  ✅ ${script}`);
            }
        });
        
        // Étape 4: Vérifier si la carte est enregistrée
        console.log('🔧 Vérification de l\'enregistrement de la carte...');
        
        const customElements = await page.evaluate(() => {
            return Array.from(customElements.define);
        });
        
        console.log('📦 Éléments personnalisés enregistrés:');
        customElements.forEach(element => {
            if (element && element[0] && element[0].includes('ha-room')) {
                console.log(`  ✅ ${element[0]}`);
            }
        });
        
        // Étape 5: Test de création d'une carte ha-room manuelle
        console.log('🛠️ Test de création manuelle d\'une carte ha-room...');
        
        // Naviguer vers l'éditeur de dashboard
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'lovelace-editor.png', fullPage: true });
        
        // Chercher le bouton "Ajouter une carte"
        const addCardButtons = await page.$$('button');
        let addCardButton = null;
        
        for (const button of addCardButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && (text.includes('Ajouter une carte') || text.includes('Add card') || text.includes('Carte'))) {
                addCardButton = button;
                console.log(`✅ Bouton d'ajout de carte trouvé: "${text}"`);
                break;
            }
        }
        
        if (addCardButton) {
            await addCardButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Chercher ha-room dans la liste des cartes
            await page.screenshot({ path: 'card-selector.png', fullPage: true });
            
            // Essayer de trouver ha-room dans les options
            const cardOptions = await page.evaluate(() => {
                const options = Array.from(document.querySelectorAll('option, .card-type, [data-card-type]'));
                return options.map(option => ({
                    text: option.textContent || option.innerText,
                    value: option.value || option.getAttribute('data-card-type')
                }));
            });
            
            console.log('🎴 Options de cartes disponibles:');
            cardOptions.forEach(option => {
                if (option.text && option.text.toLowerCase().includes('room')) {
                    console.log(`  ✅ ${option.text} (${option.value})`);
                }
            });
        }
        
        // Étape 6: Vérification finale
        console.log('📋 Résumé du test d\'intégration...');
        
        // Prendre un screenshot final
        await page.screenshot({ path: 'ha-room-integration-final.png', fullPage: true });
        
        console.log('✅ Test d\'intégration ha-room terminé!');
        console.log('📸 Screenshots générés:');
        console.log('  - hacs-main.png: Page principale HACS');
        console.log('  - hacs-frontend.png: Intégrations front-end HACS');
        console.log('  - lovelace-editor.png: Éditeur Lovelace');
        console.log('  - card-selector.png: Sélecteur de cartes');
        console.log('  - ha-room-integration-final.png: État final');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHARoomIntegration();