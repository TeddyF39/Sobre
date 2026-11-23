---
name: sobre-code
description: Méthode de travail pour du code fiable et économe en tokens (comprendre, planifier, modifier, tester, déboguer, sécuriser, versionner). À utiliser pour toute tâche de développement, correction de bug, refactorisation ou revue de code, quel que soit le langage.
---

# Code fiable

Lis seulement la référence utile :

| Tâche | Référence |
|---|---|
| Nouvelle fonctionnalité, modification, refactorisation | `references/methode.md` |
| Bug, erreur, comportement inattendu | `references/debogage.md` |
| Tests | `references/tests.md` |
| Sécurité, secrets, données utilisateur | `references/securite.md` |

## Règles qui s'appliquent toujours
1. **Comprendre avant de modifier** : cerveau du projet (`.cerveau/INDEX.md`) s'il existe, puis recherche ciblée (agent `sobre-eclaireur`, `grep`, serveur de langage). Ne lis pas des dossiers entiers.
2. **Documentation à jour** : pour une bibliothèque ou un framework dont l'API a pu changer, consulte la doc actuelle (outil Context7 s'il est installé) au lieu de te fier à la mémoire.
3. **Plus petit changement correct** : pas de refonte non demandée, pas de fonctionnalité spéculative.
4. **Vérifier par l'exécution** : tests, lint, lancement réel. « Ça devrait marcher » n'est pas un résultat.
5. **Ne jamais inventer** : un test non lancé est « non testé », une erreur est montrée telle quelle.
6. **Fin de tâche** : résumé court (fichiers touchés, comment c'est vérifié, ce qui reste), une ligne dans le cerveau si une décision ou un piège mérite d'être retenu.
