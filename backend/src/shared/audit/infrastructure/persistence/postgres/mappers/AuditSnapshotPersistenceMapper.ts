import { AuditSnapshot } from '../../../../domain/entities';
import { AuditSnapshotData } from '../../../../domain/value-objects';
import { AuditJsonbMapper } from './AuditJsonbMapper';

// Ce mapper specialise transforme les snapshots append-only vers JSONB et retour.
export class AuditSnapshotPersistenceMapper {
  public static versJsonb(snapshot?: AuditSnapshot): { ancien_etat: unknown; nouvel_etat: unknown } {
    if (!snapshot) {
      return { ancien_etat: null, nouvel_etat: null };
    }
    const donnees = snapshot.obtenirSnapshots();
    return {
      ancien_etat: AuditJsonbMapper.serialiser(donnees.obtenirAncienEtat()),
      nouvel_etat: AuditJsonbMapper.serialiser(donnees.obtenirNouvelEtat()),
    };
  }

  public static depuisJsonb(
    idAuditEntry: string,
    ancienEtat: unknown,
    nouvelEtat: unknown,
    dateCapture: Date,
  ): AuditSnapshot | undefined {
    const ancien = AuditJsonbMapper.nettoyerSnapshot(ancienEtat);
    const nouveau = AuditJsonbMapper.nettoyerSnapshot(nouvelEtat);
    if (!ancien && !nouveau) {
      return undefined;
    }
    return new AuditSnapshot({
      idAuditSnapshot: `${idAuditEntry}-snapshot`,
      snapshots: new AuditSnapshotData(ancien, nouveau),
      dateCapture,
    });
  }
}
