# 44 - Specification Proclamation Officielle

## Objet

Ce document fixe le contrat documentaire officiel de la liste de proclamation EduSync.

Il ne reouvre ni le metier, ni les permissions, ni les workflows deja figes.

Il traduit uniquement :

- le modele reel observe dans [LISTE DE PROCLAMATION.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/bulletins_sources/LISTE%20DE%20PROCLAMATION.pdf)
- les donnees deja exposees par le backend
- le contrat documentaire necessaire pour produire un document officiel dynamique

## Sources de verite

### Sources documentaires

- [36-specification-documents-officiels.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/36-specification-documents-officiels.md)
- [LISTE DE PROCLAMATION.pdf](/C:/Users/MON%20PC/Documents/EducSyn/docs/assets/bulletins_sources/LISTE%20DE%20PROCLAMATION.pdf)

### Sources frontend metier

- [07-workflows-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/07-workflows-pedagogiques.md)
- [23-contrats-ecran-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/23-contrats-ecran-pedagogiques.md)
- [34-maquettes-pedagogiques.md](/C:/Users/MON%20PC/Documents/EducSyn/docs/frontend/34-maquettes-pedagogiques.md)

### Sources backend

- [ProclamationClasseOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput.ts)
- [LigneProclamationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/LigneProclamationOutput.ts)
- [StatistiquesProclamationOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/StatistiquesProclamationOutput.ts)
- [NonClasseOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/NonClasseOutput.ts)
- [AbandonOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/AbandonOutput.ts)
- [GenererProclamationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/GenererProclamationClasse/GenererProclamationClasseUseCase.ts)
- [ConsulterProclamationClasseUseCase.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/use-cases/ConsulterProclamationClasse/ConsulterProclamationClasseUseCase.ts)
- [PostgresProclamationClasseQuery.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/persistence/postgres/queries/PostgresProclamationClasseQuery.ts)
- [PdfProclamationService.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/infrastructure/services/PdfProclamationService.ts)
- [ReferentielAcademiquePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort.ts)
- [SectionClassePedagogiquePort.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/ports/out/SectionClassePedagogiquePort.ts)

## Verite du document source

Le PDF source de proclamation confirme une structure officielle stable.

Les libelles reels relus dans le document montrent au minimum :

- en-tete institutionnel ecole
- titre `LISTE DE PROCLAMMATION DES RESULTATS`
- libelle de periode ou semestre
- bloc `Classe`
- bloc `Section`
- bloc `Titulaire`
- tableau principal des eleves classes
- colonnes `PLACE`, `NOM ET POST-NOM`, `SEXE`, `MAXIMA`, `POINTS OBTENUS`, `POURCENTAGE`, `OBSERVATION`
- bloc statistique `Filles`, `Garcons`, `Total`, `Pourcentage`
- lignes `Inscrits`, `Abandons`, `Participants`, `Non classes`, `Reussite`, `Echec`
- bloc `NON CLASSES`
- colonnes `N°`, `NOMS, POST-NOMS ET PRENOMS`, `SEXE`, `MOTIFS`

## Positionnement architectural

Pour le bloc `NON CLASSES`, la premiere colonne doit etre comprise comme le `Numero d'ordre`.

La proclamation officielle n'est pas :

- un export CSV deguise
- un simple tableau HTML imprime
- un modele fige par classe

La proclamation officielle est :

1. une sortie metier de proclamation de classe
2. enrichie par des metadonnees documentaires
3. rendue dans un gabarit documentaire stable

## Famille documentaire officielle

La premiere famille documentaire officielle ouverte est :

- `PROCL-TPL-01` `liste-proclamation-classe`

Cette famille couvre la liste de proclamation standard de classe observee dans les sources locales.

Elle reste dynamique selon :

- ecole
- annee scolaire
- classe
- section
- type de proclamation

Elle ne doit pas etre dupliquee par classe.

## Adaptation primaire / secondaire

Le principe retenu est le suivant :

- si primaire et secondaire partagent la meme ossature documentaire, ils restent dans `PROCL-TPL-01`
- si une preuve documentaire ulterieure montre une vraie rupture de structure, une nouvelle famille `PROCL-TPL-*` pourra etre ouverte

Au stade actuel, rien ne justifie un modele par classe ou par option.

## Structure documentaire cible

## Page 1

Blocs attendus :

1. en-tete institutionnel
2. titre de proclamation
3. contexte de classe
4. tableau principal des classes
5. bloc statistique de bas de page si l'espace le permet

### 1. En-tete institutionnel

Champs cibles :

- nom ecole
- sigle ecole si disponible
- adresse ecole si disponible
- ville si disponible
- telephone si disponible
- email si disponible
- logo si disponible

### 2. Titre de proclamation

Champs cibles :

- libelle principal `Liste de proclamation des resultats`
- libelle de periode

Le libelle de periode doit etre derive de la sortie metier existante :

