import { ActionAuditScolarite, AuditPort } from '../../application/ports/AuditPort';

// Ce fichier implemente le port d'audit applicatif.
export class AuditAdapter implements AuditPort {
  constructor(private readonly journaliser: (action: ActionAuditScolarite) => Promise<void>) {}

  /** Journalise une action critique de scolarite. */
  public async journaliserAction(action: ActionAuditScolarite): Promise<void> {
    await this.journaliser(action);
  }
}
