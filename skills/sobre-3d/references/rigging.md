# Rigging (squelette)

## Préparer le maillage
- Transformations appliquées, origine au sol entre les pieds, personnage face à -Y, en T ou A.
- Boucles d'arêtes aux articulations, sinon la déformation sera mauvaise quel que soit le rig.

## Squelette
- Partir d'un modèle quand c'est possible (Rigify pour un humanoïde complet). Pour un jeu, un squelette simple et propre vaut mieux qu'un rig de film.
- Noms avec côté : `Bras.L` / `Bras.R` (permet la symétrie et le miroir de poses).
- Os racine (`Root`) au sol, hiérarchie propre : racine > bassin > colonne > cou > tête ; bassin > cuisses ; colonne > épaules > bras.
- Orientation des os cohérente (roulis) : recalculer le roulis après placement.
- Os de déformation séparés des os de contrôle pour les rigs complexes ; seuls les os de déformation sont exportés vers un jeu.

## Poids
- Parenter avec poids automatiques, puis vérifier en posant le personnage dans des poses extrêmes (bras levés, genoux pliés, torsion).
- Corriger en peinture de poids ; normaliser les poids ; limiter à 4 influences par sommet pour les moteurs de jeu.

## Contrôles
- Cinématique inverse (IK) pour jambes et bras qui touchent quelque chose ; pôles pour orienter genoux et coudes.
- Contraintes (Copier la rotation, Suivi) plutôt que des pilotes complexes quand c'est possible.

## Vérification
- Pose de test numérique : faire pivoter chaque os principal, vérifier qu'aucun sommet ne part ailleurs (comparer les dimensions du maillage évalué).
- Remettre en pose de repos avant export.
- Pour Roblox : vérifier les contraintes de squelette et de noms d'os avec les skills Roblox avant d'exporter (avatars R15 en particulier).
