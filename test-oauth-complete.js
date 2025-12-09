import puppeteer from 'puppeteer';

async function testOAuthFlow() {
    console.log('🔐 Test du flux OAuth complet...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Navigation initiale et analyse
        console.log('📍 Étape 1: Navigation vers Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Analyser la page initiale
        const initialAnalysis = await page.evaluate(() => {
            const title = document.title;
            const url = window.location.href;
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            
            return {
                title,
                url,
                hasLoginForm: !!(usernameInput && passwordInput),
                needsOAuth: url.includes('authorize')
            };
        });
        
        console.log('📊 Analyse initiale:');
        console.log(`   Titre: ${initialAnalysis.title}`);
        console.log(`   URL: ${initialAnalysis.url}`);
        console.log(`   Formulaire login: ${initialAnalysis.hasLoginForm ? '✅' : '❌'}`);
        console.log(`   OAuth requis: ${initialAnalysis.needsOAuth ? '⚠️' : '✅'}`);
        
        if (initialAnalysis.needsOAuth) {
            console.log('🔐 Page OAuth détectée - Analyse des options...');
            await page.screenshot({ path: 'tests-reports/oauth-1-authorization-page.png', fullPage: true });
            
            // Analyser la page OAuth pour voir les options
            const oauthAnalysis = await page.evaluate(() => {
                const title = document.title;
                const bodyText = document.body.innerText;
                const inputs = Array.from(document.querySelectorAll('input'));
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                const links = Array.from(document.querySelectorAll('a'));
                
                // Chercher des informations spécifiques
                const hasCodeInput = inputs.some(input => 
                    input.type === 'text' || input.placeholder?.toLowerCase().includes('code')
                );
                const hasCancelButton = buttons.some(btn => {
                    const text = btn.textContent || btn.innerText || '';
                    return text.toLowerCase().includes('cancel') || text.toLowerCase().includes('annuler');
                });
                const hasInfoText = bodyText.toLowerCase().includes('code') || 
                                   bodyText.toLowerCase().includes('authorization') ||
                                   bodyText.toLowerCase().includes('autorisation');
                
                return {
                    title,
                    inputCount: inputs.length,
                    buttonCount: buttons.length,
                    linkCount: links.length,
                    hasCodeInput,
                    hasCancelButton,
                    hasInfoText,
                    bodyText: bodyText.substring(0, 1000)
                };
            });
            
            console.log('📋 Page OAuth:');
            console.log(`   Inputs: ${oauthAnalysis.inputCount}`);
            console.log(`   Boutons: ${oauthAnalysis.buttonCount}`);
            console.log(`   Liens: ${oauthAnalysis.linkCount}`);
            console.log(`   Champ code: ${oauthAnalysis.hasCodeInput ? '✅' : '❌'}`);
            console.log(`   Bouton annuler: ${oauthAnalysis.hasCancelButton ? '✅' : '❌'}`);
            console.log(`   Texte informatif: ${oauthAnalysis.hasInfoText ? '✅' : '❌'}`);
            
            await page.screenshot({ path: 'tests-reports/oauth-2-options-analysis.png', fullPage: true });
            
            // Si on peut annuler, on essaie de retourner au login normal
            if (oauthAnalysis.hasCancelButton) {
                console.log('🔄 Tentative d\'annulation OAuth...');
                
                const cancelButton = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
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
                    await new Promise(resolve => setTimeout(resolve, 3000));
                }
            }
            
            // Attendre et réanalyser
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // Étape 2: Si on a un formulaire de login normal
        const currentUrl = page.url();
        
        if (!currentUrl.includes('authorize')) {
            console.log('🔐 Étape 2: Formulaire de login détecté...');
            
            await page.screenshot({ path: 'tests-reports/oauth-3-normal-login.png', fullPage: true });
            
            // Demander les informations avant de continuer
            console.log('❓ Le formulaire demande-t-il des informations spécifiques ?');
            console.log('💡 Options possibles:');
            console.log('   1. Code d\'autorisation 2FA');
            console.log('   2. Mot de passe d\'application');
            console.log('   3. Captcha');
            console.log('   4. Confirmation email');
            
            // Analyser le formulaire pour voir ce qu'il demande exactement
            const formAnalysis = await page.evaluate(() => {
                const inputs = Array.from(document.querySelectorAll('input'));
                const labels = Array.from(document.querySelectorAll('label, .form-label, [for]'));
                const placeholders = Array.from(document.querySelectorAll('input[placeholder]'));
                
                const inputDetails = inputs.map(input => ({
                    name: input.name || '',
                    type: input.type || '',
                    placeholder: input.placeholder || '',
                    id: input.id || '',
                    required: input.required || false,
                    autocomplete: input.autocomplete || ''
                }));
                
                const labelTexts = labels.map(label => label.textContent || label.innerText || '');
                const placeholderTexts = placeholders.map(p => p.placeholder || '');
                
                return {
                    inputCount: inputs.length,
                    inputDetails,
                    labelTexts,
                    placeholderTexts,
                    bodyText: document.body.innerText.substring(0, 800)
                };
            });
            
            console.log('📝 Analyse du formulaire:');
            console.log(`   Nombre d\'inputs: ${formAnalysis.inputCount}`);
            formAnalysis.inputDetails.forEach((input, index) => {
                console.log(`   Input ${index + 1}: ${input.name} (${input.type}) - ${input.placeholder}`);
            });
            
            await page.screenshot({ path: 'tests-reports/oauth-4-form-analysis.png', fullPage: true });
            
            // Si le formulaire semble normal, essayer la connexion
            if (formAnalysis.inputCount >= 2) {
                console.log('🚀 Tentative de connexion avec identifiants standards...');
                
                await page.type('input[name="username"]', 'dev');
                await page.type('input[name="password"]', 'Dev@2017!');
                
                await page.screenshot({ path: 'tests-reports/oauth-5-credentials-entered.png', fullPage: true });
                
                const submitButton = await page.$('button');
                if (submitButton) {
                    await submitButton.click();
                    console.log('✅ Connexion soumise');
                }
                
                // Attendre la réponse (plus longtemps pour gérer OAuth)
                console.log('⏳ Attente de la réponse (15s max)...');
                
                for (let i = 0; i < 15; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const checkProgress = await page.evaluate(() => {
                        const url = window.location.href;
                        const title = document.title;
                        const usernameInput = document.querySelector('input[name="username"]');
                        const homeAssistant = document.querySelector('home-assistant');
                        
                        return {
                            url,
                            title,
                            stillOnLogin: !!usernameInput,
                            hasHomeAssistant: !!homeAssistant,
                            hasOAuth: url.includes('authorize')
                        };
                    });
                    
                    console.log(`   ${i + 1}s: URL=${checkProgress.url.substring(0, 50)}...`);
                    
                    // Si on arrive sur une page OAuth
                    if (checkProgress.hasOAuth && !checkProgress.stillOnLogin) {
                        console.log('🔐 Redirection OAuth détectée !');
                        await page.screenshot({ path: 'tests-reports/oauth-6-oauth-redirect.png', fullPage: true });
                        
                        // Analyser la nouvelle page OAuth
                        const newOauthAnalysis = await page.evaluate(() => {
                            const bodyText = document.body.innerText;
                            const inputs = Array.from(document.querySelectorAll('input'));
                            const buttons = Array.from(document.querySelectorAll('button'));
                            
                            return {
                                bodyText: bodyText.substring(0, 1000),
                                inputCount: inputs.length,
                                buttonCount: buttons.length,
                                hasCodeInput: inputs.some(input => input.type === 'text'),
                                title: document.title
                            };
                        });
                        
                        console.log('📋 Nouvelle page OAuth:');
                        console.log(`   Titre: ${newOauthAnalysis.title}`);
                        console.log(`   Inputs: ${newOauthAnalysis.inputCount}`);
                        console.log(`   Champ code: ${newOauthAnalysis.hasCodeInput ? '✅' : '❌'}`);
                        
                        await page.screenshot({ path: 'tests-reports/oauth-7-oauth-analysis.png', fullPage: true });
                        
                        // Si on a un champ de code, on demande quoi faire
                        if (newOauthAnalysis.hasCodeInput) {
                            console.log('❓ La page demande un code d\'autorisation');
                            console.log('💡 Étapes requises:');
                            console.log('   1. Ouvrir l\'application GitHub mobile');
                            console.log('   2. Se connecter avec les identifiants GitHub');
                            console.log('   3. Générer un code d\'autorisation');
                            console.log('   4. Saisir le code ici');
                            console.log('   5. Valider l\'autorisation');
                            
                            // Attendre l'intervention manuelle
                            console.log('⏸ En attente d\'intervention manuelle...');
                            await page.screenshot({ path: 'tests-reports/oauth-8-waiting-manual.png', fullPage: true });
                            
                            // Pour le test, on va attendre un peu
                            await new Promise(resolve => setTimeout(resolve, 10000));
                            
                            break;
                        }
                    }
                    
                    // Si la connexion réussie
                    if (!checkProgress.stillOnLogin && checkProgress.hasHomeAssistant) {
                        console.log('🎉 CONNEXION RÉUSSIE !');
                        await page.screenshot({ path: 'tests-reports/oauth-9-success.png', fullPage: true });
                        
                        // Maintenant tester ha-room
                        console.log('🏠 Test de ha-room...');
                        
                        const haRoomTest = await testHARoomOnPage(page);
                        
                        if (haRoomTest.success) {
                            console.log('✅ Tests ha-room terminés avec succès !');
                        } else {
                            console.log('⚠️ Tests ha-room terminés avec avertissements');
                        }
                        
                        break;
                    }
                    
                    // Si on est toujours sur login après 15s, échec
                    if (i === 14 && checkProgress.stillOnLogin) {
                        console.log('❌ Échec de connexion après 15s');
                        await page.screenshot({ path: 'tests-reports/oauth-10-timeout.png', fullPage: true });
                        break;
                    }
                }
            }
        }
        
        console.log('✅ Test OAuth terminé !');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Fonction pour tester ha-room sur une page
async function testHARoomOnPage(page) {
    try {
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
        
        console.log(`🔍 ha-room script trouvé: ${haRoomCheck.haRoomFound}`);
        
        if (haRoomCheck.haRoomFound) {
            console.log(`   URL: ${haRoomCheck.scriptUrl}`);
        }
        
        // Aller en mode édition pour tester l'éditeur
        await page.goto('http://homeassistant.local:8123/lovelace/edit', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Ajouter une carte ha-room
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
                console.log('✅ Carte ha-room trouvée dans le sélecteur !');
                await page.evaluate((card) => card.click(), haRoomCard);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'tests-reports/oauth-11-ha-room-editor.png', fullPage: true });
                
                // Analyser l'éditeur
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
                            )
                        };
                    }
                    return { editorFound: false };
                });
                
                if (editorAnalysis.editorFound) {
                    console.log('📝 Éditeur ha-room trouvé:');
                    console.log(`   Champs: ${editorAnalysis.inputCount}`);
                    console.log(`   Champ nom: ${editorAnalysis.hasNameField ? '✅' : '❌'}`);
                    console.log(`   Champ entité: ${editorAnalysis.hasEntityField ? '✅' : '❌'}`);
                    
                    return {
                        success: true,
                        editorAccessible: editorAnalysis.editorFound,
                        hasRequiredFields: editorAnalysis.hasNameField && editorAnalysis.hasEntityField
                    };
                } else {
                    return {
                        success: false,
                        reason: 'Éditeur non trouvé'
                    };
                }
            } else {
                return {
                    success: false,
                    reason: 'Carte ha-room non trouvée dans le sélecteur'
                };
            }
        } else {
            return {
                success: false,
                reason: 'Bouton d\'ajout de carte non trouvé'
            };
        }
        
    } catch (error) {
        return {
            success: false,
            reason: `Erreur: ${error.message}`
        };
    }
}

testOAuthFlow();