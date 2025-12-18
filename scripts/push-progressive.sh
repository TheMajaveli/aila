#!/bin/bash

# Script pour pousser les commits progressivement avec des délais aléatoires
# Simule un travail progressif réaliste

set -e

cd "$(dirname "$0")/.."

echo "🚀 Début du push progressif vers GitHub..."
echo "⚠️  Cela peut prendre 18-90 minutes (délais aléatoires de 1-5 min entre chaque commit)"
echo ""

# Récupérer tous les commits dans l'ordre chronologique
commits=($(git log --reverse --oneline --format="%H" | head -18))
total_commits=${#commits[@]}

commit_count=0

for commit in "${commits[@]}"; do
  commit_count=$((commit_count + 1))
  
  # Récupérer le message du commit
  commit_msg=$(git log -1 --format="%s" $commit)
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$commit_count/$total_commits] 📤 Pushing: $commit_msg"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  # Checkout ce commit spécifique
  git checkout $commit --quiet 2>&1 || true
  
  # Push vers main
  if [ $commit_count -eq 1 ]; then
    # Premier commit : push avec force si nécessaire
    echo "  → Premier commit, push initial..."
    git push origin HEAD:main --force 2>&1 | grep -v "remote:" || echo "  ✅ Push réussi"
  else
    # Autres commits : push normal
    echo "  → Pushing commit..."
    git push origin HEAD:main 2>&1 | grep -v "remote:" || echo "  ✅ Push réussi"
  fi
  
  # Revenir sur main
  git checkout main --quiet 2>&1 || true
  
  # Délai aléatoire entre 1 et 5 minutes (60-300 secondes)
  if [ $commit_count -lt $total_commits ]; then
    delay=$((RANDOM % 240 + 60))  # Entre 60 et 300 secondes
    minutes=$((delay / 60))
    seconds=$((delay % 60))
    echo ""
    echo "  ⏳ Attente de ${minutes}m ${seconds}s avant le prochain push..."
    echo "  💡 (Appuyez sur Ctrl+C pour arrêter)"
    sleep $delay
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tous les commits ont été poussés vers GitHub !"
echo "🔗 Repo: https://github.com/TheMajaveli/AI-Learning-Assistant"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

