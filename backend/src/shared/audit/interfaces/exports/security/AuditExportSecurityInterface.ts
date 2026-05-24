import type { AuditExportRequestDto } from '../dto';

// Cette interface centralise les exigences de criticite publique des exports Audit.
export class AuditExportSecurityInterface {
  public static estCritique(requete: AuditExportRequestDto): boolean {
    return requete.typeExport === 'FORENSIC';
  }
}

