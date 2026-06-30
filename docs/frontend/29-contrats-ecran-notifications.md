# Phase 29 - Contrats D'Ecran Notifications

## Statut

Ce document ouvre les contrats d'ecran reels du module `Notifications`.

Statut d'implementation frontend au `30/06/2026` :

- routes frontend reelles branchees
- vues `SCR-NOTIF-001` a `SCR-NOTIF-005` materialisees
- services, store, models et mappers dedies ajoutes dans `frontend/src/domains/notifications`
- build frontend validee apres branchement

Il couvre les workflows deja figes :

- `NOTIF-01`
- `NOTIF-02`

Il ne cree aucun nouveau workflow backend.

Il projette en frontend les familles d'usage deja prouvees :

- diffusion locale ecole
- lecture et timeline locale
- supervision organisationnelle
- operations techniques locales

La suite naturelle de cette phase est l'ouverture des contrats d'ecran du module `Security` dans [30-contrats-ecran-security.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/30-contrats-ecran-security.md).

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

1. Le module `Notifications` ne doit pas etre reduit a un simple formulaire d'envoi.
2. Les notifications locales et la supervision organisationnelle doivent rester dans des ecrans separes.
3. `ADMINISTRATEUR_ECOLE` peut gouverner la communication locale, mais ne porte pas les operations techniques `retry` et `replay`.
4. `ADMIN_SYSTEME_ECOLE` porte les operations techniques locales de notifications.
5. `GESTIONNAIRE_ORGANISATION` reste en lecture quand la preuve ne lui donne pas une mutation.
6. Les notifications automatiques remontees depuis les BC metier doivent rester visibles dans le meme perimetre ecole que les notifications manuelles.

## Ecran `SCR-NOTIF-001`

### Page parente

- envoyer une notification locale

### Vue parente

- vue diffusion ecole

### Module

- `Notifications`

### Section

- diffusion locale

### Objectif metier

Permettre l'emission de notifications locales d'ecole dans le perimetre autorise.

### Acteur principal

- `ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `ADMIN_SYSTEME_ECOLE`
- acteurs pedagogiques et ecole deja prouves pour les envois locaux autorises

### Preconditions de visibilite

- session AUTH valide
- module notifications actif
- contexte ecole actif
- permission locale d'emission disponible

### Donnees attendues

- destinataires ou cibles locales
- canaux disponibles
- message a diffuser
- metadonnees de notification

### Donnees affichees

- formulaire d'envoi
- canaux actifs
- contexte ecole courant
- resume avant envoi

### Actions visibles

- composer une notification
- envoyer
- consulter le detail d'une notification creee

### Actions masquees ou interdites

- pas de `retry`
- pas de `replay`
- pas de supervision organisationnelle

### Etats obligatoires

- loading
- preconditions non remplies
- succes d'emission
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement

### Composants majeurs attendus

- formulaire de diffusion
- selecteurs de canal
- resume de contexte
- confirmation d'emission

### Routes frontend candidates

- `/notifications/ecole/envoyer`

### Sources backend

- `NOTIF-01`

### Implementation frontend reelle

- route: `/app/notifications/ecole/envoyer`
- vue: [NotificationsSchoolComposeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolComposeView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)

## Ecran `SCR-NOTIF-002`

### Page parente

- historique et timeline des notifications locales

### Vue parente

- vue liste et timeline

### Module

- `Notifications`

### Section

- lecture locale

### Objectif metier

Permettre la lecture unifiee des notifications locales manuelles et automatiques d'une ecole.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- `ADMINISTRATEUR_ECOLE`

### Preconditions de visibilite

- session AUTH valide
- module notifications actif
- contexte ecole actif
- permissions locales de lecture

### Donnees attendues

- liste des notifications
- detail d'une notification
- timeline locale
- monitoring local

### Donnees affichees

- table des notifications
- detail d'une notification
- timeline d'evenements
- signaux de monitoring local

### Actions visibles

- filtrer
- ouvrir un detail
- consulter la timeline
- accuser reception
- escalader

### Actions masquees ou interdites

- pas de supervision multi-organisations
- pas d'operations techniques avancees pour `ADMINISTRATEUR_ECOLE`

### Etats obligatoires

- loading
- aucune notification
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- notifications manuelles et automatiques du meme perimetre local

### Composants majeurs attendus

- table des notifications
- panneau detail
- composant timeline
- cartes monitoring local

### Routes frontend candidates

- `/notifications/ecole`
- `/notifications/ecole/:idNotification`

### Sources backend

- `NOTIF-01`

### Implementation frontend reelle

- routes:
  - `/app/notifications/ecole`
  - `/app/notifications/ecole/:idNotification`
- vue: [NotificationsSchoolCenterView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolCenterView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)

## Ecran `SCR-NOTIF-003`

### Page parente

- operations techniques notifications locales

### Vue parente

- vue exploitation technique

### Module

- `Notifications`

### Section

- retry replay dead-letter

### Objectif metier

Permettre l'exploitation technique locale des notifications en echec ou a rejouer.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- session AUTH valide
- module notifications actif
- contexte ecole actif
- permissions `notifications.retry.*`, `notifications.replay.*` ou `notifications.dead-letter.read`

### Donnees attendues

- dead-letter locale
- historiques de retry
- diagnostics de replay

### Donnees affichees

- notifications en echec
- historique des retries
- diagnostic de replay
- etat d'une relance technique

### Actions visibles

- consulter dead-letter
- lancer un retry
- consulter les retries
- lancer un replay
- consulter le diagnostic de replay

### Actions masquees ou interdites

- pas d'ouverture a `ADMINISTRATEUR_ECOLE`
- pas de lecture organisationnelle globale

### Etats obligatoires

- loading
- aucune notification en echec
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- exploitation technique locale uniquement

### Composants majeurs attendus

- table dead-letter
- journal des retries
- panneau diagnostic
- actions techniques securisees

### Routes frontend candidates

- `/notifications/ecole/operations`
- `/notifications/ecole/dead-letter`

### Sources backend

- `NOTIF-01`

### Implementation frontend reelle

- routes:
  - `/app/notifications/ecole/operations`
  - `/app/notifications/ecole/dead-letter`
- vue: [NotificationsSchoolOperationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolOperationsView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)

## Ecran `SCR-NOTIF-004`

### Page parente

- supervision notifications organisationnelles

### Vue parente

- vue supervision organisation

### Module

- `Notifications`

### Section

- supervision organisationnelle

### Objectif metier

Permettre la supervision consolidee des notifications d'une organisation et de ses ecoles.

### Acteur principal

- `PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`

### Preconditions de visibilite

- session AUTH valide
- module notifications actif
- contexte organisation actif
- permissions organisationnelles adequates

### Donnees attendues

- archives notifications
- vue tenant organisationnelle
- escalades
- capacites temps reel

### Donnees affichees

- historiques consolides
- vue par ecole
- escalades organisationnelles
- capacites de publication temps reel

### Actions visibles

- filtrer par ecole
- ouvrir une escalade
- consulter les archives
- consulter le tenant
- consulter les capacites temps reel

### Actions masquees ou interdites

- pas d'operations techniques locales d'ecole
- `GESTIONNAIRE_ORGANISATION` reste lecture seule sur le bloc temps reel

### Etats obligatoires

- loading
- aucune notification
- non autorise
- erreur technique

### Contraintes de perimetre

- organisation active uniquement

### Composants majeurs attendus

- dashboard organisationnel
- listes consolidees
- detail escalade
- bloc capacites temps reel

### Routes frontend candidates

- `/notifications/organisation`
- `/notifications/organisation/escalades`

### Sources backend

- `NOTIF-02`

### Implementation frontend reelle

- routes:
  - `/app/notifications/organisation`
  - `/app/notifications/organisation/escalades`
- vue: [NotificationsOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)

## Ecran `SCR-NOTIF-005`

### Page parente

- test de publication temps reel organisationnel

### Vue parente

- vue outillage organisation

### Module

- `Notifications`

### Section

- temps reel organisationnel

### Objectif metier

Permettre un test controle de publication temps reel au niveau organisationnel.

### Acteur principal

- `PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `ADMIN_SYSTEME_ORGANISATION`

