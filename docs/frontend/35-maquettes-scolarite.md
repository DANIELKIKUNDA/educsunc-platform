# Phase 35 - Maquettes Scolarite

## Statut

Ce document ouvre la materialisation metier des maquettes du domaine `Scolarite`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle regle metier

Il traduit uniquement en maquettes operatoires les vues de scolarite deja figees.

## Objectif

Le domaine `Scolarite` EduSync doit etre lu comme un centre de gestion dense, controle et chronologique.

Les maquettes de cette phase doivent privilegier :

- clarte du contexte ecole / annee / section
- rapidite d'execution pour les flux critiques
- lisibilite des identites eleve et famille
- separation nette entre lecture, mutation et historique
- continuite entre inscription, affectation et cycle de vie

Elles doivent eviter :

- faux dashboards vagues
- formulaires interminables sans guidage
- confusion entre perimetre caisse et perimetre pedagogique
- projection implicite d'acteurs non retenus par le backend

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [08-workflows-scolaires.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/08-workflows-scolaires.md)
- [24-contrats-ecran-scolarite.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

Le backend reste la source ultime de verite.

## Doctrine De Maquettage Scolarite

### Regle 1

Toute vue de scolarite doit afficher d'abord son contexte reel :

- annee scolaire
- ecole
- section si applicable
- classe si applicable
- eleve ou famille si applicable

### Regle 2

Le frontend doit rendre visible la difference entre :

- lecture
- mutation
- historisation
- action irreversible

### Regle 3

Le `CAISSIER` ne doit jamais etre maquetté comme un simple lecteur financier dans ce domaine.

Ici, il porte de vrais workflows scolaires :

- inscription
- eleves
- familles
- affectations
- certaines mutations de cycle de vie

### Regle 4

Les acteurs sectionnels ne doivent voir que les ecrans compatibles avec leur section reelle.

Le frontend doit donc toujours rendre lisible :

- la section courante
- la classe courante
- la restriction de perimetre

### Regle 5

`DIRECTEUR_DISCIPLINE` ne doit jamais etre projete au-dela de la suspension.

### Regle 6

Les vues de scolarite doivent privilegier :

- tableaux utiles
- formulaires guides
- timelines d'evenements
- blocs de confirmation explicites

et non une mise en scene decorative.

## MS-01

### Identifiant

- `MS-01`

### Nom

- `Inscription scolaire complete`

### Objectif metier

Permettre au `CAISSIER` de conduire le flux complet eleve -> famille -> inscription -> affectation dans le bon perimetre d'ecole.

### Version Desktop

La version desktop doit etre un centre de travail guide en plusieurs blocs.

Structure recommandee :

1. bandeau contexte ecole / annee scolaire
2. assistant de parcours avec etapes visibles
3. bloc identite eleve
4. bloc famille et responsables
5. bloc inscription annuelle
6. bloc affectation optionnelle
7. recapitulatif final et validation

### Version Mobile

La version mobile doit passer par un assistant par etapes.

Structure recommandee :

1. contexte compact
2. progression visuelle
3. une etape par ecran ou feuille
4. recapitulatif final

### Filtres

- annee scolaire
- classe cible si affectation immediate

### Zone de donnees

- identite eleve
- famille et responsables
- inscription annuelle
- affectation eventuelle

### Statistiques

- aucune statistique centrale obligatoire
- compteur d'etapes completees

### Actions visibles

- creer l'eleve
- creer ou lier une famille
- enregistrer l'inscription
- affecter l'eleve
- rejouer proprement le flux si necessaire

### Exports

- aucun export principal attendu

### Acteurs autorises

- `CAISSIER`

### Contraintes de perimetre

- meme organisation
- meme ecole
- annee scolaire cible valide

### Sources backend

- `SCO-01`
- [SCR-SCO-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L42)

### Relations avec les contrats d'ecran

- [SCR-SCO-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L42)

## MS-02

### Identifiant

- `MS-02`

### Nom

- `Gestion des eleves`

### Objectif metier

Permettre la consultation et la gestion des eleves dans le bon perimetre local ou sectionnel.

### Version Desktop

La version desktop doit etre une vue liste / detail dense et rapide.

Structure recommandee :

1. bandeau contexte ecole / annee / section
2. barre de filtres
3. tableau principal des eleves
4. panneau detail rapide
5. actions contextuelles bornees

### Version Mobile

La version mobile doit afficher :

1. contexte
2. filtres compacts
3. liste des eleves
4. fiche detail ouvrable

### Filtres

- annee scolaire
- section
- classe
- statut eleve
- recherche textuelle

### Zone de donnees

- identite minimale eleve
- code eleve
- classe actuelle si connue
- statut
- liens familiaux utiles

### Statistiques

- total eleves affiches
- repartition simple par statut si exposee

### Actions visibles

- consulter
- filtrer
- rechercher
- ouvrir le detail

### Exports

- Excel si la liste est exportable
- impression

### Acteurs autorises

- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Contraintes de perimetre

- `CAISSIER` : toute l'ecole
- acteurs sectionnels : leur section uniquement

### Sources backend

- `SCO-06`
- [SCR-SCO-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L92)

### Relations avec les contrats d'ecran

- [SCR-SCO-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L92)

## MS-03

### Identifiant

- `MS-03`

### Nom

- `Gestion des familles`

### Objectif metier

Permettre au `CAISSIER` de consulter, creer et maintenir les familles et leurs responsables dans le flux reel d'inscription.

### Version Desktop

La version desktop doit etre une vue liste / detail avec relation famille <-> enfants.

Structure recommandee :

1. bandeau contexte ecole / annee
2. barre de recherche et filtres
3. tableau familles
4. detail famille
5. blocs responsables et enfants lies

### Version Mobile

La version mobile doit passer par :

1. liste des familles
2. fiche detail
3. edition ciblee des responsables

### Filtres

- recherche par nom famille
- recherche par responsable
- recherche par eleve rattache

### Zone de donnees

- identite famille
- responsables
- enfants lies
- indicateurs utiles de rattachement

### Statistiques

- nombre de familles
- nombre de responsables lies

### Actions visibles

- consulter
- creer
- modifier
- ajouter un responsable
- definir le responsable principal
- lier un eleve

### Exports

- Excel si liste exportable
- impression

### Acteurs autorises

- `CAISSIER`

### Contraintes de perimetre

- meme organisation
- meme ecole

### Sources backend

- `SCO-05`
- [SCR-SCO-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L145)

### Relations avec les contrats d'ecran

- [SCR-SCO-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L145)

## MS-04

### Identifiant

- `MS-04`

### Nom

- `Affectations de classe`

### Objectif metier

Permettre la lecture et la mutation des affectations dans le bon perimetre reel de classe, de section, d'ecole et d'annee.

### Version Desktop

La version desktop doit etre une vue action / liste tres lisible.

Structure recommandee :

1. contexte annee / section / classe
2. liste des eleves concernes
3. bloc affectation actuelle
4. bloc de reaffectation
5. recapitulatif de mutation

### Version Mobile

La version mobile doit assumer :

1. contexte compact
2. selection d'un eleve
3. lecture de l'affectation actuelle
4. choix cible et confirmation

### Filtres

- annee scolaire
- section
- classe actuelle
- classe cible
- statut inscription

### Zone de donnees

- affectation active
- classes disponibles
- historique court de mutation si utile

### Statistiques

- nombre d'eleves par classe si expose
- nombre d'affectations visibles dans le filtre courant

### Actions visibles

- consulter l'affectation
- affecter
- reaffecter
- desactiver une affectation si expose

### Exports

- Excel si liste d'affectations exportable
- impression

### Acteurs autorises

- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Contraintes de perimetre

- `CAISSIER` : ecole complete
- acteurs sectionnels : leur section seulement
- bonne annee scolaire

### Sources backend

- `SCO-04`
- [SCR-SCO-004](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L198)

### Relations avec les contrats d'ecran

- [SCR-SCO-004](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L198)

## MS-05

### Identifiant

- `MS-05`

### Nom

- `Cycle de vie eleve`

### Objectif metier

Permettre les mutations reelles de statut eleve avec une lecture claire du statut courant, de l'historique et du bloc d'action autorise.

### Version Desktop

La version desktop doit etre une fiche eleve de pilotage de statut.

Structure recommandee :

1. bandeau identite eleve
2. contexte ecole / section / classe / annee
3. bloc statut courant
4. timeline des evenements
5. panneau d'action contextuelle
6. zone de confirmation et de motif

### Version Mobile

La version mobile doit empiler :

1. identite eleve
2. statut courant
3. historique recent
4. action autorisee
5. confirmation

### Filtres

- annee scolaire
- eleve
- type d'evenement

### Zone de donnees

- identite eleve
- statut global
- affectation active si connue
- historique de parcours utile
- action demandee

### Statistiques

- aucune statistique centrale obligatoire
- compteur d'evenements affiches si utile

### Actions visibles

- suspendre
- abandonner
- transferer
- reintegrer si le langage UI retient cette etiquette
- reactiver
- declarer le deces

### Exports

- impression de la fiche evenementielle si prevue

### Acteurs autorises

- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `CAISSIER`
- `DIRECTEUR_DISCIPLINE` seulement pour la suspension

### Contraintes de perimetre

- acteurs sectionnels : leur section seulement
- `CAISSIER` : toute l'ecole pour abandon, transfert, reactivation et deces
- `DIRECTEUR_DISCIPLINE` : suspension seulement dans sa section

### Sources backend

- `SCO-02`
- [SCR-SCO-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L254)

### Relations avec les contrats d'ecran

- [SCR-SCO-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L254)

## MS-06

### Identifiant

- `MS-06`

### Nom

- `Suspension eleve`

### Objectif metier

Permettre l'encodage cible d'une suspension dans le bon perimetre disciplinaire ou pedagogique local, sans melanger cette action avec les autres mutations de statut.

### Version Desktop

La version desktop doit etre une vue breve et controlee.

Structure recommandee :

1. identite eleve
2. rappel de section et classe
3. motif ou justification
4. confirmation explicite

### Version Mobile

La version mobile doit garder la meme logique :

1. eleve
2. motif
3. confirmation

### Filtres

- recherche eleve
- classe
- section

### Zone de donnees

- eleve cible
- statut courant
- motif de suspension

### Statistiques

- aucune statistique centrale obligatoire

### Actions visibles

- suspendre

### Exports

- aucun export principal attendu

### Acteurs autorises

- `DIRECTEUR_DISCIPLINE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`

### Contraintes de perimetre

- meme ecole
- bonne section
- `DIRECTEUR_DISCIPLINE` : suspension uniquement

### Sources backend

- `SCO-02`
- `SCO-06`
- [SCR-SCO-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L322)

### Relations avec les contrats d'ecran

- [SCR-SCO-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/24-contrats-ecran-scolarite.md#L322)

## Verdict

Le domaine `Scolarite` dispose maintenant d'une premiere couche officielle de maquettes metier couvrant :

- l'inscription complete
- la gestion des eleves
- la gestion des familles
- les affectations
- le cycle de vie
- la suspension ciblee

La logique retenue est claire :

- les flux critiques restent guides, bornes et contextuels
- les lectures restent denses et utiles
- les mutations de statut restent visibles sans confusion d'acteurs
- la doctrine `permission + perimetre` reste lisible dans chaque vue

La suite naturelle, une fois cette phase stabilisee, est :

- verification transversale de coherence entre les maquettes finances, pedagogiques et scolarite
- puis ouverture du lot suivant de maquettes metier si necessaire

## Statut De Figement

Le statut officiel retenu pour cette phase est :

- `PHASE 35 FIGEE`
