# Phase 49 - Contrats D'Ecran Organisation

## Statut

Ce document ferme la doctrine ecran du module `Organisation` avec le meme niveau de rigueur que les autres lots de contrats d'ecran deja stabilises.

Statut d'implementation frontend au `06/07/2026` :

- routes frontend reelles branchees
- vues `Centre organisation`, `Registre des organisations` et `Detail ecole organisation` materialisees
- services, store, modeles, viewmodel et composants dedies branches dans `frontend/src/domains/organisation`
- detail organisation enrichi avec une timeline reelle via `GET /api/organisations/:id/historique`
- route `/app/organisation/configuration` deja branchee, mais elle releve du contrat [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)

Ce document ne cree :

- aucun nouveau workflow
- aucune nouvelle permission
- aucune nouvelle vue metier
- aucune nouvelle route backend

Il materialise uniquement ce que le depot prouve deja :

- `ORG-01` pour la gouvernance des organisations
- la lecture des ecoles rattachees a une organisation
- la descente du contexte organisation -> ecole
- le pont de navigation vers `ADM-01` et `CFG-ORG-01`

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)
- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)
- [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)
- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/routes.ts)
- [frontend-doctrine.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/shared/doctrine/frontend-doctrine.ts)
- [organization-governance.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/services/organization-governance.api.ts)
- [organization-governance.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/stores/organization-governance.store.ts)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. `ORG-01` reste un workflow de gouvernance systeme, pas un workflow local d'ecole.
2. Les ecrans du module `Organisation` peuvent ouvrir des ponts vers l'organisation ou l'ecole, mais ne doivent pas absorber `ADM-01` ni `CFG-ORG-01`.
3. La descente vers les ecoles rattachees reste une lecture de supervision, pas une mutation implicite.
4. La route `/app/organisation/configuration` est bien visible dans le module `Organisation`, mais son contrat officiel reste [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md).
5. Le frontend ne doit jamais promettre un ecran autonome de detail d'organisation si le depot materialise seulement :
   - un registre des organisations
   - une projection locale de l'organisation selectionnee
   - un detail d'ecole rattachee

## Cartographie Officielle Retenue

Les ecrans reels du module `Organisation` sont maintenant relus ainsi :

- `SCR-ORG-001` : `/app/organisation`
- `SCR-ORG-002` : `/app/organisation/ecoles`
- `SCR-ORG-003` : `/app/organisation/organisations/:idOrganisation`
- `SCR-ORG-004` : `/app/organisation/organisations/:idOrganisation/modifier`
- `SCR-ORG-005` : `/app/organisation/organisations/:idOrganisation/ecoles`
- `SCR-ORG-006` : `/app/organisation/ecoles/:idEcole`
- `/app/organisation/configuration` :
  - route de module `Organisation`
  - mais contrat officiel deja porte par [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)

## Audit De Fermeture - "Detail organisation" vs "Detail ecole organisation"

### Constat du depot

La doctrine amont mentionnait encore :

- `detail organisation`

Mais l'implementation et les routes reelles prouvent aujourd'hui :

- une page registre : `/app/organisation/ecoles`
- une page detail ecole rattachee : `/app/organisation/ecoles/:idEcole`
- un chargement backend via `GET /api/ecoles/:id`
- une lecture des ecoles rattachees via `GET /api/organisations/:id/ecoles`

### Verdict de l'ecart

Cet ecart n'est pas un simple choix cosmetique de libelle.

Il s'agit d'un ecart fonctionnel documentaire :

- le backend expose bien `GET /api/organisations/:id`
- mais le frontend actuel ne materialise pas une page autonome dediee a ce detail d'organisation
- la lecture d'une organisation est aujourd'hui absorbee par :
  - la ligne du registre
  - le panneau de projection de l'organisation selectionnee
  - le centre organisation

### Fermeture retenue

Le depot apporte maintenant une preuve frontend suffisante pour materialiser deux pages supplementaires sans toucher au metier :

- une vraie lecture `Voir organisation` basee sur `GET /api/organisations/:id`
- une vraie page `Modifier organisation` bornee a la mutation effectivement supportee par le backend :
  - renommage uniquement

