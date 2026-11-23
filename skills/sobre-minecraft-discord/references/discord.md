# Discord : serveur et bot

## Structure du serveur
- Catégories claires : informations (règles, annonces), discussion, jeu (une catégorie par projet), vocal, administration.
- Rôles : administrateur, modérateur, joueur, nouveau ; permissions données par rôle et par catégorie, pas par personne.
- Salon de règles + vérification (réaction ou bouton) pour débloquer l'accès.
- Journal de modération dans un salon réservé.

## Bot
- Bibliothèques courantes : discord.py (Python) ou discord.js (JavaScript). Vérifier la version actuelle et ses changements avant d'écrire du code.
- Commandes slash (enregistrées auprès de Discord) plutôt que préfixes de messages.
- Intents : n'activer que ceux nécessaires ; certains (contenu des messages, membres) doivent aussi être activés dans le portail développeur.
- Jeton dans un fichier `.env` ignoré par git ; s'il fuit, le régénérer immédiatement dans le portail.
- Gérer les erreurs et les limites de débit (rate limits) ; ne pas spammer l'API.
- Hébergement : PC allumé, petit serveur ou service d'hébergement ; redémarrage automatique en cas de plantage.

## Liaison Minecraft ↔ Discord
- DiscordSRV côté serveur Minecraft : discussion en jeu reliée à un salon, annonces de connexion et de mort.
- Pour des fonctions sur mesure (statut du serveur, commandes admin depuis Discord) : bot qui interroge le serveur par RCON ou via une API de plugin, avec rôle requis pour les commandes sensibles.

## Tests
- Serveur Discord de test séparé pour essayer le bot avant de le déployer sur le vrai serveur.
