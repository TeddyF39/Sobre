# Modélisation

## Avant de commencer
- Clarifie l'usage : rendu fixe, animation (déformation), jeu temps réel (budget de polygones), impression 3D (maillage fermé). Ça décide de la topologie.
- Cherche des références de proportions (dimensions réelles) et note-les en mètres.
- Bloque les volumes simples d'abord (blockout), valide les proportions, puis détaille.

## Topologie
- Quads partout où le maillage se déforme (personnages, vêtements) ou sera subdivisé. Les triangles sont acceptables sur surfaces plates et rigides ; évite les n-gones sur les zones courbes.
- Boucles d'arêtes qui suivent la forme et les plis d'articulation (épaules, coudes, genoux, bouche, yeux).
- Densité uniforme ; ajoute de la géométrie là où la forme change, pas ailleurs.
- Supprime les doublons (`bmesh.ops.remove_doubles`, distance ~0,0001), recalcule les normales vers l'extérieur (`bmesh.ops.recalc_face_normals`).
- Vérifie : sommets isolés, faces internes, normales inversées, arêtes non manifold (impression 3D).

## Surfaces dures (objets, armes, bâtiments, véhicules)
- Biseau (modificateur Bevel, limite par angle ~30°, 2-3 segments) + normales pondérées (Weighted Normal) + lissage auto.
- Ou subdivision avec boucles de soutien près des arêtes vives.
- Booléens pour découper, puis nettoyage de la topologie autour de la découpe.

## Organique (personnages, créatures)
- Partir d'une base simple (cube subdivisé, peau, sculpt puis retopologie).
- Symétrie avec Miroir (axe X) tant que possible ; appliquer seulement à la fin.
- Pour un personnage animé : bras en T ou A, pieds au sol à Z=0, regard vers -Y (avant de Blender).

## Procédural
- Geometry Nodes pour répétitions, dispersion, variations. Expose les paramètres utiles en entrées du groupe de nœuds.
- Tableau (Array) + Courbe pour clôtures, escaliers, chaînes.

## Origine et transformations
- Origine à un endroit logique : base pour un meuble, pivot pour une porte, centre de masse pour un objet qui tourne.
- Appliquer échelle et rotation avant export, rig ou physique.

## Budget jeu (ordre de grandeur, à adapter)
- Accessoire : quelques centaines à 2 000 triangles. Personnage : 5 000 à 20 000. Roblox impose des limites par maillage : vérifie-les avec les skills Roblox avant d'exporter.

## Vérification finale
- Dimensions (`obj.dimensions`), nombre de faces et triangles, absence de n-gones sur zones déformées, normales correctes, transformations appliquées, noms propres.
