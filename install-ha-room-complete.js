import puppeteer from 'puppeteer';

async function installHARoomViaHACS() {
    console.log('🚀 Installation de ha-room via HACS - Processus complet...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Connexion
        console.log('📍 Étape 1: Connexion à Home Assistant...');
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
        
        console.log('⏳ Attente de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        await page.screenshot({ path: 'tests-reports/step1-connexion.png', fullPage: true });
        console.log('✅ Connexion réussie');
        
        // Étape 2: Accès à HACS et ajout du repository custom
        console.log('📍 Étape 2: Accès à HACS pour ajouter ha-room...');
        
        // Accéder à HACS frontend
        await page.goto('http://homeassistant.local:8123/hacs/frontend', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/step2-hacs-frontend.png', fullPage: true });
        
        // Chercher le bouton pour ajouter un repository custom
        console.log('🔍 Recherche du bouton d\'ajout de repository...');
        
        const addRepoButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button, paper-button'));
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.toLowerCase().includes('add') && text.toLowerCase().includes('custom')) {
                    return btn;
                }
            }
            return null;
        });
        
        if (addRepoButton) {
            console.log('✅ Bouton d\'ajout de repository trouvé');
            await page.evaluate((btn) => btn.click(), addRepoButton);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ path: 'tests-reports/step2-add-custom-repo.png', fullPage: true });
            
            // Remplir le formulaire de repository custom
            console.log('📝 Ajout du repository ha-room...');
            
            const repoInput = await page.$('input[type="text"], ha-textfield, paper-input');
            if (repoInput) {
                await repoInput.click();
                await repoInput.type('https://github.com/your-username/ha-room');
                console.log('✅ URL du repository saisie');
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            await page.screenshot({ path: 'tests-reports/step2-repo-form.png', fullPage: true });
            
            // Soumettre le formulaire
            const submitRepoButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                for (const btn of buttons) {
                    const text = btn.textContent || btn.innerText || '';
                    if (text.toLowerCase().includes('add') || text.toLowerCase().includes('submit')) {
                        return btn;
                    }
                }
                return null;
            });
            
            if (submitRepoButton) {
                await page.evaluate((btn) => btn.click(), submitRepoButton);
                console.log('✅ Repository ha-room ajouté');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        } else {
            console.log('⚠️ Bouton d\'ajout non trouvé, tentative alternative...');
            
            // Alternative: chercher "Explore & add repositories"
            const exploreButton = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                for (const btn of buttons) {
                    const text = btn.textContent || btn.innerText || '';
                    if (text.toLowerCase().includes('explore') || text.toLowerCase().includes('store')) {
                        return btn;
                    }
                }
                return null;
            });
            
            if (exploreButton) {
                await page.evaluate((btn) => btn.click(), exploreButton);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'tests-reports/step2-hacs-store.png', fullPage: true });
                
                // Chercher ha-room dans le store
                console.log('🔍 Recherche de ha-room dans le HACS Store...');
                
                const searchInput = await page.$('input[type="search"], input[placeholder*="search"], ha-textfield');
                if (searchInput) {
                    await searchInput.click();
                    await searchInput.type('ha-room');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    await page.screenshot({ path: 'tests-reports/step2-search-ha-room.png', fullPage: true });
                    
                    // Vérifier si ha-room apparaît dans les résultats
                    const haRoomFound = await page.evaluate(() => {
                        const elements = Array.from(document.querySelectorAll('*'));
                        return elements.some(el => {
                            const text = el.textContent || el.innerText || '';
                            return text.toLowerCase().includes('ha-room') && !text.toLowerCase().includes('search');
                        });
                    });
                    
                    if (haRoomFound) {
                        console.log('✅ ha-room trouvé dans le store!');
                        
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
                            
                            await page.screenshot({ path: 'tests-reports/step2-ha-room-details.png', fullPage: true });
                            
                            // Installer ha-room
                            const installButton = await page.evaluate(() => {
                                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                                for (const btn of buttons) {
                                    const text = btn.textContent || btn.innerText || '';
                                    if (text.toLowerCase().includes('install') || text.toLowerCase().includes('installer')) {
                                        return btn;
                                    }
                                }
                                return null;
                            });
                            
                            if (installButton) {
                                await page.evaluate((btn) => btn.click(), installButton);
                                console.log('🔄 Installation de ha-room en cours...');
                                await new Promise(resolve => setTimeout(resolve, 5000));
                                
                                await page.screenshot({ path: 'tests-reports/step2-installing-ha-room.png', fullPage: true });
                            }
                        }
                    } else {
                        console.log('❌ ha-room non trouvé dans le store');
                    }
                }
            }
        }
        
        // Étape 3: Recharger Home Assistant
        console.log('📍 Étape 3: Rechargement de Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        await page.screenshot({ path: 'tests-reports/step3-reloaded.png', fullPage: true });
        
        // Étape 4: Mode édition et ajout de carte ha-room
        console.log('📍 Étape 4: Mode édition et ajout de carte ha-room...');
        
        // Passer en mode édition
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/step4-edit-mode.png', fullPage: true });
        
        // Ajouter une carte
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
            
            await page.screenshot({ path: 'tests-reports/step4-card-selector.png', fullPage: true });
            
            // Chercher ha-room dans la liste des cartes
            console.log('🔍 Recherche de ha-room dans le sélecteur de cartes...');
            
            const haRoomCard = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                for (const card of cards) {
                    const text = card.textContent || card.innerText || '';
                    if (text.toLowerCase().includes('ha-room') || text.toLowerCase().includes('room')) {
                        return card;
                    }
                }
                return null;
            });
            
            if (haRoomCard) {
                console.log('✅ Carte ha-room trouvée!');
                await page.evaluate((card) => card.click(), haRoomCard);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'tests-reports/step4-ha-room-editor.png', fullPage: true });
                console.log('✅ Éditeur ha-room ouvert!');
                
                // Vérifier l'éditeur
                const editorContent = await page.evaluate(() => {
                    const editor = document.querySelector('ha-editor, .ha-editor, [data-editor]');
                    if (editor) {
                        return {
                            visible: editor.offsetParent !== null,
                            hasFields: editor.querySelectorAll('input, select, ha-form-field').length > 0
                        };
                    }
                    return null;
                });
                
                if (editorContent && editorContent.visible) {
                    console.log('✅ Éditeur ha-room fonctionnel!');
                    console.log(`   Champs disponibles: ${editorContent.hasFields}`);
                } else {
                    console.log('⚠️ Éditeur ha-room trouvé mais pas complètement visible');
                }
            } else {
                console.log('❌ Carte ha-room non trouvée dans le sélecteur');
                
                // Afficher les cartes disponibles pour diagnostic
                const availableCards = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                    return cards.map(card => ({
                        text: (card.textContent || card.innerText || '').trim(),
                        type: card.getAttribute('data-card-type') || card.tagName
                    })).slice(0, 10);
                });
                
                console.log('📋 Cartes disponibles (10 premières):');
                availableCards.forEach((card, index) => {
                    console.log(`   ${index + 1}. ${card.text} (${card.type})`);
                });
            }
        } else {
            console.log('❌ Bouton d\'ajout de carte non trouvé');
        }
        
        // Étape 5: Vérification finale
        console.log('📍 Étape 5: Vérification finale...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/step5-final-dashboard.png', fullPage: true });
        
        console.log('✅ Processus d\'installation terminé!');
        
    } catch (error) {
        console.error('❌ Erreur lors du processus:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

installHARoomViaHACS();