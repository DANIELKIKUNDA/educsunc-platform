import { PostgresAuditExportRepository } from '../../persistence/postgres/repositories';
import type { AuditExportRecord } from '../../../domain/repositories';
import type { AuditExportTrackingRecord, AuditGeneratedExport, AuditExportRequest } from '../ExportInfrastructureTypes';

const tracking = new Map<string, AuditExportTrackingRecord>();

// La traçabilité export garde qui exporte quoi, quand, sur quel tenant et depuis quel appareil.
export class AuditExportTrackingService {
  private readonly repository = new PostgresAuditExportRepository();

  public async enregistrerGeneration(request: AuditExportRequest, exportGenere: AuditGeneratedExport): Promise<void> {
    const record: AuditExportRecord = {
      idAuditExport: exportGenere.exportId,
      idAuditEntry: exportGenere.exportId,
      acteurId: request.acteurId,
      formatExport: exportGenere.format,
      nombreElements: exportGenere.nombreElements,
      dateGeneration: new Date(exportGenere.creeLe),
      dateExpiration: exportGenere.expireLe ? new Date(exportGenere.expireLe) : undefined,
      organisationId: exportGenere.organisationId,
      ecoleId: exportGenere.ecoleId,
    };
    await this.repository.enregistrerExport(record);
    tracking.set(exportGenere.exportId, {
      exportId: exportGenere.exportId,
      format: exportGenere.format,
      organisationId: exportGenere.organisationId,
      ecoleId: exportGenere.ecoleId,
      scope: exportGenere.scope,
      acteurId: exportGenere.acteurId,
      requestId: request.requestId,
      sessionId: request.sessionId,
      deviceId: request.deviceId,
      correlationId: request.correlationId,
      forensic: exportGenere.forensic,
      nombreElements: exportGenere.nombreElements,
      creeLe: exportGenere.creeLe,
      expireLe: exportGenere.expireLe,
      statut: 'GENERE',
    });
  }

  public marquerTelecharge(exportId: string): void {
    const current = tracking.get(exportId);
    if (!current) return;
    tracking.set(exportId, { ...current, telechargeLe: new Date().toISOString(), statut: 'TELECHARGE' });
  }

  public marquerExpire(exportId: string): void {
    const current = tracking.get(exportId);
    if (!current) return;
    tracking.set(exportId, { ...current, statut: 'EXPIRE' });
  }

  public marquerEchec(exportId: string): void {
    const current = tracking.get(exportId);
    if (!current) return;
    tracking.set(exportId, { ...current, statut: 'ECHEC' });
  }

  public lister(): AuditExportTrackingRecord[] {
    return [...tracking.values()];
  }
}
