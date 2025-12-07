# Guide de soumission HACS pour HA Room Card

## 📋 Prérequis

- ✅ Repository GitHub public
- ✅ Fichier `hacs.json` configuré
- ✅ Documentation complète (README.md)
- ✅ License (MIT)
- ✅ Version taguée
- ✅ Build de production disponible

## 🚀 Étapes pour soumettre à HACS

### 1. Préparer le repository

```bash
# Créer un tag de version
git tag v1.0.0
git push origin v1.0.0

# Push vers GitHub
git push origin main
```

### 2. Soumettre à HACS

1. Allez sur [HACS Repository](https://hacs.xyz/docs/publish/start)
2. Cliquez sur **"New repository"**
3. Remplissez le formulaire :
   - **Repository**: `votre-username/ha-room-card`
   - **Category**: `Lovelace`
   - **Country**: `FR`
   - **Status**: `Active`

### 3. Informations pour la soumission

**Nom**: HA Room Card  
**Description**: Custom room card with modern design and interactive features  
**Catégorie**: Lovelace  
**Pays**: FR  
**Documentation**: [README.md](README.md)  
**License**: MIT  

## 📁 Structure requise pour HACS

```
ha-room-card/
├── dist/
│   ├── ha-room-card.js          # Fichier principal
│   └── ha-room-card.js.map      # Source map
├── hacs.json                   # Configuration HACS
├── README.md                   # Documentation
├── LICENSE                     # License MIT
├── CHANGELOG.md                # Historique des versions
└── example.yaml               # Exemple de configuration
```

## ✅ Checklist de validation

- [x] Fichier `hacs.json` présent et valide
- [x] Build de production dans `dist/`
- [x] Documentation complète en français
- [x] License MIT
- [x] Tags de version
- [x] GitHub Actions pour CI/CD
- [x] Exemples de configuration
- [x] Changelog
- [x] Compatible Home Assistant 2023.9+

## 📝 Configuration HACS

Le fichier `hacs.json` contient :

```json
{
  "name": "HA Room Card",
  "render_readme": true,
  "zip_release": true,
  "filename": "ha-room-card.js",
  "files": [
    "dist/ha-room-card.js",
    "dist/ha-room-card.js.map"
  ],
  "homeassistant": "2023.9.0",
  "persistent_directory": false,
  "country": ["FR"],
  "domains": ["lovelace"],
  "homeassistant_version": "2023.9.0"
}
```

## 🔄 Processus de review HACS

1. **Validation automatique** (24-48h)
2. **Review manuelle** (3-7 jours)
3. **Publication** (si validé)

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: README.md
- **Exemples**: example.yaml

---

**Note**: Ce projet est prêt pour la soumission HACS et suit toutes les recommandations officielles.