FROM mcr.microsoft.com/devcontainers/typescript-node:20

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    pipx \
    git \
    && rm -rf /var/lib/apt/lists/*

# Installation de Home Assistant CLI (optionnel)
RUN pipx install homeassistant-cli

# Installation des dépendances Playwright
RUN npx playwright install-deps