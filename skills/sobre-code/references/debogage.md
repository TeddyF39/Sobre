# Débogage méthodique

1. **Reproduire.** Obtenir le message d'erreur exact et une façon fiable de déclencher le bug (commande, test, étapes). Sans reproduction, pas de correction.
2. **Lire l'erreur en entier.** Trace de pile : la première ligne qui pointe dans le code du projet est souvent la bonne piste.
3. **Chercher dans les pièges connus** : `.cerveau/pieges.md` s'il existe.
4. **Isoler.** Réduire le cas au minimum. Vérifier les hypothèses une par une avec un `print` / log ciblé ou un test, pas en modifiant au hasard.
5. **Trouver la cause, pas le symptôme.** Se demander pourquoi la valeur est fausse, jusqu'à la vraie origine. Pas de `try/except` qui masque l'erreur.
6. **Écrire un test qui échoue** à cause du bug, corriger, vérifier qu'il passe et que les autres passent toujours.
7. **Nettoyer** les logs temporaires.
8. **Noter** dans `.cerveau/pieges.md` : `- symptôme - cause - solution` si la cause n'était pas évidente.

## Si ça bloque après 3 tentatives
- Arrêter de modifier. Résumer ce qui est établi (faits) et ce qui est supposé, puis remettre en question une hypothèse de départ (version d'une dépendance, configuration, environnement, données d'entrée).
- Vérifier la documentation actuelle de la bibliothèque concernée.

## Erreurs fréquentes à vérifier vite
- Environnement : mauvaise version de Python/Node, environnement virtuel non activé, variable d'environnement absente.
- Chemins : relatifs au mauvais dossier, séparateurs Windows (`\`) vs `/`, espaces dans les chemins.
- Encodage : UTF-8 sous Windows (console, lecture de fichiers).
- Asynchrone : promesse non attendue, tâche non attendue, course entre deux actions.
- Cache : ancien build, fichier `.pyc`, cache du navigateur.
