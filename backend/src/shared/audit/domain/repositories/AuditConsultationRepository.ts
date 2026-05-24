import { AuditEntry } from '../aggregates';

// Ce repository alimente les consultations sécurisées d'audits sensibles.
export interface AuditConsultationRepository {
  consulter(idAuditEntry: string): Promise<AuditEntry | null>;
  consulterSelonPermissions(params: {
    idAuditEntry: string;
    permissionsActives: string[];
    scopesActifs: string[];
  }): Promise<AuditEntry | null>;
}
