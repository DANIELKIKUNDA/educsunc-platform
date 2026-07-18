import type { AuditProjectionRecord, AuditProjectionRepository } from '../../../../domain/repositories';
import { PostgresAuditDocumentStore } from './PostgresAuditDocumentStore';

// Ce repository manipule les projections secondaires sans toucher a la source de verite.
export class PostgresAuditProjectionRepository implements AuditProjectionRepository {
  public constructor(private readonly documents = new PostgresAuditDocumentStore()) {}
  public async enregistrerProjection(projection: AuditProjectionRecord): Promise<void> {
    await this.documents.enregistrer('PROJECTION', projection.idProjection, projection);
  }

  public async listerProjections(
    typeProjection: string,
    filtres?: { organisationId?: string; ecoleId?: string },
  ): Promise<AuditProjectionRecord[]> {
    return (await this.documents.lister<AuditProjectionRecord>('PROJECTION')).filter((projection) => {
      if (projection.typeProjection !== typeProjection) { return false; }
      if (filtres?.organisationId && projection.organisationId !== filtres.organisationId) { return false; }
      if (filtres?.ecoleId && projection.ecoleId !== filtres.ecoleId) { return false; }
      return true;
    });
  }

  public async supprimerProjection(idProjection: string): Promise<void> {
    await this.documents.supprimer('PROJECTION', idProjection);
  }
}
