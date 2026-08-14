import type { Pool } from 'pg';
import { Alerte, type FiltreMonitoring, type PortRepositoryAlerte } from '../../domain';
import type { MonitoringAlertPort } from '../../application';

type Row = { payload: Record<string, unknown> };
const hydrater = (row: Row): Alerte => {
  const p = row.payload as any;
  return new Alerte({ ...p, declencheeLe: new Date(p.declencheeLe), resolueLe: p.resolueLe ? new Date(p.resolueLe) : undefined });
};

export class RepositoryAlerteMonitoringPostgres implements PortRepositoryAlerte, MonitoringAlertPort {
  constructor(private readonly pool: Pool) {}
  async sauvegarder(alerte: Alerte): Promise<void> {
    const p = alerte.valeur();
    await this.pool.query(`INSERT INTO monitoring_alertes(identifiant,payload,statut,gravite,declenchee_le,resolue_le,updated_at)
      VALUES($1,$2::jsonb,$3,$4,$5,$6,now()) ON CONFLICT(identifiant) DO UPDATE SET payload=EXCLUDED.payload,statut=EXCLUDED.statut,gravite=EXCLUDED.gravite,resolue_le=EXCLUDED.resolue_le,updated_at=now()`,
      [p.identifiant, JSON.stringify(p), p.statut, p.gravite, p.declencheeLe, p.resolueLe ?? null]);
  }
  async rechercherParFiltre(_filtre: FiltreMonitoring): Promise<readonly Alerte[]> { return this.listerAlertes(); }
  async enregistrerAlerte(alerte: Alerte): Promise<void> { await this.sauvegarder(alerte); }
  async retrouverAlerte(id: string): Promise<Alerte | null> { const r=await this.pool.query<Row>('SELECT payload FROM monitoring_alertes WHERE identifiant=$1',[id]); return r.rows[0] ? hydrater(r.rows[0]) : null; }
  async listerAlertes(): Promise<readonly Alerte[]> { const r=await this.pool.query<Row>('SELECT payload FROM monitoring_alertes ORDER BY declenchee_le DESC LIMIT 1000'); return r.rows.map(hydrater); }
}
