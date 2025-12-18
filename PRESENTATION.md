# Guide de Présentation - AI Learning Assistant

## Points Clés à Présenter (20 minutes)

### 1. Démonstration du Parcours Utilisateur (5 min)

#### Scénario 1 : Quiz Interactif
1. Ouvrir l'application
2. Taper : "Fais-moi un quiz sur React"
3. Montrer :
   - Le streaming de la réponse
   - L'apparition de la carte de quiz
   - L'interaction avec les boutons
   - Le feedback (correct/incorrect)

#### Scénario 2 : Sauvegarde de Mémoire
1. Taper : "Je prépare un concours et j'ai du mal avec les probabilités"
2. Montrer :
   - L'appel de l'outil `add_memory`
   - La carte de confirmation
   - La persistance (rafraîchir la page)

#### Scénario 3 : Flashcard
1. Taper : "Crée une carte mémoire pour la formule E=mc²"
2. Montrer :
   - La carte flipable
   - L'animation de retournement

### 2. Code Review - Tool Calling (5 min)

#### Côté Serveur (`app/api/chat/route.ts`)
```typescript
// Montrer :
- La définition des outils avec zod
- L'exécution des outils (execute)
- L'intégration avec Supabase pour add_memory
- Le streaming avec streamText
```

#### Côté Client (`components/Chat.tsx`)
```typescript
// Montrer :
- L'utilisation de useChat hook
- La gestion des toolInvocations
- La sauvegarde des tool calls dans Supabase
- Le rendu conditionnel des composants GenUI
```

#### Composants Generative UI
- `QuizCard.tsx` : Logique d'interaction et feedback
- `MemoryCard.tsx` : Affichage de confirmation
- `FlashcardCard.tsx` : Animation de flip

### 3. Architecture de Données (5 min)

#### Schéma Supabase (`supabase-schema.sql`)
- **conversations** : Stocke les conversations
- **messages** : Stocke les messages avec tool_calls (JSONB)
- **memories** : Stocke les mémoires utilisateur

#### Flux de Données
1. Utilisateur envoie un message
2. Message sauvegardé dans `messages`
3. API récupère les mémoires pour le contexte
4. OpenAI traite avec function calling
5. Tool calls exécutés et résultats sauvegardés
6. Réponse streamée au client
7. Messages restaurés au chargement

#### Points Techniques
- Utilisation de JSONB pour tool_calls (flexibilité)
- Index sur conversation_id et user_id (performance)
- RLS désactivé pour POC (à activer en production)

### 4. Discussion - Améliorations Futures (5 min)

#### Si j'avais 2 jours de plus :

**Sécurité (Jour 1)**
- ✅ Authentification complète avec Supabase Auth
- ✅ Row Level Security (RLS) activé
- ✅ Validation et sanitization renforcées
- ✅ Rate limiting sur l'API

**UX/Performance (Jour 2)**
- ✅ Historique des conversations avec sidebar
- ✅ Recherche dans les conversations
- ✅ Mode sombre amélioré
- ✅ Optimistic UI updates
- ✅ Pagination des messages
- ✅ Cache des mémoires

**Fonctionnalités Avancées**
- ✅ Export de conversations (PDF/Markdown)
- ✅ Partage de quiz
- ✅ Statistiques d'apprentissage
- ✅ Recommandations personnalisées
- ✅ Multi-utilisateurs avec gestion de rôles

## Points Forts à Mettre en Avant

1. **Architecture Propre**
   - Séparation claire des responsabilités
   - Types TypeScript stricts
   - Composants réutilisables

2. **Generative UI Soignée**
   - Quiz interactif avec feedback visuel
   - Cartes mémoire avec animations
   - États de chargement clairs

3. **Persistance Robuste**
   - Sauvegarde automatique
   - Restauration au chargement
   - Contexte utilisateur via mémoires

4. **Pragmatisme**
   - Focus sur les fonctionnalités essentielles
   - Code maintenable et extensible
   - Prêt pour la production avec quelques ajustements

## Questions Possibles

**Q: Comment gères-tu l'historique de conversation pour les tool calls ?**
R: Les tool calls sont sauvegardés dans le champ JSONB `tool_calls` de chaque message. Au chargement, on restaure les messages avec leurs tool calls, permettant à l'IA de comprendre le contexte complet.

**Q: Pourquoi utiliser JSONB pour tool_calls ?**
R: Flexibilité pour stocker différents types de tool calls sans modifier le schéma. Permet aussi de stocker les résultats d'exécution directement dans le message.

**Q: Comment optimiserais-tu pour 1000+ utilisateurs ?**
R: 
- Cache Redis pour les mémoires fréquemment accédées
- Pagination des messages
- Index supplémentaires sur created_at
- CDN pour les assets statiques
- Optimisation des requêtes Supabase

**Q: Gestion d'erreurs ?**
R: 
- Try/catch dans les fonctions async
- Messages d'erreur utilisateur-friendly
- Logging côté serveur
- Fallback si Supabase est indisponible

## Checklist Pré-Présentation

- [ ] Tester tous les scénarios
- [ ] Vérifier que Supabase fonctionne
- [ ] Vérifier que OpenAI API fonctionne
- [ ] Préparer des exemples de code à montrer
- [ ] Préparer des captures d'écran si besoin
- [ ] Tester le déploiement Vercel

