import puppeteer from 'puppeteer';

async function diagnoseHACS() {
    console.log('🔍 Diagnostic HACS et recherche de ha-room...');
    
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
        
        // Diagnostic HACS
        console.log('🎯 Diagnostic HACS...');
        
        // Vérifier toutes les pages HACS possibles
        const hacsPages = [
            '/hacs',
            '/hacs/dashboard',
            '/hacs/frontend',
            '/hacs/integrations',
            '/hacs/repositories'
        ];
        
        for (const pagePath of hacsPages) {
            console.log(`🔍 Vérification de ${pagePath}...`);
            await page.goto(`http://homeassistant.local:8123${pagePath}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Analyser le contenu
            const pageContent = await page.evaluate(() => {
                return {
                    title: document.title,
                    url: window.location.href,
                    bodyText: document.body.innerText.substring(0, 1000),
                    hasHARoom: document.body.innerText.toLowerCase().includes('ha-room'),
                    allCards: Array.from(document.querySelectorAll('.card, ha-card, [data-card-type]')).map(el => ({
                        text: el.textContent || el.innerText || '',
                        type: el.getAttribute('data-card-type') || el.tagName
                    }))
                };
            });
            
            console.log(`📄 Page: ${pagePath}`);
            console.log(`   Titre: ${pageContent.title}`);
            console.log(`   ha-room trouvé: ${pageContent.hasHARoom}`);
            
            if (pageContent.hasHARoom) {
                console.log('✅ ha-room trouvé sur cette page!');
                await page.screenshot({ path: `hacs-found-${pagePath.replace(/\//g, '-')}.png`, fullPage: true });
            }
            
            // Sauvegarder un screenshot de chaque page HACS
            await page.screenshot({ path: `hacs-diagnostic-${pagePath.replace(/\//g, '-')}.png`, fullPage: true });
        }
        
        // Vérifier les ressources JavaScript chargées
        console.log('📜 Vérification des ressources JavaScript...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const resources = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const links = Array.from(document.querySelectorAll('link[href]'));
            
            return {
                scripts: scripts.map(s => s.src),
                links: links.map(l => l.href),
                customElements: Array.from(customElements.define).map(def => def[0])
            };
        });
        
        console.log('🔍 Scripts contenant "ha-room":');
        resources.scripts.forEach(script => {
            if (script.includes('ha-room') || script.includes('hacsfiles')) {
                console.log(`  ✅ ${script}`);
            }
        });
        
        console.log('🔍 Links contenant "ha-room":');
        resources.links.forEach(link => {
            if (link.includes('ha-room') || link.includes('hacsfiles')) {
                console.log(`  ✅ ${link}`);
            }
        });
        
        console.log('🔍 Éléments personnalisés contenant "ha-room":');
        resources.customElements.forEach(element => {
            if (element && element.includes('ha-room')) {
                console.log(`  ✅ ${element}`);
            }
        });
        
        // Vérifier si on peut installer ha-room
        console.log('📦 Vérification de l\'installation de ha-room...');
        await page.goto('http://homeassistant.local:8123/hacs/frontend', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Chercher le bouton d'exploration
        const exploreButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.toLowerCase().includes('explore') || text.toLowerCase().includes('explorer') || text.toLowerCase().includes('store')) {
                    return btn;
                }
            }
            return null;
        });
        
        if (exploreButton) {
            console.log('✅ Bouton d\'exploration trouvé');
            await page.evaluate((btn) => btn.click(), exploreButton);
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            await page.screenshot({ path: 'hacs-explore.png', fullPage: true });
            
            // Chercher ha-room dans le store
            const haRoomInStore = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('*'));
                return elements.some(el => {
                    const text = el.textContent || el.innerText || '';
                    return text.toLowerCase().includes('ha-room');
                });
            });
            
            if (haRoomInStore) {
                console.log('✅ ha-room trouvé dans le HACS Store!');
            } else {
                console.log('❌ ha-room non trouvé dans le HACS Store');
            }
        }
        
        console.log('✅ Diagnostic terminé!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

diagnoseHACS();