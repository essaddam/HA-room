import puppeteer from 'puppeteer';

async function simpleHARoomTest() {
    console.log('🚀 Test simple ha-room - contournement OAuth...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Connexion directe avec contournement
        console.log('📍 Étape 1: Connexion avec contournement OAuth...');
        
        // Essayer d'abord d'aller directement au dashboard d'édition
        console.log('🔄 Tentative directe vers le dashboard d\'édition...');
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Vérifier où on est arrivé
        const directAccessCheck = await page.evaluate(() => {
            const title = document.title;
            const url = window.location.href;
            const homeAssistant = document.querySelector('home-assistant');
            
            return {
                title,
                url,
                hasHomeAssistant: !!homeAssistant,
                isEditMode: url.includes('/edit'),
                needsAuth: url.includes('authorize')
            };
        });
        
        console.log('📊 Résultat accès direct:');
        console.log(`   Titre: ${directAccessCheck.title}`);
        console.log(`   URL: ${directAccessCheck.url}`);
        console.log(`   Mode édition: ${directAccessCheck.isEditMode ? '✅' : '❌'}`);
        console.log(`   Home Assistant: ${directAccessCheck.hasHomeAssistant ? '✅' : '❌'}`);
        console.log(`   Auth requis: ${directAccessCheck.needsAuth ? '⚠️' : '✅'}`);
        
        if (directAccessCheck.hasHomeAssistant && directAccessCheck.isEditMode) {
            console.log('🎉 ACCÈS DIRECT AU DASHBOARD D\'ÉDITION !');
            await page.screenshot({ path: 'tests-reports/simple-1-direct-edit-access.png', fullPage: true });
            
            // Étape 2: Test de ha-room
            console.log('📍 Étape 2: Test de ha-room...');
            
            // Vérifier si ha-room est installé
            const haRoomCheck = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                const haRoomScript = scripts.find(s => 
                    s.src.includes('ha-room') || s.src.includes('hacsfiles')
                );
                
                return {
                    haRoomFound: !!haRoomScript,
                    scriptUrl: haRoomScript ? haRoomScript.src : null
                };
            });
            
            console.log(`🔍 ha-room installé: ${haRoomCheck.haRoomFound ? '✅' : '❌'}`);
            
            if (haRoomCheck.haRoomFound) {
                console.log(`   URL: ${haRoomCheck.scriptUrl}`);
            }
            
            await page.screenshot({ path: 'tests-reports/simple-2-ha-room-check.png', fullPage: true });
            
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
                
                await page.screenshot({ path: 'tests-reports/simple-3-add-card.png', fullPage: true });
                
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
                    
                    await page.screenshot({ path: 'tests-reports/simple-4-ha-room-selected.png', fullPage: true });
                    console.log('✅ Sélection ha-room réussie');
                    
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
                                hasIconField: Array.from(inputs).some(input => 
                                    input.name === 'icon' || input.placeholder?.toLowerCase().includes('icon')
                                ),
                                editorHTML: editor.innerHTML.substring(0, 500)
                            };
                        }
                        return { editorFound: false };
                    });
                    
                    if (editorAnalysis.editorFound) {
                        console.log('📝 Éditeur ha-room trouvé:');
                        console.log(`   Champs: ${editorAnalysis.inputCount}`);
                        console.log(`   Boutons: ${editorAnalysis.buttonCount}`);
                        console.log(`   Champ nom: ${editorAnalysis.hasNameField ? '✅' : '❌'}`);
                        console.log(`   Champ entité: ${editorAnalysis.hasEntityField ? '✅' : '❌'}`);
                        console.log(`   Champ icône: ${editorAnalysis.hasIconField ? '✅' : '❌'}`);
                        
                        await page.screenshot({ path: 'tests-reports/simple-5-editor-analysis.png', fullPage: true });
                        
                        // Test de configuration
                        if (editorAnalysis.hasNameField && editorAnalysis.hasEntityField) {
                            console.log('🧪 Test de configuration...');
                            
                            // Remplir les champs de test
                            const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
                            if (nameInput) {
                                await nameInput.click();
                                await nameInput.type('Test HA Room Final');
                                console.log('✅ Nom défini');
                            }
                            
                            const entityInput = await page.$('input[name="entity"], input[placeholder*="entity"]');
                            if (entityInput) {
                                await entityInput.click();
                                await entityInput.type('sun.sun');
                                console.log('✅ Entité définie');
                            }
                            
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            await page.screenshot({ path: 'tests-reports/simple-6-configured.png', fullPage: true });
                            
                            // Sauvegarder
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
                        })).slice(0, 15);
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
            await page.screenshot({ path: 'tests-reports/simple-7-final-dashboard.png', fullPage: true });
            
            console.log('✅ Test terminé !');
            
        } else {
            console.log('❌ Accès direct au dashboard d\'édition échoué');
            
            // Étape 2: Essayer la connexion normale puis rediriger
            console.log('🔄 Tentative de connexion normale...');
            
            await page.goto('http://homeassistant.local:8123/', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
            
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            // Si on arrive sur la page de login, faire la connexion
            const loginCheck = await page.evaluate(() => {
                const usernameInput = document.querySelector('input[name="username"]');
                const passwordInput = document.querySelector('input[name="password"]');
                
                return {
                    hasLoginForm: !!(usernameInput && passwordInput)
                };
            });
            
            if (loginCheck.hasLoginForm) {
                console.log('🔐 Page de login détectée - Connexion...');
                
                await page.type('input[name="username"]', 'dev');
                await page.type('input[name="password"]', 'Dev@2017!');
                
                await page.screenshot({ path: 'tests-reports/simple-8-login-form.png', fullPage: true });
                
                const submitButton = await page.$('button');
                if (submitButton) {
                    await submitButton.click();
                    console.log('✅ Connexion soumise');
                }
                
                // Attendre la connexion
                await new Promise(resolve => setTimeout(resolve, 8000));
                
                // Vérifier la connexion
                const afterLogin = await page.evaluate(() => {
                    const homeAssistant = document.querySelector('home-assistant');
                    const title = document.title;
                    
                    return {
                        hasHomeAssistant: !!homeAssistant,
                        title: title
                    };
                });
                
                if (afterLogin.hasHomeAssistant) {
                    console.log('🎉 CONNEXION RÉUSSIE !');
                    await page.screenshot({ path: 'tests-reports/simple-9-login-success.png', fullPage: true });
                    
                    // Maintenant aller au dashboard d'édition
                    console.log('🏠 Navigation vers le dashboard d\'édition...');
                    await page.goto('http://homeassistant.local:8123/lovelace/edit', {
                        waitUntil: 'networkidle2',
                        timeout: 30000
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    // Continuer avec le test ha-room
                    console.log('➕ Continuation du test ha-room...');
                    
                    // Répéter le processus d'ajout de carte
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
                        
                        await page.screenshot({ path: 'tests-reports/simple-10-continue-test.png', fullPage: true });
                        console.log('✅ Test ha-room en cours...');
                        
                        // Ici le test peut continuer...
                        return true;
                    }
                }
            } else {
                console.log('❌ Connexion échouée');
            }
        }
        
        console.log('✅ Test simple terminé !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

simpleHARoomTest();