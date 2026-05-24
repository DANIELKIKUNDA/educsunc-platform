import type { AuditExportRequest, AuditGeneratedExport } from '../ExportInfrastructureTypes';
import { AuditExportSecurityGuard } from '../security/AuditExportSecurityGuard';
import { AuditExportExpirationService } from '../expiration/AuditExportExpirationService';
import { AuditExportTrackingService } from '../tracking/AuditExportTrackingService';
import { AuditExportStorageService } from '../storage/AuditExportStorageService';
import { AuditExportCompressionService } from '../compression/AuditExportCompressionService';
import { AuditExportBatchingService } from '../batching/AuditExportBatchingService';
import { ForensicAuditExportBuilder } from '../forensic/ForensicAuditExportBuilder';
import { JsonAuditExportGenerator } from '../json/JsonAuditExportGenerator';
import { CsvAuditExportGenerator } from '../csv/CsvAuditExportGenerator';
import { PdfAuditExportGenerator } from '../pdf/PdfAuditExportGenerator';
import { PostgresAuditEventBus } from '../../event-bus';
import type { PostgresAuditProjectionHandler } from '../../persistence/postgres/projections';

// L orchestration export coordonne sécurité, génération async, stockage, tracking et événements.
export class AuditExportOrchestrator {
  private readonly security = new AuditExportSecurityGuard();
  private readonly expiration = new AuditExportExpirationService();
  private readonly tracking = new AuditExportTrackingService();
  private readonly storage = new AuditExportStorageService();
  private readonly compression = new AuditExportCompressionService();
  private readonly batching = new AuditExportBatchingService();
  private readonly forensicBuilder = new ForensicAuditExportBuilder();
  private readonly jsonGenerator = new JsonAuditExportGenerator();
  private readonly csvGenerator = new CsvAuditExportGenerator();
  private readonly pdfGenerator = new PdfAuditExportGenerator();
  private readonly eventBus: PostgresAuditEventBus;

  public constructor(projectionHandler: PostgresAuditProjectionHandler) {
    this.eventBus = new PostgresAuditEventBus(projectionHandler);
  }

  public async generer(
    request: AuditExportRequest,
    filtres: Record<string, unknown> = {},
  ): Promise<AuditGeneratedExport> {
    if (!this.security.autoriser(request)) {
      throw new Error('Export audit non autorise.');
    }

    const expirationLe = request.expirationLe ?? this.expiration.expirationParDefaut().toISOString();
    const lignes = request.forensic
      ? await this.forensicBuilder.construire(request)
      : (await this.batching.chargerLots(filtres, 500)).flat();

    const withExpiration: AuditExportRequest = { ...request, expirationLe };
    const generated = request.format === 'PDF'
      ? await this.pdfGenerator.generer(withExpiration, lignes)
      : request.format === 'CSV'
        ? await this.csvGenerator.generer(withExpiration, lignes)
        : await this.jsonGenerator.generer(withExpiration, lignes);

    const compressed = this.compression.compresser(generated);
    const uriStockage = await this.storage.stocker(generated);
    const exportFinal: AuditGeneratedExport = {
      ...generated,
      uriStockage,
      empreinte: compressed.empreinte,
    };

    await this.tracking.enregistrerGeneration(withExpiration, exportFinal);
    await this.eventBus.orchestrator.publier('ExportGenerated', {
      eventId: exportFinal.exportId,
      requestId: request.requestId,
      correlationId: request.correlationId,
      sessionId: request.sessionId,
      organisationId: request.organisationId,
      ecoleId: request.ecoleId,
      scope: request.scope,
      dateAction: exportFinal.creeLe,
      exportId: exportFinal.exportId,
      format: exportFinal.format,
      forensic: exportFinal.forensic,
      retryCount: 0,
      replay: false,
    });

    return exportFinal;
  }

  public telecharger(exportId: string): void {
    this.tracking.marquerTelecharge(exportId);
  }

  public async expirer(exportId: string): Promise<void> {
    this.tracking.marquerExpire(exportId);
    await this.eventBus.orchestrator.publier('ExportExpired', {
      eventId: exportId,
      exportId,
      dateAction: new Date().toISOString(),
      retryCount: 0,
      replay: false,
    });
  }
}
