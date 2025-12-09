import puppeteer from 'puppeteer';

async function completeLoginTest() {
    console.log('🔍 Test complet de connexion avec gestion d\'autorisation...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Navigation initiale
        console.log('📍 Navigation vers Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Gérer la page d'autorisation si elle apparaît
        const currentUrl = page.url();
        console.log(`🌐 URL actuelle: ${currentUrl}`);
        
        if (currentUrl.includes('authorize')) {
            console.log('🔐 Page d\'autorisation détectée, traitement nécessaire...');
            
            await page.screenshot({ path: 'tests-reports/auth-1-authorization-page.png', fullPage: true });
            
            // Attendre un peu pour voir si la page se charge complètement
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Analyser la page d'autorisation
            const authPage = await page.evaluate(() => {
                const title = document.title;
                const bodyText = document.body.innerText.substring(0, 1000);
                const buttons = Array.from(document.querySelectorAll('button, ha-button, mwc-button'));
                const inputs = Array.from(document.querySelectorAll('input'));
                
                return {
                    title,
                    bodyText,
                    buttonCount: buttons.length,
                    inputCount: inputs.length,
                    hasCodeInput: inputs.some(input => input.placeholder?.toLowerCase().includes('code')),
                    buttonsText: buttons.map(btn => btn.textContent || btn.innerText || '').slice(0, 3)
                };
            });
            
            console.log('📊 Page d\'autorisation:');
            console.log(`   Titre: ${authPage.title}`);
            console.log(`   Boutons: ${authPage.buttonCount}`);
            console.log(`   Inputs: ${authPage.inputCount}`);
            console.log(`   Champ code: ${authPage.hasCodeInput ? '✅' : '❌'}`);
            
            // Si c'est une page d'autorisation avec code, on peut avoir besoin de la compléter
            if (authPage.hasCodeInput) {
                console.log('⚠️ Page d\'autorisation avec code détectée');
                console.log('💡 Cette étape peut nécessiter une intervention manuelle');
                
                await page.screenshot({ path: 'tests-reports/auth-2-code-required.png', fullPage: true });
                
                // Pour le test, on va essayer de continuer sans code
                // ou retourner à la page principale
                console.log('🔄 Tentative de retour à la page principale...');
                await page.goto('http://homeassistant.local:8123/', {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });
                
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        // Maintenant vérifier où on est arrivé
        const finalUrl = page.url();
        console.log(`📍 URL finale: ${finalUrl}`);
        
        // Analyse de la page actuelle
        const pageAnalysis = await page.evaluate(() => {
            const title = document.title;
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            const homeAssistant = document.querySelector('home-assistant');
            const bodyText = document.body.innerText.substring(0, 500);
            
            return {
                title,
                url: window.location.href,
                hasLoginForm: !!(usernameInput && passwordInput),
                hasHomeAssistant: !!homeAssistant,
                bodyText
            };
        });
        
        console.log('📊 Analyse finale:');
        console.log(`   Titre: ${pageAnalysis.title}`);
        console.log(`   URL: ${pageAnalysis.url}`);
        console.log(`   Formulaire login: ${pageAnalysis.hasLoginForm ? '✅' : '❌'}`);
        console.log(`   Home Assistant: ${pageAnalysis.hasHomeAssistant ? '✅' : '❌'}`);
        
        await page.screenshot({ path: 'tests-reports/auth-3-final-analysis.png', fullPage: true });
        
        if (pageAnalysis.hasLoginForm) {
            console.log('🔐 Toujours sur la page de login, tentative de connexion...');
            
            await page.type('input[name="username"]', 'dev');
            await page.type('input[name="password"]', 'Dev@2017!');
            
            await page.screenshot({ path: 'tests-reports/auth-4-credentials-filled.png', fullPage: true });
            
            const submitButton = await page.$('button');
            if (submitButton) {
                await submitButton.click();
                console.log('✅ Connexion soumise');
            }
            
            // Attendre plus longtemps cette fois
            console.log('⏳ Attente prolongée (10s)...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Vérifier après connexion
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
            
            console.log('📊 Analyse post-connexion:');
            console.log(`   Connecté: ${!afterLogin.stillOnLoginPage ? '✅' : '❌'}`);
            console.log(`   HA chargé: ${afterLogin.hasHomeAssistant ? '✅' : '❌'}`);
            
            if (!afterLogin.stillOnLoginPage && afterLogin.hasHomeAssistant) {
                await page.screenshot({ path: 'tests-reports/auth-5-success.png', fullPage: true });
                console.log('🎉 CONNEXION FINALEMENT RÉUSSIE!');
                
                // Maintenant tester ha-room
                console.log('🏠 Test de ha-room installé...');
                
                // Vérifier si ha-room est dans les ressources
                const haRoomCheck = await page.evaluate(() => {
                    const scripts = Array.from(document.querySelectorAll('script[src]'));
                    const haRoomScript = scripts.find(s => s.src.includes('ha-room'));
                    
                    return {
                        haRoomFound: !!haRoomScript,
                        scriptUrl: haRoomScript ? haRoomScript.src : null
                    };
                });
                
                console.log(`   ha-room script: ${haRoomCheck.haRoomFound ? '✅' : '❌'}`);
                
                if (haRoomCheck.haRoomFound) {
                    console.log(`   URL: ${haRoomCheck.scriptUrl}`);
                }
                
                await page.screenshot({ path: 'tests-reports/auth-6-ha-room-check.png', fullPage: true });
                
            } else {
                await page.screenshot({ path: 'tests-reports/auth-5-failed.png', fullPage: true });
                console.log('❌ Toujours pas connecté');
            }
            
        } else if (pageAnalysis.hasHomeAssistant) {
            await page.screenshot({ path: 'tests-reports/auth-5-already-logged.png', fullPage: true });
            console.log('✅ DÉJÀ CONNECTÉ À HOME ASSISTANT!');
            console.log('🏠 Vérification de ha-room...');
            
            // Vérifier ha-room si déjà connecté
            const haRoomCheck = await page.evaluate(() => {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                const haRoomScript = scripts.find(s => s.src.includes('ha-room'));
                
                return {
                    haRoomFound: !!haRoomScript,
                    scriptUrl: haRoomScript ? haRoomScript.src : null
                };
            });
            
            console.log(`   ha-room script: ${haRoomCheck.haRoomFound ? '✅' : '❌'}`);
            
            if (haRoomCheck.haRoomFound) {
                console.log(`   URL: ${haRoomCheck.scriptUrl}`);
            }
            
        } else {
            console.log('❌ État inconnu');
        }
        
        console.log('✅ Test de connexion terminé!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

completeLoginTest();