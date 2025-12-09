import puppeteer from 'puppeteer';

async function checkHARoomInstallation() {
    console.log('🔍 Vérification de l\'installation de ha-room...');
    
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
        
        // Vérifier si ha-room est déjà installé
        console.log('🔍 Vérification des ressources ha-room...');
        
        const pageAnalysis = await page.evaluate(() => {
            // Vérifier les scripts
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const haRoomScripts = scripts.filter(s => 
                s.src.includes('ha-room') || s.src.includes('hacsfiles')
            );
            
            // Vérifier les liens CSS
            const links = Array.from(document.querySelectorAll('link[href]'));
            const haRoomLinks = links.filter(l => 
                l.href.includes('ha-room') || l.href.includes('hacsfiles')
            );
            
            // Vérifier le contenu pour ha-room
            const bodyText = document.body.innerText.toLowerCase();
            const hasHARoomInContent = bodyText.includes('ha-room');
            
            return {
                haRoomScripts: haRoomScripts.map(s => s.src),
                haRoomLinks: haRoomLinks.map(l => l.href),
                hasHARoomInContent,
                totalScripts: scripts.length,
                totalLinks: links.length
            };
        });
        
        console.log('📊 Analyse des ressources:');
        console.log(`  Scripts trouvés: ${pageAnalysis.totalScripts}`);
        console.log(`  Scripts ha-room: ${pageAnalysis.haRoomScripts.length}`);
        pageAnalysis.haRoomScripts.forEach(script => {
            console.log(`    ✅ ${script}`);
        });
        
        console.log(`  Links trouvés: ${pageAnalysis.totalLinks}`);
        console.log(`  Links ha-room: ${pageAnalysis.haRoomLinks.length}`);
        pageAnalysis.haRoomLinks.forEach(link => {
            console.log(`    ✅ ${link}`);
        });
        
        console.log(`  ha-room dans le contenu: ${pageAnalysis.hasHARoomInContent}`);
        
        // Si ha-room n'est pas trouvé, essayer de l'installer via HACS
        if (pageAnalysis.haRoomScripts.length === 0 && pageAnalysis.haRoomLinks.length === 0) {
            console.log('⚠️ ha-room ne semble pas être installé. Tentative d\'installation via HACS...');
            
            await page.goto('http://homeassistant.local:8123/hacs/frontend', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            await new Promise(resolve => setTimeout(resolve, 3000));
            await page.screenshot({ path: 'hacs-frontend-before-install.png', fullPage: true });
            
            // Chercher le bouton pour ajouter des intégrations
            const addButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button, paper-button'));
                for (const btn of buttons) {
                    const text = btn.textContent || btn.innerText || '';
                    if (text.toLowerCase().includes('add') || text.toLowerCase().includes('ajouter') || text.toLowerCase().includes('explore') || text.toLowerCase().includes('explorer')) {
                        return btn;
                    }
                }
                return null;
            });
            
            if (addButton) {
                console.log('✅ Bouton d\'ajout trouvé');
                await page.evaluate((btn) => btn.click(), addButton);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'hacs-add-store.png', fullPage: true });
                
                // Chercher ha-room dans le store
                console.log('🔍 Recherche de ha-room dans le HACS Store...');
                
                // Attendre que le store se charge
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Prendre un screenshot du store
                await page.screenshot({ path: 'hacs-store-search.png', fullPage: true });
                
                // Essayer de chercher ha-room
                const searchInput = await page.$('input[type="search"], input[placeholder*="search"], ha-textfield');
                if (searchInput) {
                    console.log('✅ Champ de recherche trouvé');
                    await searchInput.click();
                    await searchInput.type('ha-room');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    await page.screenshot({ path: 'hacs-search-ha-room.png', fullPage: true });
                    
                    // Vérifier si ha-room apparaît dans les résultats
                    const haRoomFound = await page.evaluate(() => {
                        const elements = Array.from(document.querySelectorAll('*'));
                        return elements.some(el => {
                            const text = el.textContent || el.innerText || '';
                            return text.toLowerCase().includes('ha-room') && !text.toLowerCase().includes('search');
                        });
                    });
                    
                    if (haRoomFound) {
                        console.log('✅ ha-room trouvé dans les résultats de recherche!');
                        
                        // Cliquer sur ha-room
                        const haRoomResult = await page.evaluate(() => {
                            const elements = Array.from(document.querySelectorAll('ha-card, .card, button, a'));
                            for (const el of elements) {
                                const text = el.textContent || el.innerText || '';
                                if (text.toLowerCase().includes('ha-room') && !text.toLowerCase().includes('search')) {
                                    return el;
                                }
                            }
                            return null;
                        });
                        
                        if (haRoomResult) {
                            await page.evaluate((el) => el.click(), haRoomResult);
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            
                            await page.screenshot({ path: 'ha-room-details.png', fullPage: true });
                            
                            // Chercher le bouton d'installation
                            const installButton = await page.evaluate(() => {
                                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                                for (const btn of buttons) {
                                    const text = btn.textContent || btn.innerText || '';
                                    if (text.toLowerCase().includes('install') || text.toLowerCase().includes('installer') || text.toLowerCase().includes('download')) {
                                        return btn;
                                    }
                                }
                                return null;
                            });
                            
                            if (installButton) {
                                console.log('✅ Bouton d\'installation trouvé!');
                                await page.evaluate((btn) => btn.click(), installButton);
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                
                                await page.screenshot({ path: 'ha-room-installing.png', fullPage: true });
                                console.log('🔄 Installation de ha-room en cours...');
                            }
                        }
                    } else {
                        console.log('❌ ha-room non trouvé dans les résultats de recherche');
                    }
                } else {
                    console.log('❌ Champ de recherche non trouvé');
                }
            } else {
                console.log('❌ Bouton d\'ajout non trouvé');
            }
        } else {
            console.log('✅ ha-room semble être installé!');
        }
        
        // Screenshot final
        await page.screenshot({ path: 'final-check.png', fullPage: true });
        
        console.log('✅ Vérification terminée!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

checkHARoomInstallation();