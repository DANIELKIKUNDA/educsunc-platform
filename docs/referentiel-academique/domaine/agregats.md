# Agregats du BC Referentiel Academique

Ce document decrit les agregats presents dans le domaine `referentiel-academique`. Les agregats portent les invariants metier, exposent des comportements explicites et restent independants de l'infrastructure, des routes HTTP et de PostgreSQL.

## Organisation

`Organisation` represente une structure administrative ou institutionnelle qui regroupe des ecoles.

Responsabilites :

- Identifier une organisation par un identifiant, un code, un nom et un type d'organisation.
- Porter l'etat actif/inactif de l'organisation.
- Encadrer le renommage, l'activation et la desactivation.
- Conserver les informations de creation, modification et version metier.

Invariants :

- Le code, le nom et le type d'organisation sont obligatoires.
- Une organisation desactivee reste consultable.
- Les changements metier incrementent la version et mettent a jour les informations de modification.
- La suppression metier n'est pas portee par l'agregat ; elle est interdite par exception/policy dediee.

## Ecole

`Ecole` represente une ecole rattachee a une organisation.

Responsabilites :

- Porter le rattachement a une organisation.
- Identifier l'ecole par un code et un nom.
- Gerer les informations optionnelles d'affichage et de contact : sigle, adresse, telephone, email.
- Porter le mode d'exploitation.
- Encadrer le renommage, le changement de mode, l'activation, la desactivation et le rattachement organisationnel.

Invariants :

- L'organisation, le code, le nom et le mode d'exploitation sont obligatoires.
- Le mode d'exploitation doit appartenir aux valeurs supportees par le domaine.
- Les mutations metier conservent la tracabilite de modification et incrementent la version.
- Une ecole inactive ne doit pas etre utilisee pour creer certaines ressources locales, comme une classe pedagogique.

## AnneeScolaire

`AnneeScolaire` represente le cycle administratif exploitable par une ecole.

Cycle de vie :

- `PLANIFIEE`
- `ACTIVE`
- `CLOTUREE`
- `ARCHIVEE`

Responsabilites :

- Porter l'ecole, le code, le libelle, les dates de debut et de fin.
- Encadrer l'activation, la cloture et l'archivage.
- Exposer la verification d'appartenance d'une date a l'annee.
- Verifier qu'une activation ne viole pas l'unicite d'annee active.

Invariants :

- La date de debut doit etre anterieure a la date de fin.
- Seule une annee `PLANIFIEE` peut etre activee.
- Seule une annee `ACTIVE` peut etre cloturee.
- Seule une annee `CLOTUREE` peut etre archivee.
- L'unicite d'une annee active par ecole est garantie par orchestration applicative et contrainte de persistance.

## SectionScolaire

`SectionScolaire` represente une section officielle du referentiel scolaire.

Responsabilites :

- Porter un code, un libelle et un ordre d'affichage.
- Gerer l'activation, la desactivation et le renommage.
- Servir de rattachement aux classes academiques.

Invariants :

- Le code et le libelle sont obligatoires.
- L'ordre d'affichage doit etre valide.
- Une section conserve son historique de creation, modification et version.

## OptionEtude

`OptionEtude` represente une option d'etude officielle.

Responsabilites :

- Porter le code option via le value object `CodeOption`.
- Porter le libelle officiel, l'abreviation optionnelle, le type option optionnel et l'ordre d'affichage optionnel.
- Gerer l'activation, la desactivation et le renommage.

Invariants :

- Le code option doit etre valide.
- Le libelle est obligatoire.
- L'abreviation est optionnelle et sert a l'affichage.
- L'option est une donnee de reference, independante des classes pedagogiques locales.

## ClasseAcademique

`ClasseAcademique` represente une classe officielle du referentiel national.

Responsabilites :

- Porter la section scolaire, l'option eventuelle, le code, le libelle, l'ordre pedagogique, le cycle et le type de structure d'evaluation.
- Indiquer si la classe accepte des options et si l'option est obligatoire.
- Verifier la coherence option/classe.
- Gerer l'activation, la desactivation et le renommage.

Invariants :

- Une classe appartient toujours a une section.
- `OrdreClasse` remplace le niveau primitif et encapsule l'ordre pedagogique.
- Si `optionObligatoire` est vrai, une option doit etre rattachee.
- Si `accepteOptions` est faux, aucune option ne doit etre rattachee.
- Le type de structure d'evaluation doit etre coherent avec la classe.
- L'unicite globale de l'ordre est une regle metier geree ailleurs.

## ClassePedagogique

`ClassePedagogique` represente l'exploitation locale d'une classe academique dans une ecole et une annee.

Responsabilites :

- Porter l'ecole, l'annee scolaire, la classe academique, le code, le libelle, le suffixe parallele optionnel et la capacite d'accueil optionnelle.
- Gerer le renommage, l'activation, la desactivation et l'archivage.
- Verifier la coherence du suffixe parallele.
- Verifier la coherence avec une annee active.