La lecture officielle devient donc :

- `detail organisation` existe maintenant comme page autonome
- `detail ecole organisation` reste distinct et borne a l'ecole rattachee
- l'edition generale d'organisation ne doit pas inventer de mutation sur `type`, `description` ou `promoteur` tant qu'aucune route backend dediee n'existe

## Ecran `SCR-ORG-001`

### Page parente

- centre organisation

### Vue parente

- vue centre de travail

### Module

- `Organisation`

### Section

- home

### Objectif metier

Permettre la relecture du contexte organisationnel actif, l'ouverture du registre organisationnel et la descente vers les ecoles rattachees sans quitter le module.

### Acteur principal

- `PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`

### Preconditions de visibilite

- session AUTH valide
- module `Organisation` visible dans le shell doctrinal
- contexte organisationnel lisible ou relisible
- pour la variante systeme du centre :
  - lecture du registre `ORG-01` autorisee
  - lecture des ecoles rattachees disponible

### Permissions

- base commune :
  - lecture du contexte actif
- pour la variante systeme du centre :
  - `referentiel.read`
- pour les acteurs organisationnels :
  - aucune lecture structurelle `ORG-01` implicite n'est presume ici
  - la vue reste un centre de contexte et un pont vers les ecrans qui leur sont reellement ouverts, comme `CFG-ORG-01`

### Donnees attendues

- contexte actif frontend :
  - acteur
  - niveau
  - organisation active
  - ecole active
- si la variante systeme est ouverte :
  - liste des organisations chargees
  - liste des ecoles de l'organisation active

### Donnees affichees

- bandeau de contexte actif
- resume de l'organisation courante
- type, etat, version et nombre d'ecoles chargees
- si la variante systeme est ouverte :
  - cartes des ecoles rattachees
- sinon :
  - message explicite indiquant que la lecture structurelle reste reservee aux acteurs systeme prouves

### Actions visibles

- ouvrir le registre des organisations seulement si `ORG-01` est effectivement ouvrable
- ouvrir la configuration organisationnelle
- relire les ecoles rattachees seulement si la variante systeme est ouverte
- rebasculer sur le niveau organisation
- si la variante systeme est ouverte :
  - activer une ecole dans le contexte
  - ouvrir le detail d'une ecole rattachee
  - ouvrir l'administration locale de l'ecole cible

### Actions interdites

- aucune mutation directe `ORG-01` depuis cette vue
- aucune mutation locale d'ecole
- aucune administration technique de configuration depuis cette vue elle-meme
- aucune lecture structurelle des organisations ou des ecoles pour les acteurs organisationnels si le backend ne l'ouvre pas explicitement

### Vues secondaires ouvertes

- [SCR-ORG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-ORG-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-ORG-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)

### Composants majeurs

- `PageContainer`
- `PageHeader`
- `SectionBlock`
- `StatChip`
- `EmptyState`
- `ErrorState`
- `LoadingState`

### Etats obligatoires

- loading
- aucune organisation resolue
- aucune ecole chargee sur la variante systeme
- erreur technique
- contexte incomplet
- registre systeme non ouvert

### Contraintes de perimetre

- niveau `ORGANISATION` ou `PLATEFORME`
- organisation active requise pour la descente vers les ecoles quand la variante systeme est ouverte
- l'ecole active reste derivee de l'organisation active

### Routes frontend concernees

- `/app/organisation`

### Sources backend

- bascule du contexte :
  - `PUT /api/auth/contexte/organisation-active`
  - `PUT /api/auth/contexte/ecole-active`
- variante systeme seulement :
  - `GET /api/organisations`
  - `GET /api/organisations/:id/ecoles`

### Implementation frontend reelle

- vue :
  - [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/ModuleHomeView.vue)
- route :
  - [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/routes.ts)
- store :
  - [organization-governance.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/stores/organization-governance.store.ts)

## Ecran `SCR-ORG-002`

### Page parente

- registre des organisations

### Vue parente

- vue liste et projection

### Module

- `Organisation`

### Section

- registre organisationnel

### Objectif metier

