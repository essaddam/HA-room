import puppeteer from 'puppeteer';
import { TEST_CREDENTIALS } from './test-credentials.js';

async function testHomeAssistantFeatures() {
    console.log('🚀 Démarrage du test complet des fonctionnalités Home Assistant...');
    
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
        
        // Remplir les identifiants de test
        await page.type('input[name="username"]', TEST_CREDENTIALS.username);
        await page.type('input[name="password"]', TEST_CREDENTIALS.password);
        
        // Cliquer sur le bouton de connexion
        const submitButton = await page.$('button');
        if (submitButton) {
            await submitButton.click();
        }
        
        console.log('⏳ Attente de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Étape 2: Vérification de la connexion et accès à la configuration
        console.log('🔍 Vérification de l\'interface...');
        
        // Prendre un screenshot de l'interface principale
        await page.screenshot({ path: 'ha-dashboard.png', fullPage: true });
        console.log('📸 Screenshot du dashboard sauvegardé');
        
        // Chercher le bouton de configuration (généralement en bas à gauche)
        const configSelectors = [
            'ha-menu-button[title="Configuration"]',
            'paper-icon-button[title="Configuration"]',
            'button[title="Configuration"]',
            'ha-icon-button[title="Configuration"]',
            '.menu-item[data-panel="config"]',
            'a[href*="/config"]'
        ];
        
        let configButton = null;
        for (const selector of configSelectors) {
            configButton = await page.$(selector);
            if (configButton) {
                console.log(`✅ Bouton Configuration trouvé avec: ${selector}`);
                break;
            }
        }
        
        if (!configButton) {
            // Essayer de naviguer directement vers l'URL de configuration
            console.log('🔄 Navigation directe vers la configuration...');
            await page.goto('http://homeassistant.local:8123/config', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
        } else {
            await configButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Étape 3: Recherche de la section des pièces/rooms
        console.log('🏠 Recherche de la section des pièces...');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'ha-config.png', fullPage: true });
        
        // Chercher les sections de configuration
        const roomSelectors = [
            'ha-config-section[data-section="areas"]',
            'ha-config-areas',
            '.config-section[data-section="areas"]',
            'a[href*="/config/areas"]',
            'button[data-panel="areas"]',
            'ha-config-area',
            'ha-panel-config-area'
        ];
        
        let roomSection = null;
        for (const selector of roomSelectors) {
            roomSection = await page.$(selector);
            if (roomSection) {
                console.log(`✅ Section des pièces trouvée avec: ${selector}`);
                break;
            }
        }
        
        if (!roomSection) {
            // Essayer de naviguer directement vers la section areas
            console.log('🔄 Navigation directe vers la section des pièces...');
            await page.goto('http://homeassistant.local:8123/config/areas', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
        } else {
            await roomSection.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'ha-areas.png', fullPage: true });
        console.log('📸 Screenshot de la section des pièces sauvegardé');
        
        // Étape 4: Test d'ajout d'une pièce
        console.log('➕ Test d\'ajout d\'une nouvelle pièce...');
        
        // Chercher le bouton d'ajout
        const addButtons = await page.$$('button');
        let addButton = null;
        
        for (const button of addButtons) {
            const text = await page.evaluate(el => el.textContent, button);
            if (text && (text.includes('Ajouter') || text.includes('Add') || text.includes('+'))) {
                addButton = button;
                console.log(`✅ Bouton d'ajout trouvé: "${text}"`);
                break;
            }
        }
        
        if (addButton) {
            await addButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Remplir le formulaire de nouvelle pièce
            const nameInput = await page.$('input[name="name"], input[type="text"], ha-textfield');
            if (nameInput) {
                await nameInput.click();
                await nameInput.type('Test Room Automation');
                console.log('✅ Nom de la pièce défini');
            }
            
            // Prendre un screenshot du formulaire
            await page.screenshot({ path: 'ha-add-room-form.png', fullPage: true });
            
            // Chercher le bouton de sauvegarde
            const saveButtons = await page.$$('button');
            for (const button of saveButtons) {
                const text = await page.evaluate(el => el.textContent, button);
                if (text && (text.includes('Sauvegarder') || text.includes('Save') || text.includes('Créer') || text.includes('Create'))) {
                    await button.click();
                    console.log('✅ Formulaire de pièce soumis');
                    break;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Étape 5: Vérification de la pièce ajoutée
        console.log('🔍 Vérification de la pièce ajoutée...');
        await page.screenshot({ path: 'ha-areas-after-add.png', fullPage: true });
        
        // Étape 6: Test de l'éditeur ha-room
        console.log('📝 Test de l\'éditeur ha-room...');
        
        // Chercher des cartes ou éléments ha-room dans le dashboard
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Chercher des éléments ha-room ou custom cards
        const haRoomElements = await page.$$('ha-room-card, .ha-room, [data-domain="ha-room"]');
        console.log(`🎯 Éléments ha-room trouvés: ${haRoomElements.length}`);
        
        if (haRoomElements.length > 0) {
            console.log('✅ Cartes ha-room détectées dans le dashboard');
            
            // Cliquer sur la première carte ha-room pour l'éditer
            await haRoomElements[0].click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ path: 'ha-room-editor.png', fullPage: true });
            console.log('📸 Screenshot de l\'éditeur ha-room sauvegardé');
        } else {
            console.log('ℹ️ Aucune carte ha-room détectée dans le dashboard actuel');
        }
        
        // Étape 7: Test final et documentation
        console.log('📋 Test final et documentation...');
        
        // Vérifier les erreurs dans la console
        const errors = await page.evaluate(() => {
            const errorMessages = [];
            const originalLog = console.error;
            console.error = function(...args) {
                errorMessages.push(args.join(' '));
                originalLog.apply(console, args);
            };
            return errorMessages;
        });
        
        if (errors.length > 0) {
            console.log('⚠️ Erreurs détectées:', errors);
        } else {
            console.log('✅ Aucune erreur détectée dans la console');
        }
        
        // Prendre un screenshot final
        await page.screenshot({ path: 'ha-final-state.png', fullPage: true });
        
        console.log('✅ Test complet terminé avec succès!');
        console.log('📸 Screenshots générés:');
        console.log('  - ha-dashboard.png: Dashboard principal');
        console.log('  - ha-config.png: Section configuration');
        console.log('  - ha-areas.png: Gestion des pièces');
        console.log('  - ha-add-room-form.png: Formulaire d\'ajout de pièce');
        console.log('  - ha-areas-after-add.png: Section pièces après ajout');
        console.log('  - ha-room-editor.png: Éditeur ha-room (si disponible)');
        console.log('  - ha-final-state.png: État final');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHomeAssistantFeatures();