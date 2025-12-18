# AI Learning Assistant - POC

Assistant d'apprentissage intelligent avec fonctionnalités de chat, quiz interactifs, mémoires et cartes mémoire.

## 🚀 Stack Technique

- **Framework**: Next.js 15
- **Langage**: TypeScript
- **Base de données**: Supabase
- **IA**: OpenAI GPT-4 (via Vercel AI SDK)
- **Styling**: Tailwind CSS

## 📋 Fonctionnalités

### 1. Interface de Chat
- Chat fluide avec affichage des messages utilisateur/assistant
- Streaming des réponses en temps réel
- États de chargement visuels

### 2. Function Calling & Generative UI

#### Outil 1: `generate_quiz`
Génère un quiz interactif sur un sujet donné.
- **Entrées**: sujet, difficulté (easy/medium/hard)
- **Rendu**: Carte de quiz interactive avec questions, options et feedback

#### Outil 2: `add_memory`
Enregistre des informations sur l'utilisateur pour personnaliser l'expérience.
- **Entrées**: contenu, type (preference/objectif/connaissance/autre)
- **Rendu**: Carte de confirmation avec icône et contenu sauvegardé

#### Outil 3: `create_flashcard`
Crée des cartes mémoire interactives pour l'apprentissage.
- **Entrées**: recto, verso, catégorie
- **Rendu**: Carte flipable avec animation

### 3. Persistance des Données
- Sauvegarde automatique des conversations dans Supabase
- Historique des messages conservé
- Mémoires utilisateur stockées et réutilisées dans le contexte

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone https://github.com/TheMajaveli/AI-Learning-Assistant.git
cd AI-Learning-Assistant
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer les tests**
```bash
npm test
```

3. **Configurer Supabase**
   - Créer un projet sur [Supabase](https://supabase.com)
   - Exécuter le script SQL dans `supabase-schema.sql` dans l'éditeur SQL de Supabase
   - Récupérer l'URL et les clés API

4. **Configurer les variables d'environnement**
   - Copier `.env.local.example` vers `.env.local`
   - Remplir les valeurs :
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

## 📦 Structure du Projet

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # API route pour le chat avec function calling
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Page principale
├── components/
│   ├── Chat.tsx                   # Composant principal du chat
│   ├── ChatMessage.tsx           # Affichage d'un message
│   ├── QuizCard.tsx              # Carte de quiz interactive
│   ├── MemoryCard.tsx            # Carte de mémoire
│   └── FlashcardCard.tsx        # Carte mémoire flipable
├── lib/
│   ├── db.ts                     # Fonctions de base de données
│   ├── db.types.ts               # Types TypeScript
│   └── supabase.ts               # Client Supabase
└── supabase-schema.sql           # Schéma de base de données
```

## 🎯 Utilisation

### Exemples de requêtes

1. **Générer un quiz**:
   - "Fais-moi un quiz sur React"
   - "Crée un quiz difficile sur les probabilités"

2. **Enregistrer une mémoire**:
   - "Je prépare un concours et j'ai du mal avec les probabilités"
   - "Je préfère apprendre avec des exemples concrets"

3. **Créer une carte mémoire**:
   - "Crée une carte mémoire pour la formule E=mc²"
   - "Fais-moi une carte sur la définition de React"

## 🧪 Tests

Le projet utilise Vitest + React Testing Library pour les tests.

### Lancer les tests
```bash
npm test              # Mode watch
npm run test:ui       # Interface graphique
npm run test:coverage # Avec couverture
```

### Tests implémentés
- ✅ `QuizCard` : Interaction et feedback (6 tests)
- ✅ `MemoryCard` : Affichage des mémoires (4 tests)
- ✅ `ChatMessage` : Rendu des messages (3 tests)
- ✅ Validation des payloads de tools

### Couverture
Les tests couvrent :
- Rendu des composants GenUI
- Interactions utilisateur (clics, sélections)
- Validation des données
- États et feedback visuels

## 📝 Commits Progressifs

Le projet suit une approche de commits progressifs feature par feature. Voir `COMMITS.md` pour le plan détaillé.

### Préparation
```bash
# Exécuter le script de préparation
./scripts/prepare-commits.sh

# Ou manuellement
git init
git remote add origin https://github.com/TheMajaveli/AI-Learning-Assistant.git
npm install
```

### Vérifications avant chaque commit
- ✅ Passe le lint (`npm run lint`)
- ✅ Passe les tests (`npm test -- --run`)
- ✅ Compile sans erreur (`npm run build`)

### Structure des commits
17 commits progressifs couvrant :
1. Configuration initiale
2. Base de données
3. Interface chat
4. Streaming
5. Persistance
6. Tools (quiz, memory, flashcard)
7. Tests
8. Documentation

## 🚢 Déploiement

### Vercel (Recommandé)

1. Pousser le code sur GitHub
2. Importer le projet dans Vercel
3. Configurer les variables d'environnement
4. Déployer

### Netlify

1. Pousser le code sur GitHub
2. Importer le projet dans Netlify
3. Configurer les variables d'environnement
4. Déployer

## 🔒 Sécurité

- Les clés API sont stockées dans les variables d'environnement
- RLS (Row Level Security) peut être activé dans Supabase pour une authentification complète
- Pour la production, implémenter une authentification utilisateur complète

## 📝 Notes

- Pour le POC, l'identification utilisateur se fait via localStorage
- En production, implémenter une authentification complète (Supabase Auth)
- Les conversations sont automatiquement sauvegardées et peuvent être restaurées

## 🎨 Améliorations Futures

Si j'avais 2 jours de plus, j'aurais amélioré :

1. **Sécurité**:
   - Authentification complète avec Supabase Auth
   - Row Level Security (RLS) activé
   - Validation côté serveur renforcée

2. **UX/UI**:
   - Mode sombre amélioré
   - Animations plus fluides
   - Responsive design mobile optimisé
   - Historique des conversations avec recherche

3. **Fonctionnalités**:
   - Export de conversations
   - Partage de quiz
   - Statistiques d'apprentissage
   - Recommandations personnalisées basées sur les mémoires

4. **Performance**:
   - Optimisation des requêtes Supabase
   - Cache des mémoires
   - Pagination des messages
   - Optimistic UI updates

5. **Tests**:
   - Tests unitaires des composants
   - Tests d'intégration de l'API
   - Tests E2E avec Playwright