Invariants :

- Une classe pedagogique est rattachee a une ecole, une annee scolaire et une classe academique.
- Le code et le libelle sont obligatoires.
- Le suffixe parallele, s'il existe, doit rester coherent.
- La capacite d'accueil, si elle existe, doit etre positive.
- Une classe archivee ne peut pas etre archivee une seconde fois.
- La creation exige une ecole active, une annee active et une classe academique active.

## ReferentielCours

`ReferentielCours` represente un cours officiel reutilisable dans les programmes.

Responsabilites :

- Porter le code, le libelle et l'abreviation optionnelle.
- Porter aussi les champs de classification optionnelle actuellement presents dans le backend : domaine et sous-domaine.
- Gerer le renommage, l'activation, la desactivation et la version metier.

Invariants :

- Le code et le libelle sont obligatoires.
- Le cours est independant des classes et des programmes.
- Les modifications metier versionnent l'agregat.
- Un cours desactive reste consultable par historique.

## ReferentielProgramme

`ReferentielProgramme` est la racine d'agregat des programmes officiels.

Responsabilites :

- Porter la classe academique cible et le type de structure d'evaluation.
- Contenir les versions de referentiel programme.
- Ajouter une version, retrouver une version par identifiant ou par code, exposer la version active.
- Activer une version via le root pour garantir l'unicite.
- Activer ou desactiver le referentiel.

Invariants :

- Le referentiel ne stocke pas de donnees versionnees directement.
- Les lignes de programme appartiennent aux versions.
- Une version ne peut etre ajoutee qu'une seule fois.
- Un code de version ne peut pas etre duplique dans le meme referentiel.
- Une seule version active est autorisee dans un referentiel.
- L'activation d'une version passe par le root.

## VersionReferentielProgramme

`VersionReferentielProgramme` est une entite enfant du referentiel programme.

Responsabilites :

- Porter le code version, l'annee de reference, la date de publication, le motif eventuel, la source d'import et les lignes de referentiel.
- Publier la version.
- Comparer une ancienne version.
- Produire un diff avec une autre version.
- Verifier la coherence des lignes selon le type de structure d'evaluation.

Invariants :

- Le code version et l'annee de reference sont obligatoires.
- Une version publiee devient immuable pour les mutations structurelles.
- Une version active est geree par le root `ReferentielProgramme`.
- Les lignes doivent etre compatibles avec la structure d'evaluation.
- Les lignes ne doivent pas produire d'incoherence de programme.

## ProgrammeNiveau

`ProgrammeNiveau` represente le programme officiel applique localement dans une ecole, pour une annee et une classe.

Responsabilites :

- Porter l'ecole, l'annee scolaire, la classe academique, le referentiel programme et la version de referentiel utilisee.
- Initialiser les lignes locales depuis le referentiel officiel.
- Valider le programme local.
- Archiver un programme valide.
- Migrer vers une nouvelle version.
- Produire l'etat local exploitable.

Invariants :

- Le programme niveau est rattache a une ecole, une annee, une classe, un referentiel et une version.
- Le statut suit le cycle local du programme.
- Les lignes locales doivent rester coherentes avec la structure d'evaluation.
- Un programme local valide est unique par ecole, annee et classe.
- Un programme doit etre valide avant de produire un etat local exploitable.

## CalendrierAcademique

`CalendrierAcademique` represente l'organisation des periodes academiques d'une ecole pour une annee.

Responsabilites :

- Porter l'ecole, l'annee scolaire, le type de structure d'evaluation, les dates annuelles et les periodes.
- Modifier les dates et periodes tant que le calendrier n'est pas verrouille.
- Valider la coherence du calendrier.
- Verrouiller le calendrier.

Invariants :

- La date de debut annuelle doit etre anterieure a la date de fin annuelle.
- Les periodes doivent etre coherentes avec les bornes annuelles.
- Les periodes ne doivent pas se chevaucher.
- Un calendrier verrouille ne doit plus etre modifie.
- Un seul calendrier est autorise par ecole et annee.

## MigrationReferentielProgramme

`MigrationReferentielProgramme` represente une migration d'un programme local entre deux versions de referentiel.

Responsabilites :

- Porter le programme niveau cible, l'ancienne version, la nouvelle version, les differences, les transformations de notes et le statut de migration.
- Lancer l'analyse.
- Detecter les differences.
- Convertir les notes.
- Relancer un recalcul.
- Appliquer, cloturer ou annuler la migration.

Invariants :

- Une migration cible un programme niveau et deux versions distinctes.
- Les differences et transformations sont conservees dans l'agregat.
- Une migration appliquee ne peut pas etre appliquee plusieurs fois.
- L'historique doit rester complet pour les operations critiques.
- Les transitions de statut encadrent l'analyse, l'application et l'annulation.
