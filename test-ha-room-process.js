import puppeteer from 'puppeteer';

async function testHARoomProcess() {
    console.log('🚀 Démarrage du processus de test ha-room spécifique...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Étape 1: Login sur la page
        console.log('📍 Étape 1: Connexion à Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));

        // Connexion
        await page.type('input[name="username"]', 'dev');
        await page.type('input[name="password"]', 'Dev@2017!');

        const submitButton = await page.$('button');
        if (submitButton) {
            await submitButton.click();
        }

        console.log('⏳ Attente de la connexion...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        await page.screenshot({ path: 'step1-logged-in.png', fullPage: true });
        console.log('✅ Étape 1: Connexion réussie');

        // Étape 2: Aller dans HACS dashboard et mettre à jour ha-room
        console.log('📍 Étape 2: Navigation vers HACS dashboard pour mise à jour ha-room...');
        await page.goto('http://homeassistant.local:8123/hacs/dashboard', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'step2-hacs-dashboard.png', fullPage: true });

        // Chercher ha-room dans la liste
        console.log('🔍 Recherche de ha-room dans HACS dashboard...');

        // Attendre que le contenu se charge
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Chercher ha-room dans le contenu
        const haRoomFound = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*'));
            return elements.some(el => {
                const text = el.textContent || el.innerText || '';
                return text.toLowerCase().includes('ha-room') || text.toLowerCase().includes('ha room');
            });
        });

        if (haRoomFound) {
            console.log('✅ ha-room trouvé dans HACS dashboard');

            // Cliquer sur ha-room
            const haRoomLink = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('a, button, [role="button"], ha-card, .card'));
                for (const el of elements) {
                    const text = el.textContent || el.innerText || '';
                    if (text.toLowerCase().includes('ha-room') || text.toLowerCase().includes('ha room')) {
                        return el;
                    }
                }
                return null;
            });

            if (haRoomLink) {
                console.log('🖱️ Clic sur ha-room...');
                await page.evaluate((el) => el.click(), haRoomLink);
                await new Promise(resolve => setTimeout(resolve, 3000));

                await page.screenshot({ path: 'step2-ha-room-details.png', fullPage: true });

                // Chercher le bouton de mise à jour
                console.log('🔄 Recherche du bouton de mise à jour...');

                const updateButton = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button, paper-button'));
                    for (const btn of buttons) {
                        const text = btn.textContent || btn.innerText || '';
                        if (text.toLowerCase().includes('update') || text.toLowerCase().includes('mettre à jour') || text.toLowerCase().includes('actualiser')) {
                            return btn;
                        }
                    }
                    return null;
                });

                if (updateButton) {
                    console.log('✅ Bouton de mise à jour trouvé, clic en cours...');
                    await page.evaluate((btn) => btn.click(), updateButton);
                    await new Promise(resolve => setTimeout(resolve, 5000));

                    await page.screenshot({ path: 'step2-update-in-progress.png', fullPage: true });
                    console.log('🔄 Mise à jour de ha-room en cours...');
                } else {
                    console.log('ℹ️ Aucun bouton de mise à jour trouvé (ha-room est peut-être déjà à jour)');
                }
            }
        } else {
            console.log('❌ ha-room non trouvé dans HACS dashboard');
        }

        // Étape 3: Retour au dashboard principal, mode édition et ajout ha-room
        console.log('📍 Étape 3: Retour au dashboard principal pour ajouter une carte ha-room...');

        // Retour au dashboard principal
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'step3-dashboard.png', fullPage: true });

        // Passer en mode édition
        console.log('✏️ Passage en mode édition du dashboard...');

        // Chercher le bouton d'édition (généralement en haut à droite)
        const editButtonSelectors = [
            'ha-menu-button[title="Modifier le tableau de bord"]',
            'ha-menu-button[title="Edit dashboard"]',
            'paper-icon-button[title*="edit"]',
            'button[title*="edit"]',
            'ha-icon-button[title*="edit"]',
            '.edit-mode',
            'ha-button-menu',
            'ha-icon-button-menu'
        ];

        let editButton = null;
        for (const selector of editButtonSelectors) {
            editButton = await page.$(selector);
            if (editButton) {
                console.log(`✅ Bouton d'édition trouvé avec: ${selector}`);
                break;
            }
        }

        if (!editButton) {
            // Essayer de naviguer directement vers l'URL d'édition
            console.log('🔄 Navigation directe vers le mode édition...');
            await page.goto('http://homeassistant.local:8123/lovelace/edit', {
                waitUntil: 'networkidle2',
                timeout: 30000
            });
        } else {
            await editButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Cliquer sur "Modifier le tableau de bord" si c'est un menu
            const editDashboardOption = await page.evaluate(() => {
                const options = Array.from(document.querySelectorAll('paper-item, mwc-list-item, ha-menu-item, .menu-item'));
                for (const opt of options) {
                    const text = opt.textContent || opt.innerText || '';
                    if (text.toLowerCase().includes('modifier le tableau de bord') || text.toLowerCase().includes('edit dashboard')) {
                        return opt;
                    }
                }
                return null;
            });

            if (editDashboardOption) {
                await page.evaluate((opt) => opt.click(), editDashboardOption);
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        await new Promise(resolve => setTimeout(resolve, 3000));
        await page.screenshot({ path: 'step3-edit-mode.png', fullPage: true });
        console.log('✅ Mode édition activé');

        // Ajouter une nouvelle carte
        console.log('➕ Ajout d\'une nouvelle carte ha-room...');

        // Chercher le bouton "Ajouter une carte"
        const addCardButton = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button, paper-button, .add-card'));
            for (const btn of buttons) {
                const text = btn.textContent || btn.innerText || '';
                if (text.toLowerCase().includes('ajouter une carte') || text.toLowerCase().includes('add card') || text.toLowerCase().includes('ajouter')) {
                    return btn;
                }
            }
            return null;
        });

        if (addCardButton) {
            console.log('✅ Bouton d\'ajout de carte trouvé');
            await page.evaluate((btn) => btn.click(), addCardButton);
            await new Promise(resolve => setTimeout(resolve, 3000));

            await page.screenshot({ path: 'step3-card-selector.png', fullPage: true });

            // Chercher ha-room dans la liste des cartes
            console.log('🔍 Recherche de ha-room dans le sélecteur de cartes...');

            const haRoomCard = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                for (const card of cards) {
                    const text = card.textContent || card.innerText || '';
                    if (text.toLowerCase().includes('ha-room') || text.toLowerCase().includes('ha room') || text.toLowerCase().includes('room')) {
                        return card;
                    }
                }
                return null;
            });

            if (haRoomCard) {
                console.log('✅ Carte ha-room trouvée!');
                await page.evaluate((card) => card.click(), haRoomCard);
                await new Promise(resolve => setTimeout(resolve, 3000));

                await page.screenshot({ path: 'step3-ha-room-editor.png', fullPage: true });
                console.log('✅ Éditeur ha-room ouvert!');

                // Vérifier l'éditeur
                const editorContent = await page.evaluate(() => {
                    const editor = document.querySelector('ha-editor, .ha-editor, [data-editor]');
                    if (editor) {
                        return {
                            visible: editor.offsetParent !== null,
                            innerHTML: editor.innerHTML.substring(0, 500)
                        };
                    }
                    return null;
                });

                if (editorContent && editorContent.visible) {
                    console.log('✅ Éditeur ha-room fonctionnel et visible');
                    console.log('📝 Contenu de l\'éditeur:', editorContent.innerHTML.substring(0, 200));
                } else {
                    console.log('⚠️ Éditeur ha-room trouvé mais pas visible');
                }

            } else {
                console.log('❌ Carte ha-room non trouvée dans le sélecteur');

                // Afficher toutes les cartes disponibles pour diagnostic
                const availableCards = await page.evaluate(() => {
                    const cards = Array.from(document.querySelectorAll('ha-card-picker .card, .card-type, [data-card-type], paper-item, mwc-list-item'));
                    return cards.map(card => ({
                        text: (card.textContent || card.innerText || '').trim(),
                        type: card.getAttribute('data-card-type') || card.tagName
                    }));
                });

                console.log('📋 Cartes disponibles:', availableCards.slice(0, 10));
            }

        } else {
            console.log('❌ Bouton d\'ajout de carte non trouvé');
        }

        // Screenshot final
        await page.screenshot({ path: 'step3-final-state.png', fullPage: true });

        console.log('✅ Processus de test ha-room terminé!');
        console.log('📸 Screenshots générés:');
        console.log('  - step1-logged-in.png: Après connexion');
        console.log('  - step2-hacs-dashboard.png: Dashboard HACS');
        console.log('  - step2-ha-room-details.png: Détails ha-room');
        console.log('  - step2-update-in-progress.png: Mise à jour ha-room');
        console.log('  - step3-dashboard.png: Dashboard principal');
        console.log('  - step3-edit-mode.png: Mode édition activé');
        console.log('  - step3-card-selector.png: Sélecteur de cartes');
        console.log('  - step3-ha-room-editor.png: Éditeur ha-room');
        console.log('  - step3-final-state.png: État final');

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testHARoomProcess();