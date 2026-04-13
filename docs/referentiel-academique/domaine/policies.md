# Policies du domaine Referentiel Academique

Les policies portent des regles transversales du domaine. Elles evitent de disperser les decisions metier dans les use cases ou dans l'infrastructure.

## PolicyAudit

Role :

- Verifier que les actions critiques sont tracables.
- Exiger une action, un acteur et un horodatage valides.
- Verifier qu'une liste d'actions critiques est journalisable.

## PolicyCalendrier

Role :

- Verifier la coherence temporelle obligatoire d'un calendrier.
- Verifier l'unicite d'un calendrier par ecole et annee.

## PolicyMigration

Role :

- Interdire les suppressions directes de migration.
- Verifier les transformations de notes obligatoires.
- Verifier la completude de l'historique de migration.

## PolicyMultiTenant

Role :

- Verifier l'isolation des donnees par tenant.
- Proteger les lectures et ecritures locales contre les acces inter-ecoles.

## PolicyOffline

Role :

- Encadrer les regles liees au fonctionnement offline/synchronisation.
- Eviter les conflits non controles lors de la reprise ou de la synchronisation.

## PolicyPerformance

Role :

- Centraliser les garde-fous de performance prevus pour le BC.
- Encadrer les operations potentiellement couteuses.

## PolicyProgramme

Role :

- Interdire la modification directe du programme officiel.
- Verifier qu'un referentiel programme expose une version exploitable.

## PolicyProgrammeLocal

Role :

- Verifier l'unicite d'un programme local actif/valide par contexte.
- Verifier qu'un programme est valide avant exploitation locale.

## PolicyStructure

Role :

- Interdire la modification libre de la structure scolaire.
- Verifier le respect des sections.
- Verifier le respect des niveaux ou ordres pedagogiques selon le modele en place.
