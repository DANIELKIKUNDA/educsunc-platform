import type { PortAuditConfiguration } from '../../../application/ports';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';
import { AuditCanonicalWriteService } from '../../../../audit/application/services';
import { AuditCanonicalEventMapper } from '../../../../audit/infrastructure/outbox';
import { PostgresAuditCanonicalStorage } from '../../../../audit/infrastructure/persistence/postgres/repositories';
import {
  CanonicalAuditProducer,
  type CanonicalAuditProducerInput,
} from '../../../../audit/infrastructure/producers';

interface ConfigurationAuditScopeRow {
  cle: string;
  scope_niveau: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
  organisation_id: string | null;
  ecole_id: string | null;
  utilisateur_id: string | null;
}

// Ce port raccorde les evenements Configuration au registre canonique dans la transaction courante.
export class AuditConfigurationPostgresPort implements PortAuditConfiguration {
  private readonly producteur: CanonicalAuditProducer;

  constructor(private readonly client: SqlQueryClient) {
    this.producteur = new CanonicalAuditProducer(new AuditCanonicalWriteService(
      new PostgresAuditCanonicalStorage(client),
      new AuditCanonicalEventMapper(),
    ));
  }

  public async enregistrerEvenementsConfiguration(
    configurationId: string,
    evenements: readonly object[],
  ): Promise<void> {
    const scope = await this.chargerScope(configurationId);
    for (const evenement of evenements) {
      const payload = this.normaliserPayload(evenement);
      const eventType = evenement.constructor?.name || 'ConfigurationEvent';
      const occurredAt = this.extraireDate(payload);
      const actorId = this.texte(payload.actorId) ?? scope.utilisateur_id ?? undefined;
      const correlationId = this.texte(payload.correlationId)
        ?? this.texte(payload.requestId)
        ?? `${configurationId}:${eventType}:${occurredAt.toISOString()}`;
      await this.producteur.produire({
        action: 'CONFIGURATION_MODIFIEE',
        resultat: 'SUCCESS',
        acteur: { id: actorId },
        tenant: this.mapperTenant(scope),
        ressource: { type: 'CONFIGURATION', id: configurationId, libelle: scope.cle },
        contexte: {
          requestId: this.texte(payload.requestId),
          correlationId,
          source: 'SYSTEM',
        },
        nouvelEtat: payload,
        metadata: { eventType, configurationKey: scope.cle },
        idempotencyKey: `CONFIGURATION:${configurationId}:${eventType}:${occurredAt.toISOString()}`,
        occurredAt,
      });
    }
  }

  private async chargerScope(configurationId: string): Promise<ConfigurationAuditScopeRow> {
    const resultat = await this.client.executer<ConfigurationAuditScopeRow>(
      `SELECT cle,scope_niveau,organisation_id,ecole_id,utilisateur_id
       FROM educsyn_configuration_entries WHERE identifiant=$1`,
      [configurationId],
    );
    const scope = resultat.lignes[0];
    if (!scope) throw new Error('La configuration a auditer est introuvable.');
    return scope;
  }

  private normaliserPayload(evenement: object): Record<string, unknown> {
    const source = typeof (evenement as { valeur?: unknown }).valeur === 'function'
      ? (evenement as { valeur(): unknown }).valeur()
      : evenement;
    const brut = JSON.parse(JSON.stringify(source)) as unknown;
    return brut && typeof brut === 'object' && !Array.isArray(brut)
      ? brut as Record<string, unknown>
      : { valeur: brut };
  }

  private extraireDate(payload: Record<string, unknown>): Date {
    const candidat = Object.entries(payload).find(([key, value]) =>
      /(?:At|Le|date)$/i.test(key) && typeof value === 'string',
    )?.[1];
    const date = candidat ? new Date(candidat as string) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private mapperTenant(scope: ConfigurationAuditScopeRow): CanonicalAuditProducerInput['tenant'] {
    if (scope.scope_niveau === 'SCHOOL' && scope.organisation_id && scope.ecole_id) {
      return { scope: 'ECOLE', organisationId: scope.organisation_id, ecoleId: scope.ecole_id };
    }
    if (scope.scope_niveau === 'ORGANIZATION' && scope.organisation_id) {
      return { scope: 'ORGANISATION', organisationId: scope.organisation_id };
    }
    return { scope: 'PLATEFORME' };
  }

  private texte(valeur: unknown): string | undefined {
    return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : undefined;
  }
}
