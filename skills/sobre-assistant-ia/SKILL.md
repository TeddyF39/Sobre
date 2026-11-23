---
name: sobre-assistant-ia
description: Méthode pour construire un assistant IA sur PC (style Jarvis) - voix (mot d'éveil, reconnaissance, synthèse vocale), IA locale (Ollama, Qwen…), routage entre IA locale et Claude, appli de bureau Windows, notifications, accès depuis le téléphone, automatisations sûres. À utiliser pour toute tâche sur un assistant vocal, une IA locale ou une appli qui pilote le PC.
---

# Assistant IA sur PC

Lis seulement la référence utile :

| Tâche | Référence |
|---|---|
| Mot d'éveil, reconnaissance vocale, synthèse vocale | `references/voix.md` |
| IA locale, routage local / Claude, coûts | `references/ia-locale.md` |
| Appli de bureau, interface, notifications, téléphone, tâches de fond | `references/appli.md` |

## Règles qui s'appliquent toujours
1. **Sécurité d'abord** : un assistant qui agit sur le PC suit la référence sécurité du skill `sobre-code` (liste blanche, confirmation avant suppression, installation, paiement, envoi).
2. **Briques éprouvées** plutôt que du fait maison : vérifie qu'une bibliothèque est maintenue (dernière version récente, licence) avant de l'adopter, et note le choix dans `.cerveau/decisions.md`.
3. **Mesurer** : latence (de la fin de la phrase à la réponse), mémoire et processeur/GPU utilisés. Un assistant vocal au-delà de ~2 s de latence paraît lent.
4. **Tout doit marcher hors ligne** pour les fonctions de base ; Claude n'est appelé que quand c'est utile.
5. **Tester par morceaux** : micro seul, reconnaissance seule, IA seule, voix seule, puis la chaîne complète.
