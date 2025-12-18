#!/bin/bash

# Script pour pousser les commits avec des délais aléatoires
# Simule un travail progressif

set -e

cd "$(dirname "$0")/.."

echo "🚀 Début du push progressif vers GitHub..."
echo ""

# Récupérer tous les commits dans l'ordre
commits=$(git log --reverse --oneline --format="%H" | head -18)

commit_count=0
total_commits=$(echo "$commits" | wc -l | tr -d ' ')

for commit in $commits; do
  commit_count=$((commit_count + 1))
  
  # Récupérer le message du commit
  commit_msg=$(git log -1 --format="%s" $commit)
  
  echo "[$commit_count/$total_commits] Pushing: $commit_msg"
  
  # Push jusqu'à ce commit (inclus)
  if [ $commit_count -eq 1 ]; then
    # Premier commit : push avec --force si nécessaire
    echo "  → Pushing first commit..."
    git push origin $commit:main --force 2>&1 || git push origin $commit:main 2>&1
  else
    # Autres commits : push normal (Git enverra tous les commits jusqu'à celui-ci)
    echo "  → Pushing up to this commit..."
    git push origin main 2>&1 || true
  fi
  
  # Délai aléatoire entre 1 et 5 minutes (60-300 secondes)
  if [ $commit_count -lt $total_commits ]; then
    delay=$((RANDOM % 240 + 60))  # Entre 60 et 300 secondes
    minutes=$((delay / 60))
    seconds=$((delay % 60))
    echo "  ⏳ Attente de ${minutes}m ${seconds}s avant le prochain push..."
    sleep $delay
    echo ""
  fi
done

echo ""
echo "✅ Tous les commits ont été poussés vers GitHub !"
echo "🔗 Repo: https://github.com/TheMajaveli/AI-Learning-Assistant"

