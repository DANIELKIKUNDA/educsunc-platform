# Orchestration applicative du BC Referentiel Academique

Ce document decrit les flux applicatifs majeurs sans code.

## Import du referentiel officiel

Flux :

1. Importer les sections scolaires.
2. Importer les options d'etudes.
3. Importer les classes academiques en resolvant les sections et options.
4. Importer les cours officiels.
5. Importer les programmes academiques.
6. Importer les lignes de programme.
7. Executer l'ensemble dans une transaction applicative via `OrchestrateurImportReferentiel`.

Garanties :

- Les donnees sont validees avant creation des agregats.
- Les references sont resolues par les depots.
- Les imports HTTP sont idempotents.
- Les lignes restent rattachees aux versions de referentiel, pas au root.

## Publication et activation d'une version de referentiel

Flux de publication :

1. Charger le referentiel programme.
2. Charger la version cible.
3. Verifier la tracabilite.
4. Publier la version.
5. Sauvegarder le root.
6. Journaliser l'audit.

Flux d'activation :

1. Charger le referentiel programme.
2. Activer la version cible via le root.
3. Desactiver implicitement les autres versions actives du meme referentiel.
4. Sauvegarder.
5. Journaliser l'audit.

## Cycle SaaS d'une annee scolaire

Cas ecole neuve :

1. `GarantirAnneeScolaireActiveParEcole` constate l'absence d'annee.
2. Le service `ServiceCycleAnneeScolaireRdc` propose une annee courante.
3. Une annee est creee puis activee.
4. L'ecole dispose immediatement d'une annee active.

Cas ecole avec annee active sans suivante :

1. `PreparerAnneeScolaireSuivante` lit l'annee active.
2. Le service de cycle propose l'annee suivante.
3. Une annee planifiee est creee si elle n'existe pas.
4. L'annee active courante n'est pas modifiee.

Cas ecole avec active et suivante planifiee :

1. `BasculerAnneeScolaire` verrouille l'annee active.
2. L'annee active est cloturee.
3. L'annee suivante planifiee est activee.
4. La transaction evite l'etat intermediaire sans annee active.

## Creation d'une classe pedagogique

Flux :

1. Charger l'ecole.
2. Verifier que l'ecole est active.
3. Charger l'annee scolaire.
4. Verifier que l'annee appartient a l'ecole et qu'elle est active.
5. Charger la classe academique.
6. Verifier que la classe academique est active.
7. Verifier l'unicite du code dans le contexte ecole/annee.
8. Creer la classe pedagogique.
9. Sauvegarder et journaliser.

## Initialisation et validation d'un programme niveau

Initialisation :

1. Charger l'ecole, l'annee scolaire et la classe academique.
2. Charger le referentiel programme.
3. Verifier que le referentiel correspond a la classe.
4. Charger la version officielle cible.
5. Creer un programme local brouillon.
6. Initialiser les lignes locales depuis la version officielle.
7. Sauvegarder et auditer.

Validation :

1. Charger le programme niveau.
2. Charger le referentiel programme associe.
3. Verifier l'absence d'autre programme valide pour ecole/annee/classe.
4. Verifier la coherence locale.
5. Valider le programme.
6. Produire l'etat local.
7. Sauvegarder et auditer.

## Calendrier academique

Creation :

1. Charger l'ecole.
2. Charger l'annee scolaire.
3. Verifier le rattachement annee/ecole.
4. Construire les periodes.
5. Verifier l'unicite du calendrier.
6. Verifier la coherence temporelle.
7. Sauvegarder et auditer.

Modification :

1. Charger le calendrier.
2. Retrouver la periode cible.
3. Remplacer la periode.
4. Verifier que le calendrier n'est pas verrouille.
5. Sauvegarder et auditer.

Verrouillage :

1. Charger le calendrier.
2. Verifier la coherence temporelle.
3. Verrouiller le calendrier.
4. Sauvegarder et auditer.

## Migration de referentiel

Analyse :

1. Charger le programme niveau.
2. Charger les versions de referentiel.
3. Comparer les versions.
4. Construire les lignes de diff.
5. Sauvegarder le rapport de migration.
6. Auditer l'analyse.

Application :

1. Charger la migration.
2. Charger le programme niveau.
3. Appliquer les transformations de notes si necessaire.
4. Migrer le programme vers la nouvelle version.
5. Sauvegarder dans une transaction.
6. Auditer l'application.

Annulation :

1. Charger la migration.
2. Verifier que l'annulation est possible.
3. Annuler la migration.
4. Sauvegarder et auditer.

## Execution tenant et idempotence HTTP

- Les routes locales resolvent le tenant depuis `x-tenant-id` ou une cle autorisee comme `idEcole`.
- Les lectures organisationnelles exigent `x-lecture-organisation: true` et un identifiant organisationnel.
- Le contexte tenant est propage aux depots PostgreSQL.
- Les commandes critiques lisent `Idempotency-Key` ou `x-idempotency-key`.
- Une meme cle rejouee avec la meme empreinte retourne le resultat memorise.
- Une meme cle rejouee avec une empreinte differente est refusee.
