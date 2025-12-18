# Guide de Démarrage Rapide

## Installation en 5 minutes

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Dans le SQL Editor, exécuter le contenu de `supabase-schema.sql`
4. Récupérer les clés depuis Settings → API

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...
```

### 4. Lancer le serveur

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Tester les fonctionnalités

### Test 1 : Quiz
Tapez : "Fais-moi un quiz sur React"

### Test 2 : Mémoire
Tapez : "Je prépare un concours et j'ai du mal avec les probabilités"

### Test 3 : Flashcard
Tapez : "Crée une carte mémoire pour la formule E=mc²"

## Vérification

- ✅ Les messages s'affichent correctement
- ✅ Le streaming fonctionne
- ✅ Les quiz sont interactifs
- ✅ Les mémoires sont sauvegardées (vérifier dans Supabase)
- ✅ Les conversations persistent après rafraîchissement

