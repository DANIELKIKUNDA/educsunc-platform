# API HTTP du BC Referentiel Academique

Les interfaces HTTP exposent les use cases applicatifs. Elles valident les entrees, resolvent le contexte tenant, appliquent l'idempotence sur les commandes critiques et presentent les sorties.

## Contexte tenant

Entetes supportes :

- `x-tenant-id` : identifiant de l'ecole courante.
- `x-organisation-id` : identifiant d'organisation pour lecture organisationnelle.
- `x-lecture-organisation: true` : active une lecture organisationnelle explicite.

## Idempotence

Entetes supportes :

- `Idempotency-Key`
- `x-idempotency-key`

Comportement :

- Meme cle et meme empreinte : retourne le resultat memorise si l'operation est terminee.
- Meme cle et empreinte differente : refuse la requete.
- Meme cle avec operation en cours : refuse l'execution concurrente.

## Organisations

- `POST /api/organisations` : creer une organisation.
- `GET /api/organisations` : lister les organisations.
- `GET /api/organisations/:id` : consulter une organisation.
- `PATCH /api/organisations/:id/renommer` : renommer une organisation.
- `POST /api/organisations/:id/activer` : activer une organisation.
- `POST /api/organisations/:id/desactiver` : desactiver une organisation.

Notes de securite backend :

- ces routes reappliquent une autorisation systeme locale dediee a l'administration des organisations
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement via `EDUCSYN_ORG01_ALLOW_OPERATEUR_SYSTEME=true`
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` ne deviennent pas administrateurs d'organisations par simple heritage de `referentiel.read` ou `referentiel.write`
- l'identite d'audit `creePar` ou `modifiePar` est desormais imposee par le contexte authentifie, plus declaree librement dans le corps HTTP

## Ecoles

- `POST /api/ecoles` : creer une ecole.
- `GET /api/ecoles` : lister les ecoles.
- `GET /api/ecoles/:id` : consulter une ecole.
- `GET /api/organisations/:id/ecoles` : lister les ecoles d'une organisation.
- `POST /api/ecoles/:id/changer-mode` : changer le mode d'exploitation.
- `PATCH /api/ecoles/:id/renommer` : renommer une ecole.
- `POST /api/ecoles/:id/activer` : activer une ecole.
- `POST /api/ecoles/:id/desactiver` : desactiver une ecole.

Notes de securite backend :

- ces routes reappliquent la meme autorisation systeme locale que le socle academique officiel
- les acteurs reels admis sont `MANAGER_SYSTEME`, `OPERATEUR_SYSTEME` et `SUPPORT_SYSTEME`, sous reserve de leurs permissions effectives `referentiel.read` et `referentiel.write`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` ne deviennent pas administrateurs d ecoles par simple heritage de `referentiel.read` ou `referentiel.write`
- l identite d audit `creePar` ou `modifiePar` est desormais imposee par le contexte authentifie, plus declaree librement dans le corps HTTP

## Annees scolaires

- `POST /api/annees-scolaires` : creer une annee scolaire. Route idempotente.
- `GET /api/annees-scolaires` : lister les annees scolaires d'une ecole.
- `GET /api/annees-scolaires/active` : consulter l'annee active d'une ecole.
- `POST /api/annees-scolaires/preparer-suivante` : preparer l'annee suivante. Route idempotente.
- `POST /api/annees-scolaires/garantir-active` : garantir une annee active. Route idempotente.
- `POST /api/annees-scolaires/basculer` : basculer l'annee scolaire. Route idempotente.
- `GET /api/annees-scolaires/:id` : consulter une annee scolaire.
- `POST /api/annees-scolaires/:id/activer` : activer une annee scolaire.
- `POST /api/annees-scolaires/:id/cloturer` : cloturer une annee scolaire.
- `POST /api/annees-scolaires/:id/archiver` : archiver une annee scolaire.

## Structure scolaire

- `POST /api/sections-scolaires` : creer une section scolaire.
- `POST /api/classes-academiques` : creer une classe academique.
- `POST /api/options-etudes` : creer une option d'etude.
- `POST /api/classes-pedagogiques` : creer une classe pedagogique. Route idempotente.
- `GET /api/classes-academiques` : lister les classes academiques.
- `GET /api/classes-pedagogiques` : lister les classes pedagogiques par ecole et annee.
- `PATCH /api/classes-pedagogiques/:id/renommer` : renommer une classe pedagogique.
- `POST /api/classes-pedagogiques/:id/desactiver` : desactiver une classe pedagogique.
- `POST /api/classes-pedagogiques/:id/archiver` : archiver une classe pedagogique.
- `GET /api/options-etudes` : lister les options d'etudes.

## Referentiels officiels

