# Sécurité

## Secrets
- Jamais de clé d'API, mot de passe ou jeton dans le code, les logs, les messages de commit ou le cerveau du projet.
- Fichier `.env` (ignoré par git, avec un `.env.example` sans valeurs) ou gestionnaire de secrets du système.
- Avant un commit : vérifier le diff à la recherche de secrets. Si un secret a été publié, il faut le révoquer, pas seulement le supprimer.

## Entrées
- Toute entrée extérieure (utilisateur, fichier, réseau, client de jeu) est non fiable : valider le type, la taille, le format.
- Requêtes SQL paramétrées, jamais de concaténation.
- Commandes système : liste d'arguments, jamais de chaîne passée au shell avec des données utilisateur.
- Chemins de fichiers : interdire de sortir du dossier autorisé (`..`, chemins absolus).

## Programmes qui agissent sur le PC (assistants, automatisations)
- Liste blanche des actions et des dossiers autorisés ; tout le reste demande une confirmation explicite.
- Confirmation humaine avant : suppression, installation, paiement, envoi de messages, accès à des comptes.
- Journal des actions effectuées, lisible par l'utilisateur.
- Fichiers téléchargés : vérification avant exécution (antivirus, empreinte), jamais d'exécution automatique.

## Dépendances
- Versions fixées, sources officielles, mise à jour régulière ; méfiance envers les paquets peu connus au nom proche d'un paquet célèbre.

## Réseau
- HTTPS partout ; un serveur local écoute sur `127.0.0.1` sauf besoin réel ; authentification pour tout accès à distance (téléphone).
