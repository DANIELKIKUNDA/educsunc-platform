import { ConfigurationSnapshot } from '../../domain';

// Ce fichier declare le mapper de persistence des snapshots.

/** Cette classe transforme un snapshot domaine en projection de persistence. */
export class ConfigurationSnapshotPersistenceMapper {
  /** Cette methode produit une projection serialisable de snapshot. */
  public versProjection(snapshot: ConfigurationSnapshot): ReturnType<ConfigurationSnapshot['details']> {
    return snapshot.details();
  }
}