### Preconditions de visibilite

- session AUTH valide
- module notifications actif
- contexte organisation actif
- permission `notifications.realtime.publish`

### Donnees attendues

- capacites de publication
- parametres de test
- resultat de publication

### Donnees affichees

- capacites temps reel
- formulaire de test
- resultat du test

### Actions visibles

- consulter les capacites
- publier un test

### Actions masquees ou interdites

- pas de mutation ecole locale
- pas de publication pour `GESTIONNAIRE_ORGANISATION`

### Etats obligatoires

- loading
- non autorise
- succes de publication
- erreur technique

### Contraintes de perimetre

- organisation active uniquement

### Composants majeurs attendus

- panneau capacites
- formulaire de test
- retour d'execution

### Routes frontend candidates

- `/notifications/organisation/realtime`

### Sources backend

- `NOTIF-02`

### Implementation frontend reelle

- route: `/app/notifications/organisation/realtime`
- vue: [NotificationsOrganizationRealtimeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationRealtimeView.vue)
- definition de route: [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)

## Verdict

Le module `Notifications` dispose maintenant d'une premiere couche officielle de contrats d'ecran frontend, alignee sur la separation deja figee entre ecole locale, exploitation technique locale et supervision organisationnelle.

La materialisation frontend reelle est maintenant en place dans :

- [frontend/src/domains/notifications/routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/routes.ts)
- [frontend/src/domains/notifications/views/ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/ModuleHomeView.vue)
- [frontend/src/domains/notifications/views/NotificationsSchoolComposeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolComposeView.vue)
- [frontend/src/domains/notifications/views/NotificationsSchoolCenterView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolCenterView.vue)
- [frontend/src/domains/notifications/views/NotificationsSchoolOperationsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsSchoolOperationsView.vue)
- [frontend/src/domains/notifications/views/NotificationsOrganizationView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationView.vue)
- [frontend/src/domains/notifications/views/NotificationsOrganizationRealtimeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/views/NotificationsOrganizationRealtimeView.vue)
- [frontend/src/domains/notifications/services/notifications.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/services/notifications.api.ts)
- [frontend/src/domains/notifications/stores/notifications.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/stores/notifications.store.ts)
- [frontend/src/domains/notifications/models/notifications.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/models/notifications.model.ts)
- [frontend/src/domains/notifications/mappers/notifications.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/notifications/mappers/notifications.mapper.ts)

La regle de protection a conserver est la suivante :

- une notification se lit et se pilote dans le bon perimetre
- les operations techniques locales ne doivent jamais etre masqueees derriere la simple gouvernance metier ecole
