---
name: sobre-3d
description: Méthode pour la 3D dans Blender (modélisation, matériaux, éclairage, rendu, animation, rigging, export vers Roblox ou un moteur de jeu). À utiliser dès qu'une tâche touche Blender, un fichier .blend, un modèle 3D, une animation ou un export FBX/glTF/OBJ.
---

# 3D dans Blender

Lis seulement la référence utile à la tâche :

| Tâche | Référence |
|---|---|
| Créer ou modifier un objet, topologie, modificateurs | `references/modelisation.md` |
| Matériaux, textures, UV, lumières, caméra, rendu | `references/materiaux-rendu.md` |
| Animation, images clés, courbes, boucles | `references/animation.md` |
| Squelette, poids, contraintes, personnage | `references/rigging.md` |
| Export vers Roblox, Unity, Godot, web (FBX, glTF, OBJ) | `references/export.md` |

## Règles communes (toujours)

1. **Inspecter avant d'agir.** Commence par un résumé texte de la scène (outils du MCP Blender comme `get_objects_summary`, `get_object_detail_summary`, `get_blendfile_summary_*`). Ne prends une capture d'écran que si le texte ne suffit pas.
2. **Vérifier l'API, pas la mémoire.** L'API Python de Blender change entre versions (surtout l'animation). En cas de doute sur une fonction, cherche-la (`search_api_docs`, `get_python_api_docs`, `search_manual_docs`) avant d'écrire le code. Note la version : `bpy.app.version_string`.
3. **Petits blocs de code.** Avec `execute_blender_code`, un bloc = une étape vérifiable. Le bloc affiche ce qu'il a fait (`print` des noms, dimensions, nombre de faces). Pas de script géant d'un coup.
4. **Accès par données, pas par opérateurs.** Préfère `bpy.data` et `bmesh` à `bpy.ops` (qui dépend du contexte et casse hors vue 3D). Si `bpy.ops` est nécessaire, passe le contexte avec `bpy.context.temp_override(...)`.
5. **Noms et rangement.** Noms explicites (`Table_Plateau`, pas `Cube.003`), une collection par ensemble logique. Retrouve les objets par nom, jamais par sélection implicite.
6. **Échelle réelle.** 1 unité = 1 mètre. Une porte fait ~2 m, une table ~0,75 m. Applique l'échelle et la rotation (`transform_apply`) avant modificateurs, rig et export.
7. **Non destructif d'abord.** Modificateurs (Miroir, Biseau, Subdivision, Tableau) plutôt que géométrie figée, tant que le modèle peut encore changer.
8. **Sauvegarder avant les opérations risquées** (application de modificateurs, jointure, nettoyage) : `bpy.ops.wm.save_as_mainfile(filepath=..., copy=True)` vers une copie numérotée.
9. **Vérifier le résultat.** À chaque étape importante : chiffres (dimensions, nombre de faces, objets attendus présents). À la fin d'une étape visuelle : **un** rendu de contrôle en petite taille (`render_viewport_to_path` ou `render_thumbnail_to_path`, ~512 px). Les images coûtent cher en tokens : une par jalon, pas une par modification.
10. **Ne jamais annoncer un résultat non vérifié.** Si une étape a échoué, dis-le et montre l'erreur.