Permettre la lecture systeme des organisations, l'exercice des mutations `ORG-01` deja prouvees, puis la projection des ecoles rattachees a l'organisation selectionnee.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions de visibilite

- session AUTH valide
- module `Organisation` actif
- capacite de lecture `ORG-01`
- pour les mutations :
  - autorisation systeme locale positive
  - `referentiel.write`

### Permissions

- backend :
  - `referentiel.read`
  - `referentiel.write` pour creer, renommer, activer et desactiver
- doctrine frontend executable :
  - `organization.read`
  - `organization.write`

### Donnees attendues

- liste paginee des organisations
- compteur d'ecoles par organisation
- organisation selectionnee
- liste des ecoles rattachees a l'organisation selectionnee
- contexte organisationnel courant

### Donnees affichees

- barre de recherche
- filtres type / statut
- statistiques visibles :
  - nombre visible
  - actives
  - inactives
  - total des ecoles visibles
- table des organisations
- panneau de projection de l'organisation selectionnee
- lecture des ecoles rattachees
- modale de creation

### Actions visibles

- relire le registre
- exporter Excel
- exporter PDF / impression
- selectionner une organisation
- activer le contexte organisation
- lire les ecoles rattachees
- ouvrir l'administration des ecoles de l'organisation
- pour les acteurs mutationnels :
  - creer une organisation
  - pre-remplir le renommage
  - renommer
  - activer
  - desactiver

### Actions interdites

- aucune mutation `ORG-01` pour les profils lecture seule
- aucune declaration libre de `creePar` ou `modifiePar`
- aucune mutation locale d'ecole depuis cette vue

### Vues secondaires ouvertes

- [SCR-ORG-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-ORG-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md) par navigation de module, pas par mutation `ORG-01`

### Composants majeurs

- `OrganizationRegistryToolbar`
- `OrganizationRegistryTable`
- `OrganizationProjectionPanel`
- `OrganizationCreationModal`
- `ModalShell`
- `PageHeader`
- `SectionBlock`
- `EmptyState`
- `ErrorState`
- `LoadingState`

### Etats obligatoires

- chargement du registre
- registre vide
- aucune organisation visible
- lecture seule
- non autorise
- succes mutationnel
- erreur technique

### Contraintes de perimetre

- niveau `PLATEFORME`
- jamais une simple gouvernance locale d'ecole
- `OPERATEUR_SYSTEME` seulement si la delegation applicative `ORG-01` existe effectivement

### Routes frontend concernees

- `/app/organisation/ecoles`

### Sources backend

- `POST /api/organisations`
- `GET /api/organisations`
- `PATCH /api/organisations/:id/renommer`
- `POST /api/organisations/:id/activer`
- `POST /api/organisations/:id/desactiver`
- `GET /api/organisations/:id/ecoles`
- `PUT /api/auth/contexte/organisation-active`

### Implementation frontend reelle

- vue :
  - [OrganizationRegistryView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/OrganizationRegistryView.vue)
- viewmodel :
  - [useOrganizationRegistryViewModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/viewmodels/useOrganizationRegistryViewModel.ts)
- route :
  - [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/routes.ts)

### Notes d'UX

- la colonne `Promoteur` doit lire en priorite `promoteurPrincipal.nomComplet` quand il est provisionne
- si aucun promoteur principal explicite n'est encore rattache, la colonne retombe sur `creePar` comme trace d'audit lisible
- le formulaire de creation ne doit jamais melanger les deux concepts :
  - `creePar` reste impose par le contexte authentifie
  - `promoteurPrincipal` reste un bloc metier optionnel de provisionnement initial
- le registre ouvre maintenant une vraie page detaillee et une vraie page d'edition, au lieu d'absorber toute la lecture dans la seule ligne de tableau

## Ecran `SCR-ORG-003`

### Page parente

- voir organisation

### Vue parente

- vue detail organisation

### Module

- `Organisation`

### Section

- registre organisationnel

### Objectif metier

Permettre la lecture premium, routee et complete d'une organisation, avec ses informations generales reelles, son promoteur principal lisible, ses compteurs d'ecoles et la supervision de ses ecoles rattachees.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions

- `referentiel.read`
- doctrine frontend :
  - `organization.detail.read`

