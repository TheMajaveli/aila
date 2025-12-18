# 🚀 Guide de Déploiement sur Vercel

## Étapes pour publier votre application

### 1. Préparer le code (si pas déjà fait)

```bash
# Vérifier que tout est commité
git status

# Si nécessaire, commit et push
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Créer un compte / Se connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Sign Up"** ou **"Log In"**
3. Se connecter avec GitHub (recommandé pour l'intégration Git)

### 3. Importer le projet

1. Dans le dashboard Vercel, cliquer sur **"Add New..."** → **"Project"**
2. Importer depuis GitHub :
   - Sélectionner votre repository
   - Ou connecter votre compte GitHub si pas déjà fait
3. Vercel détectera automatiquement Next.js

### 4. Configurer les variables d'environnement

**⚠️ IMPORTANT :** Configurer ces variables dans Vercel avant de déployer :

Dans la section **"Environment Variables"** du projet, ajouter :

```
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role_supabase
GEMINI_API_KEY=votre_cle_gemini_api
```

**Comment trouver ces valeurs :**

- **Supabase** :
  - Aller sur [supabase.com](https://supabase.com)
  - Ouvrir votre projet
  - Settings → API
  - Copier `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - Copier `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Copier `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

- **Gemini API Key** :
  - Aller sur [Google AI Studio](https://makersuite.google.com/app/apikey)
  - Créer ou récupérer votre clé API
  - Copier → `GEMINI_API_KEY`

### 5. Configurer le projet

Vercel détecte automatiquement :
- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automatique)
- **Output Directory**: `.next` (automatique)
- **Install Command**: `npm install` (automatique)

**Vérifier que c'est correct :**
- Framework: Next.js
- Root Directory: `./` (ou laisser vide si à la racine)
- Build Command: `npm run build`
- Output Directory: (laisser vide, Next.js gère automatiquement)

### 6. Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du build (2-3 minutes)
3. Vercel générera une URL : `https://votre-projet.vercel.app`

### 7. Vérifier le déploiement

1. Ouvrir l'URL fournie
2. Tester l'application :
   - Vérifier que le chat fonctionne
   - Tester un quiz : "Fais-moi un quiz sur React"
   - Tester une mémoire : "Je prépare un concours et j'ai du mal avec les probabilités"

### 8. (Optionnel) Configurer un domaine personnalisé

1. Dans les paramètres du projet → **Domains**
2. Ajouter votre domaine personnalisé
3. Suivre les instructions DNS

## 🔧 Dépannage

### Erreur de build

Si le build échoue :
1. Vérifier les logs dans Vercel
2. Tester localement : `npm run build`
3. Vérifier que toutes les variables d'environnement sont définies

### Erreur "API key not configured"

- Vérifier que `GEMINI_API_KEY` est bien définie dans Vercel
- Redéployer après avoir ajouté les variables

### Erreur Supabase

- Vérifier que les 3 variables Supabase sont définies
- Vérifier que les tables existent dans Supabase (exécuter `supabase-schema.sql`)

### Variables d'environnement non prises en compte

- Les variables doivent être ajoutées **avant** le premier déploiement
- Ou redéployer après les avoir ajoutées
- Vérifier qu'elles sont dans l'environnement **Production** (et Development/Preview si besoin)

## 📝 Checklist avant déploiement

- [ ] Code commité et pushé sur GitHub
- [ ] Variables d'environnement Supabase prêtes
- [ ] Clé API Gemini prête
- [ ] Base de données Supabase configurée (tables créées)
- [ ] Test local réussi : `npm run build`
- [ ] `.env.local` ne contient pas de secrets commités (déjà dans `.gitignore`)

## 🎯 URL de déploiement

Une fois déployé, votre URL sera :
```
https://votre-projet.vercel.app
```

Vercel génère aussi des URLs de preview pour chaque commit/PR.

## 💡 Astuce

Pour les déploiements futurs :
- Chaque push sur `main` déclenchera un nouveau déploiement automatiquement
- Les Pull Requests génèrent des preview deployments
- Vous pouvez aussi déployer manuellement depuis le dashboard

