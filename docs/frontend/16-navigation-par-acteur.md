# Phase 16 - Navigation Frontend Par Acteur

## Statut

Ce document ouvre la cartographie officielle de navigation frontend par acteur pour EduSync.

Il ne cree aucun nouvel acteur.

Il ne cree aucun nouveau workflow.

Il ne cree encore aucune vue finale.

Il projette seulement, par acteur :

- les modules visibles
- les centres de travail prioritaires
- les sections de navigation legitimement ouvrables
- les pages d'entree candidates
- les exclusions de navigation a respecter

Ce document doit etre lu comme une projection de navigation a partir des workflows reels deja figes.

## Sources De Verite

Cette cartographie s'appuie exclusivement sur les sources deja figees :

- [00-doctrine-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/00-doctrine-frontend.md)
- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)
- [15-navigation-frontend.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/15-navigation-frontend.md)
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

Cette cartographie doit etre lue avec les regles suivantes :

1. Un acteur ne donne jamais a lui seul toute la navigation.
2. La visibilite reelle reste gouvernee par `permission + perimetre`.
3. Un module visible ne vaut pas ouverture automatique de toutes ses pages.
4. Les pages candidates listees ici devront encore etre precisees dans la phase routes/pages.
5. Une navigation non couverte par un workflow fige ne doit pas etre inventee.
6. `TITULAIRE` reste un acteur derive d'`ENSEIGNANT`, pas un role securite autonome.

## Niveaux Officiels

La navigation par acteur est structuree selon quatre niveaux :

- plateforme
- organisation
- ecole
- utilisateur / externe

## Matrice De Synthese

| Acteur | Niveau | Modules visibles prioritaires | Nature de navigation |
| --- | --- | --- | --- |
| `MANAGER_SYSTEME` | Plateforme | Plateforme, Monitoring, Security, Audit, Configuration | gouvernance complete |
| `OPERATEUR_SYSTEME` | Plateforme | Plateforme, Monitoring, Security, Audit, Configuration | gouvernance deleguee explicite |
| `SUPPORT_SYSTEME` | Plateforme | Monitoring, Audit, Configuration, lecture plateforme | support et lecture |
| `PROMOTEUR_ORGANISATION` | Organisation | Organisation, Audit organisation, Configuration organisation, supervision financiere | gouvernance organisationnelle |
| `ADMIN_SYSTEME_ORGANISATION` | Organisation | Organisation, Configuration organisation, Notifications organisation | administration systeme organisation |
| `GESTIONNAIRE_ORGANISATION` | Organisation | Audit organisation, supervision financiere, Configuration organisation en lecture, Notifications organisation | pilotage et lecture |
| `ADMIN_SYSTEME_ECOLE` | Ecole | Administration ecole, Configuration ecole systeme, Audit technique ecole, Notifications ecole | administration systeme locale |
| `ADMINISTRATEUR_ECOLE` | Ecole | Finance, Audit administratif et financier, Configuration metier ecole, Notifications ecole | gouvernance ecole non technique |
| `CAISSIER` | Ecole | Scolarite d'inscription, Eleves, Familles, Paiements et facturation | operationnel ecole |
| `SECRETAIRE` | Ecole | Finance locale deleguee tres limitee | delegation optionnelle |
| `ENSEIGNANT` | Ecole / Pedagogique | Pedagogique, lectures scolaires utiles, finances en lecture si exposees | usage pedagogique de base |
| `TITULAIRE` | Ecole / Pedagogique | Pedagogique, centre de classe, lectures financieres deleguees si autorisees | centre de classe titulaire |
| `PREFET_ETUDES` | Ecole / Pedagogique | Pedagogique secondaire, Scolarite secondaire, lectures financieres deleguees, Notifications ecole | supervision secondaire |
| `DIRECTEUR_ETUDES` | Ecole / Pedagogique | Pedagogique secondaire, Scolarite secondaire, lectures financieres deleguees, Notifications ecole | pilotage secondaire |
| `DIRECTEUR_DISCIPLINE` | Ecole / Pedagogique | Conduite, suspension scolaire, lecture disciplinaire absorbee dans l'audit pedagogique | discipline secondaire |
| `DIRECTEUR_PRIMAIRE` | Ecole / Pedagogique | Scolarite primaire, lectures et actions pedagogiques primaires, finances deleguees si autorisees | pilotage primaire |
| `DIRECTEUR_MATERNELLE` | Ecole / Pedagogique | Scolarite maternelle, lectures et actions pedagogiques maternelles, finances deleguees si autorisees | pilotage maternelle |
| `PARENT` | Utilisateur / Externe | Resultats autorises, historique paiements, situation financiere, preferences personnelles | lecture personnelle borne |
| `COMPTABLE` | Ecole | aucune navigation de premier rang officiellement figee a ce stade | acteur present sans cartographie workflow propre |

