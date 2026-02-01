#!/bin/bash

# =============================================================================
# Script de vérification de la configuration Docker pour ha-room-card
# Valide que les corrections appliquées fonctionnent correctement
# =============================================================================

set -e  # Arrêter le script en cas d'erreur

# Couleurs pour les messages
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="ha-room-card"
MIN_JS_SIZE=200000  # Taille minimale attendue pour le fichier JS
HA_PORT=8123
HA_TIMEOUT=60  # Timeout pour vérifier Home Assistant

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

# Fonction pour obtenir la taille d'un fichier
get_file_size() {
    local file="$1"
    if [[ -f "$file" ]]; then
        stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0"
    else
        echo "0"
    fi
}

# Fonction pour vérifier l'intégrité du fichier JavaScript
verify_js_file() {
    local js_file="dist/ha-room-card.js"
    local source_file="src/ha-room-card.ts"
    
    log "INFO" "📄 Vérification du fichier JavaScript..."
    
    # Vérifier que le fichier source existe
    if ! file_exists "$source_file"; then
        log "ERROR" "Fichier source $source_file non trouvé"
        return 1
    fi
    
    # Vérifier que le fichier compilé existe
    if ! file_exists "$js_file"; then
        log "ERROR" "Fichier compilé $js_file non trouvé"
        return 1
    fi
    
    # Vérifier la taille du fichier
    local js_size=$(get_file_size "$js_file")
    log "INFO" "Taille du fichier JavaScript: $js_size octets"
    
    if [[ $js_size -lt $MIN_JS_SIZE ]]; then
        log "ERROR" "Le fichier JavaScript est trop petit ($js_size < $MIN_JS_SIZE octets)"
        log "INFO" "Le fichier semble être tronqué ou incomplet"
        return 1
    fi
    
    # Vérifier que le fichier contient du code valide (recherche dans fichier minifié)
    if ! grep -q "customElements.define.*ha-room-card" "$js_file"; then
        log "ERROR" "Le fichier JavaScript ne contient pas l'élément personnalisé ha-room-card"
        return 1
    fi
    
    # Vérifier que le fichier n'est pas corrompu (vérification de base)
    if ! node -c "$js_file" 2>/dev/null; then
        log "ERROR" "Le fichier JavaScript contient des erreurs de syntaxe"
        return 1
    fi
    
    log "SUCCESS" "✅ Fichier JavaScript valide ($js_size octets)"
    return 0
}

# Fonction pour vérifier la configuration Home Assistant
verify_ha_config() {
    local config_file="tests/docker/homeassistant/configuration.yaml"
    
    log "INFO" "🏠 Vérification de la configuration Home Assistant..."
    
    # Vérifier que le fichier de configuration existe
    if ! file_exists "$config_file"; then
        log "ERROR" "Fichier de configuration $config_file non trouvé"
        return 1
    fi
    
    # Vérifier que server_host n'est plus présent
    if grep -q "server_host" "$config_file"; then
        log "ERROR" "Configuration obsolète détectée: server_host est encore présent"
        return 1
    fi
    
    # Vérifier les éléments de configuration requis
    local required_configs=(
        "homeassistant:"
        "frontend:"
        "http:"
    )
    
    for config in "${required_configs[@]}"; do
        if ! grep -q "$config" "$config_file"; then
            log "WARNING" "Élément de configuration manquant: $config"
        fi
    done
    
    # Vérifier la syntaxe YAML
    if command_exists "python3"; then
        if python3 -c "import yaml; yaml.safe_load(open('$config_file'))" 2>/dev/null; then
            log "SUCCESS" "✅ Configuration YAML valide"
        else
            log "ERROR" "Le fichier de configuration YAML contient des erreurs de syntaxe"
            return 1
        fi
    else
        log "WARNING" "Python3 non disponible, impossible de valider la syntaxe YAML"
    fi
    
    return 0
}

