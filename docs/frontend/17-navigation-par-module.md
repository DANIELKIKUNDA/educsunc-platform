# Phase 17 - Navigation Frontend Par Module

## Statut

Ce document ouvre la cartographie officielle de navigation frontend par module pour EduSync.

Il ne cree aucun nouveau module.

Il ne cree aucun nouveau workflow.

Il ne cree encore aucune vue finale.

Il structure seulement, par module :

- le niveau proprietaire
- les acteurs positifs
- les workflows rattaches
- les sections de navigation legitimes
- les pages d'entree candidates
- les exclusions officielles

Ce document doit etre lu comme la projection modulaire des workflows reels deja figes.

## Sources De Verite

Cette cartographie s'appuie exclusivement sur :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)
- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

Le backend reste la source ultime de verite.

## Regles De Lecture

1. Un module visible ne donne jamais automatiquement acces a toutes ses sections.
2. Une section de module doit etre justifiee par un workflow reel ou une famille de workflows reels figes.
3. Une page candidate doit rester rattachee a un objectif metier identifiable.
4. Les modules transverses ne doivent pas etre reinterpretes comme modules metier d'ecole.
5. Les modules doivent rester filtres par `permission + perimetre + activation`.
6. Les centres de travail d'un acteur restent la projection croisee de plusieurs modules, pas l'inverse.

## Structure Officielle Retenue

La navigation par module sera lue selon ce canevas :

1. proprietaire du module
2. acteurs positifs
3. familles de workflows rattachees
4. sections legitimement ouvrables
5. pages d'entree candidates
6. exclusions officielles

## Module `Academique`

Niveau proprietaire :

