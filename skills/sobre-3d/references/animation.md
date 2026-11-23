# Animation

## Avant d'écrire du code
- **L'API d'animation de Blender a changé récemment** (actions à emplacements puis à calques dans les versions 4.x et 5.x). Vérifie la version (`bpy.app.version_string`) et cherche dans la doc (`search_api_docs` : "Action", "fcurve", "keyframe_insert", "channelbag") avant d'accéder aux courbes. `obj.keyframe_insert(data_path=..., frame=...)` reste la voie la plus stable pour poser des clés.
- Fixe d'abord : images par seconde (24 par défaut, 30 pour web et jeux), début et fin de la plage, durée en secondes.

## Méthode
1. Poses clés (extrêmes) d'abord, en interpolation constante pour juger le rythme.
2. Puis intervalles (breakdowns), puis passage en interpolation Bézier.
3. Polissage : courbes, chevauchements, petits mouvements secondaires.

## Principes qui font la différence
- Anticipation avant un mouvement, amorti à l'arrivée (ease in / ease out).
- Arcs : les membres décrivent des courbes, pas des lignes droites.
- Chevauchement et suivi : cheveux, queue, vêtements arrivent après le corps.
- Exagération légère et timing : un mouvement lourd est lent à démarrer, un mouvement léger est vif.
- Poids : le centre de gravité descend à la réception d'un saut.

## Boucles (marche, course, idle)
- Première et dernière clé identiques ; la dernière image n'est pas dupliquée dans la plage rendue (sinon saccade).
- Modificateur de courbe Cycles pour répéter.
- Marche : contact, descente, passage, montée ; ~1 s par cycle à 24 i/s pour une marche normale.

## Organisation
- Une action par mouvement, nommée (`Marche`, `Saut`, `Idle`). Faux utilisateur (fake user) pour ne pas les perdre.
- NLA pour enchaîner ou mélanger des actions.

## Vérification (économe)
- Vérifie numériquement : position et rotation aux images clés (évaluer à une image donnée avec `scene.frame_set(n)` puis lire `matrix_world`), absence de saut entre la dernière et la première image d'une boucle.
- Visuel : 3 ou 4 images clés en petite taille plutôt qu'une vidéo complète. Le rendu vidéo vient en dernier.
