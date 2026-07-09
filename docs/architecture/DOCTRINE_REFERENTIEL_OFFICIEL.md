# Doctrine Officielle Du Referentiel National EduSync

## Statut

Ce document fixe la doctrine officielle du `Referentiel officiel` / `Referentiel national` dans EduSync.

Il :

- ne modifie aucun code
- ne modifie aucune API
- ne cree aucun nouveau workflow
- ne cree aucune nouvelle permission
- ne redefine aucun metier

Il formalise uniquement, au niveau architecture, ce que le depot prouve deja :

- le referentiel officiel est gouverne au niveau `Plateforme`
- les ecoles exploitent ce referentiel sans en devenir proprietaires
- les organisations supervisent l'usage et la conformite sans muter l'officiel
- les workflows plateforme reels deja figes portent le cycle officiel :
  - import
  - publication
  - activation
  - comparaison
  - migration

## Objectif

Definir la regle d'architecture transverse qui gouverne definitivement les responsabilites entre :

- `Plateforme`
- `Organisation`
- `Ecole`

concernant le referentiel officiel EduSync.

Cette doctrine doit servir de reference pour :

- les futurs developpements backend
- les futurs developpements frontend
- les futures doctrines ecran
- les futures decisions UX/UI

## Sources De Verite

Cette doctrine s'appuie sur les sources deja presentes dans le depot :

- [docs/frontend/12-workflows-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/12-workflows-plateforme.md)
- [docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/50-doctrine-ecran-referentiel-officiel-plateforme.md)
- [docs/referentiel-academique/interfaces/api.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/referentiel-academique/interfaces/api.md)
- [frontend/src/shared/doctrine/frontend-doctrine.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/shared/doctrine/frontend-doctrine.ts)
- [frontend/src/domains/plateforme/routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/frontend/src/domains/plateforme/routes.ts)
- [backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/referentiels-academiques.routes.ts)
- [backend/src/contexts/referentiel-academique/interfaces/http/routes/migrations-referentiel.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/migrations-referentiel.routes.ts)
- [backend/src/contexts/referentiel-academique/interfaces/http/routes/socle-academique.routes.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/referentiel-academique/interfaces/http/routes/socle-academique.routes.ts)

Le backend reste la source ultime de verite.

## Principe Fondamental

Le `Referentiel officiel` constitue la source unique de verite transverse du systeme EduSync.

Il porte notamment :

- les sections scolaires officielles
- les options d'etudes officielles
- les classes academiques officielles
- les cours officiels
- les programmes officiels
- les versions officielles
- les migrations referentielles officielles

Toutes les ecoles exploitent ce referentiel.

Aucune ecole ne cree son propre referentiel officiel.

Aucune organisation ne devient proprietaire du referentiel officiel.

Toutes les evolutions officielles proviennent exclusivement du niveau `Plateforme`.

## Doctrine D Immutabilite Des Versions Officielles

### Regle centrale

Une `VersionReferentielProgramme` publiee ou active est immuable.

Elle ne peut jamais etre corrigee en place.

Toute correction officielle doit passer par :

1. la creation d'une nouvelle version de travail
2. l'edition de cette version non publiee
3. les controles de coherence
4. la publication officielle
5. l'activation officielle
6. la comparaison avec la version precedente
7. la migration des programmes locaux si necessaire

### Verrouillages obligatoires

Les mutations de lignes officielles sont interdites sur :

- une version publiee
- une version active
- une version deja engagee dans une migration vers les ecoles

Les mutations de lignes officielles ne sont autorisees que sur une version non publiee, en preparation.

## Regle D Or

Le referentiel officiel appartient exclusivement a la `Plateforme`.

Les `Ecoles` exploitent le referentiel officiel.

Les `Organisations` supervisent les ecoles et leur conformite.

## Niveau Plateforme

### Proprietaire officiel

Le niveau `Plateforme` est proprietaire du referentiel officiel.

Il est le seul niveau autorise a gouverner les donnees officielles.

### Capacites officielles reservees a la plateforme

Le niveau `Plateforme` est seul autorise a :

- creer une section scolaire officielle
- modifier une section scolaire officielle
- supprimer ou desactiver une section officielle si le backend l'autorise
- creer une option officielle
- modifier une option officielle
- supprimer ou desactiver une option officielle si le backend l'autorise
- creer une classe academique officielle
- modifier une classe academique officielle
- supprimer ou desactiver une classe academique officielle si le backend l'autorise
- creer un cours officiel
- modifier un cours officiel
- supprimer ou desactiver un cours officiel si le backend l'autorise
- importer les composantes officielles
- creer une nouvelle version de travail a partir d'une version existante
- editer les lignes d'une version non publiee
- publier une version officielle
- activer une version officielle
- comparer deux versions officielles
- analyser une migration referentielle
- appliquer une migration referentielle
- annuler une migration non appliquee
- relancer un recalcul post-migration
- maintenir l'historique officiel des versions