## Navigation Plateforme

## `MANAGER_SYSTEME`

Statut de navigation :

- acteur plateforme principal et naturel

Modules visibles prioritaires :

- `Plateforme`
- `Monitoring`
- `Security`
- `Audit`
- `Configuration`

Centres de travail prioritaires :

- centre referentiel plateforme
- centre monitoring plateforme
- centre gouvernance security
- centre audit plateforme
- centre runtime / configuration plateforme

Pages d'entree candidates :

- publication, activation, import, comparaison et lecture du referentiel officiel
- lecture et pilotage monitoring
- lecture security transverse
- lecture audit plateforme
- configuration runtime plateforme

Exclusions :

- ne doit pas recevoir de navigation ecole ou parent comme centre principal

Sources :

- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

## `OPERATEUR_SYSTEME`

Statut de navigation :

- acteur plateforme secondaire
- navigation positive seulement sur delegations explicites

Modules visibles prioritaires :

- `Plateforme`
- `Monitoring`
- `Security`
- `Audit`
- `Configuration`

Centres de travail prioritaires :

- exploitation plateforme
- supervision monitoring
- lecture / mutation plateforme explicitement deleguee

Regle critique :

- le frontend ne doit jamais rendre visibles des mutations plateforme non deleguees

Exclusions :

- pas de navigation mutationnelle implicite
- pas de navigation ecole par heritage de permissions generiques

Sources :

- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## `SUPPORT_SYSTEME`

Statut de navigation :

- acteur de support
- lecture prioritaire

Modules visibles prioritaires :

- `Monitoring`
- `Audit`
- `Configuration`

Navigation attendue :

- centres de lecture et de diagnostic
- support monitoring
- lecture configuration
- lecture audit

Exclusions :

- pas de navigation de gouvernance mutationnelle implicite
- pas d'ouverture automatique sur `PLT-*` mutations

Sources :

