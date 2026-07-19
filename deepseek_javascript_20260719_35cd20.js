// Dans la fonction submit, au lieu de callMistral et generateImage, faites :

const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject })
});

const ebookData = await response.json();
// Le backend a déjà généré les images et renvoie le JSON enrichi avec les URLs