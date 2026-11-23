---
name: sobre-roblox
description: Méthode pour Roblox Studio et Luau (scripts, systèmes de jeu, interface, données, multijoueur, import de modèles). À utiliser dès qu'une tâche touche Roblox, Luau, une place .rbxl ou le MCP Roblox Studio.
---

# Roblox Studio

## D'abord : les skills officiels de Roblox
Le MCP Roblox Studio fournit ses propres guides à jour. Avant une tâche non triviale, liste-les (`list_roblox_skills`) et lis celui qui correspond (`get_roblox_skill`). Ils priment sur ce fichier pour tout ce qui touche à l'API Roblox.

Lis ensuite seulement la référence utile :

| Tâche | Référence |
|---|---|
| Écrire ou corriger du Luau | `references/luau.md` |
| Architecture du jeu, client/serveur, données, sécurité | `references/architecture.md` |

## Méthode économe avec le MCP
1. **Chercher avant de lire.** `script_grep` / `script_search` / `search_game_tree` pour trouver l'endroit exact, puis `script_read` sur les lignes utiles. Ne lis pas tous les scripts.
2. **Inspecter par le texte** (`inspect_instance`, `get_studio_state`) plutôt que par capture d'écran. Une capture (`screen_capture`) seulement pour vérifier un résultat visuel, une par étape.
3. **Modifier précisément** (`multi_edit`) plutôt que réécrire un script entier.
4. **Tester pour de vrai** : `start_stop_play`, puis `get_console_output`. Aucune fonctionnalité n'est « finie » sans un test en jeu sans erreur dans la console.
5. **Sauvegarder** (`save_place`) après chaque étape validée.
6. Génération d'assets (`generate_mesh`, `generate_material`, `generate_texture`…) : décris précisément ce que tu veux (style, taille en studs, usage) et vérifie le résultat avant d'en générer d'autres.
