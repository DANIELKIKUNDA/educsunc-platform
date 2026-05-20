# Value objects du BC Scolarite Eleves

Le BC `scolarite-eleves` s'appuie sur plusieurs value objects pour exprimer des contraintes metier explicites et eviter les primitives ambigu es.

## Identifiants et types primitifs

- `IdOrganisation` : identifie l'organisation proprietaire.
- `IdEcole` : identifie l'ecole d'exploitation.
- `TypesPrimitifs` : centralise notamment `UUID`, `Instant` et `LocalDate`.
- `VersionAgregat` : represente la version logique d'un agregat.

## Statuts et cycles de vie

- `StatutEleve` : borne les etats globaux d'un eleve, comme `ACTIF`, `SUSPENDU`, `ABANDONNE`, `TRANSFERE`, `DECEDE`, `INACTIF`.
- `StatutInscription` : borne les etats d'une inscription annuelle, comme `EN_ATTENTE`, `VALIDEE`, `ANNULEE`.
- `ModeFonctionnementSysteme` : exprime un mode de fonctionnement systeme exploite par certaines regles transversales.

## Identite et provenance

- `SexeEleve` : borne les valeurs de sexe supportees par le domaine.
- `OrigineInscription` : indique l'origine administrative de l'inscription.
- `EcoleProvenance` : encapsule l'ecole de provenance de l'eleve.
- `TypeProvenanceEcole` : categorise la provenance scolaire.

## Liens familiaux et parcours

- `LienParente` : borne la relation entre un eleve et un responsable familial.
- `TypeEvenementParcours` : borne les types d'evenements utilises dans l'historique du parcours.

## Role metier

Ces value objects :

- centralisent les ensembles de valeurs autorisees ;
- simplifient la validation dans les agregats ;
- rendent les signatures metier plus lisibles ;
- reduisent les risques de confusion entre champs textuels techniquement similaires.
