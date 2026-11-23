# Architecture d'un jeu Roblox

## Où va quoi
| Emplacement | Contenu |
|---|---|
| `ServerScriptService` | Logique serveur (règles, données, anti-triche). Jamais visible du client |
| `ServerStorage` | Assets et modules réservés au serveur |
| `ReplicatedStorage` | Modules partagés, RemoteEvents/RemoteFunctions, assets visibles des deux côtés |
| `StarterPlayerScripts` / `StarterCharacterScripts` | Scripts client (contrôles, caméra, effets) |
| `StarterGui` | Interface |

## Le serveur a toujours raison
- Le client ne décide jamais : argent, dégâts, inventaire, positions importantes sont validés et appliqués par le serveur.
- Chaque RemoteEvent reçu côté serveur vérifie : type des arguments, valeurs plausibles (distance, délai entre deux actions, objet possédé), joueur autorisé. Le premier argument est toujours le joueur, fourni par Roblox : ne pas le demander au client.
- RemoteFunction du serveur vers le client : à éviter (le client peut ne jamais répondre).

## Données des joueurs
- Un module unique gère le DataStore : chargement à l'arrivée, sauvegarde à la sortie et périodique, et à l'arrêt du serveur (`game:BindToClose`).
- `UpdateAsync` plutôt que `SetAsync` pour éviter d'écraser des données ; `pcall` et nouvelles tentatives.
- Ne jamais perdre une sauvegarde : si le chargement échoue, ne pas sauvegarder par-dessus des données vides.
- Version du format de données pour pouvoir migrer plus tard.

## Organisation du code
- Modules par système (Combat, Inventaire, Boutique, Interface) avec une interface claire ; un script d'entrée serveur et un script d'entrée client qui les initialisent.
- Configuration (prix, dégâts, temps de recharge) dans des modules de config, pas en dur dans la logique.

## Avant de dire « c'est fini »
- Test en jeu solo, puis test multijoueur local (2 joueurs) pour la réplication.
- Console sans erreur ni avertissement nouveau, sauvegarde et rechargement des données vérifiés.
- Noter les choix d'architecture dans `.cerveau/decisions.md`.
