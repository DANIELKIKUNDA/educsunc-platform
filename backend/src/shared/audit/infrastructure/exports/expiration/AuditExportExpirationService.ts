import type { AuditExportRepository } from '../../../domain/repositories';
import { PostgresAuditExportRepository } from '../../persistence/postgres/repositories';

// Les exports temporaires expirent et doivent etre nettoyés proprement.
export class AuditExportExpirationService {
  public constructor(
    private readonly repository: AuditExportRepository = new PostgresAuditExportRepository(),
  ) {}

  public expirationParDefaut(hours = 24): Date {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  public async nettoyer(reference = new Date()): Promise<number> {
    return this.repository.expirerExports(reference);
  }
}
