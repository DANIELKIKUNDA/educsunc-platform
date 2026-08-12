import { createHash } from 'node:crypto';
import type { AuditCanonicalWritePort } from '../../application/ports/outbound';
import { AuditCanonicalWriteService } from '../../application/services';
import type {
  ActionAuditEnum,
  ResultatAuditEnum,
  SourceAuditEnum,
  TenantAuditScopeEnum,
  TypeActeurAuditEnum,
  TypeRessourceAuditEnum,
} from '../../domain/enums';
import { AUDIT_ACTION_MATRIX } from '../../domain/invariants';
import { MasquageDonneesSensibles } from '../../domain/value-objects';
import { AuditCanonicalEventMapper } from '../outbox';
import {
  AuditEntryPersistenceMapper,
  AuditJsonbMapper,
} from '../persistence/postgres/mappers';
import type {
  AuditCategoryRow,
  AuditEntryRow,
} from '../persistence/postgres/mappers/AuditPersistenceRecords';
import { PostgresAuditCanonicalStorage } from '../persistence/postgres/repositories';

export interface CanonicalAuditProducerInput {
  readonly action: ActionAuditEnum;
  readonly resultat: ResultatAuditEnum;
  readonly acteur: {
    readonly id?: string;
    readonly type?: TypeActeurAuditEnum;
    readonly role?: string;
  };
  readonly tenant: {
    readonly scope: TenantAuditScopeEnum;
    readonly organisationId?: string;
    readonly ecoleId?: string;
  };
  readonly ressource: {
    readonly type: TypeRessourceAuditEnum;
    readonly id?: string;
    readonly libelle?: string;
  };
  readonly contexte?: {
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly sessionId?: string;
    readonly adresseIp?: string;
    readonly userAgent?: string;
    readonly deviceId?: string;
    readonly source?: SourceAuditEnum;
  };
  readonly permissions?: readonly string[];
  readonly ancienEtat?: unknown;
  readonly nouvelEtat?: unknown;
  readonly metadata?: Record<string, unknown>;
  readonly idempotencyKey?: string;
  readonly occurredAt?: Date;
}

// Ce producteur est l'unique fabrique infrastructure pour les BC raccordes a l'outbox Audit.
export class CanonicalAuditProducer {
  private readonly redaction = new MasquageDonneesSensibles();

  public constructor(
    private readonly writer: AuditCanonicalWritePort = new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(),
      new AuditCanonicalEventMapper(),
    ),
  ) {}

  public async produire(input: CanonicalAuditProducerInput): Promise<void> {
    const definition = AUDIT_ACTION_MATRIX[input.action];
    const idempotencyKey = input.idempotencyKey?.trim() || this.creerCleIdempotence(input);
    const idAudit = `audit-${createHash('sha256').update(idempotencyKey).digest('hex').slice(0, 32)}`;
    const requestId = input.contexte?.requestId ?? `req-${createHash('sha256').update(idempotencyKey).digest('hex').slice(0, 24)}`;
    const occurredAt = input.occurredAt ?? new Date();
    const acteurType = input.acteur.type ?? (input.acteur.id ? 'UTILISATEUR' : 'SYSTEME');
    const source = input.contexte?.source ?? 'SYSTEM';
    const scopesActifs = [
      input.tenant.organisationId ? `ORGANISATION:${input.tenant.organisationId}` : undefined,
      input.tenant.ecoleId ? `ECOLE:${input.tenant.ecoleId}` : undefined,
    ].filter((scope): scope is string => Boolean(scope));
    const snapshot = definition.snapshotsAutorises
      ? AuditJsonbMapper.serialiserSnapshot(input.ancienEtat, input.nouvelEtat)
      : { ancien_etat: null, nouvel_etat: null };

    const row: AuditEntryRow = {
      id_audit_entry: idAudit,
      action: input.action,
      type_principal: definition.typeAuditPrincipal,
      gravite: definition.gravitesAutorisees[0],
      niveau: definition.niveauAudit,
      resultat: input.resultat,
      request_id: requestId,
      correlation_id: input.contexte?.correlationId ?? null,
      session_id: input.contexte?.sessionId ?? null,
      sync_id: null,
      replay_id: null,
      acteur_id: input.acteur.id ?? null,
      type_acteur: acteurType,
      role_actif: acteurType === 'UTILISATEUR' ? input.acteur.role ?? 'UTILISATEUR_AUTHENTIFIE' : null,
      type_ressource: input.ressource.type,
      id_ressource: input.ressource.id ?? null,
      libelle_ressource: input.ressource.libelle ?? input.action,
      organisation_id: input.tenant.organisationId ?? null,
      ecole_id: input.tenant.ecoleId ?? null,
      scope: input.tenant.scope,
      mode_offline: false,
      statut_synchronisation: null,
      retry_count: 0,
      est_replay: false,
      est_retry: false,
      adresse_ip: input.contexte?.adresseIp ?? null,
      user_agent: input.contexte?.userAgent ?? null,
      device_id: input.contexte?.deviceId ?? null,
      source_audit: source,
      source_runtime: source,
      version_application: null,
      date_action: occurredAt.toISOString(),
      date_creation_audit: new Date().toISOString(),
      date_synchronisation: null,
      ancien_etat: snapshot.ancien_etat,
      nouvel_etat: snapshot.nouvel_etat,
      metadata: AuditJsonbMapper.serialiser(this.redaction.nettoyer(input.metadata)),
      contexte_permissions: acteurType === 'UTILISATEUR'
        ? AuditJsonbMapper.serialiser({
          rolesActifs: [input.acteur.role ?? 'UTILISATEUR_AUTHENTIFIE'],
          permissionsActives: [...(input.permissions ?? [])],
          scopesActifs,
          sourceActeur: source,
        })
        : null,
      contexte_execution: AuditJsonbMapper.serialiser({
        modeExecution: 'SYNCHRONE',
        origineExecution: source,
        retryCount: 0,
      }),
    };
    const categories: AuditCategoryRow[] = definition.categoriesAudit.map((categorie, index) => ({
      id: index + 1,
      audit_entry_id: idAudit,
      categorie,
    }));

    await this.writer.ecrire(AuditEntryPersistenceMapper.depuisRows(row, categories), idempotencyKey);
  }

  private creerCleIdempotence(input: CanonicalAuditProducerInput): string {
    const empreinte = createHash('sha256').update(JSON.stringify({
      action: input.action,
      resultat: input.resultat,
      acteurId: input.acteur.id,
      tenant: input.tenant,
      ressource: input.ressource,
      correlationId: input.contexte?.correlationId,
      ancienEtat: input.ancienEtat,
      nouvelEtat: input.nouvelEtat,
      metadata: input.metadata,
    })).digest('hex').slice(0, 32);
    return ['PRODUCTEUR', input.action, input.tenant.scope, input.ressource.id ?? 'SANS_ID', empreinte].join(':');
  }
}
