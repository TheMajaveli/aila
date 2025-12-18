# 🚀 Déploiement Rapide - 20 minutes

## Checklist Rapide

### 1. Vérifier le Build (2 min)
```bash
npm run build
```
✅ Si ça compile, c'est bon !

### 2. Déployer sur Vercel (5 min)

**Option A : Via CLI Vercel**
```bash
npm i -g vercel
vercel login
vercel --prod
```

**Option B : Via Interface Web (PLUS RAPIDE)**
1. Aller sur [vercel.com](https://vercel.com)
2. "Add New Project"
3. Importer depuis GitHub : `TheMajaveli/aila`
4. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY` (ou `GOOGLE_GENERATIVE_AI_API_KEY` si Gemini)
5. Deploy !

### 3. Variables d'Environnement Vercel

Copier depuis `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=https://lzobwxzfvtrpahijyrce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2J3eHpmdnRycGFoaWp5cmNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDA0NDksImV4cCI6MjA4MTYxNjQ0OX0.eZQV9i4XochJuA_iCGeZwlxySzYy0n4YdeYJz77Mt1c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b2J3eHpmdnRycGFoaWp5cmNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjA0MDQ0OSwiZXhwIjoyMDgxNjE2NDQ5fQ.hg4SsYL9lHIfRtUD1IUSTV-12zM20lQu9svWwF4e_vw
OPENAI_API_KEY=votre-cle-openai
```

### 4. Test Rapide (3 min)

Une fois déployé :
1. Ouvrir l'URL Vercel
2. Tester : "Fais-moi un quiz sur React"
3. Vérifier que le quiz s'affiche
4. ✅ C'est prêt !

## ⚡ Si Problème

**Build échoue ?**
- Vérifier que tous les fichiers sont commités
- Vérifier les imports

**Erreur API ?**
- Vérifier les variables d'environnement dans Vercel
- Vérifier que Supabase est accessible

**Erreur OpenAI ?**
- Vérifier la clé API
- Ou passer à Gemini (gratuit)

## 🎯 Objectif : URL de déploiement fonctionnelle

Une fois déployé, vous aurez une URL du type :
`https://ai-learning-assistant.vercel.app`

C'est votre livrable ! 🚀

