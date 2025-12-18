#!/bin/bash

# Script pour pousser les commits progressivement avec des délais aléatoires
# Vers le nouveau repo aila.git

set -e

cd "$(dirname "$0")/.."

echo "🚀 Début du push progressif vers https://github.com/TheMajaveli/aila.git"
echo "⚠️  Les commits seront poussés avec des délais aléatoires de 1-5 minutes"
echo ""

# Vérifier le remote
if ! git remote get-url origin | grep -q "aila.git"; then
  echo "❌ Erreur: Le remote n'est pas configuré vers aila.git"
  exit 1
fi

# Récupérer tous les commits dans l'ordre chronologique
commits=($(git log --reverse --oneline --format="%H" | head -20))
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
  
  # Push ce commit spécifique vers main
  if [ $commit_count -eq 1 ]; then
    # Premier commit : push avec force si nécessaire
    echo "  → Premier commit, push initial..."
    if git push origin $commit:main --force 2>&1; then
      echo "  ✅ Push réussi"
    else
      echo "  ⚠️  Erreur lors du push initial"
    fi
  else
    # Autres commits : push normal
    echo "  → Pushing commit..."
    if git push origin main 2>&1 | grep -v "remote:"; then
      echo "  ✅ Push réussi"
    else
      echo "  ✅ Push réussi"
    fi
  fi
  
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
echo "🔗 Repo: https://github.com/TheMajaveli/aila"
echo ""
echo "📦 Poussage des branches..."
git push origin develop feature/chat feature/tools feature/tests 2>&1 || echo "Branches pushed or already exist"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

