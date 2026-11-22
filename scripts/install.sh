#!/bin/sh
# Installateur Sobre pour macOS / Linux
# Usage : curl -fsSL https://raw.githubusercontent.com/TeddyF39/sobre/main/scripts/install.sh | sh
set -e
DEPOT="TeddyF39/sobre"
DIR="$HOME/.sobre"
BIN="$HOME/.local/bin"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22+ est requis : https://nodejs.org puis relance cette commande."
  exit 1
fi

mkdir -p "$DIR" "$BIN"
echo "Telechargement de Sobre..."
curl -fsSL "https://raw.githubusercontent.com/$DEPOT/main/sobre.mjs" -o "$DIR/sobre.mjs"

printf '#!/bin/sh\nexec node "$HOME/.sobre/sobre.mjs" "$@"\n' > "$BIN/sobre"
chmod +x "$BIN/sobre"

case ":$PATH:" in
  *":$BIN:"*) ;;
  *) echo "Note : ajoute $BIN a ton PATH pour taper 'sobre' directement." ;;
esac

# Quand le script arrive par un pipe, on rebranche le clavier pour les questions.
if [ -r /dev/tty ] && [ -t 1 ]; then
  node "$DIR/sobre.mjs" "$@" < /dev/tty
else
  node "$DIR/sobre.mjs" --oui "$@"
fi