- `TRIMESTRE`
- `SEMESTRE`
- `EXAMEN`
- `ANNUEL`
- `PERIODE`

Le renderer ne doit pas inventer ce libelle.

Il doit accepter automatiquement toute valeur documentaire portee par le backend :

- periode intermediaire
- trimestre
- semestre
- annuel

### 3. Contexte de classe

Champs cibles :

- annee scolaire
- classe
- section
- titulaire

### 4. Tableau principal

Colonnes officielles minimales :

- place
- nom et post-nom
- sexe
- maxima
- points obtenus
- pourcentage
- observation

Remarques de rendu :

- la place doit etre issue du rang metier
- `maxima` doit venir du maximum general backend
- `points obtenus` doit venir du total obtenu backend
- `pourcentage` doit venir du pourcentage backend
- `observation` doit venir du statut et de l'observation metier, sans recalcul

### 5. Bloc statistique

Le bloc statistique doit afficher :

- inscrits
- abandons
- participants
- non classes
- reussite
- echec

Chaque ligne doit etre ventilee par :

- filles
- garcons
- total
- pourcentage

## Page 2 et suivantes

Si le tableau principal depasse la hauteur disponible :

- il doit se poursuivre sur la page suivante
- l'entete minimal du tableau doit etre repete

Ensuite le document doit afficher :

- bloc `NON CLASSES`
- tableau `numero / identite / motifs`
- eventuel bloc de cloture documentaire

## Bloc non classes

Colonnes officielles :

- numero
- noms, post-noms et prenoms
- sexe
- motifs

Les motifs doivent etre alimentes a partir de [NonClasseOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/NonClasseOutput.ts).

Les `coursManquants` et `colonnesManquantes` peuvent etre fusionnes dans le texte motive affiche, sans perdre l'information.

Le `sexe` doit venir directement du backend, sans heuristique documentaire locale.

## Gestion des abandons

Les abandons ne doivent pas etre confondus avec les non classes.

Ils sont portes par [AbandonOutput.ts](/C:/Users/MON%20PC/Documents/EducSyn/backend/src/contexts/bulletins-evaluations/application/dto/output/AbandonOutput.ts).

Le document officiel doit :

- les compter dans les statistiques si exposes par la projection
- ne pas les injecter de force dans le bloc `NON CLASSES` sans preuve documentaire

## Contrat de donnees documentaires

La sortie `ProclamationClasseOutput` reste le coeur metier.

Le backend porte maintenant un read model documentaire dedie :

- `ProclamationDocumentDataReadModel`

Avec 5 blocs :

1. `meta`
2. `identiteInstitutionnelle`
3. `contexteClasse`
4. `structure`
5. `assets`

## Ce que le backend porte deja

Le backend porte deja correctement :

- l'identite technique de la proclamation
- la liste des eleves classes
- les non classes
- les abandons
- les statistiques
- l'exposition HTTP de la proclamation
- le `read model` documentaire de proclamation
- le builder documentaire de proclamation
- le package template `PROCL-TPL-01`
- un vrai renderer PDF branche sur le package documentaire
- le logo dynamique de l'ecole si l'asset existe
- la colonne `SEXE` du bloc `NON CLASSES`

## Ce qui reste a affiner

Le socle officiel est maintenant branche.

Ce qui peut encore etre affine est d'ordre documentaire et visuel :

- calibration millimetrique de certaines zones secondaires
- ajustement fin du tableau page 2
- ajustement fin du bloc `NON CLASSES`
- neutralisation graphique plus poussee si une version encore plus stricte du fond maitre est souhaitee

## Architecture technique retenue

Le moteur proclamation PDF suit maintenant la meme discipline que le moteur bulletin :

- `ProclamationDocumentDataBuilder`
- `ProclamationTemplateResolver`
- `ProclamationAssetsResolver`
- `ProclamationTemplateLayoutRegistry`
- `ProclamationTemplatePackageInspector`
- `PdfProclamationService`

## Regles absolues

Le renderer ne doit jamais recalculer :

- rang
- maxima
- total obtenu
- pourcentage
- observation
- statistiques

Le renderer affiche uniquement ce que la couche documentaire lui fournit.

## Verdict de realisation

Le chantier proclamation officielle est maintenant reellement ouvert et branche parce que :

- le noyau metier de proclamation existe
- le contrat documentaire existe
- le builder documentaire existe
- le template `PROCL-TPL-01` est package dans le repo
- le renderer PDF produit un vrai document pagine

Le point residuel n'est plus une dette de structure, mais une question de finesse visuelle documentaire.

## Suite logique

La suite propre de ce document est :

1. affiner la calibration `PROCL-TPL-01` si necessaire
2. verifier la conformite visuelle sur plusieurs classes reelles
3. ouvrir ensuite la meme discipline documentaire pour la synthese pedagogique si souhaite

## Etat

- `44` est maintenant stabilise comme specification documentaire de proclamation
- `PHASE 44 FIGEE`