### Donnees attendues

- detail organisation :
  - `GET /api/organisations/:id`
- indicateurs complementaires :
  - `GET /api/organisations/:id/indicateurs`
- historique organisationnel :
  - `GET /api/organisations/:id/historique`
- ecoles rattachees :
  - `GET /api/organisations/:id/ecoles`

### Actions visibles

- retour registre
- ouvrir la page de modification
- activer / desactiver l'organisation
- activer le contexte organisationnel

### Actions interdites

- aucune edition libre de `typeOrganisation`
- aucune edition libre de `description`
- aucune edition du `promoteurPrincipal`

### Routes frontend concernees

- `/app/organisation/organisations/:idOrganisation`

### Implementation frontend reelle

- vue :
  - [OrganizationDetailView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/OrganizationDetailView.vue)
- viewmodel :
  - [useOrganizationDetailViewModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/viewmodels/useOrganizationDetailViewModel.ts)

### Notes d'implementation

- la fiche detail enrichit maintenant la lecture avec :
  - le nombre d'utilisateurs actifs de l'organisation
  - l'etat du compte du responsable principal si son `utilisateurId` existe
  - les modules organisationnels autorises et les modules effectifs des ecoles via `shared/configuration`
  - une timeline organisationnelle reelle alimentee par `audit_logs`, avec fallback propre sur la creation historisee dans l'agregat pour les anciennes organisations
- la colonne du registre affiche desormais `Responsable` comme libelle ecran, tout en conservant la source backend `promoteurPrincipal` comme proprietaire metier de l'organisation

## Ecran `SCR-ORG-004`

### Page parente

- modifier organisation

### Vue parente

- vue formulaire borne

### Module

- `Organisation`

### Section

- registre organisationnel

### Objectif metier

Materieliser une page de modification premium sans inventer de mutation nouvelle, en bornant l'edition au renommage deja prouve par `PATCH /api/organisations/:id/renommer`.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions

- `referentiel.write`
- doctrine frontend :
  - `organization.write`

### Donnees attendues

- `GET /api/organisations/:id`
- `PATCH /api/organisations/:id/renommer`

### Actions visibles

- modifier le nom
- annuler
- enregistrer les modifications
- retourner vers `Voir organisation`

### Actions interdites

- modifier le promoteur principal
- modifier le type d'organisation
- modifier la description

### Routes frontend concernees

- `/app/organisation/organisations/:idOrganisation/modifier`

### Implementation frontend reelle

- vue :
  - [OrganizationEditView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/OrganizationEditView.vue)
- viewmodel :
  - [useOrganizationEditViewModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/viewmodels/useOrganizationEditViewModel.ts)

## Ecran `SCR-ORG-005`

### Page parente

- ecoles rattachees

### Vue parente

- vue liste organisation -> ecoles

### Module

- `Organisation`

### Section

- registre organisationnel

### Objectif metier

Permettre la lecture dediee, premium et progressive des seules ecoles rattachees a une organisation donnee, sans melanger cette vue avec le registre global des organisations ni avec l'administration locale d'ecole.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Permissions

- `referentiel.read`
- doctrine frontend :
  - `organization.schools.read`

### Donnees attendues

- `GET /api/organisations/:id`
- `GET /api/organisations/:id/ecoles`

### Actions visibles

- retour a l'organisation
- retour au registre
- creer une ecole par pont vers `ADM-01`
- voir une ecole rattachee
- configurer une ecole via les routes reelles de configuration ecole
- activer / desactiver une ecole
- ouvrir l'ecole dans son espace de travail

### Actions interdites

- aucune invention de modules, sections ou statuts non fournis
- aucune pagination numerotee

### Routes frontend concernees

- `/app/organisation/organisations/:idOrganisation/ecoles`

### Implementation frontend reelle

- vue :
  - [OrganizationAttachedSchoolsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/OrganizationAttachedSchoolsView.vue)
- viewmodel :
  - [useOrganizationAttachedSchoolsViewModel.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/viewmodels/useOrganizationAttachedSchoolsViewModel.ts)

## Ecran `SCR-ORG-006`

### Page parente