# Fonction pour vérifier les permissions
verify_permissions() {
    log "INFO" "🔐 Vérification des permissions..."
    
    local issues=0
    
    # Vérifier les permissions du répertoire du projet
    if [[ ! -r "." || ! -w "." ]]; then
        log "ERROR" "Permissions incorrectes sur le répertoire du projet"
        ((issues++))
    fi
    
    # Vérifier les permissions des fichiers critiques
    local critical_files=(
        "dist/ha-room-card.js"
        "src/ha-room-card.ts"
        "package.json"
        "tests/docker/homeassistant/configuration.yaml"
    )
    
    for file in "${critical_files[@]}"; do
        if file_exists "$file"; then
            if [[ ! -r "$file" ]]; then
                log "ERROR" "Fichier $file non lisible"
                ((issues++))
            fi
            
            # Pour les fichiers de configuration, vérifier l'écriture
            if [[ "$file" == *"configuration.yaml" ]] && [[ ! -w "$file" ]]; then
                log "ERROR" "Fichier de configuration $file non modifiable"
                ((issues++))
            fi
        else
            log "WARNING" "Fichier critique $file non trouvé"
            ((issues++))
        fi
    done
    
    # Vérifier les permissions des scripts
    local script_files=(
        "scripts/fix-docker-issues.sh"
        "scripts/verify-docker-setup.sh"
    )
    
    for script in "${script_files[@]}"; do
        if file_exists "$script"; then
            if [[ ! -x "$script" ]]; then
                log "WARNING" "Script $script n'est pas exécutable"
                chmod +x "$script"
                log "INFO" "Script $script rendu exécutable"
            fi
        fi
    done
    
    if [[ $issues -eq 0 ]]; then
        log "SUCCESS" "✅ Permissions correctes"
        return 0
    else
        log "ERROR" "$issues problème(s) de permissions détecté(s)"
        return 1
    fi
}

# Fonction pour vérifier l'environnement Docker
verify_docker_env() {
    log "INFO" "🐳 Vérification de l'environnement Docker..."
    
    # Vérifier si Docker est installé et fonctionne
    if ! command_exists "docker"; then
        log "ERROR" "Docker n'est pas installé"
        return 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        log "ERROR" "Docker n'est pas en cours d'exécution ou n'a pas les permissions nécessaires"
        return 1
    fi
    
    # Vérifier si Docker Compose est installé
    if ! command_exists "docker-compose"; then
        log "ERROR" "Docker Compose n'est pas installé"
        return 1
    fi
    
    # Vérifier les fichiers de configuration Docker
    local docker_files=(
        ".devcontainer/docker-compose.yml"
        ".devcontainer/Dockerfile"
        ".dockerignore"
    )
    
    for file in "${docker_files[@]}"; do
        if ! file_exists "$file"; then
            log "ERROR" "Fichier Docker $file non trouvé"
            return 1
        fi
    done
    
    # Vérifier que les conteneurs peuvent être listés
    if ! docker-compose -f .devcontainer/docker-compose.yml ps >/dev/null 2>&1; then
        log "WARNING" "Impossible de lister les conteneurs Docker Compose"
    fi
    
    log "SUCCESS" "✅ Environnement Docker correct"
    return 0
}

# Fonction pour vérifier que Home Assistant est accessible
verify_ha_accessibility() {
    log "INFO" "🌐 Vérification de l'accessibilité de Home Assistant..."
    
    # Vérifier si Home Assistant est en cours d'exécution
    local ha_container="ha-room-card_homeassistant_1"
    
    if ! docker ps --format "table {{.Names}}" | grep -q "$ha_container"; then
        log "WARNING" "Conteneur Home Assistant non trouvé ou non démarré"
        log "INFO" "Tentative de démarrage des conteneurs..."
        
        if ! docker-compose -f .devcontainer/docker-compose.yml up -d; then
            log "ERROR" "Échec du démarrage des conteneurs Docker"
            return 1
        fi
        
        log "INFO" "Attente du démarrage de Home Assistant ($HA_TIMEOUT secondes)..."
        local count=0
        while [[ $count -lt $HA_TIMEOUT ]]; do
            if curl -s --max-time 5 "http://localhost:$HA_PORT" >/dev/null 2>&1; then
                break
            fi
            sleep 1
            ((count++))
            echo -n "."
        done
        echo ""
    fi
    
    # Vérifier l'accessibilité HTTP
    if curl -s --max-time 10 "http://localhost:$HA_PORT" >/dev/null 2>&1; then
        log "SUCCESS" "✅ Home Assistant accessible sur http://localhost:$HA_PORT"
        
        # Vérifier la réponse HTTP
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$HA_PORT" 2>/dev/null)
        if [[ "$http_status" == "200" ]]; then
            log "SUCCESS" "✅ Home Assistant répond correctement (HTTP $http_status)"
        else
            log "WARNING" "Home Assistant répond avec le code HTTP $http_status"
        fi
        
        return 0
    else
        log "ERROR" "Home Assistant n'est pas accessible sur http://localhost:$HA_PORT"
        return 1
    fi
}