- [12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Navigation Organisation

## `PROMOTEUR_ORGANISATION`

Statut de navigation :

- acteur principal de gouvernance organisationnelle

Modules visibles prioritaires :

- `Organisation`
- `Audit`
- `Configuration`
- `Paiements et facturation`
- `Notifications`

Centres de travail prioritaires :

- centre organisation
- centre supervision des ecoles
- centre audit organisationnel
- centre configuration organisationnelle
- centre supervision financiere organisationnelle

Pages d'entree candidates :

- lecture / mutation organisation
- audit organisationnel
- consultation caisse multi-ecoles
- historique et situation financiere d'eleves via portee organisation
- configuration modules autorises par organisation
- supervision notifications organisationnelles

Exclusions :

- pas de projection comme acteur local de caisse
- pas de projection comme acteur pedagogique sectionnel

Sources :

- [11-workflows-organisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/11-workflows-organisation.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## `ADMIN_SYSTEME_ORGANISATION`

Statut de navigation :

- acteur systeme organisation

Modules visibles prioritaires :

- `Organisation`
- `Configuration`
- `Notifications`

Centres de travail prioritaires :

- administration systeme organisation
- configuration organisationnelle
- supervision temps reel / notifications organisationnelles

Exclusions :

- ne doit pas etre projete comme promoteur metier par defaut
- pas de centres pedagogiques ou caisse locale

Sources :

- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

## `GESTIONNAIRE_ORGANISATION`

Statut de navigation :

- acteur de pilotage et de lecture

Modules visibles prioritaires :

- `Audit`
- `Configuration`
- `Paiements et facturation`
- `Notifications`

Centres de travail prioritaires :

- supervision financiere organisationnelle
- audit organisationnel
- lecture configuration organisation
- lecture notifications organisation

Regle critique :

- la navigation doit afficher clairement les espaces de lecture sans les presenter comme mutations systeme

Sources :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## Navigation Ecole - Gouvernance Et Socle

## `ADMIN_SYSTEME_ECOLE`

Statut de navigation :

- acteur systeme local principal

Modules visibles prioritaires :

- `Administration ecole`
- `Configuration`
- `Audit`
- `Notifications`

Centres de travail prioritaires :

- administration systeme ecole
- configuration systeme ecole
- branding et identite documentaire
- audit technique ecole
- operations techniques notifications

Pages d'entree candidates :

- gestion technique locale
- configuration modules ecole
- branding et signataires
- lecture traces / metriques d'ecole
- retry / replay / supervision notifications locales

Exclusions :

- ne doit pas etre projete comme caissier local
- ne doit pas absorber la gouvernance finance d'`ADMINISTRATEUR_ECOLE`

Sources :

- [10-workflows-administration-ecole.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/10-workflows-administration-ecole.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## `ADMINISTRATEUR_ECOLE`

Statut de navigation :

- acteur de gouvernance ecole non technique

Modules visibles prioritaires :

- `Paiements et facturation`
- `Audit`
- `Configuration`
- `Notifications`

Centres de travail prioritaires :

- pilotage financier ecole
- supervision caisse et recettes
- audit administratif et financier
- configuration metier locale
- communications ecole autorisees

Pages d'entree candidates :

- caisse du jour
- lectures analytiques financieres
- exonerations
- parametres metier locaux autorises
- audit administratif et financier

Exclusions :

- pas d'ouverture implicite / fermeture implicite de caisse
- pas de reimpression de recu par simple heritage
- pas de role pedagogique de section

Sources :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [13-workflows-transverses.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/13-workflows-transverses.md)

## `CAISSIER`

Statut de navigation :

- acteur operationnel ecole principal pour l'inscription et la finance

Modules visibles prioritaires :

- `Scolarite`
- `Paiements et facturation`

Centres de travail prioritaires :

- centre inscription
- centre eleves et familles
- centre perception
- centre caisse
- centre recus
- centre dette et historique paiements

Pages d'entree candidates :

- inscription scolaire complete
- gestion eleves
- gestion familles
- enregistrer un paiement
- ouvrir caisse
- cloturer caisse
- consulter caisse du jour
- consulter recu / reimprimer selon workflow dedie
- consulter historique paiements d'un eleve
- consulter situation financiere d'un eleve
- analyses financieres locales

Exclusions :

- pas de navigation pedagogique principale
- pas de parcours abandon / suspension hors ses actions attestees

Sources :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)

## `SECRETAIRE`

Statut de navigation :

- acteur present
- navigation positive tres limitee et optionnelle

Navigation officielle retenue a ce stade :

- aucune navigation de module de premier rang propre
- un point d'entree local optionnel sur les exonerations seulement si l'ecole l'autorise explicitement

Regle critique :

- le frontend ne doit jamais projeter `SECRETAIRE` comme gestionnaire financier general

Sources :

- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## Navigation Ecole - Pedagogique Et Scolaire

## `ENSEIGNANT`

Statut de navigation :

- acteur pedagogique de base

Modules visibles prioritaires :

- `Pedagogique`
- lectures utiles de `Scolarite`
- lectures utiles de `Paiements et facturation` si exposees

Centres de travail prioritaires :

- centre d'encodage
- centre de lecture pedagogique
- centre de consultation de sa classe / de ses cours

Pages d'entree candidates :

- encoder fiche de bulletin
- consulter referentiel utile
- lire scolarite utile
- lire finances si exposees a l'acteur

Exclusions :

- pas de generation bulletin/proclamation sans titulariat effectif
- pas de lecture statistique globale d'ecole

Sources :

- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)

## `TITULAIRE`

Statut de navigation :

- acteur derive
- centre de travail plus riche que l'`ENSEIGNANT`

Modules visibles prioritaires :

- `Pedagogique`
- lectures utiles de `Paiements et facturation` si l'ecole l'autorise

Centres de travail prioritaires :

- centre de classe titulaire
- centre bulletin / proclamation
- centre analyses pedagogiques
- centre classement
- centre conduite

Pages d'entree candidates :

- generer bulletin
- generer proclamation
- consulter statistiques de classe
- consulter resultats consolides
- consulter echecs, echecs profonds, diagnostics, comparatifs
- encoder conduite
- consulter historique paiements ou dette d'un eleve de sa classe si delegation explicite

Regle critique :

- toute cette navigation depend d'un titulariat effectif sur la bonne classe et la bonne annee scolaire

Exclusions :

- pas de projection comme role brut autonome
- pas de lecture hors classe ou hors annee

Sources :

- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## `PREFET_ETUDES`

Statut de navigation :

- acteur de supervision secondaire

Modules visibles prioritaires :

- `Pedagogique`
- `Scolarite`
- lectures utiles de `Paiements et facturation`
- `Notifications`

Centres de travail prioritaires :

- supervision pedagogique secondaire
- cycle de vie eleve secondaire
- centre de consultation resultats
- centre de lecture financiere deleguee

Pages d'entree candidates :

- consulter resultats et statistiques de section
- consulter analyses pedagogiques autorisees
- actions scolaires secondaires attestees
- lecture historique paiements / situation financiere selon delegation locale
- perception deleguee de certains frais hors minerval selon politique ecole

Exclusions :

- pas de caisse generique
- pas de lecture ecole entiere par simple permission seule

Sources :

- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## `DIRECTEUR_ETUDES`

Statut de navigation :

- acteur de pilotage secondaire

Modules visibles prioritaires :

- `Pedagogique`
- `Scolarite`
- lectures utiles de `Paiements et facturation`
- `Notifications`

Centres de travail prioritaires :

- pilotage pedagogique secondaire
- supervision parcours eleves
- lecture resultats et analyses
- lecture financiere deleguee

Exclusions :

- pas de navigation caisse
- pas de lecture globale hors section

Sources :

- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)
- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## `DIRECTEUR_DISCIPLINE`

