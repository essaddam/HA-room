# Tests HA Room Card

## Structure

- `e2e/` : Tests end-to-end avec Playwright
- `docker/` : Configuration Docker pour environnement de test
- `legacy/` : Anciens tests Puppeteer (référence)
- `fixtures/` : Données de test

## Exécution

```bash
# Tests complets avec Docker
npm run test:docker

# Tests E2E uniquement
npm run test:e2e

# Mode interactif
npm run test:e2e:ui
```

## Ajout de nouveaux tests

Créer un fichier dans `e2e/` suivant le pattern `*.spec.ts`.
Utiliser les helpers de `setup.ts` pour la configuration commune.