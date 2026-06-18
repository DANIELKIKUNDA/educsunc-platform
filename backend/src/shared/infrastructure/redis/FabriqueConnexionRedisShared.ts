import { ClientRedisShared } from './ClientRedisShared';
import { ConfigurationRedisShared } from './ConfigurationRedisShared';
import type { ConfigurationConnexionRedisShared } from './TypesRedisShared';

// Ce fichier centralise la creation du client Redis partage.

let clientRedisPartage: ClientRedisShared | null = null;

/** Cette classe fabrique et memoise le client Redis partage de l application. */
export class FabriqueConnexionRedisShared {
  /** Cette methode retourne une instance singleton du client Redis partage. */
  public static obtenirClient(
    configuration = ConfigurationRedisShared.lireDepuisEnvironnement(),
  ): ClientRedisShared {
    if (clientRedisPartage === null) {
      clientRedisPartage = new ClientRedisShared(configuration);
    }
    return clientRedisPartage;
  }

  /** Cette methode recree explicitement le client partage avec une autre configuration. */
  public static reinitialiserClient(
    configuration: ConfigurationConnexionRedisShared,
  ): ClientRedisShared {
    clientRedisPartage = new ClientRedisShared(configuration);
    return clientRedisPartage;
  }
}
