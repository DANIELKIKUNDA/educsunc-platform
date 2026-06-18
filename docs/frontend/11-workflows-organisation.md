# Phase 11 - Workflows Organisation

## Statut

Ce document ouvre la documentation detaillee des workflows reels organisationnels d'EduSync.

Il s'appuie sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

## Workflow ORG-01

### Identifiant

`ORG-01`

### Nom

Gerer les organisations

### Categorie

`Organisation`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a la gouvernance systeme d'administrer le cycle de vie d'une organisation dans EduSync, de sa creation a son activation ou sa desactivation, sans laisser les roles d'ecole ni les roles systeme non delegues ouvrir implicitement ce pilotage structurel.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- l'acteur doit porter une affectation systeme active
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.read` pour lire
- l'acteur doit disposer de `referentiel.write` pour creer ou modifier
- le contexte de requete doit transporter un utilisateur authentifie
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.read`
  - lister les organisations
  - consulter une organisation
- `referentiel.write`
  - creer une organisation
  - renommer une organisation
  - activer une organisation
  - desactiver une organisation

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'exploitation d'ecole
- jamais lu comme un workflow pedagogique ou financier
- la legitimite metier vient du role systeme autorise, pas d'un scope ecole

### Cas d'utilisation utilises

- `CreerOrganisation`
- `ListerOrganisations`
- `ConsulterOrganisation`
- `RenommerOrganisation`
- `ActiverOrganisation`
- `DesactiverOrganisation`

### Routes backend reelles

- `POST /api/organisations`
- `GET /api/organisations`
- `GET /api/organisations/:id`
- `PATCH /api/organisations/:id/renommer`
- `POST /api/organisations/:id/activer`
- `POST /api/organisations/:id/desactiver`

### Deroulement principal

1. L'acteur systeme ouvre l'administration des organisations avec un contexte authentifie actif.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `ORG-01` avant toute lecture ou mutation.
4. Le backend valide ensuite les parametres HTTP utiles du workflow.
5. Pour les mutations, le backend impose `creePar` ou `modifiePar` depuis le contexte authentifie.
6. Le cas d'usage cible cree, consulte, liste ou modifie l'organisation demandee.
7. Le backend retourne la projection HTTP de l'organisation ou de la liste d'organisations.

### Variantes

#### Variante 1 - Lecture systeme naturelle

- `MANAGER_SYSTEME` peut lire si `referentiel.read` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut lire ou muter que si la plateforme active explicitement `EDUCSYN_ORG01_ALLOW_OPERATEUR_SYSTEME=true`
- meme dans ce cas, `referentiel.read` et `referentiel.write` restent requis selon l'action

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `ORG-01`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent deja des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit pouvoir :

- creer une nouvelle organisation
- exposer une lecture fiable des organisations existantes
- renommer une organisation
- activer ou desactiver une organisation existante
- tracer l'acteur reel des mutations sans declaration libre par le frontend

### Contraintes backend

- la securite locale `ORG-01` est reappliquee dans [ControleurOrganisations.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurOrganisations.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationOrganisationSystemeAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOrganisationSystemeAdapter.ts)
- l'identite d'audit n'est plus lue depuis le body HTTP mais imposee via le contexte authentifie

### Donnees manipulees

- `Organisation`
- `TypeOrganisation`

### Sources backend

- routes :
  - [organisations.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/organisations.routes.ts)
- controleur :
  - [ControleurOrganisations.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurOrganisations.ts)
- validateurs :
  - [organisation.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/organisation.validator.ts)
- cas d'utilisation :
  - [CreerOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/CreerOrganisation.ts)
  - [ListerOrganisations.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/ListerOrganisations.ts)
  - [ConsulterOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/ConsulterOrganisation.ts)
  - [RenommerOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/RenommerOrganisation.ts)
  - [ActiverOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/ActiverOrganisation.ts)
  - [DesactiverOrganisation.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/organisations/DesactiverOrganisation.ts)
- securite locale :
  - [AutorisationOrganisationSystemeAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationOrganisationSystemeAdapter.ts)
- tests :
  - [security-organisations-administration.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-organisations-administration.integration.spec.ts)
  - [organisations.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/organisations.routes.test.ts)

### Notes de lecture frontend

- `ORG-01` n'est pas un workflow d'administration locale d'ecole
- il ne doit pas etre projete comme un ecran reserve a `ADMINISTRATEUR_ECOLE`
- le frontend ne doit plus envoyer `creePar` ni `modifiePar` dans les payloads de ce workflow
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme, pas comme un droit naturel

### Notes de verrouillage

- la securite locale `ORG-01` est maintenant explicite
- la tracabilite acteur n'est plus une donnee libre du client
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`ORG-01 FIGE`
