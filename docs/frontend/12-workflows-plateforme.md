# Phase 12 - Workflows Plateforme

## Statut

Ce document ouvre la documentation detaillee des workflows reels plateforme d'EduSync.

Il s'appuie sur :

- [DOCTRINE_REFERENTIEL_OFFICIEL.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/architecture/DOCTRINE_REFERENTIEL_OFFICIEL.md)
- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [04-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/04-workflows.md)
- [05-workflows-reels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/05-workflows-reels.md)

Le backend reste la source officielle de verite.

Pour tout workflow relatif au referentiel officiel, la lecture d'architecture transverse a retenir reste :

- `Plateforme` proprietaire de l'officiel
- `Organisation` supervise sans muter l'officiel
- `Ecole` exploite sans devenir proprietaire de l'officiel

## Workflow PLT-01

### Identifiant

`PLT-01`

### Nom

Publier une version officielle du referentiel

### Categorie

`Plateforme`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a la plateforme de publier officiellement une version de referentiel deja rattachee a son referentiel programme parent, afin de produire une base officielle exploitable par les workflows academiques et pedagogiques aval, sans laisser cette publication dependre d'une simple saisie libre d'acteur ni d'un heritage generique de permission.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- un `ReferentielProgramme` parent doit deja exister
- la version cible doit deja exister sur ce referentiel parent
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.write`
- le contexte de requete doit transporter un utilisateur authentifie
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.write`
  - publier une version officielle du referentiel

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'ecole
- jamais lu comme un workflow d'organisation
- la legitimite metier vient du role systeme autorise a publier l'officiel

### Cas d'utilisation utilises

- `PublierVersionReferentiel`

### Routes backend reelles

- `POST /api/referentiels/versions`

### Deroulement principal

1. L'acteur systeme ouvre la publication officielle d'une version de referentiel.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `PLT-01`.
4. Le backend valide les parametres de publication utiles.
5. Le backend impose `publiePar` depuis le contexte authentifie.
6. Le cas d'usage relit le `ReferentielProgramme` parent.
7. Le backend verifie que la version cible existe deja avec une definition coherente.
8. Le backend journalise l'action de publication officielle.
9. Le backend retourne la version officielle publiee.

### Variantes

#### Variante 1 - Publication par le manager

- `MANAGER_SYSTEME` peut publier si `referentiel.write` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut publier que si la plateforme active explicitement `EDUCSYN_PLT01_ALLOW_OPERATEUR_SYSTEME=true`
- `referentiel.write` reste requis

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `PLT-01`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit disposer :

- d'une version de referentiel officiellement publiee
- d'une tracabilite d'audit fiable sur l'acteur reel de publication
- d'une base officielle exploitable par les workflows aval

### Contraintes backend

- la securite locale `PLT-01` est reappliquee dans [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationPublicationReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPublicationReferentielAdapter.ts)
- l'identite d'audit n'est plus lue depuis le body HTTP mais imposee via le contexte authentifie

### Donnees manipulees

- `ReferentielProgramme`
- `VersionReferentielProgramme`
- `SourceReferentiel`

### Sources backend

