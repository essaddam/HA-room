import puppeteer from 'puppeteer';
import { TEST_CREDENTIALS } from './test-credentials.js';

async function testHomeAssistant() {
    console.log('🚀 Démarrage du test de Home Assistant...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Étape 1: Navigation vers Home Assistant
        console.log('📍 Navigation vers http://homeassistant.local:8123/');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Étape 2: Inspection de la page
        console.log('🔍 Inspection de la structure de la page...');

        // Prendre un screenshot avant toute action
        await page.screenshot({ path: 'home-assistant-before-login.png', fullPage: true });
        console.log('� Screenshot avant connexion sauvegardé');

        // Chercher tous les formulaires
        const forms = await page.$$('form');
        console.log(`📝 Nombre de formulaires trouvés: ${forms.length}`);

        // Chercher tous les inputs
        const inputs = await page.$$('input');
        console.log(`📝 Nombre d'inputs trouvés: ${inputs.length}`);

        // Chercher tous les boutons
        const buttons = await page.$$('button');
        console.log(`📝 Nombre de boutons trouvés: ${buttons.length}`);

        // Afficher le contenu HTML de la page pour analyse
        const bodyContent = await page.evaluate(() => {
            return document.body.innerHTML.substring(0, 1000);
        });
        console.log('📄 Début du contenu HTML:', bodyContent);

        // Étape 3: Tentative de connexion avec différents sélecteurs
        console.log('� Tentative de connexion...');

        // Essayer différents sélecteurs pour les champs de connexion
        const usernameSelectors = [
            'input[name="username"]',
            'input[type="text"]',
            'input[placeholder*="username"]',
            'input[placeholder*="email"]',
            '#username',
            '.username'
        ];

        const passwordSelectors = [
            'input[name="password"]',
            'input[type="password"]',
            'input[placeholder*="password"]',
            '#password',
            '.password'
        ];

        let usernameFound = false;
        let passwordFound = false;

        for (const selector of usernameSelectors) {
            const element = await page.$(selector);
            if (element) {
                console.log(`✅ Champ username trouvé avec: ${selector}`);
                await element.type(TEST_CREDENTIALS.username);
                usernameFound = true;
                break;
            }
        }

        for (const selector of passwordSelectors) {
            const element = await page.$(selector);
            if (element) {
                console.log(`✅ Champ password trouvé avec: ${selector}`);
                await element.type(TEST_CREDENTIALS.password);
                passwordFound = true;
                break;
            }
        }

        if (usernameFound && passwordFound) {
            // Chercher le bouton de soumission
            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button',
                '.submit',
                '#submit',
                'mwc-button'
            ];

            for (const selector of submitSelectors) {
                const element = await page.$(selector);
                if (element) {
                    console.log(`✅ Bouton de soumission trouvé avec: ${selector}`);
                    await element.click();
                    break;
                }
            }

            console.log('⏳ Attente après connexion...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } else {
            console.log('❌ Champs de connexion non trouvés');
        }

        // Étape 4: Vérification après connexion
        const title = await page.title();
        console.log(`📄 Titre de la page: ${title}`);

        // Prendre un screenshot après connexion
        await page.screenshot({ path: 'home-assistant-after-login.png', fullPage: true });
        console.log('📸 Screenshot après connexion sauvegardé');

        // Vérifier si on est connecté
        const homeAssistantElement = await page.$('home-assistant');
        if (homeAssistantElement) {
            console.log('✅ Interface Home Assistant détectée');

            // Chercher des éléments spécifiques à HA
            const dashboardElements = await page.$$('ha-panel-lovelace');
            console.log(`📊 Nombre de dashboards Lovelace: ${dashboardElements.length}`);

            // Chercher HACS
            const hacsElements = await page.$$('[href*="hacs"]');
            console.log(`🎯 Éléments HACS trouvés: ${hacsElements.length}`);
        }

        console.log('✅ Test terminé!');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHomeAssistant();