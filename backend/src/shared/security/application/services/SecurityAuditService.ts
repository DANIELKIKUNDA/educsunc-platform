import type { AuditSecurityPort } from '../ports';

// Ce service centralise l'audit applicatif des operations sensibles de SECURITY.
export class SecurityAuditService {
  constructor(private readonly auditSecurityPort: AuditSecurityPort) {}

  public async journaliser(action: string, idUtilisateur?: string, succes = true, details?: Record<string, unknown>): Promise<void> {
    await this.auditSecurityPort.journaliser({ action, idUtilisateur, succes, details });
  }
}
