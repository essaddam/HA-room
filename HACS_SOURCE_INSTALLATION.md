# Installation HACS (Mode Source)

## Configuration pour HACS avec fichiers build

Le projet utilise les fichiers build générés dans le répertoire `dist/` pour un fonctionnement optimal avec HACS.

### 1. Installation via HACS

1. **Ajouter le dépôt HACS :**
   - Allez dans HACS > Intégrations
   - Cliquez sur les 3 points > Explore & Download Repositories
   - Cherchez votre dépôt `ha-room-card`
   - Installez-le

2. **Configuration dans Lovelace :**

   Ajoutez cette ressource à votre configuration Lovelace :

   ```yaml
   resources:
     - type: module
       url: /hacsfiles/ha-room-card/dist/ha-room-card.js
   ```

3. **Utilisation dans les cartes :**

   ```yaml
   type: custom:ha-room-card
   name: "Salon"
   icon: "mdi:home"
   temp_entity: "sensor.temperature_salon"
   hum_entity: "sensor.humidity_salon"
   # ... autres configurations
   ```

### 2. Avantages du mode build

✅ **Performance optimale** : Fichiers JavaScript optimisés
✅ **Compatibilité garantie** : Tous les navigateurs modernes supportés
✅ **Taille réduite** : Code minifié pour un chargement rapide
✅ **Stabilité** : Version testée et validée

### 3. Structure des fichiers

```
/config/community/ha-room-card/
├── dist/
│   ├── ha-room-card.js           # Carte principale (build)
│   ├── ha-room-card-editor.js    # Éditeur visuel (build)
│   ├── components/               # Composants popup (build)
│   └── ha-room-card-schema.json  # Schéma JSON pour l'éditeur
├── src/                          # Fichiers source (pour développement)
│   ├── ha-room-card.ts           # Carte principale
│   ├── ha-room-card-editor.ts    # Éditeur visuel
│   ├── components/               # Composants popup
│   ├── const.ts                 # Constantes
│   ├── types.ts                 # Types TypeScript
│   └── utils.ts                 # Utilitaires
└── README.md                    # Documentation
```

### 4. Développement local

Pour développer localement :

```bash
# Clonez le dépôt dans votre configuration Home Assistant
cd /config/community/ha-room-card/
git clone <votre-repo-url> .

# Installez les dépendances et générez le build
npm install
npm run build

# Les modifications nécessitent un nouveau build
npm run build  # après chaque modification des fichiers source

# Rechargez votre page Home Assistant pour voir les changements
```

### 5. Validation de l'éditeur visuel

Pour vérifier que l'éditeur fonctionne :

1. Ouvrez les outils de développement du navigateur
2. Dans la console, exécutez :
   ```javascript
   // Test de la configuration de l'éditeur
   console.log('Testing editor config...');
   ```

3. Ajoutez une nouvelle carte dans votre dashboard
4. Cherchez "HA Room Card" dans la liste des cartes personnalisées
5. L'éditeur visuel devrait s'afficher avec toutes les sections

### 6. Fichiers essentiels pour HACS

Les fichiers suivants sont inclus dans la distribution HACS :

- `dist/ha-room-card.js` - Carte principale (build)
- `dist/ha-room-card-editor.js` - Éditeur visuel (build)
- `dist/components/` - Tous les composants popup (build)
- `dist/ha-room-card-schema.json` - Schéma JSON de validation
- `src/` - Fichiers source (référence pour le développement)

### 7. Compatibilité

- **Home Assistant** : 2025.12+
- **Navigateurs** : Modernes supportant ES modules
- **HACS** : Version compatible avec les fichiers source

Cette configuration assure une performance optimale et une compatibilité maximale tout en conservant toutes les fonctionnalités de l'éditeur visuel.