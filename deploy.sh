#!/bin/bash
# Script de déploiement de HA Room Card
# Usage: ./deploy.sh [user@host]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_FILE="$SCRIPT_DIR/dist/ha-room-card.js"
HA_HOST="${1:-}"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Déploiement de HA Room Card${NC}"
echo ""

# Vérifier que le fichier existe
if [ ! -f "$DIST_FILE" ]; then
    echo -e "${RED}❌ Fichier non trouvé: $DIST_FILE${NC}"
    echo "Lance d'abord: npm run build"
    exit 1
fi

echo -e "${GREEN}✅ Fichier trouvé:${NC} $(ls -lh $DIST_FILE | awk '{print $5}')"
echo ""

# Si un hôte est fourni, essayer de copier via SCP
if [ -n "$HA_HOST" ]; then
    echo -e "${YELLOW}📤 Tentative de copie vers $HA_HOST...${NC}"

    # Essayer différents chemins
    if ssh "$HA_HOST" "test -d /config/www" 2>/dev/null; then
        REMOTE_PATH="/config/www/ha-room-card.js"
        echo "   Chemin trouvé: /config/www"
    elif ssh "$HA_HOST" "test -d /homeassistant/www" 2>/dev/null; then
        REMOTE_PATH="/homeassistant/www/ha-room-card.js"
        echo "   Chemin trouvé: /homeassistant/www"
    else
        echo -e "${RED}❌ Impossible de trouver le dossier www sur le serveur${NC}"
        echo "   Chemins testés: /config/www, /homeassistant/www"
        exit 1
    fi

    scp "$DIST_FILE" "$HA_HOST:$REMOTE_PATH"
    echo -e "${GREEN}✅ Fichier copié avec succès!${NC}"
    echo ""
    echo "📝 Actions manuelles:"
    echo "   1. Redémarre Home Assistant ou recharge le frontend (Ctrl+Shift+R)"
    echo "   2. Ajoute la carte à ton dashboard"

else
    echo -e "${YELLOW}⚠️  Aucun hôte fourni${NC}"
    echo ""
    echo "Instructions manuelles:"
    echo ""
    echo "1. Copie le fichier sur ton serveur HA:"
    echo "   ${GREEN}scp $DIST_FILE root@192.168.177.19:/config/www/ha-room-card.js${NC}"
    echo ""
    echo "   Ou via l'addon File Editor/Studio Code:"
    echo "   - Upload dist/ha-room-card.js vers /config/www/"
    echo ""
    echo "2. Redémarre HA ou recharge le frontend (Ctrl+Shift+R)"
    echo ""
    echo "3. Ajoute la carte à ton dashboard:"
    echo "   type: custom:ha-room-card"
    echo "   name: Salon"
    echo "   icon: mdi:home"
    echo ""
    echo "Voir test-card-config.yaml pour un exemple complet"
fi
