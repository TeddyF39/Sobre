# Appli de bureau Windows, notifications, téléphone

## Choix de la technologie (à trancher une fois, noter dans `.cerveau/decisions.md`)
| Option | Pour | Contre |
|---|---|---|
| Python + PySide6 (Qt) | Tout en Python avec la voix et l'IA | Interface moins moderne sans effort |
| Tauri (web + Rust) | Léger, interface web moderne | Deux langages |
| Electron (web + Node) | Interface web, écosystème énorme | Gourmand en mémoire |
| Interface web locale (serveur Python + navigateur) | Simple, accessible aussi depuis le téléphone | Pas une « vraie » fenêtre sans enveloppe |

Une architecture fréquente : un service Python en arrière-plan (voix, IA, tâches) + une interface qui lui parle par une API locale (HTTP ou WebSocket sur 127.0.0.1). L'interface peut alors être remplacée ou doublée par une version mobile.

## Interface
- Pour le design : utiliser le skill `frontend-design` (installé par Sobre) et les maquettes de l'utilisateur comme référence.
- Thème sombre, contrastes lisibles (accessibilité), états clairs : écoute, réflexion, parole, inactif, erreur.

## Notifications Windows
- Notifications natives (toasts) via une bibliothèque Python dédiée ou l'API de la technologie choisie ; texte court, action cliquable si possible.

## Accès depuis le téléphone
- Ne jamais exposer le PC directement sur Internet. Passer par un réseau privé (VPN de type Tailscale) ou un service de relais authentifié.
- Authentification obligatoire, journal des demandes reçues.
- Notifications vers le téléphone : service de notifications push (ex. ntfy, Pushover) ou messagerie avec bot ; demandes d'autorisation avec réponse oui/non.

## Tâches de fond et planification
- Planificateur intégré (ex. APScheduler en Python) pour les tâches programmées ; elles continuent tant que le service tourne.
- Démarrage avec Windows : tâche planifiée ou entrée de démarrage, désactivable.
- Arrêt propre : un bouton « tout arrêter » qui coupe les tâches, la voix et le service.

## Robustesse
- Logs dans un dossier dédié avec rotation ; erreurs visibles dans l'interface.
- Redémarrage automatique du service en cas de plantage, sans boucle infinie.
- Sauvegarde régulière des données (tâches, historique, mémoire).
