# Phase 34 - Maquettes Pedagogiques

## Statut

Ce document ouvre la materialisation metier des maquettes du domaine `Pedagogique`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle regle metier

Il traduit uniquement en maquettes operatoires les vues pedagogiques deja figees.

## Objectif

Le domaine pedagogique EduSync doit etre lu comme un espace de travail dense, utile et rigoureux.

Les maquettes de cette phase doivent privilegier :

- clarte du perimetre pedagogique
- lisibilite des contextes classe / annee / section
- rapidite d'action pour les workflows d'encodage
- profondeur de lecture pour les workflows d'analyse
- continuite entre consultation, verification et decision humaine

Elles doivent eviter :

- dashboards vagues sans valeur pedagogique
- cartes decoratives qui cachent les tables utiles
- animations inutiles
- melange entre mutation pedagogique et lecture analytique

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [23-contrats-ecran-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)

Le backend reste la source ultime de verite.

## Doctrine De Maquettage Pedagogique

### Regle 1

Toute vue pedagogique doit afficher d'abord son perimetre reel :

- annee scolaire
- ecole
- section si applicable
- classe si applicable
- eleve si applicable

### Regle 2

Le frontend n'efface jamais la doctrine :

- permission + perimetre

Il doit au contraire la rendre lisible.

### Regle 3

Les workflows de mutation restent separes des workflows d'analyse.

Exemples :

- `encoder la conduite` n'est pas `consulter les resultats`
- `generer le bulletin` n'est pas `consulter le bulletin`
- `consulter le centre d'analyse` n'est pas `deliberer`

### Regle 4

Une vue pedagogique analytique doit privilegier :

- tableaux utiles
- regroupements lisibles
- diagnostics actionnables
- filtres pedagogiques concrets

Et non une simple mise en scene de KPI.

### Regle 5

Les acteurs sectionnels ne doivent jamais etre projetes comme lecteurs globaux implicites.

### Regle 6

Les vues pedagogiques doivent toujours laisser apparaitre ce qui est :

- lecture simple
- mutation
- calcul automatique
- information derivee

### Regle 7

Le frontend n'invente jamais :

- une decision de deliberation finale
- une seconde session complete
- une lecture de conduite ou d'application non exposee

tant que le backend ne porte pas ce cycle reel.

## MP-01

### Identifiant

- `MP-01`

### Nom

- `Encodage des fiches de bulletin`

### Objectif metier

Permettre a l'acteur pedagogiquement concerne d'encoder une fiche de bulletin dans le bon perimetre de cours et de classe.

### Version Desktop

La version desktop doit prendre la forme d'un ecran de travail centre sur la grille.

Structure recommandee :

1. bandeau contexte classe / cours / annee
2. bloc de rappel de perimetre et colonnes autorisees
3. grille principale d'encodage
4. barre d'actions fixe en bas

### Version Mobile

La version mobile doit passer par une lecture par eleve ou par groupe de colonnes.

Structure recommandee :

1. contexte compact
2. selection du cours ou de la colonne
3. liste d'eleves
4. feuille basse d'encodage

### Filtres

- annee scolaire
- classe
- cours
- colonne de cotation si exposee

### Zone de donnees

- grille d'encodage
- liste des eleves
- valeurs deja renseignees

### Statistiques

- nombre d'eleves attendus
- nombre de lignes renseignees
- nombre de cases vides

### Actions visibles

- encoder
- modifier
- enregistrer

### Exports

- aucun export principal attendu

### Acteurs autorises

- `ENSEIGNANT`
- `TITULAIRE` via ses capacites effectives d'`ENSEIGNANT`

### Contraintes de perimetre

- cours et classes de l'enseignant
- classe titulaire si la vue est ouverte depuis le perimetre titulaire

### Sources backend

- `PED-04`
- [SCR-PED-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L42)
- [48-specification-mp-01-fiche-cotation-electronique.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/48-specification-mp-01-fiche-cotation-electronique.md)

### Relations avec les contrats d'ecran

- [SCR-PED-001](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L42)

## MP-02

### Identifiant

- `MP-02`

### Nom

- `Generation du bulletin`

### Objectif metier

Permettre au `TITULAIRE` effectif de generer le bulletin dans le bon perimetre de classe et d'annee.

### Version Desktop

La version desktop doit etre une vue d'action breve, tres claire et tres controlee.

Structure recommandee :

1. contexte classe / annee
2. bloc de precontrole
3. resume des preconditions
4. action principale unique

### Version Mobile

La version mobile doit garder la meme logique :

1. contexte
2. verifications
3. bouton principal
4. retour de resultat

### Filtres

- annee scolaire
- classe titulaire

### Zone de donnees

- contexte de generation
- etat de completude
- messages de coherence

### Statistiques

- nombre de fiches attendues
- nombre de fiches prêtes si expose

### Actions visibles

- generer le bulletin

### Exports

- export PDF seulement comme suite, pas comme action principale de cet ecran

