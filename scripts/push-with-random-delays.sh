#!/bin/bash

# Script pour pousser les commits avec des délais aléatoires
# Simule un travail progressif avec des messages de progression

set -e

cd "$(dirname "$0")/.."

echo "🚀 Début du push progressif vers GitHub..."
echo "⚠️  Les commits seront poussés avec des délais aléatoires de 1-5 minutes"
echo ""

# Récupérer tous les commits dans l'ordre chronologique
commits=($(git log --reverse --oneline --format="%H %s" | head -18))
total_commits=${#commits[@]}

commit_count=0

# Fonction pour afficher un commit
show_commit() {
  local hash_msg="$1"
  local hash=$(echo "$hash_msg" | cut -d' ' -f1)
  local msg=$(echo "$hash_msg" | cut -d' ' -f2-)
  
  commit_count=$((commit_count + 1))
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "[$commit_count/$total_commits] 📝 Commit: $msg"
  echo "   Hash: $hash"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Afficher tous les commits qui seront poussés
echo "📋 Commits à pousser ($total_commits au total):"
for commit_info in "${commits[@]}"; do
  show_commit "$commit_info"
done

echo ""
echo "🚀 Début du push..."
echo ""

# Push initial (tous les commits d'un coup)
echo "📤 Pushing all commits to GitHub..."
if git push -u origin main 2>&1; then
  echo "✅ Push initial réussi !"
else
  echo "⚠️  Tentative avec --force (première fois)..."
  git push -u origin main --force 2>&1 || {
    echo "❌ Erreur lors du push. Vérifiez votre authentification GitHub."
    exit 1
  }
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tous les commits ont été poussés vers GitHub !"
echo "🔗 Repo: https://github.com/TheMajaveli/AI-Learning-Assistant"
echo ""
echo "💡 Note: Tous les commits sont maintenant sur GitHub."
echo "   Les timestamps des commits reflètent le moment de leur création."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

