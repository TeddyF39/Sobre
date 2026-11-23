# Voix : mot d'éveil, reconnaissance, synthèse

## Chaîne type
micro → détection d'activité vocale (VAD) → mot d'éveil → enregistrement de la phrase → reconnaissance (texte) → traitement → synthèse vocale → haut-parleur

## Briques locales courantes (à vérifier : maintenance, licence, support du français)
| Rôle | Options courantes | Remarques |
|---|---|---|
| Mot d'éveil | openWakeWord, Porcupine (Picovoice) | Porcupine : mots personnalisés faciles mais licence et clé requises ; openWakeWord : libre, entraînement d'un mot personnalisé plus long |
| Détection de voix | Silero VAD, webrtcvad | Coupe l'enregistrement quand l'utilisateur se tait |
| Reconnaissance | faster-whisper (Whisper) | Modèle `small` ou `medium` pour le français ; GPU fortement conseillé pour la vitesse |
| Synthèse | Piper | Rapide et local, voix françaises disponibles ; choisir une voix masculine si demandé |

## Bonnes pratiques
- Le mot d'éveil tourne en continu avec un modèle minuscule ; la reconnaissance lourde ne démarre qu'après l'éveil.
- Réglage du seuil du mot d'éveil sur de vrais enregistrements (faux réveils vs mots manqués).
- Couper le micro pendant que l'assistant parle (sinon il s'entend lui-même), ou annulation d'écho.
- Diffuser la synthèse phrase par phrase dès que le texte arrive (streaming) pour réduire la latence perçue.
- Mode silencieux : la réponse passe en notification au lieu de la voix.
- Afficher un indicateur visuel quand l'assistant écoute ou parle.

## Tests
- Enregistrements de test (WAV) rejoués pour la reconnaissance : mesurer le taux d'erreur sur des phrases typiques en français.
- Mesurer la latence de chaque étape séparément et l'écrire dans les logs.
