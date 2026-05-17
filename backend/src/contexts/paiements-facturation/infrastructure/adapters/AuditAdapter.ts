import type {
  AuditFinancierInput,
  AuditPort,
} from '../../application/ports/AuditPort';

// Ce fichier adapte le port d'audit du BC Paiements vers un journaliseur concret injectable.
export class AuditAdapter implements AuditPort {
  // Ce constructeur recoit une fonction concrete afin de garder le BC decouple du systeme d'audit final.
  constructor(
    private readonly journaliseur?: (input: AuditFinancierInput) => Promise<void>,
  ) {}

  // Cette methode journalise une action financiere sensible quand un adaptateur concret est disponible.
  public async journaliserActionFinanciere(
    input: AuditFinancierInput,
  ): Promise<void> {
    await this.journaliseur?.(input);
  }
}
