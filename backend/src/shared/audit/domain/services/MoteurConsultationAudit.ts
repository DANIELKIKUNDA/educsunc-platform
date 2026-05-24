import { AuditEntry } from '../aggregates';
import { PolicyAuditConsultation } from '../policies';

// Ce moteur sécurise la lecture des audits selon leur sensibilité.
export class MoteurConsultationAudit {
  public consulter(entree: AuditEntry, consultationAutorisee: boolean): AuditEntry {
    PolicyAuditConsultation.verifier(entree.obtenirTypeAuditPrincipal(), consultationAutorisee);
    return entree;
  }
}
