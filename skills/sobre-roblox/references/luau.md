# Luau : écrire du code solide

## Style
- `--!strict` en tête des nouveaux scripts et types sur les fonctions publiques : beaucoup d'erreurs sont trouvées avant de lancer le jeu.
- `local` partout ; services récupérés une fois en haut : `local Players = game:GetService("Players")`.
- Noms clairs, fonctions courtes, une responsabilité par ModuleScript.

## API modernes
- `task.wait`, `task.spawn`, `task.delay`, `task.defer` au lieu de `wait`, `spawn`, `delay` (dépréciés).
- `Instance:WaitForChild("Nom", délai)` côté client pour ce qui est répliqué ; jamais de chemins supposés présents au chargement.
- `GetAttribute` / `SetAttribute` pour des données simples sur une instance plutôt que des objets Value.
- Vérifie toute API dont tu n'es pas sûr avec les skills Roblox du MCP : la plateforme évolue vite.

## Fiabilité
- `pcall` autour de tout ce qui peut échouer côté serveur : DataStore, HTTP, MarketplaceService, téléportations. Réessayer avec un délai croissant, journaliser l'échec.
- Déconnecter les connexions qui ne servent plus (`connection:Disconnect()`), nettoyer à la sortie d'un joueur (`Players.PlayerRemoving`) : sinon fuites de mémoire.
- Éviter les boucles `while true do` sans `task.wait` ; préférer les événements (`Changed`, `Touched`, `Heartbeat` avec parcimonie).

## Performance
- Pas de travail lourd dans `RenderStepped` / `Heartbeat` à chaque image ; mettre en cache les références.
- Regrouper les envois réseau ; ne pas envoyer un RemoteEvent par image.
- Réutiliser les objets (pool) pour projectiles et effets fréquents.

## Débogage
- Reproduire en jeu, lire la console (`get_console_output`), corriger la cause, retester. Un `print` ciblé vaut mieux qu'une supposition ; le retirer ensuite.
