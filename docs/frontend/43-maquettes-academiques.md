# Phase 43 - Maquettes Academiques

## Statut

Ce document ouvre la materialisation metier des maquettes du domaine `Academique`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle regle metier

Il traduit uniquement en maquettes operatoires les vues academiques deja figees.

## Objectif

Le domaine academique EduSync doit etre lu comme un espace de gouvernance referentielle et de cadrage structurel.

Les maquettes de cette phase doivent privilegier :

- lisibilite des dependances academiques
- clarte du niveau de gouvernance
- separation entre socle officiel transverse et exploitation locale ecole
- densite utile des tableaux et etats
- prudence sur les mutations critiques

Elles doivent eviter :

- confusion entre module academique et module pedagogique
- faux dashboards decoratifs
- ecrans locaux d'ecole maquettés comme si tout relevait de la plateforme
- edition implicite de donnees que le backend ne laisse pas encore muter

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [DOCTRINE_REFERENTIEL_OFFICIEL.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/architecture/DOCTRINE_REFERENTIEL_OFFICIEL.md)
- [06-workflows-academiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/06-workflows-academiques.md)
- [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

Le backend reste la source ultime de verite.

Le referentiel officiel reste gouverne au niveau `Plateforme`. Les maquettes academiques locales d'ecole exploitent ce socle, mais ne doivent jamais laisser croire qu'elles en deviennent proprietaires ni qu'elles peuvent le muter hors des workflows plateforme deja figes.

## Doctrine De Maquettage Academique

### Regle 1

Toute vue academique doit afficher d'abord son niveau reel :

- plateforme
- organisation si un cadrage transverse le requiert plus tard
- ecole
- annee scolaire
- classe academique ou pedagogique si applicable

### Regle 2

Le frontend doit rendre visible la difference entre :

- socle officiel transverse
- parametres locaux d'exploitation
- etat brouillon local
- etat valide exploitable

Le socle officiel transverse doit donc etre lu comme une dependance gouvernee par la plateforme, tandis que les ecrans academiques locaux restent des ecrans d'exploitation, de cadrage et d'adaptation dans leur perimetre autorise.

### Regle 3

Une vue academique ne doit jamais etre confondue avec :

- une vue pedagogique d'analyse
- une vue scolaire de gestion eleve
- une vue finance

### Regle 4

Les workflows plateforme du domaine academique doivent rester denses, analytiques et prudents.

### Regle 5

Les workflows locaux d'ecole doivent rester clairement scopes par :

- ecole
- annee scolaire
- classe academique ou pedagogique

### Regle 6

Le frontend n'invente jamais :

- une edition fine des lignes de programme non exposee
- une mutation supplementaire du socle officiel
- une lecture globale hors perimetre prouve

## MAC-01

### Identifiant

- `MAC-01`

### Nom

- `Socle academique officiel`

### Objectif metier

Permettre la lecture et l'administration minimale du socle academique officiel transverse : sections scolaires, classes academiques et options d'etudes.

### Version Desktop

La version desktop doit etre un centre de reference plateforme.

Structure recommandee :

1. bandeau contexte plateforme
2. navigation locale par famille du socle
3. tableau principal
4. panneau detail lateral
5. zone d'action de creation minimale

### Version Mobile

La version mobile doit passer par :

1. contexte compact
2. segment de famille
3. liste des elements
4. fiche detail
5. action de creation si autorisee

### Filtres

- famille du socle
- recherche textuelle
- statut ou version si expose

### Zone de donnees

- sections scolaires
- classes academiques
- options d'etudes

### Statistiques

- nombre total de sections
- nombre total de classes academiques
- nombre total d'options d'etudes

### Actions visibles

- consulter
- filtrer
- creer une section scolaire
- creer une classe academique
- creer une option d'etude

### Exports

- Excel si les listes sont exportables
- impression

### Acteurs autorises

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME` si delegation explicite active

### Contraintes de perimetre

- plateforme uniquement

### Sources backend

- `ACA-08`
- [SCR-ACA-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md#L33)

### Relations avec les contrats d'ecran

- [SCR-ACA-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md#L33)

## MAC-02

### Identifiant

- `MAC-02`

### Nom

- `Migration referentielle`

### Objectif metier

Permettre d'analyser, appliquer, annuler et superviser une migration d'un programme local vers une nouvelle version officielle.

### Version Desktop

La version desktop doit etre une vue d'analyse et d'orchestration prudente.

Structure recommandee :

1. contexte plateforme
2. choix programme / version source / version cible
3. resume d'impact
4. journal ou timeline des migrations
5. bloc d'action critique

### Version Mobile

La version mobile doit assumer :

1. contexte
2. sequence analyse -> confirmation -> resultat
3. liste des migrations existantes
4. ouverture d'un rapport detaille

### Filtres

- programme niveau
- version source
- version cible
- statut de migration

### Zone de donnees

- rapports de migration
- historique des migrations
- etapes de recalcul

### Statistiques

- nombre de migrations visibles
- nombre en attente
- nombre appliquees
- nombre annulees si expose

### Actions visibles

- analyser
- appliquer
- annuler
- relancer un recalcul
- consulter un rapport

### Exports

- PDF du rapport si expose
- Excel des listes si utile
- impression

### Acteurs autorises

- `MANAGER_SYSTEME`
- `OPERATEUR_SYSTEME`
- `SUPPORT_SYSTEME` en lecture seulement selon le workflow reel

### Contraintes de perimetre

- plateforme uniquement

### Sources backend

- `ACA-09`
- [SCR-ACA-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md#L438)

### Relations avec les contrats d'ecran

- [SCR-ACA-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md#L438)

## MAC-03

### Identifiant

- `MAC-03`

### Nom

- `Pilotage des annees scolaires`

### Objectif metier

Permettre a l'ecole de creer, consulter, preparer, garantir, activer, basculer, cloturer, archiver et modifier ses annees scolaires.

### Version Desktop

La version desktop doit etre un centre de pilotage annuel local.

Structure recommandee :

1. bandeau contexte ecole / annee
2. cartes de synthese du cycle annuel
3. tableau des annees scolaires
4. bloc d'actions critiques
5. modales de confirmation

### Version Mobile

La version mobile doit empiler :

1. contexte
2. resume de l'annee active
3. liste des annees
4. feuille d'action ou de confirmation

### Filtres

- ecole
- statut de l'annee
- pagination

### Zone de donnees

- annee active
- historique des annees
- details d'une annee
- etat des mutations possibles

### Statistiques

- total des annees
- nombre planifiees
- nombre cloturees ou archivees
- presence ou absence d'une annee active

### Actions visibles

- creer
- garantir une annee active
- preparer l'annee suivante
- basculer
- modifier une annee planifiee
- activer
- cloturer
- archiver
- consulter le detail

### Exports

- aucun export principal requis
- impression possible des listes si utile

### Acteurs autorises

- `ADMIN_SYSTEME_ECOLE`

### Contraintes de perimetre

- meme organisation
- meme ecole

### Sources backend

- `ACA-03`

### Relations avec les contrats d'ecran

- complete la materialisation academique locale au-dela du premier noyau de [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## MAC-04

### Identifiant

- `MAC-04`

### Nom

- `Classes pedagogiques locales`

### Objectif metier

Permettre de creer, consulter et administrer les classes pedagogiques exploitees localement dans une ecole pour une annee scolaire.

### Version Desktop

La version desktop doit etre une vue liste / detail locale.

Structure recommandee :

1. bandeau contexte ecole / annee
2. filtres de section et de classe academique
3. tableau principal des classes pedagogiques
4. panneau detail
5. bloc d'initialisation ou de creation

### Version Mobile

La version mobile doit passer par :

1. contexte
2. filtres compacts
3. liste des classes pedagogiques
4. detail ouvrable

### Filtres

- annee scolaire
- section
- classe academique
- statut ou etat local si expose

### Zone de donnees

- classes pedagogiques locales
- liens avec l'annee scolaire
- liens avec la classe academique

### Statistiques

- nombre total de classes pedagogiques
- repartition par section si exposee

### Actions visibles

- consulter
- filtrer
- creer ou initialiser une classe pedagogique

### Exports

- Excel si la liste est exportable
- impression

### Acteurs autorises

- `ADMIN_SYSTEME_ECOLE`

### Contraintes de perimetre

- meme organisation
- meme ecole
- bonne annee scolaire

### Sources backend

- `ACA-04`

### Relations avec les contrats d'ecran

- complete la materialisation academique locale au-dela du premier noyau de [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## MAC-05

### Identifiant

- `MAC-05`

### Nom

- `Responsables officiels de classe`

### Objectif metier

Permettre la gestion des responsables officiels d'une classe pedagogique dans le bon perimetre local.

### Version Desktop

La version desktop doit etre une vue de gestion ciblee.

Structure recommandee :

1. contexte ecole / annee / classe pedagogique
2. tableau ou liste des responsables
3. detail du responsable courant
4. bloc de mutation autorisee

### Version Mobile

La version mobile doit afficher :

1. contexte
2. classe cible
3. responsable actuel
4. action de remplacement ou d'affectation

### Filtres

- annee scolaire
- classe pedagogique
- role si expose

### Zone de donnees

- responsable officiel courant
- historique utile si expose
- classe pedagogique cible

### Statistiques

- nombre de classes avec responsable affecte si expose

### Actions visibles

- consulter
- affecter
- remplacer
- retirer si expose

### Exports

- aucun export principal attendu

### Acteurs autorises

- `ADMIN_SYSTEME_ECOLE`

### Contraintes de perimetre

- meme organisation
- meme ecole
- bonne annee scolaire
- bonne classe pedagogique

### Sources backend

- `ACA-05`

### Relations avec les contrats d'ecran

- complete la materialisation academique locale au-dela du premier noyau de [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## MAC-06

### Identifiant

- `MAC-06`

### Nom

- `Calendrier academique local`

### Objectif metier

Permettre de construire, valider, verrouiller et consulter le calendrier academique local exploitable par les workflows aval.

### Version Desktop

La version desktop doit etre une vue de cadrage temporel locale.

Structure recommandee :

1. bandeau contexte ecole / annee
2. table ou grille des periodes
3. bloc de structure d'evaluation
4. alertes de coherence
5. actions de validation ou de verrouillage

### Version Mobile

La version mobile doit passer par :

1. contexte
2. liste des periodes
3. detail d'une periode
4. actions de verification ou verrouillage

### Filtres

- annee scolaire
- periode
- etat de validation ou verrouillage

### Zone de donnees

- periodes academiques
- structure d'evaluation
- etat du calendrier
- fenetres utiles d'exploitation

### Statistiques

- nombre de periodes
- nombre de periodes coherentes si expose
- statut du verrouillage

### Actions visibles

- creer
- modifier
- valider
- verrouiller
- consulter

### Exports

- impression
- PDF si la lecture calendrier est exportable

### Acteurs autorises

- `ADMIN_SYSTEME_ECOLE`

### Contraintes de perimetre

- meme organisation
- meme ecole
- bonne annee scolaire

### Sources backend

- `ACA-06`

### Relations avec les contrats d'ecran

- complete la materialisation academique locale au-dela du premier noyau de [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## MAC-07

### Identifiant

- `MAC-07`

### Nom

- `Programme niveau local`

### Objectif metier

Permettre d'initialiser, consulter, valider, archiver et lire l'etat local d'un programme niveau.

### Version Desktop

La version desktop doit etre une vue de cycle de vie du programme local.

Structure recommandee :

1. contexte ecole / annee / classe academique
2. liste ou tableau des programmes niveau
3. detail du programme selectionne
4. resume d'etat local
5. bloc de mutations autorisees

### Version Mobile

La version mobile doit assumer :

1. contexte
2. liste des programmes
3. detail du programme
4. actions de validation ou archivage

### Filtres

- annee scolaire
- classe academique
- statut du programme
- referentiel source

### Zone de donnees

- programme niveau
- statut `BROUILLON` / `VALIDE` / `ARCHIVE`
- etat local
- lignes actives ou non calculables si exposees

### Statistiques

- nombre de programmes visibles
- nombre brouillons
- nombre valides
- nombre archives

### Actions visibles

- initialiser
- consulter
- lister
- valider
- archiver
- produire l'etat local

### Exports

- impression
- Excel si les listes sont exportables

### Acteurs autorises

- `ADMIN_SYSTEME_ECOLE`

### Contraintes de perimetre

- meme organisation
- meme ecole
- bonne annee scolaire
- bonne classe academique

### Sources backend

- `ACA-07`

### Relations avec les contrats d'ecran

- complete la materialisation academique locale au-dela du premier noyau de [25-contrats-ecran-academique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/25-contrats-ecran-academique.md)

## Verdict

Le domaine `Academique` dispose maintenant d'une premiere couche officielle de maquettes metier couvrant :

- le socle academique officiel
- la migration referentielle
- l'annee scolaire locale
- les classes pedagogiques
- les responsables officiels
- le calendrier academique
- le programme niveau local

La logique retenue est claire :

- le niveau `plateforme` reste distinct du niveau `ecole`
- les vues academiques restent des vues de reference, de cadrage et de cycle de vie
- les mutations critiques restent explicites et bornees
- la doctrine `permission + perimetre` reste lisible dans chaque ecran

La suite naturelle, une fois cette phase stabilisee, est :

- cloture du lot `Documents officiels / PDF`
- puis seulement l'architecture frontend cible

## Statut De Figement

Le statut officiel retenu pour cette phase est :

- `PHASE 43 FIGEE`