# Fonction pour vérifier l'intégration de la carte
verify_card_integration() {
    log "INFO" "🎯 Vérification de l'intégration de la carte..."
    
    # Vérifier que le fichier JavaScript est présent dans le répertoire www
    local www_file="tests/docker/homeassistant/www/community/ha-room-card/ha-room-card.js"
    
    if file_exists "$www_file"; then
        local www_size=$(get_file_size "$www_file")
        log "INFO" "Fichier de carte trouvé dans www ($www_size octets)"
        
        # Comparer avec le fichier dist
        local dist_size=$(get_file_size "dist/ha-room-card.js")
        if [[ $www_size -eq $dist_size ]]; then
            log "SUCCESS" "✅ Fichier de carte synchronisé avec dist/"
        else
            log "WARNING" "Le fichier dans www/ n'est pas synchronisé avec dist/"
        fi
    else
        log "WARNING" "Fichier de carte non trouvé dans www/community/ha-room-card/"
    fi
    
    # Vérifier la configuration de la carte dans Home Assistant
    local ha_config="tests/docker/homeassistant/configuration.yaml"
    if file_exists "$ha_config"; then
        if grep -q "ha-room-card" "$ha_config"; then
            log "SUCCESS" "✅ Configuration de la carte trouvée dans configuration.yaml"
        else
            log "INFO" "Aucune configuration de carte trouvée (normal pour un environnement de test)"
        fi
    fi
    
    return 0
}

# Fonction pour vérifier le workflow de développement
verify_dev_workflow() {
    log "INFO" "🔄 Vérification du workflow de développement..."
    
    # Vérifier les scripts npm
    local package_json="package.json"
    if file_exists "$package_json"; then
        local required_scripts=(
            "build"
            "dev"
            "docker:restart"
        )
        
        for script in "${required_scripts[@]}"; do
            if grep -q "\"$script\":" "$package_json"; then
                log "SUCCESS" "✅ Script npm '$script' trouvé"
            else
                log "WARNING" "Script npm '$script' non trouvé"
            fi
        done
    fi
    
    # Vérifier que le build fonctionne
    log "INFO" "Test du build..."
    if npm run build >/dev/null 2>&1; then
        log "SUCCESS" "✅ Build npm réussi"
    else
        log "ERROR" "❌ Build npm échoué"
        return 1
    fi
    
    return 0
}

# Fonction pour générer un rapport de vérification
generate_report() {
    local exit_code=$1
    local report_file="docker-verification-report.txt"
    
    {
        echo "=== RAPPORT DE VÉRIFICATION DOCKER ==="
        echo "Projet: $PROJECT_NAME"
        echo "Date: $(date)"
        echo "========================================"
        echo ""
        
        echo "Fichier JavaScript:"
        echo "- Taille: $(get_file_size "dist/ha-room-card.js") octets"
        echo "- Présent: $([ -f "dist/ha-room-card.js" ] && echo "Oui" || echo "Non")"
        echo ""
        
        echo "Configuration Home Assistant:"
        echo "- Présente: $([ -f "tests/docker/homeassistant/configuration.yaml" ] && echo "Oui" || echo "Non")"
        echo "- server_host: $([ -f "tests/docker/homeassistant/configuration.yaml" ] && (grep -q "server_host" && echo "Présent (obsolète)" || echo "Absent (correct)") || echo "N/A")"
        echo ""
        
        echo "Environnement Docker:"
        echo "- Docker: $(command_exists docker && echo "Installé" || echo "Non installé")"
        echo "- Docker Compose: $(command_exists docker-compose && echo "Installé" || echo "Non installé")"
        echo ""
        
        echo "Accessibilité Home Assistant:"
        if curl -s --max-time 5 "http://localhost:$HA_PORT" >/dev/null 2>&1; then
            echo "- Statut: Accessible"
        else
            echo "- Statut: Non accessible"
        fi
        echo ""
        
        echo "Résultat global: $([ $exit_code -eq 0 ] && echo "✅ SUCCÈS" || echo "❌ ÉCHEC")"
        
    } > "$report_file"
    
    log "INFO" "Rapport de vérification généré: $report_file"
}

