# 🚀 Configuration du build automatique pour HACS

## Le problème résolu

HACS nécessite un fichier JavaScript compilé (`ha-room-card.js`) pour fonctionner correctement avec l'éditeur visuel. Les fichiers TypeScript ne peuvent pas être utilisés directement.

## Solution mise en place

### 1. **Build automatique via GitHub Actions**

Le workflow `.github/workflows/update-dist.yml` est configuré pour :
- ✅ Détecter les changements dans les fichiers source
- ✅ Builder automatiquement le `dist/` 
- ✅ Commiter les fichiers compilés
- ✅ Fonctionner sur `push` et `pull request`

### 2. **Build local avant commit**

Pour les développeurs, plusieurs options :

#### Option A : Script manuel recommandé
```bash
npm run pre-commit
git add .
git commit -m "votre message"
```

#### Option B : Build et commit en une commande
```bash
npm run build-and-commit
```

#### Option C : Hook Git automatique (Windows)

Sous Windows, créez le hook manuellement :

1. **Copiez le fichier hook :**
   ```bash
   copy .git\hooks\pre-commit .git\hooks\pre-commit.sample
   ```

2. **Rendez-le exécutable :**
   - Clic droit sur `pre-commit`
   - Propriétés
   - Décochez "Bloquer"
   - Appliquez

3. **Activez les hooks Git :**
   ```bash
   git config core.autocrlf false
   git config core.filemode false
   ```

### 3. **Configuration HACS finale**

Le `hacs.json` est maintenant configuré correctement :

```json
{
  "name": "HA Room Card",
  "filename": "ha-room-card.js",
  "homeassistant": "2025.12.0",
  "persistent_directory": true,
  "zip_release": false,
  "javascript": true
}
```

## 🔄 Workflow de développement

1. **Modifiez les fichiers source** dans `src/`
2. **Lancez le build** : `npm run pre-commit`
3. **Committez** : les fichiers `dist/` sont inclus automatiquement
4. **Push** : GitHub Actions s'assure que le `dist` est à jour

## 📦 Fichiers générés

Le build crée dans `dist/` :
- `ha-room-card.js` - Carte principale avec éditeur
- `ha-room-card-schema.json` - Schéma pour l'éditeur visuel
- Fichiers de définition TypeScript (`.d.ts`)
- Source maps (`.js.map`)

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. **Installez via HACS**
2. **L'éditeur visuel devrait apparaître** dans l'interface de Home Assistant
3. **Pas besoin de configuration manuelle** dans `resources:`

## 🎯 Résultat

- ✅ **HACS fonctionne** avec l'éditeur visuel complet
- ✅ **Build automatique** à chaque commit/push
- ✅ **Développement rapide** avec les fichiers source
- ✅ **Pas de configuration manuelle** requise

L'éditeur visuel est maintenant entièrement compatible avec HACS !