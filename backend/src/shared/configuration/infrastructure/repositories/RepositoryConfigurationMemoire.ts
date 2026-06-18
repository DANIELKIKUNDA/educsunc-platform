import { Configuration, ConfigurationId, PortRepositoryConfiguration } from '../../domain';
import { StockageConfigurationMemoire } from '../persistence';

// Ce fichier declare le repository memoire principal.

/** Cette classe represente l implementation memoire du repository de configuration. */
export class RepositoryConfigurationMemoire implements PortRepositoryConfiguration {
  constructor(private readonly stockage = new StockageConfigurationMemoire()) {}

  /** Cette methode persiste une configuration dans le stockage local. */
  public async sauvegarder(configuration: Configuration): Promise<void> {
    this.stockage.enregistrer(ConfigurationId.creer(configuration.details().identifiant), {
      configuration,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode recherche une configuration par identifiant. */
  public async trouverParId(identifiant: ConfigurationId): Promise<Configuration | null> {
    return this.stockage.lire(identifiant)?.configuration ?? null;
  }

  /** Cette methode supprime une configuration du stockage local. */
  public async supprimer(identifiant: ConfigurationId): Promise<void> {
    this.stockage.supprimer(identifiant);
  }

  /** Cette methode expose le stockage technique sous-jacent. */
  public stockageMemoire(): StockageConfigurationMemoire {
    return this.stockage;
  }
}
