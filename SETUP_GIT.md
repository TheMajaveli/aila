# Setup Git et Commits Progressifs

## 🚀 Initialisation Rapide

### Option 1 : Via GitHub CLI (si installé)

```bash
# Vérifier l'authentification
gh auth status

# Créer le repo et pousser
gh repo create AI-Learning-Assistant --private --source=. --remote=origin --push
```

### Option 2 : Via Interface GitHub + Git

1. **Créer le repo sur GitHub**
   - Aller sur https://github.com/new
   - Nom : `AI-Learning-Assistant`
   - Visibilité : Private (ou Public)
   - Ne pas initialiser avec README/license/.gitignore

2. **Initialiser Git localement**
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/TheMajaveli/AI-Learning-Assistant.git
   ```

3. **Premier commit et push**
   ```bash
   git add .
   git commit -m "chore: initial commit"
   git push -u origin main
   ```

## 📝 Plan de Commits (17 étapes)

Suivez l'ordre dans `COMMITS.md`. Voici un résumé :

### Phase 1 : Setup (Commits 1-3)
- Configuration Next.js + TypeScript
- Supabase client
- Schéma DB

### Phase 2 : Chat Core (Commits 4-7)
- Layout de base
- Interface chat
- Streaming API
- Persistance

### Phase 3 : Tests (Commits 8-9)
- Setup Vitest
- Tests de base

### Phase 4 : Tools (Commits 10-15)
- Tool dispatcher
- Quiz + tests
- Memory + tests
- Flashcard

### Phase 5 : Finalisation (Commits 16-17)
- Documentation
- Config déploiement

## ✅ Checklist Avant Chaque Commit

```bash
# 1. Lint
npm run lint

# 2. Tests (quand disponibles)
npm test -- --run

# 3. Build
npm run build

# 4. Commit
git add <fichiers>
git commit -m "type(scope): description"

# 5. Push (optionnel, peut être fait à la fin)
git push origin main
```

## 🔍 Vérification Finale

Avant le push final, vérifier :

```bash
# Tous les tests passent
npm test -- --run

# Pas d'erreurs de lint
npm run lint

# Le build fonctionne
npm run build

# L'historique Git est propre
git log --oneline

# Push final
git push -u origin main
```

## 📊 Structure des Commits

Format : `type(scope): description`

Types :
- `chore` : Configuration, dépendances
- `feat` : Nouvelle fonctionnalité
- `test` : Ajout de tests
- `docs` : Documentation
- `fix` : Correction de bug

Exemples :
- `chore: init nextjs15 + ts + eslint + prettier`
- `feat(chat): basic chat layout + message bubbles`
- `test(quiz): quiz card interaction test`

## 🆘 Dépannage

### Erreur "remote origin already exists"
```bash
git remote set-url origin https://github.com/TheMajaveli/AI-Learning-Assistant.git
```

### Erreur "not a git repository"
```bash
git init
git branch -M main
```

### Erreur de push (non-fast-forward)
```bash
git pull origin main --rebase
git push origin main
```

