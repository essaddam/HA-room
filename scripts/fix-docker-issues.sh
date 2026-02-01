#!/bin/bash

# =============================================================================
# Script de résolution automatique des problèmes Docker pour ha-room-card
# Résout les 3 problèmes principaux identifiés :
# 1. Fichier de build JavaScript tronqué
# 2. Configuration Home Assistant obsolète (server_host déprécié)
# 3. Problèmes potentiels de permissions
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonction pour afficher les messages
log() {
    echo -e "${2}[${1}] ${3}${NC}"
}

# Fonction pour vérifier si une commande existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Fonction pour vérifier si un fichier existe
file_exists() {
    [[ -f "$1" ]]
}

# Fonction pour vérifier si un répertoire existe
dir_exists() {
    [[ -d "$1" ]]
}

# Fonction pour vérifier les permissions d'un fichier
check_permissions() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local perms=$(stat -c "%a" "$file" 2>/dev/null)
        log "INFO" "Permissions de $file: $perms"
        
        if [[ "$perms" =~ ^-rw-r--r-- ]]; then
            log "SUCCESS" "Permissions correctes pour $file"
            return 0
        else
            log "WARNING" "Permissions incorrectes pour $file (attendu: -rw-r--r--)"
            return 1
        fi
    else
        log "ERROR" "Le fichier $file n'existe pas"
        return 1
    fi
}

# Fonction pour vérifier l'intégrité du fichier JavaScript
check_js_integrity() {
    local file="$1"
    local expected_size="$2"
    
    if ! file_exists "$file"; then
        log "ERROR" "Le fichier $file n'existe pas"
        return 1
    fi
    
    local actual_size=$(stat -c%s "$file" 2>/dev/null)
    log "INFO" "Taille actuelle de $file: $actual_size octets"
    log "INFO" "Taille attendue: $expected_size octets"
    
    if [[ $actual_size -lt $expected_size ]]; then
        log "ERROR" "Le fichier $file est tronqué (${actual_size} < ${expected_size} octets)"
        return 1
    else
        log "SUCCESS" "Le fichier $file a une taille correcte"
        return 0
    fi
}

# Fonction pour vérifier la configuration Home Assistant
check_ha_config() {
    local config_file="$1"
    
    if ! file_exists "$config_file"; then
        log "ERROR" "Le fichier de configuration $config_file n'existe pas"
        return 1
    fi
    
    # Vérifier la présence de server_host (obsolète)
    if grep -q "server_host" "$config_file"; then
        log "WARNING" "Configuration obsolète détectée: server_host est déprécié"
        log "INFO" "Migration vers la nouvelle configuration en cours..."
        
        # Sauvegarde du fichier original
        cp "$config_file" "${config_file}.backup"
        log "INFO" "Sauvegarde créé: ${config_file}.backup"
        
        # Suppression de server_host
        sed -i '/server_host/d' "$config_file"
        log "INFO" "Configuration mise à jour"
        
        # Vérification
        if ! grep -q "server_host" "$config_file"; then
            log "SUCCESS" "Configuration migrée avec succès"
        else
            log "ERROR" "Échec de la migration de la configuration"
            return 1
        fi
    else
        log "SUCCESS" "Configuration Home Assistant à jour"
    fi
    
    return 0
}

# Fonction pour corriger les permissions
fix_permissions() {
    local target_dir="$1"
    
    log "INFO" "Correction des permissions pour $target_dir..."
    
    # Permissions pour les répertoires
    find "$target_dir" -type d -exec chmod 755 {} \;
    
    # Permissions pour les fichiers
    find "$target_dir" -type f -exec chmod 644 {} \;
    
    # Permissions spéciales pour les scripts
    find "$target_dir" -name "*.sh" -exec chmod 755 {} \;
    
    log "SUCCESS" "Permissions corrigées pour $target_dir"
    return 0
}

