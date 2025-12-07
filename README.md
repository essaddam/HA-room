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

### Méthode 1: HACS (Recommandé)

1. Allez dans **HACS** > **Frontend**
2. Cliquez sur **"Explore & Download Repositories"**
3. Cherchez **"HA Room Card"** ou ajoutez l'URL du repository
4. Cliquez sur **"Download"**
5. Redémarrez Home Assistant
6. Ajoutez la card à votre dashboard

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
tap_action:
  action: "navigate"
  navigation_path: "/lovelace/salon"
```

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

- ✅ Home Assistant 2023.9+
- ✅ Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsive
- ✅ Dark/Light mode

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