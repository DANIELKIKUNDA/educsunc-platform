# Phase 30 - Contrats D'Ecran Security

## Statut

Ce document ouvre les contrats d'ecran reels du module `Security`.

Statut d'implementation frontend au `30/06/2026` :

- routes frontend reelles branchees
- vues `SCR-SEC-001` a `SCR-SEC-004` materialisees
- services, store, models et mappers dedies ajoutes dans `frontend/src/domains/security`
- build frontend validee apres branchement

Il couvre les workflows deja figes :

- `SEC-01`
- `SEC-02`
- `SEC-03`
- `SEC-04`

Il ne cree aucun nouveau workflow backend.

Il projette uniquement en frontend les familles deja prouvees :

- gouvernance des roles et permissions
- gouvernance des affectations, scopes et titulariats
- diagnostic des permissions, scopes et acces
- audit security transverse

La suite naturelle de cette phase est la synthese globale de cloture des contrats d'ecran dans [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md).

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

1. `Security` reste un module plateforme.
2. Les acteurs `ECOLE` et `ORGANISATION` ne doivent jamais voir ces ecrans par simple heritage de permissions generiques.
3. `OPERATEUR_SYSTEME` ne devient acteur positif que sur delegation explicite.
4. `shared/security` ne doit pas etre reinterprete comme un workflow metier d'affectation scolaire ou de titulariat pedagogique.
5. Le changement de contexte utilisateur courant reste porte par `AUTH`, pas par `Security`.

## Ecran `SCR-SEC-001`

### Page parente

- gouvernance roles et permissions

### Vue parente

- vue administration security

### Module

- `Security`

### Section

- roles permissions

### Objectif metier

Permettre la gouvernance plateforme des roles, permissions et restrictions security.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` sur delegation explicite

### Preconditions de visibilite

- session AUTH valide
- module security actif
- contexte plateforme actif
- permissions de gouvernance security adequates

### Donnees attendues

- liste des roles
- etat actif ou inactif des roles
- permissions rattachees
- restrictions attachees

### Donnees affichees

- table des roles
- detail d'un role
- permissions du role
- restrictions du role

### Actions visibles

- lister les roles
- creer un role
- activer un role
- desactiver un role
- consulter les permissions d'un role
- ajouter une permission
- retirer une permission
- ajouter une restriction
- retirer une restriction

### Actions masquees ou interdites

- pas de projection ecole ou organisation
- pas d'ouverture si la delegation `OPERATEUR_SYSTEME` n'est pas prouvee

### Etats obligatoires

- loading
- aucun role
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- table de roles
- fiche detail role
- gestionnaire de permissions
- gestionnaire de restrictions

### Routes frontend candidates

- `/security/roles`
- `/security/roles/:codeRole`

### Sources backend

- `SEC-01`

### Implementation frontend reelle

- routes:
  - `/app/security/roles`
  - `/app/security/roles/:codeRole`
- vue: [SecurityRolesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityRolesView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)

## Ecran `SCR-SEC-002`

### Page parente

- gouvernance affectations scopes titulariats

### Vue parente

- vue administration des acces

### Module

- `Security`

### Section

- affectations scopes titulariats

### Objectif metier

Permettre la gouvernance transverse des affectations utilisateurs, de leurs scopes et des titulariats exposes par `shared/security`.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` sur delegation explicite

### Preconditions de visibilite

- session AUTH valide
- module security actif
- contexte plateforme actif
- permissions `utilisateurs.read` et `utilisateurs.write`

### Donnees attendues

- affectations utilisateur
- scopes de l'affectation
- titulariats exposes

### Donnees affichees

- table des affectations
- detail d'une affectation
- scopes rattaches
- informations de titulariat

### Actions visibles

- creer une affectation
- activer une affectation
- desactiver une affectation
- ajouter un scope
- retirer un scope
- consulter les affectations d'un utilisateur
- consulter les scopes d'un utilisateur
- creer un titulariat
- supprimer un titulariat
- consulter un titulariat

### Actions masquees ou interdites

- ne pas presenter cet ecran comme gestion metier des classes
- ne pas projeter ici les workflows scolaires ou pedagogiques qui reutilisent localement `shared/security`

### Etats obligatoires

- loading
- aucune affectation
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement
- gouvernance brute transverse uniquement

### Composants majeurs attendus

