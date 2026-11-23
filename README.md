# Sobre

**Moins de tokens, même qualité.** Une commande pour brancher les meilleurs outils d'économie de tokens sur **Claude Code**, **Codex** et **Cursor**, réglés pour ne pas dégrader le code produit, avec une mesure avant/après intégrée.

![plateformes](https://img.shields.io/badge/plateformes-Windows%20%7C%20macOS%20%7C%20Linux-blue) ![licence](https://img.shields.io/badge/licence-MIT-green)

```powershell
# Windows (PowerShell)
irm https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.ps1 | iex
```

```sh
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.sh | sh
```

Prérequis : Node.js 22+. Lis toujours un script avant de l'exécuter.

---

## Pourquoi Sobre

Les outils existent déjà (RTK, context-mode, Caveman, CodeGraph). Le travail difficile, c'est de les assembler sans casser sa config et sans perdre en qualité. Sobre part de trois principes :

1. **La qualité d'abord.** Chaque outil retenu supprime du bruit (sorties de commandes, relectures inutiles), pas de la réflexion. Les outils qui risquent de dégrader le code sont exclus (voir plus bas).
2. **Rien d'irréversible.** Chaque fichier modifié est sauvegardé. `sobre restaurer` remet tout comme avant. `--simulation` montre le plan sans rien toucher.
3. **On mesure.** `sobre mesure` lit tes journaux Claude Code et compare ta consommation par heure de travail avant et après l'installation. Pas besoin de penser à faire une mesure avant : les journaux existants servent de référence.

## Profils

| Profil | Pour qui | Contenu |
|---|---|---|
| `qualite` | Zéro compromis | RTK, context-mode, règles Sobre, agent éclaireur, passation, cerveau du projet |
| `equilibre` (défaut) | Recommandé | `qualite` + réponses plus courtes (Caveman) + code plus simple (Ponytail) |
| `max` | Gros projets | `equilibre` + CodeGraph |

```sh
sobre --profil qualite
sobre --agents claude,codex --sans caveman
sobre --simulation
```

## Ce qui est installé

| Outil | Rôle | Claude Code | Codex | Cursor |
|---|---|:-:|:-:|:-:|
| [RTK](https://github.com/rtk-ai/rtk) | Compresse les sorties de commandes (git, tests, ls…) avant qu'elles entrent dans le contexte | hook | hook | hook |
| [context-mode](https://github.com/mksglu/context-mode) | Traite gros fichiers et logs hors contexte, seule la réponse revient | plugin | MCP | MCP |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Réponses plus courtes ; code, commandes et chemins intacts | plugin | — | — |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Pousse à écrire le code le plus simple qui marche (YAGNI, bibliothèque standard d'abord) | plugin | plugin | — |
| [CodeGraph](https://github.com/colbymchenry/codegraph) | Graphe du code interrogé au lieu de lire des fichiers entiers | MCP | MCP | MCP |
| **Règles Sobre** | 6 à 8 consignes courtes : lire des plages de lignes, ne montrer que les échecs des tests… | CLAUDE.md | AGENTS.md | `sobre projet` |
| **Agent `sobre-eclaireur`** | Les recherches dans le projet passent par Haiku, moins cher, qui renvoie une synthèse | ✓ | — | — |
| **Stats** | Barre d'état en bas de Claude Code : % de ta limite 5h et 7 jours, heure du reset, remplissage du contexte. Tourne en local, **0 token**. Plus `sobre stats` et `/sobre-stats` | ✓ | — | — |
| **Cerveau automatique** | Crée le cerveau une seule fois par projet (exploration déléguée à Haiku), puis ajoute une ligne après chaque décision ou bug résolu, sans relire les notes | ✓ | ajout de lignes | ajout de lignes |
| **Cerveau du projet** | Mémoire durable du projet dans `.cerveau/` (notes Markdown, s'ouvre dans Obsidian) : l'agent lit un index de 30 lignes au lieu de ré-explorer le code à chaque session | `/sobre-cerveau` | règles | règles |
| **Skill `/sobre-passation`** | Résume la session dans `.claude/passation.md` : tu fais `/clear` et tu reprends sans tout réexpliquer | ✓ | — | — |

Sobre délègue l'installation de chaque outil à sa méthode officielle (winget, plugin, npm, `rtk init`, `codegraph install`). Il n'écrit lui-même que ses blocs balisés (`sobre:debut` / `sobre:fin`) et ses propres fichiers, sans toucher au reste de ta config.

## Skills pour mieux travailler (Claude Code)

Installés dans tous les profils. Chaque skill ne charge qu'une courte description (environ 100 tokens) à chaque session ; le détail n'est lu que quand la tâche en a besoin.

**Packs maison** (dossier [`skills/`](skills/), à lire et modifier librement) :

| Pack | Quand il sert | Contenu |
|---|---|---|
| `sobre-3d` | Blender, modèle 3D, animation, export | Modélisation, matériaux et rendu, animation, rigging, export vers Roblox / Unity / Godot / web / impression 3D. Pensé pour le MCP Blender : inspection par le texte, vérification de l'API dans la doc, rendus de contrôle économes |
| `sobre-roblox` | Roblox Studio, Luau | Utilise d'abord les skills officiels du MCP Roblox, puis : Luau moderne, architecture client/serveur, sécurité des RemoteEvents, sauvegarde des données, tests en jeu |
| `sobre-code` | Tout développement | Méthode, débogage, tests, sécurité |
| `sobre-assistant-ia` | Assistant vocal type Jarvis | Mot d'éveil, reconnaissance et synthèse vocale, IA locale (Ollama, Qwen), routage local / Claude avec plafond de dépense, appli Windows, accès téléphone sécurisé |
| `sobre-minecraft-discord` | Serveur Minecraft, Discord | Paper, plugins, datapacks, sauvegardes, performances, bot Discord, liaison jeu ↔ Discord |

**Plugins officiels Anthropic** (marketplace `claude-plugins-official`) :

| Plugin | Profils | Rôle |
|---|---|---|
| `frontend-design` | tous | Interfaces soignées |
| `feature-dev` | tous | Fonctionnalités avec agents explorateur, architecte et relecteur |
| `code-simplifier` | tous | Simplifie le code sans changer son comportement |
| `commit-commands` | tous | Commit, push, pull request |
| `skill-creator` | tous | Créer et améliorer tes propres skills |
| `context7` | tous | Documentation à jour des bibliothèques (évite les API obsolètes) |
| `pyright-lsp`, `typescript-lsp` | tous | Navigation précise dans le code Python / TypeScript : moins de fichiers lus. Installe `pyright` et `typescript-language-server` via npm |
| `superpowers` | max | Brainstorming, plans, TDD, débogage systématique. Ajoute du contexte à chaque session |
| `code-review` | max | Revue de code multi-agents, à la demande |
| `playwright` | max | Tests de bout en bout dans un navigateur |
| `claude-security` | max | Recherche de failles, à la demande |
| `security-guidance` | sur demande seulement | Revue de sécurité automatique à chaque fin de réponse : coûte des tokens en continu, donc jamais installé par défaut (`--outils` pour le forcer) |

Retirer ce dont tu n'as pas besoin : `sobre --sans pack-mc-discord,typescript-lsp`.

Coût fixe estimé de l'ensemble : quelques milliers de tokens par session (descriptions des skills, agents et outils). C'est peu à côté d'une seule exploration de projet, mais si tu ne fais jamais de Roblox ou de Minecraft, retire ces packs.

## Volontairement exclus

| Outil | Pourquoi |
|---|---|
| headroom | Proxy local par lequel passe tout ton trafic API : une pièce de plus qui peut tomber en panne ou poser un risque de sécurité, pour un gain qui recoupe RTK. |
| pxpipe | Transforme le contexte en images : perte d'information. |
| projectmem | Injecte un bloc mémoire à chaque début de session : contre-productif sur les sessions courtes. |
| Mode `/ultracave` | Trop compressé pour des explications fiables. |

## Commandes

```
sobre                          installe / met à jour (relançable sans doublon)
sobre etat                     vérifie ce qui est branché
sobre stats                    tokens utilisés : 5 h, jour, semaine, par modèle et projet (0 token)
sobre mesure [--jours 14]      consommation avant / après (Claude Code)
sobre projet                   règles Sobre pour le projet courant (Cursor) + index CodeGraph en profil max
sobre cerveau                  crée le cerveau du projet courant (.cerveau/, compatible Obsidian)
sobre desinstaller [--agents]  retire tout ce que Sobre a posé
sobre restaurer                remet les fichiers d'avant la dernière opération
sobre maj                      met à jour Sobre
```

Options : `--profil`, `--agents claude,codex,cursor`, `--sans outil1,outil2`, `--simulation`, `--oui`.

## Guide des commandes Sobre

**`sobre`**
Installe les outils du profil choisi et les branche sur les agents détectés. Il pose d'abord deux questions (profil, confirmation). Tu peux le relancer autant que tu veux : ce qui est déjà en place n'est pas dupliqué. Relance-le après un changement de profil ou une mise à jour.

**`sobre --simulation`**
Affiche tout ce que Sobre ferait (commandes lancées, fichiers écrits) sans rien modifier. À lancer avant la première installation pour voir le plan.

**`sobre etat`**
Vérifie, agent par agent, que chaque élément est bien branché. `OK` = vérifié, `?` = impossible à vérifier depuis l'extérieur (les plugins se vérifient dans Claude Code), `X` = absent. À lancer après l'installation et après chaque redémarrage de tes agents.

**`sobre stats`** — 0 token
Tableau des tokens utilisés : 5 dernières heures, aujourd'hui, 7 derniers jours et **depuis le début**, avec pour chaque ligne le **prix en dollars si tu avais payé ces tokens à l'API**, sans abonnement. Aussi : le détail par modèle et par projet, et le dernier % de ta limite 5h relevé par la barre d'état. À lancer dans un terminal séparé : ça ne coûte rien.

- `sobre stats --abonnement 20` : indique ton abonnement en dollars par mois (enregistré) pour comparer avec le prix de l'API.
- `sobre stats --devise eur` : affiche tout en euros (enregistré) ; `--taux 0.87` règle le taux dollar → euro. `--devise usd` pour revenir aux dollars.
- **Depuis le début** : Claude Code efface ses journaux après 30 jours par défaut. Sobre garde son propre historique dans `~/.sobre/historique.json` à chaque `sobre stats`, donc le total continue de grandir même quand les journaux disparaissent. Le point de départ est le plus vieux journal encore présent au premier lancement.
- **Prix** : prix publics de l'API par million de tokens (entrée, sortie, écriture et lecture du cache, par modèle), relevés le 22/11/2026, hors taxes. C'est une estimation : un abonnement ne se facture pas au token.

**`sobre mesure`**
Lit tes journaux Claude Code et compare les tokens consommés par heure de travail avant et après l'installation. Trois lignes : le total, le total hors lecture du cache (ce qui pèse le plus), et les réponses seules. Attends au moins 5 heures de travail après l'installation pour un chiffre fiable. `--jours 30` élargit la période de comparaison.

**`sobre projet`**
À lancer dans le dossier d'un projet. Écrit les règles Sobre dans `.cursor/rules/sobre.mdc` (Cursor n'a pas de fichier de règles global). En profil `max`, construit aussi l'index CodeGraph du projet.

**`sobre cerveau`**
À lancer dans le dossier d'un projet. Crée `.cerveau/` avec un index et 4 notes vides : architecture, conventions, décisions, pièges. Ne remplace jamais une note existante. Ensuite, dans Claude Code, `/sobre-cerveau` les remplit (voir plus bas).

**`sobre desinstaller`**
Retire tout ce que Sobre a posé lui-même : ses blocs dans CLAUDE.md et AGENTS.md, l'agent éclaireur, la commande passation, ses entrées MCP. Tes propres réglages ne sont pas touchés. Les outils tiers (RTK, plugins) restent installés : la commande t'indique comment les retirer. `--agents codex` limite le retrait à un seul agent.

**`sobre restaurer`**
Remet les fichiers exactement comme avant la dernière opération de Sobre (installation ou désinstallation). C'est le bouton « annuler ».

**`sobre maj`**
Télécharge la dernière version de Sobre. Relance ensuite `sobre` pour appliquer les nouveaux réglages.

## Économiser au quotidien dans Claude Code

Les outils réduisent le bruit, mais le plus gros poste reste l'historique de la conversation : **à chaque message, Claude relit toute la conversation**. Après deux heures, une simple question coûte des dizaines de milliers de tokens rien qu'en relecture.

**`/clear`**
Vide la conversation : le compteur repart de zéro. Claude garde tes fichiers et tes règles (CLAUDE.md), mais oublie ce qui a été dit.
→ À faire **entre deux tâches sans rapport** : tu as fini un bug, tu passes à une autre fonctionnalité ? `/clear`.

**`/sobre-passation`** (ajouté par Sobre)
Fait écrire à Claude un résumé de 40 lignes maximum dans `.claude/passation.md` : objectif, ce qui est fait, prochaine étape, décisions prises, pièges rencontrés.
→ À faire **en pleine tâche longue**, quand la conversation devient lourde :
1. `/sobre-passation`
2. vérifie le fichier `.claude/passation.md` (ajoute ce qui manque)
3. `/clear`
4. écris « reprends depuis la passation »

Claude repart avec 40 lignes au lieu de tout l'historique. Le fichier reste sur ton disque : tu peux reprendre le lendemain, ou dans Codex.
Pas la peine après trois messages : écrire le résumé coûte un peu de tokens.

**Cerveau automatique** (activé par défaut, `--sans cerveau-auto` pour le couper)
Claude gère le cerveau tout seul, avec des garde-fous pour ne pas manger les économies :
- **Création** : une seule fois par projet, seulement pour un vrai projet (dépôt git ou une dizaine de fichiers de code) et une vraie tâche de code, pas une simple question. L'exploration est faite par l'éclaireur (Haiku, moins cher) et tient en 40 lignes.
- **Ajouts** : en fin de tâche, seulement si une décision technique a été prise ou un bug non évident résolu. Une seule ligne, ajoutée en fin de fichier sans relire la note. Claude le signale en quatre mots (« + 1 piège noté »).
- **Jamais** pour une question, une petite retouche ou une faute de frappe.
- **Révision complète** (relire, corriger, condenser) : seulement quand tu tapes `/sobre-cerveau`, par exemple une fois par mois.
- Codex et Cursor ajoutent aussi leurs lignes quand `.cerveau/` existe. Pour eux, crée-le avec `sobre cerveau`.

**`/sobre-cerveau`** (ajouté par Sobre)
La mémoire durable du projet, là où la passation ne sert que pour une session.
- **Première fois** : Claude fait explorer le projet une seule fois par l'éclaireur, puis remplit `.cerveau/` (architecture, conventions). Ensuite, à chaque nouvelle session, il lit l'index de 30 lignes et n'ouvre que la note utile, au lieu de relire des dizaines de fichiers.
- **Ensuite** : relance-le après une décision importante ou un bug résolu. Il ajoute la décision ou le piège et corrige ce qui est devenu faux.
- **Obsidian** : « Ouvrir un dossier comme coffre » → `.cerveau/`. Les notes sont reliées entre elles (`[[liens]]`), tu peux les lire et les corriger.
- **Sécurité** : les notes sont des indices. Si une note contredit le code, Claude suit le code et corrige la note. Aucun secret n'y est écrit.
- **Codex et Cursor** : ils lisent aussi `.cerveau/` grâce aux règles Sobre. Pour le remplir, demande-leur « remplis le cerveau du projet en suivant .cerveau/INDEX.md ».

| | Passation | Cerveau |
|---|---|---|
| Durée de vie | Une tâche | Tout le projet |
| Contenu | Où j'en suis, prochaine étape | Comment le projet est fait, pourquoi, pièges |
| Quand | Avant un `/clear` en pleine tâche | Après une décision ou un bug résolu |

**La barre d'état** (installée par Sobre) — 0 token
En bas de Claude Code, en permanence : `Opus · ctx 34 % · 5h 24 % (reset 15:40) · 7j 41 % · session ≈ 0,48 $`.
- `session ≈` : ce qu'aurait coûté la session au prix de l'API (calcul fait par Claude Code lui-même, remis à zéro à chaque `/clear`).
- `5h` : part de ta limite de 5 heures déjà utilisée, et l'heure à laquelle elle se recharge.
- `ctx` : remplissage de la conversation. Au-delà de 60 à 70 %, pense à `/sobre-passation` puis `/clear`.
- Elle tourne sur ton PC, sans appel à Claude : **aucun token consommé**, même ouverte toute la journée.
- Si tu avais déjà ta propre barre d'état, Sobre la garde et t'indique comment ajouter la sienne.

**`/sobre-stats`** — environ 500 tokens par utilisation
Affiche le même tableau que `sobre stats` directement dans Claude Code. Pratique, mais Claude doit lire le tableau : ça coûte un peu. Pour 0 token, utilise la barre d'état ou `sobre stats` dans un autre terminal.

**`/compact`**
Claude résume lui-même la conversation et continue avec le résumé. Plus rapide que la passation, mais tu ne choisis pas ce qui est gardé et le résumé disparaît avec la session. Bien pour alléger sans changer de sujet.

**`/context`**
Montre ce qui remplit le contexte (règles, outils, historique…). Utile pour repérer ce qui coûte cher.

**`/mcp`**
Liste les serveurs MCP connectés. Désactive ceux que tu n'utilises pas.

**`/model`**
Change de modèle. Sonnet suffit pour la plupart des tâches ; garde Opus pour les problèmes vraiment difficiles.

**`/caveman`** (plugin Caveman)
`/caveman status` montre si le mode est actif, `/caveman off` le coupe si les réponses deviennent trop sèches.

**`/context-mode:ctx-doctor`** (plugin context-mode)
Vérifie que context-mode fonctionne.

**L'agent `sobre-eclaireur`**
Rien à taper : Claude lui confie tout seul les recherches dans le projet (règle posée par Sobre). Tu peux aussi le demander : « demande à l'éclaireur où est gérée l'authentification ».

## Fichiers touchés

| Agent | Fichiers |
|---|---|
| Claude Code | `~/.claude/skills/sobre-*` (packs), plugins officiels via `/plugin`, `~/.claude/settings.json` (barre d'état), `~/.claude/commands/sobre-stats.md`, `~/.claude/CLAUDE.md` (bloc), `~/.claude/agents/sobre-eclaireur.md`, `~/.claude/skills/sobre-passation/`, `~/.claude/skills/sobre-cerveau/` |
| Chaque projet | `.cerveau/` (seulement avec `sobre cerveau` ou `/sobre-cerveau`, jamais supprimé par la désinstallation) |
| Codex | `~/.codex/AGENTS.md` (bloc), `~/.codex/config.toml` (bloc) |
| Cursor | `~/.cursor/mcp.json` (entrée `context-mode`), `.cursor/rules/sobre.mdc` (par projet) |
| Sobre | `~/.sobre/` (état, sauvegardes) |

Plus les fichiers que RTK, les plugins et CodeGraph écrivent eux-mêmes via leurs installateurs officiels.

## Limites connues

- Testé en bac à sable sous Linux, pas encore sur une vraie machine Windows. Signale tout souci dans les *Issues*.
- La page de RTK ne précise pas si son hook fonctionne sous Windows natif. Si `rtk gain` reste à 0 après une session, utilise WSL.
- Sur Codex et Cursor, context-mode est branché en MCP seul (sans les hooks de routage automatique) : plus simple et plus stable, mais l'agent s'en sert un peu moins spontanément. Les règles Sobre le lui rappellent.
- `sobre mesure` ne lit que les journaux Claude Code. Claude Code supprime par défaut les journaux de plus de 30 jours.
- Ponytail : un test indépendant (JetBrains, 80 tâches) a mesuré −15 % de code et −10 % de coût, contre −54 % / −20 % annoncés. Exclus-le avec `--sans ponytail` si le code produit te paraît trop minimal.
- Les gains annoncés par les auteurs des outils n'ont pas été vérifiés de façon indépendante. Fie-toi à `sobre mesure`.

## Licence

MIT. Les outils installés gardent leurs propres licences.
