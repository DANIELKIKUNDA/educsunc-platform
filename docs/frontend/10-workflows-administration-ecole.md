# Phase 10 - Workflows Administration Ecole

## Statut

Ce document ouvre la documentation detaillee des workflows reels d'administration ecole d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

## Workflow ADM-01

### Identifiant

`ADM-01`

### Nom

Gerer les ecoles

### Categorie

`Administration Ecole`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a l'equipe systeme d'administrer le cycle de vie d'une ecole dans EduSync, de sa creation a son activation ou sa desactivation, sans ouvrir ce pilotage structurel aux roles metier d'exploitation locale par simple heritage de permissions generiques.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions

- l'acteur doit porter une affectation systeme active
- l'acteur doit disposer de `referentiel.read` pour lire
- l'acteur doit disposer de `referentiel.write` pour creer ou modifier
- le contexte de requete doit transporter un utilisateur authentifie
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.read`
  - lister les ecoles
  - consulter une ecole
- `referentiel.write`
  - creer une ecole
  - changer son mode d'exploitation
  - mettre a jour ses informations institutionnelles
  - renommer une ecole
  - activer une ecole
  - desactiver une ecole

### Perimetre reel

- plateforme / systeme
- ce workflow ne repose pas sur un perimetre pedagogique de classe ou de section
- le contexte tenant continue de transporter `organisation + ecole` pour les lectures et mutations locales d'ecoles
- la legitimite metier du workflow vient d'abord du role systeme autorise, pas d'un role ecole

### Cas d'utilisation utilises

- `CreerEcole`
- `ListerEcoles`
- `ConsulterEcole`
- `ListerEcolesParOrganisation`
- `ChangerModeExploitationEcole`
- `MettreAJourInformationsInstitutionnellesEcole`
- `RenommerEcole`
- `ActiverEcole`
- `DesactiverEcole`

### Routes backend reelles

- `POST /api/ecoles`
- `GET /api/ecoles`
- `GET /api/ecoles/:id`
- `GET /api/organisations/:id/ecoles`
- `POST /api/ecoles/:id/changer-mode`
- `PATCH /api/ecoles/:id/informations-institutionnelles`
- `PATCH /api/ecoles/:id/renommer`
- `POST /api/ecoles/:id/activer`
- `POST /api/ecoles/:id/desactiver`

### Deroulement principal

1. L'acteur systeme ouvre l'administration des ecoles avec un contexte authentifie actif.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation systeme avant toute lecture ou mutation.
4. Le backend valide ensuite les parametres HTTP utiles du workflow.
5. Pour les mutations, le backend impose `creePar` ou `modifiePar` depuis le contexte authentifie.
6. Le cas d'usage cible cree, consulte, liste ou modifie l'ecole demandee.
7. Le backend retourne la projection HTTP de l'ecole ou de la liste d'ecoles.

### Variantes

#### Variante 1 - Lecture systeme

- `MANAGER_SYSTEME`, `OPERATEUR_SYSTEME` ou `SUPPORT_SYSTEME` peuvent lire si `referentiel.read` est effectivement present

#### Variante 2 - Mutation systeme

- `MANAGER_SYSTEME` et `OPERATEUR_SYSTEME` peuvent muter si `referentiel.write` est effectivement present
- `SUPPORT_SYSTEME` peut etre refuse en mutation s'il ne porte que `referentiel.read`

#### Variante 3 - Lecture organisationnelle

- `GET /api/organisations/:id/ecoles` ouvre une lecture bornee aux ecoles de l'organisation cible
- cette lecture reste reservee aux acteurs systeme autorises

### Resultat attendu

En sortie de ce workflow, le systeme doit pouvoir :

- creer une nouvelle ecole rattachee a une organisation valide
- exposer une lecture fiable des ecoles existantes
- modifier le mode ou le nom d'une ecole
- completer ou corriger l'identite institutionnelle d'une ecole existante
- activer ou desactiver une ecole existante
- tracer l'acteur reel des mutations sans laisser le frontend le declarer librement

### Contraintes backend

- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` ne deviennent pas administrateurs d'ecoles par simple heritage de `referentiel.read` ou `referentiel.write`
- la securite locale est reappliquee dans [ControleurEcoles.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurEcoles.ts)
- le contexte tenant est transporte par [ecoles.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/ecoles.routes.ts)
- l'identite d'audit n'est plus lue depuis le body HTTP mais imposee via le contexte authentifie

### Donnees manipulees

- `Ecole`
- `Organisation`
- `ModeExploitation`
- informations institutionnelles d'ecole :
  - `sigle`
  - `adresse`
  - `telephone`
  - `email`
  - `provinceEducationnelle`
  - `ville`
  - `communeOuTerritoire`

### Sources backend

- routes :
  - [ecoles.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/ecoles.routes.ts)
- controleur :
  - [ControleurEcoles.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurEcoles.ts)
- validateurs :
  - [ecole.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/ecole.validator.ts)
- cas d'utilisation :
  - [CreerEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/CreerEcole.ts)
  - [ListerEcoles.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/ListerEcoles.ts)
  - [ConsulterEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/ConsulterEcole.ts)
  - [ListerEcolesParOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/ListerEcolesParOrganisation.ts)
  - [ChangerModeExploitationEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/ChangerModeExploitationEcole.ts)
  - [MettreAJourInformationsInstitutionnellesEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/MettreAJourInformationsInstitutionnellesEcole.ts)
  - [RenommerEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/RenommerEcole.ts)
  - [ActiverEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/ActiverEcole.ts)
  - [DesactiverEcole.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/ecoles/DesactiverEcole.ts)
- securite locale :
  - [AutorisationSocleAcademiqueAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationSocleAcademiqueAdapter.ts)
- tests :
  - [security-administration-ecoles.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-administration-ecoles.integration.spec.ts)
  - [ecoles.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/ecoles.routes.test.ts)

### Notes de lecture frontend

- `ADM-01` n'est pas un workflow d'exploitation quotidienne d'ecole
- il ne doit pas etre projete comme une simple page reservee a `ADMINISTRATEUR_ECOLE`
- son UI doit assumer un acteur systeme et une gouvernance structurelle
- le frontend ne doit plus envoyer `creePar` ni `modifiePar` dans les payloads de ce workflow
- un script backend de backfill existe maintenant pour les ecoles historiques :
  - [MettreAJourInformationsInstitutionnellesEcoles.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/scripts/MettreAJourInformationsInstitutionnellesEcoles.ts)
  - exemple de donnees : [exemple-informations-institutionnelles-ecoles.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/administration-ecole/exemple-informations-institutionnelles-ecoles.json)
  - lot multi-ecoles : [lot-informations-institutionnelles-ecoles.template.json](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/administration-ecole/lot-informations-institutionnelles-ecoles.template.json)
  - mode operatoire : [README-backfill-informations-institutionnelles-ecoles.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/administration-ecole/README-backfill-informations-institutionnelles-ecoles.md)

### Notes de verrouillage

- la securite locale est maintenant alignee sur les acteurs systeme reels
- la tracabilite acteur n'est plus une donnee libre du client
- les preuves minimales de routes et de securite existent maintenant en backend

### Statut de figement

`ADM-01 FIGE`
