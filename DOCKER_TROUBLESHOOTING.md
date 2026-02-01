# Guide de Dépannage Docker pour ha-room-card

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Problèmes courants](#problèmes-courants)
3. [Solutions rapides](#solutions-rapides)
4. [Guide étape par étape](#guide-étape-par-étape)
5. [Workflow de développement](#workflow-de-développement)
6. [Dépannage avancé](#dépannage-avancé)
7. [Ressources additionnelles](#ressources-additionnelles)

---

## Vue d'ensemble

Ce guide résout les problèmes Docker les plus courants dans le projet **ha-room-card**, basé sur le diagnostic des 3 problèmes principaux identifiés :

1. **Fichier de build JavaScript tronqué** (`dist/ha-room-card.js`)
2. **Configuration Home Assistant obsolète** (`server_host` déprécié)
3. **Problèmes de permissions** sur les fichiers critiques

### Prérequis

- Docker et Docker Compose installés
- Node.js et npm/yarn installés
- Accès au terminal avec permissions suffisantes
- Projet ha-room-card cloné localement

---

## Problèmes courants

### 1. Fichier JavaScript tronqué

**Symptômes :**
- Taille du fichier `dist/ha-room-card.js` < 200KB
- Erreurs 404 lors du chargement de la carte dans Home Assistant
- Console browser montrant des erreurs de syntaxe JavaScript

**Causes :**
- Build interrompu ou incomplet
- Problèmes de permissions lors de l'écriture du fichier
- Espace disque insuffisant
- Conflit avec des processus antérieurs

**Solution rapide :**
```bash
# Nettoyer et reconstruire
rm -rf dist/
npm run build
```

### 2. Configuration Home Assistant obsolète

**Symptômes :**
- Home Assistant ne démarre pas correctement
- Messages d'avertissement sur `server_host` dans les logs
- Configuration ignorée ou partiellement appliquée

**Causes :**
- Utilisation de l'ancien paramètre `server_host` (déprécié depuis HA 2023.1)
- Configuration YAML mal formatée
- Fichier de configuration corrompu

**Solution rapide :**
```bash
# Supprimer server_host de la configuration
sed -i '/server_host/d' tests/docker/homeassistant/configuration.yaml
```

### 3. Problèmes de permissions

**Symptômes :**
- Erreurs "Permission denied" lors du build
- Fichiers non accessibles par Docker
- Scripts non exécutables

**Causes :**
- Permissions incorrectes sur les fichiers critiques
- Scripts sans permission d'exécution
- Conflit de propriétaire entre l'utilisateur et Docker

**Solution rapide :**
```bash
# Corriger les permissions
chmod 755 scripts/*.sh
chmod 644 dist/ha-room-card.js
chmod -R 755 tests/docker/homeassistant/
```

---

## Solutions rapides

### Script de résolution automatique

Le projet inclut un script de résolution automatique qui corrige tous les problèmes identifiés :

```bash
# Exécuter le diagnostic
./scripts/fix-docker-issues.sh diagnostic

# Appliquer les corrections automatiques
./scripts/fix-docker-issues.sh repair

# Tester après réparation
./scripts/fix-docker-issues.sh test
```

### Commandes manuelles rapides

```bash
# 1. Reconstruire le fichier JavaScript
npm run build

# 2. Mettre à jour la configuration HA
sed -i '/server_host/d' tests/docker/homeassistant/configuration.yaml

# 3. Corriger les permissions
chmod 755 scripts/*.sh
chmod 644 dist/ha-room-card.js

# 4. Redémarrer Docker
npm run docker:restart
```

---

## Guide étape par étape

### Étape 1 : Diagnostic initial

Avant toute correction, exécutez un diagnostic complet :

```bash
./scripts/verify-docker-setup.sh full
```

Cette commande vérifie :
- ✅ Intégrité du fichier JavaScript
- ✅ Configuration Home Assistant
- ✅ Permissions des fichiers
- ✅ Environnement Docker
- ✅ Accessibilité de Home Assistant
- ✅ Intégration de la carte
- ✅ Workflow de développement

### Étape 2 : Correction du fichier JavaScript

Si le diagnostic révèle un problème avec le fichier JavaScript :

```bash
# 1. Nettoyer le build précédent
rm -rf dist/

# 2. Vérifier les sources
ls -la src/ha-room-card.ts

# 3. Reconstruire
npm run build

# 4. Vérifier la taille du fichier
ls -lh dist/ha-room-card.js
```

**Taille attendue :** > 200KB

### Étape 3 : Mise à jour de la configuration Home Assistant

Pour corriger la configuration obsolète :

```bash
# 1. Sauvegarder la configuration actuelle
cp tests/docker/homeassistant/configuration.yaml tests/docker/homeassistant/configuration.yaml.backup

# 2. Supprimer server_host (obsolète)
sed -i '/server_host/d' tests/docker/homeassistant/configuration.yaml

# 3. Vérifier la syntaxe YAML
python3 -c "import yaml; yaml.safe_load(open('tests/docker/homeassistant/configuration.yaml'))"

# 4. Redémarrer Home Assistant
docker-compose -f .devcontainer/docker-compose.yml restart homeassistant
```

### Étape 4 : Correction des permissions

Pour résoudre les problèmes de permissions :

```bash
# 1. Permissions des scripts
chmod 755 scripts/*.sh

# 2. Permissions des fichiers de build
chmod 644 dist/ha-room-card.js

# 3. Permissions du répertoire HA
chmod -R 755 tests/docker/homeassistant/

# 4. Permissions du projet (si nécessaire)
sudo chown -R $USER:$USER .
```

### Étape 5 : Vérification finale

Après avoir appliqué toutes les corrections :

```bash
# Vérification complète
./scripts/verify-docker-setup.sh full

# Test rapide
./scripts/verify-docker-setup.sh quick
```

---

## Workflow de développement

### Workflow recommandé après correction

1. **Développement local :**
   ```bash
   # Mode développement avec rechargement automatique
   npm run dev
   ```

2. **Build et test :**
   ```bash
   # Build du projet
   npm run build
   
   # Vérification rapide
   ./scripts/verify-docker-setup.sh quick
   ```

3. **Test Docker :**
   ```bash
   # Redémarrer l'environnement Docker
   npm run docker:restart
   
   # Attendre le démarrage (30-60 secondes)
   sleep 30
   
   # Vérifier l'accessibilité
   curl http://localhost:8123
   ```

4. **Déploiement :**
   ```bash
   # Vérification finale avant déploiement
   ./scripts/verify-docker-setup.sh full
   
   # Si tout est OK, procéder au déploiement
   npm run release
   ```

### Scripts npm utiles

Le projet inclut plusieurs scripts npm pour faciliter le développement :

```json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "docker:restart": "docker-compose -f .devcontainer/docker-compose.yml restart",
    "docker:logs": "docker-compose -f .devcontainer/docker-compose.yml logs -f homeassistant",
    "docker:shell": "docker-compose -f .devcontainer/docker-compose.yml exec homeassistant /bin/bash"
  }
}
```

---

## Dépannage avancé

### Problèmes persistants du fichier JavaScript

Si le fichier JavaScript reste tronqué après reconstruction :

```bash
# 1. Vérifier l'espace disque
df -h

# 2. Vérifier les erreurs de build en détail
npm run build --verbose

# 3. Nettoyer complètement les dépendances
rm -rf node_modules package-lock.json
npm install

# 4. Reconstruction forcée
npm run build --force
```

### Problèmes Docker complexes

Si Docker présente des problèmes persistants :

```bash
# 1. Nettoyer complètement Docker
docker system prune -a
docker volume prune

# 2. Reconstruire les conteneurs
docker-compose -f .devcontainer/docker-compose.yml down
docker-compose -f .devcontainer/docker-compose.yml build --no-cache
docker-compose -f .devcontainer/docker-compose.yml up -d

# 3. Vérifier les logs
docker-compose -f .devcontainer/docker-compose.yml logs homeassistant
```

### Configuration Home Assistant avancée

Pour des problèmes de configuration complexes :

```bash
# 1. Valider la configuration complète
docker-compose -f .devcontainer/docker-compose.yml exec homeassistant python -m homeassistant --script check_config

# 2. Examiner les logs d'erreur
docker-compose -f .devcontainer/docker-compose.yml logs homeassistant | grep -i error

# 3. Configuration minimale de test
cat > tests/docker/homeassistant/configuration.yaml << EOF
homeassistant:
  name: Test HA Room Card
  latitude: 0
  longitude: 0
  elevation: 0
  unit_system: metric
  time_zone: UTC

frontend:
http:
  server_port: 8123

logger:
  default: info
EOF
```

### Problèmes de permissions système

Pour les problèmes de permissions persistants :

```bash
# 1. Vérifier l'utilisateur Docker
groups $USER | grep docker

# 2. Ajouter l'utilisateur au groupe Docker (si nécessaire)
sudo usermod -aG docker $USER

# 3. Recharger les groupes
newgrp docker

# 4. Vérifier les permissions SELinux (sur CentOS/RHEL)
sestatus
```

---

## Ressources additionnelles

### Documentation utile

- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation Home Assistant](https://www.home-assistant.io/docs/)
- [Configuration Home Assistant](https://www.home-assistant.io/docs/configuration/)
- [Développement de cartes personnalisées](https://developers.home-assistant.io/docs/frontend/custom-ui/lovelace-custom-card/)

### Commandes de référence

```bash
# Docker
docker ps                          # Lister les conteneurs actifs
docker logs <container>            # Logs d'un conteneur
docker exec -it <container> bash   # Shell dans un conteneur

# Docker Compose
docker-compose ps                  # Lister les services
docker-compose logs -f <service>   # Logs suivis d'un service
docker-compose restart <service>   # Redémarrer un service

# Node.js/npm
npm run build                      # Build du projet
npm run dev                        # Mode développement
npm cache clean --force           # Nettoyer le cache npm

# Home Assistant
curl http://localhost:8123/api/config  # Configuration API
curl http://localhost:8123/api/states  # États des entités
```

### Fichiers de configuration clés

- `package.json` : Dépendances et scripts npm
- `rollup.config.js` : Configuration du build JavaScript
- `.devcontainer/docker-compose.yml` : Configuration Docker
- `tests/docker/homeassistant/configuration.yaml` : Configuration Home Assistant
- `src/ha-room-card.ts` : Source principal de la carte

### Scripts du projet

- `scripts/fix-docker-issues.sh` : Résolution automatique des problèmes
- `scripts/verify-docker-setup.sh` : Vérification de la configuration
- `npm run docker:restart` : Redémarrage des conteneurs Docker
- `npm run docker:logs` : Logs de Home Assistant

---

## Conclusion

Ce guide couvre les problèmes Docker les plus courants dans le projet ha-room-card. En suivant les étapes décrites, vous devriez pouvoir résoudre la majorité des blocages rencontrés lors de la configuration initiale.

Pour des problèmes non couverts par ce guide :
1. Consultez les logs détaillés avec `npm run docker:logs`
2. Exécutez un diagnostic complet avec `./scripts/verify-docker-setup.sh full`
3. Créez une issue sur le dépôt GitHub avec les détails du problème

**Rappel :** La plupart des problèmes peuvent être résolus avec le script automatique :
```bash
./scripts/fix-docker-issues.sh repair