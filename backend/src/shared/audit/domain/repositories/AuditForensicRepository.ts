import type { AuditForensicTrace } from './AuditRepositoryTypes';

// Ce repository fournit les lectures orientees investigation et forensic.
export interface AuditForensicRepository {
  listerEvenementsCritiques(filtres: Record<string, unknown>): Promise<AuditForensicTrace[]>;
  suivreUtilisateur(idUtilisateur: string): Promise<AuditForensicTrace[]>;
  suivreAppareil(deviceId: string): Promise<AuditForensicTrace[]>;
  suivreAdresseIp(adresseIp: string): Promise<AuditForensicTrace[]>;
  suivreWorkflow(correlationId: string): Promise<AuditForensicTrace[]>;
  suivreRequest?(requestId: string): Promise<AuditForensicTrace[]>;
  suivreExports?(filtres: { organisationId?: string; ecoleId?: string }): Promise<AuditForensicTrace[]>;
  suivreSynchronisations?(filtres: { organisationId?: string; ecoleId?: string }): Promise<AuditForensicTrace[]>;
}