# Fonction pour reconstruire le fichier JavaScript
rebuild_js() {
    log "INFO" "Reconstruction du fichier JavaScript..."
    
    # Vérifier si les sources existent
    if [[ ! -f "src/ha-room-card.ts" ]]; then
        log "ERROR" "Fichier source src/ha-room-card.ts non trouvé"
        return 1
    fi
    
    # Nettoyage du build précédent
    if [[ -d "dist" ]]; then
        log "INFO" "Nettoyage du répertoire dist/..."
        rm -rf dist/*
    fi
    
    # Reconstruction
    log "INFO" "Lancement du build..."
    if command_exists "npm"; then
        npm run build
    elif command_exists "yarn"; then
        yarn build
    else
        log "ERROR" "Ni npm ni yarn n'est disponible"
        return 1
    fi
    
    # Vérification du résultat
    if [[ -f "dist/ha-room-card.js" ]]; then
        local size=$(stat -c%s "dist/ha-room-card.js" 2>/dev/null)
        if [[ $size -gt 100000 ]]; then
            log "SUCCESS" "Fichier JavaScript reconstruit avec succès ($size octets)"
            return 0
        else
            log "ERROR" "Le fichier JavaScript reconstruit est encore trop petit ($size octets)"
            return 1
        fi
    else
        log "ERROR" "Échec de la reconstruction du fichier JavaScript"
        return 1
    fi
}

# Fonction pour vérifier l'environnement Docker
check_docker_env() {
    log "INFO" "Vérification de l'environnement Docker..."
    
    # Vérifier si Docker est installé
    if ! command_exists "docker"; then
        log "ERROR" "Docker n'est pas installé"
        return 1
    fi
    
    # Vérifier si Docker Compose est installé
    if ! command_exists "docker-compose"; then
        log "ERROR" "Docker Compose n'est pas installé"
        return 1
    fi
    
    # Vérifier si le fichier docker-compose.yml existe
    if ! file_exists ".devcontainer/docker-compose.yml"; then
        log "ERROR" "Fichier .devcontainer/docker-compose.yml non trouvé"
        return 1
    fi
    
    log "SUCCESS" "Environnement Docker correct"
    return 0
}

# Fonction principale de diagnostic
run_diagnostic() {
    log "INFO" "🔍 DÉBUT DU DIAGNOSTIC DES PROBLÈMES DOCKER"
    log "INFO" "=========================================="
    
    local issues_found=0
    
    # 1. Vérification du fichier JavaScript
    log "INFO" "📄 Vérification du fichier JavaScript..."
    if ! check_js_integrity "dist/ha-room-card.js" 200000; then
        ((issues_found++))
    fi
    
    # 2. Vérification de la configuration Home Assistant
    log "INFO" "🏠 Vérification de la configuration Home Assistant..."
    if ! check_ha_config "tests/docker/homeassistant/configuration.yaml"; then
        ((issues_found++))
    fi
    
    # 3. Vérification des permissions
    log "INFO" "🔐 Vérification des permissions..."
    if ! check_permissions "dist/ha-room-card.js"; then
        ((issues++))
    fi
    
    # 4. Vérification de l'environnement Docker
    log "INFO" "🐳 Vérification de l'environnement Docker..."
    if ! check_docker_env; then
        ((issues++))
    fi
    
    # Résumé
    log "INFO "=========================================="
    if [[ $issues_found -eq 0 ]]; then
        log "SUCCESS" "✅ Aucun problème détecté"
        return 0
    else
        log "WARNING" "⚠️  $issues_found problème(s) détecté(s)"
        return 1
    fi
}

# Fonction principale de réparation
run_repair() {
    log "INFO" "🔧 DÉBUT DE LA RÉPARATION AUTOMATIQUE"
    log "INFO" "===================================="
    
    local repairs_made=0
    
    # 1. Réparation du fichier JavaScript
    log "INFO" "📄 Réparation du fichier JavaScript..."
    if ! check_js_integrity "dist/ha-room-card.js" 200000; then
        log "INFO" "Reconstruction du fichier JavaScript..."
        if rebuild_js; then
            ((repairs_made++))
        fi
    fi
    
    # 2. Migration de la configuration Home Assistant
    log "INFO" "🏠 Migration de la configuration Home Assistant..."
    if ! check_ha_config "tests/docker/homeassistant/configuration.yaml"; then
        ((repairs_made++))
    fi
    
    # 3. Correction des permissions
    log "INFO "🔐 Correction des permissions..."
    if ! check_permissions "dist/ha-room-card.js"; then
        log "INFO" "Correction des permissions..."
        if fix_permissions "dist/"; then
            ((repairs_made++))
        fi
    fi
    
    # 4. Correction des permissions du projet
    log "INFO "🔐 Correction des permissions du projet..."
    if fix_permissions "."; then
        ((repairs_made++))
    fi
    
    # Résumé
    log "INFO "===================================="
    if [[ $repairs_made -eq 0 ]]; then
        log "SUCCESS" "✅ Toutes les réparations ont été effectuées avec succès"
        return 0
    else
        log "WARNING" "⚠️ $repairs_made réparation(s) effectuée(s)"
        return 1
    fi
}

# Fonction de test après réparation
run_test() {
    log "INFO" "🧪 Test de la configuration après réparation..."
    
    # Test du build
    log "INFO" "Test du build..."
    if npm run build; then
        log "SUCCESS" "✅ Build réussi"
    else
        log "ERROR" "❌ Build échoué"
        return 1
    fi
    
    # Test de la configuration Docker
    log "INFO" "Test de la configuration Docker..."
    if npm run docker:restart; then
        log "SUCCESS" "✅ Redémarrage Docker réussi"
        
        # Attendre que Home Assistant soit prêt
        log "INFO" "Attente du démarrage de Home Assistant (30s)..."
        sleep 30
        
        # Test de base
        if curl -s http://localhost:8123 >/dev/null 2>&1; then
            log "SUCCESS" "✅ Home Assistant accessible"
        else
            log "WARNING" "⚠️ Home Assistant non accessible"
        fi
    else
        log "ERROR" "❌ Redémarrage Docker échoué"
        return 1
    fi
    
    return 0
}

# Affichage de l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "COMMANDS:"
    echo "  diagnostic    - Exécuter un diagnostic complet des problèmes Docker"
    echo "  repair      - Appliquer les corrections automatiques"
    echo "  test        - Tester la configuration après réparation"
    echo "  help        - Afficher cette aide"
    echo ""
    echo "EXEMPLES:"
    echo "  $0 diagnostic  # Diagnostic complet"
    echo "  $0 repair      # Réparation automatique"
    echo "  $0 test        # Test après réparation"
    echo ""
    echo "Ce script résout les problèmes Docker courants dans le projet ha-room-card."
}

# Programme principal
main() {
    local command="${1:-diagnostic}"
    
    case "$command" in
        "diagnostic")
            run_diagnostic
            ;;
        "repair")
            run_repair
            ;;
        "test")
            run_test
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# Exécution du programme principal
main "$@"