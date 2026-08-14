# Phase 27 - Contrats D'Ecran Audit

## Statut

Ce document ouvre les contrats d'ecran reels du module `Audit`.

Il couvre les familles deja figees dans les workflows :

- `SHD-AUD-01`
- `AUD-01`
- `AUD-02`
- `AUD-03`
- `AUD-04`

Il ne cree pas de nouveau workflow backend.

Il traduit uniquement en ecrans frontend la doctrine deja figee :

- audit plateforme
- audit organisationnel
- audit administratif et financier ecole
- audit technique ecole
- audit pedagogique

La suite naturelle de cette phase est l'ouverture des contrats d'ecran du module `Configuration` dans [28-contrats-ecran-configuration.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/28-contrats-ecran-configuration.md).

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

1. Le module `Audit` reste transverse ; seul l'ecran Plateforme est global, les autres ecrans restent bornes a leur perimetre explicite.
2. Chaque ecran d'audit doit rester borne a une famille d'audit precise.
3. `AUD-05` ne doit pas etre projete comme ecran distinct.
4. `AUD-06` reste absorbe par `SHD-AUD-01`.
5. Une lecture audit n'accorde jamais une mutation implicite.
6. Le frontend doit faire apparaitre clairement le niveau de perimetre :
   - plateforme
   - organisation
   - ecole
   - pedagogique borne a l'objet metier
7. Une entree ou action interdite est absente ; une indisponibilite metier temporaire peut seule rester visible et expliquee.
8. Menus, routes, onglets, actions et appels Audit consomment la meme projection de capacites effectives.

## Ecran `SCR-AUD-001`

### Page parente

- audit plateforme

### Vue parente

- vue liste et timeline

### Module

- `Audit`

### Section

- audit plateforme

### Objectif metier

Permettre aux acteurs plateforme de consulter les traces d'audit techniques exposees au niveau global.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions de visibilite

- session AUTH valide
- module audit actif
- permissions `audit.read`, `audit.timeline.read` ou `audit.history.read`
- contexte plateforme actif
- aucune organisation ni ecole active requise

### Donnees attendues

- liste d'audits
- timeline d'audit
- historique d'audit

### Donnees affichees

- table des evenements d'audit
- detail d'un audit
- timeline chronologique
- historique filtre
- synthese du lot PostgreSQL actuellement charge, sans statistique fabriquee
- exports demandes pendant la session courante
- archives logiques accessibles
- resultats des controles d'integrite executes

### Actions visibles

- filtrer
- ouvrir un detail
- basculer entre liste, timeline et historique
- charger la suite avec le curseur opaque retourne par le backend
- demander, suivre et telecharger un export selon `audit.export*`
- demander un export d'investigation selon `forensic.export`
- verifier puis reconstruire une projection selon `audit.replay`
- consulter ou archiver logiquement selon `audit.retention.*`
- verifier l'integrite selon `audit.security.read`

### Actions masquees ou interdites

- aucune mutation metier scolaire
- aucune action L5 sans la permission backend correspondante
- aucune suppression physique des evenements canoniques
- aucun replay forensic, le backend L5 ne le prend pas en charge
- ne pas presenter cet ecran comme audit ecole metier

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme
- scope `PLATEFORME`
- aucun filtre ne doit injecter artificiellement une ecole dans cette lecture globale

### Composants majeurs attendus

- barre de filtres
- table d'audit
- panneau detail
- composant timeline
- cockpit de synthese du lot
- centre des exports de la session
- operations controlees replay, conservation et integrite

### Routes frontend candidates

- `/audit/plateforme`
- `/audit/plateforme/evenements/:auditId` pour le deep-link de detail

### Sources backend

- `SHD-AUD-01`
- lectures L3 `GET /api/v1/audit*`
- operations L5 `/api/v1/exports/*`, `/api/v1/replay/*`, `/api/v1/retention/*`, `/api/v1/security/integrity/*`

### Limites explicites

- la pagination est uniquement keyset: le curseur reste opaque et seul le chargement suivant est propose
- aucun historique global des exports n'est invente; seuls les exports demandes dans la session courante sont suivis
- les routes forensic detaillees sont bornees au scope ecole dans le backend; le Centre Plateforme exploite la timeline globale et l'export forensic autorise
- le statut d'integrite affiche uniquement le dernier controle demande dans la session, faute de route de synthese globale
- la retention est un archivage logique et un apercu non destructif; aucune purge physique n'est exposee

## Ecran `SCR-AUD-002`

### Page parente

- audit organisationnel

### Vue parente

- vue supervision

### Module

- `Audit`

### Section

- audit organisationnel

### Objectif metier

Permettre la supervision organisationnelle des signaux d'audit consolides sur les ecoles de l'organisation active.

### Acteur principal

- `PROMOTEUR_ORGANISATION`

### Acteurs secondaires

- `GESTIONNAIRE_ORGANISATION`

### Preconditions de visibilite

- session AUTH valide
- module audit actif
- contexte organisation actif
- permission de lecture organisationnelle d'audit selon la vue demandee
- aucune ecole active requise

### Donnees attendues

- monitoring d'audit organisationnel
- analytics d'audit
- incidents de securite organisationnels

### Donnees affichees

- synthese par ecole
- tendances d'audit
- alertes ou incidents d'audit organisationnels

### Actions visibles