- detail ecole organisation

### Vue parente

- vue detail et pont de descente

### Module

- `Organisation`

### Section

- registre organisationnel

### Objectif metier

Permettre la lecture detaillee d'une ecole rattachee a une organisation, puis la descente propre vers l'administration locale ou les premiers workflows d'exploitation.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`

### Preconditions de visibilite

- session AUTH valide
- module `Organisation` actif
- identifiant d'ecole present dans la route
- capacite de lecture systeme ou organisationnelle sur l'ecole cible

### Permissions

- lecture de l'ecole cible dans le bon perimetre
- pour la descente :
  - changement de contexte organisation / ecole autorise

### Donnees attendues

- ecole cible
- organisation porteuse
- informations institutionnelles de l'ecole
- contexte shell courant

### Donnees affichees

- identite de l'ecole
- mode d'exploitation
- etat
- coordonnees et informations institutionnelles
- bloc de promotion du contexte
- tuiles d'ouverture des premiers workflows ecole

### Actions visibles

- retour registre
- activer l'organisation dans le contexte
- activer l'ecole dans le contexte
- ouvrir l'administration locale de l'ecole
- ouvrir :
  - inscription scolaire
  - familles
  - perception de paiement
  - analyse pedagogique

### Actions interdites

- aucune mutation `ADM-01` directe sur cette vue
- aucune mutation `ORG-01` directe sur cette vue
- aucune edition des informations institutionnelles

### Vues secondaires ouvertes

- [SCR-ORG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-ORG-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-ORG-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/49-contrats-ecran-organisation.md)
- [SCR-SCO-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md)
- [SCR-PF-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md)
- [SCR-PED-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md)

### Composants majeurs

- `PageHeader`
- `SectionBlock`
- `EmptyState`
- `ErrorState`
- `LoadingState`
- cartes KPI d'identite
- cartes d'ouverture de workflow

### Etats obligatoires

- chargement ecole
- aucune ecole chargee
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole cible coherente avec l'organisation relue
- descente borne a l'organisation puis a l'ecole active
- jamais une mutation locale implicite

### Routes frontend concernees

- `/app/organisation/ecoles/:idEcole`

### Sources backend

- `GET /api/ecoles/:id`
- `GET /api/organisations/:id/ecoles`
- `PUT /api/auth/contexte/organisation-active`
- `PUT /api/auth/contexte/ecole-active`

### Implementation frontend reelle

- vue :
  - [OrganizationSchoolDetailView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/views/OrganizationSchoolDetailView.vue)
- route :
  - [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/organisation/routes.ts)

### Notes d'UX

- cet ecran n'est pas un detail d'organisation
- c'est un detail d'ecole rattachee ouvre depuis le registre organisationnel
- il sert de pont vers l'exploitation ecole sans redefinir le shell

## Route De Pont - Configuration Organisationnelle

La route suivante existe dans le module `Organisation` :

- `/app/organisation/configuration`

Mais elle ne doit pas recevoir un nouveau contrat `SCR-ORG-*`.

La fermeture correcte consiste a relier cette route au contrat deja existant :

- [SCR-CFG-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md)

Lecture officielle :

- route de module `Organisation`
- vue de configuration
- workflow principal `CFG-ORG-01`
- pas un ecran natif supplementaire de `ORG-01`

## Verdict

Le module `Organisation` est maintenant ferme au niveau doctrine ecran avec les conclusions suivantes :

- `ORG-01` est bien materielise en ecran registre mutationnel
- le centre organisation est documente comme centre de travail
- le detail route existe maintenant :
  - au niveau `organisation autonome`
  - et au niveau `ecole rattachee`
- la page `Modifier organisation` reste volontairement bornee au renommage, seule mutation generale reellement exposee
- la route de configuration est explicitement reliee a `SCR-CFG-002`
- aucun nouvel ecran n'a ete invente sans preuve backend :
  - les nouvelles pages s'appuient sur `GET /api/organisations/:id`
  - et `PATCH /api/organisations/:id/renommer`

Le statut de cloture retenu est :

- module `Organisation` : fige, documente et pret a etre implemente sans interpretation metier nouvelle
