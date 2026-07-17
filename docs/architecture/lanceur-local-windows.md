# Lanceur local EduSync sous Windows

## Audit réel

- Projet : `C:\Users\MON PC\Documents\EducSyn`
- Redis : `Ubuntu-22.04` sous WSL 2, port `6379`
- PostgreSQL : installation Windows native, base `educsyn`, port `5432`, service détecté `postgresql-x64-16`
- Backend : `npm run dev` dans `backend`, santé `http://localhost:3000/health`
- Frontend : `npm run dev:actors` dans `frontend`, URL `http://localhost:4174/`
- Docker : absent de toute la chaîne de lancement

Le service Windows PostgreSQL peut être déclaré arrêté alors que le processus PostgreSQL natif répond déjà. La disponibilité réelle sur `5432` est donc vérifiée avant toute tentative de démarrage du service. Aucune base, aucun identifiant et aucune donnée ne sont modifiés.

## Architecture retenue

Le raccourci `EduSync` exécute `start-edusync.ps1`. Le script orchestre strictement Redis, PostgreSQL, backend, frontend, puis le navigateur. Il attend un `PONG`, la disponibilité PostgreSQL et les réponses HTTP réelles avant de poursuivre.

Redis est lié uniquement à la boucle locale WSL et à l'adresse privée de la machine virtuelle WSL. Cette adresse est résolue à chaque lancement et transmise uniquement au processus backend. Redis et PostgreSQL ne sont pas publiés sur le réseau public.

L'état d'exécution conserve le PID racine et son heure de démarrage. Le script d'arrêt refuse ainsi de tuer un processus qui n'appartient pas au lanceur EduSync. Les journaux sont placés dans `.runtime/logs`, dossier exclu de Git.

## Matrice de certification

| Scénario | Résultat |
| --- | --- |
| Redis arrêté puis réveil WSL | Validé |
| Redis déjà actif | Validé |
| PostgreSQL déjà disponible | Validé |
| PostgreSQL indisponible, erreur contrôlée | Validé par simulation non destructive |
| Backend arrêté puis démarré | Validé |
| Backend déjà actif | Validé |
| Frontend arrêté puis démarré | Validé |
| Frontend déjà actif | Validé |
| Double lancement sans doublon | Validé |
| Port backend occupé par un tiers | Validé, processus tiers préservé |
| Échec ou délai backend | Validé, arbre lancé nettoyé |
| Port frontend occupé | Validé, processus tiers et backend préservés |
| WSL indisponible | Validé par simulation contrôlée |
| Chemin Windows contenant un espace | Validé |
| Lancement par raccourci | Validé |
| Arrêt ciblé | Validé |
| Affichage du statut | Validé |
| Redémarrage complet de Windows | Non exécuté pour ne pas interrompre la session de travail |

Les scénarios PostgreSQL arrêté et WSL indisponible sont simulés dans `tests/test-edusync-launcher.ps1`. Arrêter la base réelle ou désactiver WSL uniquement pour un test aurait créé un risque inutile pour les données et les autres travaux de la machine.

## Validations finales

- build backend TypeScript : réussi ;
- build frontend Vue/Vite : réussi, 2 295 modules transformés ;
- analyse syntaxique de tous les scripts PowerShell : réussie ;
- test Microsoft Edge via Playwright : frontend `200`, titre `EduSync`, contenu visible et santé backend `200` ;
- second lancement : mêmes PID backend et frontend, aucune instance supplémentaire ;
- raccourci Bureau : cible, arguments, répertoire de travail et icône vérifiés ;
- arrêt ciblé : PostgreSQL, Redis et les processus tiers restent intacts.

## Exploitation

Le mode d'emploi quotidien, le dépannage, la recréation du raccourci et l'emplacement des journaux sont documentés dans `scripts/windows/README.md`.

## Verdict

**LANCEUR LOCAL EDUSYNC - CERTIFIÉ**, sous réserve du seul scénario volontairement non exécuté : le redémarrage physique complet de Windows.
