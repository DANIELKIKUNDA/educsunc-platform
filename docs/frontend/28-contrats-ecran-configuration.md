# Phase 28 - Contrats D'Ecran Configuration

## Statut

Ce document ouvre les contrats d'ecran reels du module `Configuration`.

Statut d'implementation frontend au `30/06/2026` :

- routes frontend reelles branchees
- vues `SCR-CFG-001` a `SCR-CFG-006` materialisees
- services, stores, models et mappers dedies ajoutes dans `frontend/src/domains/configuration`
- build frontend validee apres branchement

Il couvre les workflows deja figes :

- `CFG-03`
- `CFG-04`
- `CFG-05`
- `CFG-PLAT-01`
- `CFG-ORG-01`
- `CFG-ECOLE-SYS-01`
- `CFG-ECOLE-METIER-01`
- `CFG-ECOLE-METIER-02`
- `CFG-USER-01`

Il ne cree pas de nouvelle regle metier.

Il projette seulement en frontend la doctrine deja figee :

- plateforme
- organisation
- ecole systeme
- ecole metier
- utilisateur

La suite naturelle de cette phase est l'ouverture des contrats d'ecran du module `Notifications` dans [29-contrats-ecran-notifications.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/29-contrats-ecran-notifications.md).

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. Une cle de configuration a toujours un niveau proprietaire reel.
2. Le frontend ne doit jamais fusionner dans un meme ecran des mutations de niveaux incompatibles.
3. `SUPPORT_SYSTEME` reste un lecteur, pas un gouverneur implicite.
4. `GESTIONNAIRE_ORGANISATION` reste en lecture quand la preuve ne lui donne pas une mutation.
5. `ADMINISTRATEUR_ECOLE` et `ADMIN_SYSTEME_ECOLE` doivent rester distincts.
6. `USER` ne gouverne jamais modules, licence ou runtime.
7. Les actions de lock, unlock, snapshots, compare, propagate, validate et reload doivent rester visibles seulement dans les familles qui les portent reellement.

## Ecran `SCR-CFG-001`

### Page parente

- configuration runtime plateforme

### Vue parente

- vue gouvernance technique

### Module

- `Configuration`

### Section

- runtime plateforme

### Objectif metier

Permettre le pilotage des configurations runtime globales, avec leur cycle de vie technique complet.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- contexte plateforme actif
- permissions runtime adequates selon l'action

### Donnees attendues

- configurations `SYSTEM`
- valeurs effectives runtime
- etat de verrouillage
- snapshots et comparaisons

### Donnees affichees

- catalogue de cles runtime
- detail d'une configuration
- historique de snapshots
- resultat de validation
- etat de reload ou propagation

### Actions visibles

- creer
- lire
- modifier
- supprimer
- verrouiller
- deverrouiller
- valider
- creer un snapshot
- comparer des snapshots
- propager
- recharger
- consulter la valeur effective

### Actions masquees ou interdites

- pas de projection comme configuration d'ecole
- pas de mutation pour `SUPPORT_SYSTEME`

### Etats obligatoires

- loading
- aucune configuration
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement
- niveau proprietaire `SYSTEM`

### Composants majeurs attendus

- table de configurations
- panneau detail
- editeur de valeur
- centre de snapshots
- bandeau de validation

### Routes frontend candidates

- `/configuration/plateforme/runtime`

### Sources backend

- `CFG-PLAT-01`

### Implementation frontend reelle

- route: `/app/configuration/plateforme/runtime`
- vue: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Ecran `SCR-CFG-002`

### Page parente

- configuration organisationnelle

### Vue parente

- vue gouvernance organisation

### Module

- `Configuration`

### Section

- politiques organisationnelles

### Objectif metier

Permettre a l'organisation de gerer ses politiques communes et les modules autorises pour ses ecoles.

### Acteur principal

- `PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` en lecture

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- contexte organisation actif
- permissions organisationnelles adequates

### Donnees attendues

- configurations `ORGANIZATION`
- modules autorises
- etat de verrouillage
- snapshots et comparaisons

### Donnees affichees

- politiques organisationnelles
- detail d'une configuration
- ecoles impactees
- vue effective organisationnelle

