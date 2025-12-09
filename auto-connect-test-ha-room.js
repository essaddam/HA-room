import puppeteer from 'puppeteer';

async function autoConnectAndTestHARoom() {
    console.log('🚀 Connexion automatique et test ha-room...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Connexion avec gestion OAuth
        console.log('📍 Étape 1: Connexion à Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Gérer la page OAuth si elle apparaît
        let connectionSuccessful = false;
        let maxAttempts = 3;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔄 Tentative ${attempt}/${maxAttempts}`);
            
            const currentUrl = page.url();
            
            if (currentUrl.includes('authorize')) {
                console.log('🔐 Page OAuth détectée - Tentative de résolution...');
                
                await page.screenshot({ path: 'tests-reports/auto-1-oauth-detected.png', fullPage: true });
                
                // Analyser la page OAuth
                const oauthAnalysis = await page.evaluate(() => {
                    const title = document.title;
                    const inputs = Array.from(document.querySelectorAll('input'));
                    const buttons = Array.from(document.querySelectorAll('button'));
                    
                    const hasCodeInput = inputs.some(input => input.type === 'text');
                    const hasCancelButton = buttons.some(btn => {
                        const text = btn.textContent || btn.innerText || '';
                        return text.toLowerCase().includes('cancel') || text.toLowerCase().includes('annuler');
                    });
                    
                    return {
                        title,
                        inputCount: inputs.length,
                        buttonCount: buttons.length,
                        hasCodeInput,
                        hasCancelButton
                    };
                });
                
                console.log(`   Page: ${oauthAnalysis.title}`);
                console.log(`   Inputs: ${oauthAnalysis.inputCount}`);
                console.log(`   Code requis: ${oauthAnalysis.hasCodeInput ? '✅' : '❌'}`);
                
                if (oauthAnalysis.hasCancelButton) {
                    console.log('✅ Bouton annuler trouvé - Tentative d\'annulation...');
                    
                    const cancelButton = await page.evaluate(() => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        for (const btn of buttons) {
                            const text = btn.textContent || btn.innerText || '';
                            if (text.toLowerCase().includes('cancel') || text.toLowerCase().includes('annuler')) {
                                return btn;
                            }
                        }
                        return null;
                    });
                    
                    if (cancelButton) {
                        await page.evaluate((btn) => btn.click(), cancelButton);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                
                // Attendre et réessayer
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }
            
            // Si on est sur la page de login normale
            const loginCheck = await page.evaluate(() => {
                const usernameInput = document.querySelector('input[name="username"]');
                const passwordInput = document.querySelector('input[name="password"]');
                const submitButton = document.querySelector('button');
                
                return {
                    hasLoginForm: !!(usernameInput && passwordInput),
                    hasSubmitButton: !!submitButton
                };
            });
            
            if (loginCheck.hasLoginForm && loginCheck.hasSubmitButton) {
                console.log('🔐 Formulaire de login trouvé - Connexion...');
                
                await page.screenshot({ path: 'tests-reports/auto-2-login-form.png', fullPage: true });
                
                // Remplir les identifiants
                await page.type('input[name="username"]', 'dev');
                await page.type('input[name="password"]', 'Dev@2017!');
                
                await page.screenshot({ path: 'tests-reports/auto-3-credentials-filled.png', fullPage: true });
                
                // Soumettre
                await page.click('button');
                console.log('✅ Connexion soumise');
                
                // Attendre la réponse
                await new Promise(resolve => setTimeout(resolve, 8000));
                
                // Vérifier si la connexion a réussi
                const afterLogin = await page.evaluate(() => {
                    const usernameInput = document.querySelector('input[name="username"]');
                    const homeAssistant = document.querySelector('home-assistant');
                    const title = document.title;
                    
                    return {
                        stillOnLoginPage: !!usernameInput,
                        hasHomeAssistant: !!homeAssistant,
                        title: title,
                        url: window.location.href
                    };
                });
                
                console.log(`📊 Résultat tentative ${attempt}:`);
                console.log(`   Connecté: ${!afterLogin.stillOnLoginPage ? '✅' : '❌'}`);
                console.log(`   HA chargé: ${afterLogin.hasHomeAssistant ? '✅' : '❌'}`);
                
                if (!afterLogin.stillOnLoginPage && afterLogin.hasHomeAssistant) {
                    connectionSuccessful = true;
                    console.log('🎉 CONNEXION RÉUSSIE !');
                    await page.screenshot({ path: 'tests-reports/auto-4-success.png', fullPage: true });
                    break;
                } else {
                    console.log('❌ Connexion échouée - Nouvelle tentative...');
                    await page.screenshot({ path: `tests-reports/auto-4-failed-${attempt}.png`, fullPage: true });
                }
            } else {
                console.log('❌ Page de login non trouvée');
                await page.screenshot({ path: 'tests-reports/auto-2-no-form.png', fullPage: true });
                break;
            }
        }
        
        if (!connectionSuccessful) {
            console.log('❌ Toutes les tentatives de connexion ont échoué');
            return;
        }
        
        // Étape 2: Test de ha-room maintenant qu'on est connecté
        console.log('📍 Étape 2: Test de ha-room...');
        
        // Vérifier que ha-room est installé
        const haRoomCheck = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const haRoomScript = scripts.find(s => s.src.includes('ha-room'));
            
            return {
                haRoomFound: !!haRoomScript,
                scriptUrl: haRoomScript ? haRoomScript.src : null
            };
        });
        
        console.log(`🔍 ha-room installé: ${haRoomCheck.haRoomFound ? '✅' : '❌'}`);
        
        if (haRoomCheck.haRoomFound) {
            console.log(`   URL: ${haRoomCheck.scriptUrl}`);
        }
        
        await page.screenshot({ path: 'tests-reports/auto-5-ha-room-check.png', fullPage: true });
        
        // Aller au dashboard d'édition
        console.log('🏠 Navigation vers le dashboard d\'édition...');
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await page.screenshot({ path: 'tests-reports/auto-6-edit-mode.png', fullPage: true });
        
        // Ajouter une carte ha-room
        console.log('➕ Ajout d\'une carte ha-room...');
        
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
            
            await page.screenshot({ path: 'tests-reports/auto-7-add-card.png', fullPage: true });
            
            // Chercher ha-room dans le sélecteur
            const haRoomCard = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                for (const card of cards) {
                    const text = card.textContent || card.innerText || '';
                    if (text.toLowerCase().includes('ha-room') || (text.toLowerCase().includes('room') && !text.toLowerCase().includes('weather'))) {
                        return card;
                    }
                }
                return null;
            });
            
            if (haRoomCard) {
                console.log('✅ Carte ha-room trouvée !');
                await page.evaluate((card) => card.click(), haRoomCard);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'tests-reports/auto-8-ha-room-selected.png', fullPage: true });
                console.log('✅ Sélection de ha-room réussie');
                
                // Analyser l'éditeur
                console.log('🔍 Analyse de l\'éditeur ha-room...');
                
                const editorAnalysis = await page.evaluate(() => {
                    const editor = document.querySelector('ha-editor, .ha-editor, [data-editor], .editor-form');
                    if (editor) {
                        const inputs = editor.querySelectorAll('input, select, ha-textfield, ha-form-field');
                        const buttons = editor.querySelectorAll('button, ha-button, mwc-button');
                        
                        return {
                            editorFound: true,
                            inputCount: inputs.length,
                            buttonCount: buttons.length,
                            hasNameField: Array.from(inputs).some(input => 
                                input.name === 'name' || input.placeholder?.toLowerCase().includes('name')
                            ),
                            hasEntityField: Array.from(inputs).some(input => 
                                input.name === 'entity' || input.placeholder?.toLowerCase().includes('entity')
                            ),
                            editorHTML: editor.innerHTML.substring(0, 500)
                        };
                    }
                    return { editorFound: false };
                });
                
                if (editorAnalysis.editorFound) {
                    console.log('📝 Éditeur ha-room ouvert:');
                    console.log(`   Champs: ${editorAnalysis.inputCount}`);
                    console.log(`   Boutons: ${editorAnalysis.buttonCount}`);
                    console.log(`   Champ nom: ${editorAnalysis.hasNameField ? '✅' : '❌'}`);
                    console.log(`   Champ entité: ${editorAnalysis.hasEntityField ? '✅' : '❌'}`);
                    
                    await page.screenshot({ path: 'tests-reports/auto-9-editor-analysis.png', fullPage: true });
                    
                    // Tester la configuration
                    if (editorAnalysis.hasNameField && editorAnalysis.hasEntityField) {
                        console.log('🧪 Test de configuration de l\'éditeur...');
                        
                        // Remplir les champs de test
                        const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
                        if (nameInput) {
                            await nameInput.click();
                            await nameInput.type('Test HA Room Complet');
                            console.log('✅ Nom de la carte défini');
                        }
                        
                        const entityInput = await page.$('input[name="entity"], input[placeholder*="entity"]');
                        if (entityInput) {
                            await entityInput.click();
                            await entityInput.type('sun.sun');
                            console.log('✅ Entité de test définie');
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await page.screenshot({ path: 'tests-reports/auto-10-configured.png', fullPage: true });
                        
                        // Sauvegarder la configuration
                        const saveButton = await page.evaluate(() => {
                            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                            for (const btn of buttons) {
                                const text = btn.textContent || btn.innerText || '';
                                if (text.toLowerCase().includes('save') || text.toLowerCase().includes('sauvegarder')) {
                                    return btn;
                                }
                            }
                            return null;
                        });
                        
                        if (saveButton) {
                            await page.evaluate((btn) => btn.click(), saveButton);
                            console.log('✅ Configuration sauvegardée');
                            await new Promise(resolve => setTimeout(resolve, 3000));
                        }
                    }
                    
                    await page.screenshot({ path: 'tests-reports/auto-11-final.png', fullPage: true });
                    console.log('✅ Test ha-room terminé avec succès !');
                    
                } else {
                    console.log('❌ Éditeur ha-room non trouvé ou incomplet');
                }
            } else {
                console.log('❌ Carte ha-room non trouvée dans le sélecteur');
                
                // Afficher les cartes disponibles
                const availableCards = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                    return cards.map(card => ({
                        text: (card.textContent || card.innerText || '').trim(),
                        type: card.getAttribute('data-card-type') || card.tagName
                    })).slice(0, 10);
                });
                
                console.log('📋 Cartes disponibles:');
                availableCards.forEach((card, index) => {
                    console.log(`   ${index + 1}. ${card.text} (${card.type})`);
                });
            }
        } else {
            console.log('❌ Bouton d\'ajout de carte non trouvé');
        }
        
        // Vérification finale
        console.log('📍 Vérification finale...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/auto-12-final-dashboard.png', fullPage: true });
        
        console.log('✅ Processus automatisé terminé !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

autoConnectAndTestHARoom();