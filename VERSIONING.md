# 🏷️ Système de Versionnement Automatique

## Vue d'ensemble

Le projet utilise maintenant un système de versionnement sémantique (Semantic Versioning) entièrement automatisé basé sur les **conventional commits**.

## 📝 Conventional Commits

Les commits doivent suivre ce format pour que le versionnement automatique fonctionne :

### **Types de commits**

| Type | Format | Incrémentation | Description |
|-------|---------|----------------|-------------|
| `feat:` | `feat: ajouter une nouvelle fonctionnalité` | **MINOR** (1.0.0 → 1.1.0) |
| `fix:` | `fix: corriger un bug critique` | **PATCH** (1.0.0 → 1.0.1) |
| `BREAKING CHANGE:` | `feat: nouvelle fonction!` ou `BREAKING CHANGE: supprimer l'ancienne API` | **MAJOR** (1.0.0 → 2.0.0) |
| `chore:` | `chore: mettre à jour les dépendances` | **PATCH** (1.0.0 → 1.0.1) |
| `docs:` | `docs: ajouter la documentation` | **PATCH** (1.0.0 → 1.0.1) |
| `style:` | `style: corriger le formatage du code` | **PATCH** (1.0.0 → 1.0.1) |

### **Exemples**

```bash
# Nouvelle fonctionnalité → 1.0.0 → 1.1.0
git commit -m "feat: ajouter l'éditeur visuel complet"

# Correction de bug → 1.1.0 → 1.1.1  
git commit -m "fix: corriger l'affichage des températures négatives"

# Changement cassant → 1.1.1 → 2.0.0
git commit -m "feat: nouvelle API! supprimer l'ancien format"

# Maintenance → 1.1.1 → 1.1.2
git commit -m "chore: mettre à jour les dépendances"
```

## 🚀 Scripts Disponibles

### **Développement**

```bash
# Versionnement automatique (sans tag)
npm run version

# Versionnement + création de tag
npm run version-tag

# Build + commit (si version changée)
npm run build-and-commit

# Release complète (tag + build + push)
npm run release
```

### **Automatisation**

#### **Hook Git pre-commit**
```bash
# Automatique à chaque commit :
# 1. Analyse le message de commit
# 2. Incrémente la version si nécessaire  
# 3. Met à jour package.json
# 4. Build le dist/
# 5. Commit les changements
git commit -m "feat: nouvelle fonctionnalité"
# → Version automatiquement incrémentée
```

#### **GitHub Actions**
- **`update-dist.yml`** : Build automatique sur chaque push
- **`auto-release.yml`** : Release automatique sur chaque tag

## 🔄 Workflow Complet

### **Développement quotidien**

```bash
# 1. Travailler sur le code
vim src/ha-room-card.ts

# 2. Commiter (versionnement automatique)
git add .
git commit -m "feat: ajouter le support des thèmes"
# → Version passera de 1.0.0 à 1.1.0 automatiquement

# 3. Push (build automatique)
git push
# → dist/ généré et commité automatiquement
```

### **Release**

```bash
# Option 1: Release complète
npm run release

# Option 2: Manuel
git tag v1.1.0
git push --tags
# → Release GitHub créée automatiquement
```

## 📦 Fichiers Mis à Jour

Le versionnement automatique met à jour :

- ✅ `package.json` - Version principale
- ✅ `src/const.ts` - Version dans le code  
- ✅ `README.md` - Documentation
- ✅ `CHANGELOG.md` - Historique des versions
- ✅ `hacs-repository-info.json` - Info HACS

## 🏷️ Tags et Releases

### **Création automatique**
```bash
npm run version-tag    # Crée le tag localement
git push --tags      # Pousse les tags → Release GitHub
```

### **Structure des releases**
- **Numéro de version** : `v1.2.3`
- **Changelog** : Généré automatiquement depuis les commits
- **Fichiers inclus** : `ha-room-card.js`, schéma JSON, types

## 🎯 Bonnes Pratiques

### **1. Messages de commit clairs**
```bash
✅ Bon : "feat: ajouter le support des icônes personnalisées"
✅ Bon : "fix: résoudre le crash quand aucune entité n'est définie"
❌ Mauvais : "update stuff"
❌ Mauvais : "fix bug"
```

### **2. Commits atomiques**
Un commit = une seule fonctionnalité ou correction

### **3. Version cohérente**
- **MAJOR** : Changements qui cassent la compatibilité
- **MINOR** : Nouvelles fonctionnalités (compatible)  
- **PATCH** : Corrections et améliorations

## 📊 Exemple de Cycle

```bash
# État initial : v1.0.0

git commit -m "feat: éditeur visuel"
# → v1.1.0 (minor)

git commit -m "fix: bug affichage température"
# → v1.1.1 (patch)

git commit -m "feat: nouvelle API! supprimer ancien format"  
# → v2.0.0 (major)

git commit -m "docs: mettre à jour README"
# → v2.0.1 (patch)

npm run release
# → Tag v2.0.1 + Release GitHub
```

Le système garantit un versionnement cohérent et automatique ! 🎉