import { EnregistrementNotificationMemoire } from '../persistence';
import { EntreeReplayNotification } from '../replay';
import { SnapshotCycleVieStockageNotifications } from './TypesStockageNotifications';
import { StockageActifNotifications } from './StockageActifNotifications';
import { StockageArchiveNotifications } from './StockageArchiveNotifications';
import { StockageForensicNotifications } from './StockageForensicNotifications';
import { StockageReplayNotifications } from './StockageReplayNotifications';

// Ce fichier coordonne le cycle de vie de stockage du moteur Notifications.

/** Cette classe gere la transition active -> archive et la consolidation technique associee. */
export class GestionCycleVieStockageNotifications {
  /** Ce constructeur assemble les differents niveaux de stockage du moteur. */
  constructor(
    private readonly stockageActifNotifications: StockageActifNotifications,
    private readonly stockageArchiveNotifications: StockageArchiveNotifications,
    private readonly stockageForensicNotifications: StockageForensicNotifications,
    private readonly stockageReplayNotifications: StockageReplayNotifications,
  ) {}

  /** Cette methode enregistre un snapshot dans le stockage actif. */
  public enregistrerActif(enregistrement: EnregistrementNotificationMemoire): void {
    this.stockageActifNotifications.enregistrer(enregistrement);
  }

  /** Cette methode archive un snapshot actif et conserve les vues techniques associees. */
  public archiver(
    enregistrement: EnregistrementNotificationMemoire,
    chronologyCount: number,
    historiquesReplay: readonly EntreeReplayNotification[] = [],
    raisonArchivage?: string,
  ): void {
    this.stockageActifNotifications.retirer(enregistrement.identifiant);
    this.stockageArchiveNotifications.archiver(enregistrement, raisonArchivage);
    this.stockageForensicNotifications.enregistrer(enregistrement, chronologyCount, historiquesReplay);
    this.stockageReplayNotifications.enregistrer(enregistrement.identifiant, historiquesReplay);
  }

  /** Cette methode retourne un snapshot global du cycle de vie de stockage. */
  public observer(): SnapshotCycleVieStockageNotifications {
    return {
      totalActives: this.stockageActifNotifications.listerTous().length,
      totalArchivees: this.stockageArchiveNotifications.listerToutes().length,
      totalForensic: this.stockageForensicNotifications.listerTous().length,
      totalReplay: this.stockageReplayNotifications.listerTous().length,
      collecteLe: new Date(),
    };
  }
}
