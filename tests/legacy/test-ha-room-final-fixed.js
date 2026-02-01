import puppeteer from 'puppeteer';
import { TEST_CREDENTIALS } from './test-credentials.js';

async function testHARoomEditorFixed() {
    console.log('🚀 Test final de l\'éditeur ha-room installé...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Connexion
        console.log('📍 Connexion à Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await page.type('input[name="username"]', TEST_CREDENTIALS.username);
        await page.type('input[name="password"]', TEST_CREDENTIALS.password);
        
        const submitButton = await page.$('button');
        if (submitButton) {
            await submitButton.click();
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Vérifier que ha-room est bien installé
        console.log('🔍 Vérification de l\'installation de ha-room...');
        
        const pageAnalysis = await page.evaluate(() => {
            // Vérifier les scripts chargés
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const haRoomScript = scripts.find(s => 
                s.src.includes('ha-room') || s.src.includes('hacsfiles')
            );
            
            // Vérifier si ha-room est dans le DOM
            const haRoomElements = Array.from(document.querySelectorAll('*'));
            const hasHARoomElements = haRoomElements.some(el => {
                const text = el.textContent || el.innerText || '';
                return text.toLowerCase().includes('ha-room') && !text.toLowerCase().includes('script');
            });
            
            return {
                haRoomScriptFound: !!haRoomScript,
                haRoomScriptUrl: haRoomScript ? haRoomScript.src : null,
                hasHARoomElements: hasHARoomElements,
                totalScripts: scripts.length
            };
        });
        
        console.log('📊 Analyse de l\'installation:');
        console.log(`   Script ha-room trouvé: ${pageAnalysis.haRoomScriptFound}`);
        console.log(`   Éléments ha-room trouvés: ${pageAnalysis.hasHARoomElements}`);
        console.log(`   Total scripts: ${pageAnalysis.totalScripts}`);
        
        if (pageAnalysis.haRoomScriptFound) {
            console.log(`   URL du script: ${pageAnalysis.haRoomScriptUrl}`);
        }
        
        await page.screenshot({ path: 'tests-reports/final1-ha-room-installed.png', fullPage: true });
        
        // Test de l'éditeur ha-room
        console.log('✏️ Test de l\'éditeur ha-room...');
        
        // Aller en mode édition
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
            
            await page.screenshot({ path: 'tests-reports/final2-card-selector.png', fullPage: true });
            
            // Chercher ha-room dans le sélecteur
            console.log('🔍 Recherche de ha-room dans le sélecteur de cartes...');
            
            const haRoomCard = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item, ha-list-item'));
                for (const card of cards) {
                    const text = card.textContent || card.innerText || '';
                    if (text.toLowerCase().includes('ha-room') || (text.toLowerCase().includes('room') && !text.toLowerCase().includes('weather'))) {
                        return card;
                    }
                }
                return null;
            });
            
            if (haRoomCard) {
                console.log('✅ Carte ha-room trouvée!');
                await page.evaluate((card) => card.click(), haRoomCard);
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                await page.screenshot({ path: 'tests-reports/final3-ha-room-editor.png', fullPage: true });
                console.log('✅ Éditeur ha-room ouvert!');
                
                // Analyser l'éditeur
                const editorAnalysis = await page.evaluate(() => {
                    const editor = document.querySelector('ha-editor, .ha-editor, [data-editor], .editor-form, .card-editor');
                    if (editor) {
                        const inputs = editor.querySelectorAll('input, select, ha-textfield, ha-form-field, paper-input, paper-dropdown-menu');
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
                    console.log('📝 Analyse de l\'éditeur ha-room:');
                    console.log(`   Champs de saisie: ${editorAnalysis.inputCount}`);
                    console.log(`   Boutons: ${editorAnalysis.buttonCount}`);
                    console.log(`   Champ nom: ${editorAnalysis.hasNameField ? '✅' : '❌'}`);
                    console.log(`   Champ entité: ${editorAnalysis.hasEntityField ? '✅' : '❌'}`);
                    console.log(`   Champ icône: ${editorAnalysis.hasIconField ? '✅' : '❌'}`);
                    
                    await page.screenshot({ path: 'tests-reports/final4-editor-analysis.png', fullPage: true });
                    
                    // Tester la configuration
                    if (editorAnalysis.hasNameField && editorAnalysis.hasEntityField) {
                        console.log('🧪 Test de configuration de l\'éditeur...');
                        
                        // Remplir les champs de test
                        const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
                        if (nameInput) {
                            await nameInput.click();
                            await nameInput.type('Test HA Room');
                            console.log('✅ Nom de la carte défini');
                        }
                        
                        const entityInput = await page.$('input[name="entity"], input[placeholder*="entity"]');
                        if (entityInput) {
                            await entityInput.click();
                            await entityInput.type('sun.sun');
                            console.log('✅ Entité de test définie');
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await page.screenshot({ path: 'tests-reports/final5-configured.png', fullPage: true });
                        
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
                } else {
                    console.log('❌ Éditeur ha-room non trouvé ou incomplet');
                }
            } else {
                console.log('❌ Carte ha-room non trouvée dans le sélecteur');
                
                // Afficher toutes les cartes disponibles pour diagnostic
                const availableCards = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item, ha-list-item'));
                    return cards.map(card => ({
                        text: (card.textContent || card.innerText || '').trim(),
                        type: card.getAttribute('data-card-type') || card.tagName
                    })).slice(0, 15);
                });
                
                console.log('📋 Cartes disponibles dans le sélecteur:');
                availableCards.forEach((card, index) => {
                    console.log(`   ${index + 1}. ${card.text} (${card.type})`);
                });
            }
        } else {
            console.log('❌ Bouton d\'ajout de carte non trouvé');
        }
        
        // Vérification finale sur le dashboard
        console.log('📍 Vérification finale sur le dashboard...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'tests-reports/final6-dashboard.png', fullPage: true });
        
        console.log('✅ Test final terminé!');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHARoomEditorFixed();