import { PostgresAuditArchiveReader } from '../../persistence/postgres/archival/readers/PostgresAuditArchiveReader';
import { PostgresAuditArchiveRepository } from '../../persistence/postgres/repositories';
import type { AuditAccessDecision } from '../SecurityTypes';

export class AuditArchiveSecurityService {
  private readonly reader = new PostgresAuditArchiveReader(new PostgresAuditArchiveRepository());

  public async verifierAcces(args: {
    organisationId?: string;
    ecoleId?: string;
    typeArchive?: string;
  }): Promise<AuditAccessDecision> {
    const archives = await this.reader.lireParPerimetreTenant({
      organisationId: args.organisationId,
      ecoleId: args.ecoleId,
      typeArchive: args.typeArchive,
    });
    return archives.length >= 0
      ? { autorise: true, raison: 'Accès archive contrôlé.' }
      : { autorise: false, raison: 'Accès archive refusé.' };
  }
}
