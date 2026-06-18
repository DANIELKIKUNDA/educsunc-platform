import { EntreeChronologieNotification, GranulariteChronologie } from '../../domain';
import { StockageChronologieNotification } from './StockageChronologieNotification';
import { LigneChronologieTechniqueNotification } from './TypesChronologieNotification';

// Ce fichier projette la chronology domaine vers une vue technique stable et lisible.

/** Cette classe construit et relit une projection technique de chronology. */
export class ProjectionChronologieNotification {
  /** Ce constructeur relie la projection au stockage de chronology. */
  constructor(private readonly stockageChronologieNotification: StockageChronologieNotification) {}

  /** Cette methode projette une suite d'entrees append-only dans le stockage technique. */
  public async projeter(
    identifiantNotification: string,
    entrees: readonly EntreeChronologieNotification[],
    granularite: GranulariteChronologie = 'FORENSIC',
  ): Promise<void> {
    for (const entree of entrees) {
      await this.stockageChronologieNotification.ajouterEntree(
        identifiantNotification,
        entree,
        granularite,
        true,
      );
    }
  }

  /** Cette methode relit la projection technique d'une notification. */
  public async lire(identifiantNotification: string): Promise<LigneChronologieTechniqueNotification[]> {
    return this.stockageChronologieNotification.lireProjection(identifiantNotification);
  }
}
