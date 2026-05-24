import type { AuditProjectionRecord } from './AuditRepositoryTypes';

// Ce repository manipule les projections techniques sans remplacer la source de verite append-only.
export interface AuditProjectionRepository {
  enregistrerProjection(projection: AuditProjectionRecord): Promise<void>;
  listerProjections(typeProjection: string, filtres?: { organisationId?: string; ecoleId?: string }): Promise<AuditProjectionRecord[]>;
  supprimerProjection(idProjection: string): Promise<void>;
}
