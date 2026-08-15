import type { Pool } from 'pg';
import {
  Alerte,
  ContexteMonitoring,
  CorrelationMonitoring,
  DiagnosticIncident,
  IncidentSysteme,
  MonitoringId,
  type FiltreMonitoring,
  type PortRepositoryIncident,
} from '../../domain';
import type { MonitoringIncidentPort } from '../../application';

type Row = { payload: Record<string, unknown> };

function hydraterIncident(row: Row): IncidentSysteme {
  const p = row.payload as any;
  const incident = new IncidentSysteme(
    MonitoringId.creer(p.identifiant),
    p.resume,
    p.niveau,
    ContexteMonitoring.creer(p.contexte),
    new CorrelationMonitoring(p.correlation),
    new Date(p.detecteLe),
  );
  for (const alerte of p.alertes ?? []) {
    incident.ajouterAlerte(new Alerte({
      ...alerte,
      declencheeLe: new Date(alerte.declencheeLe),
      resolueLe: alerte.resolueLe ? new Date(alerte.resolueLe) : undefined,
    }));
  }
  for (const diagnostic of p.diagnostics ?? []) {
    incident.ajouterDiagnostic(new DiagnosticIncident({
      ...diagnostic,
      genereLe: new Date(diagnostic.genereLe),
    }));
  }
  if (p.statut === 'MITIGATED' || p.statut === 'RESOLVED') incident.escalader();
  if (p.statut === 'RESOLVED') incident.resoudre(p.resoluLe ? new Date(p.resoluLe) : new Date());
  incident.relacherEvenements();
  return incident;
}

const hydraterDiagnostic = (row: Row): DiagnosticIncident => {
  const p = row.payload as any;
  return new DiagnosticIncident({ ...p, genereLe: new Date(p.genereLe) });
};

/** Persistance durable des incidents, diagnostics et transitions de timeline. */
export class RepositoryIncidentMonitoringPostgres implements PortRepositoryIncident, MonitoringIncidentPort {
  constructor(private readonly pool: Pool) {}

  public async sauvegarder(incident: IncidentSysteme): Promise<void> {
    const p = incident.details();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO monitoring_incidents(identifiant,payload,statut,niveau,detecte_le,resolu_le,updated_at)
         VALUES($1,$2::jsonb,$3,$4,$5,$6,now())
         ON CONFLICT(identifiant) DO UPDATE SET
           payload=EXCLUDED.payload, statut=EXCLUDED.statut, niveau=EXCLUDED.niveau,
           resolu_le=EXCLUDED.resolu_le, updated_at=now()`,
        [p.identifiant, JSON.stringify(p), p.statut, p.niveau, p.detecteLe, p.resoluLe ?? null],
      );
      await client.query(
        `INSERT INTO monitoring_incident_timeline(incident_id,statut,details)
         VALUES($1,$2,$3::jsonb)
         ON CONFLICT(incident_id,statut) DO NOTHING`,
        [p.identifiant, p.statut, JSON.stringify({ niveau: p.niveau, correlation: p.correlation })],
      );
      await client.query('COMMIT');
    } catch (erreur) {
      await client.query('ROLLBACK');
      throw erreur;
    } finally {
      client.release();
    }
  }

  public async rechercherParFiltre(_filtre: FiltreMonitoring): Promise<readonly IncidentSysteme[]> {
    return this.listerIncidents();
  }

  public async enregistrerIncident(incident: IncidentSysteme): Promise<void> { await this.sauvegarder(incident); }

  public async retrouverIncident(id: string): Promise<IncidentSysteme | null> {
    const resultat = await this.pool.query<Row>('SELECT payload FROM monitoring_incidents WHERE identifiant=$1', [id]);
    return resultat.rows[0] ? hydraterIncident(resultat.rows[0]) : null;
  }

  public async listerIncidents(): Promise<readonly IncidentSysteme[]> {
    const resultat = await this.pool.query<Row>('SELECT payload FROM monitoring_incidents ORDER BY detecte_le DESC LIMIT 1000');
    return resultat.rows.map(hydraterIncident);
  }

  public async enregistrerDiagnostic(diagnostic: DiagnosticIncident): Promise<void> {
    const p = diagnostic.valeur();
    await this.pool.query(
      'INSERT INTO monitoring_diagnostics(incident_id,payload,genere_le) VALUES($1,$2::jsonb,$3)',
      [p.incidentId, JSON.stringify(p), p.genereLe],
    );
  }

  public async listerDiagnostics(): Promise<readonly DiagnosticIncident[]> {
    const resultat = await this.pool.query<Row>('SELECT payload FROM monitoring_diagnostics ORDER BY genere_le DESC LIMIT 1000');
    return resultat.rows.map(hydraterDiagnostic);
  }
}
