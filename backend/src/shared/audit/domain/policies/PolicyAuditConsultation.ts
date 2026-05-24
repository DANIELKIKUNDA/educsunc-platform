import { AuditConsultationUnauthorizedException } from '../exceptions';
import { TypeAudit } from '../value-objects';

// Cette policy protège la lecture des audits les plus sensibles.
export class PolicyAuditConsultation {
  public static verifier(typeAuditPrincipal: TypeAudit, consultationAutorisee: boolean): void {
    if (!consultationAutorisee && ['SECURITE', 'FINANCIER', 'CONSULTATION_SENSIBLE', 'CONFORMITE'].includes(typeAuditPrincipal.obtenirValeur())) {
      throw new AuditConsultationUnauthorizedException("La consultation de cet audit est interdite.");
    }
  }
}
