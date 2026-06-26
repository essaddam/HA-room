# HA Room Card

Une custom card pour Home Assistant avec design moderne et fonctionnalités interactives.

## Fonctionnalités

- 🏠 **Design moderne** avec dégradés et animations fluides
- 🌡️ **Capteurs climatiques** (température, humidité) avec chips interactifs
- ⚡ **Consommation électrique** en temps réel avec totalisation automatique  
- 👥 **Détection de présence** avec indicateurs visuels animés
- 🚪 **Gestion des ouvertures** (portes, fenêtres) avec alertes
- 💡 **Contrôle des lumières** avec réglage de luminosité
- 🔌 **Prises et appareils** avec contrôle individuel
- 🎵 **Média** (audio/vidéo) avec pochettes d'album
- 📹 **Caméras** avec aperçu en direct

## Installation

### Méthode 1:### Via HACS (Recommandé) 🚀

[![HACS Install](https://img.shields.io/badge/HACS-Install-blue?style=flat-square)](https://hacs.xyz/docs/publish/start)

1. Allez dans **HACS** > **Frontend**
2. Cliquez sur **"Explore & Download Repositories"**
3. Cherchez **"HA Room Card"** ou ajoutez l'URL : `https://github.com/votre-username/ha-room-card`
4. Cliquez sur **"Download"** ⬇️
5. Redémarrez Home Assistant 🔄
6. Ajoutez la card à votre dashboard ➕

**Installation rapide :**
```yaml
# Dans configuration.yaml
lovelace:
  mode: yaml
  resources:
    - url: /hacsfiles/ha-room-card.js
      type: module
```

### 🚀 Installation Automatique (GitHub)

[![Install Direct](https://img.shields.io/badge/Install-Direct-green?style=flat-square)](https://github.com/votre-username/ha-room-card/releases)

1. Téléchargez la dernière version [ici](https://github.com/votre-username/ha-room-card/releases/latest)
2. Copiez `ha-room-card.js` dans votre dossier `config/www/`
3. Ajoutez la ressource dans Home Assistant :
   - **Configuration** > **Tableaux de bord** > **Ressources**
   - URL : `/local/ha-room-card.js`
   - Type : `Module`
4. Redémarrez Home Assistant 🔄

### 🔗 Installation Auto via Repository URL

```yaml
# Alternative : URL directe du repository
lovelace:
  mode: yaml
  resources:
    - url: https://cdn.jsdelivr.net/gh/votre-username/ha-room-card@latest/dist/ha-room-card.js
      type: module
```

### Nouveautés Home Assistant 2025.12

- 🎨 **Support des thèmes dynamiques** : Intégration automatique avec les thèmes de Home Assistant
- 📱 **Sections view optimisé** : Support natif du nouveau système de sections avec grille flexible
- ♿ **Accessibilité améliorée** : Support WCAG 2.1 et navigation au clavier
- 🎭 **Animations fluides** : Nouvelles transitions cubiques-bezier et support du mouvement réduit
- 🌓 **Mode sombre/clair** : Détection automatique du thème système

### Méthode 2: Manuelle

1. Téléchargez le fichier `ha-room-card.js` depuis la section [Releases](https://github.com/votre-username/ha-room-card/releases)
2. Placez le fichier dans votre dossier `config/www/`
3. Ajoutez la ressource dans Home Assistant :
   - **Configuration** > **Tableaux de bord** > **Ressources**
   - Cliquez sur **"Ajouter une ressource"**
   - URL : `/local/ha-room-card.js`
   - Type : `Module`

## Configuration

### Configuration de base

```yaml
type: custom:ha-room-card
name: "Salon"
icon: "mdi:home"
icon_color: "blue"
bg_start: "#1e3a5f"
bg_end: "#2d5a87"
temp_entity: "sensor.temperature_salon"
hum_entity: "sensor.humidity_salon"
```

### Configuration complète

```yaml
type: custom:ha-room-card
name: "Salon"
icon: "mdi:sofa"
icon_color: "blue"
bg_start: "#1e3a5f"
bg_end: "#2d5a87"

# Capteurs
temp_entity: "sensor.temperature_salon"
hum_entity: "sensor.humidity_salon"

# Listes d'entités
power_list:
  - "sensor.tv_power"
  - "sensor.lampe_power"
light_list:
  - "light.salon_principal"
  - "light.salon_ambiance"
presence_list:
  - "binary_sensor.mouvement_salon"
  - "binary_sensor.presence_salon"
open_list:
  - "binary_sensor.porte_entree"
  - "binary_sensor.fenetre_salon"

# Navigation
lights_hash: "#lights"
plugs_hash: "#plugs"
covers_hash: "#covers"
presence_hash: "#presence"
open_hash: "#openings"
audio_hash: "#audio"
video_hash: "#video"
cameras_hash: "#cameras"

# Médias
audio_cover_entity: "media_player.salon"
video_cover_entity: "media_player.tv_salon"
covers_label: "Volets"

# Actions
card_tap_action:
  action: "navigate"
  navigation_path: "/lovelace/salon"
```

> **Note :** Utilisez `card_tap_action` pour l'action au clic sur la carte entière. L'ancienne clé `tap_action` reste fonctionnelle mais est dépréciée car Home Assistant peut l'intercepter et la déclencher en même temps que les boutons internes (Lumières, Prises, etc.).

## Personnalisation avancée

### Couleurs personnalisées

```yaml
type: custom:ha-room-card
name: "Chambre"
icon: "mdi:bed"
icon_color: "purple"
bg_start: "#4a148c"
bg_end: "#6b46c1"
```

### Masquer les sections inutilisées

Ajoutez `hide_empty_sections` dans `features` pour masquer automatiquement les chips et les boutons qui n'ont pas d'entités configurées. Vous pouvez aussi masquer des éléments individuellement.

```yaml
type: custom:ha-room-card
name: "Salon"
features:
  - hide_empty_sections
  # - hide_chips
  # - hide_lights_button
  # - hide_plugs_button
  # - hide_covers_button
  # - hide_audio_button
  # - hide_video_button
  # - hide_cameras_button
```

### Chips supplémentaires

```yaml
extra_chips:
  - type: "template"
    icon: "mdi:air-filter"
    icon_color: "cyan"
    content: "{{ states('sensor.co2_salon') }} ppm"
    tap_action:
      action: "more-info"
      entity: "sensor.co2_salon"
```

## Fonctionnalités des popups

La card inclut des popups interactifs pour chaque catégorie :

- **🔆 Lights Popup** : Contrôle individuel des lumières avec réglage de luminosité
- **🔌 Plugs Popup** : Visualisation de la consommation par appareil
- **👥 Presence Popup** : État des capteurs avec historique
- **🚪 Openings Popup** : État des ouvertures avec alertes visuelles

## Compatibilité

- ✅ **Home Assistant 2025.12+** (minimum requis)
- ✅ **Navigateurs modernes** : Chrome, Firefox, Safari, Edge, Chromium
- ✅ **Responsive design** : Mobile-first avec breakpoints adaptatifs
- ✅ **Thèmes dynamiques** : Clair/sombre avec variables CSS
- ✅ **Accessibilité WCAG 2.1** : Navigation clavier, focus visible, lecteur d'écran
- ✅ **Animations fluides** : Cubic-bezier avec support mouvement réduit
- ✅ **Sections view** : Support natif grille flexible (getGridOptions)
- ✅ **Performance optimisée** : Build 1.6s, tree-shaking, lazy loading

## Développement

Pour le développement :

```bash
# Installation des dépendances
npm install

# Build en développement
npm run dev

# Build de production
npm run build

# Vérification du code
npm run lint
npm run typecheck
```

## 🧪 Développement et Tests

### Environnement Docker

Pour tester l'intégration dans un vrai Home Assistant :

```bash
# Démarrer l'environnement
npm run docker:up

# Builder la carte
npm run build

# Lancer les tests E2E
npm run test:e2e
```

Accédez à Home Assistant sur http://localhost:8123 (dev / Dev@2017!)

### Tests manuels

1. Ouvrir http://localhost:8123
2. Aller dans Configuration → Tableaux de bord
3. Ajouter une carte "HA Room Card"
4. Vérifier que l'éditeur s'ouvre sans erreur

### Développement avec devcontainer

Ouvrir le projet dans VS Code et sélectionner "Reopen in Container" pour un environnement complet.

## Structure du projet

```
src/
├── components/
│   ├── popup-base.ts          # Base des popups
│   ├── lights-popup.ts        # Popup lumières
│   ├── plugs-popup.ts         # Popup prises
│   ├── presence-popup.ts      # Popup présence
│   └── openings-popup.ts      # Popup ouvertures
├── const.ts                 # Constantes
├── types.ts                 # Types TypeScript
├── utils.ts                 # Utilitaires
└── ha-room-card.ts         # Card principale
```

## Contribuer

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit vos changements
4. Push vers votre fork
5. Ouvrez une Pull Request

## Licence

MIT License - voir fichier [LICENSE](LICENSE) pour plus de détails.

## Support

- 🐛 **Bugs** : [Issues](https://github.com/votre-username/ha-room-card/issues)
- 💡 **Suggestions** : [Issues](https://github.com/votre-username/ha-room-card/issues)
- 📖 **Documentation** : [Wiki](https://github.com/votre-username/ha-room-card/wiki)

---

**Créé avec ❤️ pour la communauté Home Assistant**