- table des affectations
- panneau scopes
- panneau titulariats
- fiche utilisateur security

### Routes frontend candidates

- `/security/affectations`
- `/security/affectations/utilisateurs/:idUtilisateur`
- `/security/titulariats`

### Sources backend

- `SEC-02`

### Implementation frontend reelle

- routes:
  - `/app/security/affectations`
  - `/app/security/affectations/utilisateurs/:idUtilisateur`
  - `/app/security/titulariats`
- vue: [SecurityAssignmentsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAssignmentsView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)

## Ecran `SCR-SEC-003`

### Page parente

- verification permissions scopes acces

### Vue parente

- vue diagnostic

### Module

- `Security`

### Section

- verification security

### Objectif metier

Permettre le diagnostic transverse des permissions, scopes, restrictions et acces.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` sur delegation explicite

### Preconditions de visibilite

- session AUTH valide
- module security actif
- contexte plateforme actif
- permission `permissions.read`

### Donnees attendues

- charge utile de verification
- reponse de verification des permissions
- reponse de verification des scopes
- reponse de verification des restrictions
- reponse de verification des acces

### Donnees affichees

- formulaires de verification
- resultats de diagnostic
- motifs de refus ou d'autorisation

### Actions visibles

- verifier permissions
- verifier scopes
- verifier restrictions
- verifier acces

### Actions masquees ou interdites

- pas de changement de contexte utilisateur
- pas de mutation brute de roles ou d'affectations depuis cet ecran

### Etats obligatoires

- loading
- formulaire vide
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement
- diagnostic transverse

### Composants majeurs attendus

- formulaires de verification
- panneau resultat
- bloc motifs et details

### Routes frontend candidates

- `/security/verifications`

### Sources backend

- `SEC-03`

### Implementation frontend reelle

- route: `/app/security/verifications`
- vue: [SecurityChecksView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityChecksView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)

## Ecran `SCR-SEC-004`

### Page parente

- audit security transverse

### Vue parente

- vue journal et refus

### Module

- `Security`

### Section

- audit security

### Objectif metier

Permettre la lecture transverse des journaux security, des refus et des acces controles.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME` si `audit.security.read` lui est explicitement attribuee

### Preconditions de visibilite

- session AUTH valide
- module security actif
- contexte plateforme actif
- permission `audit.security.read`

### Donnees attendues

- logs security
- refus security
- acces security controles

### Donnees affichees

- journal security
- liste des refus
- liste des acces
- detail d'un evenement

### Actions visibles

- filtrer
- consulter les logs
- consulter les refus
- consulter les acces
- ouvrir un detail

### Actions masquees ou interdites

- pas de lecture ecole locale
- pas de mutation depuis l'ecran d'audit

### Etats obligatoires

- loading
- aucune trace
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- table des logs
- table des refus
- table des acces
- panneau detail

### Routes frontend candidates

- `/security/audit`

### Sources backend

- `SEC-04`

### Implementation frontend reelle

- route: `/app/security/audit`
- vue: [SecurityAuditView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAuditView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)

## Verdict

Le module `Security` dispose maintenant d'une premiere couche officielle de contrats d'ecran frontend, alignee sur sa vraie nature de gouvernance et de diagnostic plateforme.

La materialisation frontend reelle est maintenant en place dans :

- [frontend/src/domains/security/routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/routes.ts)
- [frontend/src/domains/security/views/ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/ModuleHomeView.vue)
- [frontend/src/domains/security/views/SecurityRolesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityRolesView.vue)
- [frontend/src/domains/security/views/SecurityAssignmentsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAssignmentsView.vue)
- [frontend/src/domains/security/views/SecurityChecksView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityChecksView.vue)
- [frontend/src/domains/security/views/SecurityAuditView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/views/SecurityAuditView.vue)
- [frontend/src/domains/security/services/security.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/services/security.api.ts)
- [frontend/src/domains/security/stores/security.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/stores/security.store.ts)
- [frontend/src/domains/security/models/security.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/models/security.model.ts)
- [frontend/src/domains/security/mappers/security.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/security/mappers/security.mapper.ts)

La regle de protection a conserver est la suivante :

- `shared/security` gouverne le socle transverse
- les workflows metier ecole, pedagogiques, scolaires et financiers continuent a reutiliser ce socle sans etre remplaces par ces ecrans plateforme
