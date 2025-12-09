import puppeteer from 'puppeteer';

async function simpleLoginTest() {
    console.log('🔍 Test simple de connexion...');
    
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Test de connexion
        console.log('📍 Navigation vers Home Assistant...');
        await page.goto('http://homeassistant.local:8123/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Vérifier si on est sur la page de login
        const loginPage = await page.evaluate(() => {
            const usernameInput = document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            const submitButton = document.querySelector('button');
            
            return {
                hasLoginForm: !!(usernameInput && passwordInput),
                title: document.title,
                url: window.location.href
            };
        });
        
        console.log('📊 Analyse de la page:');
        console.log(`   Titre: ${loginPage.title}`);
        console.log(`   URL: ${loginPage.url}`);
        console.log(`   Formulaire de login: ${loginPage.hasLoginForm ? '✅' : '❌'}`);
        
        if (loginPage.hasLoginForm) {
            await page.screenshot({ path: 'tests-reports/login-test-1-form.png', fullPage: true });
            
            // Remplir et soumettre le formulaire
            console.log('🔐 Remplissage du formulaire...');
            await page.type('input[name="username"]', 'dev');
            await page.type('input[name="password"]', 'Dev@2017!');
            
            await page.screenshot({ path: 'tests-reports/login-test-2-filled.png', fullPage: true });
            
            const submitButton = await page.$('button');
            if (submitButton) {
                await submitButton.click();
                console.log('✅ Formulaire soumis');
            }
            
            // Attendre la redirection
            console.log('⏳ Attente de la redirection...');
            await new Promise(resolve => setTimeout(resolve, 8000));
            
            // Vérifier la connexion réussie
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
            
            console.log('📊 Analyse après connexion:');
            console.log(`   Toujours sur login: ${afterLogin.stillOnLoginPage ? '❌' : '✅'}`);
            console.log(`   Home Assistant chargé: ${afterLogin.hasHomeAssistant ? '✅' : '❌'}`);
            console.log(`   Titre: ${afterLogin.title}`);
            
            if (!afterLogin.stillOnLoginPage && afterLogin.hasHomeAssistant) {
                await page.screenshot({ path: 'tests-reports/login-test-3-success.png', fullPage: true });
                console.log('🎉 CONNEXION RÉUSSIE!');
                
                // Test supplémentaire : vérifier HACS
                console.log('🔍 Vérification de HACS...');
                
                const hacsTest = await page.evaluate(() => {
                    const hacsLinks = Array.from(document.querySelectorAll('a[href*="hacs"]'));
                    const hacsButtons = Array.from(document.querySelectorAll('*')).filter(el => {
                        const text = el.textContent || el.innerText || '';
                        return text.toLowerCase().includes('hacs');
                    });
                    
                    return {
                        hacsLinksFound: hacsLinks.length > 0,
                        hacsElementsFound: hacsButtons.length > 0,
                        bodyText: document.body.innerText.substring(0, 500)
                    };
                });
                
                console.log(`   Liens HACS: ${hacsTest.hacsLinksFound ? '✅' : '❌'}`);
                console.log(`   Éléments HACS: ${hacsTest.hacsElementsFound ? '✅' : '❌'}`);
                
                if (hacsTest.hacsLinksFound || hacsTest.hacsElementsFound) {
                    await page.screenshot({ path: 'tests-reports/login-test-4-hacs-found.png', fullPage: true });
                    console.log('✅ HACS est accessible!');
                } else {
                    console.log('⚠️ HACS non détecté sur cette page');
                }
                
            } else {
                await page.screenshot({ path: 'tests-reports/login-test-3-failed.png', fullPage: true });
                console.log('❌ CONNEXION ÉCHOUÉE');
                console.log(`   Raison: ${afterLogin.stillOnLoginPage ? 'Toujours sur page login' : 'Home Assistant non chargé'}`);
            }
        } else {
            console.log('❌ Page de login non trouvée');
            await page.screenshot({ path: 'tests-reports/login-test-1-no-form.png', fullPage: true });
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

simpleLoginTest();