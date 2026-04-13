# Value Objects du domaine Referentiel Academique

Les value objects encapsulent les valeurs metier, centralisent les validations et evitent les primitives non controlees.

## Identifiants

Tous les identifiants metier specialises heritent de `IdentifiantUnique`.

Identifiants presents :

- `OrganisationId`
- `EcoleId`
- `AnneeScolaireId`
- `SectionScolaireId`
- `OptionEtudeId`
- `ClasseAcademiqueId`
- `ClassePedagogiqueId`
- `ReferentielCoursId`
- `ReferentielProgrammeId`
- `VersionReferentielProgrammeId`
- `ProgrammeNiveauId`
- `CalendrierAcademiqueId`
- `PeriodeCalendrierId`
- `LigneReferentielProgrammeId`
- `LigneProgrammeNiveauId`
- `MigrationReferentielProgrammeId`

Regles :

- Une valeur fournie doit etre une chaine non vide.
- Une valeur generee par defaut est un UUID.
- Les identifiants restent compares par valeur.

## CodeOption

`CodeOption` encapsule le code numerique officiel d'une option d'etude.

Regles :

- La valeur doit etre numerique.
- Le code doit rester valide selon les contraintes du value object.
- `OptionEtude` utilise `CodeOption` au lieu d'une primitive brute.

## OrdreClasse

`OrdreClasse` encapsule l'ordre pedagogique d'une classe academique.

Regles :

- La valeur doit etre un entier strictement positif.
- L'unicite globale de l'ordre est une regle metier geree ailleurs.
- `ClasseAcademique` expose l'ordre sous forme value object et sous forme numerique.

## PonderationEvaluation

`PonderationEvaluation` porte les ponderations d'une ligne de programme.

Role :

- Encapsuler les maxima selon la structure d'evaluation.
- Verifier la compatibilite avec une structure trimestrielle ou semestrielle.
- Verifier la compatibilite avec la presence ou non d'un examen.

Regles :

- Les valeurs de ponderation doivent etre coherentes.
- Une ligne associee a un examen doit avoir une ponderation compatible.
- Une ligne non associee a un examen ne doit pas porter une ponderation incoherente avec ce statut.

## Enumerations

Les enums representent les etats et types fermes du domaine.

- `TypeOrganisation` : type d'organisation administrative ou institutionnelle.
- `ModeExploitation` : mode d'exploitation d'une ecole.
- `StatutAnneeScolaire` : `PLANIFIEE`, `ACTIVE`, `CLOTUREE`, `ARCHIVEE`.
- `TypeStructureEvaluation` : structure d'evaluation d'une classe, d'un calendrier ou d'une ligne de programme.
- `TypePeriodeCalendrier` : type de periode academique dans un calendrier.
- `SourceReferentiel` : source d'import ou de constitution d'une version de referentiel.
- `SourceLigneProgramme` : origine d'une ligne de programme.
- `StatutProgrammeNiveau` : statut du programme local.
- `StatutMigrationReferentiel` : statut d'une migration de referentiel programme.
- `TypeDiffReferentiel` : type de difference detectee entre deux versions de referentiel.
