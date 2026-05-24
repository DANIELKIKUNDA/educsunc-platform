import type { AuditGeneratedExport } from '../ExportInfrastructureTypes';

// Le streaming evite le chargement massif en memoire pour les gros exports.
export class AuditExportStreamingService {
  public diffuser(exportGenere: AuditGeneratedExport): Iterable<string> {
    return exportGenere.contenu.split('\n');
  }
}
