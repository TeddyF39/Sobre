# Méthode : fonctionnalité, modification, refactorisation

## 1. Cadrer (2 minutes, pas plus)
- Reformule l'objectif en une phrase et les critères de réussite vérifiables (« la commande X renvoie Y », « le test Z passe »).
- Si une décision change beaucoup le résultat et qu'elle n'est pas évidente, pose UNE question. Sinon choisis l'option la plus simple et dis-le.

## 2. Repérer
- Trouve les points d'entrée et les endroits à modifier par recherche ciblée. Note les conventions existantes (style, structure, gestion d'erreurs, tests) et respecte-les.

## 3. Planifier (si plus de 3 fichiers ou plus d'une heure)
- Liste d'étapes courtes, chacune vérifiable seule. Commence par la plus risquée.

## 4. Modifier
- Modifications ciblées (édition de lignes), pas de réécriture de fichiers entiers.
- Gestion d'erreurs explicite aux frontières (entrées utilisateur, réseau, fichiers, processus externes). Messages d'erreur utiles.
- Pas de valeurs magiques : constantes nommées ou configuration.
- Refactorisation : comportement identique, vérifié par des tests avant et après. Jamais mélangée avec un changement de fonctionnalité dans la même étape.

## 5. Vérifier
- Lancer les tests concernés, puis la suite complète si elle est rapide. Lint et vérification des types si le projet en a.
- Lancer réellement le programme pour le chemin modifié quand c'est possible.
- Relire le diff : code mort, `print` de débogage, secrets, fichiers modifiés par erreur.

## 6. Versionner
- Un commit par étape logique, message clair (quoi et pourquoi). Jamais de commit avec des tests cassés sans le dire.

## Économie de tokens
- Ne réaffiche pas les fichiers modifiés ; résume les changements.
- Sorties de commandes filtrées sur l'essentiel (erreurs, résumé).
- Utilise les agents spécialisés (exploration, revue) pour les grosses lectures : ils renvoient une synthèse.