- plateforme
- ecole pour l'exploitation academique locale

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` seulement sur delegations explicites
- `ADMIN_SYSTEME_ECOLE` pour `ACA-03` a `ACA-07`

Workflows rattaches :

- `ACA-03`
- `ACA-04`
- `ACA-05`
- `ACA-06`
- `ACA-07`
- `ACA-08`
- `ACA-09`

Sections legitimement ouvrables :

- referentiels
- programmes
- publications
- activation
- comparaisons
- migrations
- annees scolaires locales
- classes pedagogiques
- responsables de classe
- calendrier academique local
- programmes niveau locaux

Pages d'entree candidates :

- publier un referentiel
- activer une version
- importer un referentiel
- comparer deux versions
- lire le referentiel officiel
- executer la migration referentielle
- piloter les annees scolaires locales
- administrer les classes pedagogiques
- gerer le responsable officiel d une classe pedagogique
- cadrer le calendrier academique local
- piloter le programme niveau local

Exclusions :

- pas de projection de `ACA-03` a `ACA-07` sur `ADMINISTRATEUR_ECOLE`
- pas de projection comme module de saisie pedagogique

Sources :

- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)

## Module `Pedagogique`

Niveau proprietaire :

- ecole
- section
- classe selon workflow

Acteurs positifs :

- `ENSEIGNANT`
- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

Workflows rattaches :

- `PED-01` a `PED-08`

Sections legitimement ouvrables :

- fiches de bulletins
- bulletins
- proclamations
- statistiques
- classement
- conduite
- analyses de resultats
- diagnostics

Pages d'entree candidates :

- encoder une fiche
- generer un bulletin
- generer une proclamation
- consulter les statistiques de classe
- consulter les classements
- encoder la conduite
- ouvrir le centre d'analyse pedagogique

Exclusions :

- pas de caisse
- pas de lecture ecole globale par simple `bulletins.read`
- pas de proclamation pour `ENSEIGNANT` simple non titulaire

Sources :

- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)

## Module `Scolarite`

Niveau proprietaire :

- ecole
- section selon workflow

Acteurs positifs :

- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `DIRECTEUR_DISCIPLINE` seulement sur la suspension

Workflows rattaches :

- `SCO-01`
- `SCO-02`
- `SCO-03`
- `SCO-04`
- `SCO-05`
- `SCO-06`

Sections legitimement ouvrables :

- inscription
- eleves
- familles
- parcours eleve
- affectations
- cycle de vie eleve

Pages d'entree candidates :

- inscription scolaire complete
- consulter / gerer eleves
- consulter / gerer familles
- suspendre un eleve
- abandonner, transferer, reactiver, declarer deces
- consulter / gerer affectations

Exclusions :

- `CAISSIER` n'ouvre pas toutes les actions de cycle de vie
- `DIRECTEUR_DISCIPLINE` ne doit voir que la suspension
- `ADMINISTRATEUR_ECOLE` n'est pas un acteur local positif par heritage

Sources :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)

## Module `Paiements et facturation`

Niveau proprietaire :

- ecole
- organisation pour la supervision
- utilisateur pour certaines lectures parent

Acteurs positifs :

- `CAISSIER`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `PARENT`
- `TITULAIRE` selon delegation locale
- `PREFET_ETUDES` selon delegation locale
- `DIRECTEUR_ETUDES` selon delegation locale
- `DIRECTEUR_PRIMAIRE` selon delegation locale
- `DIRECTEUR_MATERNELLE` selon delegation locale
- `SECRETAIRE` seulement sur l'exoneration si delegation explicite

Workflows rattaches :

- `PF-01` a `PF-19`

Sections legitimement ouvrables :

- perception
- caisse
- historique paiements
- dette et situation financiere
- recus
- rapports et analyses
- parametres paiement
- tarification
- exonerations

Pages d'entree candidates :

- enregistrer un paiement
- ouvrir / cloturer caisse
- consulter caisse du jour
- consulter historique paiements
- consulter situation financiere
- reimprimer un recu
- consulter les recus emis
- rapports par caissier
- rapports par type de frais
- gerer exonerations
- gerer parametres paiement
- gerer grilles de tarification

Exclusions :

- `ADMINISTRATEUR_ECOLE` n'est pas implicitement caissier
- `PREFET_ETUDES`, `DIRECTEUR_PRIMAIRE`, `DIRECTEUR_MATERNELLE` ne sont jamais percepteurs universels
- `PARENT` reste borne a ses enfants autorises
- `SECRETAIRE` ne doit jamais recevoir un shell financier general

Sources :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [16-navigation-par-acteur.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/16-navigation-par-acteur.md)

## Module `Administration ecole`

Niveau proprietaire :

- plateforme sur la preuve workflow actuellement figee

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture selon capacite effective

Workflows rattaches :

- `ADM-01`

Sections legitimement ouvrables :

- administration ecoles
- lecture / mutation d'administration selon permissions effectives

Pages d'entree candidates :

- consulter une ecole
- administrer une ecole

Exclusions :

- ne pas projeter ce module comme un simple module `ADMINISTRATEUR_ECOLE`
- ne pas le confondre avec la gouvernance locale d'ecole

Sources :

- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)

## Module `Organisation`

Niveau proprietaire :

- plateforme pour le workflow fige
- usage organisationnel en projection metier

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` seulement sur delegation explicite
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` selon sous-espaces de lecture

Workflows rattaches :

- `ORG-01`
- lectures organisationnelles liees a `AUD-01`, `CFG-ORG-01`, `NOTIF-02`

Sections legitimement ouvrables :

- administration organisation
- supervision ecoles
- configuration organisationnelle
- audit organisationnel

Pages d'entree candidates :

- consulter / administrer une organisation
- piloter les ecoles de l'organisation
- configurer les modules autorises
- consulter l'audit organisationnel

Exclusions :

- pas de projection comme module purement ecole
- pas de mutation implicite pour `GESTIONNAIRE_ORGANISATION`

Sources :

- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Module `Plateforme`

Niveau proprietaire :

- plateforme

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` sur delegations explicites

Workflows rattaches :

- `PLT-01`
- `PLT-02`
- `PLT-03`
- `PLT-04`
- `PLT-05`

Sections legitimement ouvrables :

- publication referentiel
- activation referentiel
- import referentiel
- comparaison referentiel
- lecture referentiel officiel

Pages d'entree candidates :

- publier
- activer
- importer
- comparer
- lire

Exclusions :

- `SUPPORT_SYSTEME` ne doit pas voir les mutations plateforme
- pas de projection ecole locale

Sources :

- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)

## Module `Audit`

Niveau proprietaire :

- transverse
- declinaisons plateforme, organisation, ecole

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`
- `PROMOTEUR_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION`
- `ADMINISTRATEUR_ECOLE`
- `ADMIN_SYSTEME_ECOLE`
- acteurs pedagogiques selon `AUD-04`

Workflows rattaches :

- `SHD-AUD-01`
- `AUD-01`
- `AUD-02`
- `AUD-03`
- `AUD-04`

Sections legitimement ouvrables :

- audit plateforme
- audit organisationnel
- audit administratif et financier ecole
- audit technique ecole
- audit pedagogique

Pages d'entree candidates :

- consulter audit plateforme
- consulter audit organisation
- consulter audit ecole
- consulter audit pedagogique

Exclusions :

- `AUD-05` ne doit pas etre projete comme workflow distinct
- `AUD-06` reste absorbe par `SHD-AUD-01`

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

## Module `Monitoring`

Niveau proprietaire :

- plateforme

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME`

