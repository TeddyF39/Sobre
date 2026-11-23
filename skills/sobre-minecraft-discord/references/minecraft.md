# Serveur Minecraft

## Socle
- Paper (ou un dérivé) pour un serveur avec plugins : plus performant que le serveur officiel et compatible Bukkit/Spigot.
- Java à la version demandée par la version de Minecraft ; mémoire allouée raisonnable (4 à 8 Go pour un petit groupe) avec les options JVM recommandées par Paper.
- `server.properties` : `difficulty`, `hardcore`, `view-distance` et `simulation-distance` (baisser si ça rame), `white-list=true` pour un serveur entre amis.

## Plugins utiles (à vérifier selon la version)
| Besoin | Plugins courants |
|---|---|
| Permissions et rangs | LuckPerms |
| Protection de zones | WorldGuard (+ WorldEdit) |
| Sauvegardes | Plugin de sauvegarde automatique ou script externe |
| Pré-génération du monde | Chunky |
| Lien avec Discord | DiscordSRV |
| Roleplay (personnages, métiers, monnaie) | Choisir selon le besoin précis et tester la compatibilité entre eux |

- Ajouter les plugins un par un, redémarrer, lire la console (`logs/latest.log`) avant le suivant.

## Datapacks
- Dossier `world/datapacks/`, `pack.mcmeta` avec le bon `pack_format` pour la version ; `/reload` puis `/datapack list` pour vérifier.
- Fonctions `.mcfunction` courtes et commentées ; balises `tick` et `load` avec parcimonie (performances).

## Roleplay et hardcore
- Règles écrites (salon Discord dédié) avant de lancer.
- Hardcore entre amis : décider à l'avance ce qui se passe à la mort (spectateur, bannissement temporaire, réapparition limitée) et le configurer, pas l'improviser.

## Sauvegardes
- Automatiques et régulières, conservées hors du dossier du serveur, avec rotation ; **tester une restauration** au moins une fois.
- Sauvegarde manuelle avant chaque mise à jour de version ou de plugin.

## Performances
- Diagnostic avec un profileur (spark) avant de modifier au hasard ; causes fréquentes : fermes à entités, redstone, distance de vue, chunks non pré-générés.

## Administration
- Commandes à distance par RCON (mot de passe fort, port non exposé publiquement).
- Liste blanche et opérateurs limités.
