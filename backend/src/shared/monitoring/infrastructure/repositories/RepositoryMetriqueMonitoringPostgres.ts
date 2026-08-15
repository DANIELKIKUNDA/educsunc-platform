import type { Pool } from 'pg';
import {
  CapaciteSysteme,
  MetriqueMetier,
  MetriqueTechnique,
  Saturation,
  type FiltreMonitoring,
  type PortRepositoryMetrique,
} from '../../domain';
import type { MonitoringMetricsPort } from '../../application';

type PayloadRow = { payload: Record<string, unknown> };

function hydraterCapacite(row: PayloadRow): CapaciteSysteme {
  const p = row.payload as any;
  return new CapaciteSysteme({ ...p, estimeeLe: new Date(p.estimeeLe) });
}

function hydraterSaturation(row: PayloadRow): Saturation {
  const p = row.payload as any;
  return new Saturation({ ...p, observeeLe: new Date(p.observeeLe) });
}

/**
 * Persistance PostgreSQL des snapshots operationnels de capacity/saturation.
 * Les series temporelles de metriques restent volontairement la responsabilite de Prometheus.
 */
export class RepositoryMetriqueMonitoringPostgres implements PortRepositoryMetrique, MonitoringMetricsPort {
  constructor(private readonly pool: Pool) {}

  public async sauvegarderMetriqueMetier(_metrique: MetriqueMetier): Promise<void> {
    // Intentionnel : ne pas dupliquer les series temporelles Prometheus dans PostgreSQL.
  }

  public async sauvegarderMetriqueTechnique(_metrique: MetriqueTechnique): Promise<void> {
    // Intentionnel : ne pas dupliquer les series temporelles Prometheus dans PostgreSQL.
  }

  public async rechercherParFiltre(
    _filtre: FiltreMonitoring,
  ): Promise<readonly (MetriqueMetier | MetriqueTechnique)[]> {
    return [];
  }

  public async enregistrerMetriqueMetier(metrique: MetriqueMetier): Promise<void> {
    await this.sauvegarderMetriqueMetier(metrique);
  }

  public async enregistrerMetriqueTechnique(metrique: MetriqueTechnique): Promise<void> {
    await this.sauvegarderMetriqueTechnique(metrique);
  }

  public async enregistrerCapacite(capacite: CapaciteSysteme): Promise<void> {
    const p = capacite.valeur();
    await this.pool.query(
      `INSERT INTO monitoring_capacity_snapshots(ressource,payload,niveau,estimee_le)
       VALUES($1,$2::jsonb,$3,$4)`,
      [p.ressource, JSON.stringify(p), p.niveau, p.estimeeLe],
    );
  }

  public async enregistrerSaturation(saturation: Saturation): Promise<void> {
    const p = saturation.valeur();
    await this.pool.query(
      `INSERT INTO monitoring_saturation_snapshots(ressource,payload,niveau,goulot,observee_le)
       VALUES($1,$2::jsonb,$3,$4,$5)`,
      [p.ressource, JSON.stringify(p), p.niveau, p.goulot, p.observeeLe],
    );
  }

  public async listerCapacites(): Promise<readonly CapaciteSysteme[]> {
    const resultat = await this.pool.query<PayloadRow>(
      'SELECT payload FROM monitoring_capacity_snapshots ORDER BY estimee_le DESC LIMIT 1000',
    );
    return resultat.rows.map(hydraterCapacite);
  }

  public async listerSaturations(): Promise<readonly Saturation[]> {
    const resultat = await this.pool.query<PayloadRow>(
      'SELECT payload FROM monitoring_saturation_snapshots ORDER BY observee_le DESC LIMIT 1000',
    );
    return resultat.rows.map(hydraterSaturation);
  }
}
