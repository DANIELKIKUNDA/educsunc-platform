# Certification du premier lancement Auth

## Verdict

Le premier lancement EduSync est certifie sur un cluster PostgreSQL 16 vierge, isole de la base de developpement, avec creation du premier Manager systeme depuis Chrome reel.

**ETAPE D AUTHENTIFICATION - FRONTEND, PREMIERE INITIALISATION ET CONTINUITE DE SESSION CERTIFIES PRODUCTION**

## Isolation retenue

La certification a utilise un second cluster PostgreSQL ephemere initialise dans le dossier temporaire Windows, sans Docker et sans modification du service PostgreSQL habituel.

- port PostgreSQL temporaire : `55432` ;
- base du parcours navigateur : `educsyn_auth_bootstrap_certification` ;
- base du test de concurrence : `educsyn_auth_bootstrap_concurrency_certification` ;
- utilisateur applicatif temporaire : proprietaire uniquement de ces bases, sans droit global de creation de base, de role ou de superutilisateur ;
- backend temporaire principal : `3100` ;
- backend temporaire de concurrence : `3101` ;
- frontend temporaire en mode connexion : `4174`.

Les secrets ont ete generes dans le dossier temporaire, n'ont jamais ete ecrits dans le depot et ont ete supprimes avec l'environnement de certification.

## Etat vierge prouve

Avant le premier demarrage du backend :

- aucune table applicative dans la base dediee ;
- aucune table `auth_utilisateurs` ;
- aucun marqueur `auth_initialisation_plateforme` ;
- aucune session ;
- aucun compte de gouvernance.

Apres migrations, `GET /api/auth/initialisation` a retourne `initialisationRequise: true`.

## Parcours Chrome reel

Le script reproductible est :

`frontend/scripts/certify-authentication-bootstrap-browser.cjs`

Le parcours certifie :

1. detection de l'initialisation requise ;
2. affichage de la page officielle de premiere installation ;
3. rendu desktop 1440 px et mobile 390 px sans debordement ;
4. saisie du premier responsable dans le vrai formulaire ;
5. creation par `POST /api/auth/initialisation` avec statut `201` ;
6. absence du refresh token dans la reponse JavaScript ;
7. creation des cookies Auth `HttpOnly` ;
8. ouverture de la session et redirection vers la Plateforme ;
9. restauration apres actualisation ;
10. restauration apres redemarrage reel du backend ;
11. restauration du role `MANAGER_SYSTEME` et du perimetre Plateforme ;
12. redirection de `/initialisation` vers l'application apres fermeture du bootstrap ;
13. refus d'un second premier compte avec statut `409`.

Les captures et rapports machine sont produits dans :

`frontend/artifacts/authentication-bootstrap-certification/`

## Preuves PostgreSQL

Apres le parcours navigateur principal :

| Preuve | Nombre |
|---|---:|
| Utilisateurs Auth | 1 |
| Marqueurs de premiere initialisation | 1 |
| Sessions actives | 1 |
| Refresh tokens actifs | 1 |

Apres redemarrage du backend, le compte, la session et le marqueur sont restes disponibles. Le backend a restaure l'affectation Manager systeme a partir du marqueur PostgreSQL durable avant d'accepter la session.

## Preuve de concurrence

Une seconde base vierge a recu deux requetes de premiere initialisation simultanees.

| Resultat | Valeur |
|---|---|
| Statuts HTTP tries | `201`, `409` |
| Comptes crees | 1 |
| Marqueurs crees | 1 |
| Sessions creees | 1 |

Le verrou transactionnel PostgreSQL empeche donc deux premiers Managers systeme d'etre crees, meme lorsque les demandes arrivent simultanement.

## Nettoyage obligatoire

Apres collecte des preuves :

- les deux backends temporaires sont arretes ;
- le frontend temporaire est arrete ;
- le cluster PostgreSQL temporaire est arrete ;
- le dossier temporaire, les bases et les secrets sont supprimes ensemble ;
- le frontend de developpement normal est relance ;
- la base habituelle reste sur `localhost:5432/educsyn` et n'est jamais modifiee par le protocole.

## Validations finales

- typecheck backend : valide ;
- build backend : valide ;
- tests Auth et HTTP cibles : 11 sur 11 valides ;
- tests PostgreSQL Auth : 2 sur 2 valides ;
- cycle JWT et persistance apres redemarrages : valides ;
- build frontend avec `vue-tsc` : valide ;
- premier lancement Chrome et PostgreSQL vierge : valide ;
- concurrence du bootstrap : valide ;
- `git diff --check` : valide ;
- aucun secret de certification suivi par Git.
