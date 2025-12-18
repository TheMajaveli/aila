# Guide de Configuration Supabase

## 📋 Étapes pour Connecter Supabase

### 1. Créer un Compte et un Projet Supabase

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Créer un compte** (ou se connecter si vous en avez déjà un)
3. **Créer un nouveau projet** :
   - Cliquer sur "New Project"
   - Choisir une organisation
   - Remplir les informations :
     - **Name** : `ai-learning-assistant` (ou le nom de votre choix)
     - **Database Password** : Créer un mot de passe fort (⚠️ **SAVEZ-LE**, vous en aurez besoin)
     - **Region** : Choisir la région la plus proche (ex: `West US` pour les USA, `West Europe` pour l'Europe)
   - Cliquer sur "Create new project"
   - ⏳ Attendre 2-3 minutes que le projet soit créé

### 2. Exécuter le Schéma SQL

1. **Ouvrir le SQL Editor** :
   - Dans le dashboard Supabase, cliquer sur "SQL Editor" dans le menu de gauche
   - Cliquer sur "New query"

2. **Copier le schéma** :
   - Ouvrir le fichier `supabase-schema.sql` de votre projet
   - Copier tout le contenu

3. **Exécuter le script** :
   - Coller le contenu dans l'éditeur SQL de Supabase
   - Cliquer sur "Run" (ou `Cmd+Enter` / `Ctrl+Enter`)
   - ✅ Vérifier que les tables sont créées :
     - `conversations`
     - `messages`
     - `memories`

4. **Vérifier les tables** :
   - Aller dans "Table Editor" dans le menu de gauche
   - Vous devriez voir les 3 tables créées

### 3. Récupérer les Clés API

1. **Aller dans Settings → API** :
   - Dans le dashboard Supabase, cliquer sur l'icône ⚙️ "Settings"
   - Cliquer sur "API" dans le menu

2. **Récupérer les informations** :
   - **Project URL** : `https://xxxxx.supabase.co`
     - C'est votre `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - C'est votre `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
     - C'est votre `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **IMPORTANT** : Cette clé est secrète, ne la partagez jamais publiquement !

### 4. Configurer les Variables d'Environnement

1. **Créer le fichier `.env.local`** à la racine du projet :
   ```bash
   touch .env.local
   ```

2. **Ajouter les variables** :
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # OpenAI Configuration
   OPENAI_API_KEY=sk-...
   ```

3. **Remplacer les valeurs** :
   - Remplacez `https://xxxxx.supabase.co` par votre Project URL
   - Remplacez les clés `eyJhbGci...` par vos vraies clés
   - Ajoutez votre clé OpenAI API

### 5. Vérifier la Connexion

1. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Tester la connexion** :
   - Ouvrir l'application dans le navigateur
   - Envoyer un message dans le chat
   - Vérifier dans Supabase → Table Editor → `messages` que le message est sauvegardé

## 🔍 Vérification de la Connexion

### Test Rapide avec Node.js

Créez un fichier `test-supabase.js` :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Test de connexion
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion:', error);
    } else {
      console.log('✅ Connexion Supabase réussie !');
    }
  } catch (err) {
    console.error('❌ Erreur:', err);
  }
}

testConnection();
```

Exécutez :
```bash
node test-supabase.js
```

## 🛠️ Structure de la Base de Données

### Table `conversations`
- `id` : UUID (clé primaire)
- `user_id` : TEXT (identifiant utilisateur)
- `title` : TEXT (titre optionnel)
- `created_at` : TIMESTAMPTZ
- `updated_at` : TIMESTAMPTZ

### Table `messages`
- `id` : UUID (clé primaire)
- `conversation_id` : UUID (référence à conversations)
- `role` : TEXT ('user', 'assistant', 'system')
- `content` : TEXT (contenu du message)
- `tool_calls` : JSONB (appels d'outils et résultats)
- `created_at` : TIMESTAMPTZ

### Table `memories`
- `id` : UUID (clé primaire)
- `user_id` : TEXT (identifiant utilisateur)
- `content` : TEXT (contenu de la mémoire)
- `type` : TEXT ('preference', 'objectif', 'connaissance', 'autre')
- `created_at` : TIMESTAMPTZ

## 🔒 Sécurité

### Clés API

- **`NEXT_PUBLIC_SUPABASE_URL`** : Peut être publique (utilisée côté client)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** : Peut être publique mais limitée (utilisée côté client)
- **`SUPABASE_SERVICE_ROLE_KEY`** : ⚠️ **SECRÈTE** - Ne jamais exposer côté client !

### Bonnes Pratiques

1. ✅ Ne jamais commiter `.env.local` dans Git
2. ✅ Utiliser `.env.local` pour le développement local
3. ✅ Utiliser les variables d'environnement du service de déploiement (Vercel/Netlify) pour la production
4. ✅ Activer Row Level Security (RLS) en production

## 🆘 Dépannage

### Erreur "Invalid API key"
- Vérifier que vous avez copié la bonne clé (anon vs service_role)
- Vérifier qu'il n'y a pas d'espaces avant/après les clés dans `.env.local`

### Erreur "relation does not exist"
- Vérifier que vous avez bien exécuté le script SQL `supabase-schema.sql`
- Vérifier dans Table Editor que les tables existent

### Erreur de connexion
- Vérifier que `NEXT_PUBLIC_SUPABASE_URL` est correct
- Vérifier que le projet Supabase est actif (pas en pause)
- Vérifier votre connexion internet

### Les données ne se sauvegardent pas
- Vérifier que les variables d'environnement sont bien chargées (redémarrer `npm run dev`)
- Vérifier la console du navigateur pour les erreurs
- Vérifier les logs Supabase dans le dashboard

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide JavaScript/TypeScript](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

