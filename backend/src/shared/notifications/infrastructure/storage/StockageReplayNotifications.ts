import { EntreeReplayNotification } from '../replay';
import { EnregistrementStockageReplayNotification } from './TypesStockageNotifications';

// Ce fichier heberge le stockage dedie a l'historique de replay.

/** Cette classe centralise l'archivage technique des historiques de rejeu. */
export class StockageReplayNotifications {
  private readonly historiques = new Map<string, EnregistrementStockageReplayNotification>();

  /** Cette methode enregistre l'historique de replay d'une notification. */
  public enregistrer(
    identifiantNotification: string,
    historiques: readonly EntreeReplayNotification[],
  ): EnregistrementStockageReplayNotification {
    const enregistrement: EnregistrementStockageReplayNotification = {
      identifiantNotification,
      historiques: [...historiques],
      misAJourLe: new Date(),
    };
    this.historiques.set(identifiantNotification, enregistrement);
    return enregistrement;
  }

  /** Cette methode lit l'historique stocke de replay d'une notification. */
  public lire(identifiantNotification: string): EnregistrementStockageReplayNotification | null {
    return this.historiques.get(identifiantNotification) ?? null;
  }

  /** Cette methode liste tous les historiques de replay stockes. */
  public listerTous(): EnregistrementStockageReplayNotification[] {
    return [...this.historiques.values()];
  }
}
