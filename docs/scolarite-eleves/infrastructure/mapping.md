# Mapping du BC Scolarite Eleves

Le BC `scolarite-eleves` possede plusieurs niveaux de mapping pour separer proprement domaine, application, persistance et interfaces HTTP.

## Mappers applicatifs

Le dossier `application/mappers` convertit les agregats et entites vers les DTO de sortie applicatifs :

- `EleveMapper`
- `FamilleMapper`
- `InscriptionScolaireMapper`
- `AffectationClasseMapper`
- `ParcoursEleveMapper`
- `EvenementParcoursMapper`
- `ResponsableFamilleMapper`
- `SyntheseScolariteMapper`

Ces mappers servent de frontiere entre le coeur metier et les contrats de sortie de l'application.

## Mappers de persistance PostgreSQL

Le dossier `infrastructure/persistence/postgres/mappers` reconstruit les agregats depuis les lignes SQL et inversement :

- `ElevePersistenceMapper`
- `FamillePersistenceMapper`
- `InscriptionPersistenceMapper`
- `AffectationPersistenceMapper`
- `ParcoursPersistenceMapper`

Ils isolent le domaine des choix de colonnes, tables et formats techniques.

## Presenters HTTP

Le dossier `interfaces/http/presenters` convertit les sorties applicatives en reponses HTTP lisibles :

- `ElevePresenter`
- `FamillePresenter`
- `InscriptionScolairePresenter`
- `AffectationClassePresenter`
- `ParcoursElevePresenter`
- `SyntheseScolaritePresenter`
- `ErreurScolaritePresenter`
- `PresenterHttpScolarite`

## Adaptateurs inter-BC

Le dossier `infrastructure/adapters` branche les ports applicatifs vers des implementations concretes :

- `ReferentielAcademiqueAdapter`
- `PaiementFacturationAdapter`
- `BulletinEvaluationAdapter`
- `CommunicationAdapter`
- `AuditAdapter`
- `SynchronisationAdapter`
- `ClientHttpScolarite`

## Principe architectural

La regle generale observee dans ce BC est la suivante :

- le domaine ignore totalement SQL, HTTP et les DTO ;
- l'application parle en DTO, read models et ports ;
- l'infrastructure mappe vers PostgreSQL et les systemes externes ;
- l'interface HTTP presente des reponses propres a l'utilisateur ou au client API.