### Acteurs plateforme reels

Selon le backend et les workflows deja figes, les acteurs reels du niveau plateforme sont :

- `MANAGER_SYSTEME` comme acteur naturel
- `OPERATEUR_SYSTEME` seulement si la delegation explicite correspondante est activee par configuration

Le document ne cree pas ici de nouveau droit pour `SUPPORT_SYSTEME`.

### Permissions plateforme

Les permissions officielles deja prouvees sont :

- `referentiel.read`
- `referentiel.write`

Leur usage reel, deja documente, suit les workflows `PLT-01` a `PLT-05`.

Pour l'extension d'edition des versions non publiees, la permission cible a privilegier reste `referentiel.write`, sauf preuve backend contraire ulterieure.

### Perimetre plateforme

Le perimetre de gouvernance du referentiel officiel est :

- `PLATEFORME`
- jamais `ECOLE`
- jamais `ORGANISATION`

Une interface ou une API qui mute l'officiel doit donc toujours etre lue comme :

- permission effective
- plus perimetre `PLATEFORME`

## Niveau Ecole

### Non-proprietaire de l officiel

L'`Ecole` n'est jamais proprietaire du referentiel officiel.

Elle ne doit pas etre capable de :

- creer un cours officiel
- modifier un cours officiel
- supprimer un cours officiel
- modifier un programme officiel
- modifier une version officielle publiee ou active
- modifier les sections officielles
- modifier les options officielles
- modifier les classes academiques officielles
- publier une version officielle
- activer une version officielle
- conduire une migration referentielle officielle au nom de la plateforme

### Role reel de l ecole

Le role de l'ecole est d'exploiter les donnees publiees par la plateforme.

Cela inclut notamment :

- synchroniser ou relire le referentiel officiel disponible
- exploiter les classes et cours officiels pour les eleves
- gerer les programmes niveau locaux
- gerer les enseignants et les notes
- produire les bulletins et autres documents
- appliquer les versions publiees a l'exploitation locale

Elle pourra exploiter plus tard un `ProgrammeNiveau` local, mais ce programme local ne devient jamais une edition de l'officiel plateforme.

### Separation obligatoire

Les donnees locales de l'ecole restent distinctes du referentiel officiel.

Exemples deja prouvés dans le depot :

- `classes-pedagogiques` : structure locale d'exploitation
- `programmes-niveau` : exploitation locale et adaptation de programme
- calendriers academiques locaux

Ces objets ne doivent jamais etre reinterpretes comme une propriete ecole du referentiel officiel.

## Ajustements Locaux Encadres

### Principe

Dans le contexte metier congolais, certains ajustements peuvent intervenir tardivement :

- changement de ponderation
- changement d'ordre d'affichage
- adaptation documentaire ou de rendu

Ces ajustements locaux peuvent exister, mais ils ne modifient jamais le referentiel officiel.

### Regles obligatoires

Tout ajustement local doit :

- etre trace
- etre reversible
- indiquer son origine
- rester distinct du referentiel officiel

### Portee

Les ajustements locaux concernent principalement :

- l'ordre d'affichage local
- certaines ponderations appliquees localement lorsque des instructions l'imposent

### Interdiction

Un ajustement local ne doit jamais etre presente :

- comme une mutation de l'officiel
- comme une nouvelle version officielle
- comme un pouvoir d'ecole sur le referentiel national

## Niveau Organisation

### Non-proprietaire de l officiel

Le niveau `Organisation` ne modifie jamais le referentiel officiel.

Il ne cree ni ne publie de version officielle.

Il ne remplace pas la plateforme dans la gouvernance du socle officiel.

### Role reel de l organisation

Le role de l'organisation est :

- superviser les ecoles
- suivre les synchronisations
- verifier la conformite d'usage
- produire des rapports consolides

### Portee

L'organisation peut observer :

- quelles ecoles exploitent quelle version
- quelles ecoles presentent des ecarts ou retards de synchronisation
- quels usages locaux demandent un suivi

Mais elle ne devient pas auteur de mutation officielle du referentiel.

## Workflow Officiel Du Referentiel

