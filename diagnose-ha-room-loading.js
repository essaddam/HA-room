import puppeteer from 'puppeteer';

async function diagnoseHARoomLoading() {
    console.log('🔍 Diagnostic du problème de carte ha-room qui tourne...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Connexion directe au dashboard d'édition
        console.log('📍 Navigation directe vers le dashboard d\'édition...');
        await page.goto('http://homeassistant.local:8123/dashboard-invite/0?edit=1', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Analyser l'état actuel
        console.log('🔍 Analyse de l\'état actuel du dashboard...');
        
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
            
            // Chercher les erreurs JavaScript
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
            
            // Vérifier la console
            const consoleErrors = [];
            try {
                const originalLog = console.error;
                console.error = function(...args) {
                    consoleErrors.push(args.join(' '));
                    return originalLog.apply(console, args);
                };
            } catch (e) {}
            
            return {
                title,
                url,
                loadingCardsCount: loadingCards.length,
                haRoomCardsCount: haRoomCards.length,
                errorElementsCount: errorElements.length,
                consoleErrorsCount: consoleErrors.length,
                bodyText: document.body.innerText.substring(0, 1000)
            };
        });
        
        console.log('📊 Analyse du dashboard:');
        console.log(`   Titre: ${dashboardAnalysis.title}`);
        console.log(`   URL: ${dashboardAnalysis.url}`);
        console.log(`   Cartes en chargement: ${dashboardAnalysis.loadingCardsCount}`);
        console.log(`   Cartes ha-room trouvées: ${dashboardAnalysis.haRoomCardsCount}`);
        console.log(`   Éléments d\'erreur: ${dashboardAnalysis.errorElementsCount}`);
        console.log(`   Erreurs console: ${dashboardAnalysis.consoleErrorsCount}`);
        
        await page.screenshot({ path: 'tests-reports/loading-1-dashboard-analysis.png', fullPage: true });
        
        // Si on a des cartes qui tournent, analyser plus
        if (dashboardAnalysis.loadingCardsCount > 0) {
            console.log('🔄 Cartes en chargement détectées - Analyse approfondie...');
            
            // Prendre un screenshot zoomé sur une carte qui tourne
            const loadingCardScreenshot = await page.evaluate(() => {
                const loadingCard = document.querySelector('*[class*="loading"], *:not([class*="loading"])');
                if (loadingCard) {
                    // Zoomer sur cette carte
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
                
                await page.screenshot({ path: 'tests-reports/loading-2-card-closeup.png', fullPage: true });
            }
            
            // Analyser les erreurs JavaScript
            if (dashboardAnalysis.errorElementsCount > 0) {
                console.log('⚠️ Éléments d\'erreur détectés:');
                
                const errorDetails = await page.evaluate(() => {
                    const errors = Array.from(document.querySelectorAll('*')).filter(el => {
                        const text = el.textContent || el.innerText || '';
                        const classList = el.className || '';
                        
                        return (
                            text.toLowerCase().includes('error') ||
                            text.toLowerCase().includes('erreur') ||
                            text.toLowerCase().includes('failed') ||
                            text.toLowerCase().includes('échec') ||
                            classList.toLowerCase().includes('error')
                        );
                    });
                    
                    return errors.map((error, index) => ({
                        index: index + 1,
                        tagName: error.tagName,
                        className: error.className,
                        text: (error.textContent || error.innerText || '').substring(0, 150)
                    }));
                });
                
                errorDetails.forEach(error => {
                    console.log(`   ${error.index}. ${error.tagName} (${error.className}): ${error.text}`);
                });
                
                await page.screenshot({ path: 'tests-reports/loading-3-errors.png', fullPage: true });
            }
            
            // Vérifier les ressources ha-room
            console.log('🔍 Vérification des ressources ha-room...');
            
            const resourceCheck = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                const haRoomScript = scripts.find(s => s.src.includes('ha-room'));
                
                const links = Array.from(document.querySelectorAll('link[href]'));
                const haRoomLink = links.find(l => l.href.includes('ha-room'));
                
                return {
                    haRoomScriptFound: !!haRoomScript,
                    haRoomScriptUrl: haRoomScript ? haRoomScript.src : null,
                    haRoomLinkFound: !!haRoomLink,
                    haRoomLinkUrl: haRoomLink ? haRoomLink.href : null,
                    totalScripts: scripts.length,
                    totalLinks: links.length
                };
            });
            
            console.log('📋 Vérification des ressources:');
            console.log(`   Script ha-room: ${resourceCheck.haRoomScriptFound ? '✅' : '❌'}`);
            console.log(`   Link ha-room: ${resourceCheck.haRoomLinkFound ? '✅' : '❌'}`);
            
            if (resourceCheck.haRoomScriptFound) {
                console.log(`   URL script: ${resourceCheck.haRoomScriptUrl}`);
            }
            
            if (resourceCheck.haRoomLinkFound) {
                console.log(`   URL link: ${resourceCheck.haRoomLinkUrl}`);
            }
            
            await page.screenshot({ path: 'tests-reports/loading-4-resources.png', fullPage: true });
            
            // Essayer d'ajouter une carte ha-room pour voir l'erreur exacte
            console.log('🧪 Tentative d\'ajout d\'une carte ha-room...');
            
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
                
                await page.screenshot({ path: 'tests-reports/loading-5-add-card.png', fullPage: true });
                
                // Analyser le sélecteur
                const cardSelectorAnalysis = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                    const haRoomCard = cards.find(card => {
                        const text = card.textContent || card.innerText || '';
                        return text.toLowerCase().includes('ha-room') || (text.toLowerCase().includes('room') && !text.toLowerCase().includes('weather'));
                    });
                    
                    return {
                        totalCards: cards.length,
                        haRoomFound: !!haRoomCard,
                        haRoomCardText: haRoomCard ? (haRoomCard.textContent || haRoomCard.innerText || '') : null
                    };
                });
                
                console.log('📊 Sélecteur de cartes:');
                console.log(`   Total cartes: ${cardSelectorAnalysis.totalCards}`);
                console.log(`   ha-room trouvé: ${cardSelectorAnalysis.haRoomFound ? '✅' : '❌'}`);
                
                if (cardSelectorAnalysis.haRoomFound) {
                    console.log(`   Texte ha-room: ${cardSelectorAnalysis.haRoomCardText}`);
                    
                    // Cliquer sur ha-room
                    await page.evaluate(() => {
                        const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                        const haRoomCard = cards.find(card => {
                            const text = card.textContent || card.innerText || '';
                            return text.toLowerCase().includes('ha-room') || (text.toLowerCase().includes('room') && !text.toLowerCase().includes('weather'));
                        });
                        
                        if (haRoomCard) {
                            haRoomCard.click();
                        }
                    });
                    
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    await page.screenshot({ path: 'tests-reports/loading-6-ha-room-selected.png', fullPage: true });
                    
                    // Analyser l'éditeur qui s'ouvre
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
                        
                        if (editorAnalysis.errorCount > 0) {
                            console.log('⚠️ Erreurs dans l\'éditeur:');
                            editorAnalysis.errorElements.forEach((error, index) => {
                                console.log(`   ${index + 1}. ${error.tagName}: ${error.text}`);
                            });
                        }
                        
                        await page.screenshot({ path: 'tests-reports/loading-7-editor-errors.png', fullPage: true });
                    } else {
                        console.log('✅ Éditeur ha-room ouvert sans erreur!');
                        await page.screenshot({ path: 'tests-reports/loading-8-editor-success.png', fullPage: true });
                    }
                } else {
                    console.log('❌ ha-room non trouvé dans le sélecteur');
                }
            } else {
                console.log('❌ Bouton d\'ajout de carte non trouvé');
            }
        }
        
        console.log('✅ Diagnostic terminé !');
        
    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

diagnoseHARoomLoading();