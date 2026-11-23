# Tests

## Quoi tester
- La logique métier (calculs, règles, transformations de données) : tests unitaires rapides.
- Les frontières (base de données, fichiers, API, processus) : tests d'intégration avec de vraies dépendances locales quand c'est possible, simulacres seulement pour les services externes payants ou lents.
- Les parcours critiques de l'utilisateur : quelques tests de bout en bout (Playwright pour une interface web, s'il est installé).
- Chaque bug corrigé : un test de régression.

## Comment
- Un test = un comportement, nom qui le décrit (`test_refuse_un_mot_de_passe_trop_court`).
- Structure : préparer, agir, vérifier.
- Pas de dépendance à l'ordre des tests, à l'heure, au réseau ou à l'aléatoire non fixé.
- Cas limites : vide, zéro, négatif, très grand, caractères spéciaux et accents, fichier absent, réseau coupé.

## Outils courants
- Python : `pytest` (`pytest -x -q` pour s'arrêter à la première erreur avec une sortie courte).
- JavaScript / TypeScript : `vitest` ou `jest`.
- Luau / Roblox : tests en jeu via le MCP (`start_stop_play` + console), ou un framework de tests Roblox si le projet en a un.

## Règles
- Ne jamais modifier un test pour qu'il passe sans comprendre pourquoi il échouait.
- Ne jamais annoncer « les tests passent » sans les avoir lancés dans cette session ; donner le résultat réel (nombre passés / échoués).
- Sortie courte : afficher les échecs, pas les centaines de tests réussis.