### Acteurs autorises

- `TITULAIRE`

### Contraintes de perimetre

- bonne ecole
- bonne classe titulaire
- bonne annee scolaire

### Sources backend

- `PED-01`
- [SCR-PED-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L130)

### Relations avec les contrats d'ecran

- [SCR-PED-002](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L130)

## MP-03

### Identifiant

- `MP-03`

### Nom

- `Generation de la proclamation`

### Objectif metier

Permettre au `TITULAIRE` effectif de generer la proclamation de sa classe dans le bon perimetre.

### Version Desktop

La version desktop doit etre une vue d'action soignee mais simple.

Structure recommandee :

1. contexte classe / annee
2. bloc de prevalidation des resultats
3. resume des risques ou manques
4. action principale de generation

### Version Mobile

La version mobile doit garder :

1. contexte
2. verifications
3. confirmation
4. retour de resultat

### Filtres

- annee scolaire
- classe titulaire

### Zone de donnees

- contexte de proclamation
- etat des resultats consolides
- verifications minimales

### Statistiques

- nombre d'eleves classes
- non classes si exposes

### Actions visibles

- generer la proclamation

### Exports

- aucun export principal au niveau de cette action de lancement

### Acteurs autorises

- `TITULAIRE`

### Contraintes de perimetre

- classe titulaire effective
- bonne annee scolaire

### Sources backend

- `PED-03`
- [SCR-PED-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L212)

### Relations avec les contrats d'ecran

- [SCR-PED-003](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L212)

## MP-04

### Identifiant

- `MP-04`

### Nom

- `Statistiques pedagogiques de classe`

### Objectif metier

Permettre la lecture analytique des statistiques d'une classe dans le bon perimetre pedagogique.

### Version Desktop

La version desktop doit etre une vue d'analyse avec densite utile.

Structure recommandee :

1. bandeau contexte classe / annee / colonne
2. ligne de filtres
3. bandeau KPI compact
4. tableau analytique principal
5. panneaux secondaires d'ouverture

### Version Mobile

La version mobile doit passer par :

1. contexte
2. selecteur de colonne d'analyse
3. KPI compacts
4. cartes ou lignes analytiques

### Filtres

- annee scolaire
- classe
- colonne d'analyse

### Zone de donnees

- indicateurs de classe
- tableaux ou comparaisons
- regroupements utiles

### Statistiques

- effectif
- moyennes
- repartitions utiles
- indicateurs exposes par le backend de statistiques

### Actions visibles

- filtrer
- changer la colonne d'analyse
- ouvrir un detail analytique

### Exports

- PDF si la lecture le justifie
- Excel si le tableau est exportable
- impression

### Acteurs autorises

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`
- `DIRECTEUR_DISCIPLINE`

### Contraintes de perimetre

- `TITULAIRE` : sa classe + bonne annee
- acteurs sectionnels : classes de leur section seulement

### Sources backend

- `PED-05`
- [SCR-PED-004](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L293)

### Relations avec les contrats d'ecran

- [SCR-PED-004](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L293)

## MP-05

### Identifiant

- `MP-05`

### Nom

- `Classement de classe`

### Objectif metier

Permettre la lecture du classement d'une classe dans le bon perimetre pedagogique.

### Version Desktop

La version desktop doit rester un ecran de lecture et de pilotage, pas un document imprimable.

Structure recommandee :

1. contexte classe / annee
2. bandeau d'indicateurs
3. tableau principal de classement
4. panneau de detail eleve si besoin

### Version Mobile

La version mobile doit afficher :

1. contexte
2. rangs essentiels
3. liste d'eleves
4. ouverture du detail

### Filtres

- annee scolaire
- classe

### Zone de donnees

- rang
- eleve
- pourcentage
- statut de classabilite

### Statistiques

- nombre classes
- nombre non classes
- meilleure moyenne
- seuils utiles si exposes

### Actions visibles

- filtrer
- ouvrir un detail eleve

### Exports

- aucun PDF metier autonome a supposer
- Excel ou impression seulement si la vue est prevue pour cela plus tard

### Acteurs autorises

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Contraintes de perimetre

- `TITULAIRE` : classe titulaire + bonne annee
- `PREFET_ETUDES` / `DIRECTEUR_ETUDES` : section secondaire de leur ecole

### Sources backend

- `PED-06`
- [SCR-PED-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L378)

### Relations avec les contrats d'ecran

- [SCR-PED-005](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L378)

## MP-06

### Identifiant

- `MP-06`

### Nom

- `Encodage de la conduite`

### Objectif metier

Permettre l'encodage et la modification de la conduite dans le bon perimetre autorise.

### Version Desktop

La version desktop doit etre une vue liste + edition.

Structure recommandee :

1. contexte classe ou section
2. selection de periode
3. tableau eleves / conduite
4. panneau d'edition
5. retour de sauvegarde

### Version Mobile

La version mobile doit passer par :

1. contexte
2. liste d'eleves
3. fiche d'edition par eleve
4. validation

### Filtres

- annee scolaire
- classe
- periode

### Zone de donnees

- liste des eleves
- conduite actuelle
- saisie des points

### Statistiques

- nombre de conduites deja encodees
- nombre restant

### Actions visibles

- encoder
- modifier
- enregistrer

### Exports

- aucun export principal

### Acteurs autorises

- `TITULAIRE`
- `DIRECTEUR_DISCIPLINE`

### Contraintes de perimetre

- `TITULAIRE` : sa classe et sa bonne annee
- `DIRECTEUR_DISCIPLINE` : meme ecole + meme section secondaire

### Sources backend

- `PED-07`
- [SCR-PED-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L461)

### Relations avec les contrats d'ecran

- [SCR-PED-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L461)

## MP-07

### Identifiant

- `MP-07`

### Nom

- `Centre d'analyse pedagogique`

