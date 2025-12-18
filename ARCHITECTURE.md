# Architecture Technique

## Streaming + Tool Calling + Generative UI

### 1. Streaming des Réponses

**Côté Serveur** (`app/api/chat/route.ts`)
- Utilise `streamText` de Vercel AI SDK
- Retourne `result.toDataStreamResponse()` qui crée un stream Server-Sent Events (SSE)
- Le stream contient les tokens de texte au fur et à mesure de la génération

**Côté Client** (`components/Chat.tsx`)
- Utilise le hook `useChat` de `ai/react`
- Gère automatiquement le parsing du stream SSE
- Met à jour l'état `messages` en temps réel avec les tokens reçus
- Affiche les messages progressivement pendant le streaming

**Flux** :
```
OpenAI API → streamText → SSE Stream → useChat → messages state → UI
```

### 2. Function Calling

**Définition des Tools** (`app/api/chat/route.ts`)
- Chaque tool est défini avec `tool()` de Vercel AI SDK
- Schema Zod pour validation des paramètres
- Fonction `execute` qui exécute la logique métier
- Les résultats sont retournés et inclus dans le stream

**Exécution** :
1. L'IA décide d'appeler un tool basé sur le contexte
2. Le tool est exécuté côté serveur
3. Le résultat est renvoyé à l'IA
4. L'IA génère une réponse finale incluant le résultat

**Gestion des Tool Calls** :
- Les tool calls sont stockés dans `message.toolInvocations`
- Chaque tool call contient : `toolCallId`, `toolName`, `args`, `result`
- Sauvegardés dans Supabase dans le champ JSONB `tool_calls`

### 3. Generative UI

**Rendu Conditionnel** (`components/ChatMessage.tsx`)
- Détecte les `tool_calls` dans le message
- Pour chaque tool call, rend le composant UI correspondant :
  - `generate_quiz` → `<QuizCard />`
  - `add_memory` → `<MemoryCard />`
  - `create_flashcard` → `<FlashcardCard />`

**Composants Interactifs** :
- **QuizCard** : Gère l'état local (réponse sélectionnée, feedback)
- **MemoryCard** : Affichage statique avec confirmation
- **FlashcardCard** : Animation de flip avec état local

**Persistance de l'État** :
- Les tool calls sont sauvegardés avec leurs résultats dans Supabase
- Au chargement, les messages sont restaurés avec leurs tool calls
- Les composants GenUI sont re-rendus avec les résultats sauvegardés
- Pour les quiz, l'état "répondu" est restauré depuis le résultat sauvegardé

### 4. Architecture de Données

**Tables Supabase** :
- `conversations` : Métadonnées des conversations
- `messages` : Messages avec `tool_calls` (JSONB)
- `memories` : Mémoires utilisateur pour contexte

**Flux de Persistance** :
1. Utilisateur envoie un message → Sauvegarde immédiate dans `messages`
2. API traite → Génère réponse avec tool calls
3. Tool calls exécutés → Résultats sauvegardés dans `tool_calls` JSONB
4. Réponse streamée → Sauvegarde finale du message assistant
5. Au refresh → Chargement des messages depuis Supabase → Restauration de l'UI

### 5. Points Techniques Clés

**Type Safety** :
- Types TypeScript stricts pour tous les messages
- Interface `Message` avec `tool_calls?: ToolCall[]`
- Types pour chaque tool result

**Performance** :
- Streaming pour une UX réactive
- Sauvegarde asynchrone (non-bloquante)
- Index Supabase sur `conversation_id` et `user_id`

**Extensibilité** :
- Ajout d'un nouveau tool = ajouter dans `tools` object + créer composant UI
- Structure JSONB permet d'ajouter des champs sans migration
- Composants GenUI isolés et réutilisables

