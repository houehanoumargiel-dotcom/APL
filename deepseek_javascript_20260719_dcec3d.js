require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Route pour générer l'ebook
app.post('/api/generate', async (req, res) => {
    try {
        const { subject } = req.body;
        if (!subject) {
            return res.status(400).json({ error: 'Le sujet est requis.' });
        }

        // 1. Appel à Mistral
        const mistralResponse = await callMistral(subject);
        const ebookData = JSON.parse(mistralResponse);

        // 2. Génération des images avec OpenAI (si clé présente)
        if (process.env.OPENAI_API_KEY) {
            const coverUrl = await generateImage(ebookData.cover_prompt);
            ebookData.cover_image = coverUrl;

            for (let i = 0; i < ebookData.chapters.length; i++) {
                const prompt = ebookData.chapters[i].image_prompt;
                if (prompt) {
                    const imgUrl = await generateImage(prompt);
                    ebookData.chapters[i].image_url = imgUrl;
                }
            }

            if (ebookData.bonus) {
                for (let i = 0; i < ebookData.bonus.length; i++) {
                    const prompt = ebookData.bonus[i].image_prompt;
                    if (prompt) {
                        const imgUrl = await generateImage(prompt);
                        ebookData.bonus[i].image_url = imgUrl;
                    }
                }
            }
        }

        res.json(ebookData);
    } catch (error) {
        console.error('Erreur:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ---------- Fonctions API ----------
async function callMistral(subject) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) throw new Error('Clé Mistral manquante');

    const systemPrompt = `
Tu es un auteur à succès, expert en psychologie du consommateur, copywriter, consultant business et pédagogue.
Ta mission est de créer un produit digital premium (ebook) sur le sujet suivant : "${subject}".

Respecte strictement la structure JSON suivante :
{
  "title": "",
  "subtitle": "",
  "cover_prompt": "",
  "avatar": {
    "name": "", "age": 0, "profession": "", "salary": "", "goals": "", "main_fear": "",
    "frustrations": "", "current_mistakes": "", "habits": "", "knowledge_level": "",
    "why_buy": "", "triggers": "", "language_style": "", "deep_motivation": ""
  },
  "summary": [],
  "chapters": [
    {
      "title": "",
      "content": "<p>...</p>",
      "image_prompt": "",
      "tables": [ { "title": "", "headers": [], "rows": [] } ],
      "checklist": [],
      "exercise": ""
    }
  ],
  "bonus": [
    { "title": "", "description": "", "content": "", "image_prompt": "" }
  ],
  "conclusion": "",
  "action_plan": {
    "30_days": { "title": "", "steps": [] },
    "90_days": { "title": "", "steps": [] }
  }
}

Règles :
- Le contenu doit être original, concret, orienté résultats.
- Chaque chapitre doit suivre la structure : Titre, introduction, histoire inspirée, explication, méthode, exemple concret, conseils, erreurs à éviter, résumé, exercice, checklist, citation, transition, psychologie.
- Intègre des tableaux, checklists, exercices.
- Le texte HTML peut être inclus dans "content".
- "image_prompt" doit être un prompt détaillé en anglais pour une illustration (style flat design, 3D, isométrique, business, 16:9, sans texte).
- Génère entre 6 et 9 chapitres.
- Ajoute 2 bonus complets.
- Rédige en français, sauf les prompts d'image qui sont en anglais.

Retourne uniquement le JSON, sans aucun autre texte.
`;

    const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
            model: 'mistral-large-latest',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Sujet : ${subject}` }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );

    return response.data.choices[0].message.content;
}

async function generateImage(prompt) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('Clé OpenAI manquante');

    const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
            model: 'dall-e-3',
            prompt: prompt,
            size: '1792x1024', // format 16:9 (paysage)
            quality: 'hd',
            n: 1
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            }
        }
    );

    return response.data.data[0].url;
}

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});