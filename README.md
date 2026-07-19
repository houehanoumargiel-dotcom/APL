# APL
AGENT IA EBOOK
# 📘 Générateur d'Ebook Premium – Vercel

Ce projet déploie un générateur d'ebook complet utilisant **Mistral AI** et **OpenAI DALL‑E** via une architecture serverless sur Vercel.

## 🚀 Déploiement sur Vercel

1. Forkez ce dépôt ou créez-en un nouveau.
2. Connectez votre dépôt à Vercel.
3. Dans les paramètres du projet sur Vercel, ajoutez les variables d'environnement :
   - `MISTRAL_API_KEY` : votre clé Mistral
   - `OPENAI_API_KEY` : votre clé OpenAI
4. Déployez automatiquement à chaque `git push`.

## 🧪 Test local

- Clonez le dépôt
- Créez un fichier `.env` avec vos clés
- Exécutez `node api/generate.js` (ou `npm start`)
- Ouvrez `public/index.html` dans un navigateur (ou utilisez un serveur statique)

## 🔧 Personnalisation

- Modifiez le prompt système dans `api/generate.js` pour ajuster le contenu.
- Changez le modèle ou la taille des images dans les fonctions correspondantes.

## 📄 Licence

MIT
