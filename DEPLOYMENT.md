# Guide de Déploiement

## Prérequis

1. Compte Supabase avec un projet créé
2. Clé API OpenAI
3. Compte Vercel ou Netlify

## Configuration Supabase

### 1. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et les clés API

### 2. Exécuter le schéma SQL

1. Dans le dashboard Supabase, aller dans "SQL Editor"
2. Copier le contenu de `supabase-schema.sql`
3. Exécuter le script SQL
4. Vérifier que les tables sont créées :
   - `conversations`
   - `messages`
   - `memories`

### 3. Récupérer les clés API

Dans les paramètres du projet Supabase :
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ à garder secret)

## Configuration Vercel

### 1. Préparer le repository

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Déployer sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer le repository GitHub
4. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
5. Cliquer sur "Deploy"

### 3. Vérifier le déploiement

Une fois déployé, Vercel fournira une URL. Tester :
- L'interface de chat se charge
- Les messages sont sauvegardés
- Les outils fonctionnent (quiz, mémoire, flashcard)

## Configuration Netlify (Alternative)

### 1. Préparer le build

Créer un fichier `netlify.toml` :

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 2. Déployer

1. Aller sur [netlify.com](https://netlify.com)
2. Importer le projet depuis GitHub
3. Configurer les variables d'environnement (même que Vercel)
4. Déployer

## Variables d'environnement

Créer un fichier `.env.local` pour le développement local :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
```

⚠️ **Important** : Ne jamais commiter `.env.local` dans Git !

## Vérification Post-Déploiement

1. ✅ L'application se charge sans erreur
2. ✅ Le chat fonctionne et affiche les messages
3. ✅ Les quiz s'affichent et sont interactifs
4. ✅ Les mémoires sont sauvegardées (vérifier dans Supabase)
5. ✅ Les conversations persistent après rafraîchissement
6. ✅ Les flashcards sont fonctionnelles

## Dépannage

### Erreur de connexion Supabase
- Vérifier que les variables d'environnement sont correctement configurées
- Vérifier que les clés API sont valides

### Erreur OpenAI
- Vérifier que la clé API OpenAI est valide
- Vérifier les quotas de l'API

### Messages non sauvegardés
- Vérifier que les tables Supabase existent
- Vérifier les permissions RLS (si activées)

