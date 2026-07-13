import {
  ConfigurationId,
  ConfigurationSnapshot,
  PortRepositoryConfigurationSnapshot,
} from '../../domain';
import { StockageSnapshotsConfigurationMemoire } from '../persistence';

// Ce fichier declare le repository memoire des snapshots.

/** Cette classe represente l implementation memoire du repository des snapshots. */
export class RepositoryConfigurationSnapshotMemoire implements PortRepositoryConfigurationSnapshot {
  constructor(private readonly stockage = new StockageSnapshotsConfigurationMemoire()) {}

  /** Cette methode persiste un snapshot dans le stockage local. */
  public async sauvegarder(snapshot: ConfigurationSnapshot): Promise<void> {
    const details = snapshot.details();
    this.stockage.ajouter(ConfigurationId.creer(details.configurationId), {
      snapshot,
      configurationId: details.configurationId,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode liste les snapshots d une configuration. */
  public async listerParConfiguration(
    identifiant: ConfigurationId,
  ): Promise<readonly ConfigurationSnapshot[]> {
    return this.stockage
      .listerParConfiguration(identifiant)
      .map((enregistrement) => enregistrement.snapshot);
  }

  /** Cette methode expose le stockage technique sous-jacent. */
  public stockageMemoire(): StockageSnapshotsConfigurationMemoire {
    return this.stockage;
  }
}
