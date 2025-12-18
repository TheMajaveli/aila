# Guide pour Obtenir une Clé API OpenAI

## 📋 Étapes pour Obtenir votre Clé API OpenAI

### 1. Créer un Compte OpenAI

1. **Aller sur [platform.openai.com](https://platform.openai.com)**
2. **Créer un compte** :
   - Cliquer sur "Sign up"
   - Utiliser votre email ou connecter avec Google/Microsoft
   - Vérifier votre email si nécessaire
   - Compléter votre profil

### 2. Ajouter un Mode de Paiement

⚠️ **Important** : OpenAI nécessite un mode de paiement pour utiliser l'API (même pour les essais gratuits).

1. **Aller dans Billing** :
   - Cliquer sur votre profil (coin supérieur droit)
   - Sélectionner "Billing" ou "Usage"
   - Cliquer sur "Add payment method"

2. **Ajouter une carte** :
   - Entrer les informations de votre carte bancaire
   - Confirmer le paiement
   - ⚠️ **Note** : Vous ne serez facturé que pour l'utilisation réelle (pas d'abonnement)

### 3. Créer une Clé API

1. **Aller dans API Keys** :
   - Dans le menu de gauche, cliquer sur "API keys"
   - Ou aller directement sur [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

2. **Créer une nouvelle clé** :
   - Cliquer sur "Create new secret key"
   - Donner un nom à votre clé (ex: "AI Learning Assistant")
   - Cliquer sur "Create secret key"

3. **⚠️ COPIER LA CLÉ IMMÉDIATEMENT** :
   - La clé s'affiche une seule fois
   - Format : `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Si vous la perdez, vous devrez en créer une nouvelle !**

### 4. Configurer la Clé dans votre Projet

1. **Ouvrir `.env.local`** :
   ```bash
   # Dans votre projet
   code .env.local
   # ou
   nano .env.local
   ```

2. **Remplacer la clé placeholder** :
   ```env
   # Avant
   OPENAI_API_KEY=sk-your-openai-api-key-here

   # Après (avec votre vraie clé)
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Sauvegarder le fichier**

### 5. Vérifier la Configuration

1. **Redémarrer le serveur de développement** :
   ```bash
   # Arrêter le serveur (Ctrl+C)
   # Puis redémarrer
   npm run dev
   ```

2. **Tester l'API** :
   - Ouvrir l'application dans le navigateur
   - Envoyer un message dans le chat
   - Si ça fonctionne, la clé est correcte ! ✅

## 💰 Coûts et Limites

### Modèle GPT-4 Turbo (utilisé dans le projet)

- **Prix d'entrée** : ~$5-10 de crédit gratuit au début
- **Coût par requête** :
  - Input : ~$0.01 par 1000 tokens
  - Output : ~$0.03 par 1000 tokens
- **Exemple** : Une conversation avec 10 messages ≈ $0.10-0.50

### Limites de Taux (Rate Limits)

- **Tier gratuit** : ~3 requêtes/minute
- **Tier payant** : Limites plus élevées selon votre plan

### Gérer les Coûts

1. **Définir des limites** :
   - Aller dans "Billing" → "Usage limits"
   - Définir une limite mensuelle (ex: $50)

2. **Surveiller l'utilisation** :
   - Dashboard "Usage" dans OpenAI
   - Voir les coûts en temps réel

3. **Utiliser des modèles moins chers** (optionnel) :
   - GPT-3.5-turbo est moins cher que GPT-4
   - Modifier dans `app/api/chat/route.ts` :
     ```typescript
     // Au lieu de 'gpt-4-turbo-preview'
     model: openaiClient('gpt-3.5-turbo'),
     ```

## 🔒 Sécurité

### Bonnes Pratiques

1. ✅ **Ne jamais commiter la clé API** :
   - `.env.local` est déjà dans `.gitignore`
   - Ne jamais partager votre clé publiquement

2. ✅ **Utiliser des clés différentes** :
   - Une clé pour le développement
   - Une clé pour la production
   - Révoquer les clés compromises

3. ✅ **Limiter les permissions** :
   - Créer des clés avec des permissions limitées si possible
   - Utiliser des clés de service pour la production

4. ✅ **Surveiller l'utilisation** :
   - Vérifier régulièrement l'usage dans le dashboard
   - Configurer des alertes de coût

### En Cas de Clé Compromise

1. **Révoquer immédiatement** :
   - Aller dans "API keys"
   - Cliquer sur "Revoke" à côté de la clé compromise

2. **Créer une nouvelle clé**

3. **Mettre à jour `.env.local`**

## 🧪 Test Rapide de la Clé

Créez un fichier `test-openai.js` :

```javascript
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testAPI() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Say hello in one word' }
      ],
      max_tokens: 10,
    });

    console.log('✅ Clé API OpenAI valide !');
    console.log('Réponse:', completion.choices[0].message.content);
  } catch (error) {
    if (error.status === 401) {
      console.error('❌ Clé API invalide ou expirée');
    } else if (error.status === 429) {
      console.error('❌ Limite de taux dépassée');
    } else {
      console.error('❌ Erreur:', error.message);
    }
  }
}

testAPI();
```

Exécutez :
```bash
node test-openai.js
```

## 🆘 Dépannage

### Erreur "Invalid API key"
- Vérifier que vous avez copié la clé complète (commence par `sk-`)
- Vérifier qu'il n'y a pas d'espaces avant/après dans `.env.local`
- Vérifier que vous avez redémarré le serveur après modification

### Erreur "Insufficient quota"
- Vérifier que vous avez ajouté un mode de paiement
- Vérifier votre solde dans "Billing"
- Vérifier les limites d'utilisation

### Erreur "Rate limit exceeded"
- Attendre quelques minutes
- Vérifier votre tier dans "Settings" → "Organization"
- Considérer passer à un tier supérieur

### La clé ne fonctionne pas
- Vérifier que la clé n'a pas été révoquée
- Créer une nouvelle clé si nécessaire
- Vérifier que vous utilisez la bonne clé (pas une clé d'un autre projet)

## 📚 Ressources

- [Documentation OpenAI API](https://platform.openai.com/docs)
- [Guide de Pricing](https://openai.com/pricing)
- [Dashboard OpenAI](https://platform.openai.com/usage)
- [Gestion des Clés API](https://platform.openai.com/api-keys)

## ✅ Checklist

- [ ] Compte OpenAI créé
- [ ] Mode de paiement ajouté
- [ ] Clé API créée et copiée
- [ ] Clé ajoutée dans `.env.local`
- [ ] Serveur redémarré
- [ ] Test de connexion réussi
- [ ] Limites de coût configurées (optionnel)

Une fois ces étapes complétées, votre application pourra utiliser l'API OpenAI ! 🚀