### Actions visibles

- creer
- lire
- modifier
- supprimer
- verrouiller
- deverrouiller
- valider
- creer un snapshot
- comparer des snapshots
- propager
- consulter la valeur effective
- definir les modules autorises

### Actions masquees ou interdites

- pas de mutation plateforme
- pas de mutation pour `GESTIONNAIRE_ORGANISATION`

### Etats obligatoires

- loading
- aucune configuration
- non autorise
- erreur technique

### Contraintes de perimetre

- organisation active uniquement
- niveau proprietaire `ORGANIZATION`

### Composants majeurs attendus

- table de politiques
- panneau detail
- carte des modules autorises
- centre snapshots

### Routes frontend candidates

- `/configuration/organisation`
- `/configuration/organisation/modules`

### Sources backend

- `CFG-03`
- `CFG-ORG-01`

### Implementation frontend reelle

- routes:
  - `/app/configuration/organisation`
  - `/app/configuration/organisation/modules`
- vue: [ConfigurationOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationOrganizationView.vue)
- vue mutualisee: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Ecran `SCR-CFG-003`

### Page parente

- modules ecole

### Vue parente

- vue activation locale

### Module

- `Configuration`

### Section

- modules ecole

### Objectif metier

Permettre a l'ecole de gerer ses modules actifs dans le cadre autorise par l'organisation et de relire la resolution effective.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- contexte ecole actif
- permissions locales adequates

### Donnees attendues

- modules actives ecole
- modules autorises par l'organisation
- etat effectif des modules
- raisons de blocage ou d'heritage

### Donnees affichees

- liste de modules
- statut actif / inactif
- provenance de la regle
- resolution effective

### Actions visibles

- activer ou desactiver dans la portee autorisee
- consulter les modules effectifs
- consulter la configuration heritee

### Actions masquees ou interdites

- pas de mutation directe d'une configuration `SYSTEM`
- pas de mutation directe d'une configuration `ORGANIZATION`

### Etats obligatoires

- loading
- aucun module configure
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- niveau proprietaire `SCHOOL`
- heredite depuis organisation a respecter

### Composants majeurs attendus

- grille des modules
- badges d'etat effectif
- panneau provenance / heritage

### Routes frontend candidates

- `/configuration/ecole/modules`

### Sources backend

- `CFG-04`
- `CFG-05`
- `CFG-ECOLE-SYS-01`

### Implementation frontend reelle

- route: `/app/configuration/ecole/modules`
- vue: [ConfigurationSchoolModulesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolModulesView.vue)
- vue mutualisee: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Ecran `SCR-CFG-004`

### Page parente

- branding ecole

### Vue parente

- vue identite documentaire

### Module

- `Configuration`

### Section

- branding ecole

### Objectif metier

Permettre la gestion de l'identite documentaire locale de l'ecole.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- contexte ecole actif
- cle `branding.*` autorisee

### Donnees attendues

- configurations `branding.*`
- valeurs effectives de branding
- etat de verrouillage

### Donnees affichees

- logo
- sigle
- couleurs documentaires
- entetes
- signataires affichables

### Actions visibles

- creer
- lire
- modifier
- verrouiller
- deverrouiller
- valider
- creer un snapshot
- comparer des snapshots
- propager
- consulter la valeur effective

### Actions masquees ou interdites

- pas de pilotage runtime
- pas de gouvernance modules depuis cet ecran

### Etats obligatoires

- loading
- aucune configuration
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- prefixe `branding.`

### Composants majeurs attendus

- formulaire branding
- apercu documentaire
- centre snapshots

### Routes frontend candidates

- `/configuration/ecole/branding`

### Sources backend

- `CFG-ECOLE-METIER-01`

### Implementation frontend reelle

- route: `/app/configuration/ecole/branding`
- vue: [ConfigurationSchoolBrandingView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolBrandingView.vue)
- vue mutualisee: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Ecran `SCR-CFG-005`

### Page parente

- notifications ecole

### Vue parente

- vue politique de communication

### Module

- `Configuration`

### Section

- notifications ecole

### Objectif metier