# Fonction principale de vérification
run_verification() {
    log "INFO" "🔍 DÉBUT DE LA VÉRIFICATION COMPLÈTE"
    log "INFO" "==================================="
    
    local checks_passed=0
    local total_checks=7
    
    # 1. Vérification du fichier JavaScript
    if verify_js_file; then
        ((checks_passed++))
    fi
    
    # 2. Vérification de la configuration Home Assistant
    if verify_ha_config; then
        ((checks_passed++))
    fi
    
    # 3. Vérification des permissions
    if verify_permissions; then
        ((checks_passed++))
    fi
    
    # 4. Vérification de l'environnement Docker
    if verify_docker_env; then
        ((checks_passed++))
    fi
    
    # 5. Vérification de l'accessibilité de Home Assistant
    if verify_ha_accessibility; then
        ((checks_passed++))
    fi
    
    # 6. Vérification de l'intégration de la carte
    if verify_card_integration; then
        ((checks_passed++))
    fi
    
    # 7. Vérification du workflow de développement
    if verify_dev_workflow; then
        ((checks_passed++))
    fi
    
    # Résumé
    log "INFO" "==================================="
    log "INFO" "Vérifications terminées: $checks_passed/$total_checks réussies"
    
    if [[ $checks_passed -eq $total_checks ]]; then
        log "SUCCESS" "🎉 Toutes les vérifications ont réussi !"
        generate_report 0
        return 0
    else
        log "WARNING" "⚠️  Certaines vérifications ont échoué"
        generate_report 1
        return 1
    fi
}

# Fonction de vérification rapide
run_quick_check() {
    log "INFO" "⚡ Vérification rapide..."
    
    # Vérifications essentielles uniquement
    local essential_checks=0
    
    # Fichier JavaScript
    if verify_js_file; then
        ((essential_checks++))
    fi
    
    # Configuration Home Assistant
    if verify_ha_config; then
        ((essential_checks++))
    fi
    
    # Accessibilité Home Assistant
    if verify_ha_accessibility; then
        ((essential_checks++))
    fi
    
    if [[ $essential_checks -eq 3 ]]; then
        log "SUCCESS" "✅ Vérification rapide réussie"
        return 0
    else
        log "ERROR" "❌ Vérification rapide échouée"
        return 1
    fi
}

# Affichage de l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "COMMANDS:"
    echo "  full        - Exécuter une vérification complète (défaut)"
    echo "  quick       - Exécuter une vérification rapide des éléments essentiels"
    echo "  js          - Vérifier uniquement le fichier JavaScript"
    echo "  ha-config   - Vérifier uniquement la configuration Home Assistant"
    echo "  docker      - Vérifier uniquement l'environnement Docker"
    echo "  help        - Afficher cette aide"
    echo ""
    echo "EXEMPLES:"
    echo "  $0              # Vérification complète"
    echo "  $0 quick        # Vérification rapide"
    echo "  $0 js           # Vérification du fichier JavaScript uniquement"
    echo ""
    echo "Ce script vérifie que les corrections Docker fonctionnent correctement."
}

# Programme principal
main() {
    local command="${1:-full}"
    
    case "$command" in
        "full")
            run_verification
            ;;
        "quick")
            run_quick_check
            ;;
        "js")
            verify_js_file
            ;;
        "ha-config")
            verify_ha_config
            ;;
        "docker")
            verify_docker_env
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