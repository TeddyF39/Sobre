#!/usr/bin/env node
// Sobre - moins de tokens, meme qualite.
// Un installateur qui branche les meilleurs outils d'economie de tokens
// sur Claude Code, Codex et Cursor, avec des reglages pensés pour ne pas
// degrader la qualite. Licence MIT. https://github.com/TeddyF39/sobre

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const VERSION = '0.6.1';
const DEPOT = 'TeddyF39/sobre';
const HOME = process.env.SOBRE_HOME || os.homedir();
const WIN = process.platform === 'win32';
const DOSSIER = path.join(HOME, '.sobre');
const FICHIER_ETAT = path.join(DOSSIER, 'etat.json');
const MD_DEBUT = '<!-- sobre:debut -->';
const MD_FIN = '<!-- sobre:fin -->';
const TOML_DEBUT = '# sobre:debut';
const TOML_FIN = '# sobre:fin';

let SIMULATION = false;

// ---------------------------------------------------------------- affichage
const c = (n) => (s) => (process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${n}m${s}\x1b[0m` : s);
const gras = c(1), vert = c(32), jaune = c(33), rouge = c(31), cyan = c(36), gris = c(90);
const log = (...a) => console.log(...a);
const titre = (t) => log('\n' + cyan(gras('==> ' + t)));
const bilan = [];
const ok = (m) => { log('   ' + vert('OK  ') + m); bilan.push(['ok', m]); };
const aFaire = (m) => { log('   ' + jaune('!!  ') + m); bilan.push(['afaire', m]); };
const info = (m) => log('   ' + gris(m));

// ---------------------------------------------------------------- catalogue
const OUTILS = {
  rtk:          { nom: 'RTK',          role: 'compresse les sorties de commandes (git, tests, ls...)' },
  'context-mode': { nom: 'context-mode', role: 'traite gros fichiers et logs hors du contexte' },
  regles:       { nom: 'Regles Sobre', role: 'consignes courtes pour lire et repondre plus sobrement' },
  eclaireur:    { nom: 'Agent eclaireur', role: 'recherches dans le projet deleguees a Haiku (Claude Code)' },
  passation:    { nom: 'Skill passation', role: '/sobre-passation pour /clear sans perdre le fil (Claude Code)' },
  cerveau:      { nom: 'Cerveau du projet', role: 'memoire durable .cerveau/ (Obsidian) pour ne pas re-explorer le code' },
  stats:        { nom: 'Stats', role: 'barre d\'etat (limite 5h, contexte) + /sobre-stats, sans consommer de tokens' },
  'cerveau-auto': { nom: 'Cerveau automatique', role: 'cree le cerveau une fois par projet et note decisions / pieges en une ligne' },
  caveman:      { nom: 'Caveman',      role: 'reponses plus courtes, code intact (Claude Code)' },
  codegraph:    { nom: 'CodeGraph',    role: 'graphe du code interroge au lieu de lire des fichiers' },
  ponytail:     { nom: 'Ponytail',     role: 'pousse a ecrire le code le plus simple qui marche (Claude Code, Codex)' },
};

const PROFILS = {
  qualite:   { desc: 'Zero compromis : on coupe le bruit, pas les reponses.',
               outils: ['regles', 'stats', 'rtk', 'context-mode', 'eclaireur', 'passation', 'cerveau', 'cerveau-auto'], concis: false },
  equilibre: { desc: 'Recommande : + reponses plus courtes (Caveman) et code plus simple (Ponytail).',
               outils: ['regles', 'stats', 'rtk', 'context-mode', 'eclaireur', 'passation', 'cerveau', 'cerveau-auto', 'caveman', 'ponytail'], concis: true },
  max:       { desc: '+ CodeGraph : pour les gros projets.',
               outils: ['regles', 'stats', 'rtk', 'context-mode', 'eclaireur', 'passation', 'cerveau', 'cerveau-auto', 'caveman', 'ponytail', 'codegraph'], concis: true },
};

const AGENTS = {
  claude: { nom: 'Claude Code', detecter: () => existe('claude') || fs.existsSync(p('.claude')) },
  codex:  { nom: 'Codex',       detecter: () => existe('codex') || fs.existsSync(p('.codex')) },
  cursor: { nom: 'Cursor',      detecter: () => existe('cursor') || fs.existsSync(p('.cursor')) },
};

// Ce que chaque outil sait faire pour chaque agent
const PRISE_EN_CHARGE = {
  claude: ['regles', 'stats', 'rtk', 'context-mode', 'eclaireur', 'passation', 'cerveau', 'cerveau-auto', 'caveman', 'ponytail', 'codegraph'],
  codex:  ['regles', 'rtk', 'context-mode', 'cerveau', 'cerveau-auto', 'ponytail', 'codegraph'],
  cursor: ['regles', 'rtk', 'context-mode', 'cerveau', 'cerveau-auto', 'codegraph'],
};

// ---------------------------------------------------------------- utilitaires
function p(...parts) { return path.join(HOME, ...parts); }
function lire(f) { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }
function mkdirp(d) { fs.mkdirSync(d, { recursive: true }); }
function horodatage() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }
function echapper(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

function existe(cmd) {
  const r = spawnSync(WIN ? 'where' : 'which', [cmd], { stdio: 'ignore' });
  return r.status === 0;
}

function lancer(cmd, args, { silencieux = false } = {}) {
  if (SIMULATION) { info(`[simulation] ${cmd} ${args.join(' ')}`); return true; }
  const r = spawnSync(cmd, args, { stdio: silencieux ? 'ignore' : 'inherit', shell: WIN });
  return r.status === 0;
}

function capturer(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: WIN });
  return r.status === 0 ? (r.stdout || '').trim() : null;
}

function rafraichirPath() {
  if (!WIN) return;
  const out = capturer('powershell', ['-NoProfile', '-Command',
    "[Environment]::GetEnvironmentVariable('Path','Machine')+';'+[Environment]::GetEnvironmentVariable('Path','User')"]);
  if (out) process.env.Path = out;
}

// ---------------------------------------------------------------- etat
function lireEtat() {
  try { return JSON.parse(fs.readFileSync(FICHIER_ETAT, 'utf8')); }
  catch { return { version: VERSION, installe_le: null, profil: null, agents: [], ajouts: [], sauvegardes: [] }; }
}
function ecrireEtat(e) {
  if (SIMULATION) return;
  mkdirp(DOSSIER);
  fs.writeFileSync(FICHIER_ETAT, JSON.stringify(e, null, 2));
}

// ---------------------------------------------------------------- ecritures sauvegardees
let sauvegarde = null; // { dir, modifies: [], crees: [] }

function preparerSauvegarde() {
  if (sauvegarde) return sauvegarde;
  const dir = path.join(DOSSIER, 'sauvegardes', horodatage());
  sauvegarde = { dir, modifies: [], crees: [] };
  return sauvegarde;
}

function ecrire(fichier, contenu) {
  if (SIMULATION) { info(`[simulation] ecrirait ${fichier}`); return; }
  const s = preparerSauvegarde();
  const rel = path.relative(HOME, fichier);
  if (fs.existsSync(fichier)) {
    if (!s.modifies.includes(rel) && !s.crees.includes(rel)) {
      const dest = path.join(s.dir, 'fichiers', rel);
      mkdirp(path.dirname(dest));
      fs.copyFileSync(fichier, dest);
      s.modifies.push(rel);
    }
  } else if (!s.crees.includes(rel)) {
    s.crees.push(rel);
  }
  mkdirp(path.dirname(fichier));
  fs.writeFileSync(fichier, contenu);
}

function supprimer(fichier) {
  if (!fs.existsSync(fichier)) return false;
  if (SIMULATION) { info(`[simulation] supprimerait ${fichier}`); return true; }
  const s = preparerSauvegarde();
  const rel = path.relative(HOME, fichier);
  const dest = path.join(s.dir, 'fichiers', rel);
  mkdirp(path.dirname(dest));
  fs.copyFileSync(fichier, dest);
  if (!s.modifies.includes(rel)) s.modifies.push(rel);
  fs.rmSync(fichier);
  return true;
}

function finaliserSauvegarde(etat) {
  if (!sauvegarde || SIMULATION) return;
  if (!sauvegarde.modifies.length && !sauvegarde.crees.length) return;
  mkdirp(sauvegarde.dir);
  fs.writeFileSync(path.join(sauvegarde.dir, 'manifeste.json'),
    JSON.stringify({ modifies: sauvegarde.modifies, crees: sauvegarde.crees }, null, 2));
  etat.sauvegardes = [...(etat.sauvegardes || []), sauvegarde.dir];
}

// Insere ou remplace un bloc delimite, sans toucher au reste du fichier.
function poserBloc(fichier, contenu, debut = MD_DEBUT, fin = MD_FIN) {
  const actuel = lire(fichier);
  const bloc = `${debut}\n${contenu.trim()}\n${fin}`;
  const re = new RegExp(echapper(debut) + '[\\s\\S]*?' + echapper(fin));
  let suivant;
  if (re.test(actuel)) suivant = actuel.replace(re, bloc);
  else suivant = actuel ? actuel.replace(/\s*$/, '\n\n') + bloc + '\n' : bloc + '\n';
  if (suivant === actuel) return 'inchange';
  ecrire(fichier, suivant);
  return 'ecrit';
}

function retirerBloc(fichier, debut = MD_DEBUT, fin = MD_FIN) {
  const actuel = lire(fichier);
  const re = new RegExp('\\n*' + echapper(debut) + '[\\s\\S]*?' + echapper(fin) + '\\n*');
  if (!re.test(actuel)) return false;
  const suivant = actuel.replace(re, '\n').replace(/^\n+/, '');
  if (suivant.trim() === '') supprimer(fichier); else ecrire(fichier, suivant);
  return true;
}

// ---------------------------------------------------------------- contenus maison
function texteRegles(agent, profil, outils = PROFILS[profil].outils) {
  const l = [
    '## Sobre : economiser les tokens sans perdre en qualite',
    '',
    '- La justesse passe avant l\'economie : si une lecture ou une verification est necessaire, fais-la.',
    '- Quand tu sais ou chercher, lis une plage de lignes plutot que le fichier entier.',
    '- Tests et builds : ne montre que les echecs et le resume, pas toute la sortie.',
    '- Apres une modification, resume le changement au lieu de reafficher le fichier.',
  ];
  if (outils.includes('context-mode'))
    l.push('- Gros fichiers, logs ou donnees : utilise les outils context-mode (ctx_*) s\'ils sont disponibles plutot que de tout charger.');
  if (agent === 'claude' && outils.includes('eclaireur'))
    l.push('- Recherche sur plusieurs fichiers : delegue a l\'agent `sobre-eclaireur` et travaille a partir de sa synthese.');
  if (agent === 'claude' && outils.includes('passation'))
    l.push('- Si `.claude/passation.md` existe et que l\'utilisateur dit « reprends », lis-le d\'abord au lieu de re-explorer le projet.');
  if (outils.includes('cerveau'))
    l.push('- Memoire du projet : si `.cerveau/INDEX.md` existe, lis-le avant d\'explorer le code et n\'ouvre que les notes utiles. Les notes sont des indices : si une note contredit le code, le code a raison et la note doit etre corrigee.');
  const auto = outils.includes('cerveau') && outils.includes('cerveau-auto');
  if (agent === 'claude' && auto)
    l.push('- Cerveau automatique : utilise le skill `sobre-cerveau` (1) au debut d\'une vraie tache de code dans un projet sans `.cerveau/INDEX.md`, une seule fois, (2) en fin de tache si une decision technique a ete prise ou un bug non evident resolu. Jamais pour une question, une petite retouche ou une tache sans enseignement durable.');
  else if (agent === 'claude' && outils.includes('cerveau'))
    l.push('- Apres une decision importante ou un piege resolu, propose en une ligne de lancer `/sobre-cerveau`.');
  if (agent !== 'claude' && auto)
    l.push('- Si `.cerveau/` existe : en fin de tache, seulement apres une decision technique ou un bug non evident resolu, ajoute UNE ligne en fin de `.cerveau/decisions.md` (`- AAAA-MM-JJ - decision - raison`) ou `.cerveau/pieges.md` (`- symptome - cause - solution`) sans relire tout le fichier.');
  if (PROFILS[profil].concis)
    l.push('- Reponses directes : pas de reformulation de la demande ni de recapitulatif des etapes. Le code, les commandes, les chemins et les messages d\'erreur restent complets.');
  return l.join('\n');
}

const AGENT_ECLAIREUR = `---
name: sobre-eclaireur
description: Explorateur rapide et economique. A utiliser pour chercher dans le code, trouver ou se trouve quelque chose, lire plusieurs fichiers ou resumer une partie du projet, avant de modifier quoi que ce soit. Renvoie une synthese courte avec chemins et numeros de ligne.
tools: Read, Grep, Glob, Bash
model: haiku
---

Tu es un eclaireur. Ton travail : trouver l'information demandee dans le projet et la rapporter de facon compacte. Tu ne modifies aucun fichier.

Methode :
1. Commence large (Glob, Grep), puis lis seulement les passages utiles (plages de lignes), pas les fichiers entiers.
2. Arrete-toi des que tu as la reponse.

Format de reponse (court, sans introduction) :
- Reponse directe en 1 a 3 phrases.
- Emplacements utiles : \`chemin/fichier.ext:ligne\` + une demi-ligne sur ce qu'on y trouve.
- Extraits de code strictement necessaires (quelques lignes maximum chacun).
- Ce que tu n'as pas trouve ou dont tu n'es pas sur, dit clairement.

Ne recopie jamais un fichier entier. Ne presente pas une supposition comme un fait.
`;

const SKILL_PASSATION = `---
name: sobre-passation
description: Ecrit une note de passation compacte de la session dans .claude/passation.md pour pouvoir faire /clear et reprendre sans perdre le fil.
disable-model-invocation: true
---

# Passation de session

But : resumer la session dans un fichier court, pour que l'utilisateur puisse faire \`/clear\` (contexte vide = tokens economises) puis reprendre exactement ou il en etait.

Ecris (ou remplace) \`.claude/passation.md\` a la racine du projet, 40 lignes maximum :

\`\`\`markdown
# Passation - <date et heure>

## Objectif
<ce que l'utilisateur cherche a obtenir, 1-2 phrases>

## Fait
- <changement> (\`chemin:ligne\` si utile)

## Prochaine etape
- <la prochaine action concrete>

## Decisions prises
- <choix valides par l'utilisateur, et pourquoi en quelques mots>

## A savoir
- <erreurs rencontrees, commandes qui marchent, fichiers sensibles>
\`\`\`

Regles : uniquement des faits de cette session ; des chemins plutot que du code recopie.
Termine par une phrase : « Passation ecrite. Fais /clear puis dis : reprends depuis la passation. »
`;

const SKILL_CERVEAU = `---
name: sobre-cerveau
description: Cree ou met a jour le cerveau du projet (.cerveau/, notes Markdown compatibles Obsidian) pour que les prochaines sessions n'aient pas a re-explorer le code.
disable-model-invocation: true
---

# Cerveau du projet

Le dossier \`.cerveau/\` a la racine du projet est sa memoire durable. Il evite de re-explorer le code a chaque session. Il s'ouvre dans Obsidian (« Ouvrir un dossier comme coffre »).

## Si \`.cerveau/INDEX.md\` n'existe pas ou ne liste aucune note remplie : creation
1. Demande a l'agent \`sobre-eclaireur\` (s'il n'existe pas, explore toi-meme en lisant le minimum) une synthese : but du projet, dossiers cles, points d'entree, flux principal, commandes de build et de test, dependances importantes.
2. Remplis \`architecture.md\` et \`conventions.md\` a partir de cette synthese. \`decisions.md\` et \`pieges.md\` gardent seulement leur titre s'il n'y a rien a y mettre.
3. Mets a jour \`INDEX.md\`.

## Sinon : mise a jour a partir de la session en cours
- Decisions prises et pourquoi -> \`decisions.md\` (date + decision + raison en une ligne).
- Erreurs rencontrees et leur solution -> \`pieges.md\`.
- Changements de structure (dossiers, modules, commandes) -> \`architecture.md\` ou \`conventions.md\`.
- Un sujet qui depasse 15 lignes merite sa propre note (ex. \`auth.md\`) : cree-la et ajoute-la a l'index.
- Corrige ou supprime toute information devenue fausse : une note perimee coute plus cher qu'une note absente.

## Format
- Frontmatter YAML : \`type\`, \`maj\` (date du jour), \`tags\`.
- Liens Obsidian entre notes : \`[[nom-de-note]]\`.
- \`INDEX.md\` : 30 lignes maximum, une ligne par note : \`- [[note]] : ce qu'on y trouve\`.
- Chaque note : 80 lignes maximum. Des chemins \`fichier:ligne\` plutot que du code recopie. Des faits verifies, pas de suppositions.
- Jamais de secrets (cles d'API, mots de passe, jetons).

Termine par une seule phrase qui liste les notes modifiees.
`;

const SKILL_CERVEAU_AUTO = `---
name: sobre-cerveau
description: Memoire du projet dans .cerveau/ (notes compatibles Obsidian). A utiliser (1) au debut d'une vraie tache de code dans un projet sans .cerveau/INDEX.md, (2) en fin de tache si une decision technique a ete prise ou un bug non evident resolu, (3) sur /sobre-cerveau pour une revision complete.
---

# Cerveau du projet (automatique et econome)

But : economiser des tokens. Chaque action ici doit couter beaucoup moins que ce qu'elle fera gagner aux sessions suivantes. Dans le doute, ne fais rien.

## Mode 1 - Creation (automatique, une seule fois par projet)
Conditions, toutes necessaires :
- \`.cerveau/INDEX.md\` n'existe pas ;
- c'est un vrai projet : depot git, ou au moins une dizaine de fichiers de code ;
- l'utilisateur demande une vraie tache de code (pas une simple question).

Etapes :
1. Delegue a l'agent \`sobre-eclaireur\` (s'il n'existe pas, explore toi-meme en lisant le minimum) une synthese de 40 lignes maximum : but du projet, dossiers cles (chemin + role), points d'entree, flux principal, commandes de build / test / lancement, dependances importantes.
2. A partir de cette synthese seulement, ecris \`.cerveau/INDEX.md\`, \`architecture.md\`, \`conventions.md\`, plus \`decisions.md\` et \`pieges.md\` avec leur titre seul.
3. Dis en une ligne : « Cerveau du projet cree dans .cerveau/. »
4. Reprends la tache demandee en t'appuyant sur cette synthese, sans re-explorer ce qu'elle couvre.

## Mode 2 - Ajout rapide (automatique, fin de tache)
Conditions : une decision technique a ete prise OU un bug dont la cause n'etait pas evidente a ete resolu. Rien pour : question, petite retouche, faute de frappe, tache sans enseignement durable.
- Ajoute UNE seule ligne en fin de \`.cerveau/decisions.md\` (\`- AAAA-MM-JJ - decision - raison\`) ou de \`.cerveau/pieges.md\` (\`- symptome - cause - solution\`), avec une commande d'ajout en fin de fichier, sans relire la note. Exemple : \`printf '%s\\n' "- 2026-11-22 - SQLite plutot que JSON - acces concurrents" >> .cerveau/decisions.md\`
- Seulement si la structure a change (nouveau dossier, module, commande de build ou de test) : corrige la ligne concernee de \`architecture.md\` ou \`conventions.md\`.
- Un seul ajout par tache. Signale-le en fin de reponse en quatre mots maximum (ex. « + 1 piege note »).

## Mode 3 - Revision complete (uniquement sur /sobre-cerveau)
- Relis les notes, corrige ce qui est faux, supprime le perime, fusionne les doublons, mets a jour \`maj\`.
- Une note de plus de 80 lignes est condensee. Un sujet de plus de 15 lignes merite sa propre note, ajoutee a l'index.
- Termine par une phrase qui liste les notes modifiees.

## Format (tous les modes)
- Frontmatter YAML : \`type\`, \`maj\`, \`tags\`. Liens Obsidian : \`[[nom-de-note]]\`.
- \`INDEX.md\` : 30 lignes maximum, une ligne par note : \`- [[note]] : ce qu'on y trouve\`.
- Notes : 80 lignes maximum, des chemins \`fichier:ligne\` plutot que du code recopie, des faits verifies.
- Jamais de secrets (cles d'API, mots de passe, jetons).
- Les notes sont des indices : si une note contredit le code, le code a raison et la note est corrigee.
`;

function squeletteCerveau(nom) {
  const date = new Date().toISOString().slice(0, 10);
  const note = (type, titre, aide) => `---\ntype: ${type}\nmaj: ${date}\ntags: [cerveau]\n---\n\n# ${titre}\n\n<!-- ${aide} -->\n`;
  return {
    'INDEX.md': `---\ntype: index\nmaj: ${date}\ntags: [cerveau]\n---\n\n# Cerveau du projet ${nom}\n\n> Lu en premier par l'agent. Une ligne par note, 30 lignes maximum.\n\n- [[architecture]] : vue d'ensemble, dossiers cles, flux principal\n- [[conventions]] : style, commandes de build et de test, outils\n- [[decisions]] : choix techniques et leur raison\n- [[pieges]] : erreurs deja rencontrees et leur solution\n`,
    'architecture.md': note('architecture', 'Architecture', 'But du projet, dossiers cles (chemin + role), points d\'entree, flux principal.'),
    'conventions.md': note('conventions', 'Conventions', 'Langage, style, commandes de build / test / lancement, outils.'),
    'decisions.md': note('decisions', 'Decisions', 'Une ligne par decision : AAAA-MM-JJ - decision - raison.'),
    'pieges.md': note('pieges', 'Pieges', 'Une ligne par piege : symptome - cause - solution.'),
  };
}

function regleCursor(profil, outils) {
  return `---\ndescription: Regles Sobre (economie de tokens)\nalwaysApply: true\n---\n\n${texteRegles('cursor', profil, outils)}\n`;
}

// ---------------------------------------------------------------- installation par outil
function assurerRtk() {
  if (existe('rtk')) return verifierVraiRtk();
  info('Installation de RTK...');
  let fait = false;
  if (WIN && existe('winget')) {
    fait = lancer('winget', ['install', '--id', 'rtk-ai.rtk', '-e', '--accept-source-agreements', '--accept-package-agreements']);
    rafraichirPath();
  } else if (!WIN && existe('brew')) {
    fait = lancer('brew', ['install', 'rtk']);
  } else if (!WIN) {
    fait = lancer('sh', ['-c', 'curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh']);
  }
  if (SIMULATION) return true;
  if (!fait || !existe('rtk')) {
    aFaire('RTK non installe automatiquement : voir https://github.com/rtk-ai/rtk puis relance `sobre`.');
    return false;
  }
  return verifierVraiRtk();
}

function verifierVraiRtk() {
  if (SIMULATION) return true;
  const r = spawnSync('rtk', ['gain'], { stdio: 'ignore', shell: WIN });
  if (r.status !== 0) {
    aFaire('La commande `rtk` presente n\'est pas Rust Token Killer (homonyme). Desinstalle-la, puis relance `sobre`.');
    return false;
  }
  return true;
}

function assurerNpmGlobal(binaire, paquet) {
  if (existe(binaire)) return true;
  if (!existe('npm')) { aFaire(`npm absent : installe Node.js 22+ puis relance (${paquet}).`); return false; }
  info(`Installation de ${paquet}...`);
  const fait = lancer('npm', ['install', '-g', paquet]);
  rafraichirPath();
  if (!fait && !SIMULATION) {
    aFaire(`Echec de \`npm install -g ${paquet}\` (droits ?). Lance-le a la main puis relance \`sobre\`.`);
    return false;
  }
  return true;
}

function pluginClaude(depot, id, nom) {
  lancer('claude', ['plugin', 'marketplace', 'add', depot], { silencieux: true });
  if (lancer('claude', ['plugin', 'install', id])) { ok(`${nom} installe (plugin Claude Code)`); return true; }
  aFaire(`${nom} : dans Claude Code, tape /plugin marketplace add ${depot} puis /plugin install ${id}`);
  return false;
}

function commandeMcp() {
  return WIN ? { command: 'cmd', args: ['/c', 'context-mode'] } : { command: 'context-mode' };
}

function mcpCursor(etat) {
  const f = p('.cursor', 'mcp.json');
  let j = {};
  const brut = lire(f);
  if (brut.trim()) {
    try { j = JSON.parse(brut); }
    catch { aFaire(`${f} n'est pas un JSON valide : je n'y touche pas. Ajoute context-mode a la main.`); return; }
  }
  j.mcpServers = j.mcpServers || {};
  if (j.mcpServers['context-mode']) { ok('Cursor : context-mode deja present dans mcp.json'); return; }
  j.mcpServers['context-mode'] = commandeMcp();
  ecrire(f, JSON.stringify(j, null, 2) + '\n');
  noterAjout(etat, 'cursor-mcp-context-mode');
  ok('Cursor : context-mode ajoute a ~/.cursor/mcp.json');
}

function mcpCodex(etat) {
  const f = p('.codex', 'config.toml');
  const actuel = lire(f);
  const horsBloc = actuel.replace(new RegExp(echapper(TOML_DEBUT) + '[\\s\\S]*?' + echapper(TOML_FIN)), '');
  if (/\[mcp_servers\.["']?context-mode["']?\]/.test(horsBloc)) { ok('Codex : context-mode deja configure'); return; }
  const m = commandeMcp();
  const lignes = [
    '[mcp_servers.context-mode]',
    `command = ${JSON.stringify(m.command)}`,
  ];
  if (m.args) lignes.push(`args = [${m.args.map((a) => JSON.stringify(a)).join(', ')}]`);
  lignes.push('', '[mcp_servers.context-mode.env]', 'CONTEXT_MODE_PLATFORM = "codex"');
  poserBloc(f, lignes.join('\n'), TOML_DEBUT, TOML_FIN);
  noterAjout(etat, 'codex-mcp-context-mode');
  ok('Codex : context-mode ajoute a ~/.codex/config.toml');
}

function noterAjout(etat, id) { if (!etat.ajouts.includes(id)) etat.ajouts.push(id); }

function installerPour(agent, profil, outils, etat) {
  const A = AGENTS[agent].nom;
  titre(`${A}`);
  const pris = outils.filter((o) => PRISE_EN_CHARGE[agent].includes(o));

  if (pris.includes('regles')) {
    const cible = { claude: p('.claude', 'CLAUDE.md'), codex: p('.codex', 'AGENTS.md') }[agent];
    if (cible) {
      const r = poserBloc(cible, texteRegles(agent, profil, outils));
      ok(`Regles Sobre ${r === 'inchange' ? 'deja a jour' : 'posees'} dans ${path.relative(HOME, cible)}`);
    } else {
      info('Cursor n\'a pas de fichier de regles global : lance `sobre projet` dans chaque projet.');
    }
  }

  if (pris.includes('rtk') && etat._rtk) {
    const args = { claude: ['init', '-g'], codex: ['init', '-g', '--codex'], cursor: ['init', '-g', '--agent', 'cursor'] }[agent];
    if (lancer('rtk', args)) ok(`RTK branche (rtk ${args.join(' ')})`);
    else aFaire(`RTK : lance \`rtk ${args.join(' ')}\` a la main.`);
  }

  if (pris.includes('context-mode')) {
    if (agent === 'claude') pluginClaude('mksglu/context-mode', 'context-mode@context-mode', 'context-mode');
    else if (etat._ctx) (agent === 'codex' ? mcpCodex : mcpCursor)(etat);
  }

  if (pris.includes('caveman')) pluginClaude('JuliusBrussee/caveman', 'caveman@caveman', 'Caveman');

  if (pris.includes('ponytail')) {
    if (agent === 'claude') pluginClaude('DietrichGebert/ponytail', 'ponytail@ponytail', 'Ponytail');
    if (agent === 'codex') {
      lancer('codex', ['plugin', 'marketplace', 'add', 'DietrichGebert/ponytail'], { silencieux: true });
      if (lancer('codex', ['plugin', 'add', 'ponytail@ponytail'])) ok('Ponytail installe (plugin Codex)');
      else aFaire('Ponytail : lance `codex plugin marketplace add DietrichGebert/ponytail` puis `codex plugin add ponytail@ponytail`');
    }
  }

  if (pris.includes('eclaireur')) {
    ecrire(p('.claude', 'agents', 'sobre-eclaireur.md'), AGENT_ECLAIREUR);
    ok('Agent sobre-eclaireur (Haiku) installe');
  }
  if (pris.includes('stats') && agent === 'claude') {
    poserBarre(etat);
    ecrire(p('.claude', 'commands', 'sobre-stats.md'), commandeStats());
    ok('Commande /sobre-stats installee');
  }
  if (pris.includes('passation')) {
    ecrire(p('.claude', 'skills', 'sobre-passation', 'SKILL.md'), SKILL_PASSATION);
    ok('Skill /sobre-passation installe');
  }
  if (pris.includes('cerveau') && agent === 'claude') {
    const auto = pris.includes('cerveau-auto');
    ecrire(p('.claude', 'skills', 'sobre-cerveau', 'SKILL.md'), auto ? SKILL_CERVEAU_AUTO : SKILL_CERVEAU);
    ok(`Skill /sobre-cerveau installe (${auto ? 'automatique' : 'manuel'})`);
  }
}

// ---------------------------------------------------------------- commandes
async function demander(question) {
  if (!process.stdin.isTTY) return '';
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const r = await rl.question(question);
  rl.close();
  return r.trim();
}

async function cmdInstaller(opts) {
  log(gras(`\nSobre ${VERSION}`) + gris(' - moins de tokens, meme qualite'));
  const etat = lireEtat();

  // agents
  let agents = opts.agents;
  if (!agents) {
    agents = Object.keys(AGENTS).filter((a) => AGENTS[a].detecter());
    if (!agents.length) { log(rouge('\nAucun agent detecte (Claude Code, Codex, Cursor). Utilise --agents claude,codex,cursor.')); process.exitCode = 1; return; }
  }
  const inconnus = agents.filter((a) => !AGENTS[a]);
  if (inconnus.length) { log(rouge(`Agent inconnu : ${inconnus.join(', ')}`)); process.exitCode = 1; return; }

  // profil
  let profil = opts.profil;
  if (!profil && !opts.oui) {
    log('\nProfils :');
    Object.entries(PROFILS).forEach(([k, v], i) => log(`  ${i + 1}. ${gras(k.padEnd(10))} ${v.desc}`));
    const r = await demander('Choix [2] : ');
    profil = Object.keys(PROFILS)[(parseInt(r, 10) || 2) - 1];
  }
  profil = profil || 'equilibre';
  if (!PROFILS[profil]) { log(rouge(`Profil inconnu : ${profil} (qualite, equilibre, max)`)); process.exitCode = 1; return; }

  let outils = PROFILS[profil].outils.filter((o) => !(opts.sans || []).includes(o));
  if (opts.outils) outils = opts.outils;
  const inconnusO = [...outils, ...(opts.sans || [])].filter((o) => !OUTILS[o]);
  if (inconnusO.length) { log(rouge(`Outil inconnu : ${inconnusO.join(', ')}`)); process.exitCode = 1; return; }

  log(`\nAgents : ${gras(agents.map((a) => AGENTS[a].nom).join(', '))}`);
  log(`Profil : ${gras(profil)}`);
  log('Outils : ' + outils.map((o) => OUTILS[o].nom).join(', '));
  if (SIMULATION) log(jaune('Mode simulation : rien ne sera modifie.'));
  if (!opts.oui && !SIMULATION) {
    const r = await demander('\nContinuer ? [O/n] ');
    if (/^n/i.test(r)) { log('Annule.'); return; }
  }

  titre('Prerequis');
  if (!existe('node')) aFaire('Node.js introuvable dans le PATH.');
  else ok(`Node.js ${process.versions.node}`);

  if (outils.includes('rtk')) etat._rtk = assurerRtk();
  if (outils.includes('context-mode') && agents.some((a) => a !== 'claude'))
    etat._ctx = assurerNpmGlobal('context-mode', 'context-mode');

  for (const a of agents) installerPour(a, profil, outils, etat);

  if (outils.includes('codegraph')) {
    titre('CodeGraph');
    if (assurerNpmGlobal('codegraph', '@colbymchenry/codegraph')) {
      const cibles = agents.join(',');
      if (lancer('codegraph', ['install', `--target=${cibles}`, '--yes'])) ok(`CodeGraph branche sur ${cibles}`);
      else aFaire(`CodeGraph : lance \`codegraph install --target=${cibles} --yes\` a la main.`);
      info('Dans chaque projet : `codegraph init -i` pour construire l\'index.');
    }
  }

  delete etat._rtk; delete etat._ctx;
  finaliserSauvegarde(etat);
  if (!etat.installe_le) etat.installe_le = new Date().toISOString();
  etat.version = VERSION;
  etat.profil = profil;
  etat.outils = outils;
  etat.agents = [...new Set([...(etat.agents || []), ...agents])];
  ecrireEtat(etat);

  titre('Bilan');
  const restants = bilan.filter((b) => b[0] === 'afaire');
  log(`   ${vert(bilan.length - restants.length + ' etapes reussies')}, ${restants.length ? jaune(restants.length + ' a faire a la main') : '0 a faire a la main'}`);
  restants.forEach((b) => log('   - ' + b[1]));
  log(`
Ensuite :
  1. Redemarre ${agents.map((a) => AGENTS[a].nom).join(' / ')}.
  2. ${gras('sobre etat')}     verifie que tout est branche
  3. ${gras('sobre mesure')}   compare ta consommation avant / apres (Claude Code)
${agents.includes('cursor') ? `  4. Dans chaque projet Cursor : ${gras('sobre projet')}\n` : ''}${sauvegarde && !SIMULATION ? gris(`\nSauvegarde : ${sauvegarde.dir}  (annuler : sobre restaurer)`) : ''}`);
}

function pluginPresent(nom) {
  const racine = p('.claude', 'plugins');
  const pile = [[racine, 0]];
  while (pile.length) {
    const [d, prof] = pile.pop();
    let entrees = [];
    try { entrees = fs.readdirSync(d, { withFileTypes: true }); } catch { continue; }
    for (const e of entrees) {
      if (e.name.toLowerCase().includes(nom)) return true;
      if (e.isDirectory() && prof < 3) pile.push([path.join(d, e.name), prof + 1]);
    }
  }
  return false;
}

function cmdEtat() {
  const etat = lireEtat();
  log(gras(`\nSobre ${VERSION}`) + (etat.profil ? `  profil ${gras(etat.profil)}` : gris('  (pas encore installe)')));
  if (etat.installe_le) log(gris(`installe le ${new Date(etat.installe_le).toLocaleString('fr-FR')}`));
  const ligne = (bon, txt) => log(`   ${bon === true ? vert('OK ') : bon === null ? gris(' ? ') : rouge(' X ')} ${txt}`);

  titre('Outils');
  const rtkOk = existe('rtk') && spawnSync('rtk', ['gain'], { stdio: 'ignore', shell: WIN }).status === 0;
  ligne(rtkOk, 'RTK (rtk gain)');
  ligne(existe('context-mode') ? true : null, 'context-mode en global (necessaire pour Codex / Cursor)');
  ligne(existe('codegraph') ? true : null, 'CodeGraph (profil max)');

  for (const a of Object.keys(AGENTS)) {
    if (!AGENTS[a].detecter()) continue;
    titre(AGENTS[a].nom);
    if (a === 'claude') {
      ligne(lire(p('.claude', 'CLAUDE.md')).includes(MD_DEBUT), 'Regles Sobre dans ~/.claude/CLAUDE.md');
      ligne(fs.existsSync(p('.claude', 'agents', 'sobre-eclaireur.md')), 'Agent sobre-eclaireur');
      ligne((() => { try { return estBarreSobre(JSON.parse(lire(p('.claude', 'settings.json'))).statusLine?.command); } catch { return false; } })(), 'Barre d\'etat Sobre (0 token)');
      ligne(fs.existsSync(p('.claude', 'commands', 'sobre-stats.md')), 'Commande /sobre-stats');
      ligne(fs.existsSync(p('.claude', 'skills', 'sobre-passation', 'SKILL.md')), 'Skill /sobre-passation');
      ligne(fs.existsSync(p('.claude', 'skills', 'sobre-cerveau', 'SKILL.md')), 'Skill /sobre-cerveau');
      ligne(pluginPresent('context-mode') || null, 'Plugin context-mode (verifie avec /context-mode:ctx-doctor)');
      ligne(pluginPresent('caveman') || null, 'Plugin Caveman (verifie avec /caveman status)');
      ligne(pluginPresent('ponytail') || null, 'Plugin Ponytail');
    }
    if (a === 'codex') {
      ligne(lire(p('.codex', 'AGENTS.md')).includes(MD_DEBUT), 'Regles Sobre dans ~/.codex/AGENTS.md');
      ligne(/\[mcp_servers\.["']?context-mode/.test(lire(p('.codex', 'config.toml'))), 'context-mode dans ~/.codex/config.toml');
    }
    if (a === 'cursor') {
      let j = {}; try { j = JSON.parse(lire(p('.cursor', 'mcp.json')) || '{}'); } catch { /* ignore */ }
      ligne(Boolean(j.mcpServers && j.mcpServers['context-mode']), 'context-mode dans ~/.cursor/mcp.json');
      ligne(fs.existsSync(path.join(process.cwd(), '.cursor', 'rules', 'sobre.mdc')) || null, 'Regles Sobre dans ce projet (.cursor/rules/sobre.mdc)');
    }
  }
  titre('Projet courant');
  ligne(fs.existsSync(path.join(process.cwd(), '.cerveau', 'INDEX.md')) || null, `Cerveau du projet (.cerveau/) dans ${path.basename(process.cwd())}`);
  log(gris('\nOK = verifie   ? = non verifiable ici   X = absent'));
}

function cmdProjet() {
  const etat = lireEtat();
  const profil = etat.profil || 'equilibre';
  const f = path.join(process.cwd(), '.cursor', 'rules', 'sobre.mdc');
  if (SIMULATION) { info(`[simulation] ecrirait ${f}`); return; }
  mkdirp(path.dirname(f));
  fs.writeFileSync(f, regleCursor(profil, etat.outils));
  ok(`Regles Sobre ecrites dans ${path.relative(process.cwd(), f)}`);
  if (existe('codegraph') && (etat.profil === 'max')) {
    info('Construction de l\'index CodeGraph...');
    lancer('codegraph', ['init', '-i']);
  }
}

function cmdCerveau() {
  const dir = path.join(process.cwd(), '.cerveau');
  const nom = path.basename(process.cwd());
  titre(`Cerveau du projet ${nom}`);
  const fichiers = squeletteCerveau(nom);
  let crees = 0;
  for (const [f, contenu] of Object.entries(fichiers)) {
    const cible = path.join(dir, f);
    if (fs.existsSync(cible)) continue;
    if (SIMULATION) { info(`[simulation] ecrirait ${cible}`); crees++; continue; }
    mkdirp(dir);
    fs.writeFileSync(cible, contenu);
    crees++;
  }
  if (crees) ok(`${crees} note(s) creee(s) dans .cerveau/`);
  else ok('.cerveau/ existe deja : rien n\'est ecrase');
  log(`
Ensuite :
  - Claude Code : tape ${gras('/sobre-cerveau')} pour qu'il remplisse les notes (une seule exploration du code),
    puis relance-le apres une decision importante ou un piege resolu.
  - Codex / Cursor : demande « remplis le cerveau du projet en suivant .cerveau/INDEX.md ».
  - Obsidian : Ouvrir un dossier comme coffre -> ${dir}
  - Git : versionne .cerveau/ pour le partager, ou ajoute-le a .gitignore pour le garder pour toi.`);
}

// ---------------------------------------------------------------- stats
const CACHE_BARRE = path.join(DOSSIER, 'derniere-barre.json');
const estBarreSobre = (cmd) => /sobre\.mjs"?\s+barre/.test(String(cmd || ''));
const commandeStats = () => `---
description: Stats de consommation de tokens (Sobre). Affiche le tableau tel quel.
allowed-tools: Bash(node:*)
---

!\`node "${cheminScript()}" stats --court\`

Recopie le tableau ci-dessus tel quel, sans rien ajouter.
`;

function cheminScript() { return fileURLToPath(import.meta.url).replace(/\\/g, '/'); }

function k(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.', ',') + ' M';
  if (n >= 1e3) return Math.round(n / 1e3) + ' k';
  return String(Math.round(n));
}

async function lireStdin() {
  if (process.stdin.isTTY) return '';
  let d = '';
  for await (const c of process.stdin) d += c;
  return d;
}

// Barre d'etat Claude Code : tourne en local, ne consomme aucun token.
async function cmdBarre() {
  try {
    const j = JSON.parse((await lireStdin()) || '{}');
    const parts = [];
    if (j.model && j.model.display_name) parts.push(j.model.display_name);
    const ctx = j.context_window && j.context_window.used_percentage;
    if (ctx != null) parts.push(`ctx ${Math.round(ctx)} %`);
    const rl = j.rate_limits || {};
    const heure = (t) => new Date(t * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (rl.five_hour && rl.five_hour.used_percentage != null)
      parts.push(`5h ${Math.round(rl.five_hour.used_percentage)} %` + (rl.five_hour.resets_at ? ` (reset ${heure(rl.five_hour.resets_at)})` : ''));
    if (rl.seven_day && rl.seven_day.used_percentage != null) parts.push(`7j ${Math.round(rl.seven_day.used_percentage)} %`);
    const cw = j.context_window || {};
    if (j.cost && j.cost.total_cost_usd != null) parts.push(`session ≈ ${montant(j.cost.total_cost_usd, lireConfig())}`);
    process.stdout.write(parts.join(' · ') || 'Sobre');
    if (rl.five_hour || rl.seven_day) {
      mkdirp(DOSSIER);
      fs.writeFileSync(CACHE_BARRE, JSON.stringify({ le: Date.now(), five_hour: rl.five_hour, seven_day: rl.seven_day }));
    }
  } catch { process.stdout.write('Sobre'); }
}

function poserBarre(etat) {
  const f = p('.claude', 'settings.json');
  let j = {};
  const brut = lire(f);
  if (brut.trim()) {
    try { j = JSON.parse(brut); }
    catch { aFaire('~/.claude/settings.json illisible : barre d\'etat non installee.'); return; }
  }
  if (j.statusLine && !estBarreSobre(j.statusLine.command)) {
    aFaire('Tu as deja une barre d\'etat : je la garde. Pour celle de Sobre, remplace sa commande par : node "' + cheminScript() + '" barre');
    return;
  }
  j.statusLine = { type: 'command', command: `node "${cheminScript()}" barre` };
  ecrire(f, JSON.stringify(j, null, 2) + '\n');
  noterAjout(etat, 'claude-statusline');
  ok('Barre d\'etat installee (limite 5h, contexte) - 0 token');
}

function retirerBarre() {
  const f = p('.claude', 'settings.json');
  try {
    const j = JSON.parse(lire(f));
    if (j.statusLine && estBarreSobre(j.statusLine.command)) {
      delete j.statusLine;
      ecrire(f, JSON.stringify(j, null, 2) + '\n');
      return true;
    }
  } catch { /* ignore */ }
  return false;
}

// ---------------------------------------------------------------- prix et historique
// Prix publics de l'API en dollars par million de tokens :
// [entree, sortie, ecriture cache 5 min, ecriture cache 1 h, lecture cache]
// Source : https://platform.claude.com/docs/en/about-claude/pricing (releve le 22/11/2026)
const PRIX = {
  'fable-5.2': [8, 40, 10, 16, 0.2],   'mythos-5.2': [8, 40, 10, 16, 0.2],
  'fable-5.1': [10, 50, 12.5, 20, 0.25], 'mythos-5.1': [10, 50, 12.5, 20, 0.25],
  'fable-5': [10, 50, 12.5, 20, 1],    'mythos-5': [10, 50, 12.5, 20, 1],
  'opus-5.5': [4, 20, 5, 8, 0.2],      'opus-5': [5, 25, 6.25, 10, 0.5],
  'opus-4.8': [5, 25, 6.25, 10, 0.5],  'opus-4.7': [5, 25, 6.25, 10, 0.5],
  'opus-4.6': [5, 25, 6.25, 10, 0.5],  'opus-4.5': [5, 25, 6.25, 10, 0.5],
  'opus-4.1': [15, 75, 18.75, 30, 1.5], 'opus-4': [15, 75, 18.75, 30, 1.5],
  'sonnet-5.5': [2, 10, 2.5, 4, 0.1],  'sonnet-5': [2, 10, 2.5, 4, 0.2],
  'sonnet-4.6': [3, 15, 3.75, 6, 0.3], 'sonnet-4.5': [3, 15, 3.75, 6, 0.3], 'sonnet-4': [3, 15, 3.75, 6, 0.3],
  'haiku-5.5': [0.1, 0.5, 0.125, 0.2, 0.01], 'haiku-5.5-long': [0.5, 2.5, 0.625, 1, 0.05],
  'haiku-4.5': [1, 5, 1.25, 2, 0.1],
};
const FICHIER_CONFIG = path.join(DOSSIER, 'config.json');
const FICHIER_HISTO = path.join(DOSSIER, 'historique.json');

function lireConfig() {
  const def = { devise: 'USD', taux: 0.87, abonnement: null };
  try { return { ...def, ...JSON.parse(lire(FICHIER_CONFIG)) }; }
  catch { return def; }
}

function cleModele(id) {
  const m = /(opus|sonnet|haiku|fable|mythos)-(\d)(?:-(\d))?(?!\d)/.exec(id || '');
  if (!m) return null;
  return `${m[1]}-${m[2]}${m[3] ? '.' + m[3] : ''}`;
}

function coutUsd(u) {
  let cle = cleModele(u.modele);
  if (cle === 'haiku-5.5' && u.entree + u.cacheEcrit + u.cacheLu > 100000) cle = 'haiku-5.5-long';
  const p = PRIX[cle];
  if (!p) return null;
  const e1h = Math.min(u.cacheEcrit1h || 0, u.cacheEcrit);
  const e5m = u.cacheEcrit - e1h;
  return (u.entree * p[0] + u.sortie * p[1] + e5m * p[2] + e1h * p[3] + u.cacheLu * p[4]) / 1e6;
}

// Historique cumule par jour et par modele : survit a la suppression des
// journaux par Claude Code (30 jours par defaut).
function majHistorique(usages) {
  let h = {};
  try { h = JSON.parse(lire(FICHIER_HISTO)) || {}; } catch { h = {}; }
  const frais = {};
  for (const u of usages) {
    const jour = u.t.toISOString().slice(0, 10);
    const cle = `${jour}|${cleModele(u.modele) || u.modele}`;
    const a = frais[cle] || (frais[cle] = { tokens: 0, frais: 0, sortie: 0, usd: 0, inconnu: 0, n: 0 });
    const tot = u.entree + u.sortie + u.cacheEcrit + u.cacheLu;
    a.tokens += tot; a.frais += u.entree + u.sortie + u.cacheEcrit; a.sortie += u.sortie; a.n++;
    const c = coutUsd(u);
    if (c == null) a.inconnu += tot; else a.usd += c;
  }
  for (const [cle, v] of Object.entries(frais)) {
    if (!h[cle] || v.tokens >= h[cle].tokens) h[cle] = v;
  }
  if (!SIMULATION) {
    mkdirp(DOSSIER);
    const tmp = FICHIER_HISTO + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(h));
    fs.renameSync(tmp, FICHIER_HISTO);
  }
  return h;
}

function totalHistorique(h, filtre = () => true) {
  const t = { tokens: 0, frais: 0, sortie: 0, usd: 0, inconnu: 0, n: 0, debut: null, modeles: {} };
  for (const [cle, v] of Object.entries(h)) {
    const [jour, modele] = cle.split('|');
    if (!filtre(jour)) continue;
    for (const f of ['tokens', 'frais', 'sortie', 'usd', 'inconnu', 'n']) t[f] += v[f] || 0;
    if (!t.debut || jour < t.debut) t.debut = jour;
    const m = t.modeles[modele] || (t.modeles[modele] = { tokens: 0, usd: 0 });
    m.tokens += v.tokens; m.usd += v.usd;
  }
  return t;
}

// Montant affiche dans la devise choisie (dollars par defaut, euros avec --devise eur).
function montant(usd, cfg) {
  const eur = cfg.devise === 'EUR';
  const v = eur ? usd * cfg.taux : usd;
  return v.toLocaleString('fr-FR', { minimumFractionDigits: v < 10 ? 2 : 0, maximumFractionDigits: v < 10 ? 2 : 0 }) + (eur ? ' €' : ' $');
}
// Abonnement saisi dans la devise choisie -> dollars
const versUsd = (v, cfg) => (cfg.devise === 'EUR' ? v / cfg.taux : v);

function cmdStats(opts) {
  const cfg = lireConfig();
  if (opts.taux || opts.abonnement != null || opts.devise) {
    if (opts.devise) cfg.devise = opts.devise.toUpperCase() === 'EUR' ? 'EUR' : 'USD';
    if (opts.taux) cfg.taux = opts.taux;
    if (opts.abonnement != null) cfg.abonnement = opts.abonnement;
    if (!SIMULATION) { mkdirp(DOSSIER); fs.writeFileSync(FICHIER_CONFIG, JSON.stringify(cfg, null, 2)); }
  }

  const court = opts.court;
  const usages = lireUsages();
  const histo = majHistorique(usages);
  const maintenant = Date.now();
  const depuis = (ms) => usages.filter((u) => maintenant - u.t <= ms);
  const minuit = new Date(); minuit.setHours(0, 0, 0, 0);
  const somme = (l) => l.reduce((a, u) => {
    a.usd += coutUsd(u) || 0;
    a.total += u.entree + u.sortie + u.cacheEcrit + u.cacheLu;
    a.frais += u.entree + u.sortie + u.cacheEcrit;
    a.sortie += u.sortie; a.n++;
    return a;
  }, { total: 0, frais: 0, sortie: 0, n: 0, usd: 0 });

  const lignes = [
    ['5 dernieres heures', somme(depuis(5 * 3600e3))],
    ['Aujourd\'hui', somme(usages.filter((u) => u.t >= minuit))],
    ['7 derniers jours', somme(depuis(7 * 864e5))],
  ];
  const out = [];
  const tout = totalHistorique(histo);
  out.push('| Periode | Total | Hors cache lu | Reponses | Messages | Prix API |', '|---|---:|---:|---:|---:|---:|');
  for (const [n, s] of lignes) out.push(`| ${n} | ${k(s.total)} | ${k(s.frais)} | ${k(s.sortie)} | ${s.n} | ${montant(s.usd, cfg)} |`);
  if (tout.debut) out.push(`| **Depuis le ${new Date(tout.debut).toLocaleDateString('fr-FR')}** | **${k(tout.tokens)}** | **${k(tout.frais)}** | **${k(tout.sortie)}** | **${tout.n}** | **${montant(tout.usd, cfg)}** |`);
  if (tout.debut) {
    out.push('', `Si tu avais paye ces tokens un par un a l'API : ${montant(tout.usd, cfg)}` + (cfg.devise === 'EUR' ? ` (1 $ = ${String(cfg.taux).replace('.', ',')} €).` : '.'));
    if (cfg.abonnement) {
      const mois = Math.max(1, Math.ceil((Date.now() - new Date(tout.debut)) / (30 * 864e5)));
      const payeUsd = versUsd(mois * cfg.abonnement, cfg);
      out.push(`Abonnement sur la periode : ~${montant(payeUsd, cfg)} (${mois} mois). ` +
        (tout.usd > payeUsd ? `Economie : ~${montant(tout.usd - payeUsd, cfg)}.` : 'L\'API t\'aurait coute moins cher.'));
    }
    if (tout.inconnu) out.push(`Attention : ${k(tout.inconnu)} tokens d'un modele sans prix connu ne sont pas comptes.`);
  }

  let cache = null;
  try { cache = JSON.parse(lire(CACHE_BARRE)); } catch { /* ignore */ }
  if (cache && cache.five_hour) {
    const age = Math.round((maintenant - cache.le) / 60000);
    const reset = cache.five_hour.resets_at ? new Date(cache.five_hour.resets_at * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '?';
    out.push('', `Limite 5h : ${Math.round(cache.five_hour.used_percentage)} % utilises, reset a ${reset}` +
      (cache.seven_day ? ` · 7 jours : ${Math.round(cache.seven_day.used_percentage)} %` : '') + ` (releve il y a ${age} min)`);
  }

  if (!court) {
    const semaine = depuis(7 * 864e5);
    const grouper = (cle) => Object.entries(semaine.reduce((a, u) => { const c = u[cle]; a[c] = (a[c] || 0) + u.entree + u.sortie + u.cacheEcrit + u.cacheLu; return a; }, {}))
      .sort((x, y) => y[1] - x[1]).slice(0, 5);
    out.push('', '| Par modele (depuis le debut) | Tokens | Prix API |', '|---|---:|---:|');
    for (const [m, v] of Object.entries(tout.modeles).sort((x, y) => y[1].usd - x[1].usd).slice(0, 6))
      out.push(`| ${m} | ${k(v.tokens)} | ${montant(v.usd, cfg)} |`);
    out.push('', '| Par projet (7 j) | Total |', '|---|---:|');
    for (const [m, v] of grouper('projet')) out.push(`| ${m} | ${k(v)} |`);
    out.push('', 'Hors cache lu = ce qui pese le plus. Le cache lu coute beaucoup moins cher.',
      'Prix API = prix publics par million de tokens (releves le 22/11/2026), hors taxes.',
      `Comparer a ton abonnement : sobre stats --abonnement 20   (en ${cfg.devise === 'EUR' ? 'euros' : 'dollars'} par mois)`,
      'Afficher en euros : sobre stats --devise eur   (taux : --taux 0.87)');
  }
  if (!usages.length) out.push('', 'Aucun journal Claude Code trouve.');
  log(out.join('\n'));
}

// ---------------------------------------------------------------- mesure
function dossiersJournaux() {
  const d = [];
  if (process.env.CLAUDE_CONFIG_DIR) d.push(path.join(process.env.CLAUDE_CONFIG_DIR, 'projects'));
  d.push(p('.claude', 'projects'), p('.config', 'claude', 'projects'));
  return [...new Set(d)].filter((x) => fs.existsSync(x));
}

function* fichiersJsonl(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) yield* fichiersJsonl(f);
    else if (e.name.endsWith('.jsonl')) yield f;
  }
}

function lireUsages() {
  const vus = new Set();
  const usages = [];
  for (const dir of dossiersJournaux()) {
    for (const f of fichiersJsonl(dir)) {
      for (const l of lire(f).split('\n')) {
        if (!l.includes('"usage"')) continue;
        let o; try { o = JSON.parse(l); } catch { continue; }
        const u = o.message && o.message.usage;
        if (!u || !o.timestamp) continue;
        const cle = `${o.message.id || ''}:${o.requestId || ''}`;
        if (cle !== ':' && vus.has(cle)) continue;
        vus.add(cle);
        usages.push({
          t: new Date(o.timestamp),
          entree: u.input_tokens || 0,
          sortie: u.output_tokens || 0,
          cacheEcrit: u.cache_creation_input_tokens || 0,
          cacheEcrit1h: (u.cache_creation && u.cache_creation.ephemeral_1h_input_tokens) || 0,
          cacheLu: u.cache_read_input_tokens || 0,
          projet: o.cwd ? path.basename(o.cwd) : '?',
          modele: (o.message.model || '?').replace(/^claude-/, ''),
        });
      }
    }
  }
  return usages;
}

function resumer(liste) {
  const heures = new Set(liste.map((u) => u.t.toISOString().slice(0, 13)));
  const s = liste.reduce((a, u) => ({
    entree: a.entree + u.entree, sortie: a.sortie + u.sortie,
    cacheEcrit: a.cacheEcrit + u.cacheEcrit, cacheLu: a.cacheLu + u.cacheLu,
  }), { entree: 0, sortie: 0, cacheEcrit: 0, cacheLu: 0 });
  const total = s.entree + s.sortie + s.cacheEcrit + s.cacheLu;
  const h = heures.size || 1;
  return { ...s, total, heures: heures.size, messages: liste.length,
    parHeure: total / h, horsCacheParHeure: (s.entree + s.sortie + s.cacheEcrit) / h, sortieParHeure: s.sortie / h };
}

function cmdMesure(opts) {
  const etat = lireEtat();
  const jours = opts.jours || 14;
  const usages = lireUsages();
  log(gras('\nMesure de consommation (journaux Claude Code)'));
  if (!usages.length) {
    log(jaune('Aucun journal Claude Code trouve. Codex et Cursor ne sont pas mesures.'));
    return;
  }
  const fmt = (n) => Math.round(n).toLocaleString('fr-FR');
  const pivot = etat.installe_le ? new Date(etat.installe_le) : null;
  const debut = new Date(Date.now() - jours * 864e5);
  if (!pivot) {
    const r = resumer(usages.filter((u) => u.t >= debut));
    log(`\n${jours} derniers jours : ${fmt(r.total)} tokens, ${r.heures} heures actives, ${fmt(r.parHeure)} tokens / heure active.`);
    log(gris('Sobre n\'est pas encore installe : ce chiffre servira de reference.'));
    return;
  }
  const avant = resumer(usages.filter((u) => u.t < pivot && u.t >= new Date(pivot - jours * 864e5)));
  const apres = resumer(usages.filter((u) => u.t >= pivot));
  const ecart = (a, b) => (a ? `${b <= a ? vert('-' + Math.round((1 - b / a) * 100) + ' %') : rouge('+' + Math.round((b / a - 1) * 100) + ' %')}` : gris('n/a'));
  log(gris(`\nPivot : installation du ${pivot.toLocaleString('fr-FR')}. Comparaison sur ${jours} jours avant.`));
  log('\n' + gras('Par heure active'.padEnd(30) + 'Avant'.padStart(14) + 'Apres'.padStart(14) + 'Ecart'.padStart(10)));
  const ligne = (n, a, b) => log(n.padEnd(30) + fmt(a).padStart(14) + fmt(b).padStart(14) + '   ' + ecart(a, b));
  ligne('Total', avant.parHeure, apres.parHeure);
  ligne('Hors lecture du cache', avant.horsCacheParHeure, apres.horsCacheParHeure);
  ligne('Sortie (reponses)', avant.sortieParHeure, apres.sortieParHeure);
  log(gris(`\nEchantillon : ${avant.heures} h actives avant, ${apres.heures} h apres.`));
  if (apres.heures < 5) log(jaune('Moins de 5 heures actives depuis l\'installation : resultat encore peu fiable.'));
  log(gris('Une « heure active » = une heure ou tu as utilise Claude Code. Le type de travail fait varier le chiffre.'));
}

// ---------------------------------------------------------------- desinstallation / restauration
function cmdDesinstaller(opts) {
  const etat = lireEtat();
  const agents = opts.agents || Object.keys(AGENTS);
  titre('Retrait des elements poses par Sobre');
  if (agents.includes('claude')) {
    if (retirerBloc(p('.claude', 'CLAUDE.md'))) ok('Regles retirees de ~/.claude/CLAUDE.md');
    if (supprimer(p('.claude', 'agents', 'sobre-eclaireur.md'))) ok('Agent sobre-eclaireur supprime');
    if (retirerBarre()) ok('Barre d\'etat retiree');
    if (supprimer(p('.claude', 'commands', 'sobre-stats.md'))) ok('Commande /sobre-stats supprimee');
    if (supprimer(p('.claude', 'skills', 'sobre-passation', 'SKILL.md'))) {
      try { fs.rmdirSync(p('.claude', 'skills', 'sobre-passation')); } catch { /* ignore */ }
      ok('Skill sobre-passation supprime');
    }
    if (supprimer(p('.claude', 'skills', 'sobre-cerveau', 'SKILL.md'))) {
      try { fs.rmdirSync(p('.claude', 'skills', 'sobre-cerveau')); } catch { /* ignore */ }
      ok('Skill sobre-cerveau supprime');
    }
  }
  if (agents.includes('codex')) {
    if (retirerBloc(p('.codex', 'AGENTS.md'))) ok('Regles retirees de ~/.codex/AGENTS.md');
    if (retirerBloc(p('.codex', 'config.toml'), TOML_DEBUT, TOML_FIN)) ok('context-mode retire de ~/.codex/config.toml');
  }
  if (agents.includes('cursor') && etat.ajouts.includes('cursor-mcp-context-mode')) {
    const f = p('.cursor', 'mcp.json');
    try {
      const j = JSON.parse(lire(f));
      if (j.mcpServers) delete j.mcpServers['context-mode'];
      ecrire(f, JSON.stringify(j, null, 2) + '\n');
      ok('context-mode retire de ~/.cursor/mcp.json');
    } catch { aFaire('~/.cursor/mcp.json illisible : retire context-mode a la main.'); }
  }
  etat.ajouts = etat.ajouts.filter((a) => !agents.some((ag) => a.startsWith(ag)));
  etat.agents = (etat.agents || []).filter((a) => !agents.includes(a));
  if (!etat.agents.length) etat.profil = null;
  finaliserSauvegarde(etat);
  ecrireEtat(etat);

  titre('Outils tiers (a retirer toi-meme si tu veux)');
  info('Plugins Claude Code (Caveman, Ponytail, context-mode) : menu /plugin dans Claude Code.');
  info('Plugin Codex Ponytail : menu /plugins dans Codex.');
  info('RTK : voir https://github.com/rtk-ai/rtk (section desinstallation).');
  info('context-mode global : npm uninstall -g context-mode');
  info('CodeGraph : npm uninstall -g @colbymchenry/codegraph');
  info('Les dossiers .cerveau/ de tes projets sont conserves (ce sont tes notes).');
  log(gris('\nTes propres reglages n\'ont pas ete touches. Sauvegarde dans ~/.sobre/sauvegardes.'));
}

function cmdRestaurer() {
  const etat = lireEtat();
  const derniere = (etat.sauvegardes || []).slice(-1)[0];
  if (!derniere || !fs.existsSync(path.join(derniere, 'manifeste.json'))) { log(jaune('Aucune sauvegarde a restaurer.')); return; }
  const m = JSON.parse(lire(path.join(derniere, 'manifeste.json')));
  titre(`Restauration de ${path.basename(derniere)}`);
  for (const rel of m.modifies) {
    const src = path.join(derniere, 'fichiers', rel);
    if (SIMULATION) { info(`[simulation] restaurerait ${rel}`); continue; }
    mkdirp(path.dirname(p(rel)));
    fs.copyFileSync(src, p(rel));
    ok(`Restaure : ${rel}`);
  }
  for (const rel of m.crees) {
    if (SIMULATION) { info(`[simulation] supprimerait ${rel}`); continue; }
    if (fs.existsSync(p(rel))) { fs.rmSync(p(rel)); ok(`Supprime : ${rel}`); }
  }
  if (!SIMULATION) { etat.sauvegardes = etat.sauvegardes.slice(0, -1); ecrireEtat(etat); }
  info('Les outils tiers (RTK, plugins) ne sont pas desinstalles par la restauration.');
}

async function cmdMaj() {
  const url = `https://raw.githubusercontent.com/${DEPOT}/main/sobre.mjs`;
  titre('Mise a jour de Sobre');
  if (SIMULATION) { info(`[simulation] telechargerait ${url}`); return; }
  const r = await fetch(url);
  if (!r.ok) { log(rouge(`Echec du telechargement (${r.status}).`)); process.exitCode = 1; return; }
  const code = await r.text();
  fs.writeFileSync(fileURLToPath(import.meta.url), code);
  ok('Sobre mis a jour. Relance `sobre` pour appliquer les nouveaux reglages.');
}

function cmdAide() {
  log(`
${gras('Sobre ' + VERSION)} - moins de tokens, meme qualite (Claude Code, Codex, Cursor)

${gras('Usage')}
  sobre                          installe / met a jour le branchement (relancable)
  sobre --profil qualite|equilibre|max
  sobre --agents claude,codex,cursor
  sobre --sans caveman,eclaireur retire des outils du profil
  sobre --simulation             montre ce qui serait fait, ne change rien
  sobre --oui                    sans questions (scripts)

  sobre etat                     verifie ce qui est branche
  sobre stats                    tokens utilises : 5 h, jour, semaine, par modele et projet
  sobre mesure [--jours 14]      consommation avant / apres (Claude Code)
  sobre projet                   regles Sobre pour le projet courant (Cursor)
  sobre cerveau                  cree le cerveau du projet courant (.cerveau/, Obsidian)
  sobre desinstaller [--agents]  retire tout ce que Sobre a pose
  sobre restaurer                remet les fichiers d'avant la derniere operation
  sobre maj                      met a jour Sobre

${gras('Outils')}  ${Object.keys(OUTILS).join(', ')}
`);
}

// ---------------------------------------------------------------- arguments
function analyser(argv) {
  const o = { commande: null };
  const liste = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const valeur = () => { const [, v] = a.split('='); return v !== undefined ? v : argv[++i]; };
    if (a === '--simulation' || a === '--dry-run') SIMULATION = true;
    else if (a === '--oui' || a === '-y' || a === '--yes') o.oui = true;
    else if (a.startsWith('--profil')) o.profil = valeur();
    else if (a.startsWith('--agents')) o.agents = liste(valeur());
    else if (a.startsWith('--sans')) o.sans = liste(valeur());
    else if (a.startsWith('--outils')) o.outils = liste(valeur());
    else if (a.startsWith('--jours')) o.jours = parseInt(valeur(), 10);
    else if (a === '--court') o.court = true;
    else if (a.startsWith('--devise')) o.devise = String(valeur());
    else if (a.startsWith('--taux')) o.taux = parseFloat(String(valeur()).replace(',', '.'));
    else if (a.startsWith('--abonnement')) o.abonnement = parseFloat(String(valeur()).replace(',', '.'));
    else if (a === '-h' || a === '--help' || a === 'aide') o.commande = 'aide';
    else if (a === '-v' || a === '--version') o.commande = 'version';
    else if (!a.startsWith('-') && !o.commande) o.commande = a;
  }
  return o;
}

const opts = analyser(process.argv.slice(2));
const COMMANDES = {
  installer: cmdInstaller, etat: cmdEtat, stats: cmdStats, barre: cmdBarre, mesure: cmdMesure, projet: cmdProjet, cerveau: cmdCerveau,
  desinstaller: cmdDesinstaller, restaurer: cmdRestaurer, maj: cmdMaj, aide: cmdAide,
  version: () => log(VERSION),
};
const f = COMMANDES[opts.commande || 'installer'];
if (!f) { log(rouge(`Commande inconnue : ${opts.commande}`)); cmdAide(); process.exitCode = 1; }
else await f(opts);