- routes :
  - [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- controleur :
  - [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- validateur :
  - [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- cas d'utilisation :
  - [PublierVersionReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/PublierVersionReferentiel.ts)
- securite locale :
  - [AutorisationPublicationReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationPublicationReferentielAdapter.ts)
- tests :
  - [publier-version-referentiel.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/publier-version-referentiel.test.ts)
  - [security-publication-referentiel-plateforme.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-publication-referentiel-plateforme.integration.spec.ts)
  - [publication-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/publication-referentiel.routes.test.ts)

### Notes de lecture frontend

- `PLT-01` n'est pas un simple import technique
- il ne doit pas etre projete comme une action reservee a l'ecole
- le frontend ne doit plus envoyer `publiePar` dans le payload de ce workflow
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme

### Notes de verrouillage

- la securite locale `PLT-01` est maintenant explicite
- la tracabilite acteur n'est plus une donnee libre du client
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`PLT-01 FIGE`

## Workflow PLT-02

### Identifiant

`PLT-02`

### Nom

Activer une version officielle du referentiel

### Categorie

`Plateforme`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a la plateforme d'activer officiellement une version de referentiel deja publiee afin d'en faire la version operationnelle de reference pour les usages academiques aval, sans laisser cette activation dependre d'une simple saisie libre d'acteur ni d'un heritage generique de permission.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- la version cible doit deja exister
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.write`
- le contexte de requete doit transporter un utilisateur authentifie
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.write`
  - activer une version officielle du referentiel

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'ecole
- jamais lu comme un workflow d'organisation
- la legitimite metier vient du role systeme autorise a rendre officielle la version active

### Cas d'utilisation utilises

- `ActiverVersionReferentiel`

### Routes backend reelles

- `POST /api/referentiels/versions/:id/activer`

### Deroulement principal

1. L'acteur systeme ouvre l'activation officielle d'une version de referentiel.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `PLT-02`.
4. Le backend valide les parametres HTTP utiles.
5. Le backend impose `activePar` depuis le contexte authentifie.
6. Le cas d'usage relit le `ReferentielProgramme` parent via l'identifiant de version.
7. Le backend active la version cible et desactive les autres versions du meme referentiel.
8. Le backend journalise l'action d'activation officielle.
9. Le backend retourne la version officielle active.

### Variantes

#### Variante 1 - Activation par le manager

- `MANAGER_SYSTEME` peut activer si `referentiel.write` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut activer que si la plateforme active explicitement `EDUCSYN_PLT02_ALLOW_OPERATEUR_SYSTEME=true`
- `referentiel.write` reste requis

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `PLT-02`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit disposer :

- d'une version de referentiel officiellement active
- d'une tracabilite d'audit fiable sur l'acteur reel d'activation
- d'une version de reference unique pour les usages aval

### Contraintes backend

- la securite locale `PLT-02` est reappliquee dans [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationActivationReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationActivationReferentielAdapter.ts)
- l'identite d'audit n'est plus lue depuis le body HTTP mais imposee via le contexte authentifie

### Donnees manipulees

- `ReferentielProgramme`
- `VersionReferentielProgramme`

### Sources backend

- routes :
  - [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- controleur :
  - [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- validateur :
  - [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- cas d'utilisation :
  - [ActiverVersionReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ActiverVersionReferentiel.ts)
- securite locale :
  - [AutorisationActivationReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationActivationReferentielAdapter.ts)
- tests :
  - [activer-version-referentiel.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/activer-version-referentiel.test.ts)
  - [security-activation-referentiel-plateforme.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-activation-referentiel-plateforme.integration.spec.ts)
  - [activation-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/activation-referentiel.routes.test.ts)

### Notes de lecture frontend

- `PLT-02` n'est pas une simple bascule technique
- il ne doit pas etre projete comme une action reservee a l'ecole
- le frontend ne doit plus envoyer `activePar` dans le payload de ce workflow
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme

### Notes de verrouillage

- la securite locale `PLT-02` est maintenant explicite
- la tracabilite acteur n'est plus une donnee libre du client
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`PLT-02 FIGE`

## Workflow PLT-03

### Identifiant

`PLT-03`

### Nom

Importer le referentiel officiel

### Categorie

`Plateforme`

### Niveau de criticite

`Critique`

### Objectif metier

Permettre a la plateforme d'importer les composantes officielles du referentiel academique dans le backend, afin de preparer une base de reference exploitable par les workflows academiques aval, sans laisser cet import dependra d'une simple saisie libre d'acteur ni d'un heritage generique de permission.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- les donnees JSON du referentiel doivent etre presentes et structurees correctement
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.write`
- le contexte de requete doit transporter un utilisateur authentifie
- l'identite acteur est imposee par le contexte authentifie, pas declaree librement dans le corps HTTP

### Permissions effectives requises

- `referentiel.write`
  - importer les composantes officielles du referentiel

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'ecole
- jamais lu comme un workflow d'organisation
- la legitimite metier vient du role systeme autorise a injecter la reference officielle

### Cas d'utilisation utilises

- `ImporterSectionsDepuisJson`
- `ImporterOptionsDepuisJson`
- `ImporterClassesAcademiquesDepuisJson`
- `ImporterCoursAcademiquesDepuisJson`
- `ImporterProgrammesAcademiquesDepuisJson`
- `ImporterLignesProgrammeDepuisJson`

### Routes backend reelles

- `POST /api/referentiels/import-sections`
- `POST /api/referentiels/import-options`
- `POST /api/referentiels/import-classes`
- `POST /api/referentiels/import-cours`
- `POST /api/referentiels/import-programmes`
- `POST /api/referentiels/import-lignes`

### Deroulement principal

1. L'acteur systeme ouvre l'import officiel d'un composant du referentiel.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `PLT-03`.
4. Le backend valide les parametres JSON utiles du composant importe.
5. Le backend impose `importePar` depuis le contexte authentifie.
6. Le backend declenche le cas d'utilisation d'import cible.
7. L'orchestrateur persiste les donnees importees, avec transaction pour l'import des programmes.
8. Le backend retourne le resultat d'import correspondant.

### Variantes

#### Variante 1 - Import par le manager

- `MANAGER_SYSTEME` peut importer si `referentiel.write` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut importer que si la plateforme active explicitement `EDUCSYN_PLT03_ALLOW_OPERATEUR_SYSTEME=true`
- `referentiel.write` reste requis

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `PLT-03`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit disposer :

- d'un composant officiel du referentiel correctement importe
- d'une tracabilite d'audit fiable sur l'acteur reel d'import
- d'une base officielle prete pour les workflows academiques suivants

### Contraintes backend

- la securite locale `PLT-03` est reappliquee dans [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationImportReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationImportReferentielAdapter.ts)
- l'identite d'audit n'est plus lue depuis le body HTTP mais imposee via le contexte authentifie

### Donnees manipulees

- `SectionScolaire`
- `OptionEtude`
- `ClasseAcademique`
- `ReferentielCours`
- `ReferentielProgramme`
- `LigneReferentielProgramme`

### Sources backend

- routes :
  - [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- controleur :
  - [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- validateur :
  - [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- orchestrateur :
  - [OrchestrateurImportReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/services/OrchestrateurImportReferentiel.ts)
- securite locale :
  - [AutorisationImportReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationImportReferentielAdapter.ts)
- tests :
  - [security-import-referentiel-plateforme.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-import-referentiel-plateforme.integration.spec.ts)
  - [import-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/import-referentiel.routes.test.ts)
  - [import-referentiel.controller.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/import-referentiel.controller.test.ts)

### Notes de lecture frontend

- `PLT-03` est un workflow plateforme unique avec plusieurs points d'entree d'import
- il ne doit pas etre projete comme une action reservee a l'ecole
- le frontend ne doit plus envoyer `importePar` dans le payload de ce workflow
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme

### Notes de verrouillage

- la securite locale `PLT-03` est maintenant explicite
- la tracabilite acteur n'est plus une donnee libre du client
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`PLT-03 FIGE`

## Workflow PLT-04

### Identifiant

`PLT-04`

### Nom

Comparer deux versions officielles du referentiel

### Categorie

`Plateforme`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a la plateforme de comparer deux versions officielles d'un meme referentiel de classe afin de produire une lecture fiable des ecarts structurels avant migration, verification ou decision d'activation, sans laisser cette comparaison reposer sur un heritage generique de permission.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- les deux versions ciblees doivent exister dans le referentiel de la classe academique visee
- la classe academique doit exister
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.read`
- le contexte de requete doit transporter un utilisateur authentifie

### Permissions effectives requises

- `referentiel.read`
  - comparer deux versions officielles du referentiel

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'ecole
- jamais lu comme un workflow d'organisation
- la legitimite metier vient du role systeme autorise a lire les ecarts officiels

### Cas d'utilisation utilises

- `ComparerDeuxVersionsReferentiel`

### Routes backend reelles

- `POST /api/referentiels/comparer`

### Deroulement principal

1. L'acteur systeme ouvre la comparaison officielle de deux versions.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `PLT-04`.
4. Le backend valide les parametres de comparaison utiles.
5. Le cas d'usage relit la classe academique cible.
6. Le backend recharge le referentiel programme correspondant.
7. Le moteur compare les deux versions officielles demandees.
8. Le backend retourne la liste des differences detectees.

### Variantes

#### Variante 1 - Comparaison par le manager

- `MANAGER_SYSTEME` peut comparer si `referentiel.read` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut comparer que si la plateforme active explicitement `EDUCSYN_PLT04_ALLOW_OPERATEUR_SYSTEME=true`
- `referentiel.read` reste requis

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `PLT-04`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit disposer :

- d'une lecture fiable des ecarts entre deux versions officielles
- d'une base d'analyse reutilisable par les workflows de migration et de pilotage plateforme

### Contraintes backend

- la securite locale `PLT-04` est reappliquee dans [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationComparaisonReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationComparaisonReferentielAdapter.ts)

### Donnees manipulees

- `ClasseAcademique`
- `ReferentielProgramme`
- `VersionReferentielProgramme`
- `LigneDiffMigration`

### Sources backend

- routes :
  - [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- controleur :
  - [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- validateur :
  - [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- cas d'utilisation :
  - [ComparerDeuxVersionsReferentiel.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ComparerDeuxVersionsReferentiel.ts)
- securite locale :
  - [AutorisationComparaisonReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationComparaisonReferentielAdapter.ts)
- tests :
  - [comparer-deux-versions-referentiel.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/comparer-deux-versions-referentiel.test.ts)
  - [security-comparaison-referentiel-plateforme.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-comparaison-referentiel-plateforme.integration.spec.ts)
  - [comparaison-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/comparaison-referentiel.routes.test.ts)

### Notes de lecture frontend

- `PLT-04` est une lecture analytique plateforme, pas une mutation
- il ne doit pas etre projete comme une action reservee a l'ecole
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme

### Notes de verrouillage

- la securite locale `PLT-04` est maintenant explicite
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`PLT-04 FIGE`

## Workflow PLT-05

### Identifiant

`PLT-05`

### Nom

Consulter les referentiels officiels

### Categorie

`Plateforme`

### Niveau de criticite

`Important`

### Objectif metier

Permettre a la plateforme de consulter les referentiels programmes et le catalogue officiel des cours comme base de lecture systeme fiable, sans laisser cette lecture dependra d'un heritage generique de permission.

### Acteur principal

`MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions

- les referentiels officiels et/ou cours officiels concernes doivent exister
- `MANAGER_SYSTEME` reste l'acteur naturel de ce workflow
- `OPERATEUR_SYSTEME` ne devient acteur positif que si la plateforme l'autorise explicitement
- l'acteur doit disposer de `referentiel.read`
- le contexte de requete doit transporter un utilisateur authentifie

### Permissions effectives requises

- `referentiel.read`
  - consulter les referentiels officiels

### Perimetre reel

- plateforme / systeme
- jamais lu comme un workflow d'ecole
- jamais lu comme un workflow d'organisation
- la legitimite metier vient du role systeme autorise a lire le socle officiel

### Cas d'utilisation utilises

- `ListerReferentielsParClasseAcademique`
- `ListerReferentielsCours`
- `ConsulterReferentielProgramme`

### Routes backend reelles

- `GET /api/referentiels/programmes`
- `GET /api/referentiels/programmes/:id`
- `GET /api/referentiels/cours`

### Deroulement principal

1. L'acteur systeme ouvre une lecture officielle de referentiel.
2. Le backend recharge l'identite utilisateur et le role actif depuis le `RequestContext`.
3. Le controleur reapplique localement l'autorisation `PLT-05`.
4. Le backend valide les parametres de lecture utiles.
5. Le cas d'usage relit les objets officiels demandes.
6. Le backend retourne la lecture paginee ou detaillee correspondante.

### Variantes

#### Variante 1 - Lecture par le manager

- `MANAGER_SYSTEME` peut lire si `referentiel.read` est effectivement present

#### Variante 2 - Delegation explicite a l'operateur

- `OPERATEUR_SYSTEME` ne peut lire que si la plateforme active explicitement `EDUCSYN_PLT05_ALLOW_OPERATEUR_SYSTEME=true`
- `referentiel.read` reste requis

#### Variante 3 - Refus des autres roles

- `SUPPORT_SYSTEME` est refuse sur `PLT-05`
- `ADMIN_SYSTEME_ECOLE` et `ADMINISTRATEUR_ECOLE` sont refuses meme s'ils portent des permissions generiques

### Resultat attendu

En sortie de ce workflow, le systeme doit disposer :

- d'une lecture fiable des referentiels programmes officiels
- d'une lecture fiable du catalogue officiel des cours
- d'un point d'entree lecture stable pour les usages plateforme aval

### Contraintes backend

- la securite locale `PLT-05` est reappliquee dans [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- `OPERATEUR_SYSTEME` est conditionne par une configuration applicative explicite via [app.config.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/config/app.config.ts)
- la regle locale est portee par [AutorisationLectureReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationLectureReferentielAdapter.ts)

### Donnees manipulees

- `ReferentielProgramme`
- `VersionReferentielProgramme`
- `ReferentielCours`
- `ClasseAcademique`

### Sources backend

- routes :
  - [referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- controleur :
  - [ControleurReferentielsAcademiques.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/controllers/ControleurReferentielsAcademiques.ts)
- validateurs :
  - [referentiel-import.validator.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/validators/referentiel-import.validator.ts)
- cas d'utilisation :
  - [ListerReferentielsParClasseAcademique.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ListerReferentielsParClasseAcademique.ts)
  - [ListerReferentielsCours.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ListerReferentielsCours.ts)
  - [ConsulterReferentielProgramme.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/application/use-cases/referentiels/ConsulterReferentielProgramme.ts)
- securite locale :
  - [AutorisationLectureReferentielAdapter.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/app/adapters/AutorisationLectureReferentielAdapter.ts)
- tests :
  - [security-lecture-referentiel-plateforme.integration.spec.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/shared/tests/integration/security-lecture-referentiel-plateforme.integration.spec.ts)
  - [lecture-referentiel.routes.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/lecture-referentiel.routes.test.ts)
  - [lecture-referentiel.controller.test.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/tests/lecture-referentiel.controller.test.ts)

### Notes de lecture frontend

- `PLT-05` est un workflow de lecture plateforme, pas une mutation
- il ne doit pas etre projete comme une lecture reservee a l'ecole
- la delegation `OPERATEUR_SYSTEME` doit etre lue comme une exception explicite de plateforme

### Notes de verrouillage

- la securite locale `PLT-05` est maintenant explicite
- la delegation `OPERATEUR_SYSTEME` est maintenant parametree par configuration applicative

### Statut de figement

`PLT-05 FIGE`