Permettre le parametrage local des templates, quotas et options de communication de l'ecole.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- contexte ecole actif
- cle `notifications.*` autorisee

### Donnees attendues

- templates actifs
- quotas
- fenetres de diffusion
- options de communication

### Donnees affichees

- liste des templates
- parametres de quotas
- horaires silencieux
- resume des canaux actifs

### Actions visibles

- creer
- lire
- modifier
- verrouiller
- deverrouiller
- valider
- creer un snapshot
- comparer des snapshots
- propager
- recharger
- consulter la valeur effective

### Actions masquees ou interdites

- pas de gouvernance plateforme
- pas de preferences utilisateur globales depuis cet ecran

### Etats obligatoires

- loading
- aucune configuration
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- prefixe `notifications.`

### Composants majeurs attendus

- table des templates
- editeur de quotas
- bandeau de canaux
- centre snapshots

### Routes frontend candidates

- `/configuration/ecole/notifications`

### Sources backend

- `CFG-ECOLE-METIER-02`

### Implementation frontend reelle

- route: `/app/configuration/ecole/notifications`
- vue: [ConfigurationSchoolNotificationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolNotificationsView.vue)
- vue mutualisee: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Ecran `SCR-CFG-006`

### Page parente

- preferences utilisateur

### Vue parente

- vue compte personnel

### Module

- `Configuration`

### Section

- preferences utilisateur

### Objectif metier

Permettre a l'utilisateur final de gerer ses preferences personnelles autorisees.

### Acteur principal

- utilisateur final

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- session AUTH valide
- module configuration actif
- utilisateur proprietaire de la preference

### Donnees attendues

- preferences personnelles
- valeurs effectives utilisateur

### Donnees affichees

- options de compte
- preferences de notification
- options d'experience utilisateur

### Actions visibles

- creer
- lire
- modifier
- consulter la valeur effective

### Actions masquees ou interdites

- aucune gouvernance modules
- aucune gouvernance licence
- aucun lock ou propagate

### Etats obligatoires

- loading
- aucune preference
- non autorise
- erreur technique

### Contraintes de perimetre

- utilisateur courant uniquement
- niveau proprietaire `USER`

### Composants majeurs attendus

- formulaire de preferences
- resume de preferences actives

### Routes frontend candidates

- `/moi/preferences`
- `/configuration/utilisateur/preferences`

### Sources backend

- `CFG-USER-01`

### Implementation frontend reelle

- routes:
  - `/app/moi/preferences`
  - `/app/configuration/utilisateur/preferences`
- vue: [ConfigurationUserPreferencesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationUserPreferencesView.vue)
- vue mutualisee: [ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)

## Verdict

Le module `Configuration` dispose maintenant d'une premiere couche officielle de contrats d'ecran frontend, alignee sur la doctrine deja figee par niveau proprietaire.

La materialisation frontend reelle est maintenant en place dans :

- [frontend/src/domains/configuration/routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/routes.ts)
- [frontend/src/domains/configuration/views/ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ModuleHomeView.vue)
- [frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationWorkspaceView.vue)
- [frontend/src/domains/configuration/views/ConfigurationOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationOrganizationView.vue)
- [frontend/src/domains/configuration/views/ConfigurationSchoolModulesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolModulesView.vue)
- [frontend/src/domains/configuration/views/ConfigurationSchoolBrandingView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolBrandingView.vue)
- [frontend/src/domains/configuration/views/ConfigurationSchoolNotificationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationSchoolNotificationsView.vue)
- [frontend/src/domains/configuration/views/ConfigurationUserPreferencesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/views/ConfigurationUserPreferencesView.vue)
- [frontend/src/domains/configuration/services/configuration.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/services/configuration.api.ts)
- [frontend/src/domains/configuration/stores/configuration-center.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/stores/configuration-center.store.ts)
- [frontend/src/domains/configuration/stores/configuration-modules.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/configuration/stores/configuration-modules.store.ts)

La regle de protection a conserver est la suivante :

- un ecran de configuration ne se definit pas par le mot `configuration`
- il se definit par le niveau reel de la cle, l'acteur autorise et le perimetre de mutation ou de lecture