Workflows rattaches :

- `MON-01` a `MON-17`

Sections legitimement ouvrables :

- etat systeme
- dashboard monitoring
- observabilite
- incidents
- alertes
- diagnostics
- capacite
- traces

Pages d'entree candidates :

- etat systeme
- incidents
- alertes
- diagnostics
- capacite
- traces

Exclusions :

- pas de projection ecole locale
- pas de mutation de support quand la preuve ne donne qu'une lecture

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Module `Configuration`

Niveau proprietaire :

- transverse avec sous-niveaux plateforme, organisation, ecole, utilisateur

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` en lecture
- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE` selon cles autorisees
- utilisateur final pour `CFG-USER-01`

Workflows rattaches :

- `CFG-03`
- `CFG-04`
- `CFG-05`
- `CFG-PLAT-01`
- `CFG-ORG-01`
- `CFG-ECOLE-SYS-01`
- `CFG-ECOLE-METIER-01`
- `CFG-ECOLE-METIER-02`
- `CFG-USER-01`

Sections legitimement ouvrables :

- runtime plateforme
- politiques organisationnelles
- modules ecole
- branding ecole
- notifications ecole
- preferences utilisateur

Pages d'entree candidates :

- config runtime
- config organisation
- config modules ecole
- branding
- config notifications
- preferences utilisateur

Exclusions :

- ne pas melanger mutation technique et mutation metier locale
- `USER` ne gouverne jamais les modules ou la licence

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)

## Module `Notifications`

Niveau proprietaire :

- transverse avec declinaisons organisation, ecole, technique locale

Acteurs positifs :

- `ADMIN_SYSTEME_ECOLE`
- `ADMINISTRATEUR_ECOLE`
- `PROMOTEUR_ORGANISATION`
- `ADMIN_SYSTEME_ORGANISATION`
- `GESTIONNAIRE_ORGANISATION` en lecture
- acteurs pedagogiques et ecole deja prouves pour les envois locaux autorises

Workflows rattaches :

- `NOTIF-01`
- `NOTIF-02`

Sections legitimement ouvrables :

- diffusion ecole
- supervision organisationnelle
- timeline locale
- escalades
- retry / replay techniques

Pages d'entree candidates :

- envoyer une notification locale
- consulter l'historique / timeline
- superviser les notifications organisationnelles
- relancer une operation technique locale

Exclusions :

- `ADMINISTRATEUR_ECOLE` ne porte pas les operations techniques `retry` et `replay`
- pas de projection du `TITULAIRE` comme acteur principal du module

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Module `Security`

Niveau proprietaire :

- plateforme

Acteurs positifs :

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` seulement si les permissions security lui sont explicitement attribuees

Workflows rattaches :

- `SEC-01`
- `SEC-02`
- `SEC-03`
- `SEC-04`

Sections legitimement ouvrables :

- gouvernance roles
- gouvernance permissions
- changement de contexte
- lecture security transverse

Pages d'entree candidates :

- consulter la gouvernance security
- gerer les permissions / roles
- relire le contexte actif

Exclusions :

- ne pas reinterpretrer `shared/security` comme workflow metier local d'ecole

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Module `Utilisateur / Personnel`

Niveau proprietaire :

- utilisateur

Acteurs positifs :

- `PARENT`
- tout utilisateur final pour ses preferences autorisees

Workflows rattaches :

- `CFG-USER-01`
- lectures parent deja figees dans `PF-*` et certaines expositions pedagogiques

Sections legitimement ouvrables :

- preferences personnelles
- espace parent
- lectures personnelles autorisees

Pages d'entree candidates :

- mes preferences
- historique des paiements de mes enfants
- situation financiere de mes enfants
- resultats / bulletins autorises

Exclusions :

- pas de mutation metier ecole
- pas de gouvernance transverse

Sources :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Verdict

La navigation frontend par module est maintenant lisible comme une projection stable des workflows reels figes, sans invention de nouveaux domaines ni de nouvelles pages metier.

La suite officielle la plus propre devient :

- routes et pages frontend par module
- puis vues frontend
- puis composants et contrats d'ecran

Cette phase est maintenant ouverte dans :

- [18-pages-et-routes-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/18-pages-et-routes-frontend.md)
