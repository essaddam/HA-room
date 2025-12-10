# Guide d'installation de l'éditeur visuel HA Room Card

## Étapes d'installation

### 1. Installation via HACS

1. **Ajoutez le dépôt HACS :**
   - Allez dans HACS > Intégrations
   - Cliquez sur les 3 points > Explore & Download Repositories
   - Cherchez `ha-room-card`
   - Installez-le

2. **Ajoutez la ressource à votre configuration Lovelace :**
   ```yaml
   resources:
     - type: module
       url: /hacsfiles/ha-room-card/dist/ha-room-card.js
   ```

### 2. Installation manuelle (alternative)

Si vous préférez une installation manuelle :

1. Copiez le contenu du dossier `dist` dans votre configuration Home Assistant :
   ```
   /config/www/community/ha-room-card/
   ```

2. Ajoutez la ressource à votre configuration Lovelace :
   ```yaml
   resources:
     - url: /local/community/ha-room-card/ha-room-card.js
       type: module
   ```

### 3. Utilisation de l'éditeur visuel

1. Allez dans votre dashboard Home Assistant
2. Cliquez sur "Modifier le tableau de bord"
3. Cliquez sur "Ajouter une carte"
4. Cherchez "HA Room Card" dans la liste des cartes personnalisées
5. L'éditeur visuel s'ouvrira automatiquement avec les sections suivantes :

#### Sections de l'éditeur visuel :

- **Configuration de base** : Nom, icône, couleur de l'icône
- **Apparence** : Couleurs de fond (dégradé)
- **Capteurs** : Température et humidité
- **Listes d'entités** : Lumières, prises, présence, ouvertures
- **Navigation** : Hash de navigation pour les popups
- **Média** : Entités audio et vidéo
- **Personnalisation** : Options avancées et fonctionnalités
- **Actions** : Actions au clic, maintien, double-clic

### 4. Configuration minimale

Pour commencer, vous n'avez besoin que de :
- Un nom pour la pièce
- Au moins une entité (lumière, capteur, etc.)

### 5. Exemple de configuration

L'éditeur visuel générera automatiquement le YAML correspondant. Voici un exemple :

```yaml
type: custom:ha-room-card
name: Salon
icon: mdi:home
temp_entity: sensor.salon_temperature
hum_entity: sensor.salon_humidity
light_list:
  - light.salon_principal
  - light.salon_ambiance
presence_list:
  - binary_sensor.salon_mouvement
```

### 6. Dépannage

Si l'éditeur visuel ne s'affiche pas :

**Pour installation HACS :**
1. Vérifiez que le dépôt est bien installé via HACS
2. Vérifiez l'URL dans les ressources : `/hacsfiles/ha-room-card/dist/ha-room-card.js`
3. Redémarrez Home Assistant
4. Videz le cache de votre navigateur

**Pour installation manuelle :**
1. Vérifiez que les fichiers sont bien dans `/config/www/community/ha-room-card/`
2. Vérifiez l'URL dans les ressources : `/local/community/ha-room-card/ha-room-card.js`
3. Redémarrez Home Assistant
4. Videz le cache de votre navigateur

### 7. Fonctionnalités avancées

L'éditeur visuel supporte également :
- Sélection multiple d'entités
- Choix de couleurs avec sélecteur visuel
- Sélecteur d'icônes Material Design
- Configuration des actions avec sélecteur d'actions HA
- Options pour Home Assistant 2025.12+

## Mise à jour

**Pour installation HACS :**
1. Allez dans HACS > Intégrations
2. Cherchez `ha-room-card`
3. Cliquez sur "Mettre à jour"
4. Rechargez votre dashboard

**Pour installation manuelle :**
1. Remplacez les fichiers dans `/config/www/community/ha-room-card/`
2. Rechargez votre dashboard (pas besoin de redémarrer HA)

## Notes importantes

- Le fichier `dist/ha-room-card.js` est généré par `npm run build`
- Assurez-vous d'utiliser la version la plus récente pour bénéficier de toutes les fonctionnalités
- L'éditeur visuel nécessite Home Assistant 2025.12+