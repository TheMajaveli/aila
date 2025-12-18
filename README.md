# AI Learning Assistant

Assistant d'apprentissage intelligent avec fonctionnalités de chat, quiz interactifs, mémoires et cartes mémoire.

## 🚀 Stack Technique

- **Framework**: Next.js 15
- **Langage**: TypeScript
- **Base de données**: Supabase
- **IA**: OpenAI GPT-4.1 Nano (via Vercel AI SDK)
- **Styling**: Tailwind CSS

## 📋 Fonctionnalités

### Interface de Chat
- Chat fluide avec affichage des messages utilisateur/assistant
- Streaming des réponses en temps réel
- États de chargement visuels
- Design moderne en mode sombre

### Function Calling & Generative UI

L'assistant peut utiliser 3 outils qui génèrent des composants UI interactifs :

1. **`generate_quiz`** : Génère un quiz interactif avec feedback visuel
2. **`add_memory`** : Enregistre des informations utilisateur pour personnaliser l'expérience
3. **`create_flashcard`** : Crée des cartes mémoire interactives avec animation de flip

### Persistance des Données
- Sauvegarde automatique des conversations dans Supabase
- Historique des messages conservé
- Mémoires utilisateur stockées et réutilisées dans le contexte

## 🛠️ Installation et Configuration

### Prérequis
- Node.js 18+ et npm
- Compte Supabase
- Clé API OpenAI

### Étapes

1. **Cloner le projet**
```bash
git clone https://github.com/TheMajaveli/aila.git
cd aila
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Supabase**
   - Créer un projet sur [Supabase](https://supabase.com)
   - Exécuter le script SQL dans `supabase-schema.sql` dans l'éditeur SQL de Supabase
   - Récupérer l'URL et les clés API depuis les paramètres du projet

4. **Configurer les variables d'environnement**
   
   Créer un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 🎯 Utilisation

### Exemples de requêtes

- **Générer un quiz** : "Fais-moi un quiz sur React"
- **Enregistrer une mémoire** : "Je prépare un concours et j'ai du mal avec les probabilités"
- **Créer une carte mémoire** : "Crée une carte mémoire pour la formule E=mc²"

## 🚢 Déploiement

### Vercel

1. Pousser le code sur GitHub
2. Importer le projet dans [Vercel](https://vercel.com)
3. Configurer les variables d'environnement dans les paramètres du projet
4. Le déploiement se fait automatiquement

**Variables d'environnement requises sur Vercel :**
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

