# Phase 26 - Contrats D'Ecran Monitoring

## Statut

Ce document ouvre les premiers contrats d'ecran reels du module `Monitoring`.

Il couvre les ecrans les plus structurants deja figes dans les workflows `MON-*` :

- etat systeme
- tableau de bord monitoring
- observabilite
- incidents
- alertes
- diagnostics
- capacite
- traces

Ce document doit etre lu comme la declinaison concrete des contrats d'ecran sur le module transverse `Monitoring`.

La suite naturelle de cette phase est l'ouverture des contrats d'ecran du module `Audit` dans [27-contrats-ecran-audit.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/27-contrats-ecran-audit.md).

## Sources De Verite

Ce document s'appuie exclusivement sur :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
- [19-vues-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/19-vues-frontend.md)
- [20-composants-ui.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/20-composants-ui.md)
- [21-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/21-contrats-ecran.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. `Monitoring` reste un module plateforme.
2. Les acteurs positifs restent `MANAGER_SYSTEME`, `OPERATEUR_SYSTEME` et `SUPPORT_SYSTEME`, selon la nature lecture/mutation du workflow.
3. `SUPPORT_SYSTEME` ne doit jamais etre promu en acteur mutationnel quand la preuve figee ne lui donne qu'une lecture.
4. Les ecrans monitoring ne doivent pas etre reinterpretes comme audits d'ecole ni comme dashboards metier scolaires.
5. Les workflows `MON-*` doivent rester distingues des workflows `AUD-*`.

## Ecran `SCR-MON-001`

### Page parente

- etat systeme

### Vue parente

- vue dashboard

### Module

- `Monitoring`

### Section

- etat systeme

### Objectif metier

Permettre la lecture synthetique de l'etat general de la plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions de visibilite

- module monitoring actif
- acteur plateforme autorise

### Donnees attendues

- etat global
- signaux de sante principaux
- indicateurs critiques

### Donnees affichees

- statut global
- KPI de sante
- signaux prioritaires

### Actions visibles

- rafraichir
- ouvrir une section de detail

### Actions masquees ou interdites

- aucune mutation implicite depuis un ecran purement de lecture

### Etats obligatoires

- loading
- aucune donnee
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- bandeau statut global
- grille KPI
- cartes de signaux

### Sources backend

- `MON-01`

## Ecran `SCR-MON-002`

### Page parente

- tableau de bord monitoring

### Vue parente

- vue centre de travail / dashboard

### Module

- `Monitoring`

### Section

- dashboard monitoring

### Objectif metier

Offrir une vue consolidée des signaux monitoring pour le pilotage plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions de visibilite

- module monitoring actif
- acteur plateforme autorise

### Donnees attendues

- etat systeme
- incidents ouverts
- alertes
- diagnostics utiles
- capacites

### Donnees affichees

- resume multi-blocs
- incidents du moment
- alertes recentes
- capacites / saturation utiles

### Actions visibles

- filtrer
- ouvrir les sections de detail

### Actions masquees ou interdites

- ne pas transformer le dashboard en panneau mutationnel generique

### Etats obligatoires

- loading
- dashboard vide
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- dashboard shell
- blocs KPI
- listes d'incidents / alertes

### Sources backend

- `MON-02`

## Ecran `SCR-MON-003`

### Page parente

- observabilite

### Vue parente

- vue analyse

### Module

- `Monitoring`

### Section

- observabilite

### Objectif metier

Permettre la lecture des signaux d'observabilite de la plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions de visibilite

- module monitoring actif
- lecture observabilite autorisee

### Donnees attendues

- metriques
- regroupements d'observabilite
- signaux de comportement

### Donnees affichees

- syntheses observabilite
- repartitions
- points de surveillance

### Actions visibles

- filtrer
- changer l'angle de lecture

### Actions masquees ou interdites

- mutation implicite

### Etats obligatoires

- loading
- aucune mesure
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- graphiques / tableaux observabilite
- filtres temporels

### Sources backend

- `MON-03`

## Ecran `SCR-MON-004`

### Page parente

- sante systeme

### Vue parente

- vue lecture / diagnostic

### Module

- `Monitoring`

### Section

- sante systeme

### Objectif metier

Permettre la lecture de la sante de la plateforme et de ses signaux techniques prioritaires.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

### Preconditions de visibilite

- module monitoring actif
- lecture health autorisee

### Donnees attendues

- etat de sante
- snapshots health
- signaux critiques

### Donnees affichees

- statut health
- details de sante
- alertes liees

### Actions visibles

- rafraichir
- ouvrir un diagnostic detaille

### Actions masquees ou interdites

- mutation implicite

### Etats obligatoires

- loading
- snapshot absent
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- carte health
- liste des checks

### Sources backend

- `MON-04`

## Ecran `SCR-MON-005`

### Page parente

- incidents

### Vue parente

- vue liste / mutation

### Module

- `Monitoring`

### Section

- incidents

### Objectif metier

Permettre la lecture, l'ouverture et l'escalade des incidents selon les workflows reels.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- module monitoring actif
- lecture ou mutation incident autorisee

### Donnees attendues

- liste incidents
- statuts
- severites
- details utiles

### Donnees affichees

- incidents ouverts / recents
- niveau de severite
- statut d'escalade

### Actions visibles

- consulter
- ouvrir un incident
- escalader un incident

### Actions masquees ou interdites

- mutation pour `SUPPORT_SYSTEME` si non prouvee

### Etats obligatoires

- loading
- aucun incident
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- tableau incidents
- detail incident
- panneau action escalation

### Sources backend

- `MON-05`
- `MON-06`
- `MON-07`

## Ecran `SCR-MON-006`

### Page parente

- alertes

### Vue parente

- vue liste / mutation

### Module

- `Monitoring`

### Section

- alertes

### Objectif metier

Permettre la lecture, la creation et la resolution des alertes dans la bonne gouvernance plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- module monitoring actif
- lecture ou mutation alerte autorisee

### Donnees attendues

- alertes actives
- severite
- source
- etat de resolution

### Donnees affichees

- liste alertes
- details de severite
- statut de resolution

### Actions visibles

- consulter
- creer une alerte
- resoudre une alerte

### Actions masquees ou interdites

- creation / resolution pour `SUPPORT_SYSTEME` si non prouvee

### Etats obligatoires

- loading
- aucune alerte
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- tableau alertes
- detail alerte
- panneau d'action

### Sources backend

- `MON-08`
- `MON-09`
- `MON-10`

## Ecran `SCR-MON-007`

### Page parente

- diagnostics

### Vue parente

- vue analyse / action

### Module

- `Monitoring`

### Section

- diagnostics

### Objectif metier

Permettre la lecture et la generation de diagnostics monitoring.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- module monitoring actif
- lecture ou generation diagnostic autorisee

### Donnees attendues

- diagnostics existants
- resultats de generation

### Donnees affichees

- liste / historique diagnostics
- detail d'un diagnostic

### Actions visibles

- consulter
- generer un diagnostic

### Actions masquees ou interdites

- generation pour `SUPPORT_SYSTEME` si non prouvee

### Etats obligatoires

- loading
- aucun diagnostic
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- liste diagnostics
- panneau detail
- action generation

### Sources backend

- `MON-11`
- `MON-12`

## Ecran `SCR-MON-008`

### Page parente

- capacite et saturation

### Vue parente

- vue analyse

### Module

- `Monitoring`

### Section

- capacite

### Objectif metier

Permettre la lecture des capacites et le calcul de saturation de la plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- module monitoring actif
- lecture / calcul capacite autorise

### Donnees attendues

- capacites
- calculs de saturation
- metriques utiles

### Donnees affichees

- indicateurs capacite
- niveaux de saturation
- details de tendance

### Actions visibles

- consulter
- calculer la capacite
- calculer la saturation

### Actions masquees ou interdites

- calcul pour `SUPPORT_SYSTEME` si non prouve

### Etats obligatoires

- loading
- aucune mesure
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- KPI capacite
- blocs saturation
- filtres temporels

### Sources backend

- `MON-13`
- `MON-14`
- `MON-15`

## Ecran `SCR-MON-009`

### Page parente

- traces

### Vue parente

- vue liste / action

### Module

- `Monitoring`

### Section

- traces

### Objectif metier

Permettre la lecture et la capture de traces dans la gouvernance monitoring plateforme.

### Acteur principal

- `MANAGER_SYSTEME`

### Acteurs secondaires

- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture

### Preconditions de visibilite

- module monitoring actif
- lecture / capture trace autorisee

### Donnees attendues

- traces disponibles
- metadonnees de capture

### Donnees affichees

- liste des traces
- detail d'une trace
- informations de capture

### Actions visibles

- consulter
- capturer une trace

### Actions masquees ou interdites

- capture pour `SUPPORT_SYSTEME` si non prouvee

### Etats obligatoires

- loading
- aucune trace
- non autorise
- erreur technique

### Contraintes de perimetre

- plateforme uniquement

### Composants majeurs attendus

- tableau traces
- detail trace
- action capture

### Sources backend

- `MON-16`
- `MON-17`

## Verdict

Le module `Monitoring` dispose maintenant d'un premier noyau de contrats d'ecran reels couvrant ses espaces principaux de lecture, pilotage et mutation plateforme.

## Statut d'implementation frontend au 30/06/2026

Les contrats `SCR-MON-001` a `SCR-MON-009` sont maintenant materialises en frontend reel, sans deviation par rapport aux workflows `MON-*` deja figes.

### Routes frontend reelles

- `SCR-MON-001` : `/app/monitoring/etat-systeme`
- `SCR-MON-002` : `/app/monitoring/dashboard`
- `SCR-MON-003` : `/app/monitoring/observabilite`
- `SCR-MON-004` : `/app/monitoring/sante`
- `SCR-MON-005` : `/app/monitoring/incidents`
- `SCR-MON-006` : `/app/monitoring/alertes`
- `SCR-MON-007` : `/app/monitoring/diagnostics`
- `SCR-MON-008` : `/app/monitoring/capacite`
- `SCR-MON-009` : `/app/monitoring/traces`

### Fichiers d'implementation reels

- [routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/routes.ts)
- [ModuleHomeView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/ModuleHomeView.vue)
- [MonitoringOverviewView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringOverviewView.vue)
- [MonitoringIncidentsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringIncidentsView.vue)
- [MonitoringAlertsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringAlertsView.vue)
- [MonitoringDiagnosticsView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringDiagnosticsView.vue)
- [MonitoringCapacityView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringCapacityView.vue)
- [MonitoringTracesView.vue](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/views/MonitoringTracesView.vue)
- [monitoring.api.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/services/monitoring.api.ts)
- [monitoring.store.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/stores/monitoring.store.ts)
- [monitoring.model.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/models/monitoring.model.ts)
- [monitoring.mapper.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/monitoring/mappers/monitoring.mapper.ts)

### Verification technique

- `npm run build` frontend : OK

### Verdict de cloture

- aucun ecran `monitoring` documente n'est reste au stade theorique
- aucune dette bloquante de branchement frontend n'est relevee sur `monitoring`
- la documentation et l'implementation reelle sont maintenant synchronisees

La suite la plus propre devient :

- ouvrir le lot suivant sur `Audit`
- ou ouvrir `Configuration`