Le cycle officiel du referentiel suit la chaine deja prouvee par les workflows plateforme :

1. Creation ou preparation officielle d'une version de travail
2. Modification officielle des lignes sur cette version non publiee
3. Controle de coherence de la version de travail
4. Import officiel ou completion officielle des donnees
5. Publication officielle
6. Activation officielle
7. Comparaison officielle
8. Migration referentielle
9. Synchronisation / exploitation locale par les ecoles

Lecture importante :

- le backend actuel expose explicitement les workflows `import`, `publication`, `activation`, `comparaison` et `migration`
- l'edition d'une version non publiee est une extension backend/frontend a preparer proprement avant implementation
- l'exploitation locale et la consommation ecole restent aval
- aucune lecture produit future ne doit remettre ce sens a l'envers

## Matrice Officielle Par Niveau

### Plateforme

- proprietaire du referentiel officiel : oui
- peut muter le socle officiel : oui
- peut publier une version : oui
- peut activer une version : oui
- peut comparer deux versions : oui
- peut gerer les migrations officielles : oui
- peut maintenir l'historique officiel : oui

### Organisation

- proprietaire du referentiel officiel : non
- peut muter le socle officiel : non
- peut publier une version : non
- peut activer une version : non
- peut comparer deux versions comme lecture de gouvernance : non prouve dans le backend actuel
- peut superviser l'usage des ecoles : oui
- peut suivre la conformite : oui

### Ecole

- proprietaire du referentiel officiel : non
- peut muter le socle officiel : non
- peut publier une version officielle : non
- peut activer une version officielle : non
- peut exploiter les donnees officielles : oui
- peut produire des objets locaux appuyes sur l'officiel : oui
- peut appliquer des ajustements locaux traces : oui, si l'architecture locale le porte

## Consequences Pour Le Backend

Tout futur developpement backend devra respecter ces regles :

- aucune route ecole ne doit muter l'officiel
- aucune route organisation ne doit muter l'officiel
- toute mutation de l'officiel doit rester bornee par une autorisation plateforme explicite
- toute mutation d'une version officielle doit verifier qu'elle cible une version non publiee, non active et non deja engagee en migration
- les identites d'audit des mutations officielles doivent continuer a etre imposees par le contexte authentifie
- les ajustements locaux doivent rester differencies de l'officiel dans leurs modeles et leurs projections

## Consequences Pour Le Frontend

Toutes les futures interfaces devront respecter cette doctrine.

### Ecrans Ecole

Les ecrans ecole ne doivent jamais proposer :

- ajouter un cours officiel
- modifier un cours officiel
- supprimer un cours officiel
- modifier un programme officiel
- publier une version officielle
- activer une version officielle

### Ecrans Organisation

Les ecrans organisation ne doivent pas proposer de mutation du referentiel officiel.

Ils peuvent en revanche proposer :

- supervision
- suivi de synchronisation
- controle de conformite
- reporting consolide

### Ecrans Plateforme

Les ecrans plateforme restent le seul centre de gouvernance de l'officiel.

Le centre `Referentiel officiel Plateforme` doit donc rester :

- l'entree visuelle principale
- le point de pilotage unique
- le lieu exclusif des mutations officielles

Toute action d'edition officielle de lignes ne doit apparaitre que :

- sur une version non publiee
- pour un acteur portant `referentiel.write`
- avec un contexte de version clairement visible
- sans jamais proposer de mutation sur une version publiee ou active

## Regles UX/UI Derivees

Pour tout futur travail UX/UI :

- ne jamais dupliquer la gouvernance officielle dans un module ecole
- ne jamais projeter une action critique officielle comme une simple action locale
- toujours rendre visible la separation :
  - officiel transverse
  - exploitation locale
- traiter les ajustements locaux comme une couche distincte, jamais comme l'officiel lui-meme

## Controle De Non-Contradiction

Cette doctrine est correcte seulement si elle :

- ne contredit aucun workflow existant
- respecte le backend actuel
- respecte les permissions existantes
- ne cree aucun nouveau metier
- reste compatible avec la doctrine ecran deja posee pour le centre plateforme

## Formule Finale A Figer

La formule officielle a retenir pour EduSync est :

`Le Referentiel officiel appartient exclusivement a la Plateforme.`

`Les Ecoles exploitent le Referentiel officiel sans en devenir proprietaires.`

`Les Organisations supervisent la conformite d'usage sans muter l'officiel.`

`Les ajustements locaux restent traces, reversibles et strictement distincts du Referentiel officiel.`
