import { randomUUID } from 'node:crypto';
import type { PortAuditConfiguration } from '../../../application/ports';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

/** Journal durable des mutations Configuration, partageant la transaction PostgreSQL courante. */
export class AuditConfigurationPostgresPort implements PortAuditConfiguration {
  constructor(private readonly client: SqlQueryClient) {}

  public async enregistrerEvenementsConfiguration(
    configurationId: string,
    evenements: readonly object[],
  ): Promise<void> {
    for (const evenement of evenements) {
      const payload = this.normaliserPayload(evenement);
      await this.client.executer(
        `
          INSERT INTO educsyn_configuration_audit_events (
            event_id, configuration_id, event_type, payload, occurred_at
          ) VALUES ($1, $2, $3, $4::jsonb, $5)
        `,
        [
          randomUUID(),
          configurationId,
          this.extraireType(evenement, payload),
          JSON.stringify(payload),
          this.extraireDate(payload),
        ],
      );
    }
  }

  private normaliserPayload(evenement: object): Record<string, unknown> {
    const brut = JSON.parse(JSON.stringify(evenement)) as unknown;
    return brut && typeof brut === 'object' && !Array.isArray(brut)
      ? brut as Record<string, unknown>
      : { valeur: brut };
  }

  private extraireType(evenement: object, payload: Record<string, unknown>): string {
    const typePayload = payload.type;
    if (typeof typePayload === 'string' && typePayload.trim()) {
      return typePayload;
    }
    return evenement.constructor?.name || 'ConfigurationEvent';
  }

  private extraireDate(payload: Record<string, unknown>): Date {
    const candidat = Object.entries(payload).find(([key, value]) =>
      /(?:At|Le|date)$/i.test(key) && (typeof value === 'string' || value instanceof Date),
    )?.[1];
    const date = candidat ? new Date(candidat as string | Date) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