- filtrer par ecole
- changer la vue analytique
- ouvrir un incident ou une analyse

### Actions masquees ou interdites

- aucune mutation implicite
- pas de bascule vers audit plateforme

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- organisation uniquement
- les filtres d'ecole restent bornes aux ecoles de l'organisation active

### Composants majeurs attendus

- tableau de supervision multi-ecoles
- cartes analytiques
- liste incidents

### Routes frontend candidates

- `/audit/organisation`

### Sources backend

- `AUD-01`

## Ecran `SCR-AUD-003`

### Page parente

- audit administratif et financier ecole

### Vue parente

- vue liste et historique

### Module

- `Audit`

### Section

- audit administratif et financier

### Objectif metier

Permettre la lecture locale de l'audit administratif et financier borne a l'ecole active.

### Acteur principal

- `ADMINISTRATEUR_ECOLE`

### Acteurs secondaires

- `CAISSIER`

### Preconditions de visibilite

- session AUTH valide
- module audit actif
- permission `audit.finance.read`
- contexte ecole actif
- acteur `CAISSIER` accepte lorsque sa projection effective porte cette permission, le module Audit et un scope compatible avec l'ecole active

### Donnees attendues

- liste d'audits financiers
- historique d'audit financier
- timeline financiere

### Donnees affichees

- evenements financiers traces
- historique chronologique
- details administratifs ou financiers utiles

### Actions visibles

- filtrer
- consulter historique
- consulter timeline
- ouvrir un detail

### Actions masquees ou interdites

- aucun acces a l'audit pedagogique ou technique depuis cet ecran
- aucune mutation

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- famille d'audit `FINANCIER` uniquement

### Composants majeurs attendus

- table d'evenements
- onglets liste / historique / timeline
- panneau detail

### Routes frontend candidates

- `/audit/ecole/administratif-financier`

### Sources backend

- `AUD-02`

## Ecran `SCR-AUD-004`

### Page parente

- audit technique ecole

### Vue parente

- vue traces et metriques

### Module

- `Audit`

### Section

- audit technique ecole

### Objectif metier

Permettre a l'acteur systeme local de consulter les traces et metriques techniques de son ecole, sans ouvrir le monitoring global plateforme.

### Acteur principal

- `ADMIN_SYSTEME_ECOLE`

### Acteurs secondaires

- aucun

### Preconditions de visibilite

- session AUTH valide
- module audit actif
- permission `audit.technical.read`
- contexte ecole actif

### Donnees attendues

- traces techniques locales
- metriques techniques locales

### Donnees affichees

- table de traces
- indicateurs techniques de l'ecole
- details techniques d'execution

### Actions visibles

- filtrer
- alterner traces et metriques
- ouvrir un detail technique

### Actions masquees ou interdites

- pas d'acces au monitoring global
- pas d'acces a la gouvernance ecole non technique

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- ecole active uniquement
- technique local uniquement

### Composants majeurs attendus

- table de traces
- cartes de metriques
- panneau de detail technique

### Routes frontend candidates

- `/audit/ecole/technique`

### Sources backend

- `AUD-03`

## Ecran `SCR-AUD-005`

### Page parente

- audit pedagogique

### Vue parente

- vue detaillee par objet metier

### Module

- `Audit`

### Section

- audit pedagogique

### Objectif metier

Permettre aux acteurs pedagogiques autorises de relire les traces d'audit des cotes, de la conduite, des bulletins et des classements dans leur vrai perimetre metier.

### Acteur principal

- `ENSEIGNANT` avec capacite derivee de titulariat effectif

### Acteurs secondaires

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`

### Preconditions de visibilite

- session AUTH valide
- module audit actif
- route ouverte depuis un objet pedagogique reel
- permission pedagogique requise
- perimetre resolvable depuis l'objet demande
- pour un enseignant, titulariat effectif confirme sur la classe et l'annee scolaire de l'objet

### Donnees attendues

- audit des cotes
- audit de conduite
- audit des bulletins
- audit des classements

### Donnees affichees

- journal d'actions pedagogiques
- identite acteur
- horodatage
- type d'action
- contexte metier de l'objet

### Actions visibles

- ouvrir depuis une fiche, un bulletin, un resultat ou un classement
- filtrer par type d'action
- consulter le detail d'un evenement

### Actions masquees ou interdites

- pas d'ecran pedagogique global hors objet
- pas d'ouverture implicite pour un `ENSEIGNANT` sans titulariat effectif sur l'objet
- pas de lecture disciplinaire globale hors voie conduite

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- objet pedagogique reel obligatoire
- classe, section, ecole et annee scolaire resolues depuis l'objet

### Composants majeurs attendus

- bandeau contexte objet
- table d'audit pedagogique
- detail evenement
- filtres par action

### Routes frontend candidates

- `/audit/pedagogique/cotes`
- `/audit/pedagogique/conduite`
- `/audit/pedagogique/bulletins`
- `/audit/pedagogique/classements`

### Sources backend

- `AUD-04`

## Verdict

Le module `Audit` dispose maintenant d'une premiere couche officielle de contrats d'ecran frontend, alignee sur les familles de workflows deja figees.

La regle essentielle a conserver est la suivante :

- il n'existe pas un ecran unique `consulter les audits`
- il existe plusieurs ecrans d'audit, chacun borne par un acteur, une permission et un perimetre reel
