/**
 * Identifiants de test pour Home Assistant
 * 
 * Ces identifiants sont utilisés exclusivement pour les tests automatisés
 * dans l'environnement de développement et de test.
 * 
 * IMPORTANT: Ces identifiants ne doivent JAMAIS être utilisés en production!
 * 
 * Nom d'utilisateur: Dev
 * Mot de passe: Dev123
 */
export const TEST_CREDENTIALS = {
  username: 'Dev',
  password: 'Dev123'
};

/**
 * URL de base pour les tests Home Assistant
 */
export const TEST_BASE_URL = 'http://localhost:8123';

/**
 * Configuration par défaut pour les tests E2E
 */
export const DEFAULT_TEST_CONFIG = {
  timeout: 30000,
  headless: process.env.CI === 'true',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};