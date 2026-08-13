# L5 - Exports, replay, retention et integrite Audit

## Decision d'architecture

L5 complete L1 a L4 sans creer une seconde source de verite. Les evenements restent dans `audit_entries`, en append-only. Les exports et operations administratives possedent un cycle de vie mutable distinct; les lectures d'export reutilisent exclusivement `PostgresAuditReadRepository` et sa pagination keyset L3.

## Exports

Le contrat accepte `CSV`, `JSON` et `PDF`. Le tenant est derive de la session; les identifiants client ne peuvent pas remplacer ce perimetre. La creation repond `202` avec un identifiant et persiste un travail `REQUESTED`. Le worker reclame les travaux avec `FOR UPDATE SKIP LOCKED`, puis passe par `PROCESSING` et termine en `COMPLETED` ou `FAILED`.

CSV et JSON sont ecrits progressivement par lots de 500. Le CSV neutralise les cellules commencant par `=`, `+`, `-` ou `@`. Les sorties n'incluent pas les metadonnees sensibles. Le PDF est un vrai document PDF borne a 1 000 lignes; au-dela, l'utilisateur doit affiner ses filtres ou employer CSV/JSON. Le plafond CSV/JSON est 100 000 lignes par defaut.

Les fichiers sont places dans un repertoire prive, publies par renommage atomique, identifies par une cle serveur controlee et accompagnes d'un checksum SHA-256. Aucun chemin fourni par le client n'est accepte. Le telechargement verifie permission, demandeur et tenant avant d'ouvrir un flux avec `Cache-Control: private, no-store`. Les fichiers expirent apres 24 heures par defaut.

Routes:

| Methode | Route | Permission | Resultat |
|---|---|---|---|
| POST | `/api/v1/exports/audit` | `audit.export` | `202`, travail persiste |
| POST | `/api/v1/exports/forensic` | `forensic.export` | `202`, travail persiste |
| POST | `/api/v1/exports/analytics` | `audit.analytics.export` | `202`, travail persiste |
| GET | `/api/v1/exports/:id/status` | `audit.export.read` | statut tenant-aware |
| GET | `/api/v1/exports/:id/download` | `audit.export.download` | flux prive |
| DELETE | `/api/v1/exports/:id` | `audit.export.delete` | suppression controlee du fichier |

Les erreurs attendues couvrent validation (400), authentification (401), permission/scope (403), ressource absente ou inaccessible (404), conflit/idempotence (409), limitation (429) et incident interne (500), selon le gestionnaire HTTP transverse.

Les schemas OpenAPI L5 documentent les formats, limites, reponses asynchrones et erreurs des routes d'export, replay, retention et integrite, sans accepter le tenant client comme source d'autorisation.

## Replay

Le replay mutationnel du metier scolaire est interdit. La whitelist contient uniquement `PROJECTIONS` et `ANALYTICS`, qui reconstruisent les projections Audit depuis les evenements canoniques. `FORENSIC`, paiements, inscriptions et autres mutations n'ont aucun handler replayable.

Une raison de 10 a 500 caracteres est obligatoire. `DRY_RUN` est le mode par defaut et ne produit aucune projection. `EXECUTE` est borne a 1 000 evenements par appel. La cle d'idempotence couvre l'identite de demande, la cible, le mode et le tenant. Un double appel relit le resultat existant au lieu de doubler l'effet.

## Retention et archivage

Aucune duree legale n'est inventee et aucune purge physique automatique des evenements n'est activee. Les anciennes durees codees en dur ne pilotent plus le workflow officiel L5.

Une operation manuelle exige une date limite explicite et, pour l'archivage, une raison. L'archivage est logique, append-only et traite au maximum 500 appartenances par appel dans `audit_archive_memberships`. `audit_entries` n'est ni mis a jour ni supprime. La route de purge fournit uniquement un apercu (`purgeExecutee = 0`). Une future politique destructive exigera une decision metier/legale distincte.

Les fichiers d'export ont leur propre TTL et peuvent etre supprimes sans supprimer les evenements Audit.

## Integrite

Chaque nouvelle ecriture canonique recoit dans la meme transaction un sceau SHA-256 stocke dans `audit_integrity_seals`. La serialisation canonique trie recursivement les proprietes et les categories; elle ne repose pas sur l'ordre accidentel d'un objet JavaScript.

Les resultats sont `VALID`, `CORRUPTED`, `MISSING` ou `UNKNOWN`. `UNKNOWN` identifie un evenement historique anterieur au scellement L5. Une verification ne corrige jamais automatiquement l'evenement. Les routes de securite permettent une verification unitaire ou une plage bornee a 1 000 evenements, apres permission et restriction tenant.

Le hash chaining global est volontairement reporte: il creerait une contention d'ecriture et exige une doctrine de partitionnement. Le sceau par evenement, la verification periodique et le rapport d'anomalies constituent la garantie L5 retenue.

## Tables et reprise

- `audit_export_jobs`: file durable, statut, tenant, demandeur, stockage, checksum, TTL et erreur.
- `audit_replay_runs`: mode, cible whitelist, tenant, raison, idempotence et resultat.
- `audit_integrity_seals`: sceaux append-only SHA-256.
- `audit_retention_runs`: executions et apercus de retention.
- `audit_archive_memberships`: archivage logique append-only.

Un export reste `COMPLETED` seulement apres publication du fichier. Un travail `PROCESSING` interrompu depuis plus de 15 minutes redevient `REQUESTED` au demarrage du worker. Les fichiers `.part` ne sont jamais proposes au telechargement.

## Observabilite et audit des actions Audit

Les metriques exposent les demandes, succes, echecs et travaux en cours sans identifiant a forte cardinalite. Les actions sensibles L5 passent par le producteur canonique: demande/generation/telechargement d'export, replay, archivage, verification et anomalie d'integrite.

Metriques L5:

- `audit_exports_requested_total`, `audit_exports_completed_total`, `audit_exports_failed_total`, `audit_exports_in_progress`;
- `audit_export_duration_seconds`, `audit_export_size_bytes`;
- `audit_replay_requested_total`, `audit_replay_success_total`, `audit_replay_failed_total`, `audit_replay_duration_seconds`;
- `audit_retention_archived_total`, `audit_retention_deleted_total`, `audit_retention_job_duration_seconds`;
- `audit_integrity_checks_total`, `audit_integrity_failures_total`.

`audit_retention_deleted_total` reste a zero tant qu'aucune politique destructive officielle n'est activee. Aucune metrique n'utilise un export, evenement, utilisateur ou texte libre comme label.

## Limites explicites

- Stockage objet/S3: non requis pour le premier VPS; le contrat de cle privee permet une adaptation future.
- Hash chain: reporte pour eviter une implementation globale contentieuse.
- Purge physique des evenements: desactivee faute de politique officielle.
- Interface finale du Centre Audit: reportee a L6.
- Les evenements historiques sans sceau restent `UNKNOWN`; aucun faux scellement retroactif silencieux n'est applique.
