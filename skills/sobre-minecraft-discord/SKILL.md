---
name: sobre-minecraft-discord
description: Méthode pour un serveur Minecraft (Paper, plugins, permissions, datapacks, roleplay, sauvegardes, performances) et un serveur ou bot Discord (salons, rôles, bots, commandes slash, liaison avec le jeu). À utiliser pour toute tâche Minecraft serveur ou Discord.
---

# Minecraft serveur et Discord

Lis seulement la référence utile :

| Tâche | Référence |
|---|---|
| Serveur Minecraft, plugins, datapacks, roleplay | `references/minecraft.md` |
| Serveur Discord, bot, liaison avec Minecraft | `references/discord.md` |

## Règles qui s'appliquent toujours
1. **Sauvegarde avant toute modification** du serveur (monde, dossier `plugins`, configurations). Une seule mauvaise config peut casser un monde hardcore.
2. **Versions** : vérifie la version exacte de Minecraft et du serveur avant de proposer un plugin ou un datapack ; un plugin pour une autre version peut ne pas charger ou corrompre des données.
3. **Sources officielles** pour les plugins (Hangar, Modrinth, SpigotMC, GitHub du projet) ; jamais de fichiers .jar d'origine douteuse.
4. **Tester sur une copie** du serveur quand c'est possible, puis appliquer.
5. **Secrets** : jeton du bot Discord et identifiants RCON jamais dans le code ou les messages, seulement dans un fichier de configuration privé.
