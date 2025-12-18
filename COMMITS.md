# Plan de Commits Progressifs

Ce document liste les commits à effectuer dans l'ordre, en suivant une approche feature par feature.

## Commandes Git Initiales

```bash
# Initialiser le repo (si pas déjà fait)
git init
git branch -M main

# Ajouter le remote
git remote add origin https://github.com/TheMajaveli/AI-Learning-Assistant.git

# Ou si le remote existe déjà
git remote set-url origin https://github.com/TheMajaveli/AI-Learning-Assistant.git
```

## Séquence de Commits

### 1. Initialisation du projet
```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.mjs .eslintrc.json .gitignore .prettierrc
git commit -m "chore: init nextjs15 + ts + eslint + prettier"
```

### 2. Configuration Supabase
```bash
git add lib/supabase.ts .env.local.example
git commit -m "chore: add supabase client + env example"
```

### 3. Schéma de base de données
```bash
git add supabase-schema.sql lib/db.types.ts lib/db.ts
git commit -m "feat(db): add schema sql + supabase helpers"
```

### 4. Layout de base
```bash
git add app/layout.tsx app/globals.css app/page.tsx
git commit -m "feat(ui): add base layout + global styles"
```

### 5. Interface de chat basique
```bash
git add components/Chat.tsx components/ChatMessage.tsx
git commit -m "feat(chat): basic chat layout + message bubbles"
```

### 6. Streaming API
```bash
git add app/api/chat/route.ts
git commit -m "feat(chat): streaming api + client stream rendering"
```

### 7. Persistance des messages
```bash
# Mettre à jour Chat.tsx avec la persistance
git add components/Chat.tsx lib/db.ts
git commit -m "feat(persist): save messages in supabase + restore last conversation"
```

### 8. Configuration des tests
```bash
git add vitest.config.ts tests/setup.ts package.json
git commit -m "chore: add vitest + testing library setup"
```

### 9. Tests des messages
```bash
git add tests/components/ChatMessage.test.tsx tests/lib/tool-helpers.test.ts
git commit -m "test: add message rendering + tool payload validation tests"
```

### 10. Tool dispatcher et types
```bash
# Mettre à jour les types pour supporter tool calls
git add lib/db.types.ts
git commit -m "feat(tools): tool dispatcher + message types for tool blocks"
```

### 11. Quiz tool + composant
```bash
git add components/QuizCard.tsx
# Mettre à jour app/api/chat/route.ts avec generate_quiz
# Mettre à jour components/ChatMessage.tsx pour afficher QuizCard
git add app/api/chat/route.ts components/ChatMessage.tsx
git commit -m "feat(quiz): generate_quiz + QuizCard interactive"
```

### 12. Tests du quiz
```bash
git add tests/components/QuizCard.test.tsx
git commit -m "test(quiz): quiz card interaction test"
```

### 13. Memory tool + composant
```bash
git add components/MemoryCard.tsx
# Mettre à jour app/api/chat/route.ts avec add_memory
# Mettre à jour components/ChatMessage.tsx pour afficher MemoryCard
git add app/api/chat/route.ts components/ChatMessage.tsx
git commit -m "feat(memory): add_memory + MemoryCard + save to supabase"
```

### 14. Tests de la mémoire
```bash
git add tests/components/MemoryCard.test.tsx
git commit -m "test(memory): memory save rendering test"
```

### 15. Tool 3 : Flashcard
```bash
git add components/FlashcardCard.tsx
# Mettre à jour app/api/chat/route.ts avec create_flashcard
# Mettre à jour components/ChatMessage.tsx pour afficher FlashcardCard
git add app/api/chat/route.ts components/ChatMessage.tsx
git commit -m "feat(tool3): implement create_flashcard + UI block"
```

### 16. Documentation
```bash
git add README.md DEPLOYMENT.md QUICKSTART.md PRESENTATION.md
git commit -m "docs: README + deploy steps + demo script"
```

### 17. Configuration Vercel
```bash
git add vercel.json
git commit -m "chore: add vercel deployment config"
```

## Push Final

```bash
# Push toutes les branches
git push -u origin main
```

## Vérifications Avant Chaque Commit

1. ✅ `npm run lint` passe
2. ✅ `npm run test` passe (quand les tests existent)
3. ✅ Le code compile (`npm run build`)
4. ✅ Le dev server démarre (`npm run dev`)

## Notes

- Chaque commit doit être cohérent et runnable
- Les tests sont ajoutés progressivement, pas tous à la fin
- Les messages de commit suivent le format conventional commits

