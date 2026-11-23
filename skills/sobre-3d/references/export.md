# Export vers un moteur de jeu ou le web

## Avant tout export
- Transformations appliquées (échelle 1, rotation 0), origine correcte, modificateurs appliqués sur une **copie** du fichier.
- Noms propres pour objets, matériaux, os et actions : ils deviennent les noms dans le moteur.
- Normales correctes, pas de n-gones (le moteur triangule à sa façon), UV présentes si textures.
- Textures en puissances de 2, compactées ou à côté du fichier.

## Formats
| Cible | Format conseillé | Points d'attention |
|---|---|---|
| Roblox | FBX (ou OBJ pour du statique simple) | Échelle (Roblox compte en studs), limites de triangles par maillage, squelette et noms d'os pour les avatars : vérifie avec les skills du MCP Roblox (`list_roblox_skills`) avant d'exporter |
| Unity | FBX | Axe avant -Z, cocher « Appliquer les transformations » ; animations comme actions séparées |
| Godot, web (three.js) | glTF 2.0 (.glb) | Format le plus fidèle pour matériaux PBR ; vérifier la taille du fichier |
| Impression 3D | STL ou 3MF | Maillage fermé (manifold), épaisseur de parois, unité en millimètres |

## Animations
- Exporter seulement les os de déformation.
- Une action par animation, plage d'images exacte, échantillonnage à la cadence du jeu.

## Vérification
- Réimporter le fichier exporté dans une scène vide et comparer : nombre d'objets, dimensions, matériaux, nombre d'actions.
- Noter dans le cerveau du projet (`.cerveau/conventions.md`) les réglages d'export qui fonctionnent, pour ne pas les rechercher la prochaine fois.
