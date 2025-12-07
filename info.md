# HA Room Card

## Description

Une custom card pour Home Assistant avec design moderne et fonctionnalités interactives. Permet de contrôler et surveiller tous les aspects d'une pièce : lumières, prises, capteurs, médias, etc.

## Caractéristiques principales

- 🏠 Design moderne avec dégradés personnalisables
- 🌡️ Capteurs climatiques (température, humidité)
- ⚡ Consommation électrique en temps réel
- 👥 Détection de présence avec animations
- 🚪 Gestion des ouvertures (portes, fenêtres)
- 💡 Contrôle des lumières avec luminosité
- 🔌 Prises et appareils avec monitoring
- 🎵 Support médias (audio/vidéo)
- 📹 Caméras avec aperçu
- 📱 Responsive design

## Installation

### Via HACS (Recommandé)

1. Allez dans **HACS** > **Frontend**
2. Cliquez sur **"Explore & Download Repositories"**
3. Cherchez **"HA Room Card"**
4. Cliquez sur **"Download"**
5. Redémarrez Home Assistant
6. Ajoutez la card à votre dashboard

### Manuellement

1. Téléchargez le fichier `ha-room-card.js`
2. Placez-le dans `config/www/`
3. Ajoutez la ressource dans Home Assistant
4. Redémarrez et ajoutez la card

## Configuration de base

```yaml
type: custom:ha-room-card
name: "Salon"
icon: "mdi:sofa"
icon_color: "blue"
bg_start: "#1e3a5f"
bg_end: "#2d5a87"
temp_entity: "sensor.temperature_salon"
hum_entity: "sensor.humidity_salon"
```

## Configuration complète

Voir le fichier `example.yaml` pour une configuration complète avec toutes les options.

## Compatibilité

- Home Assistant 2023.9+
- Navigateurs modernes
- Mobile et desktop

## Support

Pour le support et les questions, utilisez l'onglet **Issues** du repository GitHub.