### Objectif metier

Permettre la consultation consolidee des resultats et des analyses pedagogiques derivees de `ResultatBulletinEleve`.

### Version Desktop

La version desktop doit etre l'ecran pilote du domaine pedagogique analytique.

Structure recommandee :

1. bandeau contexte classe / eleve / annee
2. navigation locale des sous-analyses
3. resume resultat
4. panneau diagnostics
5. table ou vue specialisee selon l'onglet

Onglets ou sections recommandeees :

- resultat consolide
- diagnostics
- echecs
- echecs profonds
- cours problematiques
- comparatif classes
- evolution
- perequation
- repechage
- deliberation
- seconde session

### Version Mobile

La version mobile doit assumer une navigation par sous-vues :

1. contexte
2. navigation locale en onglets ou segments
3. cartes ou listes analytiques
4. ouverture du detail eleve si necessaire

### Filtres

- annee scolaire
- classe
- eleve si applicable
- colonne
- sous-analyse

### Zone de donnees

- resultats consolides
- diagnostics
- listes analytiques specialisees
- comparatifs
- evolutions

### Statistiques

- total eleves concernes
- nombre d'echecs
- nombre d'echecs profonds
- non classes
- indicateurs analytiques exposes par le backend

### Actions visibles

- filtrer
- comparer
- ouvrir un detail eleve
- basculer entre sous-analyses

### Exports

- PDF si certains tableaux sont exportables
- Excel pour les listes analytiques
- impression

### Acteurs autorises

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Contraintes de perimetre

- `TITULAIRE` : classe titulaire + bonne annee
- `PREFET_ETUDES` / `DIRECTEUR_ETUDES` : section secondaire + bonne ecole
- `perequation`, `repechage`, `deliberation`, `seconde session` : secondaire uniquement

### Sources backend

- `PED-08`
- [SCR-PED-007](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L544)

### Relations avec les contrats d'ecran

- [SCR-PED-007](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L544)

## MP-08

### Identifiant

- `MP-08`

### Nom

- `Detail resultat eleve`

### Objectif metier

Permettre la lecture detaillee du resultat consolide d'un eleve dans le bon perimetre pedagogique.

### Version Desktop

La version desktop doit etre une fiche analytique eleve.

Structure recommandee :

1. identite eleve
2. contexte classe / annee
3. tableau des colonnes de resultat
4. bloc diagnostics
5. liens vers evolution et analyses associees

### Version Mobile

La version mobile doit empiler :

1. identite eleve
2. resume resultat
3. details de colonnes
4. diagnostics

### Filtres

- annee scolaire
- eleve

### Zone de donnees

- resultat consolide
- colonnes de resultat
- rangs
- pourcentages
- diagnostics associes

### Statistiques

- pourcentage global
- rang
- nombre d'echecs

### Actions visibles

- ouvrir les analyses associees
- basculer vers evolution ou comparatif si expose

### Exports

- impression
- export PDF seulement si cette fiche est prevue comme lecture exportable

### Acteurs autorises

- `TITULAIRE`
- `PREFET_ETUDES`
- `DIRECTEUR_ETUDES`

### Contraintes de perimetre

- identiques a `MP-07`

### Sources backend

- `PED-08`
- [SCR-PED-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L635)

### Relations avec les contrats d'ecran

- [SCR-PED-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md#L635)

## Verdict

Le domaine pedagogique dispose maintenant d'une premiere couche officielle de maquettes metier couvrant :

- encodage
- generation
- supervision
- classement
- conduite
- analyse pedagogique

La logique retenue est claire :

- les actions restent breves, explicites et bornees au bon perimetre
- les lectures analytiques restent denses, tabulaires et navigables
- le centre d'analyse `MP-07` devient l'ecran pilote du domaine pedagogique analytique

La suite naturelle, une fois cette phase stabilisee, est :

- ouverture de `35-maquettes-scolarite.md`

## Statut De Figement

Le statut officiel retenu pour cette phase est :

- `PHASE 34 FIGEE`
