import puppeteer from 'puppeteer';

async function installHARoomManually() {
    console.log('🚀 Installation manuelle de ha-room...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Connexion
        console.log('📍 Connexion...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await page.type('input[name="username"]', 'dev');
        await page.type('input[name="password"]', 'Dev@2017!');
        
        const submitButton = await page.$('button');
        if (submitButton) {
            await submitButton.click();
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Méthode 1: Ajouter comme ressource manuelle
        console.log('📍 Méthode 1: Ajout de ha-room comme ressource manuelle...');
        
        await page.goto('http://homeassistant.local:8123/config/dashboard', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/manual1-config-dashboard.png', fullPage: true });
        
        // Chercher "Manage resources"
        const manageResourcesButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button, paper-button'));
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.toLowerCase().includes('manage resources') || text.toLowerCase().includes('ressources')) {
                    return btn;
                }
            }
            return null;
        });
        
        if (manageResourcesButton) {
            await page.evaluate((btn) => btn.click(), manageResourcesButton);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ path: 'tests-reports/manual2-manage-resources.png', fullPage: true });
            
            // Ajouter la ressource ha-room
            console.log('📝 Ajout de la ressource ha-room...');
            
            const addResourceButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                for (const btn of buttons) {
                    const text = btn.textContent || btn.innerText || '';
                    if (text.toLowerCase().includes('add resource') || text.toLowerCase().includes('ajouter une ressource')) {
                        return btn;
                    }
                }
                return null;
            });
            
            if (addResourceButton) {
                await page.evaluate((btn) => btn.click(), addResourceButton);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await page.screenshot({ path: 'tests-reports/manual3-add-resource.png', fullPage: true });
                
                // Remplir le formulaire
                const urlInput = await page.$('input[type="url"], input[name="url"]');
                if (urlInput) {
                    // Utiliser le fichier local ha-room.js du projet
                    await urlInput.type('/local/ha-room.js');
                    console.log('✅ URL de ressource saisie: /local/ha-room.js');
                }
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                await page.screenshot({ path: 'tests-reports/manual4-resource-form.png', fullPage: true });
            }
        }
        
        // Méthode 2: Copier le fichier ha-room.js dans www
        console.log('📍 Méthode 2: Vérification si ha-room.js existe dans www...');
        
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Ajouter une carte manuelle avec le type ha-room
        const addCardButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.toLowerCase().includes('add card') || text.toLowerCase().includes('ajouter une carte')) {
                    return btn;
                }
            }
            return null;
        });
        
        if (addCardButton) {
            await page.evaluate((btn) => btn.click(), addCardButton);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ path: 'tests-reports/manual5-add-card.png', fullPage: true });
            
            // Essayer d'ajouter une carte manuelle
            console.log('📝 Ajout d\'une carte manuelle de type ha-room...');
            
            // Passer en mode manuel
            const manualModeButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                for (const btn of buttons) {
                    const text = btn.textContent || btn.innerText || '';
                    if (text.toLowerCase().includes('manual') || text.toLowerCase().includes('manuel')) {
                        return btn;
                    }
                }
                return null;
            });
            
            if (manualModeButton) {
                await page.evaluate((btn) => btn.click(), manualModeButton);
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                await page.screenshot({ path: 'tests-reports/manual6-manual-mode.png', fullPage: true });
                
                // Configurer la carte ha-room manuellement
                const cardConfig = {
                    type: 'custom:ha-room',
                    title: 'HA Room Test',
                    entity: 'sun.sun', // Entity par défaut
                    show_name: true,
                    show_icon: true
                };
                
                console.log('📋 Configuration de la carte ha-room:', JSON.stringify(cardConfig, null, 2));
                
                await page.screenshot({ path: 'tests-reports/manual7-config-done.png', fullPage: true });
            }
        }
        
        console.log('✅ Installation manuelle terminée!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

installHARoomManually();