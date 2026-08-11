# Audit L2 - Ecriture canonique et outbox durable

## Etat initial constate

Avant L2, `AuditEntry` portait deja les invariants de classification, de tenant et
d'immutabilite. PostgreSQL protegeait `audit_entries` et `audit_categories` contre
les mises a jour et suppressions. En revanche, le chemin d'ecriture n'etait pas
unique :

- `AuditCreationApplicationService` normalisait un DTO sans persister l'agregat ;
- le producteur financier construisait puis ecrivait directement une entree ;
- le bus partage et la file nommee `PersistentAuditJobQueue` restaient en memoire ;
- `PostgresAuditEventBus` orchestrait des consommateurs locaux sans stockage de
  message PostgreSQL ;
- `AuditTransactionManager` n'ouvrait pas de transaction ;
- aucune table d'outbox n'etait executee par le migrateur runtime.

Une validation metier pouvait donc preceder une publication non durable. Un crash
entre les deux operations pouvait perdre la livraison, et une reprise pouvait
dupliquer un traitement.

## Contrat canonique

`AuditCanonicalEvent` est le contrat serialisable officiel de L2. Sa version
initiale est `1`. Il preserve :

- `eventId`, `eventType`, `schemaVersion` et `idempotencyKey` ;
- action, classification, gravite, resultat et chronologie ;
- acteur, origine, ressource et contexte d'execution ;
- scope `PLATEFORME`, `ORGANISATION` ou `ECOLE` avec les identifiants requis ;
- `requestId` et `correlationId` ;
- metadata et snapshots deja assainis par les mappers Audit ;
- la representation necessaire pour reconstruire l'agregat avant projection.

Le contrat applicatif ne depend ni de Fastify, ni de PostgreSQL, ni de Redis.
La conversion avec les records PostgreSQL reste dans l'infrastructure.

## Point d'ecriture unique

`AuditCanonicalWriteService` valide la cle d'idempotence et produit le message
canonique. `PostgresAuditCanonicalStorage` enregistre dans la meme transaction :

1. le message `audit_outbox` ;
2. l'agregat append-only `audit_entries` et ses categories.

Le message d'outbox est insere en premier dans la transaction pour reserver la cle
d'idempotence. En cas de doublon legitime, aucune seconde entree Audit n'est creee.
Une meme cle associee a un autre `eventId` est refusee explicitement.

Le flux critique `ENREGISTRER_PAIEMENT` utilise le client transactionnel du BC
Paiements via `PaiementsAuditCanonicalWriteAdapter`. L'ecriture metier et l'ecriture
Audit partagent ainsi la meme transaction. Le raccordement exhaustif des autres
anciens producteurs reste reserve a L4.

## Cycle de vie de l'outbox

Les etats sont :

- `PENDING` : message durable en attente ;
- `PROCESSING` : message verrouille par un worker ;
- `RETRY` : publication echouee et replanifiee ;
- `PUBLISHED` : livraison confirmee ;
- `DEAD` : nombre maximal de tentatives atteint, sans suppression silencieuse.

La reclamation utilise une instruction PostgreSQL atomique avec
`FOR UPDATE SKIP LOCKED`. Un verrou `PROCESSING` perime redevient reclamable apres
le delai configure, ce qui couvre un crash du processus. Le backoff est exponentiel
et plafonne a une heure. L'erreur conservee est tronquee et les secrets usuels sont
masques.

La livraison est au moins une fois. Une panne apres la projection mais avant le
marquage `PUBLISHED` peut provoquer une nouvelle livraison ; les projections
existantes utilisent des identifiants deterministes et des upserts. Cette propriete
est volontaire : elle evite toute perte et exige des consommateurs idempotents.

## Immutabilite et tenant

Les gardes append-only existantes restent actives sur `audit_entries` et
`audit_categories`. L'identite, le payload et le tenant d'un message d'outbox ne
peuvent pas etre remplaces par le worker ; seules les colonnes de livraison evoluent.
La suppression silencieuse de l'outbox est interdite.

Le worker ne recalcule jamais le tenant depuis une requete cliente. Il relit le
scope valide et les identifiants contenus dans le message durable. Les reprises et
retries conservent donc exactement le perimetre certifie par L1.

## Observabilite

Le runtime emet des logs structures pour la prise en charge, la publication, le
retry, l'etat terminal et l'erreur du worker. Les champs de contexte utiles sont
`eventId`, `idOutbox`, tentative, `requestId` et `correlationId` lorsqu'ils existent.
Aucun mot de passe, token, cookie ou secret n'est journalise.

## Migration et retour

La migration runtime cree `audit_outbox`, ses contraintes d'unicite, ses index de
livraison et de tenant, ainsi que les gardes d'identite. Elle est forward-only et ne
supprime aucune donnee existante.

En cas de retour applicatif, il faut d'abord arreter le worker L2. La table doit etre
conservee pour ne perdre aucun message. Sa suppression n'est autorisee qu'apres
export et verification explicites, hors transaction de deploiement.

## Limites volontaires

L2 ne couvre pas la pagination avancee, les exports, la retention, l'archivage, la
preuve cryptographique, l'interface finale ni le raccordement exhaustif de chaque
ancien producteur. Ces sujets appartiennent respectivement aux etapes L3, L4 et L5.
