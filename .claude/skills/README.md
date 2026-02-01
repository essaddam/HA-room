# Home Assistant Development Skill

Skill Claude Code pour le développement Home Assistant - créé pour le projet HA-room.

## Installation du skill

```bash
# Copier le skill dans le dossier global de Claude Code
cp home-assistant-dev.skill ~/.claude/skills/

# Ou utiliser directement dans ce projet
# Le skill est déjà disponible dans .claude/skills/home-assistant-dev/
```

## Contenu du skill

### SKILL.md (Guide principal)
- Configuration rapide et authentification
- Gestion des API keys (4 méthodes sécurisées)
- REST API avec client Python complet
- WebSocket API avec client Python/JavaScript
- hass-cli (toutes les commandes)
- Workflows d'automatisation
- Développement d'intégrations

### Références détaillées

| Fichier | Contenu |
|---------|---------|
| `api-rest.md` | Tous les endpoints REST API |
| `api-websocket.md` | WebSocket API complète |
| `hass-cli.md` | Commandes hass-cli |
| `security.md` | Best practices sécurité |
| `platforms.md` | 30+ plateformes HA |
| `config-flow.md` | Patterns config flow avancés |
| `entity-patterns.md` | Patterns entités (lifecycle, state) |

## Utilisation pour HA-room

Ce skill peut aider à :

1. **Créer des intégrations** pour HA-room
2. **Automatiser** les tests et déploiements
3. **Sécuriser** la gestion des tokens API
4. **Documenter** les best practices du projet

### Exemples de prompts

```
"Crée un script Python pour tester l'intégration HA-room"
"Comment sécuriser les tokens Home Assistant dans ce projet ?"
"Génère une config flow pour HA-room"
"Explique comment utiliser l'API WebSocket avec HA-room"
```

## Sources utilisées pour créer ce skill

- Documentation officielle Home Assistant: https://developers.home-assistant.io/
- GitHub skill référence: https://github.com/komal-SkyNET/claude-skill-homeassistant
- Home Assistant REST API: https://developers.home-assistant.io/docs/api/rest
- Home Assistant WebSocket API: https://developers.home-assistant.io/docs/api/websocket
- hass-cli: https://github.com/home-assistant-ecosystem/home-assistant-cli

## Date de création
Février 2026
