import { AuditException } from '../exceptions/AuditException';
import type { AuditBulletinInput, AuditPort } from '../ports/out/AuditPort';

// Ce service centralise l'audit applicatif des operations sensibles du BC.
export class ServiceAuditBulletin {
  constructor(private readonly auditPort?: AuditPort) {}

  // Cette methode journalise une action si un port d'audit est disponible.
  public async journaliser(input: AuditBulletinInput): Promise<void> {
    try {
      await this.auditPort?.journaliser(input);
    } catch {
      throw new AuditException();
    }
  }
}
