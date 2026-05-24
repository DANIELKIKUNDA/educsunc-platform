import { AuditEntry } from '../aggregates';
import type { AuditSearchFilters } from './AuditRepositoryTypes';

// Ce repository principal gere l'ecriture append-only des entrees audit.
export interface AuditEntryRepository {
  ajouterAudit(entree: AuditEntry): Promise<void>;
  trouverParId(idAudit: string): Promise<AuditEntry | null>;
  trouverParCorrelationId(correlationId: string): Promise<AuditEntry[]>;
  trouverParRequestId(requestId: string): Promise<AuditEntry[]>;
  trouverParTenant(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]>;
  listerSelonFiltres?(filtres: AuditSearchFilters): Promise<AuditEntry[]>;
  existe(idAudit: string): Promise<boolean>;

  // Alias historiques conserves pour enrichir sans casser brutalement l'existant.
  ajouter?(entree: AuditEntry): Promise<void>;
  rechercherParId?(idAudit: string): Promise<AuditEntry | null>;
  rechercherParCorrelationId?(correlationId: string): Promise<AuditEntry[]>;
  rechercherParTenant?(params: { organisationId?: string; ecoleId?: string; scope?: string }): Promise<AuditEntry[]>;
}
