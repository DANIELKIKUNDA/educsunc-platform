import type {
  AuditBulletinInput,
  AuditPort,
} from 'contexts/bulletins-evaluations/application/ports/out/AuditPort';
import type { Journaliseur } from 'shared/infrastructure/logger/Logger';

// Ce fichier adapte le journaliseur shared au contrat d'audit applicatif du BC.
export class BulletinAuditAdapter implements AuditPort {
  // Ce constructeur injecte le journaliseur transverse pour tracer les actions sensibles.
  constructor(private readonly journaliseur: Journaliseur) {}

  // Cette methode ecrit une trace d'audit homogene dans les logs techniques.
  public async journaliser(input: AuditBulletinInput): Promise<void> {
    this.journaliseur.info('Trace d audit du BC Bulletins & Evaluations.', {
      action: input.action,
      idEcole: input.idEcole,
      idUtilisateur: input.idUtilisateur,
      referenceMetier: input.referenceMetier,
      details: input.details,
    });
  }
}
