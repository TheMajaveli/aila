# Résumé Technique - Streaming + Tool Calling + GenUI

## Comment je gère Streaming + Tool Calling + Generative UI (6-10 lignes)

**Streaming** : Côté serveur, j'utilise `streamText` de Vercel AI SDK qui génère un stream SSE. Le hook `useChat` côté client parse automatiquement ce stream et met à jour l'état `messages` en temps réel, affichant les tokens progressivement dans l'UI.

**Tool Calling** : Chaque tool est défini avec `tool()` (schema Zod + fonction `execute`). Quand l'IA décide d'appeler un tool, il est exécuté côté serveur et le résultat est renvoyé dans le stream via `toolInvocations`. Les tool calls sont sauvegardés dans Supabase (JSONB `tool_calls`) pour persistance.

**Generative UI** : Le composant `ChatMessage` détecte les `tool_calls` dans chaque message et rend conditionnellement le composant UI correspondant (`QuizCard`, `MemoryCard`, `FlashcardCard`). Ces composants sont interactifs avec état local, et leur état est restauré depuis les tool calls sauvegardés au chargement de la page.

---

## Détails Techniques

### 1. Streaming (app/api/chat/route.ts)

```typescript
const result = await streamText({
  model: openaiClient('gpt-4-turbo-preview'),
  messages: allMessages,
  tools: { /* ... */ },
});

return result.toDataStreamResponse(); // SSE stream
```

**Côté client** (`components/Chat.tsx`) :
```typescript
const { messages, handleSubmit } = useChat({
  api: '/api/chat',
  // useChat parse automatiquement le stream SSE
  // et met à jour messages en temps réel
});
```

### 2. Tool Calling

**Définition** :
```typescript
generate_quiz: tool({
  parameters: z.object({ /* ... */ }),
  execute: async ({ subject, difficulty, ... }) => {
    return { /* résultat */ };
  },
})
```

**Exécution** :
1. L'IA génère un tool call dans le stream
2. Le tool est exécuté automatiquement
3. Le résultat est inclus dans `message.toolInvocations`
4. Sauvegardé dans Supabase : `tool_calls` (JSONB)

### 3. Generative UI

**Rendu conditionnel** (`components/ChatMessage.tsx`) :
```typescript
{message.tool_calls?.map((toolCall) => {
  if (toolCall.name === 'generate_quiz') {
    return <QuizCard quiz={toolCall.result} />;
  }
  // ...
})}
```

**Persistance** :
- Tool calls sauvegardés avec résultats dans `messages.tool_calls`
- Au chargement : messages restaurés → tool calls restaurés → GenUI re-rendue
- État interactif (ex: quiz répondu) géré localement dans le composant

### 4. Flux Complet

```
User Input
  ↓
Save to Supabase (user message)
  ↓
API Route → streamText with tools
  ↓
OpenAI decides to call tool
  ↓
Tool executed → result in stream
  ↓
Stream to client (SSE)
  ↓
useChat updates messages state
  ↓
ChatMessage renders → detects tool_calls
  ↓
Render GenUI component (QuizCard/MemoryCard/FlashcardCard)
  ↓
Save assistant message + tool_calls to Supabase
  ↓
On page reload → restore messages → restore GenUI
```

## Points Clés

1. **Streaming non-bloquant** : L'UI se met à jour en temps réel pendant la génération
2. **Tool calls dans le stream** : Les résultats sont inclus directement dans le flux SSE
3. **GenUI déclarative** : Rendu conditionnel basé sur les tool calls détectés
4. **Persistance complète** : Tool calls + résultats sauvegardés pour restauration
5. **Type-safe** : TypeScript strict pour tous les messages et tool calls

