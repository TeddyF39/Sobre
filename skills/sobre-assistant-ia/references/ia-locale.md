# IA locale et routage vers Claude

## IA locale
- Ollama est la façon la plus simple de faire tourner des modèles locaux (API HTTP locale sur le port 11434, compatible format OpenAI). Vérifie les modèles disponibles et leur taille avant de choisir.
- Taille du modèle selon la mémoire de la carte graphique : un modèle quantifié (Q4) de ~7-8 milliards de paramètres demande environ 5-6 Go de VRAM ; au-delà, ça déborde sur la RAM et devient lent.
- Qwen (versions récentes) est bon en français et en appel d'outils ; tester 2 ou 3 modèles sur tes vraies demandes avant de trancher.
- Garder le modèle chargé en mémoire entre deux requêtes (paramètre de maintien d'Ollama) pour éviter le temps de chargement.

## Plusieurs petites IA en parallèle
- Une file de tâches avec un nombre limité de travailleurs ; la carte graphique est la ressource limitante, pas le processeur.
- Petit modèle pour classer et router, modèle moyen pour répondre, Claude pour le complexe.

## Routage local / Claude
- Classer chaque demande : simple (heure, météo, minuteur, lancer une appli, résumé court) → local ; complexe (code, analyse longue, raisonnement, rédaction soignée) → Claude.
- Règles explicites d'abord (mots-clés, type de demande), modèle de classement ensuite ; journaliser chaque décision de routage pour l'ajuster.
- Plafond de dépense : compteur de tokens Claude et blocage avant de dépasser la limite fixée par l'utilisateur ; repli sur le local si la limite est atteinte.
- Toute utilisation payante non prévue demande l'accord de l'utilisateur.

## Appels d'outils
- Définir des outils précis (ouvrir une appli, créer une tâche, lire l'agenda) avec des paramètres validés ; l'IA propose, le code exécute après vérification.
- Les actions sensibles passent par une demande de confirmation.

## Économie
- Contexte court : résumé de la conversation plutôt que tout l'historique.
- Mettre en cache les réponses aux demandes répétées.
