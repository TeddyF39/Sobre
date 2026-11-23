# Matériaux, UV, éclairage, rendu

## Matériaux
- Base : nœud Principled BSDF. Paramètres physiques plausibles : métal = Metallic 1, rugosité 0,2-0,5 ; plastique = Metallic 0, rugosité 0,3-0,6 ; bois/tissu = rugosité 0,6-0,9.
- Couleurs de base jamais en noir ou blanc pur (garder ~0,02-0,9).
- Un matériau par type de surface, nommé (`Bois_Chene`, `Metal_Brosse`). Réutiliser plutôt que dupliquer.
- Textures image : couleur en espace sRGB ; rugosité, métal, normal en Non-Color. Carte normale via nœud Normal Map.
- Pour un jeu : viser des textures PBR (couleur, normal, rugosité, métal), tailles en puissances de 2 (512, 1024, 2048).

## UV
- Déplier avant de texturer : coutures sur les arêtes peu visibles, puis dépliage, puis vérification de l'étirement (texture damier).
- Îlots sans chevauchement si on cuit des textures ; densité de texels homogène.
- Objets simples sans texture image : les UV peuvent attendre.

## Cuisson (bake)
- Pour un jeu : cuire normales (haut vers bas poly), occlusion ambiante, couleur. Moteur Cycles requis pour la cuisson.

## Éclairage
- Point de départ : éclairage trois points (principale, remplissage, contre-jour) ou une HDRI pour du réalisme.
- Éviter les lumières de puissance absurde ; ajuster l'exposition dans Gestion des couleurs plutôt que pousser toutes les lumières.

## Caméra
- Focale 35-50 mm pour une vue naturelle, 85 mm et plus pour un portrait ou un produit. Règle des tiers, horizon droit.

## Rendu
- EEVEE pour aperçus rapides et rendus stylisés ; Cycles pour le réalisme (échantillons + débruitage).
- Contrôles intermédiaires : petite résolution, peu d'échantillons. Rendu final seulement quand tout est validé.
- Vérifie le chemin de sortie et le format (PNG pour images, séquence PNG ou vidéo pour animations).
- Un rendu de contrôle = une image en petite taille. Décris ce qui ne va pas avant de corriger, puis un seul nouveau rendu.
