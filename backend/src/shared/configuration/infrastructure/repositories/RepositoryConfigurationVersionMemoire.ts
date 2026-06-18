import {
  ConfigurationId,
  ConfigurationVersion,
  PortRepositoryConfigurationVersion,
} from '../../domain';
import { StockageVersionsConfigurationMemoire } from '../persistence';

// Ce fichier declare le repository memoire des versions.

/** Cette classe represente l implementation memoire du repository des versions. */
export class RepositoryConfigurationVersionMemoire implements PortRepositoryConfigurationVersion {
  constructor(private readonly stockage = new StockageVersionsConfigurationMemoire()) {}

  /** Cette methode persiste une version dans le stockage local. */
  public async sauvegarder(version: ConfigurationVersion): Promise<void> {
    this.stockage.ajouter(ConfigurationId.creer(version.details().configurationId), {
      version,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode liste les versions d une configuration. */
  public async listerParConfiguration(
    identifiant: ConfigurationId,
  ): Promise<readonly ConfigurationVersion[]> {
    return this.stockage
      .listerParConfiguration(identifiant)
      .map((enregistrement) => enregistrement.version);
  }

  /** Cette methode expose le stockage technique sous-jacent. */
  public stockageMemoire(): StockageVersionsConfigurationMemoire {
    return this.stockage;
  }
}
