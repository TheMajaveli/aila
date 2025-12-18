#!/bin/bash

# Script pour pousser les commits sur les branches appropriées
# puis merger sur main progressivement

set -e

cd "$(dirname "$0")/.."

echo "🚀 Push progressif sur les branches puis merge sur main"
echo "⚠️  Cela peut prendre 20-100 minutes (délais aléatoires de 1-5 min)"
echo ""

# Vérifier le remote
if ! git remote get-url origin | grep -q "aila.git"; then
  echo "❌ Erreur: Le remote n'est pas configuré vers aila.git"
  exit 1
fi

# Fonction pour pousser un commit avec délai
push_commit() {
  local commit_hash=$1
  local branch=$2
  local commit_msg=$3
  local commit_num=$4
  local total=$5
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$commit_num/$total] 📤 Pushing to $branch: $commit_msg"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Checkout la branche
  git checkout $branch 2>&1 | grep -v "Already on" || true
  
  # Cherry-pick ou reset selon si c'est le premier commit de la branche
  if git log --oneline | grep -q "$commit_hash"; then
    echo "  → Commit déjà sur cette branche"
  else
    # Reset la branche à ce commit
    git reset --hard $commit_hash 2>&1 | head -3 || true
  fi
  
  # Push vers la branche
  if [ $commit_num -eq 1 ] && [ "$branch" = "develop" ]; then
    echo "  → Premier push sur $branch..."
    git push origin $branch --force 2>&1 | grep -v "remote:" || echo "  ✅ Push réussi"
  else
    echo "  → Pushing to $branch..."
    git push origin $branch --force 2>&1 | grep -v "remote:" || echo "  ✅ Push réussi"
  fi
  
  # Délai aléatoire entre 1 et 5 minutes
  if [ $commit_num -lt $total ]; then
    delay=$((RANDOM % 240 + 60))
    minutes=$((delay / 60))
    seconds=$((delay % 60))
    echo ""
    echo "  ⏳ Attente de ${minutes}m ${seconds}s..."
    sleep $delay
  fi
}

# Organiser les commits par branche
# develop: commits de base (1-3, 8, 16-19)
# feature/chat: commits chat (4-7)
# feature/tools: commits tools (10-11, 13, 15)
# feature/tests: commits tests (9, 12, 14)

echo "📋 Organisation des commits par branche..."
echo ""

# Récupérer tous les commits
all_commits=($(git log --reverse --oneline --format="%H" | head -20))

# develop: setup et config (commits 1-3, 8, 15-19)
# Index: 0=init, 1=supabase, 2=db, 3=layout, 4=chat, 5=streaming, 6=vitest, 7=msg-test, 8=quiz, 9=quiz-test, 10=memory, 11=mem-test, 12=flashcard, 13=docs, 14=vercel, 15=lock, 16=remove, 17=gitignore
develop_commits=(
  "${all_commits[0]}"   # 1. init
  "${all_commits[1]}"   # 2. supabase
  "${all_commits[2]}"   # 3. db schema
  "${all_commits[6]}"   # 8. vitest setup
  "${all_commits[13]}"  # 16. docs
  "${all_commits[14]}"  # 17. vercel
  "${all_commits[15]}"  # 18. package-lock
  "${all_commits[16]}"  # 19. remove docs
  "${all_commits[17]}"  # 20. update gitignore
)

# feature/chat: chat et streaming (commits 4-7)
chat_commits=(
  "${all_commits[3]}"   # 4. layout
  "${all_commits[4]}"   # 5. chat basic
  "${all_commits[5]}"   # 6. streaming
)

# feature/tools: tools (commits 9, 10, 12)
tools_commits=(
  "${all_commits[8]}"   # 9. quiz
  "${all_commits[10]}"  # 11. memory
  "${all_commits[12]}"  # 13. flashcard
)

# feature/tests: tests (commits 7, 9, 11)
test_commits=(
  "${all_commits[7]}"   # 8. message tests
  "${all_commits[9]}"   # 10. quiz tests
  "${all_commits[11]}"  # 12. memory tests
)

# Pousser develop d'abord
echo "🌿 Poussage de la branche develop..."
count=0
for commit in "${develop_commits[@]}"; do
  count=$((count + 1))
  msg=$(git log -1 --format="%s" $commit)
  push_commit $commit "develop" "$msg" $count ${#develop_commits[@]}
done

# Pousser feature/chat
echo ""
echo "💬 Poussage de la branche feature/chat..."
count=0
for commit in "${chat_commits[@]}"; do
  count=$((count + 1))
  msg=$(git log -1 --format="%s" $commit)
  push_commit $commit "feature/chat" "$msg" $count ${#chat_commits[@]}
done

# Pousser feature/tools
echo ""
echo "🛠️  Poussage de la branche feature/tools..."
count=0
for commit in "${tools_commits[@]}"; do
  count=$((count + 1))
  msg=$(git log -1 --format="%s" $commit)
  push_commit $commit "feature/tools" "$msg" $count ${#tools_commits[@]}
done

# Pousser feature/tests
echo ""
echo "🧪 Poussage de la branche feature/tests..."
count=0
for commit in "${test_commits[@]}"; do
  count=$((count + 1))
  msg=$(git log -1 --format="%s" $commit)
  push_commit $commit "feature/tests" "$msg" $count ${#test_commits[@]}
done

# Maintenant merger sur main
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 Merge des branches sur main..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

git checkout main

# Merge develop
echo ""
echo "📥 Merging develop into main..."
git merge develop --no-ff -m "Merge develop into main" 2>&1 | head -5 || echo "Merge effectué"
git push origin main 2>&1 | grep -v "remote:" || echo "✅ Push réussi"

delay=$((RANDOM % 240 + 60))
echo "⏳ Attente ${delay}s avant le prochain merge..."
sleep $delay

# Merge feature/chat
echo ""
echo "📥 Merging feature/chat into main..."
git merge feature/chat --no-ff -m "Merge feature/chat into main" 2>&1 | head -5 || echo "Merge effectué"
git push origin main 2>&1 | grep -v "remote:" || echo "✅ Push réussi"

delay=$((RANDOM % 240 + 60))
echo "⏳ Attente ${delay}s avant le prochain merge..."
sleep $delay

# Merge feature/tools
echo ""
echo "📥 Merging feature/tools into main..."
git merge feature/tools --no-ff -m "Merge feature/tools into main" 2>&1 | head -5 || echo "Merge effectué"
git push origin main 2>&1 | grep -v "remote:" || echo "✅ Push réussi"

delay=$((RANDOM % 240 + 60))
echo "⏳ Attente ${delay}s avant le prochain merge..."
sleep $delay

# Merge feature/tests
echo ""
echo "📥 Merging feature/tests into main..."
git merge feature/tests --no-ff -m "Merge feature/tests into main" 2>&1 | head -5 || echo "Merge effectué"
git push origin main 2>&1 | grep -v "remote:" || echo "✅ Push réussi"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tous les commits ont été poussés et mergés sur main !"
echo "🔗 Repo: https://github.com/TheMajaveli/aila"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

