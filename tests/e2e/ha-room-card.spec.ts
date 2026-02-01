import { test, expect } from '@playwright/test';
import { setupBrowser, loginToHA, navigateToLovelace } from './setup';

test.describe('HA Room Card Integration', () => {
  test('should register custom card in picker', async ({ page }) => {
    await loginToHA(page);
    await navigateToLovelace(page);
    
    // Ouvrir l'éditeur
    await page.click('button[aria-label="Edit dashboard"]');
    await page.click('button:has-text("Add card")');
    
    // Vérifier que ha-room-card est dans la liste
    const cardPicker = await page.locator('ha-card-picker');
    await expect(cardPicker).toContainText('HA Room Card');
  });

  test('should open editor without errors', async ({ page }) => {
    await loginToHA(page);
    await navigateToLovelace(page);
    
    // Ajouter la carte
    await page.click('button[aria-label="Edit dashboard"]');
    await page.click('button:has-text("Add card")');
    await page.click('text=HA Room Card');
    
    // Vérifier l'éditeur
    const editor = await page.locator('ha-room-card-editor');
    await expect(editor).toBeVisible();
    
    // Vérifier absence d'erreurs
    const errors = await page.locator('.error, ha-alert[alert-type="error"]');
    await expect(errors).toHaveCount(0);
  });

  test('should save configuration', async ({ page }) => {
    await loginToHA(page);
    await navigateToLovelace(page);
    
    // Configuration de test
    await page.click('button[aria-label="Edit dashboard"]');
    await page.click('button:has-text("Add card")');
    await page.click('text=HA Room Card');
    
    // Remplir le formulaire
    await page.fill('input[name="name"]', 'Salon Test');
    await page.click('button:has-text("Save")');
    
    // Vérifier la carte créée
    const card = await page.locator('ha-room-card');
    await expect(card).toContainText('Salon Test');
  });
});