Statut de navigation :

- acteur disciplinaire secondaire

Modules visibles prioritaires :

- `Pedagogique`
- `Scolarite`

Centres de travail prioritaires :

- centre conduite
- centre discipline secondaire
- point d'entree suspension eleve

Pages d'entree candidates :

- encoder / modifier conduite dans sa section
- suspendre un eleve dans sa section
- consulter la lecture disciplinaire deja absorbee par l'audit pedagogique

Exclusions :

- pas de navigation caisse
- pas de navigation hors section
- pas d'actions scolaires hors suspension

Sources :

- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)

## `DIRECTEUR_PRIMAIRE`

Statut de navigation :

- acteur de pilotage primaire

Modules visibles prioritaires :

- `Scolarite`
- `Pedagogique`
- lectures utiles de `Paiements et facturation`

Centres de travail prioritaires :

- pilotage primaire
- scolarite primaire
- actions de cycle de vie autorisees
- lecture financiere deleguee

Exclusions :

- pas de navigation secondaire
- pas de caisse generique

Sources :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## `DIRECTEUR_MATERNELLE`

Statut de navigation :

- acteur de pilotage maternelle

Modules visibles prioritaires :

- `Scolarite`
- `Pedagogique`
- lectures utiles de `Paiements et facturation`

Centres de travail prioritaires :

- pilotage maternelle
- scolarite maternelle
- actions de cycle de vie autorisees
- lecture financiere deleguee

Exclusions :

- pas de navigation secondaire
- pas de caisse generique

Sources :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)

## Navigation Utilisateur / Externe

## `PARENT`

Statut de navigation :

- acteur externe de lecture bornee

Modules visibles prioritaires :

- centre resultats autorises
- centre historique paiements
- centre situation financiere
- preferences personnelles

Centres de travail prioritaires :

- suivi de ses enfants autorises
- suivi financier
- consultation des lectures exposees

Pages d'entree candidates :

- historique des paiements de ses enfants
- situation financiere de ses enfants
- resultats ou bulletins autorises
- preferences utilisateur

Exclusions :

- aucune navigation de mutation pedagogique
- aucune navigation finance interne
- aucune navigation hors de ses enfants rattaches

Sources :

- [03-cas-utilisation.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/03-cas-utilisation.md)
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [14-cartographie-finale-workflows.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/14-cartographie-finale-workflows.md)

## Cas Particuliers Et Exclusions Officielles

### `COMPTABLE`

`COMPTABLE` reste un role officiellement present dans `shared/security`, mais la phase workflows figes ne lui a pas encore donne une cartographie frontend autonome de meme niveau de preuve.

Consequence :

- pas de module principal dedie dans cette phase
- pas de centre de travail autonome officiellement fige
- ne pas inventer une navigation propre sans nouvelle preuve workflow

Source :

- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)

### `TITULAIRE`

Le frontend doit continuer a afficher `TITULAIRE` comme acteur d'experience, mais sans jamais le modeliser comme code role brut.

Source :

- [01-acteurs.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/01-acteurs.md)
- [02-permissions-effectives.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/02-permissions-effectives.md)

## Verdict

La navigation frontend par acteur est maintenant lisible comme une projection stable des workflows reels deja figes.

Elle est organisee :

- par niveau
- par acteur
- par modules prioritaires
- par centres de travail
- par exclusions officielles

La suite officielle la plus propre devient :

- cartographie navigation par module
- puis definition des pages et routes frontend
- puis ouverture des vues frontend

Cette cartographie modulaire est maintenant ouverte dans :

- [17-navigation-par-module.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/17-navigation-par-module.md)
