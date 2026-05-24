import type { AuditExportQuery } from '../dto/queries/AuditExportQuery';
import type { AuditExportOutput } from '../dto/outputs/AuditExportOutput';

// Ce mapper applicatif convertit les contrats Audit sans embarquer la persistence.
export class AuditExportMapper {
  public static depuisExportQuery(valeur: AuditExportQuery, nombreElements = 0): AuditExportOutput {
    return {
      exportId: `export-${Date.now()}`,
      format: valeur.format,
      nombreElements,
      dateGeneration: new Date().toISOString(),
      urlTemporaire: `/exports/audit/${Date.now()}.${valeur.format.toLowerCase()}`,
    };
  }

  public static versExportOutput(valeur: AuditExportOutput): AuditExportOutput {
    return { ...valeur };
  }
}
