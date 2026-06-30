# Phase 33 - Maquettes Finances

## Statut

Ce document ouvre la materialisation metier des maquettes du domaine `Paiements et facturation`.

Il ne cree :

- aucun nouveau workflow
- aucun nouvel acteur
- aucune nouvelle permission
- aucune nouvelle regle metier

Il traduit uniquement en maquettes operatoires les vues financieres deja figees.

## Objectif

Le domaine financier EduSync doit etre lu comme un moteur de gestion et de decision, pas comme un dashboard decoratif.

Les maquettes de cette phase doivent privilegier :

- lisibilite
- densite utile
- ergonomie de recouvrement
- rapidite de lecture
- rapidite de decision

Elles doivent eviter :

- graphiques decoratifs
- cartes geantes sans valeur metier
- animations inutiles
- blocs visuels qui cachent les chiffres importants

## Sources De Verite

Cette phase s'appuie exclusivement sur :

- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [22-contrats-ecran-finances.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md)
- [31-synthese-contrats-ecran.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/31-synthese-contrats-ecran.md)
- [32-maquettes-shell-global.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/32-maquettes-shell-global.md)
- [VF-01 — REGISTRE FINANCIER DE CLASSE Spécification fonctionnelle officielle (Ve…](C:\Users\MON PC\.codex\attachments\0e2d52e3-30a0-4d86-9a84-cc85b5c06fbb\pasted-text.txt)

Le backend reste la source ultime de verite.

## Source Unique De Verite

Toutes les vues financieres de ce document heritent integralement de la logique validee dans :

- `VF-01 Registre financier de classe`

Aucune vue financiere ne doit :

- inventer ses propres calculs
- recalculer des montants localement
- redefinir les effectifs utiles
- modifier les taux
- reinterpretter les statuts financiers

Toutes les statistiques, montants, effectifs, taux et etats doivent provenir du meme moteur metier que `VF-01`.

## Doctrine De Maquettage Financier

### Regle 1

La maquette financiere doit toujours montrer d'abord ce qui aide a agir :

- qui doit payer
- qui a paye
- qui n'est pas en ordre
- ou se situe le manque

### Regle 2

Une vue analytique finance n'est pas un decor.

Elle doit d'abord rendre lisibles :

- les montants
- les effectifs utiles
- les restes a recouvrer
- les filtres de perimetre

### Regle 3

Les statistiques doivent etre lues a leur vrai niveau :

- par colonne
- par mois
- par tranche
- par type de frais

Et non pas seulement comme un total global.

### Regle 4

Le frontend n'interprete jamais les statuts financiers.

Il affiche uniquement ce que le backend et la specification figee portent deja :

- `AG`
- `EX`
- `EX50`
- `FN`
- `PC`
- `AB`
- `TR`
- `DC`

### Regle 5

Les ecrans de synthese ne remplacent pas les vues detaillees.

Ils doivent permettre une bascule rapide vers :

- eleve
- classe
- type de frais
- historique
- arrieres

### Regle 6

Les calculs doivent toujours respecter les regles deja validees pour :

- `AG`
- `EX`
- `EX50`
- `FN`
- `PC`

### Regle 7

Ne jamais comptabiliser dans les statistiques financieres :

- `AB`
- `TR`
- `DC`

a partir de leur date d'effet.

### Regle 8

Ne jamais comptabiliser un eleve pour un frais dont il n'est pas redevable.

Exemples obligatoires de lecture :

- `FN` peut etre exonere des minervales mais redevable des frais d'Etat
- `PC` peut etre redevable uniquement de certains frais
- `EX` peut etre totalement exonere
- `EX50` peut etre partiellement exonere

### Regle 9

Toutes les vues financieres sont construites selon quatre dimensions obligatoires :

- temps
- type de frais
- perimetre organisationnel
- regles metier `VF-01`

### Regle 10

Toutes les vues doivent permettre :

- situation actuelle
- mois selectionne
- historique annuel

Le suivi financier reste d'abord mensuel.

## MF-01

### Identifiant

- `MF-01`

### Nom

- `VF-01 Registre financier de classe`

### Objectif metier

Permettre la consultation detaillee et operationnelle de la situation financiere d'une classe, avec un registre officiel ligne par eleve et statistiques integrees par colonne.

### Version Desktop

La version desktop doit suivre une logique de registre pleine largeur.

Structure recommandee :

1. bandeau de contexte dense
2. ligne de filtres
3. tableau principal horizontal scrollable
4. lignes de statistiques integrees sous le tableau principal
5. barre d'actions d'export

Lecture UX retenue :

- l'ecran doit ressembler a un registre exploitable
- pas a un dashboard
- pas a une fiche eleve
- pas a une page marketing

Colonnes recommandees :

- `N°`
- `Nom / Postnom / Prenom`
- `Date inscription`
- mois `Septembre` a `Juin`
- `Tranche 1`
- `Tranche 2`
- `Tranche 3`
- `Inscription` si active
- `Situation financiere`

Sous le tableau, une zone de statistiques integrees doit reprendre pour chaque colonne :

- `Eleves redevables`
- `Montant attendu`
- `Montant paye`
- `Reste a recouvrer`
- `Eleves en ordre`
- `Eleves non en ordre`
- `Taux de recouvrement`

Ces statistiques doivent etre affichees sous forme de lignes de registre, alignees sous chaque colonne financiere :

- mois
- tranches Etat
- inscription si active

Et non comme des cartes separees ni comme un dashboard resume global.

### Version Mobile

La version mobile ne doit pas tenter de montrer le registre complet dans un tableau minuscule.

Structure recommandee :

1. contexte et filtres empiles
2. resume des colonnes actives
3. liste d'eleves par cartes compactes
4. ouverture d'un panneau detail par eleve
5. onglet ou feuille basse pour les statistiques de la colonne selectionnee

Lecture UX retenue :

- un selecteur de colonne ou de groupe de colonnes devient central
- la lecture se fait par segment `mois / tranche / inscription / situation`

### Filtres

- organisation
- ecole
- annee scolaire
- section
- classe
- mois analyse jusqu'a

Les filtres visibles doivent dependre du perimetre reel de l'acteur.

### Zone de donnees

La zone principale est un registre par eleve.

Chaque cellule peut afficher :

- un montant paye
- ou un statut financier

Statuts a afficher sans reinterpretation :

- `AG`
- `EX`
- `EX50`
- `FN`
- `PC`
- `AB`
- `TR`
- `DC`

### Statistiques

Les statistiques sont integrees au registre, pas dans un bloc separe.

Elles restent calculees :

- par colonne
- par mois
- par tranche
- par type de frais

Elles doivent rester lisibles sans ouvrir une seconde page.

Elles doivent etre rendues sous forme de lignes fixes sous le tableau principal, dans l'ordre suivant :

- `Eleves redevables`
- `Montant attendu`
- `Montant paye`
- `Reste a recouvrer`
- `Eleves en ordre`
- `Eleves non en ordre`
- `Taux de recouvrement`

Regles de lecture obligatoires :

- `FN` et `PC` ne sont jamais comptes automatiquement partout
- ils sont comptes seulement sur les colonnes ou l'eleve reste reellement redevable
- `EX` sort l'eleve de la colonne exoneree
- `EX50` ne compte que la partie reellement exigible
- `AG` signale un enfant d'agent porte par le backend, sans confondre cette qualification avec une exoneration particuliere
- `AB`, `TR` et `DC` sortent des obligations et du recouvrement futurs a partir de leur date effective

### Actions visibles

- changer les filtres
- changer le mois analyse
- faire defiler horizontalement le registre
- ouvrir le detail financier d'un eleve
- basculer vers historique ou arrieres d'un eleve
- ouvrir la lecture des qualifications financieres de l'eleve depuis le detail si elle est exposee

### Exports

- PDF
- Excel
- impression

### Acteurs autorises

- `ADMINISTRATEUR_ECOLE`
- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `TITULAIRE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Contraintes de perimetre

- `TITULAIRE` : sa classe titulaire uniquement
- `PREFET_ETUDES` : classes du secondaire de son ecole
- `DIRECTEUR_PRIMAIRE` : classes du primaire de son ecole
- `DIRECTEUR_MATERNELLE` : classes de la maternelle de son ecole
- `CAISSIER`, `ADMINISTRATEUR_ECOLE` : classes de leur ecole
- `GESTIONNAIRE_ORGANISATION`, `PROMOTEUR_ORGANISATION` : ecoles de leur organisation

Regle critique :

- le registre raisonne sur les eleves reellement redevables par colonne
- jamais sur l'effectif brut de la classe
- `FN` et `PC` peuvent etre redevables sur certaines colonnes et non redevables sur d'autres
- `AB`, `TR` et `DC` ne doivent plus alimenter les calculs futurs a partir de leur date effective

### Sources backend

- `PF-06`
- `PF-15`
- `PF-AG`
- [09-workflows-financiers.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/09-workflows-financiers.md)
- [VF-01 — REGISTRE FINANCIER DE CLASSE Spécification fonctionnelle officielle (Ve…](C:\Users\MON PC\.codex\attachments\0e2d52e3-30a0-4d86-9a84-cc85b5c06fbb\pasted-text.txt)

### Relations avec les contrats d'ecran

- [SCR-PF-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L484)
- [SCR-PF-014](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L1156)

## MF-02

### Identifiant

- `MF-02`

### Nom

- `VF-02 Situation financiere synthetique par classe`

### Objectif metier

Suivre l'evolution financiere complete d'une classe sans quitter la logique metier de `VF-01`.

### Version Desktop

La version desktop doit etre une vue de synthese de classe centree sur le temps :

1. bandeau contexte
2. filtres de lecture
3. tableau principal mensuel
4. acces direct au registre detaille `VF-01`

Cette vue reste une synthese tabulaire de gestion.

Elle ne doit pas devenir un dashboard decoratif.

### Version Mobile

La version mobile doit empiler :

1. resume de contexte
2. choix du mois ou vue annuelle
3. liste des mois
4. ouverture du detail mensuel

### Filtres

- organisation
- ecole
- annee scolaire
- section
- classe
- type de frais
- situation actuelle

### Zone de donnees

- tableau principal :
  - une ligne = un mois
- lecture mensuelle de la classe
- acces au registre detaille

### Statistiques

- `Effectif total`
- `Redevables`
- `En ordre`
- `Non en ordre`
- `Montant attendu`
- `Montant recouvre`
- `Reste a recouvrer`
- `Taux de recouvrement`

Toujours lues par colonne ou groupe utile, jamais seulement en total global.

Tableau principal obligatoire :

- une ligne = un mois
- colonnes :
  - `Mois`
  - `Effectif total`
  - `Redevables`
  - `En ordre`
  - `Non en ordre`
  - `Montant attendu`
  - `Montant recouvre`
  - `Reste a recouvrer`
  - `Taux de recouvrement`

### Actions visibles

- filtrer
- changer le mois ou la vue annuelle
- ouvrir le registre detaille de la classe
- ouvrir `VF-01`

### Exports

- PDF
- Excel
- impression

### Acteurs autorises

- `ADMINISTRATEUR_ECOLE`
- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `TITULAIRE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Contraintes de perimetre

- identiques a `MF-01`

Avec la meme doctrine de lecture :

- eleves reellement redevables seulement
- `FN` et `PC` seulement sur les frais ou ils restent redevables
- `AB`, `TR`, `DC` exclus des calculs futurs a partir de leur date effective

### Sources backend

- `PF-06`
- `PF-13`
- `PF-15`
- [VF-01 — REGISTRE FINANCIER DE CLASSE Spécification fonctionnelle officielle (Ve…](C:\Users\MON PC\.codex\attachments\0e2d52e3-30a0-4d86-9a84-cc85b5c06fbb\pasted-text.txt)

### Relations avec les contrats d'ecran

- [SCR-PF-006](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L484)
- [SCR-PF-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L660)
- [SCR-PF-011](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L910)
- [SCR-PF-014](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L1156)

## MF-03

### Identifiant

- `MF-03`

### Nom

- `VF-03 Situation financiere synthetique par section`

### Objectif metier

Comparer toutes les classes d'une section dans la meme logique metier que `VF-01`.

### Version Desktop

La version desktop doit se presenter comme un tableau de comparaison des classes d'une section.

Structure recommandee :

1. contexte section
2. filtres
3. tableau compare des classes
4. total general de section en fin de tableau

Tableau principal obligatoire :

- une ligne = une classe
- colonnes :
  - `Classe`
  - `Effectif total`
  - `Redevables`
  - `En ordre`
  - `Non en ordre`
  - `Montant attendu`
  - `Montant recouvre`
  - `Reste`
  - `Taux`

Fin obligatoire :

- `TOTAL GENERAL SECTION`

La vue doit rester comparative et tabulaire.

Elle ne doit pas devenir un mur de cartes ni un dashboard graphique.

### Version Mobile

La version mobile doit basculer en liste de classes.

Chaque carte classe doit afficher :

- nom de la classe
- reste a recouvrer
- eleves non en ordre
- taux de recouvrement

### Filtres

- organisation
- ecole
- annee scolaire
- section
- mois
- type de frais
- situation actuelle

### Zone de donnees

- tableau de classes
- acces rapide au registre detaille d'une classe

### Statistiques

- total attendu section
- total recouvre section
- reste section
- nombre de classes en retard
- nombre total d'eleves non en ordre
- taux moyen de recouvrement

Ces statistiques doivent servir a prioriser les classes.

Elles ne doivent pas masquer le detail ouvrable de chaque classe.

### Actions visibles

- filtrer
- trier les classes
- ouvrir une classe
- ouvrir `VF-02`
- ouvrir `VF-01`

### Exports

- PDF
- Excel
- impression

### Acteurs autorises

- `ADMINISTRATEUR_ECOLE`
- `CAISSIER`
- `PREFET_ETUDES`
- `DIRECTEUR_PRIMAIRE`
- `DIRECTEUR_MATERNELLE`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Contraintes de perimetre

- `PREFET_ETUDES` : section secondaire uniquement
- `DIRECTEUR_PRIMAIRE` : section primaire uniquement
- `DIRECTEUR_MATERNELLE` : section maternelle uniquement
- lecteurs ecole : meme ecole
- lecteurs organisationnels : meme organisation

Regles de lecture :

- les comparaisons restent bornees a la section reelle
- les calculs conservent la logique des eleves reellement redevables
- `FN`, `PC`, `AB`, `TR`, `DC` suivent la meme doctrine que `MF-01`

### Sources backend

- `PF-11`
- `PF-13`
- `PF-15`

### Relations avec les contrats d'ecran

- [SCR-PF-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L660)
- [SCR-PF-011](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L910)
- [SCR-PF-014](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L1156)

Navigation obligatoire :

- `VF-02`
- `VF-01`

## MF-04

### Identifiant

- `MF-04`

### Nom

- `VF-04 Situation financiere synthetique ecole`

### Objectif metier

Comparer les sections d'une ecole dans la meme logique metier que `VF-01`.

### Version Desktop

La version desktop doit etre une vue de synthese ecole par sections :

1. contexte ecole
2. filtres
3. bandeau de synthese compacte
4. tableau principal par section
5. total general ecole en fin de tableau

Tableau principal obligatoire :

- une ligne = une section
- colonnes :
  - `Section`
  - `Effectif total`
  - `Redevables`
  - `En ordre`
  - `Non en ordre`
  - `Montant attendu`
  - `Montant recouvre`
  - `Reste`
  - `Taux`

Fin obligatoire :

- `TOTAL GENERAL ECOLE`

Le coeur de l'ecran doit rester tabulaire et numerique.

La synthese ecole ne doit pas se transformer en dashboard marketing.

### Version Mobile

La version mobile doit montrer :

1. synthese ecole
2. cartes de sections
3. entree rapide vers la section puis la classe

### Filtres

- organisation
- ecole
- annee scolaire
- mois
- type de frais
- situation actuelle

### Zone de donnees

- synthese globale ecole
- tableau par section
- points d'entree vers classes detaillees

### Statistiques

- total attendu ecole
- total recouvre ecole
- reste a recouvrer ecole
- eleves en ordre
- eleves non en ordre
- taux de recouvrement ecole

Ces chiffres doivent rester des points d'entree vers les sections et classes, pas des fins en soi.

### Actions visibles

- filtrer
- ouvrir une section
- ouvrir une classe
- ouvrir `VF-03`
- ouvrir `VF-02`
- ouvrir `VF-01`

### Exports

- PDF
- Excel
- impression

### Acteurs autorises

- `ADMINISTRATEUR_ECOLE`
- `CAISSIER`
- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Contraintes de perimetre

- lecteurs ecole : meme ecole
- lecteurs organisationnels : ecoles de leur organisation

Regles de lecture :

- consolidation par ecole sans sortir du perimetre autorise
- detail ouvrable par section puis par classe
- logique redevables / statuts heritee de `MF-01`

### Sources backend

- `PF-04`
- `PF-11`
- `PF-12`
- `PF-13`

### Relations avec les contrats d'ecran

- [SCR-PF-004](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L316)
- [SCR-PF-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L660)
- [SCR-PF-011](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L910)
- [SCR-PF-012](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L992)

Navigation obligatoire :

- `VF-03`
- `VF-02`
- `VF-01`

## MF-05

### Identifiant

- `MF-05`

### Nom

- `VF-05 Situation financiere synthetique d'une organisation`

### Objectif metier

Comparer les ecoles d'une organisation dans la meme logique metier que `VF-01`.

### Version Desktop

La version desktop doit etre une vue de synthese organisationnelle par ecole :

1. contexte organisation
2. filtres
3. tableau principal des ecoles
4. total general organisation en fin de tableau

Tableau principal obligatoire :

- une ligne = une ecole
- colonnes :
  - `Ecole`
  - `Effectif total`
  - `Redevables`
  - `En ordre`
  - `Non en ordre`
  - `Montant attendu`
  - `Montant recouvre`
  - `Reste`
  - `Taux`

Fin obligatoire :

- `TOTAL GENERAL ORGANISATION`

Cette vue doit rester analytique et tabulaire, sans graphiques decoratifs imposes.

### Version Mobile

La version mobile doit fonctionner comme une liste d'ecoles comparees :

1. contexte organisation
2. filtres
3. cartes ou lignes d'ecoles
4. descente vers ecole, section, classe

### Filtres

- organisation
- annee scolaire
- type de frais
- mois
- situation actuelle

### Zone de donnees

- tableau des ecoles
- vue consolidee organisationnelle
- descente progressive vers ecole, section, classe, eleve

### Statistiques

- effectif total
- redevables
- en ordre
- non en ordre
- montant attendu
- montant recouvre
- reste a recouvrer
- taux de recouvrement

Ces statistiques restent lues pour l'organisation dans le bon perimetre seulement, avec filtrage possible par type de frais et par mois.

### Actions visibles

- filtrer
- ouvrir une ecole
- ouvrir une section
- ouvrir une classe
- ouvrir le registre detaille

### Exports

- PDF
- Excel
- impression

### Acteurs autorises

- `GESTIONNAIRE_ORGANISATION`
- `PROMOTEUR_ORGANISATION`

### Contraintes de perimetre

- organisation uniquement

Regles de lecture :

- la lecture reste bornee aux ecoles de l'organisation
- les calculs conservent la logique des eleves reellement redevables

### Sources backend

- `PF-13`
- `PF-15`
- `PF-11`
- `PF-12`

### Relations avec les contrats d'ecran

- [SCR-PF-008](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L660)
- [SCR-PF-014](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L1156)
- [SCR-PF-011](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L910)
- [SCR-PF-012](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/22-contrats-ecran-finances.md#L992)

Navigation obligatoire :

- `VF-04`
- `VF-03`
- `VF-02`
- `VF-01`

## Verdict

Le domaine financier dispose maintenant d'une premiere couche officielle de maquettes metier, avec `MF-01 / VF-01` comme ecran pilote de calibration ergonomique et de verite metier.

La logique de lecture retenue est claire :

- d'abord un registre de gestion dense et exploitable
- ensuite des vues de synthese par classe, section, ecole et organisation
- toujours selon la meme logique metier heritee de `VF-01`

La suite naturelle, une fois cette phase stabilisee, est :

- ouverture de `34-maquettes-pedagogiques.md`
- ouverture de `35-maquettes-scolarite.md`

## Statut De Figement

Le statut officiel retenu pour cette phase est :

- `PHASE 33 FIGEE`
