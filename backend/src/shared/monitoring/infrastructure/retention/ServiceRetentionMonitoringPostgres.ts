import type { Pool } from 'pg';
import type { ConfigurationRetentionMonitoring } from './PolitiqueRetentionMonitoring';

export type RapportRetentionMonitoring = {
  readonly executeeLe: Date;
  readonly diagnostics: { readonly active: boolean; readonly jours: number | null; readonly supprimes: number };
  readonly traces: { readonly active: boolean; readonly jours: number | null; readonly supprimes: number };
  readonly objetsConservesSansPurge: readonly ['metrics-prometheus', 'logs-loki', 'alertes', 'incidents', 'timeline-incidents', 'capacity', 'saturation'];
};

/**
 * Purge explicite et transactionnelle des seules familles dont la politique M10
 * autorise une duree. Alertes/incidents/timeline/capacity/saturation ne sont jamais
 * supprimes par ce service. Metrics et logs appartiennent a Prometheus/Loki.
 */
export class ServiceRetentionMonitoringPostgres {
  public constructor(
    private readonly pool: Pool,
    private readonly politique: ConfigurationRetentionMonitoring,
  ) {}

  public async executer(now: Date = new Date()): Promise<RapportRetentionMonitoring> {
    const client = await this.pool.connect();
    let diagnosticsSupprimes = 0;
    let tracesSupprimees = 0;
    try {
      await client.query('BEGIN');
      if (this.politique.diagnosticsJours !== null) {
        const resultat = await client.query(
          `DELETE FROM monitoring_diagnostics
           WHERE genere_le < ($1::timestamptz - ($2::int * interval '1 day'))`,
          [now, this.politique.diagnosticsJours],
        );
        diagnosticsSupprimes = resultat.rowCount ?? 0;
      }
      if (this.politique.tracesJours !== null) {
        const resultat = await client.query(
          `DELETE FROM monitoring_traces
           WHERE capturee_le < ($1::timestamptz - ($2::int * interval '1 day'))`,
          [now, this.politique.tracesJours],
        );
        tracesSupprimees = resultat.rowCount ?? 0;
      }
      await client.query('COMMIT');
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }

    return {
      executeeLe: now,
      diagnostics: { active: this.politique.diagnosticsJours !== null, jours: this.politique.diagnosticsJours, supprimes: diagnosticsSupprimes },
      traces: { active: this.politique.tracesJours !== null, jours: this.politique.tracesJours, supprimes: tracesSupprimees },
      objetsConservesSansPurge: ['metrics-prometheus', 'logs-loki', 'alertes', 'incidents', 'timeline-incidents', 'capacity', 'saturation'],
    };
  }
}