- `POST /api/referentiels/import-sections` : importer les sections depuis JSON. Route idempotente.
- `POST /api/referentiels/import-options` : importer les options depuis JSON. Route idempotente.
- `POST /api/referentiels/import-classes` : importer les classes academiques depuis JSON. Route idempotente.
- `POST /api/referentiels/import-cours` : importer les cours depuis JSON. Route idempotente.
- `POST /api/referentiels/import-programmes` : importer les programmes depuis JSON. Route idempotente.
- `POST /api/referentiels/import-lignes` : importer les lignes de programme depuis JSON. Route idempotente.
- `POST /api/referentiels/versions` : publier une version de referentiel. Route idempotente.
- `POST /api/referentiels/versions/:id/activer` : activer une version de referentiel. Route idempotente.
- `POST /api/referentiels/comparer` : comparer deux versions de referentiel.
- `GET /api/referentiels/programmes` : lister les referentiels programmes.
- `GET /api/referentiels/programmes/:id` : consulter un referentiel programme.

Notes de securite backend :

- `POST /api/referentiels/import-sections`, `POST /api/referentiels/import-options`, `POST /api/referentiels/import-classes`, `POST /api/referentiels/import-cours`, `POST /api/referentiels/import-programmes` et `POST /api/referentiels/import-lignes` reappliquent une autorisation locale d'import officiel
- `POST /api/referentiels/comparer` reapplique une autorisation locale de comparaison officielle
- `GET /api/referentiels/programmes`, `GET /api/referentiels/programmes/:id` et `GET /api/referentiels/cours` reappliquent une autorisation locale de lecture officielle
- `POST /api/referentiels/versions` reapplique une autorisation locale de publication officielle
- `POST /api/referentiels/versions/:id/activer` reapplique une autorisation locale d'activation officielle
- `MANAGER_SYSTEME` reste l'acteur naturel de cet import officiel
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement via `EDUCSYN_PLT03_ALLOW_OPERATEUR_SYSTEME=true` pour importer
- `MANAGER_SYSTEME` reste aussi l'acteur naturel de cette comparaison officielle
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement via `EDUCSYN_PLT04_ALLOW_OPERATEUR_SYSTEME=true` pour comparer
- `MANAGER_SYSTEME` reste aussi l'acteur naturel de cette lecture officielle
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement via `EDUCSYN_PLT05_ALLOW_OPERATEUR_SYSTEME=true` pour lire
- `MANAGER_SYSTEME` reste l'acteur naturel de cette publication
- `MANAGER_SYSTEME` reste aussi l'acteur naturel de cette activation
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement via `EDUCSYN_PLT01_ALLOW_OPERATEUR_SYSTEME=true` pour publier et `EDUCSYN_PLT02_ALLOW_OPERATEUR_SYSTEME=true` pour activer
- `SUPPORT_SYSTEME`, `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` ne deviennent ni importeurs, ni comparateurs, ni publieurs, ni activateurs officiels par simple heritage de `referentiel.read` ou `referentiel.write`
- l'identite d'audit `importePar` est desormais imposee par le contexte authentifie, plus declaree librement dans le corps HTTP
- l'identite d'audit `publiePar` est desormais imposee par le contexte authentifie, plus declaree librement dans le corps HTTP
- l'identite d'audit `activePar` est desormais imposee par le contexte authentifie, plus declaree librement dans le corps HTTP

## Programmes niveau

- `POST /api/programmes-niveau/initialiser` : initialiser un programme niveau. Route idempotente.
- `GET /api/programmes-niveau/:id/etat-local` : produire l'etat local d'un programme.
- `GET /api/programmes-niveau/:id` : consulter un programme niveau.
- `POST /api/programmes-niveau/:id/valider` : valider un programme niveau. Route idempotente.
- `POST /api/programmes-niveau/:id/archiver` : archiver un programme niveau.
- `GET /api/programmes-niveau` : lister les programmes niveau d'une ecole et d'une annee.

## Calendriers academiques

- `POST /api/calendriers-academiques` : creer un calendrier academique. Route idempotente.
- `PATCH /api/calendriers-academiques/:id/periodes/:code` : modifier une periode de calendrier.
- `POST /api/calendriers-academiques/:id/valider` : valider un calendrier academique.
- `POST /api/calendriers-academiques/:id/verrouiller` : verrouiller un calendrier academique.
- `GET /api/calendriers-academiques/:id` : consulter un calendrier academique.

## Migrations de referentiel

- `POST /api/migrations-referentiel/analyser` : analyser une migration de referentiel. Route idempotente.
- `POST /api/migrations-referentiel/appliquer` : appliquer une migration de referentiel. Route idempotente.
- `POST /api/migrations-referentiel/:id/annuler` : annuler une migration. Route idempotente.
- `POST /api/migrations-referentiel/:id/relancer-recalcul` : relancer un recalcul apres migration. Route idempotente.
- `GET /api/migrations-referentiel/:id` : consulter le rapport de migration.

## Validation HTTP

Chaque famille de routes possede un validateur dedie :

- `organisation.validator`
- `ecole.validator`
- `annee-scolaire.validator`
- `classe-academique.validator`
- `classe-pedagogique.validator`
- `option-etude.validator`
- `referentiel-academique.validator`
- `programme-niveau.validator`
- `calendrier-academique.validator`
- `migration-referentiel.validator`

Les validateurs transforment les corps, parametres et query HTTP en entrees applicatives. Ils ne remplacent pas les validations du domaine.
