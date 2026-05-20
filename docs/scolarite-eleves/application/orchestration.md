# Orchestration applicative du BC Scolarite Eleves

L'application `scolarite-eleves` ne se limite pas a des commandes CRUD. Elle contient une orchestration explicite pour les inscriptions, le cycle de vie, les lectures consolidees, la transaction applicative, l'isolation tenant et la concurrence.

## Services applicatifs

Les services applicatifs exposes dans `application/services` couvrent les besoins transversaux suivants :

- `ServiceTransactionApplication` : encadre les executions transactionnelles.
- `ServiceApplicationPagination` : harmonise la pagination des lectures.
- `ServiceApplicationConcurrence` : centralise la verification de concurrence applicative.
- `ServiceApplicationTenant` : centralise le controle du contexte organisation/ecole.
- `ServiceApplicationIdempotence` : encadre la relecture d'operations critiques.
- `ServiceApplicationReadModel` : structure la production de read models.

## Orchestrateurs

- `OrchestrateurInscriptionEleve` : coordonne les etapes composites d'une inscription complete.
- `OrchestrateurCycleVieEleve` : coordonne les transitions majeures du cycle de vie eleve.

## Sagas

Le dossier `application/sagas` contient plusieurs sagas qui prepar ent l'integration avec les flux plus larges du systeme :

- `SagaInscriptionEleve`
- `SagaCycleVieEleve`
- `SagaNotificationScolarite`
- `SagaSynchronisationEleve`

Ces sagas servent a choregraphier des effets transversaux, sans polluer les agregats avec des preoccupations d'infrastructure ou d'integration externe.

## Ports inter-BC

L'application declare des ports vers d'autres contextes :

- `ReferentielAcademiquePort`
- `PaiementsFacturationPort`
- `BulletinsEvaluationsPort`
- `CommunicationPort`
- `AuditPort`
- `SynchronisationPort`

Ce choix maintient l'isolation du domaine tout en permettant de brancher des adaptateurs concrets cote infrastructure.

## Regles applicatives majeures

- Les ecritures critiques doivent respecter le contexte tenant.
- La concurrence optimiste est prise en charge au niveau applicatif et domaine.
- Les lectures organisationnelles sont traitees explicitement, pas implicitement.
- Les operations composites passent par transaction applicative et non par simple enchainement de controleurs.
- L'idempotence est prevue pour certaines operations critiques via les services dedies et les tests d'integration associes.
