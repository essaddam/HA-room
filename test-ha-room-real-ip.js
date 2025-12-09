import puppeteer from 'puppeteer';

async function testHARoomWithRealIP() {
    console.log('🚀 Test ha-room avec IP réelle...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Étape 1: Accès direct au dashboard d'édition avec IP réelle
        console.log('📍 Étape 1: Accès au dashboard d\'édition...');
        await page.goto('http://192.168.177.19:8123/dashboard-invite/0?edit=1', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Analyser l'état actuel
        console.log('🔍 Analyse de l\'état du dashboard...');
        
        const dashboardAnalysis = await page.evaluate(() => {
            const title = document.title;
            const url = window.location.href;
            
            // Chercher les cartes qui tournent (loading)
            const loadingCards = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent || el.innerText || '';
                const classList = el.className || '';
                const style = el.style || {};
                
                return (
                    text.toLowerCase().includes('loading') ||
                    text.toLowerCase().includes('chargement') ||
                    text.toLowerCase().includes('veuillez patienter') ||
                    classList.toLowerCase().includes('loading') ||
                    classList.toLowerCase().includes('spinner') ||
                    style.animation === 'running' ||
                    el.querySelector('.spinner, .loading, [class*="loading"]')
                );
            });
            
            // Chercher les cartes ha-room existantes
            const haRoomCards = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent || el.innerText || '';
                const classList = el.className || '';
                
                return (
                    text.toLowerCase().includes('ha-room') ||
                    classList.toLowerCase().includes('ha-room') ||
                    el.tagName.toLowerCase().includes('ha-room')
                );
            });
            
            // Vérifier si on est en mode édition
            const isEditMode = url.includes('edit=1') || url.includes('/edit');
            
            // Chercher les erreurs
            const errorElements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent || el.innerText || '';
                const classList = el.className || '';
                
                return (
                    text.toLowerCase().includes('error') ||
                    text.toLowerCase().includes('erreur') ||
                    text.toLowerCase().includes('failed') ||
                    text.toLowerCase().includes('échec') ||
                    classList.toLowerCase().includes('error') ||
                    el.tagName.toLowerCase() === 'ha-alert'
                );
            });
            
            return {
                title,
                url,
                isEditMode,
                loadingCardsCount: loadingCards.length,
                haRoomCardsCount: haRoomCards.length,
                errorElementsCount: errorElements.length,
                bodyText: document.body.innerText.substring(0, 800)
            };
        });
        
        console.log('📊 Analyse du dashboard:');
        console.log(`   Titre: ${dashboardAnalysis.title}`);
        console.log(`   URL: ${dashboardAnalysis.url}`);
        console.log(`   Mode édition: ${dashboardAnalysis.isEditMode ? '✅' : '❌'}`);
        console.log(`   Cartes en chargement: ${dashboardAnalysis.loadingCardsCount}`);
        console.log(`   Cartes ha-room trouvées: ${dashboardAnalysis.haRoomCardsCount}`);
        console.log(`   Éléments d\'erreur: ${dashboardAnalysis.errorElementsCount}`);
        
        await page.screenshot({ path: 'tests-reports/realip-1-dashboard-analysis.png', fullPage: true });
        
        // Si on a des cartes qui tournent, analyser
        if (dashboardAnalysis.loadingCardsCount > 0) {
            console.log('🔄 Cartes en chargement détectées - Analyse...');
            
            // Prendre un screenshot zoomé sur une carte qui tourne
            const loadingCardScreenshot = await page.evaluate(() => {
                const loadingCard = document.querySelector('*[class*="loading"], *:not([class*="loading"])');
                if (loadingCard) {
                    loadingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    return {
                        tagName: loadingCard.tagName,
                        className: loadingCard.className,
                        text: (loadingCard.textContent || loadingCard.innerText || '').substring(0, 200),
                        rect: loadingCard.getBoundingClientRect()
                    };
                }
                return null;
            });
            
            if (loadingCardScreenshot) {
                console.log('📸 Screenshot zoomé sur carte en chargement...');
                console.log(`   Élément: ${loadingCardScreenshot.tagName}`);
                console.log(`   Classe: ${loadingCardScreenshot.className}`);
                console.log(`   Texte: ${loadingCardScreenshot.text}`);
                
                await page.screenshot({ path: 'tests-reports/realip-2-loading-card.png', fullPage: true });
            }
        }
        
        // Étape 2: Ajouter une carte ha-room
        console.log('📍 Étape 2: Ajout d\'une carte ha-room...');
        
        // Chercher le bouton d'ajout de carte
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
            console.log('✅ Bouton d\'ajout de carte trouvé');
            await page.evaluate((btn) => btn.click(), addCardButton);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await page.screenshot({ path: 'tests-reports/realip-3-add-card.png', fullPage: true });
            
            // Chercher ha-room dans le sélecteur
            console.log('🔍 Recherche de ha-room dans le sélecteur...');
            
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
                
                await page.screenshot({ path: 'tests-reports/realip-4-ha-room-selected.png', fullPage: true });
                console.log('✅ Sélection ha-room réussie');
                
                // Analyser l'éditeur ha-room
                console.log('🔍 Analyse de l\'éditeur ha-room...');
                
                const editorAnalysis = await page.evaluate(() => {
                    const editor = document.querySelector('ha-editor, .ha-editor, [data-editor], .editor-form');
                    if (editor) {
                        const inputs = editor.querySelectorAll('input, select, ha-textfield, ha-form-field');
                        const buttons = editor.querySelectorAll('button, ha-button, mwc-button');
                        const errorElements = editor.querySelectorAll('[class*="error"], .error, ha-alert');
                        
                        return {
                            editorFound: true,
                            inputCount: inputs.length,
                            buttonCount: buttons.length,
                            errorCount: errorElements.length,
                            hasNameField: Array.from(inputs).some(input => 
                                input.name === 'name' || input.placeholder?.toLowerCase().includes('name')
                            ),
                            hasEntityField: Array.from(inputs).some(input => 
                                input.name === 'entity' || input.placeholder?.toLowerCase().includes('entity')
                            ),
                            hasIconField: Array.from(inputs).some(input => 
                                input.name === 'icon' || input.placeholder?.toLowerCase().includes('icon')
                            ),
                            editorHTML: editor.innerHTML.substring(0, 800),
                            errorElements: Array.from(errorElements).map(el => ({
                                tagName: el.tagName,
                                className: el.className,
                                text: (el.textContent || el.innerText || '').substring(0, 200)
                            }))
                        };
                    }
                    return { editorFound: false };
                });
                
                if (editorAnalysis.editorFound) {
                    console.log('📝 Éditeur ha-room trouvé:');
                    console.log(`   Champs: ${editorAnalysis.inputCount}`);
                    console.log(`   Boutons: ${editorAnalysis.buttonCount}`);
                    console.log(`   Erreurs: ${editorAnalysis.errorCount}`);
                    console.log(`   Champ nom: ${editorAnalysis.hasNameField ? '✅' : '❌'}`);
                    console.log(`   Champ entité: ${editorAnalysis.hasEntityField ? '✅' : '❌'}`);
                    console.log(`   Champ icône: ${editorAnalysis.hasIconField ? '✅' : '❌'}`);
                    
                    if (editorAnalysis.errorCount > 0) {
                        console.log('⚠️ Erreurs dans l\'éditeur:');
                        editorAnalysis.errorElements.forEach((error, index) => {
                            console.log(`   ${index + 1}. ${error.tagName}: ${error.text}`);
                        });
                    }
                    
                    await page.screenshot({ path: 'tests-reports/realip-5-editor-analysis.png', fullPage: true });
                    
                    // Test de configuration
                    if (editorAnalysis.hasNameField && editorAnalysis.hasEntityField) {
                        console.log('🧪 Test de configuration de l\'éditeur...');
                        
                        // Remplir les champs de test
                        const nameInput = await page.$('input[name="name"], input[placeholder*="name"]');
                        if (nameInput) {
                            await nameInput.click();
                            await nameInput.type('Test HA Room IP');
                            console.log('✅ Nom de la carte défini');
                        }
                        
                        const entityInput = await page.$('input[name="entity"], input[placeholder*="entity"]');
                        if (entityInput) {
                            await entityInput.click();
                            await entityInput.type('sun.sun');
                            console.log('✅ Entité de test définie');
                        }
                        
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        await page.screenshot({ path: 'tests-reports/realip-6-configured.png', fullPage: true });
                        
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
                            
                            await page.screenshot({ path: 'tests-reports/realip-7-saved.png', fullPage: true });
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
                
                await page.screenshot({ path: 'tests-reports/realip-8-available-cards.png', fullPage: true });
            }
        } else {
            console.log('❌ Bouton d\'ajout de carte non trouvé');
            
            // Analyser la page pour comprendre pourquoi
            const pageStructure = await page.evaluate(() => {
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                const divs = Array.from(document.querySelectorAll('div'));
                const sections = Array.from(document.querySelectorAll('section'));
                
                return {
                    buttonCount: buttons.length,
                    divCount: divs.length,
                    sectionCount: sections.length,
                    buttonTexts: buttons.map(btn => (btn.textContent || btn.innerText || '').trim()).slice(0, 5),
                    bodyText: document.body.innerText.substring(0, 500)
                };
            });
            
            console.log('📊 Structure de la page:');
            console.log(`   Boutons: ${pageStructure.buttonCount}`);
            console.log(`   Divs: ${pageStructure.divCount}`);
            console.log(`   Sections: ${pageStructure.sectionCount}`);
            console.log(`   Texte boutons: ${pageStructure.buttonTexts.join(', ')}`);
            
            await page.screenshot({ path: 'tests-reports/realip-9-page-structure.png', fullPage: true });
        }
        
        // Étape 3: Vérification finale
        console.log('📍 Étape 3: Vérification finale...');
        
        // Retourner au dashboard normal
        await page.goto('http://192.168.177.19:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Vérifier si ha-room est installé
        const finalCheck = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            const haRoomScript = scripts.find(s => s.src.includes('ha-room'));
            
            return {
                haRoomFound: !!haRoomScript,
                scriptUrl: haRoomScript ? haRoomScript.src : null,
                title: document.title,
                url: window.location.href
            };
        });
        
        console.log('📊 Vérification finale:');
        console.log(`   ha-room installé: ${finalCheck.haRoomFound ? '✅' : '❌'}`);
        console.log(`   Titre: ${finalCheck.title}`);
        console.log(`   URL: ${finalCheck.url}`);
        
        if (finalCheck.haRoomFound) {
            console.log(`   URL script: ${finalCheck.scriptUrl}`);
        }
        
        await page.screenshot({ path: 'tests-reports/realip-10-final-check.png', fullPage: true });
        
        console.log('✅ Test ha-room avec IP réelle terminé !');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHARoomWithRealIP();