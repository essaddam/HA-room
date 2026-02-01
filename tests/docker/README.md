# 🐳 Environnement Docker de test

## Démarrage rapide

1. **Lancer Home Assistant** :
   ```bash
   npm run docker:up
   ```

2. **Accéder à l'interface** :
   - URL : http://localhost:8123
   - User : `Dev`
   - Pass : `Dev123`

3. **Builder et tester** :
   ```bash
   npm run build
   npm run test:e2e
   ```

## Structure

- `homeassistant/` : Configuration HA avec entités de test
- `docker-compose.yml` : Orchestration des services
- Le dossier `dist/` est monté automatiquement dans `/config/www/community/ha-room-card/`

## Commandes utiles

```bash
# Voir les logs
npm run docker:logs

# Redémarrer
npm run docker:restart

# Arrêter
npm run docker:down