#!/bin/bash

# Script d'aide pour préparer les commits progressifs
# Usage: ./scripts/prepare-commits.sh

set -e

echo "🚀 Préparation des commits progressifs pour AI Learning Assistant"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté à la racine du projet"
    exit 1
fi

# Vérifier que git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repo Git..."
    git init
    git branch -M main
    echo "✅ Repo Git initialisé"
fi

# Vérifier le remote
if ! git remote get-url origin &>/dev/null; then
    echo "🔗 Ajout du remote GitHub..."
    git remote add origin https://github.com/TheMajaveli/AI-Learning-Assistant.git
    echo "✅ Remote ajouté"
else
    echo "✅ Remote déjà configuré: $(git remote get-url origin)"
fi

# Vérifier les dépendances
if [ ! -d "node_modules" ]; then
    echo "📥 Installation des dépendances..."
    npm install
    echo "✅ Dépendances installées"
fi

# Vérifier le lint
echo "🔍 Vérification du lint..."
if npm run lint; then
    echo "✅ Lint OK"
else
    echo "⚠️  Des erreurs de lint ont été détectées"
fi

# Vérifier les tests (si configurés)
if [ -f "vitest.config.ts" ]; then
    echo "🧪 Vérification des tests..."
    if npm test -- --run; then
        echo "✅ Tests OK"
    else
        echo "⚠️  Certains tests ont échoué"
    fi
fi

echo ""
echo "✅ Préparation terminée !"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Suivez le plan dans COMMITS.md"
echo "   2. Faites vos commits un par un"
echo "   3. Vérifiez avec: npm run lint && npm test"
echo "   4. Push avec: git push -u origin main"
echo ""

