import { ConfigurationVersion } from '../../domain';

// Ce fichier declare le mapper de persistence des versions.

/** Cette classe transforme une version domaine en projection de persistence. */
export class ConfigurationVersionPersistenceMapper {
  /** Cette methode produit une projection serialisable de version. */
  public versProjection(version: ConfigurationVersion): ReturnType<ConfigurationVersion['details']> {
    return version.details();
  }
}
