# Installer Sobre (instructions pour un agent de code)

Tu es un agent de code (Claude Code, Codex ou Cursor). L'utilisateur veut installer Sobre.

1. Vérifie que Node.js 22+ est disponible : `node --version`. Sinon, arrête-toi et demande à l'utilisateur de l'installer.
2. Installe Sobre :
   - Windows (PowerShell) : `irm https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.ps1 | iex`
   - macOS / Linux : `curl -fsSL https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.sh | sh`
3. Montre d'abord le plan sans rien modifier : `sobre --simulation --oui`
4. Demande à l'utilisateur quel profil il veut (`qualite`, `equilibre` ou `max`) et pour quels agents, puis lance par exemple :
   `sobre --oui --profil equilibre --agents claude,codex`
5. Lance `sobre etat` et rapporte le résultat, en particulier les lignes « à faire à la main ».
6. Dis à l'utilisateur de redémarrer ses agents.

Ne modifie aucun autre fichier de configuration toi-même.
