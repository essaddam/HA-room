# Installation HACS (Mode Source)

## Configuration pour HACS avec fichiers source

Le projet est maintenant configuré pour fonctionner directement avec les fichiers TypeScript source, sans nécessiter de build.

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
       url: /hacsfiles/ha-room-card/src/ha-room-card.ts
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

### 2. Avantages du mode source

✅ **Développement rapide** : Modifications immédiatement visibles  
✅ **Pas de build nécessaire** : Travaillez directement avec les fichiers source  
✅ **Débogage facile** : Accès direct au code TypeScript  
✅ **Mises à jour simples** : Un git pull suffit  

### 3. Structure des fichiers

```
/config/community/ha-room-card/
├── src/
│   ├── ha-room-card.ts           # Carte principale
│   ├── ha-room-card-editor.ts    # Éditeur visuel
│   ├── components/               # Composants popup
│   ├── const.ts                 # Constantes
│   ├── types.ts                 # Types TypeScript
│   └── utils.ts                 # Utilitaires
├── ha-room-card-schema.json      # Schéma JSON pour l'éditeur
└── README.md                    # Documentation
```

### 4. Développement local

Pour développer localement :

```bash
# Clonez le dépôt dans votre configuration Home Assistant
cd /config/community/ha-room-card/
git clone <votre-repo-url> .

# Les modifications sont immédiatement disponibles
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

- `src/ha-room-card.ts` - Carte principale
- `src/ha-room-card-editor.ts` - Éditeur visuel
- `src/components/` - Tous les composants popup
- `src/const.ts` - Constantes partagées
- `src/types.ts` - Définitions de types
- `src/utils.ts` - Fonctions utilitaires
- `ha-room-card-schema.json` - Schéma JSON de validation

### 7. Compatibilité

- **Home Assistant** : 2025.12+
- **Navigateurs** : Modernes supportant ES modules
- **HACS** : Version compatible avec les fichiers source

Cette configuration permet un développement plus rapide et une maintenance simplifiée tout en conservant toutes les fonctionnalités de l'éditeur visuel.